from fastapi import APIRouter

from . import health, imports, issues, products, rules, shops

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(shops.router)
api_router.include_router(products.router)
api_router.include_router(issues.router)
api_router.include_router(rules.router)
api_router.include_router(imports.router)
