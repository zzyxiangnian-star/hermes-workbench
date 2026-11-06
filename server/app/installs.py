"""订单导入和安装工单。

第二期才有平台接口；现在用后台导出的订单表。买了“需安装”商品（商品资料卡里勾了需要安装）的订单，
导入后自动生成一张安装工单：待预约 → 已预约 → 已完工，中途可以标异常或取消。
啄木鸟等服务商的接口还没谈下来，所以“预约”是导出一张表交给服务商（或人工在服务商后台录入），回来填预约时间。
"""

from __future__ import annotations

import csv
import io
import re
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.errors import AppError
from app.importer import (
    _cell,
    _finish_run,
    _is_blank,
    _optional_text,
    _parse_price,
    _parse_whole,
    _require_shop,
    _row_blank,
    _text,
    read_table,
    resolve_columns,
)
from app.models import ImportRun, InstallOrder, Order, Product, ProductCard, utcnow
from app.overview import SHANGHAI

ORDER_ALIASES: dict[str, tuple[str, ...]] = {
    "order_no": ("订单编号", "订单号", "主订单编号", "父订单号", "order_no", "订单id"),
    "paid_at": ("付款时间", "支付时间", "下单时间", "订单创建时间", "创建时间", "paid_at"),
    "sku": ("商家编码", "商品编码", "商家sku", "sku", "sku编码", "外部系统编号"),
    "product_code": ("货号", "商品货号", "款号", "product_code"),
    "title": ("商品标题", "宝贝标题", "商品名称", "标题", "title"),
    "quantity": ("购买数量", "商品数量", "数量", "quantity"),
    "amount": ("实付金额", "买家实际支付金额", "支付金额", "订单金额", "应付金额", "amount"),
    "buyer_name": ("收货人姓名", "收货人", "收件人", "buyer_name"),
    "phone": ("联系手机", "收货人手机", "手机号", "收货人电话", "联系电话", "phone"),
    "address": ("收货地址", "详细地址", "收货人地址", "地址", "address"),
    "remark": ("买家留言", "订单备注", "买家备注", "备注", "remark"),
    "platform_status": ("订单状态", "状态", "platform_status"),
}
ORDER_REQUIRED = ("order_no", "paid_at", "title", "amount")
ORDER_LABELS = {
    "order_no": "订单号",
    "paid_at": "付款时间",
    "sku": "商品编码",
    "product_code": "货号",
    "title": "商品标题",
    "quantity": "数量",
    "amount": "实付金额",
    "buyer_name": "收货人",
    "phone": "手机",
    "address": "地址",
    "remark": "备注",
    "platform_status": "订单状态",
}
CLOSED_WORDS = ("关闭", "取消", "退款成功", "已退款")
OVERDUE_HOURS = 48
STATUS_LABELS = {
    "pending": "待预约",
    "booked": "已预约",
    "done": "已完工",
    "exception": "异常",
    "cancelled": "已取消",
}
# 允许的流转。exception 可以回到 pending（重新约）或 booked（约好了）。
TRANSITIONS = {
    "pending": {"booked", "exception", "cancelled"},
    "booked": {"done", "exception", "cancelled", "pending"},
    "exception": {"pending", "booked", "cancelled"},
    "done": set(),
    "cancelled": {"pending"},
}


# ---- 导入 ----


def import_orders(
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
        list(frame.columns), mapping, aliases=ORDER_ALIASES, required=ORDER_REQUIRED, labels=ORDER_LABELS
    )
    errors: list[dict[str, Any]] = []
    rows_ok = 0
    for offset, record in enumerate(frame.to_dict(orient="records")):
        if _row_blank(record):
            continue
        try:
            values = _parse_order_row(record, columns)
        except ValueError as exc:
            errors.append({"row": offset + 2, "reason": str(exc)})
            continue
        _upsert_order(session, shop_id, values)
        rows_ok += 1
    session.flush()
    run = _finish_run(session, file_name, shop_id, "orders", rows_ok, errors)
    stats = sync_installs(session, shop_id=shop_id)
    from app.customers import sync_customers  # 避免循环引用

    stats["customers"] = sync_customers(session, shop_id=shop_id)["created"]
    return run, stats


