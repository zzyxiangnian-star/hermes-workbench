"""工作台的安装和后端管理（只用 Python 标准库）。

三种用法，做的事情一样：
- Hermes 插件：__init__.py 把它注册成 `hermes workbench …` 命令和 workbench_backend 工具；
- 交付包：双击 安装.bat，它调用 `python workbench_ctl.py install`；
- 直接运行：python workbench_ctl.py status|start|demo|stop|install|where

数据都放在 Hermes 数据目录下的 workbench\\（数据库、素材、备份、虚拟环境、设置），
和插件代码分开，所以重装或升级插件不会碰数据。
"""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import shutil
import socket
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

PLUGIN_ID = "hermes-workbench"
HERE = Path(__file__).resolve().parent
SERVER = HERE / "server"
HOST = "127.0.0.1"
PORT = int(os.environ.get("WB_PORT", "8000"))
IS_WIN = sys.platform == "win32"


# ---------- 找 Hermes 数据目录 ----------

def hermes_root_candidates() -> list[Path]:
    """可能的 Hermes 数据目录，按优先级。规则和 Hermes 自己的 get_default_hermes_root 一致：
    HERMES_HOME 优先；Windows 默认 %LOCALAPPDATA%\\hermes；其它系统 ~/.hermes。
    老版本 Windows 用过 %USERPROFILE%\\.hermes，也放进来。"""
    seen: list[Path] = []

    def add(path: Path | None) -> None:
        if path is None:
            return
        path = path.expanduser()
        if path not in seen:
            seen.append(path)

    env = os.environ.get("HERMES_HOME", "").strip()
    if env:
        home = Path(env).expanduser()
        # 指向某个 profile 时，插件目录在它的根上
        add(home.parent.parent if home.parent.name == "profiles" else home)
    suffix = os.environ.get("HERMES_DATA_DIR_SUFFIX", "")
    if IS_WIN:
        local = os.environ.get("LOCALAPPDATA", "").strip()
        add((Path(local) if local else Path.home() / "AppData" / "Local") / ("hermes" + suffix))
    add(Path.home() / (".hermes" + suffix))
    return seen


def _looks_used(root: Path) -> bool:
    return any((root / name).exists() for name in ("config.yaml", "state.db", "desktop-plugins", ".env"))


def hermes_root() -> Path:
    """Hermes 实际在用的数据目录。在 Hermes 进程里（插件）直接问 Hermes；否则取第一个用过的候选。"""
    try:
        from hermes_constants import get_default_hermes_root  # type: ignore

        return Path(get_default_hermes_root())
    except Exception:
        pass
    candidates = hermes_root_candidates()
    for root in candidates:
        if _looks_used(root):
            return root
    return candidates[0]


def work_dir() -> Path:
    path = Path(os.environ.get("WB_HOME", "").strip() or hermes_root() / "workbench")
    path.mkdir(parents=True, exist_ok=True)
    return path


# ---------- 状态 ----------

def _state_path() -> Path:
    return work_dir() / "state.json"


def _read_state() -> dict:
    try:
        return json.loads(_state_path().read_text(encoding="utf-8"))
    except Exception:
        return {}


def _write_state(**fields) -> None:
    state = {**_read_state(), **fields, "updated": dt.datetime.now().isoformat(timespec="seconds")}
    _state_path().write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def health() -> dict | None:
    try:
        with urllib.request.urlopen(f"http://{HOST}:{PORT}/api/health", timeout=2) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception:
        return None


def _port_busy() -> bool:
    with socket.socket() as sock:
        sock.settimeout(0.5)
        return sock.connect_ex((HOST, PORT)) == 0


def _pid_alive(pid: int) -> bool:
    if pid <= 0:
        return False
    if IS_WIN:
        out = subprocess.run(["tasklist", "/FI", f"PID eq {pid}", "/NH"], capture_output=True, text=True,
                             creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0)).stdout
        return str(pid) in out
    try:
        os.kill(pid, 0)
        return True
    except OSError:
        return False


