"""短视频：视频项目、分镜、配音和画面素材、审核、初剪包、成片。"""

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import Response
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.design import _check_campaign, _read_upload, asset_out
from app.api.products import _like
from app.db import get_db
from app.design import store_file
from app.design_schemas import ShotsIn, VideoAction, VideoProjectDetail, VideoProjectIn, VideoProjectOut, VideoProjectPatch
from app.errors import AppError
from app.installs import _event
from app.models import Asset, VideoProject, VideoShot, utcnow
from app.video import (
    STATUS_LABELS,
    VIDEO_MIMES,
    approve,
    cancel,
    check_media,
    compliance,
    finish,
    package,
    reject,
    require_editable,
    shot_length,
    srt,
    submit,
    timeline,
    withdraw,
)

router = APIRouter()


@router.get("/video-projects/summary")
def video_summary(session: Session = Depends(get_db)) -> dict:
    counts = {key: 0 for key in STATUS_LABELS}
    for status in session.scalars(select(VideoProject.status)):
        counts[status] += 1
    return {**counts, "needs_action": counts["in_review"]}


@router.get("/video-projects", response_model=list[VideoProjectOut])
def list_projects(
    status: str | None = None,
    brand: str | None = None,
    campaign_id: int | None = None,
    q: str | None = None,
    session: Session = Depends(get_db),
) -> list[dict]:
    if status is not None and status not in STATUS_LABELS and status != "active":
        raise AppError(400, "invalid_status", "状态必须是 active、draft、in_review、approved、done 或 cancelled")
    stmt = select(VideoProject).order_by(VideoProject.updated_at.desc(), VideoProject.id.desc())
    if status == "active":
        stmt = stmt.where(VideoProject.status.in_(("draft", "in_review", "approved")))
    elif status:
        stmt = stmt.where(VideoProject.status == status)
    if brand:
        stmt = stmt.where(VideoProject.brand == brand)
    if campaign_id is not None:
        stmt = stmt.where(VideoProject.campaign_id == campaign_id)
    if q and q.strip():
        pattern = _like(q.strip())
        shot_match = (
            select(VideoShot.id)
            .where(
                VideoShot.project_id == VideoProject.id,
                or_(VideoShot.voiceover.ilike(pattern, escape="\\"), VideoShot.visual.ilike(pattern, escape="\\")),
            )
            .exists()
        )
        stmt = stmt.where(
            or_(VideoProject.title.ilike(pattern, escape="\\"), VideoProject.brief.ilike(pattern, escape="\\"), shot_match)
        )
    return [project_out(session, item) for item in session.scalars(stmt)]


@router.post("/video-projects", response_model=VideoProjectDetail, status_code=201)
def create_project(payload: VideoProjectIn, session: Session = Depends(get_db)) -> dict:
    _check_campaign(session, payload.campaign_id)
    now = utcnow()
    data = payload.model_dump(exclude={"shots"})
    project = VideoProject(**data, status="draft", events=[_event(payload.author, "新建视频项目")], created_at=now, updated_at=now)
    session.add(project)
    session.flush()
    _replace_shots(session, project, payload.shots)
    session.flush()
    return project_detail(session, project)


@router.get("/video-projects/{project_id}", response_model=VideoProjectDetail)
def get_project(project_id: int, session: Session = Depends(get_db)) -> dict:
    return project_detail(session, _project(session, project_id))


@router.patch("/video-projects/{project_id}", response_model=VideoProjectDetail)
def patch_project(project_id: int, payload: VideoProjectPatch, session: Session = Depends(get_db)) -> dict:
    project = _project(session, project_id)
    if project.status in {"done", "cancelled"}:
        raise AppError(409, "project_locked", "已完成或已取消的项目不能修改")
    data = payload.model_dump(exclude_unset=True)
    if data.get("title") is None:
        data.pop("title", None)
    if data.get("aspect") is None:
        data.pop("aspect", None)
    if "campaign_id" in data:
        _check_campaign(session, data["campaign_id"])
    if data.get("bgm_asset_id") is not None:
        check_media(_asset(session, data["bgm_asset_id"]), "bgm")
    for key, value in data.items():
        setattr(project, key, value)
    project.updated_at = utcnow()
    session.flush()
    return project_detail(session, project)


@router.delete("/video-projects/{project_id}", status_code=204)
def delete_project(project_id: int, session: Session = Depends(get_db)) -> Response:
    project = _project(session, project_id)
    if project.status not in {"draft", "cancelled"}:
        raise AppError(409, "project_locked", "只有写脚本中或已取消的项目可以删除")
    session.delete(project)
    return Response(status_code=204)


