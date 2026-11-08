"""请求和响应模型。金额在 JSON 里用数字，时间用 UTC。"""

from __future__ import annotations

from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field, PlainSerializer, field_validator

Platform = Literal["tmall", "jd", "pdd", "douyin"]
Level = Literal["must", "warn"]
IssueStatus = Literal["open", "resolved", "ignored"]


def _as_utc(value: datetime) -> str:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    else:
        value = value.astimezone(timezone.utc)
    return value.isoformat()


def _as_money(value: Decimal) -> float:
    quantized = Decimal(value).quantize(Decimal("0.01"))
    return float(quantized)


UtcDateTime = Annotated[datetime, PlainSerializer(_as_utc, return_type=str)]
Money = Annotated[Decimal, PlainSerializer(_as_money, return_type=float)]


class APIModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ShopCreate(BaseModel):
    platform: Platform
    name: str
    brand: str

    @field_validator("name", "brand")
    @classmethod
    def not_blank(cls, value: str) -> str:
        text = value.strip()
        if not text:
            raise ValueError("blank")
        return text


class ShopOut(APIModel):
    id: int
    platform: str
    name: str
    brand: str


class ProductOut(APIModel):
    id: int
    shop_id: int
    shop_name: str
    platform: str
    brand: str
    sku: str
    product_code: str | None
    title: str
    price: Money
    floor_price: Money | None
    stock: int
    activity: str | None
    updated_at: UtcDateTime
    open_issue_count: int


class ProductPage(BaseModel):
    items: list[ProductOut]
    total: int
    page: int
    page_size: int


class IssueOut(APIModel):
    id: int
    product_id: int
    rule_id: int
    rule_kind: str
    level: str
    message: str
    status: str
    found_at: UtcDateTime
    resolved_at: UtcDateTime | None
    note: str | None
    shop_id: int
    shop_name: str
    sku: str
    product_code: str | None
    title: str


class IssuePatch(BaseModel):
    status: IssueStatus | None = None
    note: str | None = None

    @field_validator("note")
    @classmethod
    def strip_note(cls, value: str | None) -> str | None:
        if value is None:
            return None
        text = value.strip()
        return text or None


class IssueShopCount(BaseModel):
    shop_id: int
    name: str
    platform: str
    brand: str
    open_count: int


class IssueSummary(BaseModel):
    shops: list[IssueShopCount]
    total_open: int
    must_open: int = 0
    warn_open: int = 0
    products_with_open: int = 0


class RuleOut(APIModel):
    id: int
    kind: str
    name: str
    params: dict[str, Any]
    level: str
    enabled: bool


class RulePatch(BaseModel):
    params: dict[str, Any] | None = None
    enabled: bool | None = None


class RuleRunOut(BaseModel):
    rules_run: int
    opened: int
    updated: int
    resolved: int
    reopened: int = 0
    open_remaining: int


class ImportErrorItem(BaseModel):
    row: int
    reason: str


class ImportRunOut(APIModel):
    id: int
    file_name: str
    shop_id: int
    kind: str
    rows_ok: int
    rows_failed: int
    errors: list[ImportErrorItem]
    created_at: UtcDateTime
    rules: RuleRunOut | None = None


class HealthOut(BaseModel):
    status: str = Field(examples=["ok"])
    version: str = Field(examples=["0.10.0"])


class MetricCompare(BaseModel):
    value: float | int | None
    previous: float | int | None
    change: float | None


class OverviewMetrics(BaseModel):
    visitors: MetricCompare
    orders: MetricCompare
    sales_amount: MetricCompare
    conversion_rate: MetricCompare
    avg_order_value: MetricCompare
    ad_spend: MetricCompare
    ad_gmv: MetricCompare
    roi: MetricCompare


class OverviewOut(BaseModel):
    date: date
    compare_date: date
    shop_id: int | None
    brand: str | None
    open_alerts: int
    metrics: OverviewMetrics


class TrendPoint(BaseModel):
    date: date
    value: float | int | None


class TrendOut(BaseModel):
    metric: str
    days: int
    shop_id: int | None
    points: list[TrendPoint]


class AdSpendOut(BaseModel):
    shop_id: int
    shop_name: str
    tool: str
    campaign: str
    spend: float
    gmv: float
    roi: float | None
    has_alert: bool


class AlertOut(APIModel):
    id: int
    kind: str
    level: str
    shop_id: int
    shop_name: str
    tool: str | None
    campaign: str | None
    date: date
    message: str
    status: str
    found_at: UtcDateTime
    resolved_at: UtcDateTime | None
    note: str | None


class AlertPatch(BaseModel):
    status: IssueStatus | None = None
    note: str | None = None

    @field_validator("note")
    @classmethod
    def strip_note(cls, value: str | None) -> str | None:
        if value is None:
            return None
        text = value.strip()
        return text or None


class AlertShopCount(BaseModel):
    shop_id: int
    name: str
    platform: str
    brand: str
    open_count: int


class AlertSummary(BaseModel):
    shops: list[AlertShopCount]
    total_open: int


class AbnormalShop(BaseModel):
    shop_id: int
    name: str
    platform: str
    brand: str
    open_count: int


class DailyReportOut(BaseModel):
    date: date
    markdown: str
    overview: OverviewOut
    abnormal_shops: list[AbnormalShop]
    open_issue_count: int
    alerts: list[AlertOut]


class DailySendOut(BaseModel):
    date: date
    dry_run: bool
    sent: bool
    targets: list[str]
    markdown: str
