import csv
import io
from datetime import timedelta

from helpers import create_shop, upload_to
from test_installs import AC, KETTLE, orders_csv

from app.customers import mask_text, normalize_phone


def _import(client):
    shop = create_shop(client)
    client.post(
        "/api/product-cards",
        json={"product_code": "XN-AC35", "brand": "星年", "name": "空调", "selling_points": ["一级能效"], "install_required": True},
    )
    second_ac = ["3301234567890000009", "2026-10-01 09:00", "TM-AC35", "XN-AC35", "星年 变频空调 1.5 匹", "1", "2999", "张三", "+86 138-1234-5678", "广东省深圳市", "", "交易成功"]
    refunded = ["3301234567890000010", "2026-10-02 09:00", "TM-KT17", "XN-KT17", "电水壶", "1", "129", "张三", "13812345678", "广东省深圳市", "", "退款成功"]
    response = upload_to(client, "/api/import/orders", shop["id"], "o.csv", orders_csv(AC, KETTLE, second_ac, refunded))
    assert response.status_code == 200, response.text
    return shop, response.json()


def test_orders_build_customer_profiles(client):
    _shop, body = _import(client)
    assert body["customers"] == {"created": 2}
    assert body["installs"] == {"created": 2, "cancelled": 0}

    page = client.get("/api/customers").json()
    assert page["total"] == 2
    zhang = next(c for c in page["items"] if c["name"] == "张三")
    assert zhang["phone"] == "13812345678"
    assert zhang["order_count"] == 2  # 退款的不算
    assert zhang["total"] == 5998.0
    assert "repeat" in zhang["segments"]

    detail = client.get(f"/api/customers/{zhang['id']}").json()
    assert len(detail["orders"]) == 3
    assert client.get("/api/customers", params={"q": "138-1234"}).json()["total"] == 1
    assert client.get("/api/customers", params={"q": "电水壶"}).json()["total"] == 2
    assert client.get("/api/customers", params={"segment": "bad"}).status_code == 400
    # 重复导入不会重复建档
    again = upload_to(client, "/api/import/orders", _shop["id"], "o.csv", orders_csv(AC)).json()
    assert again["customers"] == {"created": 0}


def test_business_customer_and_inquiry_flow(client):
    _import(client)
    dup = client.post("/api/customers", json={"kind": "member", "phone": "13812345678"})
    assert dup.json()["error"]["code"] == "duplicate_customer"
    assert client.post("/api/customers", json={"kind": "business"}).json()["error"]["code"] == "company_required"

    created = client.post(
        "/api/inquiries",
        json={
            "channel": "wecom",
            "company": "某某酒店管理有限公司",
            "contact": "陈经理",
            "phone": "13600001111",
            "content": "酒店 40 间客房要换空调，要开专票，联系 13600001111",
            "product_codes": ["XN-AC35", "XN-NONE"],
            "by": "销售小王",
        },
    )
    assert created.status_code == 201, created.text
    inquiry = created.json()
    assert inquiry["status"] == "new"
    assert inquiry["customer_id"]
    business = client.get(f"/api/customers/{inquiry['customer_id']}").json()
    assert business["kind"] == "business" and business["company"] == "某某酒店管理有限公司"
    assert business["open_inquiries"] == 1

    side = client.get(f"/api/inquiries/{inquiry['id']}/products").json()
    assert side["cards"][0]["selling_points"] == ["一级能效"]
    assert side["cards"][0]["listings"] == []
    assert side["missing"] == [{"product_code": "XN-NONE", "listed": False}]

    no_reason = client.post(f"/api/inquiries/{inquiry['id']}/status", json={"status": "lost"})
    assert no_reason.json()["error"]["code"] == "reason_required"
    client.post(f"/api/inquiries/{inquiry['id']}/status", json={"status": "replied", "by": "销售小王"})

    quote = client.post(
        f"/api/inquiries/{inquiry['id']}/quotes",
        json={
            "items": [
                {"product_code": "XN-AC35", "name": "星年 变频空调 1.5 匹", "quantity": 40, "unit_price": 2599.5},
                {"name": "安装费", "quantity": 40, "unit_price": 150, "note": "含 3 米铜管"},
            ],
            "terms": "含税含运费；到货 30 日内付清。",
            "by": "销售小王",
        },
    )
    assert quote.status_code == 201, quote.text
    q = quote.json()
    assert q["total"] == 109980.0
    assert q["number"].startswith("BJ") and q["number"].endswith("-001")
    assert q["valid_until"]
    doc = client.get(f"/api/quotes/{q['id']}/document").json()["markdown"]
    assert "| 1 | XN-AC35 | 星年 变频空调 1.5 匹 | 40 | 2599.50 | 103980.00 |  |" in doc
    assert "**合计：109980.00 元**" in doc

    detail = client.get(f"/api/inquiries/{inquiry['id']}").json()
    assert detail["status"] == "quoted"
    assert detail["events"][-1]["text"].startswith("已回复 → 已报价，报价单 BJ")
    second = client.post(f"/api/inquiries/{inquiry['id']}/quotes", json={"items": [{"name": "x", "quantity": 1, "unit_price": 1}]}).json()
    assert second["number"].endswith("-002")

    won = client.post(f"/api/inquiries/{inquiry['id']}/status", json={"status": "won"}).json()
    assert won["status"] == "won"
    assert client.post(f"/api/inquiries/{inquiry['id']}/status", json={"status": "replied"}).status_code == 409
    assert client.post(f"/api/inquiries/{inquiry['id']}/quotes", json={"items": [{"name": "x", "quantity": 1, "unit_price": 1}]}).status_code == 409
    assert client.post(f"/api/inquiries/{inquiry['id']}/quotes", json={"items": []}).status_code == 422

    noted = client.post(f"/api/inquiries/{inquiry['id']}/notes", json={"note": "下周送样机", "by": "小王"}).json()
    assert noted["note"] == "下周送样机"
    assert client.get("/api/inquiries", params={"status": "open"}).json() == []
    assert len(client.get("/api/inquiries", params={"q": "酒店"}).json()) == 1


