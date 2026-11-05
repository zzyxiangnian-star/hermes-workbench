"""电商助手用的 MCP 工具。只读为主，唯一的写操作是给问题追加备注。

HTTP：随主服务挂在 /mcp（Streamable HTTP）。
本地调试：python -m app.mcp_server --stdio
"""

from __future__ import annotations

import argparse
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from datetime import date
from typing import Any

from fastapi.encoders import jsonable_encoder
from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload, sessionmaker

from app.api.alerts import list_alerts
from app.api.issues import _issue_out, list_issues
from app.api.reports import _report_out
from app.errors import AppError
from app.models import Issue, Product
from app.overview import build_overview, build_trend, overview_payload
from app.reports import build_daily_report, report_day

NOTE_PREFIX = "[电商助手] "
MAX_ISSUES = 50
MAX_NOTE = 500

INSTRUCTIONS = (
    "Hermes 工作台的电商数据。可以查商品问题、单个商品、经营总览、趋势、投放提醒和日报，"
    "并能给商品问题追加备注。不能改状态、改规则、导入数据、发日报或改价。"
)


class ToolFailure(Exception):
    """工具调用失败，消息直接给模型看。"""


def build_mcp(session_factory: sessionmaker) -> FastMCP:
    mcp = FastMCP(
        name="hermes-workbench",
        instructions=INSTRUCTIONS,
        streamable_http_path="/mcp",
        stateless_http=True,
        json_response=True,
        transport_security=TransportSecuritySettings(
            enable_dns_rebinding_protection=True,
            allowed_hosts=["127.0.0.1:*", "localhost:*", "[::1]:*", "127.0.0.1", "localhost"],
            allowed_origins=["http://127.0.0.1:*", "http://localhost:*", "http://[::1]:*", "null"],
        ),
    )

    @contextmanager
    def session_scope() -> Iterator[Session]:
        session = session_factory()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def run(fn: Callable[[Session], Any]) -> Any:
        try:
            with session_scope() as session:
                return jsonable_encoder(fn(session))
        except AppError as exc:
            raise ToolFailure(exc.message) from exc

    @mcp.tool(
        description=(
            "列出商品规则检查发现的问题（低于底价、跨店价差、库存不足、缺活动等）。"
            "默认只看未处理的（status=open）。可按店铺、级别（must 必须处理 / warn 提醒）筛选。"
            f"最多返回 {MAX_ISSUES} 条，按发现时间倒序。"
        )
    )
    def wb_list_product_issues(
        status: str = "open",
        level: str | None = None,
        shop_id: int | None = None,
        limit: int = 20,
    ) -> dict[str, Any]:
        size = max(1, min(int(limit), MAX_ISSUES))

        def query(session: Session) -> dict:
            items = list_issues(status=status, level=level, shop_id=shop_id, session=session)
            return {"total": len(items), "returned": min(size, len(items)), "items": items[:size]}

        return run(query)

    @mcp.tool(
        description=(
            "查一个商品的详情和它的全部问题。传 product_id，或传 sku（货号）/ product_code（商品编码）。"
            "同一货号在多个店铺都有时会全部返回（最多 10 个）。"
        )
    )
    def wb_get_product(
        product_id: int | None = None,
        sku: str | None = None,
        product_code: str | None = None,
    ) -> dict[str, Any]:
        if product_id is None and not (sku and sku.strip()) and not (product_code and product_code.strip()):
            raise ToolFailure("请提供 product_id、sku 或 product_code 其中一个")

        def query(session: Session) -> dict:
            stmt = select(Product).options(joinedload(Product.shop)).order_by(Product.id).limit(10)
            if product_id is not None:
                stmt = stmt.where(Product.id == product_id)
            else:
                conditions = []
                if sku and sku.strip():
                    conditions.append(Product.sku == sku.strip())
                if product_code and product_code.strip():
                    conditions.append(Product.product_code == product_code.strip())
                stmt = stmt.where(or_(*conditions))
            products = session.scalars(stmt).unique().all()
            if not products:
                raise AppError(404, "product_not_found", "找不到这个商品")
            return {"items": [_product_detail(session, item) for item in products]}

        return run(query)

    @mcp.tool(
        description=(
            "经营总览：访客、订单、销售额、转化率、客单价、投放花费、投放成交、ROI，以及和前一天的对比。"
            "date 格式 YYYY-MM-DD，不传就用有数据的最近一天。可按 shop_id 或 brand 筛选。"
        )
    )
    def wb_get_overview(
        date: str | None = None,
        shop_id: int | None = None,
        brand: str | None = None,
    ) -> dict[str, Any]:
        day = _parse_day(date)
        return run(lambda session: overview_payload(build_overview(session, day=day, shop_id=shop_id, brand=brand)))

    @mcp.tool(
        description=(
            "某个指标最近 N 天的每日趋势。metric 取 visitors、orders、sales_amount、conversion_rate、"
            "avg_order_value、ad_spend、ad_gmv、roi 之一；days 为 1 到 366，默认 30；可按 shop_id 筛选。"
        )
    )
    def wb_get_trend(metric: str, days: int = 30, shop_id: int | None = None) -> dict[str, Any]:
        if not 1 <= int(days) <= 366:
            raise ToolFailure("天数必须在 1 到 366 之间")
        return run(lambda session: build_trend(session, days=int(days), shop_id=shop_id, metric=metric))

    @mcp.tool(
        description=(
            "列出投放提醒（ROI 过低、花费超上限、花费突增）。默认只看未处理的（status=open）。"
            f"可按店铺、级别筛选，最多返回 {MAX_ISSUES} 条。"
        )
    )
    def wb_list_alerts(
        status: str = "open",
        level: str | None = None,
        shop_id: int | None = None,
        limit: int = 20,
    ) -> dict[str, Any]:
        size = max(1, min(int(limit), MAX_ISSUES))

        def query(session: Session) -> dict:
            items = list_alerts(status=status, level=level, shop_id=shop_id, session=session)
            return {"total": len(items), "returned": min(size, len(items)), "items": items[:size]}

        return run(query)

    @mcp.tool(
        description=(
            "生成某一天的经营日报（Markdown 正文 + 数据）。date 格式 YYYY-MM-DD，不传就是昨天（北京时间）。"
            "只生成，不发送；发送由人在工作台操作。"
        )
    )
    def wb_get_daily_report(date: str | None = None) -> dict[str, Any]:
        day = _parse_day(date)
        return run(lambda session: _report_out(build_daily_report(session, report_day(day))))

    @mcp.tool(
        description=(
            "给一条商品问题追加一段备注（例如分析结论、建议怎么处理）。"
            f"备注会加上“{NOTE_PREFIX.strip()}”前缀，接在原备注后面，不会覆盖，也不会改问题状态。"
            f"单次最多 {MAX_NOTE} 字。"
        )
    )
    def wb_add_note(issue_id: int, note: str) -> dict[str, Any]:
        text = (note or "").strip()
        if not text:
            raise ToolFailure("备注不能为空")
        if len(text) > MAX_NOTE:
            raise ToolFailure(f"备注最多 {MAX_NOTE} 字")

        def write(session: Session) -> Any:
            issue = session.scalar(
                select(Issue)
                .where(Issue.id == issue_id)
                .options(joinedload(Issue.product).joinedload(Product.shop), joinedload(Issue.rule))
            )
            if issue is None:
                raise AppError(404, "issue_not_found", "问题不存在")
            line = NOTE_PREFIX + text
            issue.note = f"{issue.note}\n{line}" if issue.note else line
            session.flush()
            return _issue_out(issue)

        return run(write)

    return mcp


