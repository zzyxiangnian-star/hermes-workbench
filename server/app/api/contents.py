"""内容页：稿件、一稿多平台、合规检查、审稿流转、批注、版本对比。

流转：draft / rejected →(submit)→ in_review →(approve)→ approved →(publish)→ published
                                   in_review →(reject)→ rejected
             in_review / approved →(withdraw)→ draft
只有 draft、rejected 能改内容；改了就记一个新版本。发布由人在各平台完成后回来标记。
"""

from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.products import _like
from app.brand_schemas import (
    CommentIn,
    CommentOut,
    CommentPatch,
    ContentCompliance,
    ContentDetail,
    ContentDiff,
    ContentIn,
    ContentOut,
    ContentUpdate,
    PublishAction,
    ReviewAction,
    VariantIn,
    VariantOut,
    VersionInfo,
    VersionSnapshot,
)
from app.contents import add_version, compliance_of, diff_segments, snapshot_of, text_of
from app.db import get_db
from app.errors import AppError
from app.models import (
    CONTENT_STATUSES,
    PLATFORMS,
    Campaign,
    Content,
    ContentComment,
    ContentVariant,
    ContentVersion,
    utcnow,
)

router = APIRouter()

EDITABLE = {"draft", "rejected"}


@router.get("/contents", response_model=list[ContentOut])
def list_contents(
    status: str | None = None,
    brand: str | None = None,
    campaign_id: int | None = None,
    platform: str | None = None,
    q: str | None = None,
    session: Session = Depends(get_db),
) -> list[ContentOut]:
    if status is not None and status not in CONTENT_STATUSES:
        raise AppError(400, "invalid_status", "状态必须是 draft、in_review、approved、rejected 或 published")
    if platform is not None and platform not in PLATFORMS:
        raise AppError(400, "invalid_platform", "平台不正确")
    stmt = select(Content).options(*_load()).order_by(Content.updated_at.desc(), Content.id.desc())
    if status is not None:
        stmt = stmt.where(Content.status == status)
    if brand and brand.strip():
        stmt = stmt.where(Content.brand == brand.strip())
    if campaign_id is not None:
        stmt = stmt.where(Content.campaign_id == campaign_id)
    if platform is not None:
        stmt = stmt.where(
            select(ContentVariant.id)
            .where(ContentVariant.content_id == Content.id, ContentVariant.platform == platform)
            .exists()
        )
    if q and q.strip():
        pattern = _like(q.strip())
        in_variant = (
            select(ContentVariant.id)
            .where(
                ContentVariant.content_id == Content.id,
                ContentVariant.body.ilike(pattern, escape="\\") | ContentVariant.title.ilike(pattern, escape="\\"),
            )
            .exists()
        )
        stmt = stmt.where(
            Content.title.ilike(pattern, escape="\\") | Content.body.ilike(pattern, escape="\\") | in_variant
        )
    contents = session.scalars(stmt).all()
    names = _campaign_names(session, contents)
    return [content_out(item, names) for item in contents]


@router.post("/contents", response_model=ContentDetail, status_code=201)
def create_content(payload: ContentIn, session: Session = Depends(get_db)) -> ContentDetail:
    _check_campaign(session, payload.campaign_id)
    now = utcnow()
    content = Content(
        title=payload.title,
        brand=payload.brand,
        kind=payload.kind,
        campaign_id=payload.campaign_id,
        body=payload.body,
        status="draft",
        author=payload.author,
        planned_at=payload.planned_at,
        version=1,
        created_at=now,
        updated_at=now,
    )
    _set_variants(content, payload.variants)
    add_version(content, payload.author, payload.note or "新建")
    session.add(content)
    session.flush()
    return content_detail(session, content)


@router.get("/contents/{content_id}", response_model=ContentDetail)
def get_content(content_id: int, session: Session = Depends(get_db)) -> ContentDetail:
    return content_detail(session, _content(session, content_id))


@router.put("/contents/{content_id}", response_model=ContentDetail)
def update_content(content_id: int, payload: ContentUpdate, session: Session = Depends(get_db)) -> ContentDetail:
    content = _content(session, content_id)
    if content.status not in EDITABLE:
        raise AppError(409, "content_locked", "送审中、已通过或已发布的稿件不能直接改，先撤回成草稿")
    before = snapshot_of(content)
    fields = payload.model_fields_set
    if "title" in fields:
        title = (payload.title or "").strip()
        if not title:
            raise AppError(400, "invalid_title", "标题不能为空")
        content.title = title
    if "kind" in fields and payload.kind is not None:
        content.kind = payload.kind
    if "campaign_id" in fields:
        _check_campaign(session, payload.campaign_id)
        content.campaign_id = payload.campaign_id
    if "body" in fields and payload.body is not None:
        content.body = payload.body
    if "planned_at" in fields:
        content.planned_at = payload.planned_at
    if "variants" in fields and payload.variants is not None:
        _set_variants(content, payload.variants)
    if "author" in fields and payload.author:
        content.author = payload.author
    session.flush()
    if snapshot_of(content) != before:
        add_version(content, payload.author or content.author, payload.note)
        content.status = "draft"
    content.updated_at = utcnow()
    session.flush()
    return content_detail(session, content)


