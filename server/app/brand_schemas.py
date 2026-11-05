"""C04 品牌活动的请求和响应模型。"""

from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.schemas import APIModel, Money, UtcDateTime

CampaignKind = Literal["holiday", "big_promo", "new_launch", "offline", "other"]
CampaignStatus = Literal["planning", "running", "ended", "cancelled"]
TaskKind = Literal["copy", "design", "ads", "member", "other"]
Level = Literal["must", "warn"]


def _clean(value: str | None) -> str | None:
    if value is None:
        return None
    text = value.strip()
    return text or None


def _required(value: str) -> str:
    text = value.strip()
    if not text:
        raise ValueError("blank")
    return text


def _clean_list(values: list[str]) -> list[str]:
    return [item.strip() for item in values if item and item.strip()]


# ---- 品牌规范 ----


class BrandGuideIn(BaseModel):
    tone: str | None = None
    colors: list[str] = Field(default_factory=list)
    fonts: list[str] = Field(default_factory=list)
    logo_rules: str | None = None
    notes: str | None = None

    _c = field_validator("tone", "logo_rules", "notes")(lambda cls, v: _clean(v))
    _l = field_validator("colors", "fonts")(lambda cls, v: _clean_list(v))


class BrandGuideOut(APIModel):
    id: int
    brand: str
    tone: str | None
    colors: list[str]
    fonts: list[str]
    logo_rules: str | None
    notes: str | None
    updated_at: UtcDateTime


# ---- 违禁词 ----


class BannedWordIn(BaseModel):
    word: str
    level: Level = "must"
    category: str = "自定义"
    suggestion: str | None = None

    _w = field_validator("word", "category")(lambda cls, v: _required(v))
    _s = field_validator("suggestion")(lambda cls, v: _clean(v))


class BannedWordPatch(BaseModel):
    level: Level | None = None
    category: str | None = None
    suggestion: str | None = None
    enabled: bool | None = None

    _s = field_validator("suggestion")(lambda cls, v: _clean(v))


class BannedWordOut(APIModel):
    id: int
    word: str
    level: str
    category: str
    suggestion: str | None
    enabled: bool


class ComplianceIn(BaseModel):
    text: str = Field(max_length=50000)


class ComplianceHit(BaseModel):
    word: str
    level: str
    category: str
    suggestion: str | None
    positions: list[int]


class ComplianceOut(BaseModel):
    passed: bool
    must_count: int
    warn_count: int
    hits: list[ComplianceHit]


# ---- 商品资料卡 ----


class FaqItem(BaseModel):
    q: str
    a: str


class ProductCardIn(BaseModel):
    product_code: str
    brand: str
    name: str
    selling_points: list[str] = Field(default_factory=list)
    specs: str | None = None
    faq: list[FaqItem] = Field(default_factory=list)
    install_required: bool = False
    notes: str | None = None

    _r = field_validator("product_code", "brand", "name")(lambda cls, v: _required(v))
    _c = field_validator("specs", "notes")(lambda cls, v: _clean(v))
    _l = field_validator("selling_points")(lambda cls, v: _clean_list(v))


class ProductCardPatch(BaseModel):
    brand: str | None = None
    name: str | None = None
    selling_points: list[str] | None = None
    specs: str | None = None
    faq: list[FaqItem] | None = None
    install_required: bool | None = None
    notes: str | None = None

    _c = field_validator("specs", "notes")(lambda cls, v: _clean(v))


class CardListing(BaseModel):
    shop_id: int
    shop_name: str
    platform: str
    sku: str
    price: Money
    stock: int
    activity: str | None


class ProductCardOut(APIModel):
    id: int
    product_code: str
    brand: str
    name: str
    selling_points: list[str]
    specs: str | None
    faq: list[FaqItem]
    install_required: bool
    notes: str | None
    updated_at: UtcDateTime
    listings: list[CardListing] = Field(default_factory=list)


# ---- 活动 ----


class CampaignTaskIn(BaseModel):
    title: str
    kind: TaskKind = "other"
    owner: str | None = None
    due_date: date | None = None
    note: str | None = None

    _t = field_validator("title")(lambda cls, v: _required(v))
    _c = field_validator("owner", "note")(lambda cls, v: _clean(v))


class CampaignTaskPatch(BaseModel):
    title: str | None = None
    kind: TaskKind | None = None
    owner: str | None = None
    due_date: date | None = None
    done: bool | None = None
    note: str | None = None

    _c = field_validator("owner", "note")(lambda cls, v: _clean(v))


class CampaignTaskOut(APIModel):
    id: int
    campaign_id: int
    title: str
    kind: str
    owner: str | None
    due_date: date | None
    done: bool
    note: str | None


class CampaignIn(BaseModel):
    name: str
    brand: str
    kind: CampaignKind = "other"
    start_date: date
    end_date: date
    goal: str | None = None
    target_sales: float | None = Field(default=None, ge=0)
    budget: float | None = Field(default=None, ge=0)
    product_codes: list[str] = Field(default_factory=list)
    use_template: bool = False

    _r = field_validator("name", "brand")(lambda cls, v: _required(v))
    _c = field_validator("goal")(lambda cls, v: _clean(v))
    _l = field_validator("product_codes")(lambda cls, v: _clean_list(v))


