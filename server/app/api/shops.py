from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Shop
from app.schemas import ShopCreate, ShopOut

router = APIRouter()


@router.get("/shops", response_model=list[ShopOut])
def list_shops(session: Session = Depends(get_db)) -> list[ShopOut]:
    shops = session.scalars(select(Shop).order_by(Shop.id)).all()
    return [ShopOut.model_validate(shop) for shop in shops]


@router.post("/shops", response_model=ShopOut, status_code=201)
def create_shop(payload: ShopCreate, session: Session = Depends(get_db)) -> ShopOut:
    shop = Shop(platform=payload.platform, name=payload.name, brand=payload.brand)
    session.add(shop)
    session.flush()
    return ShopOut.model_validate(shop)