@router.delete("/contents/{content_id}", status_code=204)
def delete_content(content_id: int, session: Session = Depends(get_db)) -> Response:
    session.delete(_content(session, content_id))
    return Response(status_code=204)


@router.get("/contents/{content_id}/compliance", response_model=ContentCompliance)
def content_compliance(content_id: int, session: Session = Depends(get_db)) -> dict:
    return compliance_of(session, _content(session, content_id))


@router.post("/contents/{content_id}/submit", response_model=ContentDetail)
def submit(content_id: int, payload: ReviewAction, session: Session = Depends(get_db)) -> ContentDetail:
    content = _content(session, content_id)
    _require(content, EDITABLE, "只有草稿或被退回的稿件能送审")
    result = compliance_of(session, content)
    if not result["passed"]:
        words = sorted(
            {hit["word"] for part in result["parts"] for hit in part["result"]["hits"] if hit["level"] == "must"}
        )
        raise AppError(400, "compliance_failed", "有必须修改的违禁词：" + "、".join(words))
    content.status = "in_review"
    content.reviewer = None
    _log(content, payload.by, "送审", payload.note)
    return content_detail(session, content)


@router.post("/contents/{content_id}/withdraw", response_model=ContentDetail)
def withdraw(content_id: int, payload: ReviewAction, session: Session = Depends(get_db)) -> ContentDetail:
    content = _content(session, content_id)
    _require(content, {"in_review", "approved"}, "只有送审中或已通过的稿件能撤回")
    content.status = "draft"
    _log(content, payload.by, "撤回成草稿", payload.note)
    return content_detail(session, content)


@router.post("/contents/{content_id}/approve", response_model=ContentDetail)
def approve(content_id: int, payload: ReviewAction, session: Session = Depends(get_db)) -> ContentDetail:
    content = _content(session, content_id)
    _require(content, {"in_review"}, "只有送审中的稿件能通过")
    content.status = "approved"
    content.reviewer = payload.by
    _log(content, payload.by, "审核通过", payload.note)
    return content_detail(session, content)


@router.post("/contents/{content_id}/reject", response_model=ContentDetail)
def reject(content_id: int, payload: ReviewAction, session: Session = Depends(get_db)) -> ContentDetail:
    content = _content(session, content_id)
    _require(content, {"in_review"}, "只有送审中的稿件能退回")
    if not payload.note:
        raise AppError(400, "note_required", "退回时请写明原因")
    content.status = "rejected"
    content.reviewer = payload.by
    _log(content, payload.by, "退回", payload.note)
    return content_detail(session, content)


@router.post("/contents/{content_id}/publish", response_model=ContentDetail)
def publish(content_id: int, payload: PublishAction, session: Session = Depends(get_db)) -> ContentDetail:
    """人在平台上发完后回来标记。可以对每个平台各标一次并记链接。"""
    content = _content(session, content_id)
    _require(content, {"approved", "published"}, "只有审核通过的稿件能标记为已发布")
    if payload.platform is not None:
        variant = next((item for item in content.variants if item.platform == payload.platform), None)
        if variant is None:
            raise AppError(400, "variant_not_found", "这篇稿件没有这个平台的版本")
        variant.published_url = payload.url
    if content.status != "published":
        content.status = "published"
        content.published_at = utcnow()
    label = f"已发布到 {payload.platform}" if payload.platform else "已发布"
    _log(content, payload.by, label, payload.url)
    return content_detail(session, content)


# ---- 批注 ----


@router.post("/contents/{content_id}/comments", response_model=CommentOut, status_code=201)
def add_comment(content_id: int, payload: CommentIn, session: Session = Depends(get_db)) -> CommentOut:
    content = _content(session, content_id)
    if payload.platform is not None and payload.platform not in {item.platform for item in content.variants}:
        raise AppError(400, "variant_not_found", "这篇稿件没有这个平台的版本")
    if payload.start is not None and payload.end is not None and payload.end < payload.start:
        raise AppError(400, "invalid_range", "批注位置不正确")
    comment = ContentComment(
        platform=payload.platform,
        quote=payload.quote,
        start=payload.start,
        end=payload.end,
        body=payload.body,
        author=payload.author,
        kind="comment",
        resolved=False,
        created_at=utcnow(),
    )
    content.comments.append(comment)
    session.flush()
    return CommentOut.model_validate(comment)


@router.patch("/content-comments/{comment_id}", response_model=CommentOut)
def patch_comment(comment_id: int, payload: CommentPatch, session: Session = Depends(get_db)) -> CommentOut:
    comment = _comment(session, comment_id)
    comment.resolved = payload.resolved
    session.flush()
    return CommentOut.model_validate(comment)


