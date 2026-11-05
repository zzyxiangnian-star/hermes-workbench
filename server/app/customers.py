"""客户页：客户档案、B 端询盘和报价单、会员分层、批量跟进。

客户档案从订单里按手机号汇总（导入订单时自动做），企业客户可以手动补。
分层每次现算，不存表：新客、复购、沉睡、询盘未成交。“加购未买”要平台接口，第二期再说。
批量跟进只生成名单和话术：主管审过（过违禁词）之后，由人在企微/平台/短信里一条条发，发完回来点“已发”。
系统不自动发任何消息。
"""

from __future__ import annotations

import csv
import io
import re
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.brand import check_text, today
from app.errors import AppError
from app.installs import CLOSED_WORDS, _event, local_text
from app.models import Customer, Followup, FollowupTarget, Inquiry, Order, Quote, Shop, utcnow
from app.overview import SHANGHAI

NEW_DAYS = 30
DORMANT_DAYS = 90
INQUIRY_STALE_DAYS = 7
MAX_TARGETS = 1000
QUOTE_VALID_DAYS = 15

SEGMENTS = {
    "new": "新客",
    "repeat": "复购",
    "dormant": "沉睡",
    "inquiry_open": "询盘未成交",
}
INQUIRY_LABELS = {"new": "新询盘", "replied": "已回复", "quoted": "已报价", "won": "成交", "lost": "丢单"}
OPEN_INQUIRY = ("new", "replied", "quoted")
INQUIRY_TRANSITIONS = {
    "new": {"replied", "quoted", "won", "lost"},
    "replied": {"quoted", "won", "lost"},
    "quoted": {"replied", "won", "lost"},
    "won": set(),
    "lost": {"replied"},  # 丢单后客户又回来了
}
CHANNEL_LABELS = {"wecom": "企业微信", "platform": "平台客服", "sms": "短信", "phone": "电话"}
PLACEHOLDERS = ("{称呼}", "{姓名}", "{最近商品}", "{店铺}", "{公司}")


# ---- 客户档案 ----


def normalize_phone(phone: str | None) -> str | None:
    """只留数字；去掉 +86。少于 7 位的不算手机号。"""
    if not phone:
        return None
    digits = re.sub(r"\D", "", phone)
    if digits.startswith("86") and len(digits) == 13:
        digits = digits[2:]
    return digits if len(digits) >= 7 else None


def sync_customers(session: Session, *, shop_id: int | None = None) -> dict[str, int]:
    """把订单挂到客户档案上（按手机号），没有就新建会员。可重复跑。"""
    stats = {"created": 0, "linked": 0}
    stmt = select(Order).where(Order.customer_id.is_(None), Order.phone.is_not(None))
    if shop_id is not None:
        stmt = stmt.where(Order.shop_id == shop_id)
    by_phone: dict[str, Customer] = {}
    for order in session.scalars(stmt.order_by(Order.paid_at)):
        phone = normalize_phone(order.phone)
        if phone is None:
            continue
        customer = by_phone.get(phone) or session.scalar(select(Customer).where(Customer.phone == phone))
        if customer is None:
            now = utcnow()
            customer = Customer(kind="member", phone=phone, name=order.buyer_name, tags=[], created_at=now, updated_at=now)
            session.add(customer)
            session.flush()
            stats["created"] += 1
        elif not customer.name and order.buyer_name:
            customer.name = order.buyer_name
        by_phone[phone] = customer
        order.customer_id = customer.id
        stats["linked"] += 1
    session.flush()
    return stats


@dataclass
class CustomerStats:
    order_count: int = 0
    total: Decimal = Decimal("0")
    first_paid_at: datetime | None = None
    last_paid_at: datetime | None = None
    last_title: str | None = None
    last_shop: str | None = None
    shops: set[str] = field(default_factory=set)


def customer_stats(session: Session, customer_ids: list[int] | None = None) -> dict[int, CustomerStats]:
    """订单数按（店铺, 订单号）去重；关闭、退款的订单不算。"""
    stmt = select(Order, Shop.name).join(Shop, Order.shop_id == Shop.id).where(Order.customer_id.is_not(None))
    if customer_ids is not None:
        stmt = stmt.where(Order.customer_id.in_(customer_ids))
    result: dict[int, CustomerStats] = {}
    seen: dict[int, set[tuple[int, str]]] = {}
    for order, shop_name in session.execute(stmt.order_by(Order.paid_at, Order.id)):
        if any(word in (order.platform_status or "") for word in CLOSED_WORDS):
            continue
        stats = result.setdefault(order.customer_id, CustomerStats())
        keys = seen.setdefault(order.customer_id, set())
        key = (order.shop_id, order.order_no)
        if key not in keys:
            keys.add(key)
            stats.order_count += 1
        stats.total += Decimal(order.amount)
        paid = _aware(order.paid_at)
        stats.first_paid_at = stats.first_paid_at or paid
        stats.last_paid_at = paid
        stats.last_title = order.title
        stats.last_shop = shop_name
        stats.shops.add(shop_name)
    return result


