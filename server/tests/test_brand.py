from helpers import SAMPLES, create_shop, table, upload, upload_to


def test_brand_guide_upsert_and_missing(client):
    missing = client.get("/api/brand-guides/星年")
    assert missing.status_code == 404
    assert missing.json()["error"]["code"] == "brand_guide_not_found"

    body = {"tone": " 亲切、专业 ", "colors": ["#C8102E", " ", "#FFFFFF"], "fonts": ["思源黑体"], "logo_rules": "四周留白一个字高"}
    created = client.put("/api/brand-guides/星年", json=body)
    assert created.status_code == 200, created.text
    assert created.json()["tone"] == "亲切、专业"
    assert created.json()["colors"] == ["#C8102E", "#FFFFFF"]

    updated = client.put("/api/brand-guides/星年", json={"tone": "活泼"})
    assert updated.json()["id"] == created.json()["id"]
    assert updated.json()["tone"] == "活泼"
    assert updated.json()["colors"] == []
    assert [item["brand"] for item in client.get("/api/brand-guides").json()] == ["星年"]


def test_banned_words_seeded_and_editable(client):
    words = client.get("/api/banned-words").json()
    assert len(words) >= 20
    assert {"word": "最佳", "level": "must"}.items() <= next(w for w in words if w["word"] == "最佳").items()

    created = client.post("/api/banned-words", json={"word": " 秒杀全网 ", "level": "warn"})
    assert created.status_code == 201, created.text
    assert created.json()["word"] == "秒杀全网"
    assert created.json()["category"] == "自定义"
    duplicate = client.post("/api/banned-words", json={"word": "秒杀全网"})
    assert duplicate.status_code == 409
    blank = client.post("/api/banned-words", json={"word": "  "})
    assert blank.status_code == 422
    assert blank.json()["error"]["message"] == "违禁词不能为空"

    word_id = created.json()["id"]
    disabled = client.patch(f"/api/banned-words/{word_id}", json={"enabled": False, "suggestion": "超值"})
    assert disabled.json()["enabled"] is False
    assert disabled.json()["suggestion"] == "超值"
    assert client.delete(f"/api/banned-words/{word_id}").status_code == 204
    assert client.delete(f"/api/banned-words/{word_id}").status_code == 404


def test_compliance_check_levels_positions_and_disabled_words(client):
    text = "这是最佳选择，全网最低！再说一次最佳。第一次购买送礼。"
    result = client.post("/api/compliance/check", json={"text": text}).json()
    assert result["passed"] is False
    assert result["must_count"] == 2
    assert result["warn_count"] == 1
    best = next(hit for hit in result["hits"] if hit["word"] == "最佳")
    assert best["positions"] == [text.index("最佳"), text.rindex("最佳")]
    assert best["suggestion"] == "优秀"
    assert result["hits"][-1]["word"] == "第一"
    assert result["hits"][-1]["level"] == "warn"

    words = {w["word"]: w["id"] for w in client.get("/api/banned-words").json()}
    for word in ("最佳", "全网最低"):
        client.patch(f"/api/banned-words/{words[word]}", json={"enabled": False})
    again = client.post("/api/compliance/check", json={"text": text}).json()
    assert again["passed"] is True
    assert again["must_count"] == 0

    clean = client.post("/api/compliance/check", json={"text": "好用的电饭煲"}).json()
    assert clean == {"passed": True, "must_count": 0, "warn_count": 0, "hits": []}


def test_product_card_links_shop_listings(client):
    tmall = create_shop(client)
    jd = create_shop(client, "jd", "星年京东自营店", "星年")
    assert upload(client, tmall["id"], "a.csv", table(("SKU-T", "RC-01", "电饭煲", 299, 199, 20, "双11"))).status_code == 200
    assert upload(client, jd["id"], "b.csv", table(("SKU-J", "RC-01", "电饭煲", 289, 199, 5, ""))).status_code == 200

    body = {
        "product_code": "RC-01",
        "brand": "星年",
        "name": "星年 3L 电饭煲",
        "selling_points": ["IH 加热", " ", "24 小时预约"],
        "faq": [{"q": "保修多久", "a": "整机一年"}],
        "install_required": False,
    }
    created = client.post("/api/product-cards", json=body)
    assert created.status_code == 201, created.text
    card = created.json()
    assert card["selling_points"] == ["IH 加热", "24 小时预约"]
    assert [(item["shop_name"], item["price"], item["stock"]) for item in card["listings"]] == [
        ("星年天猫旗舰店", 299.0, 20),
        ("星年京东自营店", 289.0, 5),
    ]
    assert client.post("/api/product-cards", json=body).status_code == 409

    patched = client.patch(f"/api/product-cards/{card['id']}", json={"install_required": True, "specs": "3L，1000W"})
    assert patched.json()["install_required"] is True
    assert patched.json()["specs"] == "3L，1000W"
    assert client.patch(f"/api/product-cards/{card['id']}", json={"name": " "}).status_code == 400

    assert len(client.get("/api/product-cards", params={"q": "电饭"}).json()) == 1
    assert client.get("/api/product-cards", params={"brand": "别的"}).json() == []
    assert client.delete(f"/api/product-cards/{card['id']}").status_code == 204
    assert client.get(f"/api/product-cards/{card['id']}").status_code == 404


