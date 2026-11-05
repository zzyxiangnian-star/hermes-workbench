"""设计页：设计需求单、参考图和候选稿、图上批注、定稿、素材库。"""

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import FileResponse, Response
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.products import _like
from app.brand import today
from app.db import get_db
from app.design import (
    STATUS_LABELS,
    add_candidate,
    add_comment,
    change_status,
    copy_compliance,
    file_path,
    finalize,
    is_overdue,
    max_upload_bytes,
    remove_asset,
    store_file,
)
from app.design_schemas import (
    AssetOut,
    AssetPatch,
    DesignCommentIn,
    DesignCommentOut,
    DesignCommentPatch,
    DesignRequestDetail,
    DesignRequestIn,
    DesignRequestOut,
    DesignRequestPatch,
    DesignStatusIn,
    DesignSummary,
    FinalizeIn,
)
from app.errors import AppError
from app.installs import _event
from app.models import Asset, Campaign, DesignComment, DesignRequest, utcnow

router = APIRouter()


# ---- 需求单 ----


@router.get("/design-requests/summary", response_model=DesignSummary)
def design_summary(brand: str | None = None, session: Session = Depends(get_db)) -> dict:
    counts = {key: 0 for key in STATUS_LABELS}
    overdue = 0
    now = today()
    stmt = select(DesignRequest)
    if brand:
        stmt = stmt.where(DesignRequest.brand == brand)
    for item in session.scalars(stmt):
        counts[item.status] += 1
        overdue += is_overdue(item, now)
    return {**counts, "overdue": overdue, "needs_action": counts["open"] + counts["reviewing"]}


@router.get("/design-requests", response_model=list[DesignRequestOut])
def list_requests(
    status: str | None = None,
    brand: str | None = None,
    kind: str | None = None,
    campaign_id: int | None = None,
    product_code: str | None = None,
    assignee: str | None = None,
    q: str | None = None,
    session: Session = Depends(get_db),
) -> list[dict]:
    if status is not None and status not in STATUS_LABELS and status != "active":
        raise AppError(400, "invalid_status", "状态必须是 active、open、in_progress、reviewing、done 或 cancelled")
    stmt = select(DesignRequest).order_by(DesignRequest.updated_at.desc(), DesignRequest.id.desc())
    if status == "active":
        stmt = stmt.where(DesignRequest.status.in_(("open", "in_progress", "reviewing")))
    elif status:
        stmt = stmt.where(DesignRequest.status == status)
    for column, value in (
        (DesignRequest.brand, brand),
        (DesignRequest.kind, kind),
        (DesignRequest.campaign_id, campaign_id),
        (DesignRequest.product_code, product_code),
        (DesignRequest.assignee, assignee),
    ):
        if value is not None and value != "":
            stmt = stmt.where(column == value)
    if q and q.strip():
        pattern = _like(q.strip())
        stmt = stmt.where(
            or_(
                DesignRequest.title.ilike(pattern, escape="\\"),
                DesignRequest.brief.ilike(pattern, escape="\\"),
                DesignRequest.copy_text.ilike(pattern, escape="\\"),
                DesignRequest.product_code.ilike(pattern, escape="\\"),
            )
        )
    return [request_out(session, item) for item in session.scalars(stmt)]


@router.post("/design-requests", response_model=DesignRequestDetail, status_code=201)
def create_request(payload: DesignRequestIn, session: Session = Depends(get_db)) -> dict:
    _check_campaign(session, payload.campaign_id)
    now = utcnow()
    item = DesignRequest(
        **payload.model_dump(),
        status="open",
        round=1,
        events=[_event(payload.requester, "提交需求")],
        created_at=now,
        updated_at=now,
    )
    session.add(item)
    session.flush()
    return request_detail(session, item)


@router.get("/design-requests/{request_id}", response_model=DesignRequestDetail)
def get_request(request_id: int, session: Session = Depends(get_db)) -> dict:
    return request_detail(session, _request(session, request_id))


