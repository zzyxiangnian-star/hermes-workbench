"""生成假数据样表。运行：python samples/build_samples.py"""

from __future__ import annotations

import csv
from datetime import date, timedelta
from pathlib import Path

from openpyxl import Workbook

ROOT = Path(__file__).resolve().parent

NAMES = [
    "星年纯棉短袖T恤",
    "星年亚麻长袖衬衫",
    "星年轻薄防晒衣",
    "星年直筒牛仔裤",
    "星年运动短裤",
    "星年连帽卫衣",
    "星年针织开衫",
    "星年半身伞裙",
    "星年帆布托特包",
    "星年棒球帽",
    "星年纯色袜子三双装",
    "星年家居拖鞋",
    "星年保温杯",
    "星年玻璃水杯",
    "星年无线鼠标",
    "星年机械键盘",
    "星年桌面台灯",
    "星年收纳盒",
    "星年香薰蜡烛",
    "星年抱枕",
    "星年午睡毯",
    "星年洗衣袋",
    "星年厨房围裙",
    "星年陶瓷餐盘",
    "星年马克杯",
    "星年笔记本",
]

TMALL_HEADERS = ["商品编码", "货号", "标题", "售价", "底价", "库存", "活动"]
JD_HEADERS = ["SKU", "商品货号", "商品名称", "价格", "底价", "可售库存", "活动名称"]


def shared_rows() -> list[dict]:
    rows = []
    for index, title in enumerate(NAMES, start=1):
        code = f"SN-{index:03d}"
        row = {
            "code": code,
            "title": title,
            "activity": "春季上新",
            "sku_tm": f"TM-{code}",
            "sku_jd": f"JD-{code}",
        }
        if index <= 8:
            row.update(price_tm=199, price_jd=199, floor_tm=159, floor_jd=159, stock_tm=80, stock_jd=80)
        elif index == 9:
            # 库存刚好等于默认最低库存，不应命中。
            row.update(price_tm=199, price_jd=199, floor_tm=159, floor_jd=159, stock_tm=10, stock_jd=10)
        elif index == 10:
            # 售价等于底价，不应命中低于底价。
            row.update(price_tm=199, price_jd=199, floor_tm=199, floor_jd=199, stock_tm=80, stock_jd=80)
        elif 11 <= index <= 14:
            row.update(price_tm=189, price_jd=189, floor_tm=199, floor_jd=159, stock_tm=40, stock_jd=40)
        elif 15 <= index <= 18:
            row.update(price_tm=129, price_jd=129, floor_tm=99, floor_jd=99, stock_tm=3, stock_jd=40)
        elif 19 <= index <= 22:
            row.update(price_tm=100, price_jd=120, floor_tm=80, floor_jd=80, stock_tm=30, stock_jd=30)
        else:
            # 价差 4%，不超过默认 5%。
            row.update(price_tm=200, price_jd=208, floor_tm=150, floor_jd=150, stock_tm=25, stock_jd=25)
        rows.append(row)
    return rows


def tmall_table() -> list[list]:
    rows = [
        [item["sku_tm"], item["code"], item["title"], item["price_tm"], item["floor_tm"], item["stock_tm"], item["activity"]]
        for item in shared_rows()
    ]
    rows.append(["TM-SN-T01", "SN-T01", "星年帆布腰带", 88, 90, 5, "春季上新"])
    rows.append(["TM-SN-T02", "SN-T02", "星年棉麻围巾", 50, "", 100, "春季上新"])
    rows.append(["", "SN-BAD-1", "缺编码的行", 10, 8, 10, "春季上新"])
    rows.append(["SN-BAD-PRICE", "SN-BAD-2", "价格写错的行", "待定", 10, 10, "春季上新"])
    return rows


def jd_table() -> list[list]:
    rows = [
        [item["sku_jd"], item["code"], item["title"], item["price_jd"], item["floor_jd"], item["stock_jd"], item["activity"]]
        for item in shared_rows()
    ]
    rows.append(["JD-SN-J01", "SN-J01", "星年运动水壶", 60, 70, 2, "春季上新"])
    rows.append(["JD-SN-J02", "SN-J02", "星年手机支架", 77, 70, 15, "春季上新"])
    rows.append(["", "SN-BAD-1", "缺编码的行", 10, 8, 10, "春季上新"])
    rows.append(["JD-SN-BAD-STOCK", "SN-BAD-2", "库存写错的行", 10, 8, "很多", "春季上新"])
    return rows


def write_xlsx(path: Path, headers: list[str], rows: list[list]) -> None:
    book = Workbook()
    sheet = book.active
    sheet.title = "商品"
    sheet.append(headers)
    for row in rows:
        sheet.append([None if cell == "" else cell for cell in row])
    book.save(path)


def write_csv(path: Path, headers: list[str], rows: list[list]) -> None:
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(headers)
        writer.writerows(rows)


METRICS_HEADERS = ["日期", "访客数", "订单数", "销售额", "退款金额"]
AD_HEADERS = ["日期", "投放工具", "计划名称", "花费", "成交金额", "点击量", "展现量"]
# 正常花费、正常成交、最后一天花费、最后一天成交。最后一天用来造低 ROI 和花费突增。
AD_CAMPAIGNS = [
    ("双11预热", 400, 1200, 500, 650),
    ("日常测款", 100, 400, 100, 400),
    ("爆发计划", 100, 300, 400, 800),
    ("品牌词", 300, 900, 300, 900),
]


def _days() -> list[date]:
    start = date(2026, 10, 6)
    return [start + timedelta(days=offset) for offset in range(30)]


def metrics_table() -> list[list]:
    rows = []
    for current in _days():
        if current == date(2026, 11, 3):
            visitors, orders, sales, refund = 1000, 40, 8000, 100
        elif current == date(2026, 11, 4):
            visitors, orders, sales, refund = 1200, 60, 12000, 300
        elif current == date(2026, 10, 6):
            visitors, orders, sales, refund = 1000, 50, 10000, ""
        else:
            visitors, orders, sales, refund = 1000, 50, 10000, 200
        rows.append([current.isoformat(), visitors, orders, sales, refund])
    rows.append(["", 10, 1, 100, 0])
    rows.append(["2026-11-04", "很多", 1, 100, 0])
    return rows


def ad_spend_table() -> list[list]:
    rows = []
    for current in _days():
        last = current == date(2026, 11, 4)
        for name, spend, gmv, last_spend, last_gmv in AD_CAMPAIGNS:
            rows.append(
                [
                    current.isoformat(),
                    "万相台",
                    name,
                    last_spend if last else spend,
                    last_gmv if last else gmv,
                    20,
                    1000,
                ]
            )
    rows.append(["", "万相台", "坏计划", 10, 20, 1, 10])
    rows.append(["2026-11-04", "万相台", "坏花费", "很多", 20, 1, 10])
    return rows


def main() -> None:
    write_xlsx(ROOT / "products-tmall.xlsx", TMALL_HEADERS, tmall_table())
    write_csv(ROOT / "products-jd.csv", JD_HEADERS, jd_table())
    write_xlsx(ROOT / "metrics-tmall.xlsx", METRICS_HEADERS, metrics_table())
    write_xlsx(ROOT / "ad-spend-tmall.xlsx", AD_HEADERS, ad_spend_table())


if __name__ == "__main__":
    main()
