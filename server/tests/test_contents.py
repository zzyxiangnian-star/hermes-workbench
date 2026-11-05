def _create(client, **extra):
    body = {
        "title": "双 11 电饭煲推荐",
        "brand": "星年",
        "kind": "article",
        "body": "第一段：IH 加热，米饭更香。\n第二段：24 小时预约。\n",
        "author": "小李",
        "variants": [
            {"platform": "xiaohongshu", "title": "打工人的电饭煲", "body": "姐妹们，这个电饭煲真香"},
            {"platform": "wechat", "body": "公众号长文"},
        ],
    }
    body.update(extra)
    response = client.post("/api/contents", json=body)
    assert response.status_code == 201, response.text
    return response.json()


def test_create_list_and_filter(client):
    campaign = client.post(
        "/api/campaigns", json={"name": "双 11", "brand": "星年", "start_date": "2026-11-01", "end_date": "2026-11-11"}
    ).json()
    content = _create(client, campaign_id=campaign["id"])
    assert content["status"] == "draft"
    assert content["version"] == 1
    assert content["platforms"] == ["xiaohongshu", "wechat"]
    assert content["campaign_name"] == "双 11"
    assert [v["version"] for v in content["versions"]] == [1]
    _create(client, title="别的稿件", variants=[{"platform": "douyin", "body": "口播脚本"}])

    assert len(client.get("/api/contents").json()) == 2
    assert [c["title"] for c in client.get("/api/contents", params={"platform": "wechat"}).json()] == ["双 11 电饭煲推荐"]
    assert len(client.get("/api/contents", params={"campaign_id": campaign["id"]}).json()) == 1
    assert len(client.get("/api/contents", params={"q": "口播"}).json()) == 1
    assert client.get("/api/contents", params={"status": "bad"}).status_code == 400

    bad = client.post("/api/contents", json={"title": "x", "brand": "y", "variants": [{"platform": "facebook"}]})
    assert bad.status_code == 422
    assert "wechat" in bad.json()["error"]["message"]
    dup = client.post(
        "/api/contents", json={"title": "x", "brand": "y", "variants": [{"platform": "jd"}, {"platform": "jd"}]}
    )
    assert dup.json()["error"]["code"] == "duplicate_platform"
    missing = client.post("/api/contents", json={"title": "x", "brand": "y", "campaign_id": 999})
    assert missing.status_code == 404


def test_edit_creates_versions_and_diff(client):
    content = _create(client)
    cid = content["id"]
    same = client.put(f"/api/contents/{cid}", json={"body": content["body"]}).json()
    assert same["version"] == 1

    edited = client.put(
        f"/api/contents/{cid}",
        json={
            "body": "第一段：IH 加热，米饭更软糯。\n第二段：24 小时预约。\n第三段：一年保修。\n",
            "variants": [{"platform": "xiaohongshu", "title": "打工人的电饭煲", "body": "姐妹们，这个电饭煲太香了"}],
            "note": "改卖点",
        },
    ).json()
    assert edited["version"] == 2
    assert edited["platforms"] == ["xiaohongshu"]
    assert edited["versions"][-1]["note"] == "改卖点"

    diff = client.get(f"/api/contents/{cid}/diff", params={"from_version": 1}).json()
    assert diff["to_version"] == 2
    ops = [(s["op"], s["text"]) for s in diff["segments"]]
    assert ("delete", "香") in ops
    assert ("insert", "软糯") in ops
    assert ("insert", "第三段：一年保修。\n") in ops
    assert "".join(t for op, t in ops if op != "insert") == content["body"]
    assert "".join(t for op, t in ops if op != "delete") == edited["body"]

    variant_diff = client.get(f"/api/contents/{cid}/diff", params={"from_version": 1, "platform": "wechat"}).json()
    assert variant_diff["segments"] == [{"op": "delete", "text": "公众号长文"}]

    old = client.get(f"/api/contents/{cid}/versions/1").json()
    assert old["snapshot"]["body"] == content["body"]
    assert client.get(f"/api/contents/{cid}/versions/9").status_code == 404