def status() -> dict:
    """{running, phase, mode, version, message, address, data_dir}。phase: stopped/installing/starting/running/failed。"""
    state = _read_state()
    info = health()
    phase = state.get("phase", "stopped")
    if info:
        phase = "running"
    elif phase in ("installing", "starting") and not _pid_alive(int(state.get("pid") or 0)):
        phase = "failed" if phase == "installing" else "stopped"
    elif phase == "running":
        phase = "stopped"
    return {
        "running": bool(info),
        "phase": phase,
        "mode": state.get("mode"),
        "version": (info or {}).get("version"),
        "message": state.get("message", ""),
        "address": f"http://{HOST}:{PORT}",
        "data_dir": str(work_dir()),
        "log": str(work_dir() / "backend.log"),
    }


# ---------- 虚拟环境 ----------

def _venv_python(venv: Path) -> Path:
    return venv / ("Scripts/python.exe" if IS_WIN else "bin/python")


def _base_python() -> list[str]:
    """建虚拟环境用的 Python：要 3.11+。Hermes 自己的 Python 一定够新。"""
    if sys.version_info >= (3, 11):
        return [sys.executable]
    for cmd in (["py", "-3"], ["python3"], ["python"]):
        try:
            out = subprocess.run([*cmd, "-c", "import sys;print(sys.version_info>=(3,11))"],
                                 capture_output=True, text=True, timeout=20).stdout.strip()
            if out == "True":
                return cmd
        except Exception:
            continue
    raise RuntimeError("没找到 Python 3.11 或更新版本，请先安装：https://www.python.org/downloads/")


def _requirements() -> list[str]:
    text = (SERVER / "pyproject.toml").read_text(encoding="utf-8")
    try:
        import tomllib
    except ImportError:  # Python 3.10 没有 tomllib：只取 dependencies = [ … ] 那一段
        import re

        block = re.search(r"^dependencies\s*=\s*\[(.*?)\]", text, re.S | re.M)
        return re.findall(r'"([^"]+)"', block.group(1)) if block else []
    return list(tomllib.loads(text)["project"]["dependencies"])


def ensure_venv(log) -> Path:
    """建好 workbench\\venv 并装齐后端依赖。依赖没变就跳过（不联网）。"""
    venv = work_dir() / "venv"
    python = _venv_python(venv)
    if not python.exists():
        log("第一次运行，正在创建 Python 环境……")
        subprocess.run([*_base_python(), "-m", "venv", str(venv)], check=True, stdout=log.stream, stderr=subprocess.STDOUT)
    reqs = _requirements()
    stamp = venv / "workbench-requirements.txt"
    wanted = "\n".join(reqs)
    if not stamp.exists() or stamp.read_text(encoding="utf-8") != wanted:
        log("正在安装后端依赖（需要联网，第一次要几分钟）……")
        done = subprocess.run([str(python), "-m", "pip", "install", "--disable-pip-version-check", "-q", *reqs],
                              stdout=log.stream, stderr=subprocess.STDOUT)
        if done.returncode != 0:
            if stamp.exists():
                log("依赖更新失败（可能没联网），先用已装好的版本启动")
            else:
                raise RuntimeError(f"依赖安装失败，请检查网络后重试。详情见 {log.path}")
        else:
            stamp.write_text(wanted, encoding="utf-8")
    return python


# ---------- 启动 / 停止 ----------

def _load_settings(env: dict) -> None:
    """workbench\\settings.env 里一行一个 KEY=VALUE（# 开头是注释），代替原来的 env.bat。"""
    path = work_dir() / "settings.env"
    if not path.exists():
        path.write_text(SETTINGS_TEMPLATE, encoding="utf-8")
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip().removeprefix("set ").strip()
        if key:
            env[key] = value.strip()


def server_env(demo: bool) -> dict:
    data = work_dir() / "data"
    data.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ)
    env.pop("PYTHONPATH", None)
    env["PYTHONIOENCODING"] = "utf-8"
    env.setdefault("WB_BACKUP_DIR", str(data / "backups"))
    env.setdefault("WB_ASSET_DIR", str(data / "assets"))
    _load_settings(env)
    db = data / ("demo.db" if demo else "workbench.db")
    env["WORKBENCH_DATABASE_URL"] = "sqlite:///" + db.resolve().as_posix()
    if demo:
        env["WB_SCHEDULER"] = "off"
        env["WB_ASSET_DIR"] = str(data / "demo-assets")
    return env