def _product_detail(session: Session, product: Product) -> dict:
    issues = session.scalars(
        select(Issue)
        .where(Issue.product_id == product.id)
        .options(joinedload(Issue.product).joinedload(Product.shop), joinedload(Issue.rule))
        .order_by(Issue.found_at.desc(), Issue.id.desc())
    ).unique().all()
    shop = product.shop
    return {
        "id": product.id,
        "shop_id": shop.id,
        "shop_name": shop.name,
        "platform": shop.platform,
        "brand": shop.brand,
        "sku": product.sku,
        "product_code": product.product_code,
        "title": product.title,
        "price": product.price,
        "floor_price": product.floor_price,
        "stock": product.stock,
        "activity": product.activity,
        "updated_at": product.updated_at,
        "issues": [_issue_out(item) for item in issues],
    }


def _parse_day(value: str | None) -> date | None:
    if value is None or not value.strip():
        return None
    try:
        return date.fromisoformat(value.strip())
    except ValueError as exc:
        raise ToolFailure("日期格式应为 YYYY-MM-DD") from exc


def main() -> None:
    parser = argparse.ArgumentParser(description="Hermes 工作台 MCP 工具")
    parser.add_argument("--stdio", action="store_true", help="用 stdio 方式运行（本地调试或不开 HTTP 服务时用）")
    args = parser.parse_args()
    if not args.stdio:
        parser.error("HTTP 方式随主服务启动（/mcp）；单独运行请加 --stdio")

    from app.db import default_database_url, init_db, make_engine, make_session_factory

    url = default_database_url()
    engine = make_engine(url)
    init_db(engine, url)
    build_mcp(make_session_factory(engine)).run("stdio")


if __name__ == "__main__":
    main()
