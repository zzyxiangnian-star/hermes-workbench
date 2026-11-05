"""资料页：品牌规范、违禁词、合规检查、商品资料卡。"""

from decimal import Decimal

from fastapi import APIRouter, Depends, Response
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.api.products import _like
from app.brand import check_text
from app.brand_schemas import (
    BannedWordIn,
    BannedWordOut,
    BannedWordPatch,
    BrandGuideIn,
    BrandGuideOut,
    CardListing,
    ComplianceIn,
    ComplianceOut,
    ProductCardIn,
    ProductCardOut,
    ProductCardPatch,
)
from app.db import get_db
from app.installs import sync_installs
from app.errors import AppError
from app.models import BannedWord, BrandGuide, Product, ProductCard, utcnow

router = APIRouter()


# ---- 品牌规范 ----


@router.get("/brand-guides", response_model=list[BrandGuideOut])
def list_guides(session: Session = Depends(get_db)) -> list[BrandGuideOut]:
    return [BrandGuideOut.model_validate(item) for item in session.scalars(select(BrandGuide).order_by(BrandGuide.brand))]


@router.get("/brand-guides/{brand}", response_model=BrandGuideOut)
def get_guide(brand: str, session: Session = Depends(get_db)) -> BrandGuideOut:
    guide = session.scalar(select(BrandGuide).where(BrandGuide.brand == brand.strip()))
    if guide is None:
        raise AppError(404, "brand_guide_not_found", "这个品牌还没有品牌规范")
    return BrandGuideOut.model_validate(guide)


@router.put("/brand-guides/{brand}", response_model=BrandGuideOut)
def put_guide(brand: str, payload: BrandGuideIn, session: Session = Depends(get_db)) -> BrandGuideOut:
    name = brand.strip()
    if not name:
        raise AppError(400, "invalid_brand", "品牌不能为空")
    guide = session.scalar(select(BrandGuide).where(BrandGuide.brand == name))
    if guide is None:
        guide = BrandGuide(brand=name)
        session.add(guide)
    guide.tone = payload.tone
    guide.colors = payload.colors
    guide.fonts = payload.fonts
    guide.logo_rules = payload.logo_rules
    guide.notes = payload.notes
    guide.updated_at = utcnow()
    session.flush()
    return BrandGuideOut.model_validate(guide)


# ---- 违禁词 ----


@router.get("/banned-words", response_model=list[BannedWordOut])
def list_words(session: Session = Depends(get_db)) -> list[BannedWordOut]:
    return [BannedWordOut.model_validate(item) for item in session.scalars(select(BannedWord).order_by(BannedWord.id))]


@router.post("/banned-words", response_model=BannedWordOut, status_code=201)
def create_word(payload: BannedWordIn, session: Session = Depends(get_db)) -> BannedWordOut:
    if session.scalar(select(BannedWord.id).where(BannedWord.word == payload.word)) is not None:
        raise AppError(409, "banned_word_exists", "这个词已经在词库里")
    word = BannedWord(
        word=payload.word,
        level=payload.level,
        category=payload.category,
        suggestion=payload.suggestion,
        enabled=True,
    )
    session.add(word)
    session.flush()
    return BannedWordOut.model_validate(word)


@router.patch("/banned-words/{word_id}", response_model=BannedWordOut)
def patch_word(word_id: int, payload: BannedWordPatch, session: Session = Depends(get_db)) -> BannedWordOut:
    word = session.get(BannedWord, word_id)
    if word is None:
        raise AppError(404, "banned_word_not_found", "违禁词不存在")
    fields = payload.model_fields_set
    if "level" in fields and payload.level is not None:
        word.level = payload.level
    if "category" in fields and payload.category and payload.category.strip():
        word.category = payload.category.strip()
    if "suggestion" in fields:
        word.suggestion = payload.suggestion
    if "enabled" in fields and payload.enabled is not None:
        word.enabled = payload.enabled
    session.flush()
    return BannedWordOut.model_validate(word)


@router.delete("/banned-words/{word_id}", status_code=204)
def delete_word(word_id: int, session: Session = Depends(get_db)) -> Response:
    word = session.get(BannedWord, word_id)
    if word is None:
        raise AppError(404, "banned_word_not_found", "违禁词不存在")
    session.delete(word)
    return Response(status_code=204)


