from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.errors import AppError
from app.models import Alert, Shop, utcnow
from app.schemas import AlertOut, AlertPatch, AlertShopCount, AlertSummary

router = APIRouter()


@router.get("/alerts/summary", response_model=AlertSummary)
def alert_summary(session: Session = Depends(get_db)) -> AlertSummary:
    counts = dict(
        session.execute(
            select(Alert.shop_id, func.count(Alert.id)).where(Alert.status == "open").group_by(Alert.shop_id)
        ).all()
    )
    shops = session.scalars(select(Shop).order_by(Shop.id)).all()
    items = [
        AlertShopCount(
            shop_id=shop.id,
            name=shop.name,
            platform=shop.platform,
            brand=shop.brand,
            open_count=int(counts.get(shop.id, 0)),
        )
        for shop in shops
    ]
    return AlertSummary(shops=items, total_open=sum(item.open_count for item in items))


@router.get("/alerts", response_model=list[AlertOut])
def list_alerts(
    status: str | None = None,
    level: str | None = None,
    shop_id: int | None = None,
    session: Session = Depends(get_db),
) -> list[AlertOut]:
    if status is not None and status not in {"open", "resolved", "ignored"}:
        raise AppError(400, "invalid_status", "状态必须是 open、resolved 或 ignored")
    if level is not None and level not in {"must", "warn"}:
        raise AppError(400, "invalid_level", "级别必须是 must 或 warn")
    stmt = select(Alert).options(joinedload(Alert.shop)).order_by(Alert.found_at.desc(), Alert.id.desc())
    if status is not None:
        stmt = stmt.where(Alert.status == status)
    if level is not None:
        stmt = stmt.where(Alert.level == level)
    if shop_id is not None:
        stmt = stmt.where(Alert.shop_id == shop_id)
    return [alert_out(item) for item in session.scalars(stmt).unique().all()]


@router.patch("/alerts/{alert_id}", response_model=AlertOut)
def patch_alert(alert_id: int, payload: AlertPatch, session: Session = Depends(get_db)) -> AlertOut:
    alert = session.scalar(select(Alert).where(Alert.id == alert_id).options(joinedload(Alert.shop)))
    if alert is None:
        raise AppError(404, "alert_not_found", "提醒不存在")
    if "status" in payload.model_fields_set and payload.status is not None:
        alert.status = payload.status
        if payload.status == "resolved":
            alert.resolved_at = alert.resolved_at or utcnow()
        else:
            alert.resolved_at = None
    if "note" in payload.model_fields_set:
        alert.note = payload.note
    session.flush()
    return alert_out(alert)


def alert_out(alert: Alert) -> AlertOut:
    return AlertOut(
        id=alert.id,
        kind=alert.kind,
        level=alert.level,
        shop_id=alert.shop_id,
        shop_name=alert.shop.name,
        tool=alert.tool,
        campaign=alert.campaign,
        date=alert.date,
        message=alert.message,
        status=alert.status,
        found_at=alert.found_at,
        resolved_at=alert.resolved_at,
        note=alert.note,
    )
