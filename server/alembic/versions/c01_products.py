"""C01 商品、规则、问题和导入记录。

Revision ID: c01
Revises:
Create Date: 2026-11-05
"""

from alembic import op
import sqlalchemy as sa

revision = "c01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "shops",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("platform", sa.String(length=16), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("brand", sa.String(length=200), nullable=False),
        sa.CheckConstraint("platform IN ('tmall', 'jd', 'pdd', 'douyin')", name="ck_shops_platform"),
    )
    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("shop_id", sa.Integer(), sa.ForeignKey("shops.id"), nullable=False),
        sa.Column("sku", sa.String(length=128), nullable=False),
        sa.Column("product_code", sa.String(length=128), nullable=True),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("price", sa.Numeric(12, 2), nullable=False),
        sa.Column("floor_price", sa.Numeric(12, 2), nullable=True),
        sa.Column("stock", sa.Integer(), nullable=False),
        sa.Column("activity", sa.String(length=200), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("shop_id", "sku", name="uq_products_shop_sku"),
    )
    op.create_index("ix_products_shop_id", "products", ["shop_id"])
    op.create_index("ix_products_product_code", "products", ["product_code"])
    op.create_table(
        "rules",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("kind", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("params", sa.JSON(), nullable=False),
        sa.Column("level", sa.String(length=8), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.CheckConstraint(
            "kind IN ('below_floor', 'cross_shop_gap', 'low_stock', 'missing_activity')",
            name="ck_rules_kind",
        ),
        sa.CheckConstraint("level IN ('must', 'warn')", name="ck_rules_level"),
        sa.UniqueConstraint("kind", name="uq_rules_kind"),
    )
    op.create_table(
        "issues",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("rule_id", sa.Integer(), sa.ForeignKey("rules.id"), nullable=False),
        sa.Column("level", sa.String(length=8), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("found_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.CheckConstraint("level IN ('must', 'warn')", name="ck_issues_level"),
        sa.CheckConstraint("status IN ('open', 'resolved', 'ignored')", name="ck_issues_status"),
    )
    op.create_index("ix_issues_product_rule_status", "issues", ["product_id", "rule_id", "status"])
    op.create_index("ix_issues_status", "issues", ["status"])
    op.create_table(
        "import_runs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("file_name", sa.String(length=500), nullable=False),
        sa.Column("shop_id", sa.Integer(), sa.ForeignKey("shops.id"), nullable=False),
        sa.Column("rows_ok", sa.Integer(), nullable=False),
        sa.Column("rows_failed", sa.Integer(), nullable=False),
        sa.Column("errors", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_import_runs_shop_id", "import_runs", ["shop_id"])


def downgrade() -> None:
    op.drop_table("import_runs")
    op.drop_table("issues")
    op.drop_table("rules")
    op.drop_table("products")
    op.drop_table("shops")
