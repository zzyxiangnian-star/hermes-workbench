"""活动页：活动日历、活动单、任务清单、模板和复盘。"""

from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.brand import CAMPAIGN_TEMPLATES, _phase, campaign_review
from app.brand_schemas import (
    CampaignDetail,
    CampaignIn,
    CampaignOut,
    CampaignPatch,
    CampaignReviewOut,
    CampaignTaskIn,
    CampaignTaskOut,
    CampaignTaskPatch,
    CampaignTemplateOut,
)
from app.db import get_db
from app.errors import AppError
from app.models import CAMPAIGN_STATUSES, Campaign, CampaignTask, utcnow

router = APIRouter()


@router.get("/campaign-templates", response_model=list[CampaignTemplateOut])
def list_templates() -> list[dict]:
    return [
        {"kind": kind, "name": item["name"], "tasks": [{"kind": k, "title": t} for k, t in item["tasks"]]}
        for kind, item in CAMPAIGN_TEMPLATES.items()
    ]


@router.get("/campaigns", response_model=list[CampaignOut])
def list_campaigns(
    date_from: date | None = None,
    date_to: date | None = None,
    brand: str | None = None,
    status: str | None = None,
    session: Session = Depends(get_db),
) -> list[CampaignOut]:
    """日历用：返回和 [date_from, date_to] 有交集的活动。"""
    if status is not None and status not in CAMPAIGN_STATUSES:
        raise AppError(400, "invalid_status", "状态必须是 planning、running、ended 或 cancelled")
    stmt = select(Campaign).options(selectinload(Campaign.tasks)).order_by(Campaign.start_date, Campaign.id)
    if date_from is not None:
        stmt = stmt.where(Campaign.end_date >= date_from)
    if date_to is not None:
        stmt = stmt.where(Campaign.start_date <= date_to)
    if brand and brand.strip():
        stmt = stmt.where(Campaign.brand == brand.strip())
    if status is not None:
        stmt = stmt.where(Campaign.status == status)
    return [campaign_out(item) for item in session.scalars(stmt)]


@router.post("/campaigns", response_model=CampaignDetail, status_code=201)
def create_campaign(payload: CampaignIn, session: Session = Depends(get_db)) -> CampaignDetail:
    if payload.end_date < payload.start_date:
        raise AppError(400, "invalid_dates", "结束日期不能早于开始日期")
    now = utcnow()
    campaign = Campaign(
        name=payload.name,
        brand=payload.brand,
        kind=payload.kind,
        status="planning",
        start_date=payload.start_date,
        end_date=payload.end_date,
        goal=payload.goal,
        target_sales=_decimal(payload.target_sales),
        budget=_decimal(payload.budget),
        product_codes=payload.product_codes,
        created_at=now,
        updated_at=now,
    )
    if payload.use_template:
        for kind, title in CAMPAIGN_TEMPLATES[payload.kind]["tasks"]:
            campaign.tasks.append(CampaignTask(title=title, kind=kind, done=False))
    session.add(campaign)
    session.flush()
    return campaign_detail(campaign)


@router.get("/campaigns/{campaign_id}", response_model=CampaignDetail)
def get_campaign(campaign_id: int, session: Session = Depends(get_db)) -> CampaignDetail:
    return campaign_detail(_campaign(session, campaign_id))


@router.patch("/campaigns/{campaign_id}", response_model=CampaignDetail)
def patch_campaign(campaign_id: int, payload: CampaignPatch, session: Session = Depends(get_db)) -> CampaignDetail:
    campaign = _campaign(session, campaign_id)
    fields = payload.model_fields_set
    if "name" in fields:
        name = (payload.name or "").strip()
        if not name:
            raise AppError(400, "invalid_name", "名称不能为空")
        campaign.name = name
    for key in ("kind", "status", "start_date", "end_date"):
        if key in fields and getattr(payload, key) is not None:
            setattr(campaign, key, getattr(payload, key))
    if "goal" in fields:
        campaign.goal = payload.goal
    if "target_sales" in fields:
        campaign.target_sales = _decimal(payload.target_sales)
    if "budget" in fields:
        campaign.budget = _decimal(payload.budget)
    if "product_codes" in fields and payload.product_codes is not None:
        campaign.product_codes = [item.strip() for item in payload.product_codes if item.strip()]
    if campaign.end_date < campaign.start_date:
        raise AppError(400, "invalid_dates", "结束日期不能早于开始日期")
    campaign.updated_at = utcnow()
    session.flush()
    return campaign_detail(campaign)


