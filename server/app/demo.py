"""造一套演示数据（全部是假的），给客户演示和界面开发用。

    workbench-demo                 # 写到 data/demo.db，已存在就覆盖
    workbench-demo --db 路径.db

日期按今天往前推 30 天，所以什么时候演示都像“昨天刚发生”。用工作台的接口写入，
和真实导入走同一条路，顺便把规则、投放提醒都跑一遍。
"""

from __future__ import annotations

import argparse
import csv
import io
import os
import random
from datetime import date, timedelta
from pathlib import Path

DEFAULT_DB = Path(__file__).resolve().parent.parent / "data" / "demo.db"
DAYS = 30

SHOPS = [
    ("tmall", "星年天猫旗舰店", "星年", 1.0),
    ("jd", "星年京东自营店", "星年", 0.8),
    ("pdd", "星年拼多多店", "星年", 0.6),
    ("douyin", "木屿抖音小店", "木屿", 0.5),
]

# 编码、名称、售价、底价、是否要安装
XINGNIAN_PRODUCTS = [
    ("XN-RC30", "星年 IH 电饭煲 3L", 399, 359, False),
    ("XN-RC50", "星年 IH 电饭煲 5L", 499, 449, False),
    ("XN-KT17", "星年 双层防烫电水壶 1.7L", 129, 109, False),
    ("XN-AP60", "星年 空气净化器 除甲醛", 1299, 1099, False),
    ("XN-AC35", "星年 一级能效变频空调 1.5 匹 挂机", 2999, 2799, True),
    ("XN-AC72", "星年 一级能效变频空调 3 匹 柜机", 5999, 5599, True),
    ("XN-WH60", "星年 电热水器 60L", 1499, 1299, True),
    ("XN-DH20", "星年 除湿机 20L", 999, 899, False),
    ("XN-FN40", "星年 落地循环扇", 299, 259, False),
    ("XN-MW23", "星年 微波炉 23L", 459, 399, False),
]
MUYU_PRODUCTS = [
    ("MY-BL01", "木屿 纯棉四件套 1.8m", 359, 299, False),
    ("MY-PL02", "木屿 乳胶枕 一对装", 199, 169, False),
    ("MY-TW03", "木屿 长绒棉浴巾", 89, 69, False),
    ("MY-QT04", "木屿 夏凉被", 259, 219, False),
]

AD_PLANS = {
    "tmall": [("万相台", "双11 爆款拉新"), ("万相台", "空调 搜索")],
    "jd": [("京准通", "京东 空调 快车"), ("京准通", "京东 厨电 触点")],
    "pdd": [("多多推广", "拼多多 全站推广")],
    "douyin": [("巨量千川", "木屿 直播间引流")],
}


def build(db_path: Path) -> dict:
    os.environ["WB_SCHEDULER"] = "off"
    from fastapi.testclient import TestClient

    from app.main import create_app

    if db_path.exists():
        db_path.unlink()
    db_path.parent.mkdir(parents=True, exist_ok=True)
    app = create_app("sqlite:///" + db_path.resolve().as_posix())
    rng = random.Random(20261105)
    from app.brand import today

    end = today() - timedelta(days=1)
    start = end - timedelta(days=DAYS - 1)
    with TestClient(app) as client:
        api = _Api(client)
        shops = {name: api.post("/api/shops", {"platform": p, "name": name, "brand": b}) for p, name, b, _ in SHOPS}
        _products(api, shops, rng)
        _metrics_and_ads(api, shops, rng, start, end)
        _brand(api, rng, end)
        _orders(api, shops, rng, end)
        summary = {
            "数据库": str(db_path),
            "日期范围": f"{start} 至 {end}",
            "店铺": len(shops),
            "未处理商品问题": api.get("/api/issues/summary")["total_open"],
            "未处理投放提醒": len(api.get("/api/alerts", {"status": "open"})),
            "活动": len(api.get("/api/campaigns")),
            "稿件": len(api.get("/api/contents")),
            "安装工单": len(api.get("/api/installs")),
        }
    return summary


class _Api:
    def __init__(self, client) -> None:
        self.client = client

    def _check(self, response):
        if response.status_code >= 400:
            raise RuntimeError(f"{response.request.method} {response.request.url} → {response.status_code} {response.text}")
        return response.json() if response.content else None

    def get(self, path, params=None):
        return self._check(self.client.get(path, params=params))

    def post(self, path, body=None):
        return self._check(self.client.post(path, json=body or {}))

    def put(self, path, body):
        return self._check(self.client.put(path, json=body))

    def patch(self, path, body):
        return self._check(self.client.patch(path, json=body))

    def upload(self, path, shop_id, name, rows):
        buffer = io.StringIO()
        csv.writer(buffer).writerows(rows)
        files = {"file": (name, buffer.getvalue().encode("utf-8-sig"))}
        return self._check(self.client.post(path, data={"shop_id": str(shop_id)}, files=files))


