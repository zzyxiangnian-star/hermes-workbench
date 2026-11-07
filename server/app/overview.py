"""经营总览、趋势和投放汇总。比率在读取时计算。"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal
from zoneinfo import ZoneInfo

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.errors import AppError
from app.models import AdSpend, Alert, DailyMetric, Shop

METRICS = (
    "visitors",
    "orders",
    "sales_amount",
    "conversion_rate",
    "avg_order_value",
    "ad_spend",
    "ad_gmv",
    "roi",
)
SHANGHAI = ZoneInfo("Asia/Shanghai")


@dataclass
class DayTotals:
    visitors: int
    orders: int
    sales: Decimal
    spend: Decimal
    gmv: Decimal

    @classmethod
    def empty(cls) -> DayTotals:
        return cls(0, 0, Decimal("0"), Decimal("0"), Decimal("0"))


@dataclass
class Compare:
    value: Decimal | None
    previous: Decimal | None
    change: Decimal | None


@dataclass
class OverviewData:
    day: date
    compare_day: date
    shop_id: int | None
    brand: str | None
    open_alerts: int
    visitors: Compare
    orders: Compare
    sales_amount: Compare
    conversion_rate: Compare
    avg_order_value: Compare
    ad_spend: Compare
    ad_gmv: Compare
    roi: Compare


def build_overview(
    session: Session,
    *,
    day: date | None,
    shop_id: int | None,
    brand: str | None,
) -> OverviewData:
    shop_ids = selected_shop_ids(session, shop_id, brand)
    current_day = day or latest_day(session, shop_ids)
    previous_day = current_day - timedelta(days=1)
    current = aggregate(session, shop_ids, current_day)
    previous = aggregate(session, shop_ids, previous_day)
    return OverviewData(
        day=current_day,
        compare_day=previous_day,
        shop_id=shop_id,
        brand=brand,
        open_alerts=count_open_alerts(session, shop_ids, current_day),
        visitors=_count_compare(current.visitors, previous.visitors),
        orders=_count_compare(current.orders, previous.orders),
        sales_amount=_money_compare(current.sales, previous.sales),
        conversion_rate=_rate_compare(_div(current.orders, current.visitors), _div(previous.orders, previous.visitors)),
        avg_order_value=_rate_compare(_div(current.sales, current.orders), _div(previous.sales, previous.orders)),
        ad_spend=_money_compare(current.spend, previous.spend),
        ad_gmv=_money_compare(current.gmv, previous.gmv),
        roi=_rate_compare(_div(current.gmv, current.spend), _div(previous.gmv, previous.spend)),
    )


def build_trend(
    session: Session, *, days: int, shop_id: int | None, metric: str, day: date | None = None
) -> dict:
    if metric not in METRICS:
        names = "、".join(METRICS)
        raise AppError(400, "invalid_metric", f"指标必须是 {names}")
    shop_ids = selected_shop_ids(session, shop_id, None)
    end = day or latest_day(session, shop_ids)
    start = end - timedelta(days=days - 1)
    points = []
    cursor = start
    while cursor <= end:
        points.append({"date": cursor, "value": json_number(metric_value(aggregate(session, shop_ids, cursor), metric), metric)})
        cursor += timedelta(days=1)
    return {"metric": metric, "days": days, "shop_id": shop_id, "points": points}


def list_ad_spend(
    session: Session,
    *,
    date_from: date | None,
    date_to: date | None,
    shop_id: int | None,
    tool: str | None,
) -> list[dict]:
    if shop_id is not None and session.get(Shop, shop_id) is None:
        raise AppError(404, "shop_not_found", "店铺不存在")
    stmt = select(AdSpend, Shop).join(Shop, AdSpend.shop_id == Shop.id)
    if date_from is not None:
        stmt = stmt.where(AdSpend.date >= date_from)
    if date_to is not None:
        stmt = stmt.where(AdSpend.date <= date_to)
    if shop_id is not None:
        stmt = stmt.where(AdSpend.shop_id == shop_id)
    if tool:
        stmt = stmt.where(AdSpend.tool == tool.strip())
    grouped: dict[tuple[int, str, str], dict] = {}
    for spend, shop in session.execute(stmt).all():
        key = (shop.id, spend.tool, spend.campaign)
        bucket = grouped.get(key)
        if bucket is None:
            bucket = {"shop": shop, "tool": spend.tool, "campaign": spend.campaign, "spend": Decimal("0"), "gmv": Decimal("0")}
            grouped[key] = bucket
        bucket["spend"] += Decimal(spend.spend)
        bucket["gmv"] += Decimal(spend.gmv)
    alert_keys = open_alert_keys(session, date_from, date_to, shop_id, tool)
    items = []
    for key, bucket in grouped.items():
        spend = bucket["spend"]
        gmv = bucket["gmv"]
        items.append(
            {
                "shop_id": bucket["shop"].id,
                "shop_name": bucket["shop"].name,
                "tool": bucket["tool"],
                "campaign": bucket["campaign"],
                "spend": json_number(spend, "ad_spend"),
                "gmv": json_number(gmv, "ad_gmv"),
                "roi": json_number(_div(gmv, spend), "roi"),
                "has_alert": key in alert_keys,
            }
        )
    items.sort(key=lambda item: (-Decimal(str(item["spend"])), item["campaign"], item["shop_id"]))
    return items


def selected_shop_ids(session: Session, shop_id: int | None, brand: str | None) -> list[int] | None:
    if shop_id is not None and session.get(Shop, shop_id) is None:
        raise AppError(404, "shop_not_found", "店铺不存在")
    brand_text = brand.strip() if isinstance(brand, str) else ""
    if shop_id is None and not brand_text:
        return None
    stmt = select(Shop.id)
    if shop_id is not None:
        stmt = stmt.where(Shop.id == shop_id)
    if brand_text:
        stmt = stmt.where(Shop.brand == brand_text)
    return list(session.scalars(stmt))


def latest_day(session: Session, shop_ids: list[int] | None) -> date:
    metric_stmt = select(func.max(DailyMetric.date))
    ad_stmt = select(func.max(AdSpend.date))
    if shop_ids is not None:
        if not shop_ids:
            return datetime.now(SHANGHAI).date()
        metric_stmt = metric_stmt.where(DailyMetric.shop_id.in_(shop_ids))
        ad_stmt = ad_stmt.where(AdSpend.shop_id.in_(shop_ids))
    candidates = [value for value in (session.scalar(metric_stmt), session.scalar(ad_stmt)) if value is not None]
    if not candidates:
        return datetime.now(SHANGHAI).date()
    return max(candidates)


def aggregate(session: Session, shop_ids: list[int] | None, day: date) -> DayTotals:
    if shop_ids is not None and not shop_ids:
        return DayTotals.empty()
    metric_stmt = select(DailyMetric).where(DailyMetric.date == day)
    ad_stmt = select(AdSpend).where(AdSpend.date == day)
    if shop_ids is not None:
        metric_stmt = metric_stmt.where(DailyMetric.shop_id.in_(shop_ids))
        ad_stmt = ad_stmt.where(AdSpend.shop_id.in_(shop_ids))
    metrics = session.scalars(metric_stmt).all()
    ads = session.scalars(ad_stmt).all()
    return DayTotals(
        visitors=sum(item.visitors for item in metrics),
        orders=sum(item.orders for item in metrics),
        sales=sum((Decimal(item.sales_amount) for item in metrics), Decimal("0")),
        spend=sum((Decimal(item.spend) for item in ads), Decimal("0")),
        gmv=sum((Decimal(item.gmv) for item in ads), Decimal("0")),
    )


def count_open_alerts(session: Session, shop_ids: list[int] | None, day: date) -> int:
    if shop_ids is not None and not shop_ids:
        return 0
    stmt = select(func.count(Alert.id)).where(Alert.status == "open", Alert.date == day)
    if shop_ids is not None:
        stmt = stmt.where(Alert.shop_id.in_(shop_ids))
    return int(session.scalar(stmt) or 0)


def metric_value(totals: DayTotals, metric: str) -> Decimal | None:
    if metric == "visitors":
        return Decimal(totals.visitors)
    if metric == "orders":
        return Decimal(totals.orders)
    if metric == "sales_amount":
        return totals.sales
    if metric == "conversion_rate":
        return _div(totals.orders, totals.visitors)
    if metric == "avg_order_value":
        return _div(totals.sales, totals.orders)
    if metric == "ad_spend":
        return totals.spend
    if metric == "ad_gmv":
        return totals.gmv
    if metric == "roi":
        return _div(totals.gmv, totals.spend)
    return None


def json_number(value: Decimal | None, metric: str):
    if value is None:
        return None
    if metric in {"conversion_rate", "roi"}:
        number = Decimal(value).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
        if number == number.to_integral_value():
            return int(number)
        return float(number)
    if metric in {"visitors", "orders"}:
        return int(value)
    number = Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    return float(number)


def overview_payload(data: OverviewData) -> dict:
    return {
        "date": data.day,
        "compare_date": data.compare_day,
        "shop_id": data.shop_id,
        "brand": data.brand,
        "open_alerts": data.open_alerts,
        "metrics": {
            "visitors": compare_out(data.visitors, "visitors"),
            "orders": compare_out(data.orders, "orders"),
            "sales_amount": compare_out(data.sales_amount, "sales_amount"),
            "conversion_rate": compare_out(data.conversion_rate, "conversion_rate"),
            "avg_order_value": compare_out(data.avg_order_value, "avg_order_value"),
            "ad_spend": compare_out(data.ad_spend, "ad_spend"),
            "ad_gmv": compare_out(data.ad_gmv, "ad_gmv"),
            "roi": compare_out(data.roi, "roi"),
        },
    }


def compare_out(item: Compare, metric: str) -> dict:
    return {
        "value": json_number(item.value, metric),
        "previous": json_number(item.previous, metric),
        "change": None if item.change is None else float(item.change.quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)),
    }


def _count_compare(current: int, previous: int) -> Compare:
    return Compare(Decimal(current), Decimal(previous), _change(Decimal(current), Decimal(previous)))


def _money_compare(current: Decimal, previous: Decimal) -> Compare:
    return Compare(current, previous, _change(current, previous))


def _rate_compare(current: Decimal | None, previous: Decimal | None) -> Compare:
    return Compare(current, previous, _change(current, previous))


def _change(current: Decimal | None, previous: Decimal | None) -> Decimal | None:
    if current is None or previous is None or previous == 0:
        return None
    return (Decimal(current) - Decimal(previous)) / Decimal(previous)


def _div(numerator: Decimal | int, denominator: Decimal | int) -> Decimal | None:
    if Decimal(denominator) == 0:
        return None
    return Decimal(numerator) / Decimal(denominator)


def open_alert_keys(
    session: Session,
    date_from: date | None,
    date_to: date | None,
    shop_id: int | None,
    tool: str | None,
) -> set[tuple[int, str, str]]:
    stmt = select(Alert.shop_id, Alert.tool, Alert.campaign).where(Alert.status == "open")
    if date_from is not None:
        stmt = stmt.where(Alert.date >= date_from)
    if date_to is not None:
        stmt = stmt.where(Alert.date <= date_to)
    if shop_id is not None:
        stmt = stmt.where(Alert.shop_id == shop_id)
    if tool:
        stmt = stmt.where(Alert.tool == tool.strip())
    return {(shop, tool_name or "", campaign or "") for shop, tool_name, campaign in session.execute(stmt).all()}