@router.patch("/design-requests/{request_id}", response_model=DesignRequestDetail)
def patch_request(request_id: int, payload: DesignRequestPatch, session: Session = Depends(get_db)) -> dict:
    item = _request(session, request_id)
    if item.status in {"done", "cancelled"}:
        raise AppError(409, "request_locked", "已定稿或已取消的需求单不能修改")
    data = payload.model_dump(exclude_unset=True)
    if "title" in data and not data["title"]:
        raise AppError(400, "title_required", "标题不能为空")
    if data.get("kind") is None:
        data.pop("kind", None)
    if data.get("sizes") is None:
        data.pop("sizes", None)
    if "campaign_id" in data:
        _check_campaign(session, data["campaign_id"])
    for key, value in data.items():
        setattr(item, key, value)
    item.updated_at = utcnow()
    session.flush()
    return request_detail(session, item)


@router.delete("/design-requests/{request_id}", status_code=204)
def delete_request(request_id: int, session: Session = Depends(get_db)) -> Response:
    item = _request(session, request_id)
    if item.status not in {"open", "cancelled"}:
        raise AppError(409, "request_locked", "只有待接单或已取消的需求单可以删除")
    for asset in session.scalars(select(Asset).where(Asset.request_id == item.id, Asset.role != "final")):
        remove_asset(session, asset)
    session.delete(item)
    return Response(status_code=204)


@router.post("/design-requests/{request_id}/status", response_model=DesignRequestDetail)
def set_status(request_id: int, payload: DesignStatusIn, session: Session = Depends(get_db)) -> dict:
    item = _request(session, request_id)
    change_status(item, payload.status, by=payload.by, note=payload.note)
    session.flush()
    return request_detail(session, item)


@router.post("/design-requests/{request_id}/assets", response_model=AssetOut, status_code=201)
async def upload_request_asset(
    request_id: int,
    file: UploadFile = File(...),
    role: str = Form("candidate"),
    by: str | None = Form(None),
    note: str | None = Form(None),
    session: Session = Depends(get_db),
) -> dict:
    """role=reference 参考图（需求方上传）；role=candidate 候选稿（设计师交稿，需求单自动进入待评审）。"""
    item = _request(session, request_id)
    if role not in {"reference", "candidate"}:
        raise AppError(400, "invalid_role", "role 必须是 reference 或 candidate")
    stored = store_file(await _read_upload(file), file.filename or "file")
    by = (by or "").strip() or None
    note = (note or "").strip() or None
    if role == "candidate":
        asset = add_candidate(session, item, stored, by=by, note=note)
    else:
        if item.status in {"done", "cancelled"}:
            raise AppError(409, "request_locked", "已定稿或已取消的需求单不能再加参考图")
        asset = Asset(
            **stored,
            request_id=item.id,
            role="reference",
            brand=item.brand,
            product_code=item.product_code,
            campaign_id=item.campaign_id,
            kind=item.kind,
            tags=[],
            source="upload",
            note=note,
            created_by=by,
            created_at=utcnow(),
        )
        session.add(asset)
        item.updated_at = utcnow()
        session.flush()
    return asset_out(asset)


@router.post("/design-requests/{request_id}/finalize", response_model=DesignRequestDetail)
def finalize_request(request_id: int, payload: FinalizeIn, session: Session = Depends(get_db)) -> dict:
    item = _request(session, request_id)
    finalize(session, item, payload.asset_ids, by=payload.by)
    session.flush()
    return request_detail(session, item)


@router.get("/design-requests/{request_id}/compliance")
def request_compliance(request_id: int, session: Session = Depends(get_db)) -> dict:
    return copy_compliance(session, _request(session, request_id))


@router.post("/design-requests/{request_id}/comments", response_model=DesignCommentOut, status_code=201)
def post_comment(request_id: int, payload: DesignCommentIn, session: Session = Depends(get_db)) -> DesignComment:
    item = _request(session, request_id)
    return add_comment(
        session, item, body=payload.body, author=payload.author, asset_id=payload.asset_id, x=payload.x, y=payload.y
    )


@router.patch("/design-comments/{comment_id}", response_model=DesignCommentOut)
def patch_comment(comment_id: int, payload: DesignCommentPatch, session: Session = Depends(get_db)) -> DesignComment:
    comment = _comment(session, comment_id)
    comment.resolved = payload.resolved
    session.flush()
    return comment


