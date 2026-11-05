"""C09 设计：设计需求单、素材、图上批注。

Revision ID: c09
Revises: c08
Create Date: 2026-11-05
"""

from alembic import op
import sqlalchemy as sa

revision = "c09"
down_revision = "c08"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "design_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("kind", sa.String(length=16), nullable=False),
        sa.Column("brand", sa.String(length=200), nullable=False),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True),
        sa.Column("product_code", sa.String(length=128), nullable=True),
        sa.Column("sizes", sa.JSON(), nullable=False),
        sa.Column("copy_text", sa.Text(), nullable=True),
        sa.Column("brief", sa.Text(), nullable=True),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("requester", sa.String(length=100), nullable=True),
        sa.Column("assignee", sa.String(length=100), nullable=True),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("round", sa.Integer(), nullable=False),
        sa.Column("events", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "kind IN ('main_image', 'detail_page', 'poster', 'banner', 'video_cover', 'other')",
            name="ck_design_requests_kind",
        ),
        sa.CheckConstraint(
            "status IN ('open', 'in_progress', 'reviewing', 'done', 'cancelled')", name="ck_design_requests_status"
        ),
    )
    op.create_index("ix_design_requests_status", "design_requests", ["status"])
    op.create_table(
        "assets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "request_id", sa.Integer(), sa.ForeignKey("design_requests.id", ondelete="SET NULL"), nullable=True
        ),
        sa.Column("role", sa.String(length=16), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("stored_path", sa.String(length=255), nullable=False),
        sa.Column("mime", sa.String(length=100), nullable=False),
        sa.Column("size", sa.Integer(), nullable=False),
        sa.Column("sha256", sa.String(length=64), nullable=False),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("brand", sa.String(length=200), nullable=True),
        sa.Column("product_code", sa.String(length=128), nullable=True),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True),
        sa.Column("kind", sa.String(length=16), nullable=True),
        sa.Column("tags", sa.JSON(), nullable=False),
        sa.Column("source", sa.String(length=16), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=True),
        sa.Column("round", sa.Integer(), nullable=True),
        sa.Column("label", sa.String(length=8), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("role IN ('reference', 'candidate', 'final', 'library')", name="ck_assets_role"),
        sa.CheckConstraint("source IN ('upload', 'ai')", name="ck_assets_source"),
    )
    op.create_index("ix_assets_request_id", "assets", ["request_id"])
    op.create_index("ix_assets_role", "assets", ["role"])
    op.create_table(
        "design_comments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "request_id", sa.Integer(), sa.ForeignKey("design_requests.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("asset_id", sa.Integer(), sa.ForeignKey("assets.id", ondelete="CASCADE"), nullable=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("x", sa.Float(), nullable=True),
        sa.Column("y", sa.Float(), nullable=True),
        sa.Column("author", sa.String(length=100), nullable=True),
        sa.Column("resolved", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_design_comments_request_id", "design_comments", ["request_id"])


def downgrade() -> None:
    op.drop_index("ix_design_comments_request_id", table_name="design_comments")
    op.drop_table("design_comments")
    op.drop_index("ix_assets_role", table_name="assets")
    op.drop_index("ix_assets_request_id", table_name="assets")
    op.drop_table("assets")
    op.drop_index("ix_design_requests_status", table_name="design_requests")
    op.drop_table("design_requests")
