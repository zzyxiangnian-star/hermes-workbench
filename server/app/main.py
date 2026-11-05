"""FastAPI 入口。默认只监听本机。"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import api_router
from app.db import default_database_url, init_db, make_engine, make_session_factory
from app.errors import AppError, error_body

logger = logging.getLogger("workbench")

_VALIDATION_MESSAGES = {
    "platform": "平台必须是 tmall、jd、pdd 或 douyin",
    "name": "名称不能为空",
    "brand": "品牌不能为空",
    "shop_id": "缺少店铺",
    "page": "页码必须是大于 0 的整数",
    "page_size": "每页数量必须在 1 到 100 之间",
    "status": "状态必须是 open、resolved 或 ignored",
    "level": "级别必须是 must 或 warn",
    "file": "请上传表格文件",
}


def create_app(database_url: str | None = None) -> FastAPI:
    engine = make_engine(database_url or default_database_url())
    app = FastAPI(title="Hermes 工作台商品接口", version="0.1.0", lifespan=_lifespan)
    app.state.engine = engine
    app.state.session_factory = make_session_factory(engine)
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router)
    app.add_exception_handler(AppError, _app_error)
    app.add_exception_handler(RequestValidationError, _validation_error)
    app.add_exception_handler(HTTPException, _http_error)
    app.add_exception_handler(Exception, _unexpected_error)
    return app


@asynccontextmanager
async def _lifespan(app: FastAPI):
    init_db(app.state.engine)
    yield


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
    return _VALIDATION_MESSAGES.get(field, "请求参数不正确")


def run() -> None:
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000)


app = create_app()


if __name__ == "__main__":
    run()