@router.delete("/content-comments/{comment_id}", status_code=204)
def delete_comment(comment_id: int, session: Session = Depends(get_db)) -> Response:
    session.delete(_comment(session, comment_id))
    return Response(status_code=204)


# ---- 版本 ----


@router.get("/contents/{content_id}/versions/{version}", response_model=VersionSnapshot)
def get_version(content_id: int, version: int, session: Session = Depends(get_db)) -> ContentVersion:
    return _version(session, content_id, version)


@router.get("/contents/{content_id}/diff", response_model=ContentDiff)
def diff(
    content_id: int,
    from_version: int,
    to_version: int | None = None,
    platform: str | None = None,
    session: Session = Depends(get_db),
) -> dict:
    content = _content(session, content_id)
    if platform is not None and platform not in PLATFORMS:
        raise AppError(400, "invalid_platform", "平台不正确")
    target = to_version or content.version
    old = _version(session, content_id, from_version).snapshot
    new = _version(session, content_id, target).snapshot
    title_from, body_from = text_of(old, platform)
    title_to, body_to = text_of(new, platform)
    return {
        "content_id": content_id,
        "from_version": from_version,
        "to_version": target,
        "platform": platform,
        "title_from": title_from,
        "title_to": title_to,
        "segments": diff_segments(body_from, body_to),
    }


# ---- 内部 ----


def _load():
    return (selectinload(Content.variants), selectinload(Content.comments), selectinload(Content.versions))


def _content(session: Session, content_id: int) -> Content:
    content = session.scalar(select(Content).where(Content.id == content_id).options(*_load()))
    if content is None:
        raise AppError(404, "content_not_found", "稿件不存在")
    return content


def _comment(session: Session, comment_id: int) -> ContentComment:
    comment = session.get(ContentComment, comment_id)
    if comment is None:
        raise AppError(404, "comment_not_found", "批注不存在")
    return comment


def _version(session: Session, content_id: int, version: int) -> ContentVersion:
    found = session.scalar(
        select(ContentVersion).where(ContentVersion.content_id == content_id, ContentVersion.version == version)
    )
    if found is None:
        raise AppError(404, "version_not_found", "没有这个版本")
    return found


def _check_campaign(session: Session, campaign_id: int | None) -> None:
    if campaign_id is not None and session.get(Campaign, campaign_id) is None:
        raise AppError(404, "campaign_not_found", "活动不存在")


def _require(content: Content, allowed: set[str], message: str) -> None:
    if content.status not in allowed:
        raise AppError(409, "invalid_transition", message)


def _set_variants(content: Content, variants: list[VariantIn]) -> None:
    platforms = [item.platform for item in variants]
    if len(platforms) != len(set(platforms)):
        raise AppError(400, "duplicate_platform", "同一个平台只能有一个版本")
    existing = {item.platform: item for item in content.variants}
    kept = []
    for item in variants:
        variant = existing.get(item.platform) or ContentVariant(platform=item.platform)
        variant.title = item.title
        variant.body = item.body
        kept.append(variant)
    content.variants[:] = kept


def _log(content: Content, by: str | None, action: str, note: str | None) -> None:
    """审稿动作记成一条已处理的系统批注，抽屉里能看到谁在什么时候做了什么。"""
    body = f"{action}：{note}" if note else action
    content.comments.append(
        ContentComment(body=body, author=by, kind="review", resolved=True, created_at=utcnow())
    )
    content.updated_at = utcnow()


def _campaign_names(session: Session, contents: list[Content]) -> dict[int, str]:
    ids = {item.campaign_id for item in contents if item.campaign_id is not None}
    if not ids:
        return {}
    return dict(session.execute(select(Campaign.id, Campaign.name).where(Campaign.id.in_(ids))).all())


def content_out(content: Content, names: dict[int, str]) -> ContentOut:
    return ContentOut(**_base(content, names))


def content_detail(session: Session, content: Content) -> ContentDetail:
    session.flush()
    names = _campaign_names(session, [content])
    return ContentDetail(
        **_base(content, names),
        body=content.body,
        variants=[VariantOut.model_validate(item) for item in content.variants],
        comments=[CommentOut.model_validate(item) for item in content.comments],
        versions=[VersionInfo.model_validate(item) for item in content.versions],
    )


def _base(content: Content, names: dict[int, str]) -> dict:
    return {
        "id": content.id,
        "title": content.title,
        "brand": content.brand,
        "kind": content.kind,
        "campaign_id": content.campaign_id,
        "campaign_name": names.get(content.campaign_id) if content.campaign_id else None,
        "status": content.status,
        "author": content.author,
        "reviewer": content.reviewer,
        "planned_at": content.planned_at,
        "published_at": content.published_at,
        "version": content.version,
        "platforms": [item.platform for item in content.variants],
        "open_comments": sum(1 for item in content.comments if item.kind == "comment" and not item.resolved),
        "created_at": content.created_at,
        "updated_at": content.updated_at,
    }
