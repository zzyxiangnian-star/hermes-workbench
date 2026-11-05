import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture()
def client(tmp_path):
    database = "sqlite:///" + (tmp_path / "test.db").resolve().as_posix()
    app = create_app(database)
    with TestClient(app) as test_client:
        yield test_client
