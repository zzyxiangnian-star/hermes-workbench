"""Hermes 插件入口：工作台。

- 界面在 desktop/plugin.js（Hermes 自动放进 desktop-plugins/）；
- 这里注册：workbench_backend 工具（让 Hermes 能启动 / 查看后端）、`hermes workbench` 命令、使用说明技能；
- 后端代码在 server/，由 workbench_ctl.py 管理，数据在 Hermes 数据目录下的 workbench/。
"""

from __future__ import annotations

import importlib.util
import json
import logging
from pathlib import Path

logger = logging.getLogger(__name__)
HERE = Path(__file__).resolve().parent


def _ctl():
    spec = importlib.util.spec_from_file_location("hermes_workbench_ctl", HERE / "workbench_ctl.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


TOOL_SCHEMA = {
    "name": "workbench_backend",
    "description": (
        "查看或启动本机的工作台后端（工作台插件的数据服务，http://127.0.0.1:8000）。"
        "用户说“启动工作台”“工作台连不上”“打开演示数据”时用。"
        "action=status 查看；start 用正式数据启动；demo 用假数据启动（会先停掉正在跑的正式后端）；stop 停止。"
        "第一次启动要联网装依赖，几分钟，返回 installing 时过一会儿再查 status。"
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "action": {"type": "string", "enum": ["status", "start", "demo", "stop"]},
        },
        "required": ["action"],
    },
}


def _tool(args: dict, **_kwargs) -> str:
    ctl = _ctl()
    action = (args or {}).get("action", "status")
    if action == "start":
        info = ctl.start(demo=False, wait=20)
    elif action == "demo":
        if ctl.status().get("running") and ctl.status().get("mode") != "demo":
            ctl.stop()
        info = ctl.start(demo=True, wait=20)
    elif action == "stop":
        info = ctl.stop()
    else:
        info = ctl.status()
    return json.dumps({**info, "summary": ctl.describe(info)}, ensure_ascii=False)


def _cli_setup(parser) -> None:
    parser.add_argument("action", nargs="?", default="status", choices=["status", "start", "demo", "stop", "where"])
    parser.add_argument("--wait", action="store_true", help="等到后端起来再返回")


def _cli(args) -> None:
    argv = [args.action, *(["--wait"] if getattr(args, "wait", False) else [])]
    raise SystemExit(_ctl().main(argv))


def _adopt_desktop_copy() -> None:
    """以前手动放进 desktop-plugins/hermes-workbench/ 的旧 plugin.js（没有包标记）会挡住这个包的界面：
    Hermes 把没标记的文件夹当成用户自己的插件，永远不覆盖。内容不一样就备份后移走，让 Hermes 换上包里的。"""
    try:
        ctl = _ctl()
        root = ctl.hermes_root()
        target = root / "desktop-plugins" / "hermes-workbench"
        source = HERE / "desktop" / "plugin.js"
        if (target / ".hermes-package.json").exists() or not (target / "plugin.js").exists() or not source.exists():
            return
        if ctl._sha(target / "plugin.js") == ctl._sha(source):
            return
        backup = ctl._backup_dir() / "desktop-plugins"
        backup.mkdir(parents=True, exist_ok=True)
        target.rename(backup / "hermes-workbench")
        logger.info("hermes-workbench: 旧的界面插件已移到 %s", backup)
    except Exception as exc:  # noqa: BLE001 - 不能因为这个让插件加载失败
        logger.warning("hermes-workbench: 处理旧界面插件失败：%s", exc)


def register(ctx) -> None:
    ctx.register_tool(
        name="workbench_backend",
        toolset="workbench",
        schema=TOOL_SCHEMA,
        handler=_tool,
        description="启动或查看工作台后端",
        emoji="🧰",
    )
    ctx.register_cli_command(
        name="workbench",
        help="工作台后端：status / start / demo / stop / where",
        setup_fn=_cli_setup,
        handler_fn=_cli,
    )
    for child in sorted((HERE / "skills").iterdir()):
        if (child / "SKILL.md").exists():
            ctx.register_skill(child.name, child / "SKILL.md")
    _adopt_desktop_copy()
