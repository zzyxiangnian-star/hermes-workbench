"""C04 品牌活动：品牌规范、违禁词、商品资料卡、活动单和活动任务。

Revision ID: c04
Revises: c02
Create Date: 2026-11-05
"""

from alembic import op
import sqlalchemy as sa

revision = "c04"
down_revision = "c02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "brand_guides",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("brand", sa.String(length=200), nullable=False),
        sa.Column("tone", sa.Text(), nullable=True),
        sa.Column("colors", sa.JSON(), nullable=False),
        sa.Column("fonts", sa.JSON(), nullable=False),
        sa.Column("logo_rules", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("brand", name="uq_brand_guides_brand"),
    )
    op.create_table(
        "banned_words",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("word", sa.String(length=100), nullable=False),
        sa.Column("level", sa.String(length=8), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("suggestion", sa.String(length=200), nullable=True),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.CheckConstraint("level IN ('must', 'warn')", name="ck_banned_words_level"),
        sa.UniqueConstraint("word", name="uq_banned_words_word"),
    )
    op.create_table(
        "product_cards",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("product_code", sa.String(length=128), nullable=False),
        sa.Column("brand", sa.String(length=200), nullable=False),
        sa.Column("name", sa.String(length=500), nullable=False),
        sa.Column("selling_points", sa.JSON(), nullable=False),
        sa.Column("specs", sa.Text(), nullable=True),
        sa.Column("faq", sa.JSON(), nullable=False),
        sa.Column("install_required", sa.Boolean(), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("product_code", name="uq_product_cards_code"),
    )
    op.create_table(
        "campaigns",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("brand", sa.String(length=200), nullable=False),
        sa.Column("kind", sa.String(length=16), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("goal", sa.Text(), nullable=True),
        sa.Column("target_sales", sa.Numeric(14, 2), nullable=True),
        sa.Column("budget", sa.Numeric(14, 2), nullable=True),
        sa.Column("product_codes", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "kind IN ('holiday', 'big_promo', 'new_launch', 'offline', 'other')",
            name="ck_campaigns_kind",
        ),
        sa.CheckConstraint(
            "status IN ('planning', 'running', 'ended', 'cancelled')",
            name="ck_campaigns_status",
        ),
        sa.CheckConstraint("end_date >= start_date", name="ck_campaigns_dates"),
    )
    op.create_index("ix_campaigns_dates", "campaigns", ["start_date", "end_date"])
    op.create_table(
        "campaign_tasks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("kind", sa.String(length=16), nullable=False),
        sa.Column("owner", sa.String(length=100), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("done", sa.Boolean(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.CheckConstraint("kind IN ('copy', 'design', 'ads', 'member', 'other')", name="ck_campaign_tasks_kind"),
    )
    op.create_index("ix_campaign_tasks_campaign_id", "campaign_tasks", ["campaign_id"])


def downgrade() -> None:
    op.drop_index("ix_campaign_tasks_campaign_id", table_name="campaign_tasks")
    op.drop_table("campaign_tasks")
    op.drop_index("ix_campaigns_dates", table_name="campaigns")
    op.drop_table("campaigns")
    op.drop_table("product_cards")
    op.drop_table("banned_words")
    op.drop_table("brand_guides")
