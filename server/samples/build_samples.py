"""生成两张假数据样表。运行：python samples/build_samples.py"""

from __future__ import annotations

import csv
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


def main() -> None:
    write_xlsx(ROOT / "products-tmall.xlsx", TMALL_HEADERS, tmall_table())
    write_csv(ROOT / "products-jd.csv", JD_HEADERS, jd_table())


if __name__ == "__main__":
    main()
