"""设计页：设计需求单、候选稿、图上批注、定稿和素材库。

文件存在本机 WB_ASSET_DIR（默认 server/data/assets），按内容的 sha256 命名，同一张图只存一份。
只收常见的图片、PDF、PSD、视频和音频；类型按文件头判断，不信扩展名。
生图助手（Hermes 的 image_generate）出的图通过 MCP 交回：可以是 https 链接、data: 链接，
或 Hermes 存在本机的文件（只认 WB_AI_IMAGE_DIRS 里的目录，默认 ~/.hermes）。
"""

from __future__ import annotations

import base64
import hashlib
import ipaddress
import os
import socket
import struct
from pathlib import Path
from urllib.parse import urlparse

import httpx
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.brand import check_text
from app.errors import AppError
from app.installs import _event
from app.models import Asset, DesignComment, DesignRequest, utcnow

DEFAULT_ASSET_DIR = Path(__file__).resolve().parent.parent / "data" / "assets"
MAX_UPLOAD_MB = 50
MAX_AI_IMAGE_MB = 20
MAX_AI_CANDIDATES_PER_ROUND = 8

KIND_LABELS = {
    "main_image": "主图",
    "detail_page": "详情页",
    "poster": "海报",
    "banner": "横幅",
    "video_cover": "视频封面",
    "other": "其他",
}
STATUS_LABELS = {
    "open": "待接单",
    "in_progress": "设计中",
    "reviewing": "待评审",
    "done": "已定稿",
    "cancelled": "已取消",
}
TRANSITIONS = {
    "open": {"in_progress", "cancelled"},
    "in_progress": {"reviewing", "cancelled"},
    "reviewing": {"in_progress", "cancelled"},  # 定稿走 finalize
    "done": set(),
    "cancelled": {"open"},
}
IMAGE_MIMES = {"image/png", "image/jpeg", "image/gif", "image/webp"}
EXTENSIONS = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
    "image/vnd.adobe.photoshop": ".psd",
    "video/mp4": ".mp4",
    "video/quicktime": ".mov",
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "audio/mp4": ".m4a",
    "audio/ogg": ".ogg",
}
AUDIO_MIMES = {"audio/mpeg", "audio/wav", "audio/mp4", "audio/ogg"}


# ---- 存文件 ----


def asset_dir() -> Path:
    raw = os.environ.get("WB_ASSET_DIR", "").strip()
    path = Path(raw).expanduser() if raw else DEFAULT_ASSET_DIR
    path.mkdir(parents=True, exist_ok=True)
    return path


def max_upload_bytes() -> int:
    try:
        mb = int(os.environ.get("WB_ASSET_MAX_MB", MAX_UPLOAD_MB))
    except ValueError:
        mb = MAX_UPLOAD_MB
    return max(mb, 1) * 1024 * 1024


def sniff_mime(head: bytes) -> str | None:
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if head.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if head[:6] in (b"GIF87a", b"GIF89a"):
        return "image/gif"
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "image/webp"
    if head.startswith(b"%PDF-"):
        return "application/pdf"
    if head.startswith(b"8BPS"):
        return "image/vnd.adobe.photoshop"
    if head[4:8] == b"ftyp":
        brand = head[8:12]
        if brand in (b"M4A ", b"M4B "):
            return "audio/mp4"
        return "video/quicktime" if brand[:2] == b"qt" else "video/mp4"
    if head[:4] == b"RIFF" and head[8:12] == b"WAVE":
        return "audio/wav"
    if head.startswith(b"ID3") or (len(head) > 1 and head[0] == 0xFF and head[1] & 0xE0 == 0xE0):
        return "audio/mpeg"
    if head.startswith(b"OggS"):
        return "audio/ogg"
    return None


