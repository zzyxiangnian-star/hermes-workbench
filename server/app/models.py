"""商品工作台的表。字段名与任务卡一致，语句保持 PostgreSQL 可迁移。"""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
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
            "kind IN ('products', 'metrics', 'ad_spend')",
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