@router.put("/video-projects/{project_id}/shots", response_model=VideoProjectDetail)
def put_shots(project_id: int, payload: ShotsIn, session: Session = Depends(get_db)) -> dict:
    """整体替换分镜（页面上拖动排序、增删镜头后一次保存）。"""
    project = _project(session, project_id)
    require_editable(project)
    _replace_shots(session, project, payload.shots)
    project.updated_at = utcnow()
    session.flush()
    return project_detail(session, project)


@router.post("/video-projects/{project_id}/shots/{seq}/media", response_model=VideoProjectDetail)
async def upload_shot_media(
    project_id: int,
    seq: int,
    file: UploadFile = File(...),
    slot: str = Form("visual"),
    by: str | None = Form(None),
    session: Session = Depends(get_db),
) -> dict:
    """slot=visual 画面（图片或视频），slot=voice 配音。"""
    project = _project(session, project_id)
    stored = store_file(await _read_upload(file), file.filename or "file")
    attach_media(session, project, seq, slot, stored, by=(by or "").strip() or None)
    session.flush()
    return project_detail(session, project)


@router.post("/video-projects/{project_id}/bgm", response_model=VideoProjectDetail)
async def upload_bgm(
    project_id: int, file: UploadFile = File(...), by: str | None = Form(None), session: Session = Depends(get_db)
) -> dict:
    project = _project(session, project_id)
    require_editable(project)
    asset = _material(project, store_file(await _read_upload(file), file.filename or "bgm"), "upload", by)
    check_media(asset, "bgm")
    session.add(asset)
    session.flush()
    project.bgm_asset_id = asset.id
    project.updated_at = utcnow()
    session.flush()
    return project_detail(session, project)


@router.post("/video-projects/{project_id}/submit", response_model=VideoProjectDetail)
def submit_project(project_id: int, payload: VideoAction, session: Session = Depends(get_db)) -> dict:
    project = _project(session, project_id)
    submit(session, project, payload.by)
    session.flush()
    return project_detail(session, project)


@router.post("/video-projects/{project_id}/approve", response_model=VideoProjectDetail)
def approve_project(project_id: int, payload: VideoAction, session: Session = Depends(get_db)) -> dict:
    project = _project(session, project_id)
    approve(project, payload.by)
    session.flush()
    return project_detail(session, project)


@router.post("/video-projects/{project_id}/reject", response_model=VideoProjectDetail)
def reject_project(project_id: int, payload: VideoAction, session: Session = Depends(get_db)) -> dict:
    project = _project(session, project_id)
    reject(project, payload.by, payload.note)
    session.flush()
    return project_detail(session, project)


@router.post("/video-projects/{project_id}/withdraw", response_model=VideoProjectDetail)
def withdraw_project(project_id: int, payload: VideoAction, session: Session = Depends(get_db)) -> dict:
    project = _project(session, project_id)
    withdraw(project, payload.by)
    session.flush()
    return project_detail(session, project)


@router.post("/video-projects/{project_id}/cancel", response_model=VideoProjectDetail)
def cancel_project(project_id: int, payload: VideoAction, session: Session = Depends(get_db)) -> dict:
    project = _project(session, project_id)
    cancel(project, payload.by)
    session.flush()
    return project_detail(session, project)


@router.post("/video-projects/{project_id}/final", response_model=VideoProjectDetail)
async def upload_final(
    project_id: int, file: UploadFile = File(...), by: str | None = Form(None), session: Session = Depends(get_db)
) -> dict:
    """剪好的成片（MP4、MOV），进素材库。"""
    project = _project(session, project_id)
    if project.status != "approved":
        raise AppError(409, "invalid_transition", "脚本审核通过后才能交成片")
    stored = store_file(await _read_upload(file), file.filename or "video.mp4")
    if stored["mime"] not in VIDEO_MIMES:
        raise AppError(400, "invalid_media", "成片必须是 MP4 或 MOV")
    by = (by or "").strip() or None
    asset = _material(project, stored, "upload", by)
    asset.role = "final"
    asset.kind = "video"
    session.add(asset)
    session.flush()
    finish(project, asset, by)
    session.flush()
    return project_detail(session, project)


@router.get("/video-projects/{project_id}/compliance")
def project_compliance(project_id: int, session: Session = Depends(get_db)) -> dict:
    return compliance(session, _project(session, project_id))


@router.get("/video-projects/{project_id}/timeline")
def project_timeline(project_id: int, session: Session = Depends(get_db)) -> dict:
    return timeline(_project(session, project_id))


@router.get("/video-projects/{project_id}/subtitles.srt")
def project_srt(project_id: int, session: Session = Depends(get_db)) -> Response:
    project = _project(session, project_id)
    return Response(
        content=srt(project).encode("utf-8-sig"),
        media_type="application/x-subrip; charset=utf-8",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''video-{project.id}.srt"},
    )


