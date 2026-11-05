"""品牌活动：违禁词检查、活动模板和活动复盘。"""

from __future__ import annotations

from datetime import date, datetime, timedelta
from decimal import ROUND_HALF_UP, Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import AdSpend, BannedWord, Campaign, DailyMetric, Shop
from app.overview import SHANGHAI, _count_compare, _div, _money_compare, _rate_compare, compare_out

# 广告法第九条的绝对化用语和常见功效夸大词。只是起步清单，客户可在“资料”页增删。
DEFAULT_BANNED_WORDS: tuple[tuple[str, str, str, str | None], ...] = (
    ("最佳", "must", "广告法极限词", "优秀"),
    ("最好", "must", "广告法极限词", "很好"),
    ("最高级", "must", "广告法极限词", "高端"),
    ("最低价", "must", "广告法极限词", "优惠价"),
    ("最便宜", "must", "广告法极限词", "实惠"),
    ("最先进", "must", "广告法极限词", "先进"),
    ("全网最低", "must", "广告法极限词", "限时优惠"),
    ("国家级", "must", "广告法极限词", None),
    ("世界级", "must", "广告法极限词", None),
    ("顶级", "must", "广告法极限词", "高品质"),
    ("唯一", "must", "广告法极限词", None),
    ("史无前例", "must", "广告法极限词", None),
    ("绝对", "must", "广告法极限词", None),
    ("万能", "must", "广告法极限词", "多用途"),
    ("100%", "warn", "广告法极限词", "需有检测报告支撑"),
    ("第一", "warn", "广告法极限词", "确认不是排名用语，如“第一次”可忽略"),
    ("首选", "warn", "广告法极限词", "推荐"),
    ("极致", "warn", "广告法极限词", "出色"),
    ("永久", "warn", "广告法极限词", "长效"),
    ("零辐射", "must", "功效夸大", "低辐射（需检测报告）"),
    ("零甲醛", "must", "功效夸大", "低甲醛（需检测报告）"),
    ("根治", "must", "功效夸大", None),
    ("治疗", "must", "功效夸大", None),
    ("杀菌99.9%", "warn", "功效夸大", "需附检测报告编号"),
    ("仅此一次", "warn", "诱导用语", None),
    ("错过不再", "warn", "诱导用语", None),
)

CAMPAIGN_TEMPLATES: dict[str, dict] = {
    "holiday": {
        "name": "节假日促销",
        "tasks": [
            ("copy", "活动主文案和各平台短文案"),
            ("design", "活动主图和海报"),
            ("ads", "投放计划和预算分配"),
            ("member", "老客和加购未买人群触达"),
            ("other", "活动价和库存核对"),
        ],
    },
    "big_promo": {
        "name": "大促",
        "tasks": [
            ("other", "报名平台大促活动"),
            ("other", "活动价、底价和库存核对"),
            ("copy", "预热、正式、返场三阶段文案"),
            ("design", "主图、详情页和会场图"),
            ("ads", "预热和爆发期投放计划"),
            ("member", "预售定金和尾款提醒"),
        ],
    },
    "new_launch": {
        "name": "新品上市",
        "tasks": [
            ("other", "新品资料卡（卖点、参数、常见问题）"),
            ("copy", "上新文案和种草笔记"),
            ("design", "新品主图、详情页和短视频脚本"),
            ("ads", "新品冷启动投放"),
            ("member", "老客新品通知"),
        ],
    },
    "offline": {
        "name": "线下地推",
        "tasks": [
            ("other", "场地、物料和人员安排"),
            ("design", "易拉宝、传单和展台物料"),
            ("copy", "现场话术和引导加企业微信文案"),
            ("member", "现场客户登记和后续跟进"),
        ],
    },
    "other": {"name": "其他", "tasks": []},
}


def seed_banned_words(session: Session) -> None:
    if session.scalar(select(func.count()).select_from(BannedWord)):
        return
    for word, level, category, suggestion in DEFAULT_BANNED_WORDS:
        session.add(BannedWord(word=word, level=level, category=category, suggestion=suggestion, enabled=True))


def check_text(session: Session, text: str) -> dict:
    words = session.scalars(select(BannedWord).where(BannedWord.enabled.is_(True)).order_by(BannedWord.id)).all()
    haystack = text.casefold()
    hits = []
    for word in words:
        needle = word.word.casefold()
        positions = []
        start = haystack.find(needle)
        while start != -1:
            positions.append(start)
            start = haystack.find(needle, start + len(needle))
        if positions:
            hits.append(
                {
                    "word": word.word,
                    "level": word.level,
                    "category": word.category,
                    "suggestion": word.suggestion,
                    "positions": positions,
                }
            )
    hits.sort(key=lambda item: (0 if item["level"] == "must" else 1, item["positions"][0]))
    must = sum(1 for item in hits if item["level"] == "must")
    return {"passed": must == 0, "must_count": must, "warn_count": len(hits) - must, "hits": hits}


def today() -> date:
    return datetime.now(SHANGHAI).date()


