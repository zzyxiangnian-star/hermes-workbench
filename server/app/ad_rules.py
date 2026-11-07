"""三条投放规则。同一店铺、工具、计划、日期、规则只保留一条未结束的提醒。"""

from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.errors import AppError
from app.models import AdRule, AdSpend, Alert, utcnow
from app.rules import _json_number, _positive_number, fmt_number

DEFAULT_AD_RULES: list[dict[str, Any]] = [
    {
        "kind": "roi_below",
        "name": "ROI 低于阈值",
        "params": {"min_roi": 2, "min_spend": 200},
        "level": "warn",
    },
    {
        "kind": "spend_over_cap",
        "name": "花费超过日上限",
        "params": {"daily_cap": {}},
        "level": "must",
    },
    {
        "kind": "spend_spike",
        "name": "花费突然升高",
        "params": {"spike_pct": 150},
        "level": "warn",
    },
]

_PARAM_DEFAULTS: dict[str, dict[str, Any]] = {item["kind"]: dict(item["params"]) for item in DEFAULT_AD_RULES}
AlertKey = tuple[int, str, str, date]


def normalize_params(kind: str, params: dict[str, Any] | None) -> dict[str, Any]:
    if kind not in _PARAM_DEFAULTS:
        raise AppError(400, "invalid_params", "未知的规则类型")
    if params is None:
        params = {}
    if not isinstance(params, dict):
        raise AppError(400, "invalid_params", "规则参数必须是 JSON 对象")
    unknown = sorted(set(params) - set(_PARAM_DEFAULTS[kind]))
    if unknown:
        names = "、".join(unknown)
        raise AppError(400, "invalid_params", f"不能识别的参数：{names}")
    merged = {**_PARAM_DEFAULTS[kind], **params}
    if kind == "roi_below":
        merged["min_roi"] = _json_number(_positive_number(merged.get("min_roi"), "ROI 阈值"))
        merged["min_spend"] = _json_number(_positive_number(merged.get("min_spend"), "最低花费"))
    elif kind == "spend_over_cap":
        merged["daily_cap"] = _cap_map(merged.get("daily_cap"))
    elif kind == "spend_spike":
        merged["spike_pct"] = _json_number(_positive_number(merged.get("spike_pct"), "升高比例"))
    return merged


# 只对最近几天开提醒。改了阈值不会把一个月前的数据翻出来一堆提醒；更早的提醒保持原状。
CHECK_DAYS = 7


def run_ad_rules(session: Session) -> dict[str, int]:
    rules = session.scalars(select(AdRule).where(AdRule.enabled.is_(True)).order_by(AdRule.id)).all()
    rows = session.scalars(select(AdSpend)).all()
    latest = max((row.date for row in rows), default=None)
    cutoff = latest - timedelta(days=CHECK_DAYS - 1) if latest is not None else None
    opened = updated = resolved = 0
    for rule in rules:
        params = normalize_params(rule.kind, rule.params)
        violations = {
            key: message
            for key, message in evaluate(rule.kind, params, rows).items()
            if cutoff is None or key[3] >= cutoff
        }
        active = session.scalars(
            select(Alert).where(
                Alert.kind == rule.kind,
                Alert.status.in_(("open", "ignored")),
            )
        ).all()
        by_key: dict[AlertKey, list[Alert]] = {}
        for alert in active:
            by_key.setdefault(_alert_key(alert), []).append(alert)
        seen: set[AlertKey] = set()
        for key, message in violations.items():
            seen.add(key)
            existing = by_key.get(key, [])
            open_alerts = [item for item in existing if item.status == "open"]
            if open_alerts:
                for alert in open_alerts:
                    if alert.message != message or alert.level != rule.level:
                        alert.message = message
                        alert.level = rule.level
                        updated += 1
                continue
            if existing:
                continue
            shop_id, tool, campaign, day = key
            session.add(
                Alert(
                    kind=rule.kind,
                    level=rule.level,
                    shop_id=shop_id,
                    tool=tool,
                    campaign=campaign,
                    date=day,
                    message=message,
                    status="open",
                    found_at=utcnow(),
                    resolved_at=None,
                    note=None,
                )
            )
            opened += 1
        now = utcnow()
        for alert in active:
            if cutoff is not None and alert.date < cutoff:
                continue
            if _alert_key(alert) not in seen:
                alert.status = "resolved"
                alert.resolved_at = now
                resolved += 1
    session.flush()
    open_remaining = session.scalar(select(func.count(Alert.id)).where(Alert.status == "open")) or 0
    return {
        "rules_run": len(rules),
        "opened": opened,
        "updated": updated,
        "resolved": resolved,
        "open_remaining": int(open_remaining),
    }


