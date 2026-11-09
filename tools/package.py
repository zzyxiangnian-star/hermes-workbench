"""打交付包：python tools/package.py

先在 plugin/ 里 `node build.mjs` 打好插件，再运行这个脚本（会顺手更新 desktop/plugin.js）。
只收仓库里登记过的文件（git ls-files），所以 env.bat、数据库、.venv、素材都不会被带进去。
输出 dist/工作台-<版本>-<日期>.zip。解压后就是一个完整的 Hermes 插件包，双击 安装.bat 即可：

    工作台/
      安装.bat           ← 双击安装 / 升级
      说明.md            ← docs/交付说明.md
      版本.txt
      plugin.yaml  __init__.py  workbench_ctl.py  dashboard/  skills/
      desktop/plugin.js  ← 界面
      server/            ← 后端
      bots/              ← 四个助手 Bot 的配方
"""

from __future__ import annotations

import datetime as dt
import hashlib
import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLUGIN_JS = ROOT / "plugin" / "dist" / "hermes-workbench" / "plugin.js"
TOP = "工作台"
# server 下不交付的：测试和开发用的东西
SKIP = re.compile(r"^server/(tests/|samples/build_samples\.py$|\.pytest_cache/)|/__pycache__/")


def version() -> str:
    text = (ROOT / "server" / "app" / "__init__.py").read_text(encoding="utf-8")
    match = re.search(r'__version__ = "([^"]+)"', text)
    if not match:
        sys.exit("server/app/__init__.py 里没有 __version__")
    return match.group(1)


def tracked(prefix: str) -> list[str]:
    out = subprocess.run(["git", "ls-files", "-z", prefix], cwd=ROOT, capture_output=True, check=True).stdout
    return [name for name in out.decode("utf-8").split("\0") if name and not SKIP.search(name)]


def crlf(data: bytes) -> bytes:
    return data.replace(b"\r\n", b"\n").replace(b"\n", b"\r\n")


def main() -> None:
    if not PLUGIN_JS.exists():
        sys.exit(f"没找到插件包 {PLUGIN_JS}，先在 plugin/ 里运行 node build.mjs")
    ver = version()
    commit = subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    dirty = subprocess.run(["git", "status", "--porcelain", "server", "bots", "docs/交付说明.md"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    if dirty:
        print("提醒：server、bots 或交付说明有没提交的改动，包里用的是工作区里的文件。")
    today = dt.date.today().strftime("%Y%m%d")
    out = ROOT / "dist" / f"{TOP}-{ver}-{today}.zip"
    out.parent.mkdir(exist_ok=True)
    plugin = PLUGIN_JS.read_bytes()
    desktop = ROOT / "desktop" / "plugin.js"
    if not desktop.exists() or desktop.read_bytes() != plugin:
        shutil.copyfile(PLUGIN_JS, desktop)
        print("已更新 desktop/plugin.js，记得提交")
    info = (
        f"工作台 {ver}\r\n打包日期 {today}\r\n代码版本 {commit}\r\n"
        f"plugin.js {len(plugin)} 字节，SHA256 {hashlib.sha256(plugin).hexdigest()}\r\n"
    )
    count = 0
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr(f"{TOP}/说明.md", (ROOT / "docs" / "交付说明.md").read_bytes())
        archive.writestr(f"{TOP}/版本.txt", info.encode("utf-8"))
        archive.writestr(f"{TOP}/安装.bat", crlf((ROOT / "tools" / "安装.bat").read_bytes()))
        archive.writestr(f"{TOP}/desktop/plugin.js", plugin)
        package = ["plugin.yaml", "__init__.py", "workbench_ctl.py", "dashboard", "skills"]
        names = [n for item in package for n in tracked(item)]
        for name in names + tracked("server") + tracked("bots") + tracked("docs/CONTRACT-mcp.md"):
            data = (ROOT / name).read_bytes()
            if name.endswith((".bat", ".cmd")):
                data = crlf(data)
            archive.writestr(f"{TOP}/{name}", data)
            count += 1
    print(f"已生成 {out.relative_to(ROOT)}（{count + 4} 个文件，{out.stat().st_size // 1024} KB）")
    print(info.replace("\r\n", "\n").strip())


if __name__ == "__main__":
    main()