def campaign_review(session: Session, campaign: Campaign) -> dict:
    shops = session.scalars(select(Shop).where(Shop.brand == campaign.brand).order_by(Shop.id)).all()
    shop_ids = [shop.id for shop in shops]
    days = (campaign.end_date - campaign.start_date).days + 1
    prev_end = campaign.start_date - timedelta(days=1)
    prev_start = prev_end - timedelta(days=days - 1)
    current = _range_totals(session, shop_ids, campaign.start_date, campaign.end_date)
    previous = _range_totals(session, shop_ids, prev_start, prev_end)

    metrics = {
        "visitors": compare_out(_count_compare(current["visitors"], previous["visitors"]), "visitors"),
        "orders": compare_out(_count_compare(current["orders"], previous["orders"]), "orders"),
        "sales_amount": compare_out(_money_compare(current["sales"], previous["sales"]), "sales_amount"),
        "conversion_rate": compare_out(
            _rate_compare(_div(current["orders"], current["visitors"]), _div(previous["orders"], previous["visitors"])),
            "conversion_rate",
        ),
        "ad_spend": compare_out(_money_compare(current["spend"], previous["spend"]), "ad_spend"),
        "ad_gmv": compare_out(_money_compare(current["gmv"], previous["gmv"]), "ad_gmv"),
        "roi": compare_out(
            _rate_compare(_div(current["gmv"], current["spend"]), _div(previous["gmv"], previous["spend"])), "roi"
        ),
    }
    per_shop = []
    for shop in shops:
        totals = _range_totals(session, [shop.id], campaign.start_date, campaign.end_date)
        per_shop.append(
            {
                "shop_id": shop.id,
                "shop_name": shop.name,
                "platform": shop.platform,
                "sales_amount": _money(totals["sales"]),
                "orders": totals["orders"],
                "ad_spend": _money(totals["spend"]),
                "roi": _ratio(_div(totals["gmv"], totals["spend"])),
            }
        )
    tasks_total = len(campaign.tasks)
    tasks_done = sum(1 for task in campaign.tasks if task.done)
    target_rate = _ratio(_div(current["sales"], campaign.target_sales)) if campaign.target_sales else None
    budget_rate = _ratio(_div(current["spend"], campaign.budget)) if campaign.budget else None
    phase = _phase(campaign)
    review = {
        "campaign_id": campaign.id,
        "name": campaign.name,
        "brand": campaign.brand,
        "phase": phase,
        "start_date": campaign.start_date,
        "end_date": campaign.end_date,
        "compare_start": prev_start,
        "compare_end": prev_end,
        "days": days,
        "days_with_data": current["days_with_data"],
        "metrics": metrics,
        "target_sales": _money(campaign.target_sales) if campaign.target_sales is not None else None,
        "target_rate": target_rate,
        "budget": _money(campaign.budget) if campaign.budget is not None else None,
        "budget_rate": budget_rate,
        "tasks_total": tasks_total,
        "tasks_done": tasks_done,
        "shops": per_shop,
    }
    review["markdown"] = _review_markdown(review)
    return review


def _phase(campaign: Campaign) -> str:
    now = today()
    if campaign.status == "cancelled":
        return "cancelled"
    if now < campaign.start_date:
        return "upcoming"
    if now > campaign.end_date:
        return "ended"
    return "running"


def _range_totals(session: Session, shop_ids: list[int], start: date, end: date) -> dict:
    if not shop_ids:
        return {"visitors": 0, "orders": 0, "sales": Decimal("0"), "spend": Decimal("0"), "gmv": Decimal("0"), "days_with_data": 0}
    visitors, orders, sales, days_with_data = session.execute(
        select(
            func.coalesce(func.sum(DailyMetric.visitors), 0),
            func.coalesce(func.sum(DailyMetric.orders), 0),
            func.coalesce(func.sum(DailyMetric.sales_amount), 0),
            func.count(func.distinct(DailyMetric.date)),
        ).where(DailyMetric.shop_id.in_(shop_ids), DailyMetric.date >= start, DailyMetric.date <= end)
    ).one()
    spend, gmv = session.execute(
        select(func.coalesce(func.sum(AdSpend.spend), 0), func.coalesce(func.sum(AdSpend.gmv), 0)).where(
            AdSpend.shop_id.in_(shop_ids), AdSpend.date >= start, AdSpend.date <= end
        )
    ).one()
    return {
        "visitors": int(visitors),
        "orders": int(orders),
        "sales": Decimal(str(sales)),
        "spend": Decimal(str(spend)),
        "gmv": Decimal(str(gmv)),
        "days_with_data": int(days_with_data),
    }


def _money(value: Decimal | None) -> float | None:
    if value is None:
        return None
    return float(Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def _ratio(value: Decimal | None) -> float | None:
    if value is None:
        return None
    return float(Decimal(value).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP))


def _pct(value: float | None) -> str:
    if value is None:
        return "—"
    return f"{value * 100:.1f}%"


def _review_markdown(review: dict) -> str:
    metrics = review["metrics"]
    sales = metrics["sales_amount"]
    roi = metrics["roi"]
    lines = [
        f"# 活动复盘：{review['name']}",
        f"{review['brand']} · {review['start_date'].isoformat()} 至 {review['end_date'].isoformat()}（{review['days']} 天）",
        "",
        f"- 销售额 {sales['value']:.2f}，比活动前同样天数{_change(sales['change'])}",
        f"- 订单 {metrics['orders']['value']}，比活动前{_change(metrics['orders']['change'])}",
        f"- 投放花费 {metrics['ad_spend']['value']:.2f}，ROI {roi['value'] if roi['value'] is not None else '—'}",
    ]
    if review["target_rate"] is not None:
        lines.append(f"- 销售目标完成 {_pct(review['target_rate'])}")
    if review["budget_rate"] is not None:
        lines.append(f"- 预算使用 {_pct(review['budget_rate'])}")
    lines.append(f"- 任务完成 {review['tasks_done']}/{review['tasks_total']}")
    if review["days_with_data"] < review["days"]:
        lines.append(f"- 注意：活动期 {review['days']} 天里只有 {review['days_with_data']} 天有经营数据")
    return "\n".join(lines)


def _change(change: float | None) -> str:
    if change is None:
        return "无法对比"
    if change == 0:
        return "持平"
    return f"{'增长' if change > 0 else '下降'} {abs(change) * 100:.1f}%"