def _products(api: _Api, shops: dict, rng: random.Random) -> None:
    header = ["商品编码", "货号", "标题", "售价", "底价", "库存", "活动"]
    for platform, name, brand, _scale in SHOPS:
        catalog = XINGNIAN_PRODUCTS if brand == "星年" else MUYU_PRODUCTS
        rows = [header]
        prefix = platform.upper()[:2]
        for index, (code, title, price, floor, _install) in enumerate(catalog):
            sale = price
            stock = rng.randint(30, 400)
            activity = "双11" if index % 3 != 2 else ""
            if platform == "pdd":
                sale = round(price * 0.97)  # 拼多多普遍便宜一点
                if code in {"XN-FN40", "XN-MW23"}:
                    sale = round(price * 0.88)  # 这两件和其他店差出 5% 以上
            if (platform, code) in {("tmall", "XN-KT17"), ("jd", "XN-RC50"), ("pdd", "XN-AP60")}:
                sale = floor - 20  # 低于底价
            if (platform, code) in {("tmall", "XN-AC35"), ("jd", "XN-WH60"), ("douyin", "MY-PL02")}:
                stock = rng.randint(0, 4)  # 库存不足
            rows.append([f"{prefix}-{code}", code, title, sale, floor, stock, activity])
        api.upload("/api/import/products", shops[name]["id"], f"商品-{name}.csv", rows)


def _metrics_and_ads(api: _Api, shops: dict, rng: random.Random, start: date, end: date) -> None:
    for platform, name, _brand, scale in SHOPS:
        metric_rows = [["日期", "访客数", "订单数", "销售额", "退款金额"]]
        ad_rows = [["日期", "投放工具", "计划名称", "花费", "成交金额", "点击量", "展现量"]]
        aov = {"tmall": 520, "jd": 610, "pdd": 330, "douyin": 240}[platform]
        day = start
        while day <= end:
            promo = 1.35 if (end - day).days in range(3, 11) else 1.0  # 前一阵的活动期（涨幅不到突增线）
            weekend = 1.15 if day.weekday() >= 5 else 1.0
            visitors = int(4000 * scale * promo * weekend * rng.uniform(0.9, 1.1))
            orders = int(visitors * rng.uniform(0.028, 0.042))
            sales = round(orders * aov * rng.uniform(0.92, 1.08), 2)
            refund = round(sales * rng.uniform(0.01, 0.04), 2)
            metric_rows.append([day.isoformat(), visitors, orders, sales, refund])
            for tool, plan in AD_PLANS[platform]:
                spend = round(600 * scale * promo * rng.uniform(0.93, 1.07), 2)
                roi = rng.uniform(2.6, 4.2)
                if day == end and plan in {"空调 搜索", "拼多多 全站推广"}:
                    roi = rng.uniform(0.8, 1.2)  # 昨天 ROI 跌破线
                if day == end and plan == "京东 厨电 触点":
                    spend *= 2.4  # 昨天花费突增
                clicks = int(spend / rng.uniform(0.8, 1.6))
                ad_rows.append([day.isoformat(), tool, plan, round(spend, 2), round(spend * roi, 2), clicks, clicks * rng.randint(18, 30)])
            day += timedelta(days=1)
        shop_id = shops[name]["id"]
        api.upload("/api/import/metrics", shop_id, f"经营-{name}.csv", metric_rows)
        api.upload("/api/import/ad-spend", shop_id, f"投放-{name}.csv", ad_rows)


