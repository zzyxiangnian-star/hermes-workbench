"""C10 短视频：视频项目、分镜；素材允许 material（视频用的画面和配音）。

Revision ID: c10
Revises: c09
Create Date: 2026-11-05
"""

from alembic import op
import sqlalchemy as sa

revision = "c10"
down_revision = "c09"
branch_labels = None
depends_on = None


def _replace_role_check(condition: str) -> None:
    # SQLite 不反射 CHECK，批量重建表时旧约束自然丢掉，只需加新的；其他数据库先删后加。
    if op.get_bind().dialect.name == "sqlite":
        with op.batch_alter_table("assets", recreate="always") as batch:
            batch.create_check_constraint("ck_assets_role", condition)
    else:
        op.drop_constraint("ck_assets_role", "assets", type_="check")
        op.create_check_constraint("ck_assets_role", "assets", condition)


def upgrade() -> None:
    _replace_role_check("role IN ('reference', 'candidate', 'final', 'library', 'material')")
    op.create_table(
        "video_projects",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("brand", sa.String(length=200), nullable=False),
        sa.Column("campaign_id", sa.Integer(), sa.ForeignKey("campaigns.id", ondelete="SET NULL"), nullable=True),
        sa.Column("product_code", sa.String(length=128), nullable=True),
        sa.Column("platform", sa.String(length=16), nullable=True),
        sa.Column("aspect", sa.String(length=8), nullable=False),
        sa.Column("brief", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("author", sa.String(length=100), nullable=True),
        sa.Column("reviewer", sa.String(length=100), nullable=True),
        sa.Column("editor", sa.String(length=100), nullable=True),
        sa.Column("bgm_asset_id", sa.Integer(), sa.ForeignKey("assets.id", ondelete="SET NULL"), nullable=True),
        sa.Column("final_asset_id", sa.Integer(), sa.ForeignKey("assets.id", ondelete="SET NULL"), nullable=True),
        sa.Column("events", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "status IN ('draft', 'in_review', 'approved', 'done', 'cancelled')", name="ck_video_projects_status"
        ),
        sa.CheckConstraint("aspect IN ('9:16', '16:9', '1:1', '3:4')", name="ck_video_projects_aspect"),
    )
    op.create_index("ix_video_projects_status", "video_projects", ["status"])
    op.create_table(
        "video_shots",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "project_id", sa.Integer(), sa.ForeignKey("video_projects.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("seq", sa.Integer(), nullable=False),
        sa.Column("duration", sa.Float(), nullable=False),
        sa.Column("visual", sa.Text(), nullable=True),
        sa.Column("voiceover", sa.Text(), nullable=True),
        sa.Column("subtitle", sa.Text(), nullable=True),
        sa.Column("media_asset_id", sa.Integer(), sa.ForeignKey("assets.id", ondelete="SET NULL"), nullable=True),
        sa.Column("voice_asset_id", sa.Integer(), sa.ForeignKey("assets.id", ondelete="SET NULL"), nullable=True),
        sa.Column("note", sa.Text(), nullable=True),
        sa.UniqueConstraint("project_id", "seq", name="uq_video_shots_seq"),
    )


def downgrade() -> None:
    op.drop_table("video_shots")
    op.drop_index("ix_video_projects_status", table_name="video_projects")
    op.drop_table("video_projects")
    op.execute("DELETE FROM assets WHERE role = 'material'")
    _replace_role_check("role IN ('reference', 'candidate', 'final', 'library')")
