from app.demo import build


def test_demo_builds_a_lively_but_small_dataset(tmp_path, monkeypatch):
    monkeypatch.setenv("WB_SCHEDULER", "off")
    db = tmp_path / "demo.db"
    db.write_text("旧文件会被覆盖")
    summary = build(db)
    assert summary["店铺"] == 4
    assert 10 <= summary["未处理商品问题"] <= 30
    assert 1 <= summary["未处理投放提醒"] <= 5
    assert summary["活动"] == 3
    assert summary["稿件"] == 4
    assert 10 <= summary["安装工单"] <= 40
    assert 40 <= summary["客户"] <= 60
    assert summary["询盘"] == 3
    assert summary["设计需求单"] == 3
    assert summary["视频项目"] == 2
    assert (tmp_path / "demo-assets").is_dir()
    again = build(db)
    assert again == summary  # 固定随机种子，同一天重跑结果一样
