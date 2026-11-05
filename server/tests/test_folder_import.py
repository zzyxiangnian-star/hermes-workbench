import os
import time

from helpers import SAMPLES, create_shop, issues


def _old(path):
    past = time.time() - 60
    os.utime(path, (past, past))


def test_folder_scan_detects_kinds_and_moves_files(client, tmp_path, monkeypatch):
    root = tmp_path / "报表"
    shop_dir = root / "星年天猫旗舰店"
    shop_dir.mkdir(parents=True)
    create_shop(client, "tmall", "星年天猫旗舰店", "星年")
    for name, target in (
        ("products-tmall.xlsx", "商品1105.xlsx"),
        ("metrics-tmall.xlsx", "经营1105.xlsx"),
        ("ad-spend-tmall.xlsx", "投放1105.xlsx"),
    ):
        (shop_dir / target).write_bytes((SAMPLES / name).read_bytes())
        _old(shop_dir / target)
    (shop_dir / "说明.txt").write_text("不是表格", encoding="utf-8")
    (shop_dir / "~$商品1105.xlsx").write_bytes(b"lock")
    unknown = root / "没有这个店"
    unknown.mkdir()
    (unknown / "a.csv").write_text("商品编码,标题,售价,库存\nA,x,1,1\n", encoding="utf-8")
    _old(unknown / "a.csv")
    (shop_dir / "乱表.csv").write_text("随便,什么\n1,2\n", encoding="utf-8")
    _old(shop_dir / "乱表.csv")

    monkeypatch.setenv("WB_IMPORT_DIR", str(root))
    status = client.get("/api/import/folder").json()
    assert status == {"enabled": True, "path": str(root), "exists": True}

    result = client.post("/api/import/folder/scan")
    assert result.status_code == 200, result.text
    body = result.json()
    assert body["imported"] == 3
    assert body["failed"] == 2
    kinds = {item["file"]: item["kind"] for item in body["files"] if item["ok"]}
    assert kinds == {"商品1105.xlsx": "products", "经营1105.xlsx": "metrics", "投放1105.xlsx": "ad_spend"}
    reasons = {item["file"]: item["reason"] for item in body["files"] if not item["ok"]}
    assert "没有叫“没有这个店”的店铺" in reasons["a.csv"]
    assert "看不出是商品、经营、投放还是订单表" in reasons["乱表.csv"]

    done = sorted(p.name for p in (shop_dir / "已导入").iterdir())
    assert sum(name.endswith(".xlsx") for name in done) == 3
    assert any(name.endswith(".原因.txt") for name in done)  # 样表里有故意写坏的行
    assert (unknown / "失败").is_dir()
    assert any(p.name.endswith("a.csv.原因.txt") for p in (unknown / "失败").iterdir())
    assert sorted(p.name for p in shop_dir.iterdir() if p.is_file()) == ["~$商品1105.xlsx", "说明.txt"]

    assert issues(client, status="open")
    overview = client.get("/api/overview", params={"date": "2026-11-04"}).json()
    assert overview["metrics"]["visitors"]["value"] == 1200

    again = client.post("/api/import/folder/scan").json()
    assert again["files"] == []


def test_folder_not_configured(client, monkeypatch):
    monkeypatch.delenv("WB_IMPORT_DIR", raising=False)
    assert client.get("/api/import/folder").json()["enabled"] is False
    response = client.post("/api/import/folder/scan")
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "import_dir_not_configured"


def test_scheduled_scan_waits_for_new_files(client, tmp_path):
    from app.folder_import import scan

    root = tmp_path / "r"
    (root / "星年天猫旗舰店").mkdir(parents=True)
    create_shop(client)
    fresh = root / "星年天猫旗舰店" / "新.xlsx"
    fresh.write_bytes((SAMPLES / "products-tmall.xlsx").read_bytes())
    result = scan(client.app.state.session_factory, root)
    assert result["files"] == []
    assert fresh.exists()
