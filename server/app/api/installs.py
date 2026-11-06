"""安装页：订单导入、安装工单、导出给服务商、顾客预约通知。"""

from datetime import timezone

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.products import _like
from app.brand_schemas import (
    InstallDetail,
    InstallExportIn,
    InstallNoteIn,
    InstallOut,
    InstallStatusIn,
    InstallSummary,
)
from app.db import get_db
from app.errors import AppError
from app.importer import parse_mapping
from app.importer import read_report
from app.installs import (
    STATUS_LABELS,
    add_note,
    change_status,
    customer_notice,
    export_csv,
    import_orders,
    is_overdue,
    done_on,
    money,
    order_code,
    sync_installs,
)
from app.models import InstallOrder, Order, utcnow
from app.overview import SHANGHAI

router = APIRouter()


@router.post("/import/orders")
async def upload_orders(
    shop_id: int = Form(...),
    mapping: str | None = Form(None),
    file: UploadFile = File(...),
    session: Session = Depends(get_db),
) -> dict:
    content = await read_report(file)
    run, stats = import_orders(
        session, shop_id=shop_id, file_name=file.filename or "upload", content=content, mapping=parse_mapping(mapping)
    )
    return {
        "id": run.id,
        "file_name": run.file_name,
        "shop_id": run.shop_id,
        "kind": run.kind,
        "rows_ok": run.rows_ok,
        "rows_failed": run.rows_failed,
        "errors": run.errors,
        "created_at": run.created_at.astimezone(timezone.utc).isoformat() if run.created_at.tzinfo else run.created_at.isoformat(),
        "installs": {"created": stats["created"], "cancelled": stats["cancelled"]},
        "customers": {"created": stats["customers"]},
    }


@router.get("/installs/summary", response_model=InstallSummary)
def install_summary(shop_id: int | None = None, session: Session = Depends(get_db)) -> dict:
    counts = {key: 0 for key in STATUS_LABELS}
    overdue = done_today = 0
    now = utcnow()
    today = now.astimezone(SHANGHAI).date()
    for item in session.scalars(_scoped(shop_id)):
        counts[item.status] += 1
        overdue += is_overdue(item, now)
        done_today += done_on(item, today)
    return {
        **counts,
        "overdue": overdue,
        "done_today": done_today,
        "needs_action": counts["pending"] + counts["exception"],
    }


@router.get("/installs", response_model=list[InstallOut])
def list_installs(
    status: str | None = None,
    shop_id: int | None = None,
    q: str | None = None,
    overdue: bool | None = None,
    session: Session = Depends(get_db),
) -> list[dict]:
    if status is not None and status not in STATUS_LABELS:
        raise AppError(400, "invalid_status", "状态必须是 pending、booked、done、exception 或 cancelled")
    stmt = _scoped(shop_id).order_by(InstallOrder.created_at.desc(), InstallOrder.id.desc())
    if status is not None:
        stmt = stmt.where(InstallOrder.status == status)
    if q and q.strip():
        pattern = _like(q.strip())
        stmt = stmt.join(Order, InstallOrder.order_id == Order.id).where(
            Order.order_no.ilike(pattern, escape="\\")
            | Order.title.ilike(pattern, escape="\\")
            | Order.buyer_name.ilike(pattern, escape="\\")
            | Order.phone.ilike(pattern, escape="\\")
        )
    items = [install_out(session, item) for item in session.scalars(stmt).unique()]
    if overdue is not None:
        items = [item for item in items if item["overdue"] == overdue]
    return items


@router.post("/installs/sync")
def resync(session: Session = Depends(get_db)) -> dict:
    """改了商品资料卡的“需安装”之后，给已导入的订单补工单。"""
    return sync_installs(session)


@router.post("/installs/export")
def export(payload: InstallExportIn, session: Session = Depends(get_db)) -> Response:
    stmt = _scoped(None).order_by(InstallOrder.id)
    if payload.ids:
        stmt = stmt.where(InstallOrder.id.in_(payload.ids))
    elif payload.status:
        stmt = stmt.where(InstallOrder.status == payload.status)
    installs = list(session.scalars(stmt).unique())
    if not installs:
        raise AppError(404, "nothing_to_export", "没有可导出的工单")
    stamp = utcnow().astimezone(SHANGHAI).strftime("%Y%m%d-%H%M")
    return Response(
        content=export_csv(installs),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''install-{stamp}.csv"},
    )


@router.get("/installs/{install_id}", response_model=InstallDetail)
def get_install(install_id: int, session: Session = Depends(get_db)) -> dict:
    item = _install(session, install_id)
    return {**install_out(session, item), "events": item.events}


@router.post("/installs/{install_id}/status", response_model=InstallDetail)
def set_status(install_id: int, payload: InstallStatusIn, session: Session = Depends(get_db)) -> dict:
    item = _install(session, install_id)
    change_status(
        item,
        payload.status,
        by=payload.by,
        appointment_at=payload.appointment_at,
        engineer=payload.engineer,
        provider_ref=payload.provider_ref,
        reason=payload.reason,
    )
    session.flush()
    return {**install_out(session, item), "events": item.events}


@router.post("/installs/{install_id}/notes", response_model=InstallDetail)
def post_note(install_id: int, payload: InstallNoteIn, session: Session = Depends(get_db)) -> dict:
    item = _install(session, install_id)
    add_note(item, payload.by, payload.note)
    session.flush()
    return {**install_out(session, item), "events": item.events}


@router.get("/installs/{install_id}/notice")
def notice(install_id: int, session: Session = Depends(get_db)) -> dict:
    return {"text": customer_notice(_install(session, install_id))}


def _scoped(shop_id: int | None):
    stmt = select(InstallOrder).options(joinedload(InstallOrder.order), joinedload(InstallOrder.shop))
    if shop_id is not None:
        stmt = stmt.where(InstallOrder.shop_id == shop_id)
    return stmt


def _install(session: Session, install_id: int) -> InstallOrder:
    item = session.scalar(_scoped(None).where(InstallOrder.id == install_id))
    if item is None:
        raise AppError(404, "install_not_found", "工单不存在")
    return item


def install_out(session: Session, item: InstallOrder) -> dict:
    order = item.order
    return {
        "id": item.id,
        "code": f"AZ{item.id:06d}",
        "status": item.status,
        "overdue": is_overdue(item),
        "shop_id": item.shop_id,
        "shop_name": item.shop.name,
        "order_id": order.id,
        "order_no": order.order_no,
        "paid_at": order.paid_at,
        "title": order.title,
        "product_code": order_code(session, order),
        "quantity": order.quantity,
        "amount": money(order.amount),
        "buyer_name": order.buyer_name,
        "phone": order.phone,
        "address": order.address,
        "remark": order.remark,
        "provider": item.provider,
        "provider_ref": item.provider_ref,
        "appointment_at": item.appointment_at,
        "engineer": item.engineer,
        "exception_reason": item.exception_reason,
        "note": item.note,
        "created_at": item.created_at,
        "updated_at": item.updated_at,
    }
