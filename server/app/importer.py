"""报表导入。列名识别集中在 FIELD_ALIASES，以后加平台列只改这一处。"""

from __future__ import annotations

import io
import json
import re
from decimal import Decimal, InvalidOperation
from typing import Any

import pandas as pd
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.errors import AppError
from app.models import ImportRun, Product, Shop, utcnow
from app.rules import run_enabled_rules

# 报表列名 → 字段。匹配前会去掉空白并转成小写。
FIELD_ALIASES: dict[str, tuple[str, ...]] = {
    "sku": ("sku", "商品编码", "商品sku", "商家编码", "sku编码", "规格编码", "商家sku"),
    "product_code": ("货号", "商品货号", "款号", "product_code", "货品编码"),
    "title": ("标题", "商品标题", "商品名称", "名称", "title", "宝贝标题"),
    "price": ("价格", "售价", "销售价", "price", "一口价", "京东价"),
    "floor_price": ("底价", "最低价", "floor_price", "最低售价"),
    "stock": ("库存", "可售库存", "stock", "库存数量", "现货库存"),
    "activity": ("活动", "活动名称", "报名活动", "activity", "当前活动"),
}

REQUIRED_FIELDS = ("sku", "title", "price", "stock")
FIELD_LABELS = {
    "sku": "商品编码",
    "title": "标题",
    "price": "售价",
    "stock": "库存",
    "product_code": "货号",
    "floor_price": "底价",
    "activity": "活动",
}


def norm_header(value: object) -> str:
    return re.sub(r"\s+", "", str(value)).strip().lower()


def import_products(
    session: Session,
    *,
    shop_id: int,
    file_name: str,
    content: bytes,
    mapping: dict[str, str] | None = None,
) -> tuple[ImportRun, dict[str, int]]:
    shop = session.get(Shop, shop_id)
    if shop is None:
        raise AppError(404, "shop_not_found", "店铺不存在")
    frame = read_table(file_name, content)
    columns = resolve_columns(list(frame.columns), mapping)
    errors: list[dict[str, Any]] = []
    rows_ok = 0
    for offset, record in enumerate(frame.to_dict(orient="records")):
        if _row_blank(record):
            continue
        row_number = offset + 2
        try:
            values = _parse_row(record, columns)
        except ValueError as exc:
            errors.append({"row": row_number, "reason": str(exc)})
            continue
        _upsert_product(session, shop_id, values)
        rows_ok += 1
    session.flush()
    run = ImportRun(
        file_name=file_name or "upload",
        shop_id=shop_id,
        rows_ok=rows_ok,
        rows_failed=len(errors),
        errors=errors,
        created_at=utcnow(),
    )
    session.add(run)
    session.flush()
    stats = run_enabled_rules(session)
    return run, stats


def read_table(file_name: str, content: bytes) -> pd.DataFrame:
    suffix = _suffix(file_name)
    if suffix == ".csv":
        frame = _read_csv(content)
    elif suffix == ".xlsx":
        try:
            frame = pd.read_excel(io.BytesIO(content), dtype=str, engine="openpyxl")
        except Exception as exc:
            raise AppError(400, "unreadable_file", "无法读取表格文件") from exc
    else:
        raise AppError(400, "unsupported_file", "只支持 xlsx 或 csv 文件")
    if frame.empty and len(frame.columns) == 0:
        raise AppError(400, "empty_table", "表格没有表头")
    headers = [norm_header(column) for column in frame.columns]
    if any(header in {"", "nan", "none"} for header in headers):
        raise AppError(400, "bad_header", "表头有空列")
    if len(headers) != len(set(headers)):
        raise AppError(400, "bad_header", "表头有重复列")
    return frame


def resolve_columns(columns: list[object], mapping: dict[str, str] | None) -> dict[str, str]:
    by_norm = {norm_header(column): str(column) for column in columns}
    assigned: dict[str, str] = {}
    used: set[str] = set()
    if mapping:
        if not isinstance(mapping, dict):
            raise AppError(400, "invalid_mapping", "mapping 必须是 JSON 对象")
        for raw_name, field in mapping.items():
            if field not in FIELD_ALIASES:
                raise AppError(400, "invalid_mapping", f"mapping 里的字段「{field}」不能识别")
            key = norm_header(raw_name)
            column = by_norm.get(key)
            if column is None:
                raise AppError(400, "invalid_mapping", f"列「{raw_name}」不在表头里")
            if field in assigned and assigned[field] != column:
                raise AppError(400, "invalid_mapping", f"字段「{FIELD_LABELS[field]}」对应了多列")
            if column in used and assigned.get(field) != column:
                raise AppError(400, "invalid_mapping", f"列「{column}」对应了多个字段")
            assigned[field] = column
            used.add(column)
    for field, aliases in FIELD_ALIASES.items():
        if field in assigned:
            continue
        for alias in aliases:
            column = by_norm.get(norm_header(alias))
            if column and column not in used:
                assigned[field] = column
                used.add(column)
                break
    missing = [FIELD_LABELS[field] for field in REQUIRED_FIELDS if field not in assigned]
    if missing:
        names = "、".join(missing)
        raise AppError(400, "column_unrecognized", f"无法识别{names}列，请传入 mapping")
    return assigned