@router.delete("/campaigns/{campaign_id}", status_code=204)
def delete_campaign(campaign_id: int, session: Session = Depends(get_db)) -> Response:
    session.delete(_campaign(session, campaign_id))
    return Response(status_code=204)


@router.post("/campaigns/{campaign_id}/tasks", response_model=CampaignTaskOut, status_code=201)
def create_task(campaign_id: int, payload: CampaignTaskIn, session: Session = Depends(get_db)) -> CampaignTaskOut:
    campaign = _campaign(session, campaign_id)
    task = CampaignTask(
        title=payload.title,
        kind=payload.kind,
        owner=payload.owner,
        due_date=payload.due_date,
        note=payload.note,
        done=False,
    )
    campaign.tasks.append(task)
    campaign.updated_at = utcnow()
    session.flush()
    return CampaignTaskOut.model_validate(task)


@router.patch("/campaign-tasks/{task_id}", response_model=CampaignTaskOut)
def patch_task(task_id: int, payload: CampaignTaskPatch, session: Session = Depends(get_db)) -> CampaignTaskOut:
    task = _task(session, task_id)
    fields = payload.model_fields_set
    if "title" in fields:
        title = (payload.title or "").strip()
        if not title:
            raise AppError(400, "invalid_title", "任务名称不能为空")
        task.title = title
    if "kind" in fields and payload.kind is not None:
        task.kind = payload.kind
    if "done" in fields and payload.done is not None:
        task.done = payload.done
    for key in ("owner", "due_date", "note"):
        if key in fields:
            setattr(task, key, getattr(payload, key))
    task.campaign.updated_at = utcnow()
    session.flush()
    return CampaignTaskOut.model_validate(task)


@router.delete("/campaign-tasks/{task_id}", status_code=204)
def delete_task(task_id: int, session: Session = Depends(get_db)) -> Response:
    session.delete(_task(session, task_id))
    return Response(status_code=204)


@router.get("/campaigns/{campaign_id}/review", response_model=CampaignReviewOut)
def review(campaign_id: int, session: Session = Depends(get_db)) -> dict:
    return campaign_review(session, _campaign(session, campaign_id))


def _campaign(session: Session, campaign_id: int) -> Campaign:
    campaign = session.scalar(
        select(Campaign).where(Campaign.id == campaign_id).options(selectinload(Campaign.tasks))
    )
    if campaign is None:
        raise AppError(404, "campaign_not_found", "活动不存在")
    return campaign


def _task(session: Session, task_id: int) -> CampaignTask:
    task = session.get(CampaignTask, task_id)
    if task is None:
        raise AppError(404, "campaign_task_not_found", "活动任务不存在")
    return task


def _decimal(value: float | None) -> Decimal | None:
    if value is None:
        return None
    return Decimal(str(value)).quantize(Decimal("0.01"))


def campaign_out(campaign: Campaign) -> CampaignOut:
    return CampaignOut(**_base(campaign))


def campaign_detail(campaign: Campaign) -> CampaignDetail:
    return CampaignDetail(**_base(campaign), tasks=[CampaignTaskOut.model_validate(t) for t in campaign.tasks])


def _base(campaign: Campaign) -> dict:
    return {
        "id": campaign.id,
        "name": campaign.name,
        "brand": campaign.brand,
        "kind": campaign.kind,
        "status": campaign.status,
        "phase": _phase(campaign),
        "start_date": campaign.start_date,
        "end_date": campaign.end_date,
        "goal": campaign.goal,
        "target_sales": campaign.target_sales,
        "budget": campaign.budget,
        "product_codes": list(campaign.product_codes or []),
        "tasks_total": len(campaign.tasks),
        "tasks_done": sum(1 for t in campaign.tasks if t.done),
        "created_at": campaign.created_at,
        "updated_at": campaign.updated_at,
    }
