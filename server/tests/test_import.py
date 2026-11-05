from helpers import SAMPLES, create_shop, issues, table, upload


def test_samples_import_and_keep_bad_rows(client):
    tmall = create_shop(client, "tmall", "星年天猫旗舰店", "星年")
    first = upload(client, tmall["id"], "products-tmall.xlsx", (SAMPLES / "products-tmall.xlsx").read_bytes())
    assert first.status_code == 200, first.text
    body = first.json()
    assert body["rows_ok"] == 28
    assert body["rows_failed"] == 2
    assert body["errors"] == [
        {"row": 30, "reason": "缺少商品编码"},
        {"row": 31, "reason": "售价不是数字"},
    ]
    assert body["rules"]["opened"] == 10
    assert client.get("/api/products", params={"shop_id": tmall["id"]}).json()["total"] == 28

    jd = create_shop(client, "jd", "星年京东旗舰店", "星年")
    second = upload(client, jd["id"], "products-jd.csv", (SAMPLES / "products-jd.csv").read_bytes())
    assert second.status_code == 200, second.text
    assert second.json()["rows_ok"] == 28
    assert second.json()["rows_failed"] == 2
    assert second.json()["errors"] == [
        {"row": 30, "reason": "缺少商品编码"},
        {"row": 31, "reason": "库存不是整数"},
    ]
    assert client.get("/api/products").json()["total"] == 56

    summary = client.get("/api/issues/summary").json()
    assert summary["total_open"] == 20
    assert [(item["name"], item["open_count"]) for item in summary["shops"]] == [
        ("星年天猫旗舰店", 14),
        ("星年京东旗舰店", 6),
    ]

    open_issues = issues(client, status="open")
    by_sku: dict[str, list[str]] = {}
    for item in open_issues:
        by_sku.setdefault(item["sku"], []).append(item["message"])

    assert by_sku["TM-SN-011"] == ["售价 189 低于底价 199"]
    assert "JD-SN-011" not in by_sku
    assert by_sku["TM-SN-015"] == ["库存 3 低于最低库存 10"]
    assert "JD-SN-015" not in by_sku
    gap = "货号 SN-019 在星年天猫旗舰店售价 100，在星年京东旗舰店售价 120，价差 20% 超过 5%"
    assert by_sku["TM-SN-019"] == [gap]
    assert by_sku["JD-SN-019"] == [gap]
    assert set(by_sku["TM-SN-T01"]) == {"售价 88 低于底价 90", "库存 5 低于最低库存 10"}
    assert set(by_sku["JD-SN-J01"]) == {"售价 60 低于底价 70", "库存 2 低于最低库存 10"}
    for sku in ("TM-SN-001", "TM-SN-009", "TM-SN-010", "TM-SN-023", "TM-SN-T02", "JD-SN-J02", "JD-SN-001"):
        assert sku not in by_sku

    again = upload(client, tmall["id"], "products-tmall.xlsx", (SAMPLES / "products-tmall.xlsx").read_bytes())
    assert again.status_code == 200, again.text
    assert again.json()["rules"]["opened"] == 0
    assert again.json()["rules"]["resolved"] == 0
    assert client.get("/api/products").json()["total"] == 56
    assert len(issues(client, status="open")) == 20


def test_alias_detection_and_explicit_mapping(client):
    shop = create_shop(client)
    aliased = (
        "商家编码,款号,宝贝标题,京东价,最低售价,现货库存,当前活动\n"
        "SKU-1,CODE-1,别名商品,88,90,3,春季上新\n"
    ).encode("utf-8-sig")
    response = upload(client, shop["id"], "alias.csv", aliased)
    assert response.status_code == 200, response.text
    product = client.get("/api/products", params={"q": "SKU-1"}).json()["items"][0]
    assert product["product_code"] == "CODE-1"
    assert product["title"] == "别名商品"
    assert product["price"] == 88
    assert product["floor_price"] == 90
    assert product["stock"] == 3
    assert product["activity"] == "春季上新"

    custom = "平台规格码,通用货号,宝贝名,标价,成本底价,现货,报名\nP-9,C-9,映射商品,70,60,12,日常\n".encode("utf-8")
    missing = upload(client, shop["id"], "custom.csv", custom)
    assert missing.status_code == 400
    assert missing.json()["error"]["code"] == "column_unrecognized"
    mapped = upload(
        client,
        shop["id"],
        "custom.csv",
        custom,
        mapping={
            "平台规格码": "sku",
            "通用货号": "product_code",
            "宝贝名": "title",
            "标价": "price",
            "成本底价": "floor_price",
            "现货": "stock",
            "报名": "activity",
        },
    )
    assert mapped.status_code == 200, mapped.text
    assert mapped.json()["rows_ok"] == 1


def test_bad_row_does_not_stop_import(client):
    shop = create_shop(client)
    content = table(
        ("OK-1", "C1", "正常", 100, 80, 20, "日常"),
        ("", "C2", "空一行", "", "", "", ""),
        ("BAD", "C3", "坏价格", "待定", 10, 10, "日常"),
        ("OK-2", "C4", "另一条", "￥1,299", 900, "8.0", "日常"),
    )
    # The fully empty logical row above still has sku "", so it is a bad row.
    # A truly empty line is covered separately.
    response = upload(client, shop["id"], "mixed.csv", content)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["rows_ok"] == 2
    assert [item["reason"] for item in body["errors"]] == ["缺少商品编码", "售价不是数字"]
    product = client.get("/api/products", params={"q": "OK-2"}).json()["items"][0]
    assert product["price"] == 1299
    assert product["stock"] == 8

    blank = "商品编码,货号,标题,售价,底价,库存,活动\nOK-3,C5,有货,10,9,20,日常\n,,,,,,\nBAD2,C6,坏库存,10,9,很多,日常\n".encode("utf-8")
    skipped = upload(client, shop["id"], "blank.csv", blank)
    assert skipped.status_code == 200, skipped.text
    assert skipped.json()["rows_ok"] == 1
    assert skipped.json()["errors"] == [{"row": 4, "reason": "库存不是整数"}]


def test_unknown_shop_and_unsupported_file_do_not_create_a_run(client):
    missing = upload(client, 99, "a.csv", table(("A", "C", "标题", 1, 1, 1, "")))
    assert missing.status_code == 404
    assert missing.json() == {"error": {"code": "shop_not_found", "message": "店铺不存在"}}
    shop = create_shop(client)
    rejected = upload(client, shop["id"], "notes.txt", b"hello")
    assert rejected.status_code == 400
    assert rejected.json()["error"] == {"code": "unsupported_file", "message": "只支持 xlsx 或 csv 文件"}
    assert client.get("/api/import/runs").json() == []


def test_reimport_updates_same_sku(client):
    shop = create_shop(client)
    first = upload(client, shop["id"], "a.csv", table(("SKU-1", "C1", "旧标题", 100, 80, 20, "日常")))
    assert first.status_code == 200, first.text
    second = upload(client, shop["id"], "b.csv", table(("SKU-1", "C1", "新标题", 120, 80, 20, "日常")))
    assert second.status_code == 200, second.text
    page = client.get("/api/products").json()
    assert page["total"] == 1
    assert page["items"][0]["title"] == "新标题"
    assert page["items"][0]["price"] == 120