def _parse_order_row(record: dict, columns: dict[str, str]) -> dict[str, Any]:
    order_no = _clean_id(_cell(record, columns.get("order_no")))
    if not order_no:
        raise ValueError("缺少订单号")
    if len(order_no) > 64:
        raise ValueError("订单号过长")
    title = _text(_cell(record, columns.get("title")))
    if not title:
        raise ValueError("商品标题为空")
    quantity_raw = _cell(record, columns.get("quantity"))
    return {
        "order_no": order_no,
        "paid_at": parse_datetime(_cell(record, columns.get("paid_at"))),
        "sku": (_clean_id(_cell(record, columns.get("sku"))) or "")[:128],
        "product_code": _optional_text(_clean_id(_cell(record, columns.get("product_code"))), 128, "货号"),
        "title": title[:500],
        "quantity": 1 if _is_blank(quantity_raw) else max(_parse_whole(quantity_raw, "数量"), 1),
        "amount": _parse_price(_cell(record, columns.get("amount")), "实付金额"),
        "buyer_name": _optional_text(_cell(record, columns.get("buyer_name")), 100, "收货人"),
        "phone": _optional_text(_clean_id(_cell(record, columns.get("phone"))), 40, "手机"),
        "address": _optional_text(_cell(record, columns.get("address")), 500, "地址"),
        "remark": _optional_text(_cell(record, columns.get("remark")), 2000, "备注"),
        "platform_status": _optional_text(_cell(record, columns.get("platform_status")), 50, "订单状态"),
    }


def _clean_id(value: object) -> str:
    """去掉导出表里常见的 ="123"、制表符和引号，避免长订单号变成科学计数法后对不上。"""
    text = _text(value)
    text = text.strip().lstrip("=").strip().strip('"').strip("'").strip("\t").strip()
    if text.endswith(".0") and text[:-2].isdigit():
        text = text[:-2]
    return text


def parse_datetime(value: object) -> datetime:
    if _is_blank(value):
        raise ValueError("缺少付款时间")
    text = str(value).strip().replace("/", "-").replace("T", " ")
    match = re.match(r"^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?", text)
    if not match:
        raise ValueError("付款时间格式不正确")
    y, m, d, hh, mm, ss = match.groups()
    try:
        local = datetime(int(y), int(m), int(d), int(hh or 0), int(mm or 0), int(ss or 0), tzinfo=SHANGHAI)
    except ValueError as exc:
        raise ValueError("付款时间格式不正确") from exc
    return to_utc(local)


def to_utc(value: datetime) -> datetime:
    """统一按 UTC 存（SQLite 不存时区）；没带时区的按北京时间理解。"""
    if value.tzinfo is None:
        value = value.replace(tzinfo=SHANGHAI)
    return value.astimezone(timezone.utc)


def _upsert_order(session: Session, shop_id: int, values: dict[str, Any]) -> None:
    order = session.scalar(
        select(Order).where(Order.shop_id == shop_id, Order.order_no == values["order_no"], Order.sku == values["sku"])
    )
    if order is None:
        order = Order(shop_id=shop_id, order_no=values["order_no"], sku=values["sku"], updated_at=utcnow())
        session.add(order)
    for key, value in values.items():
        setattr(order, key, value)
    order.updated_at = utcnow()


# ---- 生成工单 ----


def install_codes(session: Session) -> set[str]:
    return set(session.scalars(select(ProductCard.product_code).where(ProductCard.install_required.is_(True))))


def order_code(session: Session, order: Order) -> str | None:
    if order.product_code:
        return order.product_code
    if order.sku:
        return session.scalar(
            select(Product.product_code).where(Product.shop_id == order.shop_id, Product.sku == order.sku)
        )
    return None


