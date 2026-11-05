from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.overview import build_overview, build_trend, list_ad_spend, overview_payload
from app.schemas import AdSpendOut, OverviewOut, TrendOut

router = APIRouter()


@router.get("/overview", response_model=OverviewOut)
def overview(
    day: date | None = Query(None, alias="date"),
    shop_id: int | None = None,
    brand: str | None = None,
    session: Session = Depends(get_db),
) -> dict:
    return overview_payload(build_overview(session, day=day, shop_id=shop_id, brand=brand))


@router.get("/overview/trend", response_model=TrendOut)
def overview_trend(
    days: int = Query(30, ge=1, le=366),
    shop_id: int | None = None,
    metric: str = "",
    session: Session = Depends(get_db),
) -> dict:
    return build_trend(session, days=days, shop_id=shop_id, metric=metric)


@router.get("/ad-spend", response_model=list[AdSpendOut])
def ad_spend(
    date_from: date | None = None,
    date_to: date | None = None,
    shop_id: int | None = None,
    tool: str | None = None,
    session: Session = Depends(get_db),
) -> list[dict]:
    return list_ad_spend(session, date_from=date_from, date_to=date_to, shop_id=shop_id, tool=tool)
