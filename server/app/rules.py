"""四种商品规则。同一商品同一规则只保留一条未结束的问题。"""

from __future__ import annotations

from decimal import Decimal
from typing import Any

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.errors import AppError
from app.models import Issue, Product, Rule, Shop, utcnow

DEFAULT_RULES: list[dict[str, Any]] = [
    {
        "kind": "below_floor",
        "name": "售价低于底价",
        "params": {},
        "level": "must",
    },
    {
        "kind": "cross_shop_gap",
        "name": "跨店价差过大",
        "params": {"max_gap_pct": 5},
        "level": "warn",
    },
    {
        "kind": "low_stock",
        "name": "库存过低",
        "params": {"min_stock": 10},
        "level": "warn",
    },
    {
        "kind": "missing_activity",
        "name": "未报名指定活动",
        "params": {"required_activity": None},
        "level": "warn",
    },
]

_PARAM_DEFAULTS: dict[str, dict[str, Any]] = {item["kind"]: dict(item["params"]) for item in DEFAULT_RULES}


def fmt_number(value: Decimal | int | float) -> str:
    number = Decimal(str(value)).quantize(Decimal("0.01"))
    text = format(number, "f")
    if "." in text:
        text = text.rstrip("0").rstrip(".")
    return text


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
    if kind == "cross_shop_gap":
        merged["max_gap_pct"] = _json_number(_positive_number(merged.get("max_gap_pct"), "价差百分比"))
    elif kind == "low_stock":
        merged["min_stock"] = _whole_number(merged.get("min_stock"), "最低库存")
    elif kind == "missing_activity":
        merged["required_activity"] = _optional_text(merged.get("required_activity"))
    return merged


def run_enabled_rules(session: Session) -> dict[str, int]:
    rules = session.scalars(select(Rule).where(Rule.enabled.is_(True)).order_by(Rule.id)).all()
    opened = updated = resolved = 0
    for rule in rules:
        params = normalize_params(rule.kind, rule.params)
        violations = evaluate(session, rule.kind, params)
        active = session.scalars(
            select(Issue).where(
                Issue.rule_id == rule.id,
                Issue.status.in_(("open", "ignored")),
            )
        ).all()
        by_product: dict[int, list[Issue]] = {}
        for issue in active:
            by_product.setdefault(issue.product_id, []).append(issue)
        seen: set[int] = set()
        for product_id, message in violations.items():
            seen.add(product_id)
            existing = by_product.get(product_id, [])
            open_issues = [item for item in existing if item.status == "open"]
            if open_issues:
                for issue in open_issues:
                    if issue.message != message or issue.level != rule.level:
                        issue.message = message
                        issue.level = rule.level
                        updated += 1
                continue
            if existing:
                continue
            session.add(
                Issue(
                    product_id=product_id,
                    rule_id=rule.id,
                    level=rule.level,
                    message=message,
                    status="open",
                    found_at=utcnow(),
                    resolved_at=None,
                    note=None,
                )
            )
            opened += 1
        now = utcnow()
        for issue in active:
            if issue.product_id not in seen:
                issue.status = "resolved"
                issue.resolved_at = now
                resolved += 1
    session.flush()
    open_remaining = session.scalar(select(func.count(Issue.id)).where(Issue.status == "open")) or 0
    return {
        "rules_run": len(rules),
        "opened": opened,
        "updated": updated,
        "resolved": resolved,
        "open_remaining": int(open_remaining),
    }


def evaluate(session: Session, kind: str, params: dict[str, Any]) -> dict[int, str]:
    if kind == "below_floor":
        return _below_floor(session)
    if kind == "cross_shop_gap":
        return _cross_shop_gap(session, Decimal(str(params["max_gap_pct"])))
    if kind == "low_stock":
        return _low_stock(session, int(params["min_stock"]))
    if kind == "missing_activity":
        return _missing_activity(session, params.get("required_activity"))
    return {}