def sync_installs(session: Session, *, shop_id: int | None = None) -> dict[str, int]:
    """给需安装商品的订单补工单；订单关闭了就把还没完工的工单取消。可重复跑。"""
    codes = install_codes(session)
    stats = {"created": 0, "cancelled": 0}
    if not codes:
        return stats
    stmt = select(Order)
    if shop_id is not None:
        stmt = stmt.where(Order.shop_id == shop_id)
    existing = {item.order_id: item for item in session.scalars(select(InstallOrder))}
    for order in session.scalars(stmt):
        if order_code(session, order) not in codes:
            continue
        closed = any(word in (order.platform_status or "") for word in CLOSED_WORDS)
        install = existing.get(order.id)
        if install is None:
            if closed:
                continue
            now = utcnow()
            install = InstallOrder(
                order_id=order.id,
                shop_id=order.shop_id,
                status="pending",
                provider="啄木鸟",
                events=[_event("系统", "订单导入，生成工单")],
                created_at=now,
                updated_at=now,
            )
            session.add(install)
            stats["created"] += 1
        elif closed and install.status in {"pending", "booked", "exception"}:
            install.status = "cancelled"
            install.events = [*install.events, _event("系统", f"订单状态为“{order.platform_status}”，工单自动取消")]
            install.updated_at = utcnow()
            stats["cancelled"] += 1
    session.flush()
    return stats


# ---- 流转 ----


def change_status(
    install: InstallOrder,
    status: str,
    *,
    by: str | None,
    appointment_at: datetime | None = None,
    engineer: str | None = None,
    provider_ref: str | None = None,
    reason: str | None = None,
) -> None:
    if status not in STATUS_LABELS:
        raise AppError(400, "invalid_status", "状态必须是 pending、booked、done、exception 或 cancelled")
    if status == install.status == "booked" and appointment_at is not None:
        reschedule(install, appointment_at, by=by, engineer=engineer, provider_ref=provider_ref)
        return
    if status == install.status:
        raise AppError(409, "invalid_transition", f"工单已经是{STATUS_LABELS[status]}")
    if status not in TRANSITIONS[install.status]:
        raise AppError(
            409, "invalid_transition", f"工单不能从{STATUS_LABELS[install.status]}改成{STATUS_LABELS[status]}"
        )
    if status == "booked":
        if appointment_at is not None:
            install.appointment_at = to_utc(appointment_at)  # 新填的时间：没带时区按北京时间
        elif install.appointment_at is None:
            raise AppError(400, "appointment_required", "改成已预约时请填预约时间")
    if status == "exception":
        if not reason:
            raise AppError(400, "reason_required", "标为异常时请写明原因")
        install.exception_reason = reason
    if engineer is not None:
        install.engineer = engineer
    if provider_ref is not None:
        install.provider_ref = provider_ref
    text = f"{STATUS_LABELS[install.status]} → {STATUS_LABELS[status]}"
    if status == "booked":
        text += f"，预约 {local_text(install.appointment_at)}"
    if reason:
        text += f"：{reason}"
    install.status = status
    install.events = [*install.events, _event(by, text)]
    install.updated_at = utcnow()


def reschedule(
    install: InstallOrder,
    appointment_at: datetime,
    *,
    by: str | None,
    engineer: str | None = None,
    provider_ref: str | None = None,
) -> None:
    """已预约的工单改预约时间，状态不变。"""
    before = local_text(install.appointment_at)
    install.appointment_at = to_utc(appointment_at)
    if engineer is not None:
        install.engineer = engineer
    if provider_ref is not None:
        install.provider_ref = provider_ref
    install.events = [*install.events, _event(by, f"改预约：{before} → {local_text(install.appointment_at)}")]
    install.updated_at = utcnow()


