from app.mcp_server import WRITE_TOOLS
import json

from helpers import SAMPLES, create_shop, issues, table, upload, upload_to

HEADERS = {
    "host": "127.0.0.1:8000",
    "accept": "application/json, text/event-stream",
    "content-type": "application/json",
}
EXPECTED_TOOLS = {
    "wb_view_images",
    "wb_list_product_issues",
    "wb_get_product",
    "wb_get_overview",
    "wb_get_trend",
    "wb_list_alerts",
    "wb_get_daily_report",
    "wb_add_note",
    "wb_list_campaigns",
    "wb_get_campaign",
    "wb_check_compliance",
    "wb_get_product_card",
    "wb_get_brand_guide",
    "wb_list_contents",
    "wb_get_content",
    "wb_create_draft",
    "wb_list_installs",
    "wb_get_install",
    "wb_add_install_note",
    "wb_list_customers",
    "wb_get_customer",
    "wb_list_inquiries",
    "wb_get_inquiry",
    "wb_add_inquiry_note",
    "wb_list_design_requests",
    "wb_get_design_request",
    "wb_add_design_candidate",
    "wb_list_video_projects",
    "wb_get_video_project",
    "wb_create_video_project",
    "wb_add_shot_media",
    "wb_search_library",
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
    for name in names - WRITE_TOOLS:
        assert not any(word in name for word in forbidden), name
    for tool in tools:
        assert tool["annotations"]["readOnlyHint"] is (tool["name"] not in WRITE_TOOLS), tool["name"]
    note_params = set(next(t for t in tools if t["name"] == "wb_add_note")["inputSchema"]["properties"])
    assert note_params == {"issue_id", "note"}


def test_rejects_foreign_host(client):
    body = {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}
    response = client.post("/mcp", content=json.dumps(body), headers={**HEADERS, "host": "evil.example.com"})
    assert response.status_code == 403  # 外层的本机检查先拦下（MCP 自己的检查会回 421）


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


def test_brand_tools(client):
    _products(client)
    client.put("/api/brand-guides/星年", json={"tone": "亲切"})
    client.post("/api/product-cards", json={"product_code": "F1", "brand": "星年", "name": "电饭煲"})
    created = client.post(
        "/api/campaigns",
        json={"name": "双 11", "brand": "星年", "kind": "holiday", "start_date": "2026-11-01", "end_date": "2026-11-11", "use_template": True},
    ).json()

    failed, data = call(client, "wb_list_campaigns", date_from="2026-11-05", date_to="2026-11-06")
    assert not failed and [item["name"] for item in data["items"]] == ["双 11"]
    failed, data = call(client, "wb_get_campaign", campaign_id=created["id"])
    assert not failed, data
    assert data["campaign"]["tasks_total"] == 5
    assert data["review"]["markdown"].startswith("# 活动复盘")
    failed, message = call(client, "wb_get_campaign", campaign_id=999)
    assert failed and "活动不存在" in message

    failed, data = call(client, "wb_check_compliance", text="最佳电饭煲")
    assert not failed and data["passed"] is False and data["hits"][0]["word"] == "最佳"

    failed, data = call(client, "wb_get_product_card", product_code="F1")
    assert not failed and data["items"][0]["name"] == "电饭煲"
    assert data["items"][0]["listings"][0]["price"] == 189.0
    failed, data = call(client, "wb_get_product_card", q="电饭")
    assert not failed and len(data["items"]) == 1
    failed, message = call(client, "wb_get_product_card", product_code="NONE")
    assert failed and "资料卡" in message

    failed, data = call(client, "wb_get_brand_guide", brand="星年")
    assert not failed and data["tone"] == "亲切"
    failed, message = call(client, "wb_get_brand_guide", brand="别家")
    assert failed and "品牌规范" in message


def test_bot_configs_only_name_existing_tools(client):
    from pathlib import Path

    import yaml

    names = {tool["name"] for tool in rpc(client, "tools/list")["result"]["tools"]}
    bots = Path(__file__).resolve().parents[2] / "bots"
    configs = sorted(bots.glob("*/config.yaml"))
    assert len(configs) == 4
    for config in configs:
        data = yaml.safe_load(config.read_text(encoding="utf-8"))
        include = data["mcp_servers"]["hermes-workbench"]["tools"]["include"]
        assert set(include) <= names, config
        assert {"terminal", "browser"} <= set(data["agent"]["disabled_toolsets"]), config


def test_create_draft_stays_draft(client):
    failed, data = call(
        client,
        "wb_create_draft",
        title="双 11 文案",
        brand="星年",
        body="很好的电饭煲",
        kind="note",
        variants=[{"platform": "xiaohongshu", "body": "姐妹们看过来"}],
    )
    assert not failed, data
    assert data["status"] == "draft"
    assert data["platforms"] == ["xiaohongshu"]
    detail = client.get(f"/api/contents/{data['id']}").json()
    assert detail["author"] == "品牌助手"
    assert detail["versions"][0]["note"] == "品牌助手起草"

    failed, message = call(client, "wb_create_draft", title="x", brand="y", body="z", kind="bad")
    assert failed and "参数不正确" in message
    failed, message = call(client, "wb_create_draft", title="x", brand="y", body="z", variants=[{"platform": "facebook"}])
    assert failed and "参数不正确" in message

    failed, got = call(client, "wb_get_content", content_id=data["id"])
    assert not failed and got["compliance"]["passed"] is True
    failed, listed = call(client, "wb_list_contents", status="draft")
    assert not failed and [item["id"] for item in listed["items"]] == [data["id"]]
    create_params = {
        t["name"]: set(t["inputSchema"]["properties"]) for t in rpc(client, "tools/list")["result"]["tools"]
    }["wb_create_draft"]
    assert "status" not in create_params and "author" not in create_params


def test_install_tools_mask_customer_info(client):
    from test_installs import AC, orders_csv, setup

    shop = setup(client)
    upload_to(client, "/api/import/orders", shop["id"], "o.csv", orders_csv(AC))
    failed, data = call(client, "wb_list_installs", status="pending")
    assert not failed, data
    assert data["summary"]["pending"] == 1
    [item] = data["items"]
    assert item["phone"] == "138****5678"
    assert item["address"] == "广东省深圳市南山区****"
    assert item["buyer_name"] == "张*"
    assert "13812345678" not in json.dumps(data, ensure_ascii=False)

    failed, detail = call(client, "wb_get_install", install_id=item["id"])
    assert not failed and detail["phone"] == "138****5678" and detail["events"]

    failed, noted = call(client, "wb_add_install_note", install_id=item["id"], note="买家下午在家，优先约下午")
    assert not failed
    assert noted["status"] == "pending"
    assert noted["note"] == "[电商助手] 买家下午在家，优先约下午"
    assert "13812345678" not in json.dumps(noted, ensure_ascii=False)
    full = client.get(f"/api/installs/{item['id']}").json()
    assert full["phone"] == "13812345678"
    failed, message = call(client, "wb_add_install_note", install_id=999, note="x")
    assert failed and "工单不存在" in message


def test_customer_tools_mask_contact_info(client):
    from test_installs import AC, KETTLE, orders_csv, setup

    shop = setup(client)
    upload_to(client, "/api/import/orders", shop["id"], "o.csv", orders_csv(AC, KETTLE))
    inquiry = client.post(
        "/api/inquiries",
        json={"channel": "wecom", "company": "某酒店", "contact": "陈经理", "phone": "13600001111", "content": "要 40 台空调，回电 13600001111", "product_codes": ["XN-AC35"]},
    ).json()

    failed, data = call(client, "wb_list_customers")
    assert not failed, data
    assert data["total"] == 3
    assert {s["segment"] for s in data["summary"]["segments"]} == {"new", "repeat", "dormant", "inquiry_open"}
    dumped = json.dumps(data, ensure_ascii=False)
    assert "13812345678" not in dumped and "张三" not in dumped
    zhang = next(c for c in data["items"] if c["name"] == "张*")
    assert zhang["phone"] == "138****5678"

    failed, detail = call(client, "wb_get_customer", customer_id=inquiry["customer_id"])
    assert not failed, detail
    assert detail["company"] == "某酒店" and detail["inquiries"][0]["contact"] == "陈**"
    assert "13600001111" not in json.dumps(detail, ensure_ascii=False)

    failed, listed = call(client, "wb_list_inquiries", status="open")
    assert not failed and listed["items"][0]["content"] == "要 40 台空调，回电 136****1111"
    failed, one = call(client, "wb_get_inquiry", inquiry_id=inquiry["id"])
    assert not failed and one["products"]["cards"][0]["product_code"] == "XN-AC35"
    assert "13600001111" not in json.dumps(one, ensure_ascii=False)

    failed, noted = call(client, "wb_add_inquiry_note", inquiry_id=inquiry["id"], note="客户关心专票和安装周期，建议先报含安装价")
    assert not failed and noted["status"] == "new"
    assert noted["note"].startswith("[电商助手] ")
    failed, message = call(client, "wb_list_customers", segment="bad")
    assert failed and "分层" in message


def test_design_assistant_hands_in_candidates(client, tmp_path, monkeypatch):
    import base64

    from test_design import png

    req = client.post(
        "/api/design-requests",
        json={"title": "空调主图", "kind": "main_image", "brand": "星年", "sizes": ["800x800"], "copy_text": "一级能效"},
    ).json()
    failed, data = call(client, "wb_list_design_requests")
    assert not failed and data["items"][0]["id"] == req["id"]

    data_url = "data:image/png;base64," + base64.b64encode(png()).decode()
    failed, handed = call(client, "wb_add_design_candidate", request_id=req["id"], image=data_url, prompt="浅色客厅里的白色挂机", note="突出省电")
    assert not failed, handed
    assert handed["request_status"] == "reviewing"
    assert handed["candidate"]["source"] == "ai" and handed["candidate"]["created_by"] == "设计助手"
    assert handed["candidate"]["label"] == "A"

    hermes = tmp_path / "hermes"
    hermes.mkdir()
    (hermes / "gen.png").write_bytes(png(shade=9))
    monkeypatch.setenv("WB_AI_IMAGE_DIRS", str(hermes))
    failed, second = call(client, "wb_add_design_candidate", request_id=req["id"], image=str(hermes / "gen.png"))
    assert not failed and second["candidate"]["label"] == "B"
    failed, message = call(client, "wb_add_design_candidate", request_id=req["id"], image=str(tmp_path / "x.png"))
    assert failed and "生图" in message

    failed, detail = call(client, "wb_get_design_request", request_id=req["id"])
    assert not failed and len(detail["candidates"]) == 2
    client.post(f"/api/design-requests/{req['id']}/finalize", json={"asset_ids": [handed["candidate"]["id"]]})
    failed, message = call(client, "wb_add_design_candidate", request_id=req["id"], image=data_url)
    assert failed and "已定稿" in message


def test_video_assistant_writes_script_and_media(client, tmp_path, monkeypatch):
    from test_design import png
    from test_video import wav

    failed, created = call(
        client,
        "wb_create_video_project",
        title="空调省电口播",
        brand="星年",
        product_code="XN-AC35",
        platform="douyin",
        shots=[{"duration": 2, "visual": "空调特写", "voiceover": "今年夏天电费降下来了"}, {"duration": 3, "voiceover": "一级能效"}],
    )
    assert not failed, created
    assert created["status"] == "draft" and created["shot_count"] == 2
    detail = client.get(f"/api/video-projects/{created['id']}").json()
    assert detail["author"] == "视频助手"

    hermes = tmp_path / "hermes"
    (hermes / "cache" / "audio").mkdir(parents=True)
    (hermes / "cache" / "audio" / "tts_1.wav").write_bytes(wav(2.5))
    monkeypatch.setenv("WB_AI_IMAGE_DIRS", str(hermes))
    failed, voiced = call(client, "wb_add_shot_media", project_id=created["id"], seq=1, slot="voice", file=str(hermes / "cache" / "audio" / "tts_1.wav"))
    assert not failed, voiced
    assert voiced["shot"]["voice"]["source"] == "ai" and voiced["shot"]["length"] == 2.5

    logo = client.post("/api/assets", data={"brand": "星年", "tags": "Logo"}, files={"file": ("logo.png", png())}).json()
    failed, found = call(client, "wb_search_library", brand="星年")
    assert not failed and found["items"][0]["id"] == logo["id"]
    failed, pictured = call(client, "wb_add_shot_media", project_id=created["id"], seq=2, slot="visual", asset_id=logo["id"])
    assert not failed and pictured["shot"]["media"]["id"] == logo["id"]
    assert any("素材库" in e["text"] for e in client.get(f"/api/video-projects/{created['id']}").json()["events"])

    failed, message = call(client, "wb_add_shot_media", project_id=created["id"], seq=2, slot="voice", file=str(hermes / "cache" / "audio" / "tts_1.wav"), asset_id=1)
    assert failed and "只能给一个" in message
    failed, message = call(client, "wb_create_video_project", title="x", brand="星年", shots=[{"duration": 999}])
    assert failed and "参数不正确" in message

    client.post(f"/api/video-projects/{created['id']}/submit", json={})
    failed, message = call(client, "wb_add_shot_media", project_id=created["id"], seq=1, slot="visual", asset_id=logo["id"])
    assert failed and "不能改脚本" in message


def test_view_images_returns_image_blocks(client):
    from test_design import png

    logo = client.post("/api/assets", data={"brand": "星年"}, files={"file": ("logo.png", png())}).json()
    result = rpc(client, "tools/call", {"name": "wb_view_images", "arguments": {"asset_ids": [logo["id"]]}})["result"]
    assert not result.get("isError"), result
    kinds = [block["type"] for block in result["content"]]
    assert kinds == ["text", "image"]
    assert result["content"][1]["mimeType"] == "image/png"
    failed, message = call(client, "wb_view_images", asset_ids=[999])
    assert failed and "999" in message
    failed, message = call(client, "wb_view_images", asset_ids=[1, 2, 3, 4, 5])
    assert failed and "最多" in message