def evaluate(kind: str, params: dict[str, Any], rows: list[AdSpend]) -> dict[AlertKey, str]:
    if kind == "roi_below":
        return _roi_below(rows, Decimal(str(params["min_roi"])), Decimal(str(params["min_spend"])))
    if kind == "spend_over_cap":
        return _spend_over_cap(rows, params["daily_cap"])
    if kind == "spend_spike":
        return _spend_spike(rows, Decimal(str(params["spike_pct"])))
    return {}


def _roi_below(rows: list[AdSpend], min_roi: Decimal, min_spend: Decimal) -> dict[AlertKey, str]:
    found: dict[AlertKey, str] = {}
    for row in rows:
        roi = _roi(row.gmv, row.spend)
        if roi is None or row.spend < min_spend or roi >= min_roi:
            continue
        found[_row_key(row)] = (
            f"{row.tool}·{row.campaign} {_mmdd(row.date)} ROI {fmt_number(roi)}，低于 {fmt_number(min_roi)}"
        )
    return found


def _spend_over_cap(rows: list[AdSpend], daily_cap: dict[str, Any]) -> dict[AlertKey, str]:
    found: dict[AlertKey, str] = {}
    for row in rows:
        if row.campaign not in daily_cap:
            continue
        cap = Decimal(str(daily_cap[row.campaign]))
        if row.spend <= cap:
            continue
        found[_row_key(row)] = (
            f"{row.tool}·{row.campaign} {_mmdd(row.date)} 花费 {fmt_number(row.spend)}，超过日上限 {fmt_number(cap)}"
        )
    return found


def _spend_spike(rows: list[AdSpend], spike_pct: Decimal) -> dict[AlertKey, str]:
    indexed = {_row_key(row): row.spend for row in rows}
    found: dict[AlertKey, str] = {}
    for row in rows:
        samples = []
        for offset in range(1, 8):
            previous = indexed.get((row.shop_id, row.tool, row.campaign, row.date - timedelta(days=offset)))
            if previous is not None:
                samples.append(previous)
        if not samples:
            continue
        average = sum(samples, Decimal("0")) / Decimal(len(samples))
        limit = average * spike_pct / Decimal(100)
        if row.spend <= limit:
            continue
        found[_row_key(row)] = (
            f"{row.tool}·{row.campaign} {_mmdd(row.date)} 花费 {fmt_number(row.spend)}，"
            f"高于前 7 天平均 {fmt_number(average)} 的 {fmt_number(spike_pct)}%"
        )
    return found


def _roi(gmv: Decimal, spend: Decimal) -> Decimal | None:
    if spend == 0:
        return None
    return Decimal(gmv) / Decimal(spend)


def _row_key(row: AdSpend) -> AlertKey:
    return (row.shop_id, row.tool, row.campaign, row.date)


def _alert_key(alert: Alert) -> AlertKey:
    return (alert.shop_id, alert.tool or "", alert.campaign or "", alert.date)


def _mmdd(day: date) -> str:
    return f"{day.month:02d}-{day.day:02d}"


def _cap_map(value: Any) -> dict[str, int | float]:
    if not isinstance(value, dict):
        raise AppError(400, "invalid_params", "日上限必须是 JSON 对象")
    cleaned: dict[str, int | float] = {}
    for raw_name, raw_amount in value.items():
        if not isinstance(raw_name, str):
            raise AppError(400, "invalid_params", "计划名必须是文字")
        name = raw_name.strip()
        if not name:
            raise AppError(400, "invalid_params", "计划名不能为空")
        cleaned[name] = _json_number(_positive_number(raw_amount, "日上限"))
    return cleaned