def image_size(data: bytes, mime: str) -> tuple[int | None, int | None]:
    """不装 Pillow，直接读文件头里的宽高。读不出来就返回空，不影响保存。"""
    try:
        if mime == "image/png":
            return struct.unpack(">II", data[16:24])
        if mime == "image/gif":
            return struct.unpack("<HH", data[6:10])
        if mime == "image/webp":
            chunk = data[12:16]
            if chunk == b"VP8X":
                return int.from_bytes(data[24:27], "little") + 1, int.from_bytes(data[27:30], "little") + 1
            if chunk == b"VP8 ":
                w, h = struct.unpack("<HH", data[26:30])
                return w & 0x3FFF, h & 0x3FFF
            if chunk == b"VP8L":
                bits = int.from_bytes(data[21:25], "little")
                return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
        if mime == "image/jpeg":
            i = 2
            while i + 9 < len(data):
                if data[i] != 0xFF:
                    i += 1
                    continue
                marker = data[i + 1]
                if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
                    i += 2
                    continue
                length = struct.unpack(">H", data[i + 2 : i + 4])[0]
                if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                    h, w = struct.unpack(">HH", data[i + 5 : i + 9])
                    return w, h
                i += 2 + length
        if mime == "image/vnd.adobe.photoshop":
            h, w = struct.unpack(">II", data[14:22])
            return w, h
    except (struct.error, IndexError):
        pass
    return None, None


def store_file(data: bytes, file_name: str) -> dict:
    """校验类型、按 sha256 存盘，返回要写进 Asset 的字段。"""
    if not data:
        raise AppError(400, "empty_file", "文件是空的")
    if len(data) > max_upload_bytes():
        raise AppError(413, "file_too_large", f"文件超过 {max_upload_bytes() // 1024 // 1024} MB")
    mime = sniff_mime(data[:32])
    if mime is None:
        raise AppError(400, "unsupported_file", "只支持 PNG、JPG、GIF、WebP、PDF、PSD、MP4、MOV、MP3、WAV、M4A、OGG")
    digest = hashlib.sha256(data).hexdigest()
    relative = f"{digest[:2]}/{digest}{EXTENSIONS[mime]}"
    target = asset_dir() / relative
    if not target.exists():
        target.parent.mkdir(parents=True, exist_ok=True)
        tmp = target.with_suffix(target.suffix + ".part")
        tmp.write_bytes(data)
        tmp.replace(target)
    width, height = image_size(data, mime) if mime in IMAGE_MIMES or mime.endswith("photoshop") else (None, None)
    name = Path(file_name or "file").name[:255] or "file"
    return {
        "file_name": name,
        "stored_path": relative,
        "mime": mime,
        "size": len(data),
        "sha256": digest,
        "width": width,
        "height": height,
    }


def file_path(asset: Asset) -> Path:
    path = (asset_dir() / asset.stored_path).resolve()
    if asset_dir().resolve() not in path.parents or not path.exists():
        raise AppError(404, "file_missing", "文件不在了（可能被手动删掉）")
    return path


def remove_asset(session: Session, asset: Asset) -> None:
    """删记录；没有别的记录用同一个文件时才删文件。"""
    others = session.scalar(
        select(func.count()).select_from(Asset).where(Asset.stored_path == asset.stored_path, Asset.id != asset.id)
    )
    path = asset_dir() / asset.stored_path
    session.delete(asset)
    if not others and path.exists():
        path.unlink()


# ---- AI 交回的图 ----


def ai_image_roots() -> list[Path]:
    raw = os.environ.get("WB_AI_IMAGE_DIRS", "").strip()
    items = [item for item in raw.replace(";", os.pathsep).split(os.pathsep) if item.strip()] if raw else []
    if not items:
        items = [os.environ.get("HERMES_HOME") or "~/.hermes"]
    return [Path(item.strip()).expanduser().resolve() for item in items]


def load_ai_image(source: str) -> tuple[bytes, str]:
    """把生图工具返回的 image 字段变成文件内容。只收图片。"""
    data, name = load_ai_file(source)
    if sniff_mime(data[:32]) not in IMAGE_MIMES:
        raise AppError(400, "invalid_image", "不是 PNG、JPG、GIF 或 WebP 图片")
    return data, name


