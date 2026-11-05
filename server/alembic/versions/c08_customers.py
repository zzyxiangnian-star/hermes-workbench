"""C08 客户：客户档案、询盘、报价单、会员跟进；订单关联客户。

Revision ID: c08
Revises: c07
Create Date: 2026-11-05
"""

from alembic import op
import sqlalchemy as sa

revision = "c08"
down_revision = "c07"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "customers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("kind", sa.String(length=16), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=True),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("company", sa.String(length=200), nullable=True),
        sa.Column("wecom_added", sa.Boolean(), nullable=False),
        sa.Column("tags", sa.JSON(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("phone", name="uq_customers_phone"),
        sa.CheckConstraint("kind IN ('member', 'business')", name="ck_customers_kind"),
    )
    with op.batch_alter_table("orders") as batch:
        batch.add_column(sa.Column("customer_id", sa.Integer(), nullable=True))
        batch.create_foreign_key("fk_orders_customer", "customers", ["customer_id"], ["id"], ondelete="SET NULL")
        batch.create_index("ix_orders_customer_id", ["customer_id"])
    op.create_table(
        "inquiries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("customers.id", ondelete="SET NULL"), nullable=True),
        sa.Column("channel", sa.String(length=16), nullable=False),
        sa.Column("company", sa.String(length=200), nullable=True),
        sa.Column("contact", sa.String(length=100), nullable=True),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("product_codes", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("assignee", sa.String(length=100), nullable=True),
        sa.Column("lost_reason", sa.Text(), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("events", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("status IN ('new', 'replied', 'quoted', 'won', 'lost')", name="ck_inquiries_status"),
        sa.CheckConstraint(
            "channel IN ('wecom', 'phone', 'tmall', 'jd', 'pdd', 'douyin', 'email', 'other')",
            name="ck_inquiries_channel",
        ),
    )
    op.create_index("ix_inquiries_status", "inquiries", ["status"])
    op.create_table(
        "quotes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("inquiry_id", sa.Integer(), sa.ForeignKey("inquiries.id", ondelete="CASCADE"), nullable=False),
        sa.Column("number", sa.String(length=40), nullable=False),
        sa.Column("items", sa.JSON(), nullable=False),
        sa.Column("total", sa.Numeric(14, 2), nullable=False),
        sa.Column("valid_until", sa.Date(), nullable=True),
        sa.Column("terms", sa.Text(), nullable=True),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("number", name="uq_quotes_number"),
    )
    op.create_table(
        "followups",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("segment", sa.String(length=32), nullable=False),
        sa.Column("channel", sa.String(length=16), nullable=False),
        sa.Column("template", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("approved_by", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("status IN ('draft', 'approved', 'done', 'cancelled')", name="ck_followups_status"),
        sa.CheckConstraint("channel IN ('wecom', 'platform', 'sms', 'phone')", name="ck_followups_channel"),
    )
    op.create_table(
        "followup_targets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("followup_id", sa.Integer(), sa.ForeignKey("followups.id", ondelete="CASCADE"), nullable=False),
        sa.Column("customer_id", sa.Integer(), sa.ForeignKey("customers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.CheckConstraint("status IN ('pending', 'sent', 'skipped')", name="ck_followup_targets_status"),
        sa.UniqueConstraint("followup_id", "customer_id", name="uq_followup_targets_customer"),
    )


def downgrade() -> None:
    op.drop_table("followup_targets")
    op.drop_table("followups")
    op.drop_table("quotes")
    op.drop_index("ix_inquiries_status", table_name="inquiries")
    op.drop_table("inquiries")
    with op.batch_alter_table("orders") as batch:
        batch.drop_index("ix_orders_customer_id")
        batch.drop_constraint("fk_orders_customer", type_="foreignkey")
        batch.drop_column("customer_id")
    op.drop_table("customers")
