import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture(autouse=True)
def _test_host(monkeypatch):
    # TestClient 默认 Host 是 testserver。
    monkeypatch.setenv("WB_ALLOWED_HOSTS", "testserver")


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("WB_SCHEDULER", "off")
    monkeypatch.delenv("WB_FEISHU_WEBHOOK", raising=False)
    monkeypatch.delenv("WB_WECOM_WEBHOOK", raising=False)
    monkeypatch.delenv("WB_ALLOWED_ORIGINS", raising=False)
    monkeypatch.delenv("WORKBENCH_DATABASE_URL", raising=False)
    monkeypatch.setenv("WB_ASSET_DIR", str(tmp_path / "assets"))
    database = "sqlite:///" + (tmp_path / "test.db").resolve().as_posix()
    app = create_app(database)
    with TestClient(app) as test_client:
        yield test_client