class CampaignPatch(BaseModel):
    name: str | None = None
    kind: CampaignKind | None = None
    status: CampaignStatus | None = None
    start_date: date | None = None
    end_date: date | None = None
    goal: str | None = None
    target_sales: float | None = Field(default=None, ge=0)
    budget: float | None = Field(default=None, ge=0)
    product_codes: list[str] | None = None

    _c = field_validator("goal")(lambda cls, v: _clean(v))


class CampaignOut(APIModel):
    id: int
    name: str
    brand: str
    kind: str
    status: str
    phase: str
    start_date: date
    end_date: date
    goal: str | None
    target_sales: Money | None
    budget: Money | None
    product_codes: list[str]
    tasks_total: int
    tasks_done: int
    created_at: UtcDateTime
    updated_at: UtcDateTime


class CampaignDetail(CampaignOut):
    tasks: list[CampaignTaskOut]


class CampaignTemplateOut(BaseModel):
    kind: str
    name: str
    tasks: list[CampaignTaskIn]


class ShopSales(BaseModel):
    shop_id: int
    shop_name: str
    platform: str
    sales_amount: float
    orders: int
    ad_spend: float
    roi: float | None


class ReviewCompare(BaseModel):
    value: float | int | None
    previous: float | int | None
    change: float | None


class CampaignReviewOut(BaseModel):
    campaign_id: int
    name: str
    brand: str
    phase: str
    start_date: date
    end_date: date
    compare_start: date
    compare_end: date
    days: int
    days_with_data: int
    metrics: dict[str, ReviewCompare]
    target_sales: float | None
    target_rate: float | None
    budget: float | None
    budget_rate: float | None
    tasks_total: int
    tasks_done: int
    shops: list[ShopSales]
    markdown: str


# ---- C05 内容 ----

Platform = Literal["wechat", "xiaohongshu", "douyin", "weibo", "tmall", "jd", "pdd", "other"]
ContentKind = Literal["article", "note", "video_script", "poster_copy", "product_copy"]


class VariantIn(BaseModel):
    platform: Platform
    title: str | None = None
    body: str = Field(default="", max_length=50000)

    _c = field_validator("title")(lambda cls, v: _clean(v))


class VariantOut(APIModel):
    platform: str
    title: str | None
    body: str
    published_url: str | None


class ContentIn(BaseModel):
    title: str
    brand: str
    kind: ContentKind = "article"
    campaign_id: int | None = None
    body: str = Field(default="", max_length=50000)
    author: str | None = None
    planned_at: date | None = None
    variants: list[VariantIn] = Field(default_factory=list)
    note: str | None = None

    _r = field_validator("title", "brand")(lambda cls, v: _required(v))
    _c = field_validator("author", "note")(lambda cls, v: _clean(v))


class ContentUpdate(BaseModel):
    title: str | None = None
    kind: ContentKind | None = None
    campaign_id: int | None = None
    body: str | None = Field(default=None, max_length=50000)
    planned_at: date | None = None
    variants: list[VariantIn] | None = None
    author: str | None = None
    note: str | None = None

    _c = field_validator("author", "note")(lambda cls, v: _clean(v))


class ContentOut(BaseModel):
    id: int
    title: str
    brand: str
    kind: str
    campaign_id: int | None
    campaign_name: str | None
    status: str
    author: str | None
    reviewer: str | None
    planned_at: date | None
    published_at: UtcDateTime | None
    version: int
    platforms: list[str]
    open_comments: int
    created_at: UtcDateTime
    updated_at: UtcDateTime


class CommentIn(BaseModel):
    body: str
    platform: Platform | None = None
    quote: str | None = None
    start: int | None = Field(default=None, ge=0)
    end: int | None = Field(default=None, ge=0)
    author: str | None = None

    _r = field_validator("body")(lambda cls, v: _required(v))
    _c = field_validator("author", "quote")(lambda cls, v: _clean(v))


class CommentOut(APIModel):
    id: int
    content_id: int
    platform: str | None
    quote: str | None
    start: int | None
    end: int | None
    body: str
    author: str | None
    kind: str
    resolved: bool
    created_at: UtcDateTime


class CommentPatch(BaseModel):
    resolved: bool


class VersionInfo(APIModel):
    version: int
    author: str | None
    note: str | None
    created_at: UtcDateTime


class ContentDetail(ContentOut):
    body: str
    variants: list[VariantOut]
    comments: list[CommentOut]
    versions: list[VersionInfo]


class ReviewAction(BaseModel):
    by: str | None = None
    note: str | None = None

    _c = field_validator("by", "note")(lambda cls, v: _clean(v))


class PublishAction(BaseModel):
    by: str | None = None
    platform: Platform | None = None
    url: str | None = Field(default=None, max_length=1000)

    _c = field_validator("by", "url")(lambda cls, v: _clean(v))


class PartCompliance(BaseModel):
    platform: str | None
    result: ComplianceOut


class ContentCompliance(BaseModel):
    passed: bool
    must_count: int
    warn_count: int
    parts: list[PartCompliance]


class DiffSegment(BaseModel):
    op: Literal["equal", "insert", "delete"]
    text: str


class ContentDiff(BaseModel):
    content_id: int
    from_version: int
    to_version: int
    platform: str | None
    title_from: str | None
    title_to: str | None
    segments: list[DiffSegment]


class VersionSnapshot(APIModel):
    version: int
    author: str | None
    note: str | None
    created_at: UtcDateTime
    snapshot: dict