class _Log:
    def __init__(self, path: Path):
        self.path = path
        self.stream = open(path, "a", encoding="utf-8", buffering=1)

    def __call__(self, message: str) -> None:
        self.stream.write(f"[{dt.datetime.now():%H:%M:%S}] {message}\n")
        _write_state(message=message)


def serve(demo: bool) -> int:
    """前台运行：装依赖 →（演示时）重建假数据 → uvicorn。start() 在后台调用它。"""
    log = _Log(work_dir() / "backend.log")
    mode = "demo" if demo else "normal"
    _write_state(phase="installing", mode=mode, pid=os.getpid())
    try:
        python = ensure_venv(log)
        env = server_env(demo)
        if demo:
            log("正在生成演示数据（假数据，不碰正式数据库）……")
            db = env["WORKBENCH_DATABASE_URL"].removeprefix("sqlite:///")
            subprocess.run([str(python), "-m", "app.demo", "--db", db], cwd=SERVER, env=env, check=True,
                           stdout=log.stream, stderr=subprocess.STDOUT)
        _write_state(phase="starting")
        log(f"正在启动{'演示' if demo else ''}后端 http://{HOST}:{PORT}")
        proc = subprocess.Popen([str(python), "-m", "uvicorn", "app.main:app", "--host", HOST, "--port", str(PORT)],
                                cwd=SERVER, env=env, stdout=log.stream, stderr=subprocess.STDOUT)
        _write_state(server_pid=proc.pid)
        for _ in range(60):
            if health() or proc.poll() is not None:
                break
            time.sleep(1)
        if health():
            _write_state(phase="running", message=f"{'演示' if demo else ''}后端已启动")
        code = proc.wait()
        _write_state(phase="stopped", message=f"后端已停止（退出码 {code}）")
        return code
    except Exception as exc:  # noqa: BLE001 - 原因要写进状态给界面看
        log(f"启动失败：{exc}")
        _write_state(phase="failed", message=f"启动失败：{exc}")
        return 1


def start(demo: bool = False, wait: float = 0) -> dict:
    """在后台起后端，马上返回。已经在跑就不动（要换模式先 stop）。"""
    current = status()
    if current["running"]:
        return {**current, "message": "后端已经在运行"}
    if current["phase"] in ("installing", "starting"):
        return current
    if _port_busy():
        return {**current, "phase": "failed", "message": f"端口 {PORT} 被别的程序占用，请先关掉它"}
    work = work_dir()
    log = open(work / "backend.log", "a", encoding="utf-8")
    kwargs: dict = {"stdout": log, "stderr": subprocess.STDOUT, "stdin": subprocess.DEVNULL, "cwd": str(work)}
    if IS_WIN:
        kwargs["creationflags"] = (subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP
                                   | subprocess.CREATE_NO_WINDOW)
    else:
        kwargs["start_new_session"] = True
    python = sys.executable
    if IS_WIN and python.lower().endswith("python.exe") and (Path(python).with_name("pythonw.exe")).exists():
        python = str(Path(python).with_name("pythonw.exe"))
    proc = subprocess.Popen([python, str(HERE / "workbench_ctl.py"), "serve", *(["--demo"] if demo else [])], **kwargs)
    _write_state(phase="installing", mode="demo" if demo else "normal", pid=proc.pid, message="正在准备")
    deadline = time.time() + wait
    shown = ""
    while time.time() < deadline and not health() and proc.poll() is None:
        message = _read_state().get("message", "")
        if message != shown:
            print(message, flush=True)
            shown = message
        time.sleep(1)
    return status()


