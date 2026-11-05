"""C02 经营数据、投放花费、投放规则和提醒。

Revision ID: c02
Revises: c01
Create Date: 2026-11-05
"""

from alembic import op
import sqlalchemy as sa

revision = "c02"
down_revision = "c01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "import_runs",
        sa.Column("kind", sa.String(length=16), nullable=False, server_default="products"),
    )
    op.create_table(
        "daily_metrics",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("shop_id", sa.Integer(), sa.ForeignKey("shops.id"), nullable=False),
        sa.Column("visitors", sa.Integer(), nullable=False),
        sa.Column("orders", sa.Integer(), nullable=False),
        sa.Column("sales_amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("refund_amount", sa.Numeric(14, 2), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("date", "shop_id", name="uq_daily_metrics_date_shop"),
    )
    op.create_index("ix_daily_metrics_shop_id", "daily_metrics", ["shop_id"])
    op.create_table(
        "ad_spend",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("shop_id", sa.Integer(), sa.ForeignKey("shops.id"), nullable=False),
        sa.Column("tool", sa.String(length=32), nullable=False),
        sa.Column("campaign", sa.String(length=200), nullable=False),
        sa.Column("spend", sa.Numeric(14, 2), nullable=False),
        sa.Column("gmv", sa.Numeric(14, 2), nullable=False),
        sa.Column("clicks", sa.Integer(), nullable=True),
        sa.Column("impressions", sa.Integer(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "tool IN ('万相台', '京准通', '多多推广', '巨量千川', '其他')",
            name="ck_ad_spend_tool",
        ),
        sa.UniqueConstraint("date", "shop_id", "tool", "campaign", name="uq_ad_spend_day_plan"),
    )
    op.create_index("ix_ad_spend_shop_id", "ad_spend", ["shop_id"])
    op.create_table(
        "ad_rules",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("kind", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("params", sa.JSON(), nullable=False),
        sa.Column("level", sa.String(length=8), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.CheckConstraint(
            "kind IN ('roi_below', 'spend_over_cap', 'spend_spike')",
            name="ck_ad_rules_kind",
        ),
        sa.CheckConstraint("level IN ('must', 'warn')", name="ck_ad_rules_level"),
        sa.UniqueConstraint("kind", name="uq_ad_rules_kind"),
    )
    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("kind", sa.String(length=32), nullable=False),
        sa.Column("level", sa.String(length=8), nullable=False),
        sa.Column("shop_id", sa.Integer(), sa.ForeignKey("shops.id"), nullable=False),
        sa.Column("tool", sa.String(length=32), nullable=True),
        sa.Column("campaign", sa.String(length=200), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("found_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.CheckConstraint(
            "kind IN ('roi_below', 'spend_over_cap', 'spend_spike')",
            name="ck_alerts_kind",
        ),
        sa.CheckConstraint("level IN ('must', 'warn')", name="ck_alerts_level"),
        sa.CheckConstraint("status IN ('open', 'resolved', 'ignored')", name="ck_alerts_status"),
    )
    op.create_index("ix_alerts_shop_status", "alerts", ["shop_id", "status"])
    op.create_index("ix_alerts_status", "alerts", ["status"])


def downgrade() -> None:
    op.drop_table("alerts")
    op.drop_table("ad_rules")
    op.drop_table("ad_spend")
    op.drop_table("daily_metrics")
    with op.batch_alter_table("import_runs") as batch:
        batch.drop_column("kind")
