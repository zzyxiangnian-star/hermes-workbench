"""C09 设计页的请求和响应模型。"""

from __future__ import annotations

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.brand_schemas import ComplianceOut, _clean, _clean_list, _required
from app.schemas import UtcDateTime

DesignKind = Literal["main_image", "detail_page", "poster", "banner", "video_cover", "other"]
DesignStatus = Literal["open", "in_progress", "reviewing", "done", "cancelled"]


def _sizes(values: list[str]) -> list[str]:
    """尺寸写成 800x800、750x1000 这样；全角 ×、* 也认。"""
    result = []
    for raw in _clean_list(values):
        text = raw.lower().replace("×", "x").replace("*", "x").replace(" ", "")
        parts = text.split("x")
        if len(parts) != 2 or not all(p.isdigit() and 0 < int(p) <= 20000 for p in parts):
            raise ValueError("bad size")
        result.append(f"{int(parts[0])}x{int(parts[1])}")
    return result


class DesignRequestIn(BaseModel):
    title: str = Field(max_length=200)
    kind: DesignKind
    brand: str = Field(max_length=200)
    campaign_id: int | None = None
    product_code: str | None = Field(default=None, max_length=128)
    sizes: list[str] = Field(default_factory=list, max_length=20)
    copy_text: str | None = Field(default=None, max_length=5000)
    brief: str | None = Field(default=None, max_length=10000)
    due_date: date | None = None
    requester: str | None = Field(default=None, max_length=100)
    assignee: str | None = Field(default=None, max_length=100)

    _r = field_validator("title", "brand")(lambda cls, v: _required(v))
    _c = field_validator("product_code", "copy_text", "brief", "requester", "assignee")(lambda cls, v: _clean(v))
    _s = field_validator("sizes")(lambda cls, v: _sizes(v))


class DesignRequestPatch(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    kind: DesignKind | None = None
    campaign_id: int | None = None
    product_code: str | None = Field(default=None, max_length=128)
    sizes: list[str] | None = Field(default=None, max_length=20)
    copy_text: str | None = Field(default=None, max_length=5000)
    brief: str | None = Field(default=None, max_length=10000)
    due_date: date | None = None
    assignee: str | None = Field(default=None, max_length=100)

    _c = field_validator("title", "product_code", "copy_text", "brief", "assignee")(lambda cls, v: _clean(v))
    _s = field_validator("sizes")(lambda cls, v: None if v is None else _sizes(v))


class DesignStatusIn(BaseModel):
    status: DesignStatus
    by: str | None = None
    note: str | None = Field(default=None, max_length=2000)

    _c = field_validator("by", "note")(lambda cls, v: _clean(v))


class FinalizeIn(BaseModel):
    asset_ids: list[int] = Field(min_length=1, max_length=50)
    by: str | None = None

    _c = field_validator("by")(lambda cls, v: _clean(v))


class AssetOut(BaseModel):
    id: int
    request_id: int | None
    role: str
    file_name: str
    url: str
    mime: str
    size: int
    width: int | None
    height: int | None
    brand: str | None
    product_code: str | None
    campaign_id: int | None
    kind: str | None
    tags: list[str]
    source: str
    prompt: str | None
    round: int | None
    label: str | None
    note: str | None
    created_by: str | None
    created_at: UtcDateTime


class AssetPatch(BaseModel):
    brand: str | None = Field(default=None, max_length=200)
    product_code: str | None = Field(default=None, max_length=128)
    campaign_id: int | None = None
    tags: list[str] | None = None
    note: str | None = Field(default=None, max_length=2000)

    _c = field_validator("brand", "product_code", "note")(lambda cls, v: _clean(v))
    _l = field_validator("tags")(lambda cls, v: None if v is None else _clean_list(v))


class DesignCommentIn(BaseModel):
    body: str = Field(max_length=2000)
    asset_id: int | None = None
    x: float | None = Field(default=None, ge=0, le=1)
    y: float | None = Field(default=None, ge=0, le=1)
    author: str | None = None

    _r = field_validator("body")(lambda cls, v: _required(v))
    _c = field_validator("author")(lambda cls, v: _clean(v))


class DesignCommentPatch(BaseModel):
    resolved: bool


class DesignCommentOut(BaseModel):
    id: int
    request_id: int
    asset_id: int | None
    body: str
    x: float | None
    y: float | None
    author: str | None
    resolved: bool
    created_at: UtcDateTime


class DesignEvent(BaseModel):
    at: str
    by: str | None
    text: str


class DesignRequestOut(BaseModel):
    id: int
    title: str
    kind: str
    brand: str
    campaign_id: int | None
    campaign_name: str | None
    product_code: str | None
    sizes: list[str]
    copy_text: str | None
    brief: str | None
    due_date: date | None
    overdue: bool
    requester: str | None
    assignee: str | None
    status: str
    round: int
    candidate_count: int
    open_comments: int
    cover: AssetOut | None
    created_at: UtcDateTime
    updated_at: UtcDateTime


class DesignRequestDetail(DesignRequestOut):
    references: list[AssetOut]
    candidates: list[AssetOut]
    finals: list[AssetOut]
    comments: list[DesignCommentOut]
    events: list[DesignEvent]
    compliance: ComplianceOut


class DesignSummary(BaseModel):
    open: int
    in_progress: int
    reviewing: int
    done: int
    cancelled: int
    overdue: int
    needs_action: int