def open_inquiry_customers(session: Session, now: datetime | None = None) -> set[int]:
    """有询盘还没成交、而且超过 7 天没动静的客户。"""
    cutoff = (now or utcnow()) - timedelta(days=INQUIRY_STALE_DAYS)
    rows = session.execute(
        select(Inquiry.customer_id, Inquiry.updated_at).where(
            Inquiry.customer_id.is_not(None), Inquiry.status.in_(OPEN_INQUIRY)
        )
    )
    return {customer_id for customer_id, updated in rows if _aware(updated) <= cutoff}


def segments_of(stats: CustomerStats | None, has_open_inquiry: bool, now: datetime | None = None) -> list[str]:
    now = now or utcnow()
    result = []
    if stats and stats.order_count:
        age = now - stats.last_paid_at
        if stats.order_count == 1 and age <= timedelta(days=NEW_DAYS):
            result.append("new")
        if stats.order_count >= 2:
            result.append("repeat")
        if age > timedelta(days=DORMANT_DAYS):
            result.append("dormant")
    if has_open_inquiry:
        result.append("inquiry_open")
    return result


def segment_members(session: Session, segment: str) -> list[Customer]:
    if segment not in SEGMENTS:
        raise AppError(400, "invalid_segment", "分层必须是 new、repeat、dormant 或 inquiry_open")
    stats = customer_stats(session)
    stale = open_inquiry_customers(session)
    now = utcnow()
    customers = session.scalars(select(Customer).order_by(Customer.id)).all()
    return [c for c in customers if segment in segments_of(stats.get(c.id), c.id in stale, now)]


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def find_or_create_business(
    session: Session, *, phone: str | None, company: str | None, contact: str | None
) -> Customer | None:
    """询盘带了手机号就挂到客户档案；没有档案又写了公司名，就建一个企业客户。"""
    normalized = normalize_phone(phone)
    customer = session.scalar(select(Customer).where(Customer.phone == normalized)) if normalized else None
    if customer is None and company:
        customer = session.scalar(select(Customer).where(Customer.kind == "business", Customer.company == company))
    if customer is None and company:
        now = utcnow()
        customer = Customer(
            kind="business", phone=normalized, name=contact, company=company, tags=[], created_at=now, updated_at=now
        )
        session.add(customer)
        session.flush()
    return customer


# ---- 询盘 ----


def change_inquiry_status(inquiry: Inquiry, status: str, *, by: str | None, reason: str | None = None) -> None:
    if status not in INQUIRY_LABELS:
        raise AppError(400, "invalid_status", "状态必须是 new、replied、quoted、won 或 lost")
    if status == inquiry.status:
        raise AppError(409, "invalid_transition", f"询盘已经是{INQUIRY_LABELS[status]}")
    if status not in INQUIRY_TRANSITIONS[inquiry.status]:
        raise AppError(
            409, "invalid_transition", f"询盘不能从{INQUIRY_LABELS[inquiry.status]}改成{INQUIRY_LABELS[status]}"
        )
    if status == "lost":
        if not reason:
            raise AppError(400, "reason_required", "标为丢单时请写明原因")
        inquiry.lost_reason = reason
    text = f"{INQUIRY_LABELS[inquiry.status]} → {INQUIRY_LABELS[status]}"
    if reason:
        text += f"：{reason}"
    inquiry.status = status
    inquiry.events = [*inquiry.events, _event(by, text)]
    inquiry.updated_at = utcnow()


def add_inquiry_note(inquiry: Inquiry, by: str | None, note: str) -> None:
    line = note.strip()
    inquiry.note = f"{inquiry.note}\n{line}" if inquiry.note else line
    inquiry.events = [*inquiry.events, _event(by, "备注：" + line)]
    inquiry.updated_at = utcnow()


# ---- 报价单 ----


def next_quote_number(session: Session, day: date | None = None) -> str:
    prefix = f"BJ{(day or today()):%Y%m%d}-"
    count = session.scalar(select(func.count()).select_from(Quote).where(Quote.number.like(prefix + "%"))) or 0
    return f"{prefix}{count + 1:03d}"


def quote_items(items: list[dict]) -> tuple[list[dict], Decimal]:
    rows = []
    total = Decimal("0")
    for item in items:
        price = Decimal(str(item["unit_price"])).quantize(Decimal("0.01"))
        amount = (price * item["quantity"]).quantize(Decimal("0.01"))
        total += amount
        rows.append({**item, "unit_price": float(price), "amount": float(amount)})
    return rows, total