@router.get("/video-projects/{project_id}/package")
def project_package(project_id: int, session: Session = Depends(get_db)) -> Response:
    project = _project(session, project_id)
    return Response(
        content=package(project),
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''video-{project.id}-package.zip"},
    )


# ---- 内部 ----


def attach_media(
    session: Session, project: VideoProject, seq: int, slot: str, stored: dict, *, by: str | None, source: str = "upload", prompt: str | None = None
) -> Asset:
    require_editable(project)
    if slot not in {"visual", "voice"}:
        raise AppError(400, "invalid_slot", "slot 必须是 visual 或 voice")
    shot = next((s for s in project.shots if s.seq == seq), None)
    if shot is None:
        raise AppError(404, "shot_not_found", f"没有第 {seq} 镜")
    asset = _material(project, stored, source, by)
    asset.prompt = prompt
    check_media(asset, slot)
    session.add(asset)
    session.flush()
    if slot == "visual":
        shot.media_asset_id = asset.id
    else:
        shot.voice_asset_id = asset.id
    session.flush()
    session.refresh(shot)
    text = f"第 {seq} 镜{'画面' if slot == 'visual' else '配音'}" + ("（AI 生成）" if source == "ai" else "")
    project.events = [*project.events, _event(by, text)]
    project.updated_at = utcnow()
    return asset


def _material(project: VideoProject, stored: dict, source: str, by: str | None) -> Asset:
    return Asset(
        **stored,
        role="material",
        brand=project.brand,
        product_code=project.product_code,
        campaign_id=project.campaign_id,
        tags=[],
        source=source,
        created_by=by,
        created_at=utcnow(),
    )


def _replace_shots(session: Session, project: VideoProject, shots: list) -> None:
    for item in shots:
        if item.media_asset_id is not None:
            check_media(_asset(session, item.media_asset_id), "visual")
        if item.voice_asset_id is not None:
            check_media(_asset(session, item.voice_asset_id), "voice")
    project.shots.clear()
    session.flush()
    for seq, item in enumerate(shots, 1):
        project.shots.append(VideoShot(seq=seq, **item.model_dump()))
    session.flush()
    for shot in project.shots:
        session.refresh(shot)


def project_out(session: Session, project: VideoProject) -> dict:
    lengths = [shot_length(s) for s in project.shots]
    cover = next((s.media for s in project.shots if s.media is not None and s.media.mime.startswith("image/")), None)
    final = session.get(Asset, project.final_asset_id) if project.final_asset_id else None
    return {
        "id": project.id,
        "title": project.title,
        "brand": project.brand,
        "campaign_id": project.campaign_id,
        "campaign_name": project.campaign.name if project.campaign else None,
        "product_code": project.product_code,
        "platform": project.platform,
        "aspect": project.aspect,
        "brief": project.brief,
        "status": project.status,
        "author": project.author,
        "reviewer": project.reviewer,
        "editor": project.editor,
        "shot_count": len(project.shots),
        "duration": round(sum(lengths), 3),
        "missing_media": sum(1 for s in project.shots if s.media_asset_id is None),
        "missing_voice": sum(1 for s in project.shots if s.voice_asset_id is None and s.voiceover),
        "cover": asset_out(cover) if cover else None,
        "final": asset_out(final) if final else None,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
    }


def project_detail(session: Session, project: VideoProject) -> dict:
    shots = []
    start = 0.0
    for shot in project.shots:
        length = shot_length(shot)
        shots.append(
            {
                "seq": shot.seq,
                "duration": shot.duration,
                "length": length,
                "start": round(start, 3),
                "visual": shot.visual,
                "voiceover": shot.voiceover,
                "subtitle": shot.subtitle,
                "media": asset_out(shot.media) if shot.media else None,
                "voice": asset_out(shot.voice) if shot.voice else None,
                "note": shot.note,
            }
        )
        start += length
    bgm = session.get(Asset, project.bgm_asset_id) if project.bgm_asset_id else None
    return {
        **project_out(session, project),
        "shots": shots,
        "bgm": asset_out(bgm) if bgm else None,
        "events": project.events,
        "compliance": compliance(session, project),
    }


def _project(session: Session, project_id: int) -> VideoProject:
    project = session.get(VideoProject, project_id)
    if project is None:
        raise AppError(404, "video_project_not_found", "视频项目不存在")
    return project


def _asset(session: Session, asset_id: int) -> Asset:
    asset = session.get(Asset, asset_id)
    if asset is None:
        raise AppError(404, "asset_not_found", "素材不存在")
    return asset