def load_ai_file(source: str) -> tuple[bytes, str]:
    """生图、配音工具返回的结果：https 链接、data: 链接，或 Hermes 目录里的本机文件。"""
    text = (source or "").strip()
    if not text:
        raise AppError(400, "image_required", "缺少文件")
    limit = MAX_AI_IMAGE_MB * 1024 * 1024
    if text.startswith("data:"):
        header, _, payload = text.partition(",")
        if ";base64" not in header:
            raise AppError(400, "invalid_image", "data 链接必须是 base64")
        try:
            data = base64.b64decode(payload, validate=True)
        except ValueError as exc:
            raise AppError(400, "invalid_image", "data 链接解不开") from exc
        name = "ai-image"
    elif text.startswith(("http://", "https://")):
        data, name = _download(text, limit)
    else:
        path = Path(text).expanduser().resolve()
        if not any(root == path or root in path.parents for root in ai_image_roots()):
            raise AppError(400, "path_not_allowed", "只能读取 Hermes 生图、配音目录里的文件")
        if not path.is_file():
            raise AppError(404, "image_not_found", "文件不存在")
        if path.stat().st_size > limit:
            raise AppError(413, "file_too_large", f"文件超过 {MAX_AI_IMAGE_MB} MB")
        data, name = path.read_bytes(), path.name
    if len(data) > limit:
        raise AppError(413, "file_too_large", f"文件超过 {MAX_AI_IMAGE_MB} MB")
    return data, name


def _download(url: str, limit: int) -> tuple[bytes, str]:
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.hostname:
        raise AppError(400, "invalid_url", "链接必须是 https")
    _reject_private_host(parsed.hostname)
    try:
        with httpx.Client(timeout=30, follow_redirects=False) as client:
            with client.stream("GET", url) as response:
                if response.status_code != 200:
                    raise AppError(502, "download_failed", f"下载文件失败（HTTP {response.status_code}）")
                chunks, total = [], 0
                for chunk in response.iter_bytes():
                    total += len(chunk)
                    if total > limit:
                        raise AppError(413, "file_too_large", f"文件超过 {MAX_AI_IMAGE_MB} MB")
                    chunks.append(chunk)
    except httpx.HTTPError as exc:
        raise AppError(502, "download_failed", "下载文件失败") from exc
    return b"".join(chunks), Path(parsed.path).name or "ai-image"


def _reject_private_host(host: str) -> None:
    """不让 AI 借下载去碰本机或内网地址。"""
    try:
        infos = socket.getaddrinfo(host, 443, proto=socket.IPPROTO_TCP)
    except socket.gaierror as exc:
        raise AppError(400, "invalid_url", "链接的域名解析不了") from exc
    for info in infos:
        address = ipaddress.ip_address(info[4][0])
        if not address.is_global:
            raise AppError(400, "invalid_url", "链接不能指向本机或内网")


# ---- 流转 ----


def change_status(request: DesignRequest, status: str, *, by: str | None, note: str | None = None) -> None:
    if status not in STATUS_LABELS:
        raise AppError(400, "invalid_status", "状态必须是 open、in_progress、reviewing 或 cancelled")
    if status == "done":
        raise AppError(400, "use_finalize", "定稿请选中候选稿后点“定稿”")
    if status == request.status:
        raise AppError(409, "invalid_transition", f"需求单已经是{STATUS_LABELS[status]}")
    if status not in TRANSITIONS[request.status]:
        raise AppError(
            409, "invalid_transition", f"需求单不能从{STATUS_LABELS[request.status]}改成{STATUS_LABELS[status]}"
        )
    text = f"{STATUS_LABELS[request.status]} → {STATUS_LABELS[status]}"
    if request.status == "reviewing" and status == "in_progress":
        if not note:
            raise AppError(400, "note_required", "退回修改时请写明要改什么")
        request.round += 1
        text = f"退回修改，进入第 {request.round} 轮"
    if note:
        text += f"：{note}"
    request.status = status
    request.events = [*request.events, _event(by, text)]
    request.updated_at = utcnow()


def next_label(session: Session, request: DesignRequest) -> str:
    count = session.scalar(
        select(func.count())
        .select_from(Asset)
        .where(Asset.request_id == request.id, Asset.role.in_(("candidate", "final")), Asset.round == request.round)
    )
    count = count or 0
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    return letters[count] if count < len(letters) else str(count + 1)


