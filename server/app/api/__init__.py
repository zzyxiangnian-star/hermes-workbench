from fastapi import APIRouter

from . import ad_rules, alerts, backup, brand_assets, campaigns, contents, customers, design, health, installs, imports, issues, overview, products, reports, rules, shops, video

api_router = APIRouter(prefix="/api")
api_router.include_router(health.router)
api_router.include_router(backup.router)
api_router.include_router(shops.router)
api_router.include_router(products.router)
api_router.include_router(issues.router)
api_router.include_router(rules.router)
api_router.include_router(imports.router)
api_router.include_router(overview.router)
api_router.include_router(alerts.router)
api_router.include_router(ad_rules.router)
api_router.include_router(reports.router)
api_router.include_router(brand_assets.router)
api_router.include_router(campaigns.router)
api_router.include_router(contents.router)
api_router.include_router(installs.router)
api_router.include_router(customers.router)
api_router.include_router(design.router)
api_router.include_router(video.router)
