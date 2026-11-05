import csv
import io
import json
from pathlib import Path

SAMPLES = Path(__file__).resolve().parent.parent / "samples"


def create_shop(client, platform="tmall", name="星年天猫旗舰店", brand="星年"):
    response = client.post(
        "/api/shops",
        json={"platform": platform, "name": name, "brand": brand},
    )
    assert response.status_code == 201, response.text
    return response.json()


def upload(client, shop_id, filename, content: bytes, mapping=None):
    data = {"shop_id": str(shop_id)}
    if mapping is not None:
        data["mapping"] = json.dumps(mapping, ensure_ascii=False)
    return client.post(
        "/api/import/products",
        data=data,
        files={"file": (filename, content, "application/octet-stream")},
    )


def table(*rows: tuple) -> bytes:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["商品编码", "货号", "标题", "售价", "底价", "库存", "活动"])
    for row in rows:
        writer.writerow(["" if cell is None else cell for cell in row])
    return buffer.getvalue().encode("utf-8-sig")


def issues(client, **params):
    response = client.get("/api/issues", params=params)
    assert response.status_code == 200, response.text
    return response.json()


def rule_by_kind(client, kind):
    response = client.get("/api/rules")
    assert response.status_code == 200, response.text
    for rule in response.json():
        if rule["kind"] == kind:
            return rule
    raise AssertionError(kind)
