"""C08 客户页的请求和响应模型。"""

from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.brand_schemas import _clean, _clean_list, _required
from app.schemas import UtcDateTime

CustomerKind = Literal["member", "business"]
Segment = Literal["new", "repeat", "dormant", "inquiry_open"]
InquiryStatus = Literal["new", "replied", "quoted", "won", "lost"]
InquiryChannel = Literal["wecom", "phone", "tmall", "jd", "pdd", "douyin", "email", "other"]
FollowupChannel = Literal["wecom", "platform", "sms", "phone"]
TargetStatus = Literal["pending", "sent", "skipped"]


class Event(BaseModel):
    at: str
    by: str | None
    text: str


# ---- 客户 ----


class CustomerIn(BaseModel):
    kind: CustomerKind = "business"
    name: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=40)
    company: str | None = Field(default=None, max_length=200)
    wecom_added: bool = False
    tags: list[str] = Field(default_factory=list)
    note: str | None = Field(default=None, max_length=2000)

    _c = field_validator("name", "phone", "company", "note")(lambda cls, v: _clean(v))
    _l = field_validator("tags")(lambda cls, v: _clean_list(v))


class CustomerPatch(BaseModel):
    kind: CustomerKind | None = None
    name: str | None = Field(default=None, max_length=100)
    company: str | None = Field(default=None, max_length=200)
    wecom_added: bool | None = None
    tags: list[str] | None = None
    note: str | None = Field(default=None, max_length=2000)

    _c = field_validator("name", "company", "note")(lambda cls, v: _clean(v))
    _l = field_validator("tags")(lambda cls, v: None if v is None else _clean_list(v))


class CustomerOut(BaseModel):
    id: int
    kind: str
    name: str | None
    phone: str | None
    company: str | None
    wecom_added: bool
    tags: list[str]
    note: str | None
    segments: list[str]
    order_count: int
    total: float
    first_paid_at: UtcDateTime | None
    last_paid_at: UtcDateTime | None
    last_title: str | None
    shops: list[str]
    open_inquiries: int
    created_at: UtcDateTime


class CustomerPage(BaseModel):
    items: list[CustomerOut]
    total: int
    page: int
    page_size: int


class CustomerOrder(BaseModel):
    id: int
    shop_name: str
    order_no: str
    paid_at: UtcDateTime
    title: str
    quantity: int
    amount: float
    platform_status: str | None


class CustomerDetail(CustomerOut):
    orders: list[CustomerOrder]
    inquiries: list["InquiryOut"]


class SegmentCount(BaseModel):
    segment: str
    label: str
    count: int
    rule: str


class SegmentSummary(BaseModel):
    total: int
    members: int
    businesses: int
    wecom_added: int
    segments: list[SegmentCount]
    open_inquiries: int


# ---- 询盘 ----


class InquiryIn(BaseModel):
    channel: InquiryChannel
    content: str = Field(max_length=10000)
    company: str | None = Field(default=None, max_length=200)
    contact: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=40)
    product_codes: list[str] = Field(default_factory=list)
    assignee: str | None = Field(default=None, max_length=100)
    customer_id: int | None = None
    by: str | None = None

    _r = field_validator("content")(lambda cls, v: _required(v))
    _c = field_validator("company", "contact", "phone", "assignee", "by")(lambda cls, v: _clean(v))
    _l = field_validator("product_codes")(lambda cls, v: _clean_list(v))


class InquiryPatch(BaseModel):
    content: str | None = Field(default=None, max_length=10000)
    company: str | None = Field(default=None, max_length=200)
    contact: str | None = Field(default=None, max_length=100)
    phone: str | None = Field(default=None, max_length=40)
    product_codes: list[str] | None = None
    assignee: str | None = Field(default=None, max_length=100)

    _c = field_validator("content", "company", "contact", "phone", "assignee")(lambda cls, v: _clean(v))
    _l = field_validator("product_codes")(lambda cls, v: None if v is None else _clean_list(v))


class InquiryStatusIn(BaseModel):
    status: InquiryStatus
    by: str | None = None
    reason: str | None = None

    _c = field_validator("by", "reason")(lambda cls, v: _clean(v))


class NoteIn(BaseModel):
    note: str = Field(max_length=1000)
    by: str | None = None

    _r = field_validator("note")(lambda cls, v: _required(v))
    _c = field_validator("by")(lambda cls, v: _clean(v))


class QuoteItemIn(BaseModel):
    product_code: str | None = Field(default=None, max_length=128)
    name: str = Field(max_length=500)
    quantity: int = Field(ge=1, le=1_000_000)
    unit_price: float = Field(ge=0, le=100_000_000)
    note: str | None = Field(default=None, max_length=500)

    _r = field_validator("name")(lambda cls, v: _required(v))
    _c = field_validator("product_code", "note")(lambda cls, v: _clean(v))


class QuoteIn(BaseModel):
    items: list[QuoteItemIn] = Field(min_length=1, max_length=200)
    valid_until: date | None = None
    terms: str | None = Field(default=None, max_length=5000)
    by: str | None = None

    _c = field_validator("terms", "by")(lambda cls, v: _clean(v))


class QuoteItemOut(BaseModel):
    product_code: str | None
    name: str
    quantity: int
    unit_price: float
    amount: float
    note: str | None


class QuoteOut(BaseModel):
    id: int
    inquiry_id: int
    number: str
    items: list[QuoteItemOut]
    total: float
    valid_until: date | None
    terms: str | None
    created_by: str | None
    created_at: UtcDateTime


class InquiryOut(BaseModel):
    id: int
    customer_id: int | None
    channel: str
    company: str | None
    contact: str | None
    phone: str | None
    content: str
    product_codes: list[str]
    status: str
    assignee: str | None
    lost_reason: str | None
    note: str | None
    stale: bool
    quote_count: int
    created_at: UtcDateTime
    updated_at: UtcDateTime


class InquiryDetail(InquiryOut):
    events: list[Event]
    quotes: list[QuoteOut]


# ---- 批量跟进 ----


class FollowupIn(BaseModel):
    name: str = Field(max_length=200)
    segment: Segment
    channel: FollowupChannel
    template: str = Field(max_length=2000)
    by: str | None = None

    _r = field_validator("name", "template")(lambda cls, v: _required(v))
    _c = field_validator("by")(lambda cls, v: _clean(v))


class FollowupPatch(BaseModel):
    name: str | None = Field(default=None, max_length=200)
    template: str | None = Field(default=None, max_length=2000)

    _c = field_validator("name", "template")(lambda cls, v: _clean(v))


class ApproveIn(BaseModel):
    by: str | None = None

    _c = field_validator("by")(lambda cls, v: _clean(v))


class TargetPatch(BaseModel):
    status: TargetStatus
    note: str | None = Field(default=None, max_length=500)

    _c = field_validator("note")(lambda cls, v: _clean(v))


class TargetOut(BaseModel):
    id: int
    customer_id: int
    customer_name: str | None
    phone: str | None
    wecom_added: bool
    message: str
    status: str
    sent_at: UtcDateTime | None
    note: str | None


class FollowupOut(BaseModel):
    id: int
    name: str
    segment: str
    channel: str
    template: str
    status: str
    created_by: str | None
    approved_by: str | None
    counts: dict[str, int]
    created_at: UtcDateTime
    updated_at: UtcDateTime


class FollowupDetail(FollowupOut):
    targets: list[TargetOut]


CustomerDetail.model_rebuild()
