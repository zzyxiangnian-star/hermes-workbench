"""C05 内容：稿件、平台版本、版本历史、审稿批注。

Revision ID: c05
Revises: c04
Create Date: 2026-11-05
"""

from alembic import op
import sqlalchemy as sa

revision = "c05"
down_revision = "c04"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "contents",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=300), nullable=False),
        sa.Column("brand", sa.String(length=200), nullable=False),
        sa.Column("kind", sa.String(length=16), nullable=False),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("author", sa.String(length=100), nullable=True),
        sa.Column("reviewer", sa.String(length=100), nullable=True),
        sa.Column("planned_at", sa.Date(), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "status IN ('draft', 'in_review', 'approved', 'rejected', 'published')", name="ck_contents_status"
        ),
        sa.CheckConstraint(
            "kind IN ('article', 'note', 'video_script', 'poster_copy', 'product_copy')", name="ck_contents_kind"
        ),
    )
    op.create_index("ix_contents_status", "contents", ["status"])
    op.create_index("ix_contents_campaign_id", "contents", ["campaign_id"])
    op.create_table(
        "content_variants",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("content_id", sa.Integer(), sa.ForeignKey("contents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("platform", sa.String(length=16), nullable=False),
        sa.Column("title", sa.String(length=300), nullable=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("published_url", sa.String(length=1000), nullable=True),
        sa.UniqueConstraint("content_id", "platform", name="uq_content_variants_platform"),
        sa.CheckConstraint(
            "platform IN ('wechat', 'xiaohongshu', 'douyin', 'weibo', 'tmall', 'jd', 'pdd', 'other')",
            name="ck_content_variants_platform",
        ),
    )
    op.create_table(
        "content_versions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("content_id", sa.Integer(), sa.ForeignKey("contents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("snapshot", sa.JSON(), nullable=False),
        sa.Column("author", sa.String(length=100), nullable=True),
        sa.Column("note", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("content_id", "version", name="uq_content_versions_version"),
    )
    op.create_table(
        "content_comments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("content_id", sa.Integer(), sa.ForeignKey("contents.id", ondelete="CASCADE"), nullable=False),
        sa.Column("platform", sa.String(length=16), nullable=True),
        sa.Column("quote", sa.Text(), nullable=True),
        sa.Column("start", sa.Integer(), nullable=True),
        sa.Column("end", sa.Integer(), nullable=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("author", sa.String(length=100), nullable=True),
        sa.Column("kind", sa.String(length=16), nullable=False),
        sa.Column("resolved", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("content_comments")
    op.drop_table("content_versions")
    op.drop_table("content_variants")
    op.drop_index("ix_contents_campaign_id", table_name="contents")
    op.drop_index("ix_contents_status", table_name="contents")
    op.drop_table("contents")
