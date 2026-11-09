"""给工作台界面用的两个接口：看后端状态、启动后端。挂在 /api/plugins/hermes-workbench/ 下，只在本机 Hermes 里。"""

from __future__ import annotations

import importlib.util
from pathlib import Path

from fastapi import APIRouter

router = APIRouter()
_CTL = None


def _ctl():
    global _CTL
    if _CTL is None:
        path = Path(__file__).resolve().parent.parent / "workbench_ctl.py"
        spec = importlib.util.spec_from_file_location("hermes_workbench_ctl", path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        _CTL = module
    return _CTL


@router.get("/backend")
def backend_status() -> dict:
    return _ctl().status()


@router.post("/backend/start")
def backend_start(body: dict | None = None) -> dict:
    demo = bool((body or {}).get("demo"))
    return _ctl().start(demo=demo)
