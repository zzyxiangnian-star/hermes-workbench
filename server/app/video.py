"""短视频：分镜脚本、配音、初剪包。

流程：写分镜（每镜画面说明、口播、字幕、时长、画面素材、配音）→ 送审（口播和字幕过违禁词）→ 通过
→ 下载初剪包（素材按镜号排好 + 字幕 SRT + 时间线），剪辑在剪映里精修 → 成片传回来，项目完成。
画面素材可以直接用素材库里的图（例如设计页的定稿），配音可以人录，也可以让视频助手用 Hermes 的配音工具生成。
"""

from __future__ import annotations

import csv
import io
import json
import re
import struct
import zipfile
from pathlib import Path

from sqlalchemy.orm import Session, object_session

from app import csv_safe
from app.brand import check_text
from app.design import AUDIO_MIMES, IMAGE_MIMES, file_path
from app.errors import AppError
from app.installs import _event
from app.models import Asset, VideoProject, VideoShot, utcnow

STATUS_LABELS = {
    "draft": "写脚本",
    "in_review": "待审核",
    "approved": "已通过",
    "done": "已完成",
    "cancelled": "已取消",
}
ASPECT_SIZES = {"9:16": (1080, 1920), "16:9": (1920, 1080), "1:1": (1080, 1080), "3:4": (1080, 1440)}
VIDEO_MIMES = {"video/mp4", "video/quicktime"}
MAX_SHOTS = 60
MAX_SHOT_SECONDS = 60.0
SUBTITLE_SPLIT = re.compile(r"(?<=[。！？!?；;，,])")
SUBTITLE_MAX = 16


# ---- 音频时长（不装额外的库，读文件头）----


def audio_duration(data: bytes, mime: str) -> float | None:
    try:
        if mime == "audio/wav":
            return _wav_duration(data)
        if mime == "audio/mpeg":
            return _mp3_duration(data)
    except (struct.error, IndexError, ZeroDivisionError):
        return None
    return None


def _wav_duration(data: bytes) -> float | None:
    i = 12
    byte_rate = None
    while i + 8 <= len(data):
        kind, size = data[i : i + 4], struct.unpack("<I", data[i + 4 : i + 8])[0]
        if kind == b"fmt ":
            byte_rate = struct.unpack("<I", data[i + 16 : i + 20])[0]
        elif kind == b"data" and byte_rate:
            return round(min(size, len(data) - i - 8) / byte_rate, 3)
        i += 8 + size + (size & 1)
    return None


_MP3_BITRATES = {
    (1, 1): [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448],
    (1, 2): [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384],
    (1, 3): [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
    (2, 1): [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256],
    (2, 2): [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160],
}
_MP3_RATES = {3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000]}


