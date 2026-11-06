from fastapi import APIRouter, Request

from app.backup import DB_FOLDER, backup_dir, run_backup, sqlite_path

router = APIRouter()


@router.post("/backup")
def backup_now(request: Request) -> dict:
    """立刻备份一次（数据库快照 + 素材增量）。"""
    return run_backup(request.app.state.database_url)


@router.get("/backup")
def list_backups(request: Request) -> dict:
    """备份目录和已有的数据库快照，新的在前。"""
    root = backup_dir()
    stem = sqlite_path(request.app.state.database_url).stem
    folder = root / DB_FOLDER
    items = sorted(folder.glob(f"{stem}-*.db"), reverse=True) if folder.exists() else []
    return {"dir": str(root), "snapshots": [{"name": p.name, "bytes": p.stat().st_size} for p in items]}
