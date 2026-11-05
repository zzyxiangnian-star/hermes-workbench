import base64
import struct
import zlib

import pytest

from app.design import image_size, sniff_mime


def png(width=4, height=3, shade=0) -> bytes:
    def chunk(kind, data):
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)

    raw = b"".join(b"\x00" + bytes([shade, 0, 0]) * width for _ in range(height))
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw))
        + chunk(b"IEND", b"")
    )


def _create(client, **extra):
    body = {
        "title": "双 11 空调主图",
        "kind": "main_image",
        "brand": "星年",
        "product_code": "XN-AC35",
        "sizes": ["800x800", "750×1000"],
        "copy_text": "一级能效 新风自清洁",
        "brief": "突出省电，背景用浅色客厅",
        "due_date": "2026-11-08",
        "requester": "运营小林",
    }
    body.update(extra)
    response = client.post("/api/design-requests", json=body)
    assert response.status_code == 201, response.text
    return response.json()


def _upload(client, rid, data, role="candidate", name="a.png", by="设计师阿杰"):
    return client.post(
        f"/api/design-requests/{rid}/assets", data={"role": role, "by": by}, files={"file": (name, data)}
    )


def test_request_flow_candidates_and_finalize(client, tmp_path):
    req = _create(client)
    assert req["status"] == "open" and req["round"] == 1
    assert req["sizes"] == ["800x800", "750x1000"]
    assert req["compliance"]["passed"] is True
    rid = req["id"]

    ref = _upload(client, rid, png(10, 20), role="reference", name="竞品.png", by="运营小林")
    assert ref.status_code == 201, ref.text
    assert ref.json()["role"] == "reference" and ref.json()["width"] == 10 and ref.json()["height"] == 20
    assert client.get(f"/api/design-requests/{rid}").json()["status"] == "open"

    taken = client.post(f"/api/design-requests/{rid}/status", json={"status": "in_progress", "by": "设计师阿杰"}).json()
    assert taken["status"] == "in_progress"

    a = _upload(client, rid, png(shade=1)).json()
    b = _upload(client, rid, png(shade=2)).json()
    assert (a["label"], b["label"]) == ("A", "B")
    detail = client.get(f"/api/design-requests/{rid}").json()
    assert detail["status"] == "reviewing"
    assert detail["candidate_count"] == 2
    assert detail["events"][-2]["text"] == "设计中 → 待评审，第 1 轮候选稿 A"

    file = client.get(a["url"])
    assert file.status_code == 200 and file.headers["content-type"] == "image/png"
    assert file.content == png(shade=1)

    pin = client.post(f"/api/design-requests/{rid}/comments", json={"body": "字再大一点", "asset_id": a["id"], "x": 0.5, "y": 0.2, "author": "王经理"})
    assert pin.status_code == 201, pin.text
    assert client.post(f"/api/design-requests/{rid}/comments", json={"body": "x", "x": 0.5, "y": 0.2}).status_code == 400
    assert client.post(f"/api/design-requests/{rid}/comments", json={"body": "x", "asset_id": a["id"], "x": 2, "y": 0}).status_code == 422

    no_note = client.post(f"/api/design-requests/{rid}/status", json={"status": "in_progress"})
    assert no_note.json()["error"]["code"] == "note_required"
    back = client.post(f"/api/design-requests/{rid}/status", json={"status": "in_progress", "note": "按批注改"}).json()
    assert back["round"] == 2 and back["events"][-1]["text"] == "退回修改，进入第 2 轮：按批注改"

    c = _upload(client, rid, png(shade=3)).json()
    assert c["round"] == 2 and c["label"] == "A"
    assert client.post(f"/api/design-requests/{rid}/status", json={"status": "done"}).json()["error"]["code"] == "use_finalize"
    assert client.post(f"/api/design-requests/{rid}/finalize", json={"asset_ids": [ref.json()["id"]]}).status_code == 400

    done = client.post(f"/api/design-requests/{rid}/finalize", json={"asset_ids": [c["id"]], "by": "王经理"}).json()
    assert done["status"] == "done"
    assert [f["id"] for f in done["finals"]] == [c["id"]]
    assert done["cover"]["id"] == c["id"]
    assert done["events"][-1]["text"] == "待评审 → 已定稿：第 2 轮 A，已归入素材库"

    library = client.get("/api/assets", params={"product_code": "XN-AC35"}).json()
    assert [x["id"] for x in library] == [c["id"]]
    assert client.delete(f"/api/assets/{c['id']}").status_code == 409
    assert _upload(client, rid, png()).status_code == 409
    assert client.patch(f"/api/design-requests/{rid}", json={"title": "x"}).status_code == 409
    summary = client.get("/api/design-requests/summary").json()
    assert summary["done"] == 1 and summary["needs_action"] == 0