@router.delete("/design-comments/{comment_id}", status_code=204)
def delete_comment(comment_id: int, session: Session = Depends(get_db)) -> Response:
    session.delete(_comment(session, comment_id))
    return Response(status_code=204)


# ---- 素材库 ----


@router.get("/assets", response_model=list[AssetOut])
def list_assets(
    role: str | None = None,
    brand: str | None = None,
    product_code: str | None = None,
    campaign_id: int | None = None,
    kind: str | None = None,
    q: str | None = None,
    limit: int = 200,
    session: Session = Depends(get_db),
) -> list[dict]:
    """默认是素材库（定稿 + 直接上传的素材）。role 可以指定 reference、candidate、final、library。"""
    size = max(1, min(limit, 500))
    stmt = select(Asset).order_by(Asset.created_at.desc(), Asset.id.desc())
    if not (q and q.strip()):
        stmt = stmt.limit(size)
    if role is None:
        stmt = stmt.where(Asset.role.in_(("final", "library")))
    elif role in {"reference", "candidate", "final", "library"}:
        stmt = stmt.where(Asset.role == role)
    else:
        raise AppError(400, "invalid_role", "role 必须是 reference、candidate、final 或 library")
    for column, value in (
        (Asset.brand, brand),
        (Asset.product_code, product_code),
        (Asset.campaign_id, campaign_id),
        (Asset.kind, kind),
    ):
        if value is not None and value != "":
            stmt = stmt.where(column == value)
    assets = session.scalars(stmt).all()
    if q and q.strip():
        # 标签存成 JSON（中文会被转义），所以在内存里筛
        needle = q.strip().casefold()
        assets = [
            a
            for a in assets
            if any(needle in (text or "").casefold() for text in (a.file_name, a.note, a.product_code, *a.tags))
        ]
    return [asset_out(asset) for asset in assets[:size]]


@router.post("/assets", response_model=AssetOut, status_code=201)
async def upload_library_asset(
    file: UploadFile = File(...),
    brand: str | None = Form(None),
    product_code: str | None = Form(None),
    campaign_id: int | None = Form(None),
    tags: str | None = Form(None),
    note: str | None = Form(None),
    by: str | None = Form(None),
    session: Session = Depends(get_db),
) -> dict:
    """直接放进素材库（旧图、品牌 Logo、拍摄原片等）。tags 用逗号分隔。"""
    _check_campaign(session, campaign_id)
    stored = store_file(await _read_upload(file), file.filename or "file")
    asset = Asset(
        **stored,
        role="library",
        brand=(brand or "").strip() or None,
        product_code=(product_code or "").strip() or None,
        campaign_id=campaign_id,
        tags=[t.strip() for t in (tags or "").replace("，", ",").split(",") if t.strip()],
        source="upload",
        note=(note or "").strip() or None,
        created_by=(by or "").strip() or None,
        created_at=utcnow(),
    )
    session.add(asset)
    session.flush()
    return asset_out(asset)


@router.get("/assets/{asset_id}", response_model=AssetOut)
def get_asset(asset_id: int, session: Session = Depends(get_db)) -> dict:
    return asset_out(_asset(session, asset_id))


@router.get("/assets/{asset_id}/file")
def get_asset_file(asset_id: int, download: bool = False, session: Session = Depends(get_db)) -> FileResponse:
    asset = _asset(session, asset_id)
    return FileResponse(
        file_path(asset),
        media_type=asset.mime,
        filename=asset.file_name,
        content_disposition_type="attachment" if download else "inline",
        headers={"Cache-Control": "private, max-age=86400"},
    )


@router.patch("/assets/{asset_id}", response_model=AssetOut)
def patch_asset(asset_id: int, payload: AssetPatch, session: Session = Depends(get_db)) -> dict:
    asset = _asset(session, asset_id)
    data = payload.model_dump(exclude_unset=True)
    if "campaign_id" in data:
        _check_campaign(session, data["campaign_id"])
    if data.get("tags") is None:
        data.pop("tags", None)
    for key, value in data.items():
        setattr(asset, key, value)
    session.flush()
    return asset_out(asset)


