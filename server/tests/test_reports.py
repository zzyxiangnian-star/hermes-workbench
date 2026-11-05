from fastapi.testclient import TestClient

from app.main import create_app
from helpers import SAMPLES, create_shop, upload_to

EXPECTED_MARKDOWN = """# 经营日报 2026-11-04

## 总览
- 访客：1200，昨日 1000，环比 +20%
- 订单：60，昨日 40，环比 +50%
- 销售额：12000，昨日 8000，环比 +50%
- 转化率：5%，昨日 4%，环比 +25%
- 客单价：200，昨日 200，环比 持平
- 投放花费：1300，昨日 900，环比 +44.44%
- 投放 GMV：2750，昨日 2800，环比 -1.79%
- 投放 ROI：2.1154，昨日 3.1111，环比 -32.01%

当天未处理投放提醒 2 条。

## 异常店铺
- 星年天猫旗舰店（tmall）：2 条未处理投放提醒

## 商品问题
未处理商品问题 0 条。

## 投放提醒
- 万相台·爆发计划 11-04 花费 400，高于前 7 天平均 100 的 150%
- 万相台·双11预热 11-04 ROI 1.3，低于 2
"""


def test_daily_report_snapshot(client):
    shop = create_shop(client, "tmall", "星年天猫旗舰店", "星年")
    assert upload_to(
        client,
        "/api/import/metrics",
        shop["id"],
        "metrics-tmall.xlsx",
        (SAMPLES / "metrics-tmall.xlsx").read_bytes(),
    ).status_code == 200
    assert upload_to(
        client,
        "/api/import/ad-spend",
        shop["id"],
        "ad-spend-tmall.xlsx",
        (SAMPLES / "ad-spend-tmall.xlsx").read_bytes(),
    ).status_code == 200
    response = client.get("/api/reports/daily", params={"date": "2026-11-04"})
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["markdown"] == EXPECTED_MARKDOWN
    assert body["open_issue_count"] == 0
    assert body["overview"]["open_alerts"] == 2
    assert [item["name"] for item in body["abnormal_shops"]] == ["星年天猫旗舰店"]
    assert [item["message"] for item in body["alerts"]] == [
        "万相台·爆发计划 11-04 花费 400，高于前 7 天平均 100 的 150%",
        "万相台·双11预热 11-04 ROI 1.3，低于 2",
    ]


def test_send_requires_webhook_and_dry_run_does_not_post(client, monkeypatch):
    missing = client.post("/api/reports/daily/send", params={"date": "2026-11-04"})
    assert missing.status_code == 400
    assert missing.json()["error"]["message"] == "没有配置推送地址"

    monkeypatch.setenv("WB_FEISHU_WEBHOOK", "https://example.invalid/feishu")
    monkeypatch.setenv("WB_WECOM_WEBHOOK", "https://example.invalid/wecom")

    def boom(*args, **kwargs):
        raise AssertionError("不应该访问网络")

    monkeypatch.setattr("app.reports.httpx.post", boom)
    dry = client.post("/api/reports/daily/send", params={"date": "2026-11-04", "dry_run": True})
    assert dry.status_code == 200, dry.text
    assert dry.json()["sent"] is False
    assert dry.json()["dry_run"] is True
    assert dry.json()["targets"] == ["feishu", "wecom"]
    assert "经营日报" in dry.json()["markdown"]

    calls = []

    def fake_post(url, json, timeout):
        calls.append(url)

        class Response:
            status_code = 200
            text = "ok"

        return Response()

    monkeypatch.setattr("app.reports.httpx.post", fake_post)
    sent = client.post("/api/reports/daily/send", params={"date": "2026-11-04", "dry_run": False})
    assert sent.status_code == 200, sent.text
    assert sent.json()["sent"] is True
    assert calls == ["https://example.invalid/feishu", "https://example.invalid/wecom"]


def test_scheduler_stays_off_in_tests_and_can_start(client, tmp_path, monkeypatch):
    assert client.app.state.scheduler is None
    monkeypatch.setenv("WB_SCHEDULER", "on")
    monkeypatch.setenv("WB_DAILY_AT", "08:30")
    database = "sqlite:///" + (tmp_path / "sched.db").resolve().as_posix()
    app = create_app(database)
    with TestClient(app) as test_client:
        assert test_client.get("/api/health").status_code == 200
        scheduler = app.state.scheduler
        assert scheduler is not None and scheduler.running
        assert scheduler.get_job("daily_report") is not None
    assert scheduler.running is False