def done_on(install: InstallOrder, day) -> bool:
    """这张工单是不是在北京时间 day 这天标的已完工（看流转记录里最后一次改成已完工的时间）。"""
    if install.status != "done":
        return False
    for event in reversed(install.events or []):
        if event.get("text", "").endswith("→ 已完工") or "→ 已完工：" in event.get("text", ""):
            at = datetime.fromisoformat(event["at"])
            if at.tzinfo is None:
                at = at.replace(tzinfo=timezone.utc)
            return at.astimezone(SHANGHAI).date() == day
    return False


def add_note(install: InstallOrder, by: str | None, note: str) -> None:
    line = note.strip()
    install.note = f"{install.note}\n{line}" if install.note else line
    install.events = [*install.events, _event(by, "备注：" + line)]
    install.updated_at = utcnow()


def _event(by: str | None, text: str) -> dict:
    return {"at": utcnow().isoformat(), "by": by, "text": text}


def is_overdue(install: InstallOrder, now: datetime | None = None) -> bool:
    if install.status != "pending":
        return False
    now = now or utcnow()
    created = install.created_at if install.created_at.tzinfo else install.created_at.replace(tzinfo=timezone.utc)
    return now - created > timedelta(hours=OVERDUE_HOURS)


def local_text(value: datetime | None) -> str:
    if value is None:
        return "—"
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(SHANGHAI).strftime("%Y-%m-%d %H:%M")


# ---- 给服务商和顾客 ----

EXPORT_HEADER = ["工单号", "店铺", "订单号", "付款时间", "商品", "数量", "收货人", "手机", "地址", "买家留言", "期望上门时间", "备注"]


def export_csv(installs: list[InstallOrder]) -> bytes:
    """交给啄木鸟（或其他服务商）的预约表。含完整手机号和地址，只在本机生成，不经过 AI。"""
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(EXPORT_HEADER)
    for item in installs:
        order = item.order
        writer.writerow(
            [
                f"AZ{item.id:06d}",
                item.shop.name,
                order.order_no,
                local_text(order.paid_at),
                order.title,
                order.quantity,
                order.buyer_name or "",
                order.phone or "",
                order.address or "",
                order.remark or "",
                "",
                item.note or "",
            ]
        )
    return buffer.getvalue().encode("utf-8-sig")


def customer_notice(install: InstallOrder) -> str:
    """预约成功后给顾客的通知草稿。由客服复制到平台聊天窗口或短信里，系统不自动发。"""
    order = install.order
    name = order.buyer_name[0] + "先生/女士" if order.buyer_name else "您好"
    if install.status != "booked" or install.appointment_at is None:
        raise AppError(409, "not_booked", "工单还没预约，不能生成预约通知")
    engineer = f"，师傅：{install.engineer}" if install.engineer else ""
    return (
        f"{name}，您购买的{_short_title(order.title)}已为您预约安装：{local_text(install.appointment_at)}{engineer}。"
        f"师傅上门前会电话联系，如需改时间请直接回复我们。"
    )


def _short_title(title: str) -> str:
    return title if len(title) <= 24 else title[:24] + "…"


# ---- 打码（给 AI 用）----


def mask_phone(phone: str | None) -> str | None:
    if not phone:
        return phone
    digits = re.sub(r"\D", "", phone)
    if len(digits) >= 7:
        return digits[:3] + "****" + digits[-4:]
    return "****"


def mask_address(address: str | None) -> str | None:
    """只留到区县，门牌号以后的都去掉。"""
    if not address:
        return address
    match = re.match(
        r"^((?:[^省]{2,7}省|[^区]{2,8}自治区)?(?:[^市州区盟]{2,10}?(?:市|自治州|地区|盟))?(?:[^区县旗市]{1,10}?(?:区|县|旗|市))?)",
        address,
    )
    head = match.group(1) if match and match.group(1) else address[:6]
    return head + "****"


def mask_name(name: str | None) -> str | None:
    if not name:
        return name
    return name[0] + "*" * max(len(name) - 1, 1)


def money(value: Decimal) -> float:
    return float(Decimal(value).quantize(Decimal("0.01")))