def _below_floor(session: Session) -> dict[int, str]:
    rows = session.scalars(
        select(Product).where(
            Product.floor_price.is_not(None),
            Product.price < Product.floor_price,
        )
    ).all()
    return {
        product.id: f"售价 {fmt_number(product.price)} 低于底价 {fmt_number(product.floor_price)}"
        for product in rows
    }


def _low_stock(session: Session, min_stock: int) -> dict[int, str]:
    rows = session.scalars(select(Product).where(Product.stock < min_stock)).all()
    return {product.id: f"库存 {product.stock} 低于最低库存 {min_stock}" for product in rows}


def _missing_activity(session: Session, required: str | None) -> dict[int, str]:
    if not required:
        return {}
    rows = session.scalars(
        select(Product).where(
            or_(
                Product.activity.is_(None),
                func.trim(Product.activity) != required,
            )
        )
    ).all()
    return {product.id: f"未报名活动「{required}」" for product in rows}


def _cross_shop_gap(session: Session, max_gap_pct: Decimal) -> dict[int, str]:
    rows = session.execute(
        select(Product, Shop)
        .join(Shop, Product.shop_id == Shop.id)
        .where(Product.product_code.is_not(None))
    ).all()
    grouped: dict[str, list[tuple[Product, Shop]]] = {}
    for product, shop in rows:
        grouped.setdefault(product.product_code, []).append((product, shop))
    found: dict[int, str] = {}
    for code, items in grouped.items():
        shops = {shop.id for _, shop in items}
        if len(shops) < 2:
            continue
        best: tuple | None = None
        for product, shop in items:
            for other, other_shop in items:
                if shop.id == other_shop.id:
                    continue
                if product.price <= other.price:
                    low_product, low_shop = product, shop
                    high_product, high_shop = other, other_shop
                else:
                    low_product, low_shop = other, other_shop
                    high_product, high_shop = product, shop
                infinite = low_product.price == 0 and high_product.price > 0
                if infinite:
                    pct = Decimal("Infinity")
                elif low_product.price == 0:
                    continue
                else:
                    pct = (high_product.price - low_product.price) / low_product.price * Decimal(100)
                rank = (infinite, pct, -low_shop.id, high_shop.id)
                if best is None or rank > best[0]:
                    best = (rank, low_product, low_shop, high_product, high_shop, infinite, pct)
        if best is None:
            continue
        _, low_product, low_shop, high_product, high_shop, infinite, pct = best
        if not infinite and pct <= max_gap_pct:
            continue
        if infinite:
            message = (
                f"货号 {code} 在{low_shop.name}售价 {fmt_number(low_product.price)}，"
                f"在{high_shop.name}售价 {fmt_number(high_product.price)}，"
                f"最低售价为 0，价差超过 {fmt_number(max_gap_pct)}%"
            )
        else:
            message = (
                f"货号 {code} 在{low_shop.name}售价 {fmt_number(low_product.price)}，"
                f"在{high_shop.name}售价 {fmt_number(high_product.price)}，"
                f"价差 {fmt_number(pct)}% 超过 {fmt_number(max_gap_pct)}%"
            )
        for product, _shop in items:
            found[product.id] = message
    return found


def _positive_number(value: Any, label: str) -> Decimal:
    if isinstance(value, bool) or not isinstance(value, (int, float, str, Decimal)):
        raise AppError(400, "invalid_params", f"{label}必须是数字")
    try:
        number = Decimal(str(value))
    except Exception as exc:
        raise AppError(400, "invalid_params", f"{label}必须是数字") from exc
    if number < 0:
        raise AppError(400, "invalid_params", f"{label}不能为负数")
    return number


def _whole_number(value: Any, label: str) -> int:
    number = _positive_number(value, label)
    if number != number.to_integral_value():
        raise AppError(400, "invalid_params", f"{label}必须是整数")
    return int(number)


def _json_number(number: Decimal) -> int | float:
    if number == number.to_integral_value():
        return int(number)
    return float(number)


def _optional_text(value: Any) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        raise AppError(400, "invalid_params", "活动名称必须是文字")
    text = value.strip()
    return text or None