def parse_mapping(raw: str | None) -> dict[str, str] | None:
    if raw is None or not str(raw).strip():
        return None
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise AppError(400, "invalid_mapping", "mapping 不是合法的 JSON") from exc
    if not isinstance(parsed, dict):
        raise AppError(400, "invalid_mapping", "mapping 必须是 JSON 对象")
    return {str(key): str(value) for key, value in parsed.items()}


def _read_csv(content: bytes) -> pd.DataFrame:
    last_error: Exception | None = None
    for encoding in ("utf-8-sig", "utf-8", "gb18030"):
        try:
            text = content.decode(encoding)
        except UnicodeDecodeError as exc:
            last_error = exc
            continue
        try:
            return pd.read_csv(io.StringIO(text), dtype=str)
        except Exception as exc:
            raise AppError(400, "unreadable_file", "无法读取表格文件") from exc
    raise AppError(400, "bad_encoding", "无法识别文件编码，请使用 UTF-8 或 GB18030") from last_error


def _parse_row(record: dict, columns: dict[str, str]) -> dict[str, Any]:
    sku = _text(_cell(record, columns.get("sku")))
    if not sku:
        raise ValueError("缺少商品编码")
    if len(sku) > 128:
        raise ValueError("商品编码过长")
    title = _text(_cell(record, columns.get("title")))
    if not title:
        raise ValueError("标题为空")
    if len(title) > 500:
        raise ValueError("标题过长")
    price = _parse_price(_cell(record, columns.get("price")), "售价")
    stock = _parse_stock(_cell(record, columns.get("stock")))
    product_code = _optional_text(_cell(record, columns.get("product_code")), 128, "货号")
    floor_raw = _cell(record, columns.get("floor_price"))
    floor_price = None if _is_blank(floor_raw) else _parse_price(floor_raw, "底价")
    activity = _optional_text(_cell(record, columns.get("activity")), 200, "活动")
    return {
        "sku": sku,
        "product_code": product_code,
        "title": title,
        "price": price,
        "floor_price": floor_price,
        "stock": stock,
        "activity": activity,
    }


def _upsert_product(session: Session, shop_id: int, values: dict[str, Any]) -> None:
    product = session.scalar(select(Product).where(Product.shop_id == shop_id, Product.sku == values["sku"]))
    if product is None:
        product = Product(shop_id=shop_id, sku=values["sku"], updated_at=utcnow())
        session.add(product)
    product.product_code = values["product_code"]
    product.title = values["title"]
    product.price = values["price"]
    product.floor_price = values["floor_price"]
    product.stock = values["stock"]
    product.activity = values["activity"]
    product.updated_at = utcnow()


def _parse_price(value: object, label: str) -> Decimal:
    if _is_blank(value):
        raise ValueError(f"{label}为空")
    text = str(value).strip().replace(",", "").replace("，", "").replace("￥", "").replace("¥", "")
    if text.endswith("元"):
        text = text[:-1].strip()
    try:
        number = Decimal(text)
    except InvalidOperation as exc:
        raise ValueError(f"{label}不是数字") from exc
    if number < 0:
        raise ValueError(f"{label}不能为负数")
    return number.quantize(Decimal("0.01"))


def _parse_stock(value: object) -> int:
    if _is_blank(value):
        raise ValueError("库存为空")
    text = str(value).strip()
    if text.endswith(".0"):
        text = text[:-2]
    try:
        number = Decimal(text)
    except InvalidOperation as exc:
        raise ValueError("库存不是整数") from exc
    if number != number.to_integral_value():
        raise ValueError("库存不是整数")
    if number < 0:
        raise ValueError("库存不能为负数")
    if number > 1_000_000_000:
        raise ValueError("库存过大")
    return int(number)


def _optional_text(value: object, limit: int, label: str) -> str | None:
    text = _text(value)
    if not text:
        return None
    if len(text) > limit:
        raise ValueError(f"{label}过长")
    return text


def _cell(record: dict, column: str | None) -> object:
    if column is None:
        return None
    return record.get(column)


def _text(value: object) -> str:
    if _is_blank(value):
        return ""
    return str(value).strip()


def _is_blank(value: object) -> bool:
    if value is None:
        return True
    try:
        if pd.isna(value):
            return True
    except TypeError:
        return False
    return str(value).strip() == ""


def _row_blank(record: dict) -> bool:
    return all(_is_blank(value) for value in record.values())


def _suffix(file_name: str) -> str:
    lowered = (file_name or "").lower().strip()
    if lowered.endswith(".xlsx"):
        return ".xlsx"
    if lowered.endswith(".csv"):
        return ".csv"
    return ""
