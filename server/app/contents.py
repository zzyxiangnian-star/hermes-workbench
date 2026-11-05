"""内容稿件：版本快照、合规检查汇总、差异对比。"""

from __future__ import annotations

from difflib import SequenceMatcher

from sqlalchemy.orm import Session

from app.brand import check_text
from app.models import Content, ContentVersion, utcnow

CHAR_DIFF_LIMIT = 5000


def snapshot_of(content: Content) -> dict:
    return {
        "title": content.title,
        "kind": content.kind,
        "body": content.body,
        "variants": [
            {"platform": item.platform, "title": item.title, "body": item.body} for item in content.variants
        ],
    }


def add_version(content: Content, author: str | None, note: str | None) -> None:
    number = (content.versions[-1].version + 1) if content.versions else 1
    content.version = number
    content.versions.append(
        ContentVersion(version=number, snapshot=snapshot_of(content), author=author, note=note, created_at=utcnow())
    )


def compliance_of(session: Session, content: Content) -> dict:
    parts = [{"platform": None, "result": check_text(session, f"{content.title}\n{content.body}")}]
    for variant in content.variants:
        text = f"{variant.title or ''}\n{variant.body}"
        parts.append({"platform": variant.platform, "result": check_text(session, text)})
    must = sum(part["result"]["must_count"] for part in parts)
    warn = sum(part["result"]["warn_count"] for part in parts)
    return {"passed": must == 0, "must_count": must, "warn_count": warn, "parts": parts}


def text_of(snapshot: dict, platform: str | None) -> tuple[str | None, str]:
    if platform is None:
        return snapshot.get("title"), snapshot.get("body", "")
    for variant in snapshot.get("variants", []):
        if variant["platform"] == platform:
            return variant.get("title"), variant.get("body", "")
    return None, ""


def diff_segments(old: str, new: str) -> list[dict]:
    """先按行对比，改动的行块再按字对比。中文没有空格，按字才看得出改了哪几个字。"""
    segments: list[dict] = []
    old_lines = old.splitlines(keepends=True)
    new_lines = new.splitlines(keepends=True)
    for op, i1, i2, j1, j2 in SequenceMatcher(None, old_lines, new_lines, autojunk=False).get_opcodes():
        a = "".join(old_lines[i1:i2])
        b = "".join(new_lines[j1:j2])
        if op == "equal":
            _push(segments, "equal", a)
        elif op == "delete":
            _push(segments, "delete", a)
        elif op == "insert":
            _push(segments, "insert", b)
        elif len(a) + len(b) <= CHAR_DIFF_LIMIT:
            for cop, c1, c2, d1, d2 in SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
                if cop == "equal":
                    _push(segments, "equal", a[c1:c2])
                else:
                    _push(segments, "delete", a[c1:c2])
                    _push(segments, "insert", b[d1:d2])
        else:
            _push(segments, "delete", a)
            _push(segments, "insert", b)
    return segments


def _push(segments: list[dict], op: str, text: str) -> None:
    if not text:
        return
    if segments and segments[-1]["op"] == op:
        segments[-1]["text"] += text
    else:
        segments.append({"op": op, "text": text})
