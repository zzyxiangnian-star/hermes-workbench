from helpers import create_shop, issues, rule_by_kind, table, upload


def test_health_rules_and_cors(client):
    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json() == {"status": "ok"}
    allowed = client.get("/api/health", headers={"Origin": "http://127.0.0.1:5173"})
    assert allowed.headers["access-control-allow-origin"] == "http://127.0.0.1:5173"
    blocked = client.get("/api/health", headers={"Origin": "https://example.com"})
    assert "access-control-allow-origin" not in blocked.headers

    rules = client.get("/api/rules")
    assert rules.status_code == 200
    body = rules.json()
    assert [item["kind"] for item in body] == ["below_floor", "cross_shop_gap", "low_stock", "missing_activity"]
    assert body[0]["level"] == "must" and body[0]["enabled"] is True
    assert body[1]["params"] == {"max_gap_pct": 5}
    assert body[2]["params"] == {"min_stock": 10}
    assert body[3]["params"] == {"required_activity": None}
    assert all(item["level"] == "warn" for item in body[1:])


def test_pagination_filters_and_patch(client):
    star = create_shop(client, "tmall", "星年天猫", "星年")
    other = create_shop(client, "pdd", "别的店", "别的品牌")
    rows = tuple(
        (f"P-{index:02d}", f"PC-{index:02d}", f"示例商品{index:02d}", 100, 80, 20, "日常")
        for index in range(1, 26)
    )
    assert upload(client, star["id"], "many.csv", table(*rows)).status_code == 200
    assert upload(client, other["id"], "one.csv", table(("O-1", "OC-1", "另一品牌", 100, 80, 20, "日常"))).status_code == 200

    page = client.get("/api/products", params={"page": 2, "page_size": 10, "shop_id": star["id"]})
    assert page.status_code == 200, page.text
    body = page.json()
    assert body["total"] == 25
    assert body["page"] == 2
    assert body["page_size"] == 10
    assert [item["sku"] for item in body["items"]] == [f"P-{index:02d}" for index in range(11, 21)]
    assert client.get("/api/products", params={"page": 3, "page_size": 10, "shop_id": star["id"]}).json()["items"][-1]["sku"] == "P-25"
    assert client.get("/api/products", params={"page": 9, "page_size": 10}).json()["items"] == []

    assert client.get("/api/products", params={"q": "示例商品07"}).json()["total"] == 1
    assert client.get("/api/products", params={"q": "PC-08"}).json()["items"][0]["sku"] == "P-08"
    assert client.get("/api/products", params={"brand": "别的品牌"}).json()["total"] == 1
    assert client.get("/api/products", params={"shop_id": other["id"]}).json()["items"][0]["platform"] == "pdd"

    assert upload(
        client,
        star["id"],
        "fix.csv",
        table(("P-01", "PC-01", "示例商品01", 50, 80, 1, "日常")),
    ).status_code == 200
    must = client.get("/api/products", params={"has_issue": True, "shop_id": star["id"]}).json()
    assert must["total"] == 1
    assert must["items"][0]["sku"] == "P-01"
    assert must["items"][0]["open_issue_count"] == 2
    assert client.get("/api/products", params={"has_issue": False, "shop_id": star["id"]}).json()["total"] == 24

    open_issues = issues(client, status="open", shop_id=star["id"])
    assert {item["level"] for item in open_issues} == {"must", "warn"}
    assert issues(client, status="open", level="must", shop_id=star["id"])[0]["rule_kind"] == "below_floor"
    assert issues(client, status="open", level="warn", shop_id=other["id"]) == []

    target = issues(client, status="open", level="must")[0]
    patched = client.patch(f"/api/issues/{target['id']}", json={"status": "ignored", "note": "  先看活动  "})
    assert patched.status_code == 200, patched.text
    assert patched.json()["status"] == "ignored"
    assert patched.json()["note"] == "先看活动"
    assert patched.json()["resolved_at"] is None
    assert issues(client, status="ignored")[0]["id"] == target["id"]
    assert all(item["id"] != target["id"] for item in issues(client, status="open"))

    missing = client.patch("/api/issues/9999", json={"note": "没有"})
    assert missing.status_code == 404
    assert missing.json() == {"error": {"code": "issue_not_found", "message": "问题不存在"}}


def test_error_shape_and_rule_patch(client):
    bad_platform = client.post("/api/shops", json={"platform": "amazon", "name": "店", "brand": "牌"})
    assert bad_platform.status_code == 422
    assert bad_platform.json() == {"error": {"code": "validation_error", "message": "平台必须是 tmall、jd、pdd 或 douyin"}}
    blank = client.post("/api/shops", json={"platform": "jd", "name": "  ", "brand": "牌"})
    assert blank.json()["error"]["message"] == "名称不能为空"
    bad_page = client.get("/api/products", params={"page_size": 0})
    assert bad_page.status_code == 422
    assert bad_page.json()["error"]["message"] == "每页数量必须在 1 到 100 之间"
    bad_status = client.get("/api/issues", params={"status": "closed"})
    assert bad_status.status_code == 400
    assert bad_status.json()["error"]["code"] == "invalid_status"

    rule = rule_by_kind(client, "cross_shop_gap")
    rejected = client.patch(f"/api/rules/{rule['id']}", json={"params": {"threshold": 1}})
    assert rejected.status_code == 400
    assert rejected.json()["error"]["code"] == "invalid_params"
    disabled = client.patch(f"/api/rules/{rule['id']}", json={"enabled": False})
    assert disabled.status_code == 200
    assert disabled.json()["enabled"] is False
    missing = client.patch("/api/rules/9999", json={"enabled": True})
    assert missing.json() == {"error": {"code": "rule_not_found", "message": "规则不存在"}}
