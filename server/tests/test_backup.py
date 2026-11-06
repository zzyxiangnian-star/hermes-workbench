import sqlite3
from datetime import datetime, timedelta

from test_design import png

from app.backup import run_backup


def test_backup_snapshot_assets_and_rotation(client, tmp_path, monkeypatch):
    target = tmp_path / "备份"
    monkeypatch.setenv("WB_BACKUP_DIR", str(target))
    monkeypatch.setenv("WB_BACKUP_KEEP", "2")
    client.post("/api/shops", json={"platform": "tmall", "name": "星年天猫旗舰店", "brand": "星年"})
    client.post("/api/assets", data={"brand": "星年"}, files={"file": ("logo.png", png())})

    first = client.post("/api/backup").json()
    assert first["assets_copied"] == 1 and first["removed"] == []
    snapshot = target / "数据库" / first["database"]
    with sqlite3.connect(snapshot) as db:
        assert db.execute("select name from shops").fetchall() == [("星年天猫旗舰店",)]
    assert len(list((target / "素材").rglob("*.png"))) == 1

    url = "sqlite:///" + (tmp_path / "test.db").resolve().as_posix()
    start = datetime(2020, 1, 1, 12, 30)  # 比第一次备份早，第一次那份是最新的
    for day in range(1, 3):
        result = run_backup(url, now=start + timedelta(days=day))
        assert result["assets_copied"] == 0  # 素材没变，不再复制
    listed = client.get("/api/backup").json()
    assert len(listed["snapshots"]) == 2
    assert [item["name"] for item in listed["snapshots"]] == [first["database"], "test-20200103-123000.db"]


def test_backup_rejects_non_sqlite():
    import pytest

    from app.errors import AppError

    with pytest.raises(AppError):
        run_backup("postgresql://x/y")


def test_csv_cells_cannot_become_formulas():
    from app.csv_safe import safe_cell

    assert safe_cell("=HYPERLINK(\"http://x\")") == "'=HYPERLINK(\"http://x\")"
    assert safe_cell("@SUM(A1)") == "'@SUM(A1)"
    assert safe_cell("-12.5") == "-12.5" and safe_cell(-3) == -3
    assert safe_cell("张先生") == "张先生"
