"""客户页：客户档案、会员分层、B 端询盘和报价单、批量跟进。"""

from datetime import timedelta

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy import exists, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.api.brand_assets import card_out
from app.api.products import _like
from app.brand import today
from app.customer_schemas import (
    ApproveIn,
    CustomerDetail,
    CustomerIn,
    CustomerPage,
    CustomerPatch,
    FollowupDetail,
    FollowupIn,
    FollowupOut,
    FollowupPatch,
    InquiryDetail,
    InquiryIn,
    InquiryOut,
    InquiryPatch,
    InquiryStatusIn,
    NoteIn,
    QuoteIn,
    QuoteOut,
    SegmentSummary,
    TargetPatch,
)
from app.customers import (
    CHANNEL_LABELS,
    DORMANT_DAYS,
    INQUIRY_LABELS,
    INQUIRY_STALE_DAYS,
    NEW_DAYS,
    OPEN_INQUIRY,
    SEGMENTS,
    QUOTE_VALID_DAYS,
    _aware,
    add_inquiry_note,
    approve_followup,
    build_targets,
    change_inquiry_status,
    customer_stats,
    export_targets,
    find_or_create_business,
    mark_target,
    next_quote_number,
    normalize_phone,
    open_inquiry_customers,
    quote_document,
    quote_items,
    rerender_targets,
    segments_of,
    sync_customers,
)
from app.db import get_db
from app.errors import AppError
from app.installs import _event, money
from app.models import Customer, Followup, FollowupTarget, Inquiry, Order, ProductCard, Product, Quote, utcnow
from app.overview import SHANGHAI

router = APIRouter()

SEGMENT_RULES = {
    "new": f"只买过 1 单，且在最近 {NEW_DAYS} 天内",
    "repeat": "买过 2 单及以上",
    "dormant": f"最近一单在 {DORMANT_DAYS} 天以前",
    "inquiry_open": f"有询盘没成交，且超过 {INQUIRY_STALE_DAYS} 天没跟进",
}


# ---- 客户档案 ----


@router.get("/customers/segments", response_model=SegmentSummary)
def segment_summary(session: Session = Depends(get_db)) -> dict:
    customers = session.scalars(select(Customer)).all()
    stats = customer_stats(session)
    stale = open_inquiry_customers(session)
    now = utcnow()
    counts = {key: 0 for key in SEGMENTS}
    for customer in customers:
        for segment in segments_of(stats.get(customer.id), customer.id in stale, now):
            counts[segment] += 1
    open_count = len(session.scalars(select(Inquiry.id).where(Inquiry.status.in_(OPEN_INQUIRY))).all())
    return {
        "total": len(customers),
        "members": sum(1 for c in customers if c.kind == "member"),
        "businesses": sum(1 for c in customers if c.kind == "business"),
        "wecom_added": sum(1 for c in customers if c.wecom_added),
        "segments": [
            {"segment": key, "label": label, "count": counts[key], "rule": SEGMENT_RULES[key]}
            for key, label in SEGMENTS.items()
        ],
        "open_inquiries": open_count,
    }


@router.post("/customers/sync")
def resync(session: Session = Depends(get_db)) -> dict:
    """给还没挂上客户的订单补档案（一般导入订单时已自动做）。"""
    return sync_customers(session)


@router.get("/customers", response_model=CustomerPage)
def list_customers(
    segment: str | None = None,
    kind: str | None = None,
    q: str | None = None,
    wecom_added: bool | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    session: Session = Depends(get_db),
) -> dict:
    if segment is not None and segment not in SEGMENTS:
        raise AppError(400, "invalid_segment", "分层必须是 new、repeat、dormant 或 inquiry_open")
    if kind is not None and kind not in {"member", "business"}:
        raise AppError(400, "invalid_kind", "客户类型必须是 member 或 business")
    stmt = select(Customer).order_by(Customer.id.desc())
    if kind:
        stmt = stmt.where(Customer.kind == kind)
    if wecom_added is not None:
        stmt = stmt.where(Customer.wecom_added.is_(wecom_added))
    if q and q.strip():
        pattern = _like(q.strip())
        digits = normalize_phone(q)
        conditions = Customer.name.ilike(pattern, escape="\\") | Customer.company.ilike(pattern, escape="\\")
        if digits:
            conditions = conditions | Customer.phone.like(_like(digits), escape="\\")
        conditions = conditions | exists().where(
            Order.customer_id == Customer.id,
            Order.order_no.ilike(pattern, escape="\\") | Order.title.ilike(pattern, escape="\\"),
        )
        stmt = stmt.where(conditions)
    customers = session.scalars(stmt).all()
    stats = customer_stats(session, [c.id for c in customers])
    stale = open_inquiry_customers(session)
    open_by = _open_inquiry_counts(session)
    now = utcnow()
    rows = [_customer_out(c, stats.get(c.id), c.id in stale, open_by.get(c.id, 0), now) for c in customers]
    if segment:
        rows = [row for row in rows if segment in row["segments"]]
    start = (page - 1) * page_size
    return {"items": rows[start : start + page_size], "total": len(rows), "page": page, "page_size": page_size}


