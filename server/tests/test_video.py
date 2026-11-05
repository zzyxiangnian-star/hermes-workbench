import io
import json
import struct
import zipfile

from test_design import png

from app.video import audio_duration


def mp3(frames=100) -> bytes:
    """MPEG-1 Layer III，128 kbps，44.1 kHz：每帧 417 字节、1152 个采样。"""
    frame = b"\xff\xfb\x90\x00" + b"\x00" * 413
    return b"ID3\x03\x00\x00\x00\x00\x00\x00" + frame * frames


def wav(seconds=1.5, rate=8000) -> bytes:
    samples = int(seconds * rate)
    data = b"\x00\x00" * samples
    fmt = struct.pack("<HHIIHH", 1, 1, rate, rate * 2, 2, 16)
    body = b"WAVE" + b"fmt " + struct.pack("<I", len(fmt)) + fmt + b"data" + struct.pack("<I", len(data)) + data
    return b"RIFF" + struct.pack("<I", len(body)) + body


SHOTS = [
    {"duration": 2, "visual": "空调特写", "voiceover": "今年夏天，电费终于降下来了。", "note": "开场三秒抓人"},
    {"duration": 3, "visual": "客厅全景", "voiceover": "一级能效，一晚上不到一度电，新风自清洁。"},
    {"duration": 2, "visual": "下单页", "voiceover": "含基础安装", "subtitle": ""},
]


def _create(client, **extra):
    body = {"title": "空调省电口播", "brand": "星年", "product_code": "XN-AC35", "platform": "douyin", "author": "小李", "shots": SHOTS}
    body.update(extra)
    response = client.post("/api/video-projects", json=body)
    assert response.status_code == 201, response.text
    return response.json()


def test_audio_durations():
    assert audio_duration(mp3(100), "audio/mpeg") == round(100 * 1152 / 44100, 3)
    assert audio_duration(wav(1.5), "audio/wav") == 1.5
    assert audio_duration(b"\x00" * 10, "audio/mpeg") is None


def test_script_flow_package_and_final(client):
    project = _create(client)
    pid = project["id"]
    assert project["status"] == "draft" and project["shot_count"] == 3
    assert project["duration"] == 7 and project["missing_media"] == 3 and project["missing_voice"] == 3
    assert [s["start"] for s in project["shots"]] == [0, 2, 5]

    voice = client.post(f"/api/video-projects/{pid}/shots/2/media", data={"slot": "voice", "by": "小李"}, files={"file": ("v.wav", wav(4.25))})
    assert voice.status_code == 200, voice.text
    detail = voice.json()
    assert detail["shots"][1]["voice"]["mime"] == "audio/wav"
    assert detail["shots"][1]["length"] == 4.25  # 配音比写的 3 秒长，按配音算
    assert detail["duration"] == 8.25
    picture = client.post(f"/api/video-projects/{pid}/shots/1/media", data={"slot": "visual"}, files={"file": ("p.png", png())}).json()
    assert picture["cover"]["mime"] == "image/png"
    wrong = client.post(f"/api/video-projects/{pid}/shots/1/media", data={"slot": "voice"}, files={"file": ("p.png", png())})
    assert wrong.json()["error"]["code"] == "invalid_media"
    assert client.post(f"/api/video-projects/{pid}/shots/9/media", data={"slot": "visual"}, files={"file": ("p.png", png())}).status_code == 404
    bgm = client.post(f"/api/video-projects/{pid}/bgm", files={"file": ("bgm.mp3", mp3(50))}).json()
    assert bgm["bgm"]["mime"] == "audio/mpeg"

    srt = client.get(f"/api/video-projects/{pid}/subtitles.srt").content.decode("utf-8-sig")
    assert srt.startswith("1\n00:00:00,000 --> 00:00:02,000\n今年夏天，电费终于降下来了\n")
    assert "\n一级能效，一晚上不到一度电\n" in srt and "\n新风自清洁\n" in srt and "含基础安装" not in srt  # 第 3 镜字幕留空

    assert client.get(f"/api/video-projects/{pid}/package").json()["error"]["code"] == "not_approved"
    submitted = client.post(f"/api/video-projects/{pid}/submit", json={"by": "小李"}).json()
    assert submitted["status"] == "in_review"
    locked = client.put(f"/api/video-projects/{pid}/shots", json={"shots": SHOTS})
    assert locked.json()["error"]["code"] == "project_locked"
    assert client.post(f"/api/video-projects/{pid}/reject", json={}).json()["error"]["code"] == "note_required"
    approved = client.post(f"/api/video-projects/{pid}/approve", json={"by": "王经理"}).json()
    assert approved["status"] == "approved" and approved["reviewer"] == "王经理"

    pack = client.get(f"/api/video-projects/{pid}/package")
    assert pack.status_code == 200 and pack.headers["content-type"] == "application/zip"
    archive = zipfile.ZipFile(io.BytesIO(pack.content))
    names = set(archive.namelist())
    assert {"素材/01_画面.png", "素材/02_配音.wav", "素材/bgm.mp3", "字幕.srt", "分镜表.csv", "时间线.json", "说明.txt"} <= names
    line = json.loads(archive.read("时间线.json"))
    assert line["width"] == 1080 and line["height"] == 1920 and line["duration"] == 8.25
    assert line["shots"][1]["voice"]["package_name"] == "素材/02_配音.wav"
    assert line["bgm"]["package_name"] == "素材/bgm.mp3"
    table = archive.read("分镜表.csv").decode("utf-8-sig").splitlines()
    assert table[0].startswith("镜号,开始(秒),结束(秒)")

    not_video = client.post(f"/api/video-projects/{pid}/final", files={"file": ("x.png", png())})
    assert not_video.json()["error"]["code"] == "invalid_media"
    movie = b"\x00\x00\x00\x18ftypmp42" + b"\x00" * 100
    done = client.post(f"/api/video-projects/{pid}/final", data={"by": "剪辑小陈"}, files={"file": ("成片.mp4", movie)}).json()
    assert done["status"] == "done" and done["final"]["role"] == "final" and done["editor"] == "剪辑小陈"
    library = client.get("/api/assets", params={"kind": "video"}).json()
    assert [a["id"] for a in library] == [done["final"]["id"]]
    assert client.get("/api/assets", params={"role": "material"}).json()  # 配音和画面不进素材库默认列表
    assert all(a["role"] != "material" for a in client.get("/api/assets").json())


