import json

from helpers import SAMPLES, create_shop, issues, table, upload, upload_to

HEADERS = {
    "host": "127.0.0.1:8000",
    "accept": "application/json, text/event-stream",
    "content-type": "application/json",
}
EXPECTED_TOOLS = {
    "wb_list_product_issues",
    "wb_get_product",
    "wb_get_overview",
    "wb_get_trend",
    "wb_list_alerts",
    "wb_get_daily_report",
    "wb_add_note",
}


def rpc(client, method, params=None, headers=None):
    body = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}}
    response = client.post("/mcp", content=json.dumps(body), headers={**HEADERS, **(headers or {})})
    assert response.status_code == 200, response.text
    return response.json()


def call(client, name, **arguments):
    """返回 (是否出错, 数据或错误文字)。"""
    result = rpc(client, "tools/call", {"name": name, "arguments": arguments})["result"]
    if result.get("isError"):
        return True, result["content"][0]["text"]
    return False, result["structuredContent"]


def _products(client):
    shop = create_shop(client)
    other = create_shop(client, "jd", "星年京东自营店", "星年")
    response = upload(
        client,
        shop["id"],
        "products.csv",
        table(
            ("LOW", "F1", "低于底价的电饭煲", 189, 199, 20, "日常"),
            ("OK", "F2", "正常的电水壶", 299, 199, 50, "日常"),
        ),
    )
    assert response.status_code == 200, response.text
    response = upload(client, other["id"], "products.csv", table(("OK", "F2", "正常的电水壶", 299, 199, 50, "日常")))
    assert response.status_code == 200, response.text
    return shop, other


def _metrics(client):
    shop = create_shop(client, "tmall", "星年天猫旗舰店", "星年")
    for path, name in (("/api/import/metrics", "metrics-tmall.xlsx"), ("/api/import/ad-spend", "ad-spend-tmall.xlsx")):
        response = upload_to(client, path, shop["id"], name, (SAMPLES / name).read_bytes())
        assert response.status_code == 200, response.text
    return shop


def test_tool_list_is_read_only_plus_note(client):
    tools = rpc(client, "tools/list")["result"]["tools"]
    names = {tool["name"] for tool in tools}
    assert names == EXPECTED_TOOLS
    for tool in tools:
        assert tool["description"], tool["name"]
        assert any("一" <= ch <= "鿿" for ch in tool["description"]), tool["name"]
    forbidden = ("status", "rule", "import", "send", "price", "delete", "update", "patch", "set")
    for name in names - {"wb_add_note"}:
        assert not any(word in name for word in forbidden), name
    note_params = set(next(t for t in tools if t["name"] == "wb_add_note")["inputSchema"]["properties"])
    assert note_params == {"issue_id", "note"}


def test_rejects_foreign_host(client):
    body = {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}
    response = client.post("/mcp", content=json.dumps(body), headers={**HEADERS, "host": "evil.example.com"})
    assert response.status_code == 421


def test_list_product_issues_defaults_to_open_and_limits(client):
    shop, _other = _products(client)
    failed, data = call(client, "wb_list_product_issues")
    assert not failed, data
    assert data["total"] == 1
    assert data["items"][0]["sku"] == "LOW"
    assert data["items"][0]["status"] == "open"

    failed, data = call(client, "wb_list_product_issues", status="resolved")
    assert not failed and data["total"] == 0

    failed, data = call(client, "wb_list_product_issues", shop_id=shop["id"], limit=1000)
    assert not failed and data["returned"] == 1

    failed, message = call(client, "wb_list_product_issues", status="bad")
    assert failed and "状态" in message


def test_get_product_by_id_sku_and_code(client):
    _products(client)
    failed, data = call(client, "wb_get_product", sku="LOW")
    assert not failed, data
    [item] = data["items"]
    assert item["title"] == "低于底价的电饭煲"
    assert item["price"] == 189
    assert [issue["level"] for issue in item["issues"]] == ["must"]

    failed, by_id = call(client, "wb_get_product", product_id=item["id"])
    assert not failed and by_id["items"][0]["sku"] == "LOW"

    failed, by_code = call(client, "wb_get_product", product_code=item["product_code"])
    assert not failed and by_code["items"][0]["id"] == item["id"]

    failed, both = call(client, "wb_get_product", sku="OK")
    assert not failed and len(both["items"]) == 2

    failed, message = call(client, "wb_get_product", sku="NOPE")
    assert failed and "找不到" in message
    failed, message = call(client, "wb_get_product")
    assert failed and "product_id" in message


def test_overview_trend_alerts_and_report(client):
    shop = _metrics(client)
    failed, data = call(client, "wb_get_overview", date="2026-11-04", shop_id=shop["id"])
    assert not failed, data
    assert data["date"] == "2026-11-04"
    assert data["metrics"]["visitors"] == {"value": 1200, "previous": 1000, "change": 0.2}

    failed, latest = call(client, "wb_get_overview", brand="星年")
    assert not failed and latest["date"] == "2026-11-04"

    failed, message = call(client, "wb_get_overview", date="11/04")
    assert failed and "YYYY-MM-DD" in message

    failed, trend = call(client, "wb_get_trend", metric="orders", days=2)
    assert not failed, trend
    assert [point["value"] for point in trend["points"]] == [40, 60]
    failed, message = call(client, "wb_get_trend", metric="orders", days=0)
    assert failed
    failed, message = call(client, "wb_get_trend", metric="nope")
    assert failed and "指标" in message

    failed, alerts = call(client, "wb_list_alerts")
    assert not failed and alerts["total"] == 2
    assert all(item["status"] == "open" for item in alerts["items"])

    failed, report = call(client, "wb_get_daily_report", date="2026-11-04")
    assert not failed, report
    assert report["markdown"].startswith("# 经营日报 2026-11-04")
    assert report["date"] == "2026-11-04"


def test_add_note_appends_with_prefix_and_keeps_status(client):
    _products(client)
    [issue] = issues(client, status="open")
    patched = client.patch(f"/api/issues/{issue['id']}", json={"note": "运营已知"})
    assert patched.status_code == 200, patched.text

    failed, data = call(client, "wb_add_note", issue_id=issue["id"], note="  建议先把售价调回 199  ")
    assert not failed, data
    assert data["note"] == "运营已知\n[电商助手] 建议先把售价调回 199"
    assert data["status"] == "open"

    failed, _data = call(client, "wb_add_note", issue_id=issue["id"], note="第二条")
    assert not failed
    [after] = issues(client, status="open")
    assert after["note"].splitlines() == ["运营已知", "[电商助手] 建议先把售价调回 199", "[电商助手] 第二条"]
    assert after["resolved_at"] is None

    failed, message = call(client, "wb_add_note", issue_id=issue["id"], note="   ")
    assert failed and "不能为空" in message
    failed, message = call(client, "wb_add_note", issue_id=issue["id"], note="字" * 501)
    assert failed and "500" in message
    failed, message = call(client, "wb_add_note", issue_id=99999, note="x")
    assert failed and "不存在" in message


def test_add_note_cannot_change_status(client):
    _products(client)
    [issue] = issues(client, status="open")
    result = rpc(
        client,
        "tools/call",
        {"name": "wb_add_note", "arguments": {"issue_id": issue["id"], "note": "x", "status": "resolved"}},
    )
    # 多余的参数被忽略或报错都可以，关键是状态不变。
    assert "result" in result or "error" in result
    [after] = issues(client, status="open")
    assert after["status"] == "open"
