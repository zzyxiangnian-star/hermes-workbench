"""电商助手、品牌助手用的 MCP 工具。只读为主；写操作只有：给商品问题、安装工单、询盘追加备注，新建稿件草稿，给设计需求单交候选稿，新建视频脚本、给写脚本中的分镜交配音和画面。

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
from mcp.server.transport_security import TransportSecuritySettings

try:  # mcp 1.x
    from mcp.server.fastmcp import FastMCP as _MCPServer
    from mcp.server.fastmcp.exceptions import ToolError

    MCP_V1 = True
except ImportError:  # mcp 2.x 把 FastMCP 改名为 MCPServer，HTTP 设置挪到 streamable_http_app()
    from mcp.server.mcpserver import MCPServer as _MCPServer
    from mcp.server.mcpserver.exceptions import ToolError

    MCP_V1 = False
from mcp.types import ToolAnnotations
from pydantic import ValidationError
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload, sessionmaker

from app.api.alerts import list_alerts
from app.api.brand_assets import card_out, get_guide, list_cards
from app.api.campaigns import _campaign, campaign_detail, list_campaigns
from app.api.contents import _content, content_detail, create_content, list_contents
from app.api.installs import _install, get_install, install_out, install_summary, list_installs
from app.installs import add_note as add_install_note
from app.api.customers import _inquiry, get_customer, get_inquiry, inquiry_detail, inquiry_products
from app.api.customers import list_customers, list_inquiries, segment_summary
from app.customers import add_inquiry_note, mask_text
from app.api.design import _request as _design_request
from app.api.design import asset_out, get_request as get_design_request, list_requests as list_design_requests
from app.design import add_candidate, load_ai_file, load_ai_image, store_file
from app.api.design import list_assets
from app.api.video import _project as _video_project
from app.installs import _event as _video_event
from app.api.video import attach_media, create_project as create_video_project, get_project as get_video_project
from app.api.video import list_projects as list_video_projects
from app.design_schemas import VideoProjectIn
from app.video import check_media, require_editable
from app.installs import mask_address, mask_name, mask_phone
from app.brand_schemas import ContentIn
from app.contents import compliance_of
from app.api.issues import _issue_out, list_issues
from app.api.reports import _report_out
from app.errors import AppError
from app.brand import campaign_review, check_text
from app.models import Asset, Issue, Product, ProductCard, utcnow
from app.overview import build_overview, build_trend, overview_payload
from app.reports import build_daily_report, report_day

NOTE_PREFIX = "[电商助手] "
AI_AUTHOR = "品牌助手"
AI_DESIGNER = "设计助手"
AI_VIDEO = "视频助手"
MAX_ISSUES = 50
MAX_NOTE = 500

INSTRUCTIONS = (
    "Hermes 工作台的数据。电商：商品问题、单个商品、经营总览、趋势、投放提醒、日报、安装工单（顾客信息已打码），"
    "客户档案和会员分层、B 端询盘和报价（客户信息已打码），可给商品问题、安装工单和询盘追加备注。"
    "品牌活动：活动日历和复盘、违禁词检查、商品资料卡、品牌规范、稿件，可把文案存成新草稿；设计需求单，可把生成的图交成候选稿；短视频项目，可新建分镜脚本、给分镜交配音和画面。"
    "不能改状态、改规则、导入数据、发日报、改价，不能建报价单或批量跟进、不能给客户发消息，不能送审、通过或发布稿件，不能定稿、退回或删除设计稿，不能送审或通过视频脚本，也不能新建或修改活动和资料。"
)


class ToolFailure(ToolError):
    """工具调用失败，消息直接给模型看。"""


def _security() -> TransportSecuritySettings:
    return TransportSecuritySettings(
        enable_dns_rebinding_protection=True,
        allowed_hosts=["127.0.0.1:*", "localhost:*", "[::1]:*", "127.0.0.1", "localhost"],
        allowed_origins=["http://127.0.0.1:*", "http://localhost:*", "http://[::1]:*", "null"],
    )


_HTTP = {"streamable_http_path": "/mcp", "stateless_http": True, "json_response": True}


def http_routes(mcp: Any) -> list:
    """/mcp 的路由。之后才能用 mcp.session_manager。兼容 mcp 1.x 和 2.x。"""
    if MCP_V1:
        app = mcp.streamable_http_app()
    else:
        app = mcp.streamable_http_app(**_HTTP, transport_security=_security())
    return list(app.routes)


WRITE_TOOLS = frozenset(
    {
        "wb_add_note",
        "wb_create_draft",
        "wb_add_install_note",
        "wb_add_inquiry_note",
        "wb_add_design_candidate",
        "wb_create_video_project",
        "wb_add_shot_media",
    }
)


def build_mcp(session_factory: sessionmaker) -> Any:
    if MCP_V1:
        mcp = _MCPServer(name="hermes-workbench", instructions=INSTRUCTIONS, **_HTTP, transport_security=_security())
    else:
        mcp = _MCPServer(name="hermes-workbench", instructions=INSTRUCTIONS)

    # 给每个工具标上只读 / 写入注解。Hermes 据此判断后端断开时能不能自动重试只读工具。
    register = mcp.tool

    def tool(**kwargs: Any) -> Any:
        def decorate(fn: Any) -> Any:
            write = fn.__name__ in WRITE_TOOLS
            hints = ToolAnnotations(readOnlyHint=not write, destructiveHint=False, idempotentHint=not write, openWorldHint=False)
            return register(annotations=hints, **kwargs)(fn)

        return decorate

    mcp.tool = tool

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

    # ---- C04 品牌活动（只读）----

    @mcp.tool(
        description=(
            "列出活动（活动日历）。可按时间段（date_from、date_to，YYYY-MM-DD，返回和这段时间有交集的活动）、"
            "品牌、状态（planning 筹备 / running 进行中 / ended 已结束 / cancelled 已取消）筛选。"
        )
    )
    def wb_list_campaigns(
        date_from: str | None = None,
        date_to: str | None = None,
        brand: str | None = None,
        status: str | None = None,
    ) -> dict[str, Any]:
        start, end = _parse_day(date_from), _parse_day(date_to)
        return run(
            lambda session: {
                "items": list_campaigns(date_from=start, date_to=end, brand=brand, status=status, session=session)
            }
        )

    @mcp.tool(
        description=(
            "查一个活动的详情和任务清单，以及复盘数据：活动期间该品牌所有店铺的访客、订单、销售额、投放花费、ROI，"
            "和活动前同样天数的对比，目标完成率、预算使用率，并附一段复盘 Markdown。"
        )
    )
    def wb_get_campaign(campaign_id: int) -> dict[str, Any]:
        def query(session: Session) -> dict:
            campaign = _campaign(session, campaign_id)
            return {"campaign": campaign_detail(campaign), "review": campaign_review(session, campaign)}

        return run(query)

    @mcp.tool(
        description=(
            "用违禁词库检查一段文案（广告法极限词、功效夸大、诱导用语等）。返回是否通过、命中的词、级别、"
            "位置和替换建议。must 级命中就算不通过。只检查，不保存。"
        )
    )
    def wb_check_compliance(text: str) -> dict[str, Any]:
        if len(text or "") > 50000:
            raise ToolFailure("文字太长，最多 5 万字")
        return run(lambda session: check_text(session, text or ""))

    @mcp.tool(
        description=(
            "查商品资料卡：卖点、参数、常见问题、是否需要安装，以及各店铺同编码商品的售价和库存。"
            "传 product_code 精确查；或传 q 按名称/编码模糊找（最多 10 个）。写文案、回复客户前先查它。"
        )
    )
    def wb_get_product_card(product_code: str | None = None, q: str | None = None) -> dict[str, Any]:
        if not (product_code and product_code.strip()) and not (q and q.strip()):
            raise ToolFailure("请提供 product_code 或 q")

        def query(session: Session) -> dict:
            if product_code and product_code.strip():
                card = session.scalar(select(ProductCard).where(ProductCard.product_code == product_code.strip()))
                if card is None:
                    raise AppError(404, "product_card_not_found", "这个商品编码还没有资料卡")
                return {"items": [card_out(session, card)]}
            return {"items": list_cards(brand=None, q=q, session=session)[:10]}

        return run(query)

    @mcp.tool(
        description="查某个品牌的品牌规范：语气、品牌色、字体、Logo 用法和其他注意事项。写文案和设计需求前先查它。"
    )
    def wb_get_brand_guide(brand: str) -> dict[str, Any]:
        return run(lambda session: get_guide(brand=brand or "", session=session))

    # ---- C05 内容 ----

    @mcp.tool(
        description=(
            "列出稿件。可按状态（draft 草稿 / in_review 送审中 / approved 已通过 / rejected 被退回 / published 已发布）、"
            "品牌、活动 campaign_id、平台（wechat、xiaohongshu、douyin、weibo、tmall、jd、pdd、other）、关键词 q 筛选。"
        )
    )
    def wb_list_contents(
        status: str | None = None,
        brand: str | None = None,
        campaign_id: int | None = None,
        platform: str | None = None,
        q: str | None = None,
    ) -> dict[str, Any]:
        return run(
            lambda session: {
                "items": list_contents(
                    status=status, brand=brand, campaign_id=campaign_id, platform=platform, q=q, session=session
                )
            }
        )

    @mcp.tool(
        description="查一篇稿件：正文、各平台版本、审稿批注（含退回原因）、版本列表，以及当前的违禁词检查结果。改稿前先看批注。"
    )
    def wb_get_content(content_id: int) -> dict[str, Any]:
        def query(session: Session) -> dict:
            content = _content(session, content_id)
            return {"content": content_detail(session, content), "compliance": compliance_of(session, content)}

        return run(query)

    @mcp.tool(
        description=(
            "把写好的文案存成工作台里的一篇新草稿，作者记为“品牌助手”，状态固定是草稿，由人修改、送审和发布。"
            "kind 取 article 长文、note 短文/笔记、video_script 视频脚本、poster_copy 海报文案、product_copy 商品文案。"
            "variants 是各平台版本，例如 [{\"platform\": \"xiaohongshu\", \"title\": \"…\", \"body\": \"…\"}]。"
            "保存前请先用 wb_check_compliance 检查。"
        )
    )
    def wb_create_draft(
        title: str,
        brand: str,
        body: str,
        kind: str = "article",
        campaign_id: int | None = None,
        variants: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        try:
            payload = ContentIn(
                title=title,
                brand=brand,
                body=body,
                kind=kind,
                campaign_id=campaign_id,
                variants=variants or [],
                author=AI_AUTHOR,
                note="品牌助手起草",
            )
        except ValidationError as exc:
            raise ToolFailure("参数不正确：" + "; ".join(_short_error(err) for err in exc.errors())) from exc

        def write(session: Session) -> Any:
            detail = create_content(payload=payload, session=session)
            return {"id": detail.id, "status": detail.status, "version": detail.version, "platforms": detail.platforms}

        return run(write)

    # ---- C07 安装工单（顾客信息打码后才给 AI）----

    @mcp.tool(
        description=(
            "列出安装工单。状态：pending 待预约 / booked 已预约 / done 已完工 / exception 异常 / cancelled 已取消；"
            "overdue=true 只看超过 48 小时还没预约的。顾客姓名、手机、地址已打码。最多 50 条。"
        )
    )
    def wb_list_installs(
        status: str | None = None,
        shop_id: int | None = None,
        overdue: bool | None = None,
        limit: int = 20,
    ) -> dict[str, Any]:
        size = max(1, min(int(limit), MAX_ISSUES))

        def query(session: Session) -> dict:
            items = list_installs(status=status, shop_id=shop_id, q=None, overdue=overdue, session=session)
            summary = install_summary(shop_id=shop_id, session=session)
            return {"summary": summary, "total": len(items), "items": [_masked(item) for item in items[:size]]}

        return run(query)

    @mcp.tool(
        description="查一张安装工单：订单、商品、买家留言、预约信息、异常原因、处理记录。顾客姓名、手机、地址已打码。"
    )
    def wb_get_install(install_id: int) -> dict[str, Any]:
        return run(lambda session: _masked(get_install(install_id=install_id, session=session)))

    @mcp.tool(
        description=(
            "给安装工单追加一条备注（例如读懂买家留言后的提醒、异常单的说明）。"
            f"会加“{NOTE_PREFIX.strip()}”前缀，不改工单状态。单次最多 {MAX_NOTE} 字。"
        )
    )
    def wb_add_install_note(install_id: int, note: str) -> dict[str, Any]:
        text = (note or "").strip()
        if not text:
            raise ToolFailure("备注不能为空")
        if len(text) > MAX_NOTE:
            raise ToolFailure(f"备注最多 {MAX_NOTE} 字")

        def write(session: Session) -> Any:
            item = _install(session, install_id)
            add_install_note(item, "电商助手", NOTE_PREFIX + text)
            session.flush()
            return _masked({**install_out(session, item), "events": item.events})

        return run(write)

    # ---- C08 客户（姓名、手机、地址打码后才给 AI）----

    @mcp.tool(
        description=(
            "列出客户档案。segment：new 新客（30 天内只买过 1 单）/ repeat 复购（2 单及以上）/ "
            "dormant 沉睡（最近一单在 90 天前）/ inquiry_open 询盘未成交（超过 7 天没跟进）；"
            "kind：member 会员 / business 企业客户。返回各分层人数和客户列表，姓名、手机已打码。最多 50 条。"
        )
    )
    def wb_list_customers(
        segment: str | None = None, kind: str | None = None, q: str | None = None, limit: int = 20
    ) -> dict[str, Any]:
        size = max(1, min(int(limit), MAX_ISSUES))

        def query(session: Session) -> dict:
            page = list_customers(
                segment=segment, kind=kind, q=q, wecom_added=None, page=1, page_size=size, session=session
            )
            summary = segment_summary(session=session)
            return {
                "summary": summary,
                "total": page["total"],
                "items": [_masked_customer(item) for item in page["items"]],
            }

        return run(query)

    @mcp.tool(description="查一个客户：分层、累计订单和金额、最近买的商品、最近 50 笔订单、询盘。姓名、手机已打码。")
    def wb_get_customer(customer_id: int) -> dict[str, Any]:
        def query(session: Session) -> dict:
            detail = get_customer(customer_id=customer_id, session=session)
            return {
                **_masked_customer(detail),
                "inquiries": [_masked_inquiry(item) for item in detail["inquiries"]],
            }

        return run(query)

    @mcp.tool(
        description=(
            "列出 B 端询盘。status：open 未关闭 / new 新询盘 / replied 已回复 / quoted 已报价 / won 成交 / lost 丢单；"
            "stale=true 表示超过 7 天没动静。联系人和手机已打码。最多 50 条。"
        )
    )
    def wb_list_inquiries(status: str | None = None, q: str | None = None, limit: int = 20) -> dict[str, Any]:
        size = max(1, min(int(limit), MAX_ISSUES))

        def query(session: Session) -> dict:
            items = list_inquiries(status=status, channel=None, q=q, customer_id=None, session=session)
            return {"total": len(items), "items": [_masked_inquiry(item) for item in items[:size]]}

        return run(query)

    @mcp.tool(
        description=(
            "查一条询盘：原文、提到的商品的资料卡（卖点、参数、FAQ、各店售价库存）、已出的报价单、处理记录。"
            "可据此起草回复和报价建议，交给销售确认后由人发出。联系人和手机已打码。"
        )
    )
    def wb_get_inquiry(inquiry_id: int) -> dict[str, Any]:
        def query(session: Session) -> dict:
            detail = get_inquiry(inquiry_id=inquiry_id, session=session)
            return {**_masked_inquiry(detail), "products": inquiry_products(inquiry_id=inquiry_id, session=session)}

        return run(query)

    @mcp.tool(
        description=(
            "给询盘追加一条备注（例如回复草稿、报价建议、客户关注点）。"
            f"会加“{NOTE_PREFIX.strip()}”前缀，不改询盘状态，不会发给客户。单次最多 {MAX_NOTE} 字。"
        )
    )
    def wb_add_inquiry_note(inquiry_id: int, note: str) -> dict[str, Any]:
        text = (note or "").strip()
        if not text:
            raise ToolFailure("备注不能为空")
        if len(text) > MAX_NOTE:
            raise ToolFailure(f"备注最多 {MAX_NOTE} 字")

        def write(session: Session) -> Any:
            item = _inquiry(session, inquiry_id)
            add_inquiry_note(item, "电商助手", NOTE_PREFIX + text)
            session.flush()
            return _masked_inquiry(inquiry_detail(item))

        return run(write)

    # ---- C09 设计（生图助手）----

    @mcp.tool(
        description=(
            "列出设计需求单。status：active 未完成（默认）/ open 待接单 / in_progress 设计中 / reviewing 待评审 / "
            "done 已定稿 / cancelled 已取消。kind：main_image 主图 / detail_page 详情页 / poster 海报 / banner 横幅 / "
            "video_cover 视频封面 / other。最多 50 条。"
        )
    )
    def wb_list_design_requests(
        status: str | None = "active", brand: str | None = None, limit: int = 20
    ) -> dict[str, Any]:
        size = max(1, min(int(limit), MAX_ISSUES))

        def query(session: Session) -> dict:
            items = list_design_requests(
                status=status, brand=brand, kind=None, campaign_id=None, product_code=None, assignee=None, q=None,
                session=session,
            )
            return {"total": len(items), "items": items[:size]}

        return run(query)

    @mcp.tool(
        description=(
            "查一张设计需求单：类型、尺寸、图上文案（含违禁词检查）、需求说明、截止日、参考图、各轮候选稿、"
            "评审批注（含图上位置 x/y，0–1）和处理记录。商品卖点用 wb_get_product_card，品牌色和字体用 wb_get_brand_guide。"
        )
    )
    def wb_get_design_request(request_id: int) -> dict[str, Any]:
        return run(lambda session: get_design_request(request_id=request_id, session=session))

    @mcp.tool(
        description=(
            "把一张生成好的图交给设计需求单，当作这一轮的候选稿（标 AI 生成），需求单会进入待评审，由人定稿或退回。"
            "image 填 image_generate 返回的 image：https 链接、data:image 链接，或 Hermes 生图目录里的本机文件路径。"
            f"只收 PNG、JPG、GIF、WebP，单张最多 20 MB，每轮 AI 最多交 8 张。prompt 填生成用的提示词，note 写设计思路（最多 {MAX_NOTE} 字）。"
        )
    )
    def wb_add_design_candidate(
        request_id: int, image: str, prompt: str | None = None, note: str | None = None
    ) -> dict[str, Any]:
        note_text = (note or "").strip() or None
        if note_text and len(note_text) > MAX_NOTE:
            raise ToolFailure(f"说明最多 {MAX_NOTE} 字")
        prompt_text = (prompt or "").strip()[:4000] or None

        def write(session: Session) -> Any:
            item = _design_request(session, request_id)
            if item.status in {"done", "cancelled"}:
                raise AppError(409, "request_closed", "需求单已定稿或已取消，不能再交稿")
            data, name = load_ai_image(image)
            asset = add_candidate(
                session, item, store_file(data, name), by=AI_DESIGNER, source="ai", prompt=prompt_text, note=note_text
            )
            return {"request_status": item.status, "round": item.round, "candidate": asset_out(asset)}

        return run(write)

    # ---- C10 短视频（视频助手）----

    @mcp.tool(
        description=(
            "列出短视频项目。status：active 未完成（默认）/ draft 写脚本 / in_review 待审核 / approved 已通过 / "
            "done 已完成 / cancelled 已取消。最多 50 条。"
        )
    )
    def wb_list_video_projects(status: str | None = "active", brand: str | None = None, limit: int = 20) -> dict[str, Any]:
        size = max(1, min(int(limit), MAX_ISSUES))

        def query(session: Session) -> dict:
            items = list_video_projects(status=status, brand=brand, campaign_id=None, q=None, session=session)
            return {"total": len(items), "items": items[:size]}

        return run(query)

    @mcp.tool(
        description=(
            "查一个短视频项目：每镜的画面说明、口播、字幕、时长、起止时间、画面和配音素材、审核意见（events）、"
            "口播和字幕的违禁词检查。"
        )
    )
    def wb_get_video_project(project_id: int) -> dict[str, Any]:
        return run(lambda session: get_video_project(project_id=project_id, session=session))

    @mcp.tool(
        description=(
            "新建一个短视频脚本（状态为写脚本，作者固定为“视频助手”），由人修改、送审。"
            "aspect：9:16 / 16:9 / 1:1 / 3:4。platform：douyin、xiaohongshu、wechat 等。"
            "shots 是分镜列表，每镜 {duration 秒（≤60）, visual 画面说明, voiceover 口播, subtitle 字幕（不填同口播，填空字符串表示不要字幕）}，最多 60 镜。"
            "口播先用 wb_check_compliance 检查。"
        )
    )
    def wb_create_video_project(
        title: str,
        brand: str,
        shots: list[dict[str, Any]],
        product_code: str | None = None,
        campaign_id: int | None = None,
        platform: str | None = None,
        aspect: str = "9:16",
        brief: str | None = None,
    ) -> dict[str, Any]:
        clean_shots = [
            {key: shot.get(key) for key in ("duration", "visual", "voiceover", "subtitle") if shot.get(key) is not None}
            for shot in shots
            if isinstance(shot, dict)
        ]
        try:
            payload = VideoProjectIn(
                title=title,
                brand=brand,
                shots=clean_shots,
                product_code=product_code,
                campaign_id=campaign_id,
                platform=platform,
                aspect=aspect,
                brief=brief,
                author=AI_VIDEO,
            )
        except ValidationError as exc:
            raise ToolFailure("参数不正确：" + "; ".join(_short_error(err) for err in exc.errors())) from exc

        def write(session: Session) -> Any:
            detail = create_video_project(payload=payload, session=session)
            return {"id": detail["id"], "status": detail["status"], "shot_count": detail["shot_count"], "duration": detail["duration"]}

        return run(write)

    @mcp.tool(
        description=(
            "给写脚本中的项目的某一镜交配音或画面。slot=voice 配音（text_to_speech 返回的 file_path，MP3/WAV/M4A/OGG）；"
            "slot=visual 画面（image_generate 返回的 image，或用 asset_id 选素材库里已有的图）。"
            "file 可以是 https 链接、data 链接，或 Hermes 目录里的本机文件。单个最多 20 MB。不能改已送审的项目。"
        )
    )
    def wb_add_shot_media(
        project_id: int,
        seq: int,
        slot: str,
        file: str | None = None,
        asset_id: int | None = None,
        prompt: str | None = None,
    ) -> dict[str, Any]:
        if (file is None) == (asset_id is None):
            raise ToolFailure("file 和 asset_id 要且只能给一个")

        def write(session: Session) -> Any:
            project = _video_project(session, project_id)
            require_editable(project)
            if asset_id is not None:
                if slot != "visual":
                    raise ToolFailure("素材库里的素材只能当画面用")
                asset = session.get(Asset, asset_id)
                if asset is None or asset.role not in {"final", "library"}:
                    raise ToolFailure("素材库里没有这个素材")
                check_media(asset, "visual")
                shot = next((s for s in project.shots if s.seq == seq), None)
                if shot is None:
                    raise ToolFailure(f"没有第 {seq} 镜")
                shot.media_asset_id = asset.id
                project.events = [*project.events, _video_event(AI_VIDEO, f"第 {seq} 镜画面（素材库 #{asset.id}）")]
                project.updated_at = utcnow()
                session.flush()
                session.refresh(shot)
            else:
                data, name = load_ai_file(file)
                attach_media(
                    session, project, seq, slot, store_file(data, name), by=AI_VIDEO, source="ai",
                    prompt=(prompt or "").strip()[:4000] or None,
                )
            detail = get_video_project(project_id=project_id, session=session)
            shot_out = next(s for s in detail["shots"] if s["seq"] == seq)
            return {"project_status": detail["status"], "duration": detail["duration"], "shot": shot_out}

        return run(write)

    @mcp.tool(
        description="在素材库里找图和视频（定稿和上传的素材），可按品牌、商品编码、类型、关键词筛选。只返回信息，不返回文件内容。最多 50 条。"
    )
    def wb_search_library(
        brand: str | None = None, product_code: str | None = None, kind: str | None = None, q: str | None = None, limit: int = 20
    ) -> dict[str, Any]:
        size = max(1, min(int(limit), MAX_ISSUES))

        def query(session: Session) -> dict:
            items = list_assets(
                role=None, brand=brand, product_code=product_code, campaign_id=None, kind=kind, q=q, limit=size, session=session
            )
            return {"total": len(items), "items": items}

        return run(query)

    return mcp


def _masked_customer(item: dict) -> dict:
    """客户发给模型前打码；订单只留商品和金额。"""
    masked = {**item, "name": mask_name(item.get("name")), "phone": mask_phone(item.get("phone")), "note": mask_text(item.get("note"))}
    masked.pop("inquiries", None)
    return masked


def _masked_inquiry(item: dict) -> dict:
    return {
        **item,
        "contact": mask_name(item.get("contact")),
        "phone": mask_phone(item.get("phone")),
        "content": mask_text(item.get("content")),
        "note": mask_text(item.get("note")),
    }


def _masked(item: dict) -> dict:
    """工单发给模型前把顾客信息打码。工作台页面上仍是完整信息。"""
    return {
        **item,
        "buyer_name": mask_name(item.get("buyer_name")),
        "phone": mask_phone(item.get("phone")),
        "address": mask_address(item.get("address")),
    }


def _short_error(error: dict) -> str:
    loc = ".".join(str(item) for item in error.get("loc", []))
    return f"{loc} {error.get('msg', '')}".strip()


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
