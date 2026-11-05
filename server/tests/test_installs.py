import csv
import io

from helpers import create_shop, upload_to

from app.installs import mask_address, mask_name, mask_phone

HEADER = ["订单编号", "付款时间", "商家编码", "货号", "商品标题", "购买数量", "实付金额", "收货人姓名", "联系手机", "收货地址", "买家留言", "订单状态"]


def orders_csv(*rows) -> bytes:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(HEADER)
    writer.writerows(rows)
    return buffer.getvalue().encode("utf-8-sig")


AC = ['="3301234567890123456"', "2026-11-04 10:23:45", "TM-AC35", "XN-AC35", "星年 变频空调 1.5 匹", "1", "2999.00", "张三", "13812345678", "广东省深圳市南山区科技园 1 号 2 栋 301", "下午在家", "买家已付款"]
KETTLE = ["3301234567890000001", "2026/11/04 11:00", "TM-KT17", "XN-KT17", "电水壶", "2", "258", "李四", "13900001111", "北京市朝阳区某路 8 号", "", "交易成功"]
WH = ["3301234567890000002", "2026-11-03", "TM-WH60", "", "电热水器 60L", "", "1499", "王五", "13700002222", "上海市浦东新区张江路 9 号", "", "交易关闭"]


def setup(client):
    shop = create_shop(client)
    client.post("/api/product-cards", json={"product_code": "XN-AC35", "brand": "星年", "name": "空调", "install_required": True})
    client.post("/api/product-cards", json={"product_code": "XN-KT17", "brand": "星年", "name": "电水壶"})
    return shop


def test_import_creates_installs_only_for_install_products(client):
    shop = setup(client)
    response = upload_to(client, "/api/import/orders", shop["id"], "订单.csv", orders_csv(AC, KETTLE, ["", "", "", "", "", "", "", "", "", "", "", ""], ["X1", "坏时间", "S", "", "t", "1", "1", "", "", "", "", ""]))
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["kind"] == "orders"
    assert body["rows_ok"] == 2
    assert body["errors"] == [{"row": 5, "reason": "付款时间格式不正确"}]
    assert body["installs"] == {"created": 1, "cancelled": 0}

    [item] = client.get("/api/installs").json()
    assert item["status"] == "pending"
    assert item["order_no"] == "3301234567890123456"
    assert item["phone"] == "13812345678"
    assert item["paid_at"] == "2026-11-04T02:23:45+00:00"
    assert item["code"] == f"AZ{item['id']:06d}"
    assert item["product_code"] == "XN-AC35"

    again = upload_to(client, "/api/import/orders", shop["id"], "订单.csv", orders_csv(AC, KETTLE)).json()
    assert again["installs"] == {"created": 0, "cancelled": 0}
    assert len(client.get("/api/installs").json()) == 1


def test_card_switch_and_closed_orders(client):
    shop = setup(client)
    upload_to(client, "/api/import/orders", shop["id"], "o.csv", orders_csv(AC, KETTLE, WH))
    assert len(client.get("/api/installs").json()) == 1
    # 热水器订单没有货号，靠店铺商品表把商家编码对上货号
    from helpers import table, upload

    upload(client, shop["id"], "p.csv", table(("TM-WH60", "XN-WH60", "电热水器", 1499, 1299, 20, "")))
    client.post("/api/product-cards", json={"product_code": "XN-WH60", "brand": "星年", "name": "热水器", "install_required": True})
    # 关闭的订单不建工单
    assert len(client.get("/api/installs").json()) == 1

    closed_ac = AC[:-1] + ["交易关闭"]
    result = upload_to(client, "/api/import/orders", shop["id"], "o2.csv", orders_csv(closed_ac)).json()
    assert result["installs"] == {"created": 0, "cancelled": 1}
    [item] = client.get("/api/installs").json()
    assert item["status"] == "cancelled"

    open_wh = WH[:-1] + ["买家已付款"]
    upload_to(client, "/api/import/orders", shop["id"], "o3.csv", orders_csv(open_wh))
    titles = {i["title"]: i["product_code"] for i in client.get("/api/installs").json()}
    assert titles["电热水器 60L"] == "XN-WH60"


