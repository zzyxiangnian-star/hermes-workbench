from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

SERVER = Path(__file__).resolve().parent.parent
EXPECTED_TABLES = {
    "shops",
    "products",
    "rules",
    "issues",
    "import_runs",
    "daily_metrics",
    "ad_spend",
    "ad_rules",
    "alerts",
    "contents",
    "content_variants",
    "content_versions",
    "content_comments",
    "brand_guides",
    "banned_words",
    "product_cards",
    "campaigns",
    "campaign_tasks",
    "orders",
    "install_orders",
    "customers",
    "inquiries",
    "quotes",
    "followups",
    "followup_targets",
    "design_requests",
    "assets",
    "design_comments",
    "alembic_version",
}


def test_alembic_upgrade_head_creates_all_tables(tmp_path, monkeypatch):
    database = tmp_path / "empty.db"
    url = "sqlite:///" + database.resolve().as_posix()
    monkeypatch.delenv("WORKBENCH_DATABASE_URL", raising=False)
    monkeypatch.delenv("WB_ALEMBIC_URL_LOCK", raising=False)
    config = Config(str(SERVER / "alembic.ini"))
    config.set_main_option("sqlalchemy.url", url)
    command.upgrade(config, "head")

    engine = create_engine(url)
    inspector = inspect(engine)
    assert EXPECTED_TABLES <= set(inspector.get_table_names())
    assert "kind" in {column["name"] for column in inspector.get_columns("import_runs")}
    metric_columns = {column["name"] for column in inspector.get_columns("daily_metrics")}
    assert {"date", "shop_id", "visitors", "orders", "sales_amount", "refund_amount", "updated_at"} <= metric_columns
    ad_columns = {column["name"] for column in inspector.get_columns("ad_spend")}
    assert {"date", "shop_id", "tool", "campaign", "spend", "gmv", "clicks", "impressions"} <= ad_columns
    engine.dispose()


def test_extra_allowed_origins(tmp_path, monkeypatch):
    from fastapi.testclient import TestClient

    from app.main import create_app

    monkeypatch.setenv("WB_SCHEDULER", "off")
    monkeypatch.setenv("WB_ALLOWED_ORIGINS", "https://hermes.example, https://other.example")
    database = "sqlite:///" + (tmp_path / "cors.db").resolve().as_posix()
    app = create_app(database)
    with TestClient(app) as client:
        allowed = client.get("/api/health", headers={"Origin": "https://hermes.example"})
        assert allowed.headers["access-control-allow-origin"] == "https://hermes.example"
        blocked = client.get("/api/health", headers={"Origin": "https://evil.example"})
        assert "access-control-allow-origin" not in blocked.headers