def stop() -> dict:
    state = _read_state()
    for key in ("server_pid", "pid"):
        pid = int(state.get(key) or 0)
        if pid and _pid_alive(pid):
            if IS_WIN:
                subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], capture_output=True,
                               creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
            else:
                try:
                    os.kill(pid, 15)
                except OSError:
                    pass
    for _ in range(10):
        if not health():
            break
        time.sleep(0.5)
    _write_state(phase="stopped", message="后端已停止", pid=0, server_pid=0)
    return status()


# ---------- 安装（交付包用） ----------

def _sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _backup_dir() -> Path:
    path = work_dir() / "backup" / dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    path.mkdir(parents=True, exist_ok=True)
    return path


def install_desktop_copy(root: Path) -> Path:
    """把 desktop/plugin.js 放进 <root>/desktop-plugins/hermes-workbench/，旧的先备份。"""
    source = HERE / "desktop" / "plugin.js"
    target_dir = root / "desktop-plugins" / PLUGIN_ID
    target = target_dir / "plugin.js"
    if target.exists() and _sha(target) == _sha(source):
        return target
    if target_dir.exists():
        backup = _backup_dir() / "desktop-plugins"
        shutil.copytree(target_dir, backup / PLUGIN_ID, dirs_exist_ok=True)
        # 原生安装留下的标记：内容换了就让 Hermes 重新认
        (target_dir / ".hermes-package.json").unlink(missing_ok=True)
    target_dir.mkdir(parents=True, exist_ok=True)
    tmp = target.with_suffix(".js.tmp")
    shutil.copyfile(source, tmp)
    os.replace(tmp, target)
    if _sha(target) != _sha(source):
        raise RuntimeError(f"复制后的插件校验不一致：{target}")
    return target


def install_package(root: Path) -> Path:
    """把整个插件包（含后端代码）放到 <root>/plugins/hermes-workbench/，和 `hermes plugins install` 装的位置一样。"""
    target = root / "plugins" / PLUGIN_ID
    if target.resolve() == HERE:
        return target
    if target.exists():
        backup = _backup_dir() / "plugins"
        shutil.copytree(target, backup / PLUGIN_ID, dirs_exist_ok=True,
                        ignore=shutil.ignore_patterns("__pycache__", ".git"))
        shutil.rmtree(target)
    shutil.copytree(HERE, target, ignore=shutil.ignore_patterns("__pycache__", ".git", "安装.bat", "*.zip"))
    return target


def migrate_old_data(log) -> None:
    """0.10.0 及以前装在 D:\\工作台\\server\\data 之类的位置：正式数据库搬过来（只复制，不删原来的）。"""
    data = work_dir() / "data"
    if (data / "workbench.db").exists():
        return
    for old in (Path("D:/工作台/server/data"), Path.home() / "工作台" / "server" / "data"):
        db = old / "workbench.db"
        if db.exists():
            data.mkdir(parents=True, exist_ok=True)
            shutil.copy2(db, data / "workbench.db")
            if (old / "assets").is_dir():
                shutil.copytree(old / "assets", data / "assets", dirs_exist_ok=True)
            log(f"已把旧数据从 {old} 复制过来（原文件没动）")
            return


def _shortcut(name: str, args: str, desc: str) -> None:
    if not IS_WIN:
        return
    desktop = Path(os.environ.get("USERPROFILE", str(Path.home()))) / "Desktop"
    exe = sys.executable
    script = (
        "$s=(New-Object -ComObject WScript.Shell).CreateShortcut($env:WB_LNK);"
        "$s.TargetPath=$env:WB_EXE;$s.Arguments=$env:WB_ARGS;$s.Description=$env:WB_DESC;"
        "$s.WorkingDirectory=$env:WB_CWD;$s.Save()"
    )
    env = {**os.environ, "WB_LNK": str(desktop / f"{name}.lnk"), "WB_EXE": exe, "WB_ARGS": args,
           "WB_DESC": desc, "WB_CWD": str(work_dir())}
    subprocess.run(["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script], env=env,
                   capture_output=True, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))


