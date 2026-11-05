"""商品工作台的表。字段名与任务卡一致，语句保持 PostgreSQL 可迁移。"""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


def utcnow() -> datetime:
    from datetime import timezone

    return datetime.now(timezone.utc)


class Shop(Base):
    __tablename__ = "shops"
    __table_args__ = (
        CheckConstraint(
            "platform IN ('tmall', 'jd', 'pdd', 'douyin')",
            name="ck_shops_platform",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    platform: Mapped[str] = mapped_column(String(16), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    brand: Mapped[str] = mapped_column(String(200), nullable=False)

    products: Mapped[list["Product"]] = relationship(back_populates="shop")


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        UniqueConstraint("shop_id", "sku", name="uq_products_shop_sku"),
        Index("ix_products_shop_id", "shop_id"),
        Index("ix_products_product_code", "product_code"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    shop_id: Mapped[int] = mapped_column(ForeignKey("shops.id"), nullable=False)
    sku: Mapped[str] = mapped_column(String(128), nullable=False)
    product_code: Mapped[str | None] = mapped_column(String(128))
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    floor_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    stock: Mapped[int] = mapped_column(Integer, nullable=False)
    activity: Mapped[str | None] = mapped_column(String(200))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    shop: Mapped[Shop] = relationship(back_populates="products")
    issues: Mapped[list["Issue"]] = relationship(back_populates="product")


class Rule(Base):
    __tablename__ = "rules"
    __table_args__ = (
        CheckConstraint("kind IN ('below_floor', 'cross_shop_gap', 'low_stock', 'missing_activity')", name="ck_rules_kind"),
        CheckConstraint("level IN ('must', 'warn')", name="ck_rules_level"),
        UniqueConstraint("kind", name="uq_rules_kind"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    kind: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    params: Mapped[dict] = mapped_column(JSON, nullable=False)
    level: Mapped[str] = mapped_column(String(8), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    issues: Mapped[list["Issue"]] = relationship(back_populates="rule")


class Issue(Base):
    __tablename__ = "issues"
    __table_args__ = (
        CheckConstraint("level IN ('must', 'warn')", name="ck_issues_level"),
        CheckConstraint("status IN ('open', 'resolved', 'ignored')", name="ck_issues_status"),
        Index("ix_issues_product_rule_status", "product_id", "rule_id", "status"),
        Index("ix_issues_status", "status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    rule_id: Mapped[int] = mapped_column(ForeignKey("rules.id"), nullable=False)
    level: Mapped[str] = mapped_column(String(8), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False)
    found_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    note: Mapped[str | None] = mapped_column(Text)

    product: Mapped[Product] = relationship(back_populates="issues")
    rule: Mapped[Rule] = relationship(back_populates="issues")


class ImportRun(Base):
    __tablename__ = "import_runs"
    __table_args__ = (
        CheckConstraint(
            "kind IN ('products', 'metrics', 'ad_spend', 'orders')",
            name="ck_import_runs_kind",
        ),
        Index("ix_import_runs_shop_id", "shop_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    file_name: Mapped[str] = mapped_column(String(500), nullable=False)
    shop_id: Mapped[int] = mapped_column(ForeignKey("shops.id"), nullable=False)
    kind: Mapped[str] = mapped_column(String(16), nullable=False, default="products")
    rows_ok: Mapped[int] = mapped_column(Integer, nullable=False)
    rows_failed: Mapped[int] = mapped_column(Integer, nullable=False)
    errors: Mapped[list] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    shop: Mapped[Shop] = relationship()


class DailyMetric(Base):
    __tablename__ = "daily_metrics"
    __table_args__ = (
        UniqueConstraint("date", "shop_id", name="uq_daily_metrics_date_shop"),
        Index("ix_daily_metrics_shop_id", "shop_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    shop_id: Mapped[int] = mapped_column(ForeignKey("shops.id"), nullable=False)
    visitors: Mapped[int] = mapped_column(Integer, nullable=False)
    orders: Mapped[int] = mapped_column(Integer, nullable=False)
    sales_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    refund_amount: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    shop: Mapped[Shop] = relationship()


class AdSpend(Base):
    __tablename__ = "ad_spend"
    __table_args__ = (
        UniqueConstraint("date", "shop_id", "tool", "campaign", name="uq_ad_spend_day_plan"),
        CheckConstraint(
            "tool IN ('万相台', '京准通', '多多推广', '巨量千川', '其他')",
            name="ck_ad_spend_tool",
        ),
        Index("ix_ad_spend_shop_id", "shop_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    shop_id: Mapped[int] = mapped_column(ForeignKey("shops.id"), nullable=False)
    tool: Mapped[str] = mapped_column(String(32), nullable=False)
    campaign: Mapped[str] = mapped_column(String(200), nullable=False)
    spend: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    gmv: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    clicks: Mapped[int | None] = mapped_column(Integer)
    impressions: Mapped[int | None] = mapped_column(Integer)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    shop: Mapped[Shop] = relationship()


class AdRule(Base):
    __tablename__ = "ad_rules"
    __table_args__ = (
        CheckConstraint(
            "kind IN ('roi_below', 'spend_over_cap', 'spend_spike')",
            name="ck_ad_rules_kind",
        ),
        CheckConstraint("level IN ('must', 'warn')", name="ck_ad_rules_level"),
        UniqueConstraint("kind", name="uq_ad_rules_kind"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    kind: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    params: Mapped[dict] = mapped_column(JSON, nullable=False)
    level: Mapped[str] = mapped_column(String(8), nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class Alert(Base):
    __tablename__ = "alerts"
    __table_args__ = (
        CheckConstraint(
            "kind IN ('roi_below', 'spend_over_cap', 'spend_spike')",
            name="ck_alerts_kind",
        ),
        CheckConstraint("level IN ('must', 'warn')", name="ck_alerts_level"),
        CheckConstraint("status IN ('open', 'resolved', 'ignored')", name="ck_alerts_status"),
        Index("ix_alerts_shop_status", "shop_id", "status"),
        Index("ix_alerts_status", "status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    kind: Mapped[str] = mapped_column(String(32), nullable=False)
    level: Mapped[str] = mapped_column(String(8), nullable=False)
    shop_id: Mapped[int] = mapped_column(ForeignKey("shops.id"), nullable=False)
    tool: Mapped[str | None] = mapped_column(String(32))
    campaign: Mapped[str | None] = mapped_column(String(200))
    date: Mapped[date] = mapped_column(Date, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False)
    found_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    note: Mapped[str | None] = mapped_column(Text)

    shop: Mapped[Shop] = relationship()


# ---- C04 品牌活动：资料与活动 ----

CAMPAIGN_KINDS = ("holiday", "big_promo", "new_launch", "offline", "other")
CAMPAIGN_STATUSES = ("planning", "running", "ended", "cancelled")
TASK_KINDS = ("copy", "design", "ads", "member", "other")


class BrandGuide(Base):
    __tablename__ = "brand_guides"
    __table_args__ = (UniqueConstraint("brand", name="uq_brand_guides_brand"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    brand: Mapped[str] = mapped_column(String(200), nullable=False)
    tone: Mapped[str | None] = mapped_column(Text)
    colors: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    fonts: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    logo_rules: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class BannedWord(Base):
    __tablename__ = "banned_words"
    __table_args__ = (
        UniqueConstraint("word", name="uq_banned_words_word"),
        CheckConstraint("level IN ('must', 'warn')", name="ck_banned_words_level"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    word: Mapped[str] = mapped_column(String(100), nullable=False)
    level: Mapped[str] = mapped_column(String(8), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    suggestion: Mapped[str | None] = mapped_column(String(200))
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class ProductCard(Base):
    __tablename__ = "product_cards"
    __table_args__ = (UniqueConstraint("product_code", name="uq_product_cards_code"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_code: Mapped[str] = mapped_column(String(128), nullable=False)
    brand: Mapped[str] = mapped_column(String(200), nullable=False)
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    selling_points: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    specs: Mapped[str | None] = mapped_column(Text)
    faq: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    install_required: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    notes: Mapped[str | None] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Campaign(Base):
    __tablename__ = "campaigns"
    __table_args__ = (
        CheckConstraint(
            "kind IN ('holiday', 'big_promo', 'new_launch', 'offline', 'other')",
            name="ck_campaigns_kind",
        ),
        CheckConstraint(
            "status IN ('planning', 'running', 'ended', 'cancelled')",
            name="ck_campaigns_status",
        ),
        CheckConstraint("end_date >= start_date", name="ck_campaigns_dates"),
        Index("ix_campaigns_dates", "start_date", "end_date"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    brand: Mapped[str] = mapped_column(String(200), nullable=False)
    kind: Mapped[str] = mapped_column(String(16), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="planning")
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    goal: Mapped[str | None] = mapped_column(Text)
    target_sales: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    budget: Mapped[Decimal | None] = mapped_column(Numeric(14, 2))
    product_codes: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    tasks: Mapped[list["CampaignTask"]] = relationship(
        back_populates="campaign", cascade="all, delete-orphan", order_by="CampaignTask.id"
    )


class CampaignTask(Base):
    __tablename__ = "campaign_tasks"
    __table_args__ = (
        CheckConstraint("kind IN ('copy', 'design', 'ads', 'member', 'other')", name="ck_campaign_tasks_kind"),
        Index("ix_campaign_tasks_campaign_id", "campaign_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    kind: Mapped[str] = mapped_column(String(16), nullable=False)
    owner: Mapped[str | None] = mapped_column(String(100))
    due_date: Mapped[date | None] = mapped_column(Date)
    done: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    note: Mapped[str | None] = mapped_column(Text)

    campaign: Mapped[Campaign] = relationship(back_populates="tasks")


# ---- C05 品牌活动：内容（稿件、平台版本、版本历史、审稿批注）----

CONTENT_STATUSES = ("draft", "in_review", "approved", "rejected", "published")
CONTENT_KINDS = ("article", "note", "video_script", "poster_copy", "product_copy")
PLATFORMS = ("wechat", "xiaohongshu", "douyin", "weibo", "tmall", "jd", "pdd", "other")


class Content(Base):
    __tablename__ = "contents"
    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'in_review', 'approved', 'rejected', 'published')", name="ck_contents_status"
        ),
        CheckConstraint(
            "kind IN ('article', 'note', 'video_script', 'poster_copy', 'product_copy')", name="ck_contents_kind"
        ),
        Index("ix_contents_status", "status"),
        Index("ix_contents_campaign_id", "campaign_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    brand: Mapped[str] = mapped_column(String(200), nullable=False)
    kind: Mapped[str] = mapped_column(String(16), nullable=False)
    campaign_id: Mapped[int | None] = mapped_column(ForeignKey("campaigns.id", ondelete="SET NULL"))
    body: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="draft")
    author: Mapped[str | None] = mapped_column(String(100))
    reviewer: Mapped[str | None] = mapped_column(String(100))
    planned_at: Mapped[date | None] = mapped_column(Date)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    variants: Mapped[list["ContentVariant"]] = relationship(
        back_populates="content", cascade="all, delete-orphan", order_by="ContentVariant.id"
    )
    versions: Mapped[list["ContentVersion"]] = relationship(
        back_populates="content", cascade="all, delete-orphan", order_by="ContentVersion.version"
    )
    comments: Mapped[list["ContentComment"]] = relationship(
        back_populates="content", cascade="all, delete-orphan", order_by="ContentComment.id"
    )


class ContentVariant(Base):
    __tablename__ = "content_variants"
    __table_args__ = (
        UniqueConstraint("content_id", "platform", name="uq_content_variants_platform"),
        CheckConstraint(
            "platform IN ('wechat', 'xiaohongshu', 'douyin', 'weibo', 'tmall', 'jd', 'pdd', 'other')",
            name="ck_content_variants_platform",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content_id: Mapped[int] = mapped_column(ForeignKey("contents.id", ondelete="CASCADE"), nullable=False)
    platform: Mapped[str] = mapped_column(String(16), nullable=False)
    title: Mapped[str | None] = mapped_column(String(300))
    body: Mapped[str] = mapped_column(Text, nullable=False, default="")
    published_url: Mapped[str | None] = mapped_column(String(1000))

    content: Mapped[Content] = relationship(back_populates="variants")


class ContentVersion(Base):
    __tablename__ = "content_versions"
    __table_args__ = (UniqueConstraint("content_id", "version", name="uq_content_versions_version"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content_id: Mapped[int] = mapped_column(ForeignKey("contents.id", ondelete="CASCADE"), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)
    author: Mapped[str | None] = mapped_column(String(100))
    note: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    content: Mapped[Content] = relationship(back_populates="versions")


class ContentComment(Base):
    __tablename__ = "content_comments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content_id: Mapped[int] = mapped_column(ForeignKey("contents.id", ondelete="CASCADE"), nullable=False)
    platform: Mapped[str | None] = mapped_column(String(16))
    quote: Mapped[str | None] = mapped_column(Text)
    start: Mapped[int | None] = mapped_column(Integer)
    end: Mapped[int | None] = mapped_column(Integer)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    author: Mapped[str | None] = mapped_column(String(100))
    kind: Mapped[str] = mapped_column(String(16), nullable=False, default="comment")
    resolved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    content: Mapped[Content] = relationship(back_populates="comments")


# ---- C07 安装：订单和安装工单 ----

INSTALL_STATUSES = ("pending", "booked", "done", "exception", "cancelled")


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        UniqueConstraint("shop_id", "order_no", "sku", name="uq_orders_shop_no_sku"),
        Index("ix_orders_shop_id", "shop_id"),
        Index("ix_orders_paid_at", "paid_at"),
        Index("ix_orders_customer_id", "customer_id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    shop_id: Mapped[int] = mapped_column(ForeignKey("shops.id"), nullable=False)
    order_no: Mapped[str] = mapped_column(String(64), nullable=False)
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    sku: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    product_code: Mapped[str | None] = mapped_column(String(128))
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    buyer_name: Mapped[str | None] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(40))
    address: Mapped[str | None] = mapped_column(String(500))
    remark: Mapped[str | None] = mapped_column(Text)
    platform_status: Mapped[str | None] = mapped_column(String(50))
    customer_id: Mapped[int | None] = mapped_column(ForeignKey("customers.id", ondelete="SET NULL"))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    shop: Mapped[Shop] = relationship()


class InstallOrder(Base):
    __tablename__ = "install_orders"
    __table_args__ = (
        UniqueConstraint("order_id", name="uq_install_orders_order"),
        CheckConstraint(
            "status IN ('pending', 'booked', 'done', 'exception', 'cancelled')", name="ck_install_orders_status"
        ),
        Index("ix_install_orders_status", "status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    shop_id: Mapped[int] = mapped_column(ForeignKey("shops.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending")
    provider: Mapped[str] = mapped_column(String(50), nullable=False, default="啄木鸟")
    provider_ref: Mapped[str | None] = mapped_column(String(100))
    appointment_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    engineer: Mapped[str | None] = mapped_column(String(100))
    exception_reason: Mapped[str | None] = mapped_column(Text)
    note: Mapped[str | None] = mapped_column(Text)
    events: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    order: Mapped[Order] = relationship()
    shop: Mapped[Shop] = relationship()


# ---- C08 客户：客户档案、询盘、报价、会员跟进 ----

INQUIRY_STATUSES = ("new", "replied", "quoted", "won", "lost")
INQUIRY_CHANNELS = ("wecom", "phone", "tmall", "jd", "pdd", "douyin", "email", "other")
FOLLOWUP_CHANNELS = ("wecom", "platform", "sms", "phone")


class Customer(Base):
    __tablename__ = "customers"
    __table_args__ = (
        UniqueConstraint("phone", name="uq_customers_phone"),
        CheckConstraint("kind IN ('member', 'business')", name="ck_customers_kind"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    kind: Mapped[str] = mapped_column(String(16), nullable=False, default="member")
    name: Mapped[str | None] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(40))
    company: Mapped[str | None] = mapped_column(String(200))
    wecom_added: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    tags: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    note: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Inquiry(Base):
    __tablename__ = "inquiries"
    __table_args__ = (
        CheckConstraint("status IN ('new', 'replied', 'quoted', 'won', 'lost')", name="ck_inquiries_status"),
        CheckConstraint(
            "channel IN ('wecom', 'phone', 'tmall', 'jd', 'pdd', 'douyin', 'email', 'other')",
            name="ck_inquiries_channel",
        ),
        Index("ix_inquiries_status", "status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    customer_id: Mapped[int | None] = mapped_column(ForeignKey("customers.id", ondelete="SET NULL"))
    channel: Mapped[str] = mapped_column(String(16), nullable=False)
    company: Mapped[str | None] = mapped_column(String(200))
    contact: Mapped[str | None] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(40))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    product_codes: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="new")
    assignee: Mapped[str | None] = mapped_column(String(100))
    lost_reason: Mapped[str | None] = mapped_column(Text)
    note: Mapped[str | None] = mapped_column(Text)
    events: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    customer: Mapped[Customer | None] = relationship()
    quotes: Mapped[list["Quote"]] = relationship(
        back_populates="inquiry", cascade="all, delete-orphan", order_by="Quote.id"
    )


class Quote(Base):
    __tablename__ = "quotes"
    __table_args__ = (UniqueConstraint("number", name="uq_quotes_number"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    inquiry_id: Mapped[int] = mapped_column(ForeignKey("inquiries.id", ondelete="CASCADE"), nullable=False)
    number: Mapped[str] = mapped_column(String(40), nullable=False)
    items: Mapped[list] = mapped_column(JSON, nullable=False)
    total: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    valid_until: Mapped[date | None] = mapped_column(Date)
    terms: Mapped[str | None] = mapped_column(Text)
    created_by: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    inquiry: Mapped[Inquiry] = relationship(back_populates="quotes")


class Followup(Base):
    __tablename__ = "followups"
    __table_args__ = (
        CheckConstraint("status IN ('draft', 'approved', 'done', 'cancelled')", name="ck_followups_status"),
        CheckConstraint("channel IN ('wecom', 'platform', 'sms', 'phone')", name="ck_followups_channel"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    segment: Mapped[str] = mapped_column(String(32), nullable=False)
    channel: Mapped[str] = mapped_column(String(16), nullable=False)
    template: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="draft")
    created_by: Mapped[str | None] = mapped_column(String(100))
    approved_by: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    targets: Mapped[list["FollowupTarget"]] = relationship(
        back_populates="followup", cascade="all, delete-orphan", order_by="FollowupTarget.id"
    )


class FollowupTarget(Base):
    __tablename__ = "followup_targets"
    __table_args__ = (
        CheckConstraint("status IN ('pending', 'sent', 'skipped')", name="ck_followup_targets_status"),
        UniqueConstraint("followup_id", "customer_id", name="uq_followup_targets_customer"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    followup_id: Mapped[int] = mapped_column(ForeignKey("followups.id", ondelete="CASCADE"), nullable=False)
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="pending")
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    note: Mapped[str | None] = mapped_column(Text)

    followup: Mapped[Followup] = relationship(back_populates="targets")
    customer: Mapped[Customer] = relationship()


# ---- C09 设计：设计需求单、素材（参考图、候选稿、定稿、素材库）、图上批注 ----

DESIGN_KINDS = ("main_image", "detail_page", "poster", "banner", "video_cover", "other")
DESIGN_STATUSES = ("open", "in_progress", "reviewing", "done", "cancelled")
ASSET_ROLES = ("reference", "candidate", "final", "library", "material")


class DesignRequest(Base):
    __tablename__ = "design_requests"
    __table_args__ = (
        CheckConstraint(
            "kind IN ('main_image', 'detail_page', 'poster', 'banner', 'video_cover', 'other')",
            name="ck_design_requests_kind",
        ),
        CheckConstraint(
            "status IN ('open', 'in_progress', 'reviewing', 'done', 'cancelled')", name="ck_design_requests_status"
        ),
        Index("ix_design_requests_status", "status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    kind: Mapped[str] = mapped_column(String(16), nullable=False)
    brand: Mapped[str] = mapped_column(String(200), nullable=False)
    campaign_id: Mapped[int | None] = mapped_column(ForeignKey("campaigns.id", ondelete="SET NULL"))
    product_code: Mapped[str | None] = mapped_column(String(128))
    sizes: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    copy_text: Mapped[str | None] = mapped_column(Text)
    brief: Mapped[str | None] = mapped_column(Text)
    due_date: Mapped[date | None] = mapped_column(Date)
    requester: Mapped[str | None] = mapped_column(String(100))
    assignee: Mapped[str | None] = mapped_column(String(100))
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="open")
    round: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    events: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    campaign: Mapped[Campaign | None] = relationship()


class Asset(Base):
    __tablename__ = "assets"
    __table_args__ = (
        CheckConstraint(
            "role IN ('reference', 'candidate', 'final', 'library', 'material')", name="ck_assets_role"
        ),
        CheckConstraint("source IN ('upload', 'ai')", name="ck_assets_source"),
        Index("ix_assets_request_id", "request_id"),
        Index("ix_assets_role", "role"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    request_id: Mapped[int | None] = mapped_column(ForeignKey("design_requests.id", ondelete="SET NULL"))
    role: Mapped[str] = mapped_column(String(16), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_path: Mapped[str] = mapped_column(String(255), nullable=False)
    mime: Mapped[str] = mapped_column(String(100), nullable=False)
    size: Mapped[int] = mapped_column(Integer, nullable=False)
    sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    width: Mapped[int | None] = mapped_column(Integer)
    height: Mapped[int | None] = mapped_column(Integer)
    brand: Mapped[str | None] = mapped_column(String(200))
    product_code: Mapped[str | None] = mapped_column(String(128))
    campaign_id: Mapped[int | None] = mapped_column(ForeignKey("campaigns.id", ondelete="SET NULL"))
    kind: Mapped[str | None] = mapped_column(String(16))
    tags: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    source: Mapped[str] = mapped_column(String(16), nullable=False, default="upload")
    prompt: Mapped[str | None] = mapped_column(Text)
    round: Mapped[int | None] = mapped_column(Integer)
    label: Mapped[str | None] = mapped_column(String(8))
    note: Mapped[str | None] = mapped_column(Text)
    created_by: Mapped[str | None] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    request: Mapped[DesignRequest | None] = relationship()


class DesignComment(Base):
    __tablename__ = "design_comments"
    __table_args__ = (Index("ix_design_comments_request_id", "request_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    request_id: Mapped[int] = mapped_column(ForeignKey("design_requests.id", ondelete="CASCADE"), nullable=False)
    asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id", ondelete="CASCADE"))
    body: Mapped[str] = mapped_column(Text, nullable=False)
    x: Mapped[float | None] = mapped_column(Float)
    y: Mapped[float | None] = mapped_column(Float)
    author: Mapped[str | None] = mapped_column(String(100))
    resolved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


# ---- C10 短视频：视频项目和分镜 ----

VIDEO_STATUSES = ("draft", "in_review", "approved", "done", "cancelled")
VIDEO_ASPECTS = ("9:16", "16:9", "1:1", "3:4")


class VideoProject(Base):
    __tablename__ = "video_projects"
    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'in_review', 'approved', 'done', 'cancelled')", name="ck_video_projects_status"
        ),
        CheckConstraint("aspect IN ('9:16', '16:9', '1:1', '3:4')", name="ck_video_projects_aspect"),
        Index("ix_video_projects_status", "status"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    brand: Mapped[str] = mapped_column(String(200), nullable=False)
    campaign_id: Mapped[int | None] = mapped_column(ForeignKey("campaigns.id", ondelete="SET NULL"))
    product_code: Mapped[str | None] = mapped_column(String(128))
    platform: Mapped[str | None] = mapped_column(String(16))
    aspect: Mapped[str] = mapped_column(String(8), nullable=False, default="9:16")
    brief: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="draft")
    author: Mapped[str | None] = mapped_column(String(100))
    reviewer: Mapped[str | None] = mapped_column(String(100))
    editor: Mapped[str | None] = mapped_column(String(100))
    bgm_asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id", ondelete="SET NULL"))
    final_asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id", ondelete="SET NULL"))
    events: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    campaign: Mapped[Campaign | None] = relationship()
    shots: Mapped[list["VideoShot"]] = relationship(
        back_populates="project", cascade="all, delete-orphan", order_by="VideoShot.seq"
    )


class VideoShot(Base):
    __tablename__ = "video_shots"
    __table_args__ = (UniqueConstraint("project_id", "seq", name="uq_video_shots_seq"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("video_projects.id", ondelete="CASCADE"), nullable=False)
    seq: Mapped[int] = mapped_column(Integer, nullable=False)
    duration: Mapped[float] = mapped_column(Float, nullable=False)
    visual: Mapped[str | None] = mapped_column(Text)
    voiceover: Mapped[str | None] = mapped_column(Text)
    subtitle: Mapped[str | None] = mapped_column(Text)
    media_asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id", ondelete="SET NULL"))
    voice_asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id", ondelete="SET NULL"))
    note: Mapped[str | None] = mapped_column(Text)

    project: Mapped[VideoProject] = relationship(back_populates="shots")
    media: Mapped[Asset | None] = relationship(foreign_keys=[media_asset_id])
    voice: Mapped[Asset | None] = relationship(foreign_keys=[voice_asset_id])
