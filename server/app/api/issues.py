from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.errors import AppError
from app.models import Issue, Product, Shop, utcnow
from app.schemas import IssueOut, IssuePatch, IssueShopCount, IssueSummary

router = APIRouter()


@router.get("/issues/summary", response_model=IssueSummary)
def issue_summary(shop_id: int | None = None, session: Session = Depends(get_db)) -> IssueSummary:
    counts = dict(
        session.execute(
            select(Product.shop_id, func.count(Issue.id))
            .join(Issue, (Issue.product_id == Product.id) & (Issue.status == "open"))
            .group_by(Product.shop_id)
        ).all()
    )
    scoped = select(Issue).join(Product, Issue.product_id == Product.id).where(Issue.status == "open")
    if shop_id is not None:
        scoped = scoped.where(Product.shop_id == shop_id)
    scoped = scoped.subquery()
    must_open, warn_open, products_open = session.execute(
        select(
            func.count().filter(scoped.c.level == "must"),
            func.count().filter(scoped.c.level == "warn"),
            func.count(func.distinct(scoped.c.product_id)),
        )
    ).one()
    shops = session.scalars(select(Shop).order_by(Shop.id)).all()
    items = [
        IssueShopCount(
            shop_id=shop.id,
            name=shop.name,
            platform=shop.platform,
            brand=shop.brand,
            open_count=int(counts.get(shop.id, 0)),
        )
        for shop in shops
    ]
    return IssueSummary(
        shops=items,
        total_open=sum(item.open_count for item in items),
        must_open=int(must_open),
        warn_open=int(warn_open),
        products_with_open=int(products_open),
    )


@router.get("/issues", response_model=list[IssueOut])
def list_issues(
    status: str | None = None,
    level: str | None = None,
    shop_id: int | None = None,
    product_id: int | None = None,
    session: Session = Depends(get_db),
) -> list[IssueOut]:
    if status is not None and status not in {"open", "resolved", "ignored"}:
        raise AppError(400, "invalid_status", "状态必须是 open、resolved 或 ignored")
    if level is not None and level not in {"must", "warn"}:
        raise AppError(400, "invalid_level", "级别必须是 must 或 warn")
    stmt = (
        select(Issue)
        .join(Product, Issue.product_id == Product.id)
        .options(joinedload(Issue.product).joinedload(Product.shop), joinedload(Issue.rule))
        .order_by(Issue.found_at.desc(), Issue.id.desc())
    )
    if status is not None:
        stmt = stmt.where(Issue.status == status)
    if level is not None:
        stmt = stmt.where(Issue.level == level)
    if shop_id is not None:
        stmt = stmt.where(Product.shop_id == shop_id)
    if product_id is not None:
        stmt = stmt.where(Issue.product_id == product_id)
    return [_issue_out(issue) for issue in session.scalars(stmt).unique().all()]


@router.patch("/issues/{issue_id}", response_model=IssueOut)
def patch_issue(issue_id: int, payload: IssuePatch, session: Session = Depends(get_db)) -> IssueOut:
    issue = session.scalar(
        select(Issue)
        .where(Issue.id == issue_id)
        .options(joinedload(Issue.product).joinedload(Product.shop), joinedload(Issue.rule))
    )
    if issue is None:
        raise AppError(404, "issue_not_found", "问题不存在")
    if "status" in payload.model_fields_set and payload.status is not None:
        issue.status = payload.status
        if payload.status == "resolved":
            issue.resolved_at = issue.resolved_at or utcnow()
        else:
            issue.resolved_at = None
    if "note" in payload.model_fields_set:
        issue.note = payload.note
    session.flush()
    return _issue_out(issue)


def _issue_out(issue: Issue) -> IssueOut:
    product = issue.product
    shop = product.shop
    return IssueOut(
        id=issue.id,
        product_id=issue.product_id,
        rule_id=issue.rule_id,
        rule_kind=issue.rule.kind,
        level=issue.level,
        message=issue.message,
        status=issue.status,
        found_at=issue.found_at,
        resolved_at=issue.resolved_at,
        note=issue.note,
        shop_id=shop.id,
        shop_name=shop.name,
        sku=product.sku,
        product_code=product.product_code,
        title=product.title,
    )