@router.post("/compliance/check", response_model=ComplianceOut)
def compliance_check(payload: ComplianceIn, session: Session = Depends(get_db)) -> dict:
    return check_text(session, payload.text)


# ---- 商品资料卡 ----


@router.get("/product-cards", response_model=list[ProductCardOut])
def list_cards(brand: str | None = None, q: str | None = None, session: Session = Depends(get_db)) -> list[ProductCardOut]:
    stmt = select(ProductCard).order_by(ProductCard.id)
    if brand and brand.strip():
        stmt = stmt.where(ProductCard.brand == brand.strip())
    if q and q.strip():
        pattern = _like(q.strip())
        stmt = stmt.where(
            ProductCard.name.ilike(pattern, escape="\\") | ProductCard.product_code.ilike(pattern, escape="\\")
        )
    return [card_out(session, card) for card in session.scalars(stmt)]


@router.get("/product-cards/{card_id}", response_model=ProductCardOut)
def get_card(card_id: int, session: Session = Depends(get_db)) -> ProductCardOut:
    return card_out(session, _card(session, card_id))


@router.post("/product-cards", response_model=ProductCardOut, status_code=201)
def create_card(payload: ProductCardIn, session: Session = Depends(get_db)) -> ProductCardOut:
    if session.scalar(select(ProductCard.id).where(ProductCard.product_code == payload.product_code)) is not None:
        raise AppError(409, "product_card_exists", "这个商品编码已经有资料卡")
    card = ProductCard(
        product_code=payload.product_code,
        brand=payload.brand,
        name=payload.name,
        selling_points=payload.selling_points,
        specs=payload.specs,
        faq=[item.model_dump() for item in payload.faq],
        install_required=payload.install_required,
        notes=payload.notes,
        updated_at=utcnow(),
    )
    session.add(card)
    session.flush()
    if card.install_required:
        sync_installs(session)
    return card_out(session, card)


@router.patch("/product-cards/{card_id}", response_model=ProductCardOut)
def patch_card(card_id: int, payload: ProductCardPatch, session: Session = Depends(get_db)) -> ProductCardOut:
    card = _card(session, card_id)
    fields = payload.model_fields_set
    for name in ("brand", "name"):
        if name in fields:
            value = (getattr(payload, name) or "").strip()
            if not value:
                raise AppError(400, f"invalid_{name}", "品牌和名称不能为空")
            setattr(card, name, value)
    if "selling_points" in fields and payload.selling_points is not None:
        card.selling_points = [item.strip() for item in payload.selling_points if item.strip()]
    if "faq" in fields and payload.faq is not None:
        card.faq = [item.model_dump() for item in payload.faq]
    if "install_required" in fields and payload.install_required is not None:
        card.install_required = payload.install_required
    for name in ("specs", "notes"):
        if name in fields:
            setattr(card, name, getattr(payload, name))
    card.updated_at = utcnow()
    session.flush()
    if card.install_required:
        sync_installs(session)
    return card_out(session, card)


@router.delete("/product-cards/{card_id}", status_code=204)
def delete_card(card_id: int, session: Session = Depends(get_db)) -> Response:
    session.delete(_card(session, card_id))
    return Response(status_code=204)


def _card(session: Session, card_id: int) -> ProductCard:
    card = session.get(ProductCard, card_id)
    if card is None:
        raise AppError(404, "product_card_not_found", "商品资料卡不存在")
    return card


def card_out(session: Session, card: ProductCard) -> ProductCardOut:
    """资料卡加上各店铺里同编码商品的售价和库存，资料只维护一份。"""
    products = session.scalars(
        select(Product)
        .where(Product.product_code == card.product_code)
        .options(joinedload(Product.shop))
        .order_by(Product.shop_id)
    ).all()
    listings = [
        CardListing(
            shop_id=item.shop_id,
            shop_name=item.shop.name,
            platform=item.shop.platform,
            sku=item.sku,
            price=Decimal(item.price),
            stock=item.stock,
            activity=item.activity,
        )
        for item in products
    ]
    out = ProductCardOut.model_validate(card)
    out.listings = listings
    return out
