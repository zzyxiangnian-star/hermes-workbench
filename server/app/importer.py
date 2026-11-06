"""报表导入。列名识别集中在 FIELD_ALIASES，以后加平台列只改这一处。"""

from __future__ import annotations

import io
import json
import re
from datetime import date
from decimal import Decimal, InvalidOperation
from typing import Any

import pandas as pd
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ad_rules import run_ad_rules
from app.errors import AppError
from app.models import AdSpend, DailyMetric, ImportRun, Product, Shop, utcnow
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

METRICS_ALIASES: dict[str, tuple[str, ...]] = {
    "date": ("日期", "统计日期", "date", "时间"),
    "visitors": ("访客", "访客数", "uv", "访客人数", "visitors"),
    "orders": ("订单", "订单数", "成交订单数", "支付订单数", "orders"),
    "sales_amount": ("销售额", "成交金额", "支付金额", "销售金额", "sales_amount"),
    "refund_amount": ("退款金额", "退款", "成功退款金额", "refund_amount"),
}
METRICS_REQUIRED = ("date", "visitors", "orders", "sales_amount")
METRICS_LABELS = {
    "date": "日期",
    "visitors": "访客",
    "orders": "订单",
    "sales_amount": "销售额",
    "refund_amount": "退款金额",
}

AD_ALIASES: dict[str, tuple[str, ...]] = {
    "date": ("日期", "统计日期", "date"),
    "tool": ("工具", "投放工具", "推广工具", "渠道", "tool"),
    "campaign": ("计划", "计划名称", "计划名", "推广计划", "campaign"),
    "spend": ("花费", "消耗", "花费金额", "投放花费", "spend"),
    "gmv": ("成交金额", "gmv", "投放成交", "推广成交金额", "直接成交金额"),
    "clicks": ("点击", "点击量", "点击数", "clicks"),
    "impressions": ("展现", "展现量", "曝光", "曝光量", "impressions"),
}
AD_REQUIRED = ("date", "tool", "campaign", "spend", "gmv")
AD_LABELS = {
    "date": "日期",
    "tool": "投放工具",
    "campaign": "计划",
    "spend": "花费",
    "gmv": "成交金额",
    "clicks": "点击",
    "impressions": "展现",
}
TOOL_NAMES = {
    "万相台": "万相台",
    "京准通": "京准通",
    "多多推广": "多多推广",
    "拼多多推广": "多多推广",
    "巨量千川": "巨量千川",
    "千川": "巨量千川",
    "其他": "其他",
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
        kind="products",
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


def resolve_columns(
    columns: list[object],
    mapping: dict[str, str] | None,
    *,
    aliases: dict[str, tuple[str, ...]] | None = None,
    required: tuple[str, ...] | None = None,
    labels: dict[str, str] | None = None,
) -> dict[str, str]:
    aliases = aliases or FIELD_ALIASES
    required = REQUIRED_FIELDS if required is None else required
    labels = labels or FIELD_LABELS
    by_norm = {norm_header(column): str(column) for column in columns}
    assigned: dict[str, str] = {}
    used: set[str] = set()
    if mapping:
        if not isinstance(mapping, dict):
            raise AppError(400, "invalid_mapping", "mapping 必须是 JSON 对象")
        for raw_name, field in mapping.items():
            if field not in aliases:
                raise AppError(400, "invalid_mapping", f"mapping 里的字段「{field}」不能识别")
            key = norm_header(raw_name)
            column = by_norm.get(key)
            if column is None:
                raise AppError(400, "invalid_mapping", f"列「{raw_name}」不在表头里")
            if field in assigned and assigned[field] != column:
                raise AppError(400, "invalid_mapping", f"字段「{labels[field]}」对应了多列")
            if column in used and assigned.get(field) != column:
                raise AppError(400, "invalid_mapping", f"列「{column}」对应了多个字段")
            assigned[field] = column
            used.add(column)
    for field, names in aliases.items():
        if field in assigned:
            continue
        for alias in names:
            column = by_norm.get(norm_header(alias))
            if column and column not in used:
                assigned[field] = column
                used.add(column)
                break
    missing = [labels[field] for field in required if field not in assigned]
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


def import_metrics(
    session: Session,
    *,
    shop_id: int,
    file_name: str,
    content: bytes,
    mapping: dict[str, str] | None = None,
) -> ImportRun:
    _require_shop(session, shop_id)
    frame = read_table(file_name, content)
    columns = resolve_columns(
        list(frame.columns),
        mapping,
        aliases=METRICS_ALIASES,
        required=METRICS_REQUIRED,
        labels=METRICS_LABELS,
    )
    errors: list[dict[str, Any]] = []
    rows_ok = 0
    for offset, record in enumerate(frame.to_dict(orient="records")):
        if _row_blank(record):
            continue
        row_number = offset + 2
        try:
            values = _parse_metric_row(record, columns)
        except ValueError as exc:
            errors.append({"row": row_number, "reason": str(exc)})
            continue
        _upsert_metric(session, shop_id, values)
        rows_ok += 1
    return _finish_run(session, file_name, shop_id, "metrics", rows_ok, errors)


def import_ad_spend(
    session: Session,
    *,
    shop_id: int,
    file_name: str,
    content: bytes,
    mapping: dict[str, str] | None = None,
) -> tuple[ImportRun, dict[str, int]]:
    _require_shop(session, shop_id)
    frame = read_table(file_name, content)
    columns = resolve_columns(
        list(frame.columns),
        mapping,
        aliases=AD_ALIASES,
        required=AD_REQUIRED,
        labels=AD_LABELS,
    )
    errors: list[dict[str, Any]] = []
    rows_ok = 0
    for offset, record in enumerate(frame.to_dict(orient="records")):
        if _row_blank(record):
            continue
        row_number = offset + 2
        try:
            values = _parse_ad_row(record, columns)
        except ValueError as exc:
            errors.append({"row": row_number, "reason": str(exc)})
            continue
        _upsert_ad_spend(session, shop_id, values)
        rows_ok += 1
    session.flush()
    run = _finish_run(session, file_name, shop_id, "ad_spend", rows_ok, errors)
    stats = run_ad_rules(session)
    return run, stats


def _require_shop(session: Session, shop_id: int) -> Shop:
    shop = session.get(Shop, shop_id)
    if shop is None:
        raise AppError(404, "shop_not_found", "店铺不存在")
    return shop


def _finish_run(
    session: Session,
    file_name: str,
    shop_id: int,
    kind: str,
    rows_ok: int,
    errors: list[dict[str, Any]],
) -> ImportRun:
    session.flush()
    run = ImportRun(
        file_name=file_name or "upload",
        shop_id=shop_id,
        kind=kind,
        rows_ok=rows_ok,
        rows_failed=len(errors),
        errors=errors,
        created_at=utcnow(),
    )
    session.add(run)
    session.flush()
    return run


def _parse_metric_row(record: dict, columns: dict[str, str]) -> dict[str, Any]:
    refund_raw = _cell(record, columns.get("refund_amount"))
    return {
        "date": _parse_date(_cell(record, columns.get("date"))),
        "visitors": _parse_whole(_cell(record, columns.get("visitors")), "访客"),
        "orders": _parse_whole(_cell(record, columns.get("orders")), "订单"),
        "sales_amount": _parse_price(_cell(record, columns.get("sales_amount")), "销售额"),
        "refund_amount": None if _is_blank(refund_raw) else _parse_price(refund_raw, "退款金额"),
    }


def _parse_ad_row(record: dict, columns: dict[str, str]) -> dict[str, Any]:
    clicks_raw = _cell(record, columns.get("clicks"))
    impressions_raw = _cell(record, columns.get("impressions"))
    return {
        "date": _parse_date(_cell(record, columns.get("date"))),
        "tool": _parse_tool(_cell(record, columns.get("tool"))),
        "campaign": _required_text(_cell(record, columns.get("campaign")), 200, "计划"),
        "spend": _parse_price(_cell(record, columns.get("spend")), "花费"),
        "gmv": _parse_price(_cell(record, columns.get("gmv")), "成交金额"),
        "clicks": None if _is_blank(clicks_raw) else _parse_whole(clicks_raw, "点击"),
        "impressions": None if _is_blank(impressions_raw) else _parse_whole(impressions_raw, "展现"),
    }


def _upsert_metric(session: Session, shop_id: int, values: dict[str, Any]) -> None:
    row = session.scalar(
        select(DailyMetric).where(DailyMetric.shop_id == shop_id, DailyMetric.date == values["date"])
    )
    if row is None:
        row = DailyMetric(shop_id=shop_id, date=values["date"], updated_at=utcnow())
        session.add(row)
    row.visitors = values["visitors"]
    row.orders = values["orders"]
    row.sales_amount = values["sales_amount"]
    row.refund_amount = values["refund_amount"]
    row.updated_at = utcnow()


def _upsert_ad_spend(session: Session, shop_id: int, values: dict[str, Any]) -> None:
    row = session.scalar(
        select(AdSpend).where(
            AdSpend.shop_id == shop_id,
            AdSpend.date == values["date"],
            AdSpend.tool == values["tool"],
            AdSpend.campaign == values["campaign"],
        )
    )
    if row is None:
        row = AdSpend(
            shop_id=shop_id,
            date=values["date"],
            tool=values["tool"],
            campaign=values["campaign"],
            updated_at=utcnow(),
        )
        session.add(row)
    row.spend = values["spend"]
    row.gmv = values["gmv"]
    row.clicks = values["clicks"]
    row.impressions = values["impressions"]
    row.updated_at = utcnow()


def _parse_date(value: object) -> date:
    if _is_blank(value):
        raise ValueError("缺少日期")
    text = str(value).strip().replace("/", "-").replace(".", "-")
    text = text.split(" ", 1)[0].split("T", 1)[0]
    parts = text.split("-")
    if len(parts) != 3:
        raise ValueError("日期格式不正确")
    try:
        return date(int(parts[0]), int(parts[1]), int(parts[2]))
    except ValueError as exc:
        raise ValueError("日期格式不正确") from exc


def _parse_tool(value: object) -> str:
    text = _text(value)
    if not text:
        raise ValueError("缺少投放工具")
    name = TOOL_NAMES.get(text)
    if name is None:
        raise ValueError("投放工具无法识别")
    return name


def _required_text(value: object, limit: int, label: str) -> str:
    text = _text(value)
    if not text:
        raise ValueError(f"缺少{label}")
    if len(text) > limit:
        raise ValueError(f"{label}过长")
    return text


def _parse_whole(value: object, label: str) -> int:
    if _is_blank(value):
        raise ValueError(f"{label}为空")
    text = str(value).strip().replace(",", "").replace("，", "")
    if text.endswith(".0"):
        text = text[:-2]
    try:
        number = Decimal(text)
    except InvalidOperation as exc:
        raise ValueError(f"{label}不是整数") from exc
    if number != number.to_integral_value():
        raise ValueError(f"{label}不是整数")
    if number < 0:
        raise ValueError(f"{label}不能为负数")
    if number > 1_000_000_000:
        raise ValueError(f"{label}过大")
    return int(number)


MAX_IMPORT_MB = 50


async def read_report(file) -> bytes:
    """读上传的报表，超过 50 MB 直接拒绝（平台导出的表一般几 MB）。"""
    from app.errors import AppError

    data = await file.read(MAX_IMPORT_MB * 1024 * 1024 + 1)
    if len(data) > MAX_IMPORT_MB * 1024 * 1024:
        raise AppError(413, "file_too_large", f"文件超过 {MAX_IMPORT_MB} MB，请按日期或店铺拆开再导入")
    return data
