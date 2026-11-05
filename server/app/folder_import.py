"""报表文件夹自动导入。

运营每天把后台导出的表放进 WB_IMPORT_DIR 下以店铺名命名的子文件夹：

    报表/
      星年天猫旗舰店/  ← 和工作台里的店铺名一字不差
        商品-1105.xlsx
        经营-1105.xlsx
        投放-1105.csv

按表头自动判断是商品、经营还是投放表。导入成功的移到该店铺下的“已导入”，失败的移到“失败”并写一份同名的“.原因.txt”。
"""

from __future__ import annotations

import logging
import os
import shutil
import time
from datetime import datetime
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from app.errors import AppError
from app.importer import (
    AD_ALIASES,
    AD_LABELS,
    AD_REQUIRED,
    METRICS_ALIASES,
    METRICS_LABELS,
    METRICS_REQUIRED,
    import_ad_spend,
    import_metrics,
    import_products,
    read_table,
    resolve_columns,
)
from app.models import Shop
from app.overview import SHANGHAI

logger = logging.getLogger("workbench")

SUFFIXES = {".xlsx", ".xls", ".csv"}
DONE_DIR = "已导入"
FAILED_DIR = "失败"
SETTLE_SECONDS = 10
KIND_LABELS = {"products": "商品", "metrics": "经营", "ad_spend": "投放"}


def import_dir() -> Path | None:
    raw = os.environ.get("WB_IMPORT_DIR", "").strip()
    return Path(raw).expanduser() if raw else None


def detect_kind(file_name: str, content: bytes) -> str:
    frame = read_table(file_name, content)
    columns = list(frame.columns)
    for kind, aliases, required, labels in (
        ("ad_spend", AD_ALIASES, AD_REQUIRED, AD_LABELS),
        ("metrics", METRICS_ALIASES, METRICS_REQUIRED, METRICS_LABELS),
    ):
        try:
            resolve_columns(columns, None, aliases=aliases, required=required, labels=labels)
            return kind
        except AppError:
            continue
    try:
        resolve_columns(columns, None)
        return "products"
    except AppError as exc:
        raise AppError(400, "unknown_table", "看不出是商品、经营还是投放表：" + exc.message) from exc


def scan(session_factory: sessionmaker, root: Path | None = None, *, settle_seconds: int = SETTLE_SECONDS) -> dict:
    root = root or import_dir()
    if root is None:
        raise AppError(400, "import_dir_not_configured", "没有配置报表文件夹（WB_IMPORT_DIR）")
    if not root.is_dir():
        raise AppError(400, "import_dir_missing", f"报表文件夹不存在：{root}")
    results = []
    now = time.time()
    for shop_dir in sorted(p for p in root.iterdir() if p.is_dir()):
        for path in sorted(p for p in shop_dir.iterdir() if p.is_file()):
            if path.suffix.lower() not in SUFFIXES or path.name.startswith(("~$", ".")):
                continue
            if now - path.stat().st_mtime < settle_seconds:
                continue  # 可能还在写入，下次再导
            results.append(_import_one(session_factory, shop_dir.name, path))
    return {
        "path": str(root),
        "imported": sum(1 for item in results if item["ok"]),
        "failed": sum(1 for item in results if not item["ok"]),
        "files": results,
    }


def _import_one(session_factory: sessionmaker, shop_name: str, path: Path) -> dict:
    item = {"shop": shop_name, "file": path.name, "kind": None, "ok": False, "rows_ok": 0, "rows_failed": 0, "reason": None}
    try:
        content = path.read_bytes()
        with session_factory() as session:
            shop = _shop(session, shop_name)
            kind = detect_kind(path.name, content)
            item["kind"] = kind
            run = _run(session, kind, shop.id, path.name, content)
            session.commit()
        item.update(ok=True, rows_ok=run.rows_ok, rows_failed=run.rows_failed)
        _move(path, DONE_DIR)
        if run.rows_failed:
            _note(path.parent / DONE_DIR, path.name, _row_errors(run.errors))
    except AppError as exc:
        item["reason"] = exc.message
        _fail(path, exc.message)
    except Exception as exc:  # 坏文件不能拖垮整轮扫描
        logger.exception("folder import failed: %s", path)
        item["reason"] = f"读取失败：{exc}"
        _fail(path, item["reason"])
    return item


def _shop(session: Session, name: str) -> Shop:
    shops = session.scalars(select(Shop).where(Shop.name == name)).all()
    if not shops:
        raise AppError(404, "shop_not_found", f"工作台里没有叫“{name}”的店铺，请先在商品页新建，或把文件夹改成店铺名")
    if len(shops) > 1:
        raise AppError(409, "shop_ambiguous", f"有 {len(shops)} 个店铺都叫“{name}”，请先改名")
    return shops[0]


def _run(session: Session, kind: str, shop_id: int, file_name: str, content: bytes):
    if kind == "products":
        run, _stats = import_products(session, shop_id=shop_id, file_name=file_name, content=content)
    elif kind == "metrics":
        run = import_metrics(session, shop_id=shop_id, file_name=file_name, content=content)
    else:
        run, _stats = import_ad_spend(session, shop_id=shop_id, file_name=file_name, content=content)
    return run


def _stamp() -> str:
    return datetime.now(SHANGHAI).strftime("%Y%m%d-%H%M%S")


def _move(path: Path, folder: str) -> Path:
    target_dir = path.parent / folder
    target_dir.mkdir(exist_ok=True)
    target = target_dir / f"{_stamp()}-{path.name}"
    shutil.move(str(path), str(target))
    return target


def _fail(path: Path, reason: str) -> None:
    try:
        target = _move(path, FAILED_DIR)
        _note(target.parent, target.name, reason)
    except OSError:
        logger.exception("cannot move failed import: %s", path)


def _note(folder: Path, name: str, text: str) -> None:
    (folder / f"{name}.原因.txt").write_text(text + "\n", encoding="utf-8")


def _row_errors(errors: list[dict]) -> str:
    return "\n".join(f"第 {item['row']} 行：{item['reason']}" for item in errors)
