from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.models import Issue, Product, Shop
from app.schemas import ProductOut, ProductPage

router = APIRouter()


@router.get("/products", response_model=ProductPage)
def list_products(
    shop_id: int | None = None,
    brand: str | None = None,
    q: str | None = None,
    has_issue: bool | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    session: Session = Depends(get_db),
) -> ProductPage:
    criteria = []
    if shop_id is not None:
        criteria.append(Product.shop_id == shop_id)
    if brand is not None and brand.strip():
        brand_ids = select(Shop.id).where(Shop.brand == brand.strip())
        criteria.append(Product.shop_id.in_(brand_ids))
    if q is not None and q.strip():
        pattern = _like(q.strip())
        criteria.append(
            Product.title.ilike(pattern, escape="\\")
            | Product.sku.ilike(pattern, escape="\\")
            | Product.product_code.ilike(pattern, escape="\\")
        )
    if has_issue is not None:
        open_issue = (
            select(Issue.id).where(Issue.product_id == Product.id, Issue.status == "open").exists()
        )
        criteria.append(open_issue if has_issue else ~open_issue)

    count_stmt = select(func.count(Product.id))
    list_stmt = select(Product).options(joinedload(Product.shop)).order_by(Product.id)
    if criteria:
        count_stmt = count_stmt.where(*criteria)
        list_stmt = list_stmt.where(*criteria)
    total = session.scalar(count_stmt) or 0
    rows = session.scalars(list_stmt.offset((page - 1) * page_size).limit(page_size)).all()
    counts = _open_counts(session, [row.id for row in rows])
    items = [
        ProductOut(
            id=row.id,
            shop_id=row.shop_id,
            shop_name=row.shop.name,
            platform=row.shop.platform,
            brand=row.shop.brand,
            sku=row.sku,
            product_code=row.product_code,
            title=row.title,
            price=row.price,
            floor_price=row.floor_price,
            stock=row.stock,
            activity=row.activity,
            updated_at=row.updated_at,
            open_issue_count=counts.get(row.id, 0),
        )
        for row in rows
    ]
    return ProductPage(items=items, total=int(total), page=page, page_size=page_size)


def _open_counts(session: Session, product_ids: list[int]) -> dict[int, int]:
    if not product_ids:
        return {}
    rows = session.execute(
        select(Issue.product_id, func.count(Issue.id))
        .where(Issue.product_id.in_(product_ids), Issue.status == "open")
        .group_by(Issue.product_id)
    ).all()
    return {product_id: int(count) for product_id, count in rows}


def _like(text: str) -> str:
    escaped = text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escaped}%"
