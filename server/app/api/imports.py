from fastapi import APIRouter, Depends, File, Form, Request, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.folder_import import import_dir, scan
from app.importer import import_ad_spend, import_metrics, import_products, parse_mapping, read_report
from app.models import ImportRun
from app.schemas import ImportRunOut, RuleRunOut

router = APIRouter()


@router.post("/import/products", response_model=ImportRunOut)
async def upload_products(
    shop_id: int = Form(...),
    mapping: str | None = Form(None),
    file: UploadFile = File(...),
    session: Session = Depends(get_db),
) -> ImportRunOut:
    content = await read_report(file)
    run, stats = import_products(
        session,
        shop_id=shop_id,
        file_name=file.filename or "upload",
        content=content,
        mapping=parse_mapping(mapping),
    )
    return _run_out(run, stats)


@router.post("/import/metrics", response_model=ImportRunOut)
async def upload_metrics(
    shop_id: int = Form(...),
    mapping: str | None = Form(None),
    file: UploadFile = File(...),
    session: Session = Depends(get_db),
) -> ImportRunOut:
    content = await read_report(file)
    run = import_metrics(
        session,
        shop_id=shop_id,
        file_name=file.filename or "upload",
        content=content,
        mapping=parse_mapping(mapping),
    )
    return _run_out(run, None)


@router.post("/import/ad-spend", response_model=ImportRunOut)
async def upload_ad_spend(
    shop_id: int = Form(...),
    mapping: str | None = Form(None),
    file: UploadFile = File(...),
    session: Session = Depends(get_db),
) -> ImportRunOut:
    content = await read_report(file)
    run, stats = import_ad_spend(
        session,
        shop_id=shop_id,
        file_name=file.filename or "upload",
        content=content,
        mapping=parse_mapping(mapping),
    )
    return _run_out(run, stats)


@router.get("/import/runs", response_model=list[ImportRunOut])
def list_runs(session: Session = Depends(get_db)) -> list[ImportRunOut]:
    runs = session.scalars(select(ImportRun).order_by(ImportRun.id.desc())).all()
    return [_run_out(run, None) for run in runs]


def _run_out(run: ImportRun, stats: dict | None) -> ImportRunOut:
    return ImportRunOut(
        id=run.id,
        file_name=run.file_name,
        shop_id=run.shop_id,
        kind=run.kind,
        rows_ok=run.rows_ok,
        rows_failed=run.rows_failed,
        errors=run.errors,
        created_at=run.created_at,
        rules=RuleRunOut.model_validate(stats) if stats is not None else None,
    )


@router.get("/import/folder")
def folder_status() -> dict:
    root = import_dir()
    return {"enabled": root is not None, "path": str(root) if root else None, "exists": bool(root and root.is_dir())}


@router.post("/import/folder/scan")
def folder_scan(request: Request) -> dict:
    """立即扫一遍报表文件夹（不等定时）。刚放进去 10 秒内的文件也会导。"""
    return scan(request.app.state.session_factory, settle_seconds=0)
