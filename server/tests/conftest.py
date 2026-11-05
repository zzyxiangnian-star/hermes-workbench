import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("WB_SCHEDULER", "off")
    monkeypatch.delenv("WB_FEISHU_WEBHOOK", raising=False)
    monkeypatch.delenv("WB_WECOM_WEBHOOK", raising=False)
    monkeypatch.delenv("WB_ALLOWED_ORIGINS", raising=False)
    monkeypatch.delenv("WORKBENCH_DATABASE_URL", raising=False)
    database = "sqlite:///" + (tmp_path / "test.db").resolve().as_posix()
    app = create_app(database)
    with TestClient(app) as test_client:
        yield test_client