def test_segments_and_followup_flow(client, monkeypatch):
    _import(client)
    page = client.get("/api/customers").json()["items"]
    li = next(c for c in page if c["name"] == "李四")
    zhang = next(c for c in page if c["name"] == "张三")
    client.patch(f"/api/customers/{li['id']}", json={"wecom_added": True, "tags": ["老客户"]})

    # 把“现在”推到 100 天后：两个人都成了沉睡客户
    import app.customers as customers
    from app.models import utcnow as real_now

    later = real_now() + timedelta(days=100)
    monkeypatch.setattr(customers, "utcnow", lambda: later)
    monkeypatch.setattr("app.api.customers.utcnow", lambda: later)
    summary = client.get("/api/customers/segments").json()
    counts = {s["segment"]: s["count"] for s in summary["segments"]}
    assert counts["dormant"] == 2 and counts["new"] == 0 and counts["repeat"] == 1
    assert summary["wecom_added"] == 1

    created = client.post(
        "/api/followups",
        json={"name": "沉睡唤醒", "segment": "dormant", "channel": "wecom", "template": "{称呼}，您在{店铺}买的{最近商品}用得还好吗？我们是最好的", "by": "运营小林"},
    )
    assert created.status_code == 201, created.text
    followup = created.json()
    assert followup["counts"] == {"pending": 1, "sent": 0, "skipped": 1}
    by_id = {t["customer_id"]: t for t in followup["targets"]}
    assert by_id[li["id"]]["message"].startswith("李先生/女士，您在星年天猫旗舰店买的电水壶")
    assert by_id[zhang["id"]]["note"] == "未加企业微信"

    target = by_id[li["id"]]
    assert client.patch(f"/api/followup-targets/{target['id']}", json={"status": "sent"}).json()["error"]["code"] == "not_approved"
    assert client.get(f"/api/followups/{followup['id']}/export").status_code == 409
    blocked = client.post(f"/api/followups/{followup['id']}/approve", json={"by": "主管"})
    assert blocked.json()["error"]["code"] == "compliance_failed"

    fixed = client.patch(f"/api/followups/{followup['id']}", json={"template": "{称呼}，{最近商品}用得还好吗？"}).json()
    assert fixed["targets"][0]["message"].endswith("用得还好吗？")
    approved = client.post(f"/api/followups/{followup['id']}/approve", json={"by": "主管"}).json()
    assert approved["status"] == "approved" and approved["approved_by"] == "主管"
    assert client.patch(f"/api/followups/{followup['id']}", json={"template": "x"}).status_code == 409

    exported = client.get(f"/api/followups/{followup['id']}/export")
    rows = list(csv.reader(io.StringIO(exported.content.decode("utf-8-sig"))))
    assert rows[0] == ["序号", "客户", "手机", "企业微信", "公司", "话术", "状态"]
    assert len(rows) == 3

    done = client.patch(f"/api/followup-targets/{target['id']}", json={"status": "sent"}).json()
    assert done["status"] == "done"
    assert done["counts"]["sent"] == 1
    assert client.post(f"/api/followups/{followup['id']}/cancel").status_code == 409

    empty = client.post("/api/followups", json={"name": "x", "segment": "inquiry_open", "channel": "sms", "template": "hi"}).json()
    assert empty["targets"] == []
    assert client.post(f"/api/followups/{empty['id']}/approve", json={}).json()["error"]["code"] == "no_targets"
    assert client.delete(f"/api/followups/{empty['id']}").status_code == 204


def test_stale_inquiry_segment(client, monkeypatch):
    created = client.post("/api/inquiries", json={"channel": "phone", "company": "某公司", "content": "要 10 台热水器"}).json()
    assert client.get("/api/customers/segments").json()["open_inquiries"] == 1
    import app.customers as customers
    from app.models import utcnow as real_now

    later = real_now() + timedelta(days=8)
    monkeypatch.setattr(customers, "utcnow", lambda: later)
    monkeypatch.setattr("app.api.customers.utcnow", lambda: later)
    items = client.get("/api/customers", params={"segment": "inquiry_open"}).json()["items"]
    assert [c["id"] for c in items] == [created["customer_id"]]
    assert client.get("/api/inquiries").json()[0]["stale"] is True


def test_helpers():
    assert normalize_phone("+86 138-1234-5678") == "13812345678"
    assert normalize_phone("123") is None
    assert mask_text("电话 13600001111，座机 0755-1234") == "电话 136****1111，座机 0755-1234"
