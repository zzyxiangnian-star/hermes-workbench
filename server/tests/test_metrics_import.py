from helpers import SAMPLES, create_shop, upload_to


def _csv(text: str) -> bytes:
    return text.encode("utf-8-sig")


def test_sample_metrics_and_ad_spend_keep_bad_rows(client):
    shop = create_shop(client, "tmall", "星年天猫旗舰店", "星年")
    metrics = upload_to(
        client,
        "/api/import/metrics",
        shop["id"],
        "metrics-tmall.xlsx",
        (SAMPLES / "metrics-tmall.xlsx").read_bytes(),
    )
    assert metrics.status_code == 200, metrics.text
    body = metrics.json()
    assert body["kind"] == "metrics"
    assert body["rows_ok"] == 30
    assert body["rows_failed"] == 2
    assert body["errors"] == [
        {"row": 32, "reason": "缺少日期"},
        {"row": 33, "reason": "访客不是整数"},
    ]
    assert body["rules"] is None

    ads = upload_to(
        client,
        "/api/import/ad-spend",
        shop["id"],
        "ad-spend-tmall.xlsx",
        (SAMPLES / "ad-spend-tmall.xlsx").read_bytes(),
    )
    assert ads.status_code == 200, ads.text
    ad_body = ads.json()
    assert ad_body["kind"] == "ad_spend"
    assert ad_body["rows_ok"] == 120
    assert ad_body["rows_failed"] == 2
    assert ad_body["errors"] == [
        {"row": 122, "reason": "缺少日期"},
        {"row": 123, "reason": "花费不是数字"},
    ]
    assert ad_body["rules"]["opened"] == 2

    runs = client.get("/api/import/runs").json()
    assert [item["kind"] for item in runs] == ["ad_spend", "metrics"]
    again = upload_to(
        client,
        "/api/import/ad-spend",
        shop["id"],
        "ad-spend-tmall.xlsx",
        (SAMPLES / "ad-spend-tmall.xlsx").read_bytes(),
    )
    assert again.json()["rules"]["opened"] == 0
    assert again.json()["rules"]["resolved"] == 0


def test_metrics_and_ad_aliases_and_mapping(client):
    shop = create_shop(client)
    aliased = _csv(
        "统计日期,UV,支付订单数,支付金额,成功退款金额\n"
        "2026-11-01,80,4,800,20\n"
    )
    response = upload_to(client, "/api/import/metrics", shop["id"], "alias.csv", aliased)
    assert response.status_code == 200, response.text
    overview = client.get("/api/overview", params={"date": "2026-11-01", "shop_id": shop["id"]})
    assert overview.status_code == 200, overview.text
    assert overview.json()["metrics"]["visitors"]["value"] == 80
    assert overview.json()["metrics"]["sales_amount"]["value"] == 800

    custom = _csv("日,人,单,钱\n2026-11-02,10,1,50\n")
    missing = upload_to(client, "/api/import/metrics", shop["id"], "custom.csv", custom)
    assert missing.status_code == 400
    assert missing.json()["error"]["code"] == "column_unrecognized"
    mapped = upload_to(
        client,
        "/api/import/metrics",
        shop["id"],
        "custom.csv",
        custom,
        {"日": "date", "人": "visitors", "单": "orders", "钱": "sales_amount"},
    )
    assert mapped.status_code == 200, mapped.text
    assert client.get("/api/overview", params={"date": "2026-11-02", "shop_id": shop["id"]}).json()["metrics"]["orders"]["value"] == 1

    ad_alias = _csv(
        "统计日期,推广工具,推广计划,消耗,直接成交金额,点击数,曝光量\n"
        "2026-11-01,京准通,测款计划,50,200,3,30\n"
    )
    ad = upload_to(client, "/api/import/ad-spend", shop["id"], "ad.csv", ad_alias)
    assert ad.status_code == 200, ad.text
    listed = client.get("/api/ad-spend", params={"date_from": "2026-11-01", "date_to": "2026-11-01", "tool": "京准通"})
    assert listed.status_code == 200, listed.text
    assert listed.json()[0]["campaign"] == "测款计划"
    assert listed.json()[0]["spend"] == 50


def test_bad_metric_row_does_not_stop_the_rest(client):
    shop = create_shop(client)
    content = _csv(
        "日期,访客数,订单数,销售额,退款金额\n"
        "2026-11-01,10,1,100,0\n"
        "2026-11-02,很多,1,100,0\n"
        "2026-11-03,30,2,200,0\n"
    )
    response = upload_to(client, "/api/import/metrics", shop["id"], "mix.csv", content)
    assert response.status_code == 200, response.text
    assert response.json()["rows_ok"] == 2
    assert response.json()["errors"] == [{"row": 3, "reason": "访客不是整数"}]
    assert client.get("/api/overview", params={"date": "2026-11-03", "shop_id": shop["id"]}).json()["metrics"]["visitors"]["value"] == 30


def test_reimport_updates_same_day(client):
    shop = create_shop(client)
    first = _csv("日期,访客数,订单数,销售额\n2026-11-01,10,1,100\n")
    second = _csv("日期,访客数,订单数,销售额\n2026-11-01,25,2,250\n")
    assert upload_to(client, "/api/import/metrics", shop["id"], "a.csv", first).status_code == 200
    assert upload_to(client, "/api/import/metrics", shop["id"], "b.csv", second).status_code == 200
    visitors = client.get("/api/overview", params={"date": "2026-11-01", "shop_id": shop["id"]}).json()["metrics"]["visitors"]["value"]
    assert visitors == 25