def test_compliance_gate_and_shots_editing(client):
    project = _create(client, shots=[{"duration": 3, "voiceover": "全网最佳空调"}])
    pid = project["id"]
    assert project["compliance"]["passed"] is False
    blocked = client.post(f"/api/video-projects/{pid}/submit", json={})
    assert blocked.json()["error"] == {"code": "compliance_failed", "message": "口播或字幕里有必须修改的违禁词：最佳"}

    logo = client.post("/api/assets", data={"brand": "星年"}, files={"file": ("logo.png", png())}).json()
    edited = client.put(
        f"/api/video-projects/{pid}/shots",
        json={"shots": [{"duration": 2, "voiceover": "很省电的空调", "media_asset_id": logo["id"]}, {"duration": 1.5, "visual": "Logo 收尾"}]},
    ).json()
    assert [s["seq"] for s in edited["shots"]] == [1, 2]
    assert edited["shots"][0]["media"]["id"] == logo["id"]
    bad = client.put(f"/api/video-projects/{pid}/shots", json={"shots": [{"duration": 2, "voice_asset_id": logo["id"]}]})
    assert bad.json()["error"]["code"] == "invalid_media"
    assert client.put(f"/api/video-projects/{pid}/shots", json={"shots": [{"duration": 0}]}).status_code == 422

    client.post(f"/api/video-projects/{pid}/submit", json={})
    assert client.post(f"/api/video-projects/{pid}/withdraw", json={}).json()["status"] == "draft"
    assert client.post(f"/api/video-projects/{pid}/cancel", json={}).json()["status"] == "cancelled"
    assert client.delete(f"/api/video-projects/{pid}").status_code == 204
    empty = _create(client, shots=[])
    assert client.post(f"/api/video-projects/{empty['id']}/submit", json={}).json()["error"]["code"] == "no_shots"


def test_list_filters(client):
    _create(client)
    _create(client, title="四件套开箱", brand="木屿", shots=[{"duration": 3, "voiceover": "纯棉亲肤"}])
    assert len(client.get("/api/video-projects", params={"brand": "木屿"}).json()) == 1
    assert len(client.get("/api/video-projects", params={"q": "亲肤"}).json()) == 1
    assert len(client.get("/api/video-projects", params={"status": "active"}).json()) == 2
    assert client.get("/api/video-projects", params={"status": "bad"}).status_code == 400
    assert client.get("/api/video-projects/summary").json()["draft"] == 2