def test_status_flow_notes_notice_and_export(client):
    shop = setup(client)
    upload_to(client, "/api/import/orders", shop["id"], "o.csv", orders_csv(AC))
    [item] = client.get("/api/installs").json()
    iid = item["id"]

    need_time = client.post(f"/api/installs/{iid}/status", json={"status": "booked"})
    assert need_time.json()["error"]["code"] == "appointment_required"
    assert client.get(f"/api/installs/{iid}/notice").json()["error"]["code"] == "not_booked"
    booked = client.post(
        f"/api/installs/{iid}/status",
        json={"status": "booked", "appointment_at": "2026-11-06T14:00:00+08:00", "engineer": "刘师傅", "provider_ref": "ZMN-889", "by": "客服小周"},
    ).json()
    assert booked["status"] == "booked"
    assert booked["engineer"] == "刘师傅"
    assert booked["events"][-1]["text"] == "待预约 → 已预约，预约 2026-11-06 14:00"
    assert booked["events"][-1]["by"] == "客服小周"

    text = client.get(f"/api/installs/{iid}/notice").json()["text"]
    assert text.startswith("张先生/女士，您购买的星年 变频空调 1.5 匹已为您预约安装：2026-11-06 14:00，师傅：刘师傅。")

    no_reason = client.post(f"/api/installs/{iid}/status", json={"status": "exception"})
    assert no_reason.json()["error"]["code"] == "reason_required"
    exc = client.post(f"/api/installs/{iid}/status", json={"status": "exception", "reason": "顾客改期"}).json()
    assert exc["exception_reason"] == "顾客改期"
    assert client.get("/api/installs/summary").json()["needs_action"] == 1
    client.post(f"/api/installs/{iid}/status", json={"status": "booked"})
    done = client.post(f"/api/installs/{iid}/status", json={"status": "done"}).json()
    assert done["status"] == "done"
    stuck = client.post(f"/api/installs/{iid}/status", json={"status": "pending"})
    assert stuck.status_code == 409

    noted = client.post(f"/api/installs/{iid}/notes", json={"note": "顾客要求带防尘罩", "by": "小周"}).json()
    assert noted["note"] == "顾客要求带防尘罩"
    assert noted["events"][-1]["text"] == "备注：顾客要求带防尘罩"

    exported = client.post("/api/installs/export", json={"ids": [iid]})
    assert exported.status_code == 200
    assert exported.headers["content-type"].startswith("text/csv")
    rows = list(csv.reader(io.StringIO(exported.content.decode("utf-8-sig"))))
    assert rows[0][0] == "工单号"
    assert rows[1][7] == "13812345678"
    assert client.post("/api/installs/export", json={"status": "pending"}).status_code == 404


def test_filters_and_summary(client):
    shop = setup(client)
    upload_to(client, "/api/import/orders", shop["id"], "o.csv", orders_csv(AC))
    assert len(client.get("/api/installs", params={"q": "张三"}).json()) == 1
    assert client.get("/api/installs", params={"q": "没有"}).json() == []
    assert client.get("/api/installs", params={"status": "bad"}).status_code == 400
    summary = client.get("/api/installs/summary").json()
    assert summary["pending"] == 1 and summary["overdue"] == 0 and summary["needs_action"] == 1


def test_masking():
    assert mask_phone("138-1234-5678") == "138****5678"
    assert mask_phone(None) is None
    assert mask_address("广东省深圳市南山区科技园 1 号") == "广东省深圳市南山区****"
    assert mask_address("北京市朝阳区某路 8 号") == "北京市朝阳区****"
    assert mask_address("上海市浦东新区张江路 9 号") == "上海市浦东新区****"
    assert mask_name("张三丰") == "张**"