def install(start_demo: bool = True) -> int:
    """交付包的“双击安装”。"""
    root = hermes_root()
    print(f"Hermes 数据目录：{root}")
    others = [p for p in hermes_root_candidates() if p != root and (p / "desktop-plugins" / PLUGIN_ID).exists()]
    package = install_package(root)
    print(f"插件包：{package}")
    target = install_desktop_copy(root)
    print(f"界面插件：{target}（SHA256 {_sha(target)[:16]}…）")
    for other in others:
        install_desktop_copy(other)
        print(f"另一个数据目录里也有旧插件，一并换新：{other}")
    ctl = package / "workbench_ctl.py"
    _shortcut("工作台后端", f'"{ctl}" start --wait --pause', "启动工作台后端（正式数据）")
    _shortcut("工作台演示", f'"{ctl}" demo --wait --pause', "用假数据启动工作台后端")
    if IS_WIN:
        print("桌面已放两个快捷方式：工作台后端、工作台演示")
    log = _Log(work_dir() / "backend.log")
    migrate_old_data(lambda m: (log(m), print(m)))
    print(f"数据目录：{work_dir()}")
    if start_demo and not health():
        print("正在准备后端（第一次要装依赖，需要联网，几分钟）……")
        subprocess.run([sys.executable, str(package / "workbench_ctl.py"), "demo", "--wait"])
    print("\n装好了。请从右下角托盘完全退出 Hermes，再重新打开，左上角点“工作台”。")
    return 0


SETTINGS_TEMPLATE = """# 工作台设置：一行一个，去掉开头的 # 生效。改完重启后端。
# 报表文件夹：子文件夹名 = 店铺名，放进去的表每 10 分钟自动导入
# WB_IMPORT_DIR=D:\\工作台报表
# WB_IMPORT_EVERY=10
# 早报时间和推送地址（地址是机密，不要发到群里）
# WB_DAILY_AT=08:30
# WB_FEISHU_WEBHOOK=
# WB_WECOM_WEBHOOK=
# 设计稿和素材位置、单个文件上限（MB）
# WB_ASSET_DIR=D:\\工作台素材
# WB_ASSET_MAX_MB=50
# 备份位置（建议另一块硬盘或网盘同步文件夹）、时间、份数
# WB_BACKUP_DIR=E:\\工作台备份
# WB_BACKUP_AT=12:30
# WB_BACKUP_KEEP=14
# 客户分层天数和报价单有效天数
# WB_NEW_CUSTOMER_DAYS=30
# WB_DORMANT_DAYS=90
# WB_INQUIRY_STALE_DAYS=7
# WB_QUOTE_VALID_DAYS=15
"""


def describe(info: dict) -> str:
    phase = {"running": "运行中", "installing": "正在准备", "starting": "正在启动", "stopped": "没在运行",
             "failed": "启动失败"}.get(info["phase"], info["phase"])
    mode = {"demo": "（演示数据）", "normal": "（正式数据）"}.get(info.get("mode") or "", "")
    lines = [f"工作台后端：{phase}{mode if info['running'] else ''}"]
    if info.get("version"):
        lines.append(f"版本 {info['version']}，地址 {info['address']}")
    if info.get("message") and not info["running"]:
        lines.append(info["message"])
    lines.append(f"数据目录 {info['data_dir']}")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    args = list(sys.argv[1:] if argv is None else argv)
    command = args[0] if args else "status"
    wait = 600.0 if "--wait" in args else 0
    if command == "serve":
        return serve("--demo" in args)
    if command == "install":
        try:
            return install(start_demo="--no-start" not in args)
        except Exception as exc:  # noqa: BLE001
            print(f"安装失败：{exc}")
            return 1
    if command == "where":
        print(f"Hermes 数据目录：{hermes_root()}\n工作台数据目录：{work_dir()}")
        return 0
    if command in ("start", "demo"):
        if command == "demo" and status()["running"] and status().get("mode") != "demo":
            stop()
        info = start(demo=command == "demo", wait=wait)
    elif command == "stop":
        info = stop()
    elif command == "status":
        info = status()
    else:
        print(__doc__)
        return 2
    print(describe(info))
    if "--pause" in args:
        input("\n按回车关闭这个窗口（后端会继续在后台运行）")
    return 0 if info["phase"] != "failed" else 1


if __name__ == "__main__":
    sys.exit(main())
