"""FastAPI 入口。默认只监听本机。"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import api_router
from app.db import default_database_url, init_db, make_engine, make_session_factory
from app.errors import AppError, error_body
from app.mcp_server import build_mcp, http_routes
from app.scheduler import start_scheduler

logger = logging.getLogger("workbench")

_VALIDATION_MESSAGES = {
    "platform": "平台必须是 tmall、jd、pdd 或 douyin",
    "name": "名称不能为空",
    "brand": "品牌不能为空",
    "shop_id": "缺少店铺",
    "page": "页码必须是大于 0 的整数",
    "page_size": "每页数量必须在 1 到 100 之间",
    "status": "状态不正确",
    "level": "级别必须是 must 或 warn",
    "file": "请上传表格文件",
    "days": "天数必须在 1 到 366 之间",
    "date": "日期格式应为 YYYY-MM-DD",
    "metric": "请指定指标",
    "word": "违禁词不能为空",
    "category": "分类不能为空",
    "text": "请提供要检查的文字（最多 5 万字）",
    "product_code": "商品编码不能为空",
    "title": "名称不能为空",
    "kind": "类型不正确",
    "start_date": "开始日期格式应为 YYYY-MM-DD",
    "end_date": "结束日期格式应为 YYYY-MM-DD",
    "due_date": "截止日期格式应为 YYYY-MM-DD",
    "target_sales": "目标销售额不能是负数",
    "budget": "预算不能是负数",
    "body": "正文不能为空，最多 5 万字",
    "planned_at": "计划日期格式应为 YYYY-MM-DD",
    "resolved": "请说明是否已解决",
    "url": "链接太长",
    "appointment_at": "预约时间格式应为 YYYY-MM-DDTHH:MM",
    "note": "备注不能为空，最多 1000 字",
    "ids": "工单编号不正确",
    "channel": "渠道不正确",
    "segment": "分层必须是 new、repeat、dormant 或 inquiry_open",
    "template": "话术不能为空，最多 2000 字",
    "content": "询盘内容不能为空，最多 1 万字",
    "items": "报价单至少要有一行商品",
    "quantity": "数量必须是大于 0 的整数",
    "unit_price": "单价不能是负数",
    "valid_until": "有效期格式应为 YYYY-MM-DD",
    "phone": "手机号太长",
    "company": "公司名称太长",
    "tags": "标签格式不正确",
    "sizes": "尺寸写成 800x800 这样，最多 20 个",
    "copy_text": "图上文案最多 5000 字",
    "brief": "需求说明最多 1 万字",
    "asset_ids": "请选择要定稿的候选稿",
    "x": "图上位置要在 0 到 1 之间",
    "y": "图上位置要在 0 到 1 之间",
}


def create_app(database_url: str | None = None) -> FastAPI:
    url = database_url or default_database_url()
    engine = make_engine(url)
    app = FastAPI(title="Hermes 工作台商品接口", version="0.3.0", lifespan=_lifespan)
    app.state.engine = engine
    app.state.database_url = url
    app.state.session_factory = make_session_factory(engine)
    app.state.scheduler = None
    extra = [item.strip() for item in os.environ.get("WB_ALLOWED_ORIGINS", "").split(",") if item.strip()]
    app.add_middleware(
        CORSMiddleware,
        # Hermes 桌面版从 file:// 打开，Origin 是字符串 null。
        allow_origins=["null", *extra],
        allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router)
    # 电商助手的 MCP 工具，Streamable HTTP，地址 /mcp。
    mcp = build_mcp(app.state.session_factory)
    app.state.mcp = mcp
    app.router.routes.extend(http_routes(mcp))
    app.add_exception_handler(AppError, _app_error)
    app.add_exception_handler(RequestValidationError, _validation_error)
    app.add_exception_handler(HTTPException, _http_error)
    app.add_exception_handler(Exception, _unexpected_error)
    return app


@asynccontextmanager
async def _lifespan(app: FastAPI):
    init_db(app.state.engine, app.state.database_url)
    scheduler = start_scheduler(app.state.session_factory)
    app.state.scheduler = scheduler
    try:
        async with app.state.mcp.session_manager.run():
            yield
    finally:
        if scheduler is not None:
            scheduler.shutdown(wait=False)


async def _app_error(_request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=error_body(exc.code, exc.message))


async def _validation_error(_request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content=error_body("validation_error", _validation_message(exc)))


async def _http_error(_request: Request, exc: HTTPException) -> JSONResponse:
    messages = {404: "找不到这个地址", 405: "这个地址不支持该方法"}
    message = messages.get(exc.status_code, "请求没有完成")
    return JSONResponse(status_code=exc.status_code, content=error_body("http_error", message))


async def _unexpected_error(_request: Request, exc: Exception) -> JSONResponse:
    logger.exception("unhandled error")
    return JSONResponse(status_code=500, content=error_body("internal_error", "服务器内部错误"))


def _validation_message(exc: RequestValidationError) -> str:
    errors = exc.errors()
    if not errors:
        return "请求参数不正确"
    loc = [str(item) for item in errors[0].get("loc", []) if item not in {"body", "query", "path", "form"}]
    field = loc[-1] if loc else ""
    if field == "platform" and "variants" in loc:
        return "平台必须是 wechat、xiaohongshu、douyin、weibo、tmall、jd、pdd 或 other"
    return _VALIDATION_MESSAGES.get(field, "请求参数不正确")


def run() -> None:
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000)


app = create_app()


if __name__ == "__main__":
    run()