@router.delete("/assets/{asset_id}", status_code=204)
def delete_asset(asset_id: int, session: Session = Depends(get_db)) -> Response:
    asset = _asset(session, asset_id)
    if asset.role == "final":
        raise AppError(409, "asset_locked", "定稿不能删除")
    remove_asset(session, asset)
    return Response(status_code=204)


# ---- 输出 ----


def asset_out(asset: Asset) -> dict:
    return {
        "id": asset.id,
        "request_id": asset.request_id,
        "role": asset.role,
        "file_name": asset.file_name,
        "url": f"/api/assets/{asset.id}/file",
        "mime": asset.mime,
        "size": asset.size,
        "width": asset.width,
        "height": asset.height,
        "brand": asset.brand,
        "product_code": asset.product_code,
        "campaign_id": asset.campaign_id,
        "kind": asset.kind,
        "tags": asset.tags,
        "source": asset.source,
        "prompt": asset.prompt,
        "round": asset.round,
        "label": asset.label,
        "note": asset.note,
        "created_by": asset.created_by,
        "created_at": asset.created_at,
    }


def request_out(session: Session, item: DesignRequest) -> dict:
    assets = session.scalars(
        select(Asset).where(Asset.request_id == item.id, Asset.role.in_(("candidate", "final"))).order_by(Asset.id)
    ).all()
    finals = [a for a in assets if a.role == "final"]
    cover = finals[0] if finals else (assets[-1] if assets else None)
    open_comments = session.scalar(
        select(func.count())
        .select_from(DesignComment)
        .where(DesignComment.request_id == item.id, DesignComment.resolved.is_(False))
    )
    return {
        "id": item.id,
        "title": item.title,
        "kind": item.kind,
        "brand": item.brand,
        "campaign_id": item.campaign_id,
        "campaign_name": item.campaign.name if item.campaign else None,
        "product_code": item.product_code,
        "sizes": item.sizes,
        "copy_text": item.copy_text,
        "brief": item.brief,
        "due_date": item.due_date,
        "overdue": is_overdue(item, today()),
        "requester": item.requester,
        "assignee": item.assignee,
        "status": item.status,
        "round": item.round,
        "candidate_count": len(assets),
        "open_comments": open_comments or 0,
        "cover": asset_out(cover) if cover else None,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }


def request_detail(session: Session, item: DesignRequest) -> dict:
    assets = session.scalars(select(Asset).where(Asset.request_id == item.id).order_by(Asset.id)).all()
    comments = session.scalars(
        select(DesignComment).where(DesignComment.request_id == item.id).order_by(DesignComment.id)
    ).all()
    return {
        **request_out(session, item),
        "references": [asset_out(a) for a in assets if a.role == "reference"],
        "candidates": [asset_out(a) for a in assets if a.role == "candidate"],
        "finals": [asset_out(a) for a in assets if a.role == "final"],
        "comments": [DesignCommentOut.model_validate(c, from_attributes=True) for c in comments],
        "events": item.events,
        "compliance": copy_compliance(session, item),
    }


async def _read_upload(file: UploadFile) -> bytes:
    limit = max_upload_bytes()
    data = await file.read(limit + 1)
    if len(data) > limit:
        raise AppError(413, "file_too_large", f"文件超过 {limit // 1024 // 1024} MB")
    return data


def _check_campaign(session: Session, campaign_id: int | None) -> None:
    if campaign_id is not None and session.get(Campaign, campaign_id) is None:
        raise AppError(404, "campaign_not_found", "活动不存在")


def _request(session: Session, request_id: int) -> DesignRequest:
    item = session.get(DesignRequest, request_id)
    if item is None:
        raise AppError(404, "design_request_not_found", "设计需求单不存在")
    return item


def _asset(session: Session, asset_id: int) -> Asset:
    asset = session.get(Asset, asset_id)
    if asset is None:
        raise AppError(404, "asset_not_found", "素材不存在")
    return asset


def _comment(session: Session, comment_id: int) -> DesignComment:
    comment = session.get(DesignComment, comment_id)
    if comment is None:
        raise AppError(404, "comment_not_found", "批注不存在")
    return comment
