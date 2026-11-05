"""日报文本和飞书 / 企业微信推送。地址只从环境变量读。"""

from __future__ import annotations

import os
from datetime import date, datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal

import httpx
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session, joinedload

from app.errors import AppError
from app.models import Alert, Issue, Shop
from app.overview import SHANGHAI, Compare, OverviewData, build_overview

def report_day(requested: date | None) -> date:
    if requested is not None:
        return requested
    return datetime.now(SHANGHAI).date() - timedelta(days=1)


def webhook_targets() -> list[tuple[str, str]]:
    targets = []
    feishu = os.environ.get("WB_FEISHU_WEBHOOK", "").strip()
    wecom = os.environ.get("WB_WECOM_WEBHOOK", "").strip()
    if feishu:
        targets.append(("feishu", feishu))
    if wecom:
        targets.append(("wecom", wecom))
    return targets


def build_daily_report(session: Session, day: date) -> dict:
    overview = build_overview(session, day=day, shop_id=None, brand=None)
    abnormal = abnormal_shops(session, day)
    alerts = top_alerts(session, day)
    issue_count = int(session.scalar(select(func.count(Issue.id)).where(Issue.status == "open")) or 0)
    markdown = render_markdown(overview, abnormal, alerts, issue_count)
    return {
        "date": day,
        "markdown": markdown,
        "overview": overview,
        "abnormal_shops": abnormal,
        "open_issue_count": issue_count,
        "alerts": alerts,
    }


def deliver(report: dict, *, dry_run: bool) -> dict:
    targets = webhook_targets()
    if not targets:
        raise AppError(400, "webhook_not_configured", "没有配置推送地址")
    if not dry_run:
        for name, url in targets:
            _post(name, url, report["markdown"])
    return {
        "date": report["date"],
        "dry_run": dry_run,
        "sent": not dry_run,
        "targets": [name for name, _url in targets],
        "markdown": report["markdown"],
    }


def abnormal_shops(session: Session, day: date) -> list[dict]:
    rows = session.execute(
        select(Shop, func.count(Alert.id))
        .join(Alert, (Alert.shop_id == Shop.id) & (Alert.status == "open") & (Alert.date == day))
        .group_by(Shop.id)
        .order_by(func.count(Alert.id).desc(), Shop.id)
    ).all()
    return [
        {
            "shop_id": shop.id,
            "name": shop.name,
            "platform": shop.platform,
            "brand": shop.brand,
            "open_count": int(count),
        }
        for shop, count in rows
    ]


def top_alerts(session: Session, day: date, limit: int = 5) -> list[Alert]:
    level_order = case((Alert.level == "must", 0), else_=1)
    return list(
        session.scalars(
            select(Alert)
            .where(Alert.status == "open", Alert.date == day)
            .options(joinedload(Alert.shop))
            .order_by(level_order, Alert.found_at.desc(), Alert.id.desc())
            .limit(limit)
        ).unique()
    )


def render_markdown(overview: OverviewData, abnormal: list[dict], alerts: list[Alert], issue_count: int) -> str:
    lines = [
        f"# 经营日报 {overview.day.isoformat()}",
        "",
        "## 总览",
        _count_line("访客", overview.visitors),
        _count_line("订单", overview.orders),
        _money_line("销售额", overview.sales_amount),
        _rate_line("转化率", overview.conversion_rate),
        _money_line("客单价", overview.avg_order_value),
        _money_line("投放花费", overview.ad_spend),
        _money_line("投放 GMV", overview.ad_gmv),
        _roi_line(overview.roi),
        "",
        f"当天未处理投放提醒 {overview.open_alerts} 条。",
        "",
        "## 异常店铺",
    ]
    if abnormal:
        lines.extend(
            f"- {item['name']}（{item['platform']}）：{item['open_count']} 条未处理投放提醒" for item in abnormal
        )
    else:
        lines.append("无")
    lines.extend(["", "## 商品问题", f"未处理商品问题 {issue_count} 条。", "", "## 投放提醒"])
    if alerts:
        lines.extend(f"- {alert.message}" for alert in alerts)
        hidden = overview.open_alerts - len(alerts)
        if hidden > 0:
            lines.append(f"另有 {hidden} 条未列出。")
    else:
        lines.append("无")
    return "\n".join(lines) + "\n"


def _post(name: str, url: str, markdown: str) -> None:
    if name == "feishu":
        payload = {"msg_type": "text", "content": {"text": markdown}}
    else:
        payload = {"msgtype": "markdown", "markdown": {"content": markdown}}
    try:
        response = httpx.post(url, json=payload, timeout=10)
    except httpx.HTTPError as exc:
        raise AppError(502, "push_failed", "推送失败") from exc
    if response.status_code >= 400:
        raise AppError(502, "push_failed", "推送失败")


def _count_line(label: str, item: Compare) -> str:
    return f"- {label}：{_trim(item.value or 0)}，昨日 {_trim(item.previous or 0)}，环比 {_change_text(item.change)}"


def _money_line(label: str, item: Compare) -> str:
    return (
        f"- {label}：{_trim(_quantize(item.value, '0.01'))}，昨日 {_trim(_quantize(item.previous, '0.01'))}，"
        f"环比 {_change_text(item.change)}"
    )


def _rate_line(label: str, item: Compare) -> str:
    return f"- {label}：{_percent(item.value)}，昨日 {_percent(item.previous)}，环比 {_change_text(item.change)}"


def _roi_line(item: Compare) -> str:
    return (
        f"- 投放 ROI：{_trim(_quantize(item.value, '0.0001'))}，昨日 {_trim(_quantize(item.previous, '0.0001'))}，"
        f"环比 {_change_text(item.change)}"
    )


def _percent(value: Decimal | None) -> str:
    if value is None:
        return "—"
    return _trim((Decimal(value) * 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)) + "%"


def _change_text(change: Decimal | None) -> str:
    if change is None:
        return "—"
    percent = (Decimal(change) * 100).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    if percent == 0:
        return "持平"
    sign = "+" if percent > 0 else ""
    return f"{sign}{_trim(percent)}%"


def _quantize(value: Decimal | None, places: str) -> Decimal | None:
    if value is None:
        return None
    return Decimal(value).quantize(Decimal(places), rounding=ROUND_HALF_UP)


def _trim(value: Decimal | int | None) -> str:
    if value is None:
        return "—"
    text = format(Decimal(value), "f")
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return text or "0"