def _mp3_duration(data: bytes) -> float | None:
    """逐帧累加时长，CBR、VBR 都对。"""
    i = 0
    if data.startswith(b"ID3"):
        size = data[6:10]
        i = 10 + ((size[0] & 0x7F) << 21 | (size[1] & 0x7F) << 14 | (size[2] & 0x7F) << 7 | (size[3] & 0x7F))
    total = 0.0
    frames = 0
    while i + 4 <= len(data):
        b1, b2 = data[i + 1], data[i + 2]
        if data[i] != 0xFF or b1 & 0xE0 != 0xE0:
            if frames:
                break
            i += 1
            continue
        version_bits, layer_bits = (b1 >> 3) & 3, (b1 >> 1) & 3
        bitrate_index, rate_index, padding = b2 >> 4, (b2 >> 2) & 3, (b2 >> 1) & 1
        if version_bits == 1 or layer_bits == 0 or bitrate_index in (0, 15) or rate_index == 3:
            i += 1
            continue
        version = 1 if version_bits == 3 else 2
        layer = 4 - layer_bits
        bitrate = _MP3_BITRATES[(version, min(layer, 2) if version == 2 else layer)][bitrate_index] * 1000
        rate = _MP3_RATES[version_bits][rate_index]
        if layer == 1:
            samples, length = 384, (12 * bitrate // rate + padding) * 4
        else:
            samples = 1152 if (layer == 2 or version == 1) else 576
            length = samples // 8 * bitrate // rate + padding
        if length <= 0:
            break
        total += samples / rate
        frames += 1
        i += length
    return round(total, 3) if frames else None


# ---- 分镜 ----


def check_media(asset: Asset, slot: str) -> None:
    if slot == "voice" and asset.mime not in AUDIO_MIMES:
        raise AppError(400, "invalid_media", "配音必须是 MP3、WAV、M4A 或 OGG")
    if slot == "visual" and asset.mime not in IMAGE_MIMES | VIDEO_MIMES:
        raise AppError(400, "invalid_media", "画面素材必须是图片或视频")
    if slot == "bgm" and asset.mime not in AUDIO_MIMES:
        raise AppError(400, "invalid_media", "背景音乐必须是 MP3、WAV、M4A 或 OGG")


def require_editable(project: VideoProject) -> None:
    if project.status != "draft":
        raise AppError(409, "project_locked", f"项目{STATUS_LABELS[project.status]}，不能改脚本；需要改请先撤回或退回")


def shot_length(shot: VideoShot) -> float:
    voice = shot.voice
    voice_seconds = audio_seconds(voice) if voice else None
    return round(max(shot.duration, voice_seconds or 0.0), 3)


def audio_seconds(asset: Asset) -> float | None:
    if asset.mime not in AUDIO_MIMES:
        return None
    try:
        return audio_duration(file_path(asset).read_bytes(), asset.mime)
    except AppError:
        return None


def timeline(project: VideoProject) -> dict:
    """每镜在成片里的起止时间。有配音时，镜头至少和配音一样长。"""
    width, height = ASPECT_SIZES[project.aspect]
    start = 0.0
    shots = []
    for shot in project.shots:
        length = shot_length(shot)
        shots.append(
            {
                "seq": shot.seq,
                "start": round(start, 3),
                "end": round(start + length, 3),
                "duration": length,
                "visual": shot.visual,
                "voiceover": shot.voiceover,
                "subtitle": subtitle_text(shot),
                "media": _media_info(shot.media),
                "voice": _media_info(shot.voice),
            }
        )
        start += length
    return {
        "project_id": project.id,
        "title": project.title,
        "aspect": project.aspect,
        "width": width,
        "height": height,
        "duration": round(start, 3),
        "shots": shots,
        "bgm": _media_info(_bgm(project)),
    }


def _media_info(asset: Asset | None) -> dict | None:
    if asset is None:
        return None
    return {
        "asset_id": asset.id,
        "file_name": asset.file_name,
        "mime": asset.mime,
        "url": f"/api/assets/{asset.id}/file",
        "package_name": None,
    }


def subtitle_text(shot: VideoShot) -> str:
    return (shot.subtitle if shot.subtitle is not None else shot.voiceover) or ""


def srt(project: VideoProject) -> str:
    """一镜的字幕按标点切成几条，时间按字数分。"""
    cues = []
    start = 0.0
    for shot in project.shots:
        length = shot_length(shot)
        pieces = _subtitle_lines(subtitle_text(shot))
        total = sum(len(p) for p in pieces) or 1
        at = start
        for piece in pieces:
            span = length * len(piece) / total
            cues.append((at, at + span, piece))
            at += span
        start += length
    lines = []
    for n, (a, b, text) in enumerate(cues, 1):
        lines += [str(n), f"{_srt_time(a)} --> {_srt_time(b)}", text, ""]
    return "\n".join(lines)


def _subtitle_lines(text: str) -> list[str]:
    """按标点切开，再把短句拼回去，每条不超过 SUBTITLE_MAX 个字；行末标点去掉（字幕习惯）。"""
    lines: list[str] = []
    for piece in (p.strip() for p in SUBTITLE_SPLIT.split(text)):
        if not piece:
            continue
        if lines and len(lines[-1]) + len(piece) <= SUBTITLE_MAX:
            lines[-1] += piece
        else:
            lines.append(piece)
    return [line.rstrip("，,；;。") or line for line in lines]


def _srt_time(seconds: float) -> str:
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def script_text(project: VideoProject) -> str:
    parts = [project.title]
    for shot in project.shots:
        parts += [shot.voiceover or "", subtitle_text(shot)]
    return "\n".join(p for p in parts if p)


def compliance(session: Session, project: VideoProject) -> dict:
    return check_text(session, script_text(project))


# ---- 流转 ----


def submit(session: Session, project: VideoProject, by: str | None) -> None:
    if project.status != "draft":
        raise AppError(409, "invalid_transition", "只有写脚本中的项目可以送审")
    if not project.shots:
        raise AppError(400, "no_shots", "还没有分镜")
    report = compliance(session, project)
    if not report["passed"]:
        words = "、".join(hit["word"] for hit in report["hits"] if hit["level"] == "must")
        raise AppError(400, "compliance_failed", f"口播或字幕里有必须修改的违禁词：{words}")
    _move(project, "in_review", by)


def approve(project: VideoProject, by: str | None) -> None:
    if project.status != "in_review":
        raise AppError(409, "invalid_transition", "待审核的项目才能通过")
    project.reviewer = by
    _move(project, "approved", by)


def reject(project: VideoProject, by: str | None, note: str | None) -> None:
    if project.status not in {"in_review", "approved"}:
        raise AppError(409, "invalid_transition", "待审核或已通过的项目才能退回")
    if not note:
        raise AppError(400, "note_required", "退回时请写明要改什么")
    _move(project, "draft", by, f"退回：{note}")


def withdraw(project: VideoProject, by: str | None) -> None:
    if project.status != "in_review":
        raise AppError(409, "invalid_transition", "待审核的项目才能撤回")
    _move(project, "draft", by, "撤回修改")


def cancel(project: VideoProject, by: str | None) -> None:
    if project.status in {"done", "cancelled"}:
        raise AppError(409, "invalid_transition", "已完成或已取消的项目不能取消")
    _move(project, "cancelled", by)


def finish(project: VideoProject, asset: Asset, by: str | None) -> None:
    if project.status != "approved":
        raise AppError(409, "invalid_transition", "脚本审核通过后才能交成片")
    project.final_asset_id = asset.id
    project.editor = by or project.editor
    _move(project, "done", by, "交成片，已归入素材库")


def _move(project: VideoProject, status: str, by: str | None, text: str | None = None) -> None:
    label = f"{STATUS_LABELS[project.status]} → {STATUS_LABELS[status]}"
    project.status = status
    project.events = [*project.events, _event(by, f"{label}：{text}" if text else label)]
    project.updated_at = utcnow()


# ---- 初剪包 ----

README = """初剪包：{title}

画幅 {aspect}（{width}x{height}），总长约 {duration:.1f} 秒，共 {count} 个镜头。

怎么用（剪映专业版）：
1. 新建草稿，画幅比例选 {aspect}。
2. 把“素材”文件夹整个拖进剪映的媒体区。
3. 按文件名的镜号顺序，把画面拖到主轨、配音拖到音频轨。每镜的起止时间见“时间线.json”或“分镜表.csv”。
   图片默认 3 秒，请按分镜表里的时长拉长。
4. 文本 → 导入字幕 → 选“字幕.srt”。
5. 有 bgm 的话放到第二条音频轨，音量调到 20%–30%。

这个包是按审核通过的脚本生成的，改动口播或字幕后请重新送审再下载。
"""


def package(project: VideoProject) -> bytes:
    """素材按镜号命名，加字幕、分镜表、时间线和说明，打成 zip。"""
    if project.status not in {"approved", "done"}:
        raise AppError(409, "not_approved", "脚本审核通过后才能下载初剪包")
    line = timeline(project)
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        table = io.StringIO()
        writer = csv_safe.writer(table)
        writer.writerow(["镜号", "开始(秒)", "结束(秒)", "时长(秒)", "画面", "口播", "字幕", "画面文件", "配音文件"])
        for shot, item in zip(project.shots, line["shots"]):
            names = {}
            for slot, asset in (("画面", shot.media), ("配音", shot.voice)):
                if asset is None:
                    continue
                name = f"素材/{shot.seq:02d}_{slot}{Path(asset.stored_path).suffix}"
                archive.write(file_path(asset), name)
                names[slot] = name
                item["media" if slot == "画面" else "voice"]["package_name"] = name
            writer.writerow(
                [
                    shot.seq,
                    item["start"],
                    item["end"],
                    item["duration"],
                    shot.visual or "",
                    shot.voiceover or "",
                    item["subtitle"],
                    names.get("画面", ""),
                    names.get("配音", ""),
                ]
            )
        bgm = _bgm(project)
        if bgm is not None:
            name = f"素材/bgm{Path(bgm.stored_path).suffix}"
            archive.write(file_path(bgm), name)
            line["bgm"]["package_name"] = name
        archive.writestr("分镜表.csv", table.getvalue().encode("utf-8-sig"))
        archive.writestr("字幕.srt", srt(project).encode("utf-8-sig"))
        archive.writestr("时间线.json", json.dumps(line, ensure_ascii=False, indent=2))
        archive.writestr(
            "说明.txt",
            README.format(
                title=project.title,
                aspect=project.aspect,
                width=line["width"],
                height=line["height"],
                duration=line["duration"],
                count=len(project.shots),
            ),
        )
    return buffer.getvalue()


def _bgm(project: VideoProject) -> Asset | None:
    session = object_session(project)
    return session.get(Asset, project.bgm_asset_id) if session and project.bgm_asset_id else None
