from helpers import create_shop, upload_to


def ad_csv(*rows: tuple) -> bytes:
    lines = ["日期,投放工具,计划名称,花费,成交金额,点击量,展现量"]
    for row in rows:
        lines.append(",".join("" if cell is None else str(cell) for cell in row))
    return ("\n".join(lines) + "\n").encode("utf-8-sig")


def alerts(client, **params):
    response = client.get("/api/alerts", params=params)
    assert response.status_code == 200, response.text
    return response.json()


def import_ads(client, shop_id, *rows, name="ads.csv"):
    response = upload_to(client, "/api/import/ad-spend", shop_id, name, ad_csv(*rows))
    assert response.status_code == 200, response.text
    return response.json()


def test_three_ad_rules_hit_miss_dedupe_and_resolve(client):
    shop = create_shop(client)
    shop_id = shop["id"]
    prior = [f"2026-10-{day:02d}" for day in range(28, 32)] + ["2026-11-01", "2026-11-02", "2026-11-03"]
    rows = []
    for current in prior:
        rows.append((current, "万相台", "爆发计划", 100, 300, 1, 10))
        rows.append((current, "万相台", "持平计划", 100, 300, 1, 10))
    rows.extend(
        [
            ("2026-11-04", "万相台", "双11预热", 500, 650, 1, 10),
            ("2026-11-04", "万相台", "刚好回本", 400, 800, 1, 10),
            ("2026-11-04", "万相台", "小预算", 100, 50, 1, 10),
            ("2026-11-04", "万相台", "品牌词", 300, 900, 1, 10),
            ("2026-11-04", "万相台", "刚好上限", 250, 800, 1, 10),
            ("2026-11-04", "万相台", "爆发计划", 400, 800, 1, 10),
            ("2026-11-04", "万相台", "持平计划", 150, 300, 1, 10),
            ("2026-11-04", "万相台", "没基线", 1000, 5000, 1, 10),
        ]
    )
    first = import_ads(client, shop_id, *rows)
    assert first["rules"]["opened"] == 2
    found = {item["campaign"]: item["message"] for item in alerts(client, status="open")}
    assert found == {
        "双11预热": "万相台·双11预热 11-04 ROI 1.3，低于 2",
        "爆发计划": "万相台·爆发计划 11-04 花费 400，高于前 7 天平均 100 的 150%",
    }
    assert alerts(client, status="open", level="must") == []

    rules = client.get("/api/ad-rules")
    assert rules.status_code == 200
    by_kind = {item["kind"]: item for item in rules.json()}
    assert [item["kind"] for item in rules.json()] == ["roi_below", "spend_over_cap", "spend_spike"]
    assert by_kind["roi_below"]["params"] == {"min_roi": 2, "min_spend": 200}
    assert by_kind["spend_over_cap"]["level"] == "must"
    patched = client.patch(
        f"/api/ad-rules/{by_kind['spend_over_cap']['id']}",
        json={"params": {"daily_cap": {"品牌词": 250, "刚好上限": 250}}},
    )
    assert patched.status_code == 200, patched.text
    rerun = client.post("/api/ad-rules/run")
    assert rerun.status_code == 200, rerun.text
    assert rerun.json()["opened"] == 1
    must = alerts(client, status="open", level="must")
    assert [item["message"] for item in must] == ["万相台·品牌词 11-04 花费 300，超过日上限 250"]

    second = client.post("/api/ad-rules/run")
    assert second.json()["opened"] == 0
    assert len(alerts(client, status="open")) == 3

    target = alerts(client, status="open", level="warn")[0]
    ignored = client.patch(f"/api/alerts/{target['id']}", json={"status": "ignored", "note": "  先观察  "})
    assert ignored.status_code == 200, ignored.text
    assert ignored.json()["status"] == "ignored"
    assert ignored.json()["note"] == "先观察"
    assert client.post("/api/ad-rules/run").json()["opened"] == 0
    assert len(alerts(client, status="ignored")) == 1

    fixed = import_ads(
        client,
        shop_id,
        ("2026-11-04", "万相台", "双11预热", 500, 2000, 1, 10),
        ("2026-11-04", "万相台", "爆发计划", 100, 300, 1, 10),
        ("2026-11-04", "万相台", "品牌词", 200, 800, 1, 10),
        name="fixed.csv",
    )
    assert fixed["rules"]["resolved"] == 3
    assert alerts(client, status="open") == []
    assert len(alerts(client, status="resolved")) == 3

    missing = client.patch("/api/alerts/9999", json={"note": "没有"})
    assert missing.status_code == 404
    assert missing.json()["error"]["code"] == "alert_not_found"


def test_ad_rule_summary_counts_open_alerts(client):
    shop = create_shop(client, "tmall", "星年天猫旗舰店", "星年")
    other = create_shop(client, "jd", "另一家", "别的")
    import_ads(client, shop["id"], ("2026-11-04", "万相台", "双11预热", 500, 650, 1, 10))
    summary = client.get("/api/alerts/summary")
    assert summary.status_code == 200, summary.text
    body = summary.json()
    assert body["total_open"] == 1
    assert [(item["name"], item["open_count"]) for item in body["shops"]] == [
        ("星年天猫旗舰店", 1),
        ("另一家", 0),
    ]
    assert alerts(client, shop_id=other["id"]) == []