def _brand(api: _Api, rng: random.Random, end: date) -> None:
    api.put(
        "/api/brand-guides/星年",
        {
            "tone": "专业、可靠、说人话。多讲使用场景，少堆参数；不贬低竞品。",
            "colors": ["#C8102E", "#1F2937", "#F5F5F4"],
            "fonts": ["思源黑体", "阿里巴巴普惠体"],
            "logo_rules": "Logo 四周留白不少于一个字高；深色背景用反白版；不拉伸、不加描边。",
            "notes": "能效、噪音等数据必须写测试条件；空调、热水器类文案要提“含基础安装”。",
        },
    )
    api.put(
        "/api/brand-guides/木屿",
        {
            "tone": "温柔、松弛，像朋友推荐。多用触感和场景描写。",
            "colors": ["#8A9A5B", "#F3EFE6", "#3F3A33"],
            "fonts": ["思源宋体"],
            "logo_rules": "只用墨绿色或米白色版本。",
        },
    )
    cards = [
        {
            "product_code": "XN-RC30",
            "brand": "星年",
            "name": "星年 IH 电饭煲 3L",
            "selling_points": ["IH 电磁加热，受热更均匀", "24 小时预约", "内胆可进洗碗机"],
            "specs": "容量 3L，功率 1000W，适合 1–4 人",
            "faq": [{"q": "保修多久", "a": "整机一年，加热盘三年"}, {"q": "能做蛋糕吗", "a": "有蛋糕模式，建议用 3 个鸡蛋的量"}],
        },
        {
            "product_code": "XN-AC35",
            "brand": "星年",
            "name": "星年 一级能效变频空调 1.5 匹",
            "selling_points": ["新一级能效", "睡眠模式 22 分贝（实验室条件）", "自清洁"],
            "specs": "适用 15–22㎡，制冷量 3500W",
            "faq": [{"q": "含安装吗", "a": "含基础安装和 3 米铜管，超出部分按物价表收费"}],
            "install_required": True,
        },
        {
            "product_code": "XN-WH60",
            "brand": "星年",
            "name": "星年 电热水器 60L",
            "selling_points": ["3000W 速热", "镁棒可免费更换一次"],
            "faq": [{"q": "要打孔吗", "a": "需要承重墙打孔，安装师傅上门确认"}],
            "install_required": True,
        },
        {
            "product_code": "MY-BL01",
            "brand": "木屿",
            "name": "木屿 纯棉四件套 1.8m",
            "selling_points": ["新疆长绒棉", "A 类婴幼儿标准", "越洗越软"],
            "faq": [{"q": "会起球吗", "a": "建议首次单独冷水洗，正常使用不易起球"}],
        },
    ]
    for card in cards:
        api.post("/api/product-cards", card)

    ended = api.post(
        "/api/campaigns",
        {
            "name": "双 11 预热",
            "brand": "星年",
            "kind": "big_promo",
            "start_date": (end - timedelta(days=10)).isoformat(),
            "end_date": (end - timedelta(days=3)).isoformat(),
            "goal": "空调和厨电冲量，拉新为主",
            "target_sales": 1_200_000,
            "budget": 60_000,
            "product_codes": ["XN-AC35", "XN-RC30", "XN-KT17"],
            "use_template": True,
        },
    )
    for task in ended["tasks"][:-1]:
        api.patch(f"/api/campaign-tasks/{task['id']}", {"done": True, "owner": rng.choice(["小李", "小王", "阿杰"])})
    api.patch(f"/api/campaigns/{ended['id']}", {"status": "ended"})
    upcoming = api.post(
        "/api/campaigns",
        {
            "name": "双 12 年终好价",
            "brand": "星年",
            "kind": "holiday",
            "start_date": (end + timedelta(days=30)).isoformat(),
            "end_date": (end + timedelta(days=38)).isoformat(),
            "goal": "清库存 + 老客复购",
            "budget": 40_000,
            "use_template": True,
        },
    )
    api.post(
        "/api/campaigns",
        {
            "name": "木屿 秋冬换季",
            "brand": "木屿",
            "kind": "new_launch",
            "start_date": (end - timedelta(days=2)).isoformat(),
            "end_date": (end + timedelta(days=12)).isoformat(),
            "product_codes": ["MY-BL01", "MY-QT04"],
            "use_template": True,
        },
    )

    published = api.post(
        "/api/contents",
        {
            "title": "双 11 空调怎么选",
            "brand": "星年",
            "kind": "note",
            "campaign_id": ended["id"],
            "author": "小李",
            "body": "1.5 匹够不够？看面积：15 到 22 平米选 1.5 匹。新一级能效一晚上省一度电左右（以实际使用为准）。",
            "variants": [{"platform": "xiaohongshu", "title": "租房党空调避坑", "body": "姐妹们，空调别只看价格……"}],
        },
    )
    for step, body in (("submit", {"by": "小李"}), ("approve", {"by": "王经理"})):
        api.post(f"/api/contents/{published['id']}/{step}", body)
    api.post(
        f"/api/contents/{published['id']}/publish",
        {"by": "小李", "platform": "xiaohongshu", "url": "https://example.com/demo-note"},
    )

    in_review = api.post(
        "/api/contents",
        {
            "title": "双 12 电饭煲种草",
            "brand": "星年",
            "kind": "note",
            "campaign_id": upcoming["id"],
            "author": "阿杰",
            "body": "IH 加热的米饭到底有什么不一样？我们做了一次盲测。",
            "variants": [{"platform": "douyin", "body": "口播：今天来盲测三台电饭煲……"}],
        },
    )
    api.post(f"/api/contents/{in_review['id']}/submit", {"by": "阿杰"})

    rejected = api.post(
        "/api/contents",
        {
            "title": "热水器安装须知",
            "brand": "星年",
            "kind": "article",
            "author": "小王",
            "body": "买热水器之前，先确认家里墙体能不能打孔。",
            "variants": [{"platform": "wechat", "body": "公众号长文：热水器安装的五个问题"}],
        },
    )
    api.post(f"/api/contents/{rejected['id']}/submit", {"by": "小王"})
    api.post(
        f"/api/contents/{rejected['id']}/comments",
        {"body": "这里要写清楚打孔是否收费", "quote": "能不能打孔", "start": 14, "end": 19, "author": "王经理"},
    )
    api.post(f"/api/contents/{rejected['id']}/reject", {"by": "王经理", "note": "安装费用说明不清楚"})

    api.post(
        "/api/contents",
        {
            "title": "木屿四件套上新文案（AI 草稿）",
            "brand": "木屿",
            "kind": "product_copy",
            "author": "品牌助手",
            "note": "品牌助手起草",
            "body": "最佳睡眠伴侣，新疆长绒棉，越洗越软。",
            "variants": [{"platform": "douyin", "body": "直播口播：摸一下这个手感……"}],
        },
    )