def test_review_flow_with_compliance_gate(client):
    content = _create(client, body="这是最佳电饭煲")
    cid = content["id"]
    report = client.get(f"/api/contents/{cid}/compliance").json()
    assert report["passed"] is False
    assert report["parts"][0]["platform"] is None
    blocked = client.post(f"/api/contents/{cid}/submit", json={"by": "小李"})
    assert blocked.status_code == 400
    assert blocked.json()["error"] == {"code": "compliance_failed", "message": "有必须修改的违禁词：最佳"}

    client.put(f"/api/contents/{cid}", json={"body": "这是很好的电饭煲，第一次用就爱上"})
    submitted = client.post(f"/api/contents/{cid}/submit", json={"by": "小李"})
    assert submitted.status_code == 200, submitted.text
    assert submitted.json()["status"] == "in_review"

    locked = client.put(f"/api/contents/{cid}", json={"body": "改一下"})
    assert locked.status_code == 409
    assert locked.json()["error"]["code"] == "content_locked"

    no_note = client.post(f"/api/contents/{cid}/reject", json={"by": "王经理"})
    assert no_note.json()["error"]["code"] == "note_required"
    rejected = client.post(f"/api/contents/{cid}/reject", json={"by": "王经理", "note": "开头太平"}).json()
    assert rejected["status"] == "rejected"
    assert rejected["comments"][-1]["body"] == "退回：开头太平"
    assert rejected["comments"][-1]["kind"] == "review"

    client.put(f"/api/contents/{cid}", json={"body": "开头换成用户故事：很好的电饭煲"})
    assert client.get(f"/api/contents/{cid}").json()["status"] == "draft"
    client.post(f"/api/contents/{cid}/submit", json={})
    approved = client.post(f"/api/contents/{cid}/approve", json={"by": "王经理"}).json()
    assert approved["status"] == "approved"
    assert approved["reviewer"] == "王经理"
    assert client.post(f"/api/contents/{cid}/approve", json={}).status_code == 409

    missing = client.post(f"/api/contents/{cid}/publish", json={"platform": "douyin"})
    assert missing.json()["error"]["code"] == "variant_not_found"
    published = client.post(
        f"/api/contents/{cid}/publish", json={"platform": "xiaohongshu", "url": "https://example.com/note/1"}
    ).json()
    assert published["status"] == "published"
    assert published["published_at"]
    assert next(v for v in published["variants"] if v["platform"] == "xiaohongshu")["published_url"] == "https://example.com/note/1"
    again = client.post(f"/api/contents/{cid}/publish", json={"platform": "wechat"}).json()
    assert again["published_at"] == published["published_at"]
    assert client.post(f"/api/contents/{cid}/withdraw", json={}).status_code == 409
    assert client.put(f"/api/contents/{cid}", json={"body": "x"}).status_code == 409


def test_withdraw_back_to_draft(client):
    content = _create(client)
    cid = content["id"]
    client.post(f"/api/contents/{cid}/submit", json={})
    withdrawn = client.post(f"/api/contents/{cid}/withdraw", json={"by": "小李"}).json()
    assert withdrawn["status"] == "draft"
    assert client.post(f"/api/contents/{cid}/withdraw", json={}).status_code == 409


def test_comments(client):
    content = _create(client)
    cid = content["id"]
    created = client.post(
        f"/api/contents/{cid}/comments",
        json={"body": "这句太长", "quote": "IH 加热", "start": 4, "end": 9, "author": "王经理", "platform": "xiaohongshu"},
    )
    assert created.status_code == 201, created.text
    comment = created.json()
    assert client.get(f"/api/contents/{cid}").json()["open_comments"] == 1
    assert client.post(f"/api/contents/{cid}/comments", json={"body": "x", "platform": "douyin"}).status_code == 400
    assert client.post(f"/api/contents/{cid}/comments", json={"body": "x", "start": 5, "end": 1}).status_code == 400
    assert client.post(f"/api/contents/{cid}/comments", json={"body": " "}).status_code == 422

    resolved = client.patch(f"/api/content-comments/{comment['id']}", json={"resolved": True}).json()
    assert resolved["resolved"] is True
    assert client.get(f"/api/contents/{cid}").json()["open_comments"] == 0
    assert client.delete(f"/api/content-comments/{comment['id']}").status_code == 204
    assert client.delete(f"/api/contents/{cid}").status_code == 204
    assert client.get(f"/api/contents/{cid}").status_code == 404