def test_campaign_calendar_template_and_tasks(client):
    templates = client.get("/api/campaign-templates").json()
    assert {item["kind"] for item in templates} == {"holiday", "big_promo", "new_launch", "offline", "other"}

    body = {
        "name": "双 11",
        "brand": "星年",
        "kind": "big_promo",
        "start_date": "2026-11-01",
        "end_date": "2026-11-11",
        "budget": 5000,
        "use_template": True,
    }
    created = client.post("/api/campaigns", json=body)
    assert created.status_code == 201, created.text
    campaign = created.json()
    assert campaign["status"] == "planning"
    assert campaign["tasks_total"] == len(next(t for t in templates if t["kind"] == "big_promo")["tasks"])
    assert campaign["budget"] == 5000.0

    bad = client.post("/api/campaigns", json={**body, "start_date": "2026-11-12"})
    assert bad.status_code == 400
    assert bad.json()["error"]["code"] == "invalid_dates"

    december = client.post(
        "/api/campaigns", json={"name": "元旦", "brand": "星年", "kind": "holiday", "start_date": "2026-12-30", "end_date": "2027-01-02"}
    ).json()
    assert december["tasks_total"] == 0
    in_november = client.get("/api/campaigns", params={"date_from": "2026-11-01", "date_to": "2026-11-30"}).json()
    assert [item["name"] for item in in_november] == ["双 11"]
    across = client.get("/api/campaigns", params={"date_from": "2027-01-01", "date_to": "2027-01-31"}).json()
    assert [item["name"] for item in across] == ["元旦"]
    assert client.get("/api/campaigns", params={"status": "bad"}).status_code == 400

    task = client.post(f"/api/campaigns/{campaign['id']}/tasks", json={"title": "直播脚本", "kind": "copy", "due_date": "2026-11-05"})
    assert task.status_code == 201, task.text
    done = client.patch(f"/api/campaign-tasks/{task.json()['id']}", json={"done": True, "owner": "小王"})
    assert done.json()["done"] is True
    detail = client.get(f"/api/campaigns/{campaign['id']}").json()
    assert detail["tasks_done"] == 1
    assert detail["tasks"][-1]["owner"] == "小王"

    patched = client.patch(f"/api/campaigns/{campaign['id']}", json={"status": "ended", "end_date": "2026-10-01"})
    assert patched.status_code == 400
    patched = client.patch(f"/api/campaigns/{campaign['id']}", json={"status": "ended"})
    assert patched.json()["status"] == "ended"

    assert client.delete(f"/api/campaign-tasks/{task.json()['id']}").status_code == 204
    assert client.delete(f"/api/campaigns/{campaign['id']}").status_code == 204
    assert client.get(f"/api/campaigns/{campaign['id']}").status_code == 404


def test_campaign_review_uses_ecommerce_data(client):
    shop = create_shop(client, "tmall", "星年天猫旗舰店", "星年")
    create_shop(client, "jd", "别家京东店", "别家")
    for path, name in (("/api/import/metrics", "metrics-tmall.xlsx"), ("/api/import/ad-spend", "ad-spend-tmall.xlsx")):
        assert upload_to(client, path, shop["id"], name, (SAMPLES / name).read_bytes()).status_code == 200

    overview = client.get("/api/overview", params={"date": "2026-11-04", "shop_id": shop["id"]}).json()["metrics"]
    campaign = client.post(
        "/api/campaigns",
        json={
            "name": "单日测试",
            "brand": "星年",
            "start_date": "2026-11-04",
            "end_date": "2026-11-04",
            "target_sales": 24000,
            "budget": 2600,
        },
    ).json()
    review = client.get(f"/api/campaigns/{campaign['id']}/review")
    assert review.status_code == 200, review.text
    body = review.json()
    assert body["compare_start"] == "2026-11-03"
    assert body["compare_end"] == "2026-11-03"
    assert body["days_with_data"] == 1
    for key in ("visitors", "orders", "sales_amount", "ad_spend", "roi"):
        assert body["metrics"][key] == overview[key], key
    assert body["target_rate"] == 0.5
    assert body["budget_rate"] == 0.5
    assert [item["shop_name"] for item in body["shops"]] == ["星年天猫旗舰店"]
    assert body["markdown"].startswith("# 活动复盘：单日测试")
    assert "增长 50.0%" in body["markdown"]

    empty = client.post(
        "/api/campaigns", json={"name": "无数据", "brand": "没有店", "start_date": "2026-11-04", "end_date": "2026-11-05"}
    ).json()
    empty_review = client.get(f"/api/campaigns/{empty['id']}/review").json()
    assert empty_review["days_with_data"] == 0
    assert empty_review["metrics"]["sales_amount"]["value"] == 0
    assert "只有 0 天有经营数据" in empty_review["markdown"]