def test_finalize_blocked_by_banned_words(client):
    req = _create(client, copy_text="全网最佳空调")
    assert req["compliance"]["passed"] is False
    rid = req["id"]
    cand = _upload(client, rid, png()).json()
    blocked = client.post(f"/api/design-requests/{rid}/finalize", json={"asset_ids": [cand["id"]]})
    assert blocked.json()["error"] == {"code": "compliance_failed", "message": "图上文案有必须修改的违禁词：最佳"}
    client.patch(f"/api/design-requests/{rid}", json={"copy_text": "高能效空调"})
    assert client.post(f"/api/design-requests/{rid}/finalize", json={"asset_ids": [cand["id"]]}).json()["status"] == "done"


def test_uploads_are_checked_and_deduplicated(client):
    rid = _create(client)["id"]
    fake = _upload(client, rid, b"MZ\x90\x00 not an image", name="virus.png")
    assert fake.json()["error"]["code"] == "unsupported_file"
    assert _upload(client, rid, b"", name="empty.png").json()["error"]["code"] == "empty_file"

    one = client.post("/api/assets", data={"brand": "星年", "tags": "Logo，白底"}, files={"file": ("logo.png", png())}).json()
    two = client.post("/api/assets", data={"brand": "星年"}, files={"file": ("logo-copy.png", png())}).json()
    assert one["tags"] == ["Logo", "白底"]
    assert one["url"] != two["url"]
    assert client.get(one["url"]).content == client.get(two["url"]).content
    assert len(client.get("/api/assets", params={"q": "白底"}).json()) == 1
    assert client.delete(f"/api/assets/{one['id']}").status_code == 204
    assert client.get(two["url"]).status_code == 200  # 同一个文件还有人用，不删
    assert client.delete(f"/api/assets/{two['id']}").status_code == 204
    assert client.get("/api/assets/999/file").status_code == 404
    assert client.post("/api/design-requests", json={"title": "x", "kind": "main_image", "brand": "星年", "sizes": ["大"]}).status_code == 422
    assert client.post("/api/design-requests", json={"title": "x", "kind": "main_image", "brand": "星年", "campaign_id": 99}).status_code == 404


def test_filters_and_delete(client):
    campaign = client.post("/api/campaigns", json={"name": "双 11", "brand": "星年", "start_date": "2026-11-01", "end_date": "2026-11-11"}).json()
    req = _create(client, campaign_id=campaign["id"], due_date="2026-01-01")
    _create(client, title="木屿海报", brand="木屿", kind="poster", product_code=None, brief="夏凉被")
    assert req["campaign_name"] == "双 11" and req["overdue"] is True
    assert len(client.get("/api/design-requests", params={"brand": "木屿"}).json()) == 1
    assert len(client.get("/api/design-requests", params={"campaign_id": campaign["id"]}).json()) == 1
    assert len(client.get("/api/design-requests", params={"q": "省电"}).json()) == 1
    assert client.get("/api/design-requests", params={"status": "bad"}).status_code == 400
    assert client.get("/api/design-requests/summary").json()["overdue"] == 1
    _upload(client, req["id"], png(), role="reference")
    assert client.delete(f"/api/design-requests/{req['id']}").status_code == 204
    assert client.get("/api/assets", params={"role": "reference"}).json() == []


@pytest.mark.parametrize(
    "data,mime,size",
    [
        (png(7, 5), "image/png", (7, 5)),
        (b"GIF89a" + struct.pack("<HH", 9, 4) + b"\x00" * 10, "image/gif", (9, 4)),
        (b"%PDF-1.7\n", "application/pdf", (None, None)),
        (b"\x00\x00\x00\x18ftypmp42" + b"\x00" * 8, "video/mp4", (None, None)),
    ],
)
def test_sniffing(data, mime, size):
    assert sniff_mime(data[:32]) == mime
    if mime.startswith("image/"):
        assert image_size(data, mime) == size


def test_ai_image_sources(tmp_path, monkeypatch):
    from app.design import load_ai_image
    from app.errors import AppError

    data_url = "data:image/png;base64," + base64.b64encode(png()).decode()
    assert load_ai_image(data_url)[0] == png()
    hermes = tmp_path / "hermes"
    (hermes / "cache" / "images").mkdir(parents=True)
    pic = hermes / "cache" / "images" / "gen.png"
    pic.write_bytes(png())
    monkeypatch.setenv("WB_AI_IMAGE_DIRS", str(hermes))
    assert load_ai_image(str(pic)) == (png(), "gen.png")
    outside = tmp_path / "secret.png"
    outside.write_bytes(png())
    for bad, code in [
        (str(outside), "path_not_allowed"),
        (str(hermes / "cache" / ".." / ".." / "secret.png"), "path_not_allowed"),
        ("http://example.com/a.png", "invalid_url"),
        ("https://127.0.0.1/a.png", "invalid_url"),
        ("data:image/png;base64," + base64.b64encode(b"%PDF-1.4").decode(), "invalid_image"),
    ]:
        with pytest.raises(AppError) as info:
            load_ai_image(bad)
        assert info.value.code == code, bad