def quote_document(quote: Quote) -> str:
    """报价单正文（Markdown）。销售复制到邮件/企微，或在页面上打印成 PDF。"""
    inquiry = quote.inquiry
    lines = [
        f"# 报价单 {quote.number}",
        "",
        f"- 客户：{inquiry.company or inquiry.contact or '—'}",
        f"- 联系人：{inquiry.contact or '—'}",
        f"- 报价日期：{_aware(quote.created_at).astimezone(SHANGHAI):%Y-%m-%d}",
        f"- 有效期至：{quote.valid_until or '—'}",
        "",
        "| 序号 | 商品编码 | 商品 | 数量 | 单价（元） | 金额（元） | 备注 |",
        "| --- | --- | --- | ---: | ---: | ---: | --- |",
    ]
    for n, item in enumerate(quote.items, 1):
        lines.append(
            f"| {n} | {item.get('product_code') or ''} | {item['name']} | {item['quantity']} | "
            f"{item['unit_price']:.2f} | {item['amount']:.2f} | {item.get('note') or ''} |"
        )
    lines += ["", f"**合计：{Decimal(quote.total):.2f} 元**"]
    if quote.terms:
        lines += ["", "## 说明", "", quote.terms]
    return "\n".join(lines) + "\n"


# ---- 批量跟进 ----


def render_message(template: str, customer: Customer, stats: CustomerStats | None) -> str:
    title = stats.last_title if stats else None
    if title and len(title) > 20:
        title = title[:20] + "…"
    values = {
        "{称呼}": _salutation(customer.name),
        "{姓名}": customer.name or "",
        "{最近商品}": title or "我们的产品",
        "{店铺}": (stats.last_shop if stats else None) or "我们",
        "{公司}": customer.company or "",
    }
    text = template
    for key, value in values.items():
        text = text.replace(key, value)
    return text


def _salutation(name: str | None) -> str:
    if not name:
        return "您好"
    if name.endswith(("先生", "女士", "老师", "经理", "总")):
        return name
    return name[0] + "先生/女士"


def build_targets(session: Session, followup: Followup) -> None:
    """按分层生成名单。企微渠道只发给加了企微的客户，其余记为跳过；没手机号的电话、短信也跳过。"""
    members = segment_members(session, followup.segment)
    if len(members) > MAX_TARGETS:
        raise AppError(400, "too_many_targets", f"这一层有 {len(members)} 人，单次最多 {MAX_TARGETS} 人，请先缩小范围")
    stats = customer_stats(session, [c.id for c in members])
    for customer in members:
        skip = None
        if followup.channel == "wecom" and not customer.wecom_added:
            skip = "未加企业微信"
        elif followup.channel in {"sms", "phone"} and not customer.phone:
            skip = "没有手机号"
        followup.targets.append(
            FollowupTarget(
                customer_id=customer.id,
                message=render_message(followup.template, customer, stats.get(customer.id)),
                status="skipped" if skip else "pending",
                note=skip,
            )
        )


def rerender_targets(session: Session, followup: Followup) -> None:
    stats = customer_stats(session, [t.customer_id for t in followup.targets])
    for target in followup.targets:
        target.message = render_message(followup.template, target.customer, stats.get(target.customer_id))


def approve_followup(session: Session, followup: Followup, by: str | None) -> None:
    if followup.status != "draft":
        raise AppError(409, "invalid_transition", "只有草稿可以审核通过")
    report = check_text(session, followup.template)
    if not report["passed"]:
        words = "、".join(hit["word"] for hit in report["hits"] if hit["level"] == "must")
        raise AppError(400, "compliance_failed", f"话术里有必须修改的违禁词：{words}")
    if not any(t.status == "pending" for t in followup.targets):
        raise AppError(400, "no_targets", "名单里没有可发送的客户")
    followup.status = "approved"
    followup.approved_by = by
    followup.updated_at = utcnow()


def mark_target(followup: Followup, target: FollowupTarget, status: str, note: str | None) -> None:
    if followup.status != "approved":
        raise AppError(409, "not_approved", "跟进任务审核通过后才能标记发送")
    if status not in {"pending", "sent", "skipped"}:
        raise AppError(400, "invalid_status", "状态必须是 pending、sent 或 skipped")
    target.status = status
    target.sent_at = utcnow() if status == "sent" else None
    if note is not None:
        target.note = note
    if not any(t.status == "pending" for t in followup.targets):
        followup.status = "done"
    followup.updated_at = utcnow()


EXPORT_HEADER = ["序号", "客户", "手机", "企业微信", "公司", "话术", "状态"]
TARGET_LABELS = {"pending": "待发", "sent": "已发", "skipped": "跳过"}


def export_targets(followup: Followup) -> bytes:
    """给人工发送用的名单（含完整手机号，只在本机生成，不经过 AI）。"""
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(EXPORT_HEADER)
    for n, target in enumerate(followup.targets, 1):
        customer = target.customer
        writer.writerow(
            [
                n,
                customer.name or "",
                customer.phone or "",
                "是" if customer.wecom_added else "否",
                customer.company or "",
                target.message,
                TARGET_LABELS[target.status] + (f"（{target.note}）" if target.note else ""),
            ]
        )
    return buffer.getvalue().encode("utf-8-sig")


def mask_text(text: str | None) -> str | None:
    """询盘原文里可能带手机号，发给 AI 前打码。"""
    if not text:
        return text
    return re.sub(r"(?<!\d)(1\d{2})\d{4}(\d{4})(?!\d)", r"\1****\2", text)


def day_text(value: datetime | None) -> str | None:
    return local_text(value)[:10] if value else None
