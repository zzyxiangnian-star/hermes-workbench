from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.importer import import_products, parse_mapping
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
    content = await file.read()
    run, stats = import_products(
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
        rows_ok=run.rows_ok,
        rows_failed=run.rows_failed,
        errors=run.errors,
        created_at=run.created_at,
        rules=RuleRunOut.model_validate(stats) if stats is not None else None,
    )
