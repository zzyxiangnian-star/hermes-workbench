from helpers import create_shop, issues, rule_by_kind, table, upload


def test_below_floor_hit_miss_and_resolve(client):
    shop = create_shop(client)
    response = upload(
        client,
        shop["id"],
        "floor.csv",
        table(
            ("LOW", "F1", "低于底价", 189, 199, 20, "日常"),
            ("EQ", "F2", "等于底价", 199, 199, 20, "日常"),
            ("NONE", "F3", "没有底价", 50, "", 20, "日常"),
        ),
    )
    assert response.status_code == 200, response.text
    found = issues(client, status="open")
    assert [(item["sku"], item["message"], item["level"]) for item in found] == [
        ("LOW", "售价 189 低于底价 199", "must"),
    ]
    again = client.post("/api/rules/run")
    assert again.status_code == 200, again.text
    assert again.json()["opened"] == 0
    assert len(issues(client, status="open")) == 1

    fixed = upload(client, shop["id"], "floor.csv", table(("LOW", "F1", "低于底价", 199, 199, 20, "日常")))
    assert fixed.status_code == 200, fixed.text
    assert issues(client, status="open") == []
    resolved = issues(client, status="resolved")
    assert len(resolved) == 1
    assert resolved[0]["sku"] == "LOW"
    assert resolved[0]["resolved_at"]


def test_low_stock_hit_and_miss(client):
    shop = create_shop(client)
    response = upload(
        client,
        shop["id"],
        "stock.csv",
        table(
            ("LOW", "S1", "库存不足", 100, 50, 9, "日常"),
            ("EDGE", "S2", "刚好够", 100, 50, 10, "日常"),
        ),
    )
    assert response.status_code == 200, response.text
    found = issues(client, status="open")
    assert [(item["sku"], item["message"]) for item in found] == [("LOW", "库存 9 低于最低库存 10")]
    rule = rule_by_kind(client, "low_stock")
    patched = client.patch(f"/api/rules/{rule['id']}", json={"params": {"min_stock": 5}})
    assert patched.status_code == 200, patched.text
    assert patched.json()["params"]["min_stock"] == 5
    rerun = client.post("/api/rules/run")
    assert rerun.json()["resolved"] == 1
    assert issues(client, status="open") == []


def test_cross_shop_gap_hit_miss_and_resolve(client):
    tmall = create_shop(client, "tmall", "天猫店", "星年")
    jd = create_shop(client, "jd", "京东店", "星年")
    same = table(("A", "GAP-OK", "同价", 100, 50, 20, "日常"), ("B", "GAP-EDGE", "刚好百分之五", 100, 50, 20, "日常"))
    other = table(("A", "GAP-OK", "同价", 100, 50, 20, "日常"), ("B", "GAP-EDGE", "刚好百分之五", 105, 50, 20, "日常"))
    assert upload(client, tmall["id"], "a.csv", same).status_code == 200
    assert upload(client, jd["id"], "b.csv", other).status_code == 200
    assert issues(client, status="open") == []

    widened = table(("A", "GAP-OK", "同价", 120, 50, 20, "日常"), ("B", "GAP-EDGE", "刚好百分之五", 106, 50, 20, "日常"))
    assert upload(client, jd["id"], "b.csv", widened).status_code == 200
    found = issues(client, status="open")
    assert {item["message"] for item in found} == {
        "货号 GAP-OK 在天猫店售价 100，在京东店售价 120，价差 20% 超过 5%",
        "货号 GAP-EDGE 在天猫店售价 100，在京东店售价 106，价差 6% 超过 5%",
    }
    assert len(found) == 4

    calmed = table(("A", "GAP-OK", "同价", 100, 50, 20, "日常"), ("B", "GAP-EDGE", "刚好百分之五", 105, 50, 20, "日常"))
    assert upload(client, jd["id"], "b.csv", calmed).status_code == 200
    assert issues(client, status="open") == []
    assert len(issues(client, status="resolved")) == 4


def test_missing_activity_hit_miss_and_no_duplicate(client):
    shop = create_shop(client)
    response = upload(
        client,
        shop["id"],
        "act.csv",
        table(
            ("IN", "A1", "已报名", 100, 50, 20, "618大促"),
            ("OUT", "A2", "没报名", 100, 50, 20, ""),
            ("OTHER", "A3", "别的活动", 100, 50, 20, "春季上新"),
        ),
    )
    assert response.status_code == 200, response.text
    assert issues(client, status="open") == []

    rule = rule_by_kind(client, "missing_activity")
    patched = client.patch(f"/api/rules/{rule['id']}", json={"params": {"required_activity": "618大促"}})
    assert patched.status_code == 200, patched.text
    first = client.post("/api/rules/run")
    assert first.json()["opened"] == 2
    found = {item["sku"]: item["message"] for item in issues(client, status="open")}
    assert found == {"OUT": "未报名活动「618大促」", "OTHER": "未报名活动「618大促」"}
    second = client.post("/api/rules/run")
    assert second.json()["opened"] == 0
    assert len(issues(client, status="open")) == 2

    fixed = upload(client, shop["id"], "act.csv", table(("OUT", "A2", "没报名", 100, 50, 20, "618大促")))
    assert fixed.json()["rules"]["resolved"] == 1
    assert [item["sku"] for item in issues(client, status="open")] == ["OTHER"]


def test_ignored_issue_is_not_reopened_until_it_clears(client):
    shop = create_shop(client)
    upload(client, shop["id"], "a.csv", table(("LOW", "F1", "低于底价", 189, 199, 20, "日常")))
    issue = issues(client, status="open")[0]
    patched = client.patch(f"/api/issues/{issue['id']}", json={"status": "ignored", "note": "这周先这样"})
    assert patched.status_code == 200, patched.text
    assert patched.json()["status"] == "ignored"
    assert patched.json()["note"] == "这周先这样"
    rerun = client.post("/api/rules/run")
    assert rerun.json()["opened"] == 0
    assert len(issues(client)) == 1
    assert issues(client)[0]["status"] == "ignored"

    upload(client, shop["id"], "a.csv", table(("LOW", "F1", "低于底价", 200, 199, 20, "日常")))
    assert issues(client)[0]["status"] == "resolved"


def test_zero_price_gap_is_reported(client):
    left = create_shop(client, "tmall", "甲店", "星年")
    right = create_shop(client, "jd", "乙店", "星年")
    upload(client, left["id"], "a.csv", table(("A", "FREE", "免费", 0, "", 20, "日常")))
    upload(client, right["id"], "b.csv", table(("A", "FREE", "免费", 10, "", 20, "日常")))
    found = issues(client, status="open", level="warn")
    assert len(found) == 2
    assert "最低售价为 0" in found[0]["message"]
    assert "甲店" in found[0]["message"] and "乙店" in found[0]["message"]