SURNAMES = "张王李赵刘陈杨黄周吴"
CITIES = ["广东省深圳市南山区", "浙江省杭州市西湖区", "江苏省苏州市工业园区", "北京市朝阳区", "上海市浦东新区", "四川省成都市武侯区"]


def _orders(api: _Api, shops: dict, rng: random.Random, end: date) -> None:
    """最近 3 天的订单，空调、热水器会生成安装工单。手机号用 100 号段，不会是真号码。"""
    header = ["订单编号", "付款时间", "商家编码", "货号", "商品标题", "购买数量", "实付金额", "收货人姓名", "联系手机", "收货地址", "买家留言", "订单状态"]
    remarks = ["", "", "下午在家", "工作日晚上 7 点后", "老房子，墙比较旧", "先别装，等装修完"]
    for platform, name, brand, _scale in SHOPS:
        if brand != "星年":
            continue
        rows = [header]
        prefix = platform.upper()[:2]
        for n in range(14):
            code, title, price, _floor, _install = XINGNIAN_PRODUCTS[rng.choice([0, 2, 4, 4, 5, 6, 7])]
            day = end - timedelta(days=rng.randint(0, 2))
            status = "交易关闭" if n == 13 else "买家已付款"
            rows.append(
                [
                    f"{platform[:1].upper()}{day:%Y%m%d}{n:04d}",
                    f"{day} {rng.randint(8, 23):02d}:{rng.randint(0, 59):02d}:00",
                    f"{prefix}-{code}",
                    code,
                    title,
                    1,
                    price,
                    rng.choice(SURNAMES) + rng.choice(["先生", "女士", "小明", "晓红"]),
                    f"100{rng.randint(10000000, 99999999)}",
                    f"{rng.choice(CITIES)}演示路 {rng.randint(1, 99)} 号",
                    rng.choice(remarks),
                    status,
                ]
            )
        api.upload("/api/import/orders", shops[name]["id"], f"订单-{name}.csv", rows)
    installs = api.get("/api/installs", {"status": "pending"})
    if len(installs) >= 3:
        first, second, third = installs[:3]
        when = f"{end + timedelta(days=2)}T14:00:00+08:00"
        api.post(f"/api/installs/{first['id']}/status", {"status": "booked", "appointment_at": when, "engineer": "刘师傅", "provider_ref": "ZMN-DEMO-1", "by": "客服小周"})
        api.post(f"/api/installs/{second['id']}/status", {"status": "exception", "reason": "顾客说墙体是空心砖，需要先确认能否打孔", "by": "客服小周"})
        api.post(f"/api/installs/{third['id']}/notes", {"note": "顾客要求带防尘罩", "by": "客服小周"})


def main() -> None:
    parser = argparse.ArgumentParser(description="生成工作台演示数据（假数据）")
    parser.add_argument("--db", type=Path, default=DEFAULT_DB, help=f"SQLite 文件，默认 {DEFAULT_DB}")
    args = parser.parse_args()
    summary = build(args.db)
    for key, value in summary.items():
        print(f"{key}：{value}")
    print()
    print("用演示库启动：")
    print(f'  set WORKBENCH_DATABASE_URL=sqlite:///{args.db.resolve().as_posix()}   (PowerShell 用 $env:WORKBENCH_DATABASE_URL="…")')
    print("  workbench-api")


if __name__ == "__main__":
    main()
