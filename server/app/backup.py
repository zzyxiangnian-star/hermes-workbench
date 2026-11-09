"""数据备份：不停后端也能做。

- 数据库：用 SQLite 自带的在线备份，拷一份完整快照到 <备份目录>/数据库/workbench-年月日-时分秒.db，只留最近 WB_BACKUP_KEEP 份（默认 14）。
- 素材：文件按内容哈希命名、存好后不再改，所以只把备份里还没有的文件复制过去（增量），不删备份里的旧文件。

备份目录用 WB_BACKUP_DIR 设置，默认 server/data/backups。建议设到另一块硬盘或网盘同步文件夹。
命令行：workbench-backup（或 python -m app.backup）。
"""

from __future__ import annotations

import os
import shutil
import sqlite3
from datetime import datetime
from pathlib import Path

from app.db import default_database_url
from app.design import asset_dir
from app.errors import AppError
from app.overview import SHANGHAI

DEFAULT_BACKUP_DIR = Path(__file__).resolve().parent.parent / "data" / "backups"
DB_FOLDER = "数据库"
ASSET_FOLDER = "素材"


def backup_dir() -> Path:
    raw = os.environ.get("WB_BACKUP_DIR", "").strip()
    return Path(raw).expanduser() if raw else DEFAULT_BACKUP_DIR


def keep_count() -> int:
    raw = os.environ.get("WB_BACKUP_KEEP", "14").strip()
    try:
        return max(int(raw), 1)
    except ValueError as exc:
        raise AppError(500, "bad_backup_keep", "WB_BACKUP_KEEP 必须是份数（整数）") from exc


def sqlite_path(url: str) -> Path:
    if not url.startswith("sqlite:///"):
        raise AppError(400, "backup_unsupported", "只有 SQLite 数据库能用这个备份；其他数据库请用它自己的备份工具")
    raw = url[len("sqlite:///"):].split("?", 1)[0]
    if not raw or raw == ":memory:":
        raise AppError(400, "backup_unsupported", "内存数据库不能备份")
    return Path(raw)


def run_backup(url: str | None = None, target: Path | None = None, now: datetime | None = None) -> dict:
    url = url or default_database_url()
    source = sqlite_path(url)
    if not source.exists():
        raise AppError(404, "database_missing", f"数据库文件不存在：{source}")
    root = target or backup_dir()
    db_dir = root / DB_FOLDER
    db_dir.mkdir(parents=True, exist_ok=True)
    stamp = (now or datetime.now(SHANGHAI)).strftime("%Y%m%d-%H%M%S")
    snapshot = db_dir / f"{source.stem}-{stamp}.db"
    partial = snapshot.with_suffix(".db.part")
    src = sqlite3.connect(source)
    dst = sqlite3.connect(partial)
    try:
        src.backup(dst)
    finally:
        dst.close()
        src.close()
    partial.replace(snapshot)

    removed = []
    snapshots = sorted(db_dir.glob(f"{source.stem}-*.db"))
    for old in snapshots[: max(len(snapshots) - keep_count(), 0)]:
        old.unlink()
        removed.append(old.name)

    copied = 0
    copied_bytes = 0
    assets = asset_dir()
    mirror = root / ASSET_FOLDER
    if assets.exists() and assets.resolve() != mirror.resolve():
        for path in assets.rglob("*"):
            if not path.is_file():
                continue
            dest = mirror / path.relative_to(assets)
            if dest.exists() and dest.stat().st_size == path.stat().st_size:
                continue
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, dest)
            copied += 1
            copied_bytes += path.stat().st_size
    return {
        "dir": str(root),
        "database": snapshot.name,
        "database_bytes": snapshot.stat().st_size,
        "kept": min(len(snapshots), keep_count()),
        "removed": removed,
        "assets_copied": copied,
        "assets_bytes": copied_bytes,
    }


def main() -> None:
    try:
        result = run_backup()
    except AppError as exc:
        if exc.code == "database_missing":
            # 只跑过演示、还没用 start.bat 开过正式库的电脑：没有要备份的东西，不算出错。
            print(f"还没有正式数据（{sqlite_path(default_database_url())} 不存在），不用备份。")
            print("演示数据（demo.db）不在备份范围内。")
            return
        raise SystemExit(f"备份失败：{exc.message}") from exc
    print(f"已备份到 {result['dir']}")
    print(f"数据库：{result['database']}（{result['database_bytes'] // 1024} KB），共保留 {result['kept']} 份")
    print(f"素材：新复制 {result['assets_copied']} 个文件（{result['assets_bytes'] // 1024} KB）")


if __name__ == "__main__":
    main()