@router.post("/customers", response_model=CustomerDetail, status_code=201)
def create_customer(payload: CustomerIn, session: Session = Depends(get_db)) -> dict:
    phone = normalize_phone(payload.phone)
    if payload.phone and phone is None:
        raise AppError(400, "invalid_phone", "手机号不正确")
    if phone and session.scalar(select(Customer.id).where(Customer.phone == phone)):
        raise AppError(409, "duplicate_customer", "这个手机号已经有客户档案")
    if payload.kind == "business" and not payload.company:
        raise AppError(400, "company_required", "企业客户请填写公司名称")
    now = utcnow()
    data = payload.model_dump()
    data["phone"] = phone
    customer = Customer(**data, created_at=now, updated_at=now)
    session.add(customer)
    session.flush()
    return customer_detail(session, customer)


@router.get("/customers/{customer_id}", response_model=CustomerDetail)
def get_customer(customer_id: int, session: Session = Depends(get_db)) -> dict:
    return customer_detail(session, _customer(session, customer_id))


@router.patch("/customers/{customer_id}", response_model=CustomerDetail)
def patch_customer(customer_id: int, payload: CustomerPatch, session: Session = Depends(get_db)) -> dict:
    customer = _customer(session, customer_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        if value is None and key in {"kind", "wecom_added", "tags"}:
            continue
        setattr(customer, key, value)
    if customer.kind == "business" and not customer.company:
        raise AppError(400, "company_required", "企业客户请填写公司名称")
    customer.updated_at = utcnow()
    session.flush()
    return customer_detail(session, customer)


def customer_detail(session: Session, customer: Customer) -> dict:
    stats = customer_stats(session, [customer.id]).get(customer.id)
    stale = customer.id in open_inquiry_customers(session)
    inquiries = session.scalars(
        select(Inquiry).where(Inquiry.customer_id == customer.id).options(selectinload(Inquiry.quotes)).order_by(Inquiry.id.desc())
    ).all()
    open_count = sum(1 for i in inquiries if i.status in OPEN_INQUIRY)
    orders = session.scalars(
        select(Order)
        .where(Order.customer_id == customer.id)
        .options(joinedload(Order.shop))
        .order_by(Order.paid_at.desc(), Order.id.desc())
        .limit(50)
    ).all()
    return {
        **_customer_out(customer, stats, stale, open_count, utcnow()),
        "orders": [
            {
                "id": o.id,
                "shop_name": o.shop.name,
                "order_no": o.order_no,
                "paid_at": o.paid_at,
                "title": o.title,
                "quantity": o.quantity,
                "amount": money(o.amount),
                "platform_status": o.platform_status,
            }
            for o in orders
        ],
        "inquiries": [inquiry_out(i) for i in inquiries],
    }


def _customer_out(customer: Customer, stats, stale: bool, open_inquiries: int, now) -> dict:
    return {
        "id": customer.id,
        "kind": customer.kind,
        "name": customer.name,
        "phone": customer.phone,
        "company": customer.company,
        "wecom_added": customer.wecom_added,
        "tags": customer.tags,
        "note": customer.note,
        "segments": segments_of(stats, stale, now),
        "order_count": stats.order_count if stats else 0,
        "total": money(stats.total) if stats else 0.0,
        "first_paid_at": stats.first_paid_at if stats else None,
        "last_paid_at": stats.last_paid_at if stats else None,
        "last_title": stats.last_title if stats else None,
        "shops": sorted(stats.shops) if stats else [],
        "open_inquiries": open_inquiries,
        "created_at": customer.created_at,
    }


def _open_inquiry_counts(session: Session) -> dict[int, int]:
    result: dict[int, int] = {}
    for customer_id in session.scalars(
        select(Inquiry.customer_id).where(Inquiry.customer_id.is_not(None), Inquiry.status.in_(OPEN_INQUIRY))
    ):
        result[customer_id] = result.get(customer_id, 0) + 1
    return result


def _customer(session: Session, customer_id: int) -> Customer:
    customer = session.get(Customer, customer_id)
    if customer is None:
        raise AppError(404, "customer_not_found", "客户不存在")
    return customer


# ---- 询盘 ----


@router.get("/inquiries", response_model=list[InquiryOut])
def list_inquiries(
    status: str | None = None,
    channel: str | None = None,
    q: str | None = None,
    customer_id: int | None = None,
    session: Session = Depends(get_db),
) -> list[dict]:
    if status is not None and status not in INQUIRY_LABELS and status != "open":
        raise AppError(400, "invalid_status", "状态必须是 open、new、replied、quoted、won 或 lost")
    stmt = select(Inquiry).options(selectinload(Inquiry.quotes)).order_by(Inquiry.updated_at.desc(), Inquiry.id.desc())
    if status == "open":
        stmt = stmt.where(Inquiry.status.in_(OPEN_INQUIRY))
    elif status:
        stmt = stmt.where(Inquiry.status == status)
    if channel:
        stmt = stmt.where(Inquiry.channel == channel)
    if customer_id is not None:
        stmt = stmt.where(Inquiry.customer_id == customer_id)
    if q and q.strip():
        pattern = _like(q.strip())
        stmt = stmt.where(
            Inquiry.content.ilike(pattern, escape="\\")
            | Inquiry.company.ilike(pattern, escape="\\")
            | Inquiry.contact.ilike(pattern, escape="\\")
            | Inquiry.phone.ilike(pattern, escape="\\")
        )
    return [inquiry_out(item) for item in session.scalars(stmt)]


@router.post("/inquiries", response_model=InquiryDetail, status_code=201)
def create_inquiry(payload: InquiryIn, session: Session = Depends(get_db)) -> dict:
    if payload.customer_id is not None:
        customer = _customer(session, payload.customer_id)
    else:
        customer = find_or_create_business(
            session, phone=payload.phone, company=payload.company, contact=payload.contact
        )
    now = utcnow()
    inquiry = Inquiry(
        customer_id=customer.id if customer else None,
        channel=payload.channel,
        company=payload.company or (customer.company if customer else None),
        contact=payload.contact or (customer.name if customer else None),
        phone=normalize_phone(payload.phone) or payload.phone or (customer.phone if customer else None),
        content=payload.content,
        product_codes=payload.product_codes,
        status="new",
        assignee=payload.assignee,
        events=[_event(payload.by, "新询盘")],
        created_at=now,
        updated_at=now,
    )
    session.add(inquiry)
    session.flush()
    return inquiry_detail(inquiry)


@router.get("/inquiries/{inquiry_id}", response_model=InquiryDetail)
def get_inquiry(inquiry_id: int, session: Session = Depends(get_db)) -> dict:
    return inquiry_detail(_inquiry(session, inquiry_id))


@router.patch("/inquiries/{inquiry_id}", response_model=InquiryDetail)
def patch_inquiry(inquiry_id: int, payload: InquiryPatch, session: Session = Depends(get_db)) -> dict:
    inquiry = _inquiry(session, inquiry_id)
    data = payload.model_dump(exclude_unset=True)
    if "content" in data and not data["content"]:
        raise AppError(400, "content_required", "询盘内容不能为空")
    for key, value in data.items():
        if key == "product_codes" and value is None:
            continue
        setattr(inquiry, key, value)
    inquiry.updated_at = utcnow()
    session.flush()
    return inquiry_detail(inquiry)


@router.delete("/inquiries/{inquiry_id}", status_code=204)
def delete_inquiry(inquiry_id: int, session: Session = Depends(get_db)) -> Response:
    session.delete(_inquiry(session, inquiry_id))
    return Response(status_code=204)


@router.post("/inquiries/{inquiry_id}/status", response_model=InquiryDetail)
def set_inquiry_status(inquiry_id: int, payload: InquiryStatusIn, session: Session = Depends(get_db)) -> dict:
    inquiry = _inquiry(session, inquiry_id)
    change_inquiry_status(inquiry, payload.status, by=payload.by, reason=payload.reason)
    session.flush()
    return inquiry_detail(inquiry)


@router.post("/inquiries/{inquiry_id}/notes", response_model=InquiryDetail)
def post_inquiry_note(inquiry_id: int, payload: NoteIn, session: Session = Depends(get_db)) -> dict:
    inquiry = _inquiry(session, inquiry_id)
    add_inquiry_note(inquiry, payload.by, payload.note)
    session.flush()
    return inquiry_detail(inquiry)


@router.get("/inquiries/{inquiry_id}/products")
def inquiry_products(inquiry_id: int, session: Session = Depends(get_db)) -> dict:
    """询盘旁边的资料栏：提到的商品的资料卡（卖点、参数、FAQ）和各店铺售价库存。"""
    inquiry = _inquiry(session, inquiry_id)
    cards = []
    missing = []
    for code in inquiry.product_codes:
        card = session.scalar(select(ProductCard).where(ProductCard.product_code == code))
        if card is None:
            listed = session.scalar(select(Product.id).where(Product.product_code == code))
            missing.append({"product_code": code, "listed": listed is not None})
        else:
            cards.append(card_out(session, card).model_dump(mode="json"))
    return {"cards": cards, "missing": missing}


@router.post("/inquiries/{inquiry_id}/quotes", response_model=QuoteOut, status_code=201)
def create_quote(inquiry_id: int, payload: QuoteIn, session: Session = Depends(get_db)) -> dict:
    inquiry = _inquiry(session, inquiry_id)
    if inquiry.status in {"won", "lost"}:
        raise AppError(409, "inquiry_closed", "询盘已经关闭，不能再报价")
    items, total = quote_items([item.model_dump() for item in payload.items])
    quote = Quote(
        inquiry_id=inquiry.id,
        number=next_quote_number(session),
        items=items,
        total=total,
        valid_until=payload.valid_until or today() + timedelta(days=QUOTE_VALID_DAYS),
        terms=payload.terms,
        created_by=payload.by,
        created_at=utcnow(),
    )
    inquiry.quotes.append(quote)
    text = f"报价单 {quote.number}，合计 {total:.2f} 元"
    if inquiry.status in {"new", "replied"}:
        text = f"{INQUIRY_LABELS[inquiry.status]} → 已报价，" + text
        inquiry.status = "quoted"
    inquiry.events = [*inquiry.events, _event(payload.by, text)]
    inquiry.updated_at = utcnow()
    session.flush()
    return quote_out(quote)


@router.get("/quotes/{quote_id}", response_model=QuoteOut)
def get_quote(quote_id: int, session: Session = Depends(get_db)) -> dict:
    return quote_out(_quote(session, quote_id))


@router.get("/quotes/{quote_id}/document")
def get_quote_document(quote_id: int, session: Session = Depends(get_db)) -> dict:
    quote = _quote(session, quote_id)
    return {"number": quote.number, "markdown": quote_document(quote)}


def inquiry_out(inquiry: Inquiry) -> dict:
    stale = inquiry.status in OPEN_INQUIRY and utcnow() - _aware(inquiry.updated_at) > timedelta(
        days=INQUIRY_STALE_DAYS
    )
    return {
        "id": inquiry.id,
        "customer_id": inquiry.customer_id,
        "channel": inquiry.channel,
        "company": inquiry.company,
        "contact": inquiry.contact,
        "phone": inquiry.phone,
        "content": inquiry.content,
        "product_codes": inquiry.product_codes,
        "status": inquiry.status,
        "assignee": inquiry.assignee,
        "lost_reason": inquiry.lost_reason,
        "note": inquiry.note,
        "stale": stale,
        "quote_count": len(inquiry.quotes),
        "created_at": inquiry.created_at,
        "updated_at": inquiry.updated_at,
    }


def inquiry_detail(inquiry: Inquiry) -> dict:
    return {**inquiry_out(inquiry), "events": inquiry.events, "quotes": [quote_out(q) for q in inquiry.quotes]}


def quote_out(quote: Quote) -> dict:
    return {
        "id": quote.id,
        "inquiry_id": quote.inquiry_id,
        "number": quote.number,
        "items": quote.items,
        "total": money(quote.total),
        "valid_until": quote.valid_until,
        "terms": quote.terms,
        "created_by": quote.created_by,
        "created_at": quote.created_at,
    }


def _inquiry(session: Session, inquiry_id: int) -> Inquiry:
    inquiry = session.get(Inquiry, inquiry_id)
    if inquiry is None:
        raise AppError(404, "inquiry_not_found", "询盘不存在")
    return inquiry


def _quote(session: Session, quote_id: int) -> Quote:
    quote = session.get(Quote, quote_id)
    if quote is None:
        raise AppError(404, "quote_not_found", "报价单不存在")
    return quote


# ---- 批量跟进 ----


@router.get("/followups", response_model=list[FollowupOut])
def list_followups(status: str | None = None, session: Session = Depends(get_db)) -> list[dict]:
    stmt = select(Followup).options(selectinload(Followup.targets)).order_by(Followup.id.desc())
    if status:
        stmt = stmt.where(Followup.status == status)
    return [followup_out(item) for item in session.scalars(stmt)]


@router.post("/followups", response_model=FollowupDetail, status_code=201)
def create_followup(payload: FollowupIn, session: Session = Depends(get_db)) -> dict:
    now = utcnow()
    followup = Followup(
        name=payload.name,
        segment=payload.segment,
        channel=payload.channel,
        template=payload.template,
        status="draft",
        created_by=payload.by,
        created_at=now,
        updated_at=now,
    )
    session.add(followup)
    build_targets(session, followup)
    session.flush()
    return followup_detail(followup)


@router.get("/followups/{followup_id}", response_model=FollowupDetail)
def get_followup(followup_id: int, session: Session = Depends(get_db)) -> dict:
    return followup_detail(_followup(session, followup_id))


@router.patch("/followups/{followup_id}", response_model=FollowupDetail)
def patch_followup(followup_id: int, payload: FollowupPatch, session: Session = Depends(get_db)) -> dict:
    followup = _followup(session, followup_id)
    if followup.status != "draft":
        raise AppError(409, "followup_locked", "审核通过后话术不能再改，请取消后重建")
    data = payload.model_dump(exclude_unset=True)
    if data.get("name"):
        followup.name = data["name"]
    if data.get("template") and data["template"] != followup.template:
        followup.template = data["template"]
        rerender_targets(session, followup)
    followup.updated_at = utcnow()
    session.flush()
    return followup_detail(followup)


@router.post("/followups/{followup_id}/approve", response_model=FollowupDetail)
def approve(followup_id: int, payload: ApproveIn, session: Session = Depends(get_db)) -> dict:
    followup = _followup(session, followup_id)
    approve_followup(session, followup, payload.by)
    session.flush()
    return followup_detail(followup)


@router.post("/followups/{followup_id}/cancel", response_model=FollowupDetail)
def cancel(followup_id: int, session: Session = Depends(get_db)) -> dict:
    followup = _followup(session, followup_id)
    if followup.status not in {"draft", "approved"}:
        raise AppError(409, "invalid_transition", "已完成或已取消的跟进任务不能取消")
    followup.status = "cancelled"
    followup.updated_at = utcnow()
    session.flush()
    return followup_detail(followup)


@router.delete("/followups/{followup_id}", status_code=204)
def delete_followup(followup_id: int, session: Session = Depends(get_db)) -> Response:
    followup = _followup(session, followup_id)
    if followup.status != "draft":
        raise AppError(409, "followup_locked", "只有草稿可以删除")
    session.delete(followup)
    return Response(status_code=204)


@router.get("/followups/{followup_id}/export")
def export_followup(followup_id: int, session: Session = Depends(get_db)) -> Response:
    followup = _followup(session, followup_id)
    if followup.status == "draft":
        raise AppError(409, "not_approved", "审核通过后才能导出名单")
    stamp = utcnow().astimezone(SHANGHAI).strftime("%Y%m%d-%H%M")
    return Response(
        content=export_targets(followup),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''followup-{followup.id}-{stamp}.csv"},
    )


@router.patch("/followup-targets/{target_id}", response_model=FollowupDetail)
def patch_target(target_id: int, payload: TargetPatch, session: Session = Depends(get_db)) -> dict:
    target = session.get(FollowupTarget, target_id)
    if target is None:
        raise AppError(404, "target_not_found", "跟进对象不存在")
    followup = target.followup
    mark_target(followup, target, payload.status, payload.note)
    session.flush()
    return followup_detail(followup)


def followup_out(followup: Followup) -> dict:
    counts = {"pending": 0, "sent": 0, "skipped": 0}
    for target in followup.targets:
        counts[target.status] += 1
    return {
        "id": followup.id,
        "name": followup.name,
        "segment": followup.segment,
        "channel": followup.channel,
        "template": followup.template,
        "status": followup.status,
        "created_by": followup.created_by,
        "approved_by": followup.approved_by,
        "counts": counts,
        "created_at": followup.created_at,
        "updated_at": followup.updated_at,
    }


def followup_detail(followup: Followup) -> dict:
    return {
        **followup_out(followup),
        "targets": [
            {
                "id": t.id,
                "customer_id": t.customer_id,
                "customer_name": t.customer.name,
                "phone": t.customer.phone,
                "wecom_added": t.customer.wecom_added,
                "message": t.message,
                "status": t.status,
                "sent_at": t.sent_at,
                "note": t.note,
            }
            for t in followup.targets
        ],
    }


def _followup(session: Session, followup_id: int) -> Followup:
    followup = session.get(Followup, followup_id)
    if followup is None:
        raise AppError(404, "followup_not_found", "跟进任务不存在")
    return followup


__all__ = ["router", "CHANNEL_LABELS"]
