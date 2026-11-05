"""C07 安装：订单、安装工单；导入记录允许 orders。

Revision ID: c07
Revises: c05
Create Date: 2026-11-05
"""

from alembic import op
import sqlalchemy as sa

revision = "c07"
down_revision = "c05"
branch_labels = None
depends_on = None


def _replace_kind_check(condition: str) -> None:
    # SQLite 不反射 CHECK，批量重建表时旧约束自然丢掉，只需加新的；其他数据库先删后加。
    if op.get_bind().dialect.name == "sqlite":
        with op.batch_alter_table("import_runs", recreate="always") as batch:
            batch.create_check_constraint("ck_import_runs_kind", condition)
    else:
        op.drop_constraint("ck_import_runs_kind", "import_runs", type_="check")
        op.create_check_constraint("ck_import_runs_kind", "import_runs", condition)


def upgrade() -> None:
    _replace_kind_check("kind IN ('products', 'metrics', 'ad_spend', 'orders')")
    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("shop_id", sa.Integer(), sa.ForeignKey("shops.id"), nullable=False),
        sa.Column("order_no", sa.String(length=64), nullable=False),
        sa.Column("paid_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("sku", sa.String(length=128), nullable=False),
        sa.Column("product_code", sa.String(length=128), nullable=True),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("buyer_name", sa.String(length=100), nullable=True),
        sa.Column("phone", sa.String(length=40), nullable=True),
        sa.Column("address", sa.String(length=500), nullable=True),
        sa.Column("remark", sa.Text(), nullable=True),
        sa.Column("platform_status", sa.String(length=50), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("shop_id", "order_no", "sku", name="uq_orders_shop_no_sku"),
    )
    op.create_index("ix_orders_shop_id", "orders", ["shop_id"])
    op.create_index("ix_orders_paid_at", "orders", ["paid_at"])
    op.create_table(
        "install_orders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("shop_id", sa.Integer(), sa.ForeignKey("shops.id"), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("provider_ref", sa.String(length=100), nullable=True),
        sa.Column("appointment_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("engineer", sa.String(length=100), nullable=True),
        sa.Column("exception_reason", sa.Text(), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("events", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("order_id", name="uq_install_orders_order"),
        sa.CheckConstraint(
            "status IN ('pending', 'booked', 'done', 'exception', 'cancelled')", name="ck_install_orders_status"
        ),
    )
    op.create_index("ix_install_orders_status", "install_orders", ["status"])


def downgrade() -> None:
    op.drop_index("ix_install_orders_status", table_name="install_orders")
    op.drop_table("install_orders")
    op.drop_index("ix_orders_paid_at", table_name="orders")
    op.drop_index("ix_orders_shop_id", table_name="orders")
    op.drop_table("orders")
    _replace_kind_check("kind IN ('products', 'metrics', 'ad_spend')")