def add_candidate(
    session: Session,
    request: DesignRequest,
    stored: dict,
    *,
    by: str | None,
    source: str = "upload",
    prompt: str | None = None,
    note: str | None = None,
) -> Asset:
    if request.status in {"done", "cancelled"}:
        raise AppError(409, "request_closed", "需求单已定稿或已取消，不能再交稿")
    if source == "ai":
        ai_count = session.scalar(
            select(func.count())
            .select_from(Asset)
            .where(Asset.request_id == request.id, Asset.source == "ai", Asset.round == request.round)
        )
        if (ai_count or 0) >= MAX_AI_CANDIDATES_PER_ROUND:
            raise AppError(409, "too_many_ai_candidates", f"这一轮 AI 已经交了 {MAX_AI_CANDIDATES_PER_ROUND} 张，请先评审")
    asset = Asset(
        **stored,
        request_id=request.id,
        role="candidate",
        brand=request.brand,
        product_code=request.product_code,
        campaign_id=request.campaign_id,
        kind=request.kind,
        tags=[],
        source=source,
        prompt=prompt,
        round=request.round,
        label=next_label(session, request),
        note=note,
        created_by=by,
        created_at=utcnow(),
    )
    session.add(asset)
    text = f"第 {request.round} 轮候选稿 {asset.label}" + ("（AI 生成）" if source == "ai" else "")
    if request.status in {"open", "in_progress"}:
        text = f"{STATUS_LABELS[request.status]} → 待评审，" + text
        request.status = "reviewing"
    request.events = [*request.events, _event(by, text)]
    request.updated_at = utcnow()
    session.flush()
    return asset


def copy_compliance(session: Session, request: DesignRequest) -> dict:
    return check_text(session, request.copy_text or "")


def finalize(session: Session, request: DesignRequest, asset_ids: list[int], *, by: str | None) -> None:
    if request.status != "reviewing":
        raise AppError(409, "invalid_transition", "待评审的需求单才能定稿")
    report = copy_compliance(session, request)
    if not report["passed"]:
        words = "、".join(hit["word"] for hit in report["hits"] if hit["level"] == "must")
        raise AppError(400, "compliance_failed", f"图上文案有必须修改的违禁词：{words}")
    chosen = session.scalars(select(Asset).where(Asset.id.in_(asset_ids), Asset.request_id == request.id)).all()
    if not chosen or len(chosen) != len(set(asset_ids)):
        raise AppError(400, "invalid_assets", "请选择这张需求单的候选稿")
    if any(asset.role != "candidate" for asset in chosen):
        raise AppError(400, "invalid_assets", "只能选候选稿定稿")
    for asset in chosen:
        asset.role = "final"
    labels = "、".join(f"第 {a.round} 轮 {a.label}" for a in chosen)
    request.status = "done"
    request.events = [*request.events, _event(by, f"待评审 → 已定稿：{labels}，已归入素材库")]
    request.updated_at = utcnow()


def add_comment(
    session: Session,
    request: DesignRequest,
    *,
    body: str,
    author: str | None,
    asset_id: int | None,
    x: float | None,
    y: float | None,
) -> DesignComment:
    if asset_id is not None:
        asset = session.get(Asset, asset_id)
        if asset is None or asset.request_id != request.id:
            raise AppError(400, "invalid_asset", "批注的图不属于这张需求单")
    if (x is None) != (y is None):
        raise AppError(400, "invalid_position", "图上位置要同时给 x 和 y")
    if x is not None and asset_id is None:
        raise AppError(400, "invalid_position", "图上批注要指定是哪张图")
    comment = DesignComment(
        request_id=request.id,
        asset_id=asset_id,
        body=body,
        x=x,
        y=y,
        author=author,
        resolved=False,
        created_at=utcnow(),
    )
    session.add(comment)
    request.updated_at = utcnow()
    session.flush()
    return comment


def is_overdue(request: DesignRequest, today_value) -> bool:
    return request.status not in {"done", "cancelled"} and request.due_date is not None and request.due_date < today_value
