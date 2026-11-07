from helpers import SAMPLES, create_shop, upload_to


def _import_samples(client):
    shop = create_shop(client, "tmall", "星年天猫旗舰店", "星年")
    metrics = upload_to(
        client,
        "/api/import/metrics",
        shop["id"],
        "metrics-tmall.xlsx",
        (SAMPLES / "metrics-tmall.xlsx").read_bytes(),
    )
    assert metrics.status_code == 200, metrics.text
    ads = upload_to(
        client,
        "/api/import/ad-spend",
        shop["id"],
        "ad-spend-tmall.xlsx",
        (SAMPLES / "ad-spend-tmall.xlsx").read_bytes(),
    )
    assert ads.status_code == 200, ads.text
    return shop


def test_overview_compares_with_previous_day(client):
    shop = _import_samples(client)
    response = client.get("/api/overview", params={"date": "2026-11-04", "shop_id": shop["id"], "brand": "星年"})
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["date"] == "2026-11-04"
    assert body["compare_date"] == "2026-11-03"
    assert body["open_alerts"] == 2
    metrics = body["metrics"]
    assert metrics["visitors"] == {"value": 1200, "previous": 1000, "change": 0.2}
    assert metrics["orders"] == {"value": 60, "previous": 40, "change": 0.5}
    assert metrics["sales_amount"] == {"value": 12000.0, "previous": 8000.0, "change": 0.5}
    assert metrics["conversion_rate"] == {"value": 0.05, "previous": 0.04, "change": 0.25}
    assert metrics["avg_order_value"] == {"value": 200.0, "previous": 200.0, "change": 0.0}
    assert metrics["ad_spend"] == {"value": 1300.0, "previous": 900.0, "change": 0.4444}
    assert metrics["ad_gmv"] == {"value": 2750.0, "previous": 2800.0, "change": -0.0179}
    assert metrics["roi"] == {"value": 2.1154, "previous": 3.1111, "change": -0.3201}

    other = client.get("/api/overview", params={"date": "2026-11-04", "brand": "没有这个品牌"})
    assert other.json()["metrics"]["visitors"]["value"] == 0
    assert other.json()["open_alerts"] == 0
    missing = client.get("/api/overview", params={"shop_id": 9999})
    assert missing.status_code == 404
    assert missing.json()["error"]["code"] == "shop_not_found"


def test_overview_roi_is_null_when_spend_is_zero(client):
    shop = create_shop(client)
    metrics = (
        "日期,访客数,订单数,销售额\n"
        "2026-11-03,0,0,0\n"
        "2026-11-04,10,0,0\n"
    ).encode("utf-8-sig")
    ads = (
        "日期,投放工具,计划名称,花费,成交金额\n"
        "2026-11-04,万相台,空烧,0,80\n"
    ).encode("utf-8-sig")
    assert upload_to(client, "/api/import/metrics", shop["id"], "m.csv", metrics).status_code == 200
    assert upload_to(client, "/api/import/ad-spend", shop["id"], "a.csv", ads).status_code == 200
    response = client.get("/api/overview", params={"date": "2026-11-04", "shop_id": shop["id"]})
    assert response.status_code == 200, response.text
    body = response.json()["metrics"]
    assert body["roi"]["value"] is None
    assert body["conversion_rate"]["value"] == 0
    assert body["conversion_rate"]["previous"] is None
    assert body["avg_order_value"]["value"] is None
    assert body["visitors"]["change"] is None
    listed = client.get("/api/ad-spend", params={"date_from": "2026-11-04", "date_to": "2026-11-04"})
    assert listed.status_code == 200, listed.text
    assert listed.json()[0]["roi"] is None
    assert listed.json()[0]["spend"] == 0


def test_trend_and_ad_spend_list(client):
    shop = _import_samples(client)
    trend = client.get("/api/overview/trend", params={"days": 30, "shop_id": shop["id"], "metric": "visitors"})
    assert trend.status_code == 200, trend.text
    points = trend.json()["points"]
    assert trend.json()["metric"] == "visitors"
    assert len(points) == 30
    assert points[0] == {"date": "2026-10-06", "value": 1000}
    assert points[-2] == {"date": "2026-11-03", "value": 1000}
    assert points[-1] == {"date": "2026-11-04", "value": 1200}

    ended = client.get(
        "/api/overview/trend",
        params={"days": 2, "shop_id": shop["id"], "metric": "visitors", "date": "2026-11-03"},
    )
    assert [point["date"] for point in ended.json()["points"]] == ["2026-11-02", "2026-11-03"]

    unknown = client.get("/api/overview/trend", params={"metric": "profit"})
    assert unknown.status_code == 400
    assert unknown.json()["error"]["code"] == "invalid_metric"

    listed = client.get(
        "/api/ad-spend",
        params={"date_from": "2026-11-04", "date_to": "2026-11-04", "shop_id": shop["id"], "tool": "万相台"},
    )
    assert listed.status_code == 200, listed.text
    by_name = {item["campaign"]: item for item in listed.json()}
    assert set(by_name) == {"双11预热", "日常测款", "爆发计划", "品牌词"}
    assert by_name["双11预热"]["spend"] == 500
    assert by_name["双11预热"]["gmv"] == 650
    assert by_name["双11预热"]["roi"] == 1.3
    assert by_name["双11预热"]["has_alert"] is True
    assert by_name["爆发计划"]["has_alert"] is True
    assert by_name["日常测款"]["has_alert"] is False
    assert by_name["品牌词"]["roi"] == 3
    assert client.get("/api/ad-spend", params={"tool": "京准通"}).json() == []
