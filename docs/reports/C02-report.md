# C02 报告

后端仍在 `server/`。经营、投放和日报的接口在 `docs/CONTRACT-overview.md`。商品接口里 CORS、活动名拆分和 `import_runs.kind` 已同步到 `docs/CONTRACT-products.md`。

没有拷参考项目的代码，所以没有 `THIRD_PARTY.md`。

这台电脑是 Python 3.11.9。测试在 3.11.9 上跑完。

## pytest

在 `server/` 执行 `python -m pytest -v --tb=no`：

```text
============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-9.1.1, pluggy-1.7.0 -- C:\Users\30882\AppData\Local\Programs\Python\Python311\python.exe
cachedir: .pytest_cache
rootdir: F:\工作台开发\hermes-workbench\server
configfile: pyproject.toml
testpaths: tests
plugins: anyio-4.15.1
collecting ... collected 29 items

tests/test_ad_rules.py::test_three_ad_rules_hit_miss_dedupe_and_resolve PASSED [  3%]
tests/test_ad_rules.py::test_ad_rule_summary_counts_open_alerts PASSED   [  6%]
tests/test_alembic.py::test_alembic_upgrade_head_creates_all_tables PASSED [ 10%]
tests/test_alembic.py::test_extra_allowed_origins PASSED                 [ 13%]
tests/test_api.py::test_health_rules_and_cors PASSED                     [ 17%]
tests/test_api.py::test_pagination_filters_and_patch PASSED              [ 20%]
tests/test_api.py::test_error_shape_and_rule_patch PASSED                [ 24%]
tests/test_import.py::test_samples_import_and_keep_bad_rows PASSED       [ 27%]
tests/test_import.py::test_alias_detection_and_explicit_mapping PASSED   [ 31%]
tests/test_import.py::test_bad_row_does_not_stop_import PASSED           [ 34%]
tests/test_import.py::test_unknown_shop_and_unsupported_file_do_not_create_a_run PASSED [ 37%]
tests/test_import.py::test_reimport_updates_same_sku PASSED              [ 41%]
tests/test_metrics_import.py::test_sample_metrics_and_ad_spend_keep_bad_rows PASSED [ 44%]
tests/test_metrics_import.py::test_metrics_and_ad_aliases_and_mapping PASSED [ 48%]
tests/test_metrics_import.py::test_bad_metric_row_does_not_stop_the_rest PASSED [ 51%]
tests/test_metrics_import.py::test_reimport_updates_same_day PASSED      [ 55%]
tests/test_overview.py::test_overview_compares_with_previous_day PASSED  [ 58%]
tests/test_overview.py::test_overview_roi_is_null_when_spend_is_zero PASSED [ 62%]
tests/test_overview.py::test_trend_and_ad_spend_list PASSED              [ 65%]
tests/test_reports.py::test_daily_report_snapshot PASSED                 [ 68%]
tests/test_reports.py::test_send_requires_webhook_and_dry_run_does_not_post PASSED [ 72%]
tests/test_reports.py::test_scheduler_stays_off_in_tests_and_can_start PASSED [ 75%]
tests/test_rules.py::test_below_floor_hit_miss_and_resolve PASSED        [ 79%]
tests/test_rules.py::test_low_stock_hit_and_miss PASSED                  [ 82%]
tests/test_rules.py::test_cross_shop_gap_hit_miss_and_resolve PASSED     [ 86%]
tests/test_rules.py::test_missing_activity_hit_miss_and_no_duplicate PASSED [ 89%]
tests/test_rules.py::test_missing_activity_matches_any_listed_name PASSED [ 93%]
tests/test_rules.py::test_ignored_issue_is_not_reopened_until_it_clears PASSED [ 96%]
tests/test_rules.py::test_zero_price_gap_is_reported PASSED              [100%]

============================= 29 passed in 12.97s =============================
```

C01 原有的 14 项仍在里面。新增的覆盖两张样表、三条投放规则的命中和去重、环比、花费为 0 时 ROI 为 null、日报快照、未配置推送地址、dry_run 不发请求、`Origin: null`、以及空库 `alembic upgrade head`。

## 导入样表后的 /overview

新建「星年天猫旗舰店」，导入两张样表。经营表 30 行成功、2 行失败（第 32 行缺少日期，第 33 行访客不是整数）。投放表 120 行成功、2 行失败（第 122 行缺少日期，第 123 行花费不是数字），当次新建 2 条提醒。

`GET /api/overview?date=2026-11-04&shop_id=1`：

```json
{
  "date": "2026-11-04",
  "compare_date": "2026-11-03",
  "shop_id": 1,
  "brand": null,
  "open_alerts": 2,
  "metrics": {
    "visitors": { "value": 1200, "previous": 1000, "change": 0.2 },
    "orders": { "value": 60, "previous": 40, "change": 0.5 },
    "sales_amount": { "value": 12000.0, "previous": 8000.0, "change": 0.5 },
    "conversion_rate": { "value": 0.05, "previous": 0.04, "change": 0.25 },
    "avg_order_value": { "value": 200.0, "previous": 200.0, "change": 0.0 },
    "ad_spend": { "value": 1300.0, "previous": 900.0, "change": 0.4444 },
    "ad_gmv": { "value": 2750.0, "previous": 2800.0, "change": -0.0179 },
    "roi": { "value": 2.1154, "previous": 3.1111, "change": -0.3201 }
  }
}
```

## 导入样表后的 /reports/daily

`GET /api/reports/daily?date=2026-11-04`：

```json
{
  "date": "2026-11-04",
  "markdown": "# 经营日报 2026-11-04\n\n## 总览\n- 访客：1200，昨日 1000，环比 +20%\n- 订单：60，昨日 40，环比 +50%\n- 销售额：12000，昨日 8000，环比 +50%\n- 转化率：5%，昨日 4%，环比 +25%\n- 客单价：200，昨日 200，环比 持平\n- 投放花费：1300，昨日 900，环比 +44.44%\n- 投放 GMV：2750，昨日 2800，环比 -1.79%\n- 投放 ROI：2.1154，昨日 3.1111，环比 -32.01%\n\n当天未处理投放提醒 2 条。\n\n## 异常店铺\n- 星年天猫旗舰店（tmall）：2 条未处理投放提醒\n\n## 商品问题\n未处理商品问题 0 条。\n\n## 投放提醒\n- 万相台·爆发计划 11-04 花费 400，高于前 7 天平均 100 的 150%\n- 万相台·双11预热 11-04 ROI 1.3，低于 2\n",
  "overview": {
    "date": "2026-11-04",
    "compare_date": "2026-11-03",
    "shop_id": null,
    "brand": null,
    "open_alerts": 2,
    "metrics": {
      "visitors": { "value": 1200, "previous": 1000, "change": 0.2 },
      "orders": { "value": 60, "previous": 40, "change": 0.5 },
      "sales_amount": { "value": 12000.0, "previous": 8000.0, "change": 0.5 },
      "conversion_rate": { "value": 0.05, "previous": 0.04, "change": 0.25 },
      "avg_order_value": { "value": 200.0, "previous": 200.0, "change": 0.0 },
      "ad_spend": { "value": 1300.0, "previous": 900.0, "change": 0.4444 },
      "ad_gmv": { "value": 2750.0, "previous": 2800.0, "change": -0.0179 },
      "roi": { "value": 2.1154, "previous": 3.1111, "change": -0.3201 }
    }
  },
  "abnormal_shops": [
    { "shop_id": 1, "name": "星年天猫旗舰店", "platform": "tmall", "brand": "星年", "open_count": 2 }
  ],
  "open_issue_count": 0,
  "alerts": [
    {
      "id": 2,
      "kind": "spend_spike",
      "level": "warn",
      "shop_id": 1,
      "shop_name": "星年天猫旗舰店",
      "tool": "万相台",
      "campaign": "爆发计划",
      "date": "2026-11-04",
      "message": "万相台·爆发计划 11-04 花费 400，高于前 7 天平均 100 的 150%",
      "status": "open",
      "found_at": "2026-11-05T13:26:49.312868+00:00",
      "resolved_at": null,
      "note": null
    },
    {
      "id": 1,
      "kind": "roi_below",
      "level": "warn",
      "shop_id": 1,
      "shop_name": "星年天猫旗舰店",
      "tool": "万相台",
      "campaign": "双11预热",
      "date": "2026-11-04",
      "message": "万相台·双11预热 11-04 ROI 1.3，低于 2",
      "status": "open",
      "found_at": "2026-11-05T13:26:49.306867+00:00",
      "resolved_at": null,
      "note": null
    }
  ]
}
```

## 参考项目

- 启航电商 ERP（AGPL）：只看了「定时检查然后推送」的组织方式。任务是先跑规则，再生成日报，配了地址才发。没有拷代码。
- mcp-cn-commerce（MIT）：经营和投放沿用 visitors、orders、spend、gmv、clicks、impressions、campaign 这类字段名，方便以后接平台。没有拷文件。
- Superset（Apache-2.0）：趋势用按日的点列，对比用本期、上期和变化率。没有拷代码。

## 取舍

- 提醒按「规则、店铺、工具、计划、日期」去重。`alerts` 因此多了 `tool`。两个工具用了同一个计划名时不会挤成一条。
- 花费突增看的是前 7 个自然日里实际导入过的记录。没有记录的日期不按 0 算进平均；这 7 天一条都没有就不报。等于阈值不算命中。
- 定时任务用上海时区，生成的是昨天的日报。早上 8:30 当天的数据通常还不完整。
- 异常店铺是当天有未处理投放提醒的店。商品问题数是当前全部 `open`，因为商品问题没有业务日期。
- 环比在上期为 0 时返回 `null`，不把除零变成错误。花费为 0 时 ROI 同样是 `null`。
- 经营导入不跑投放规则。投放导入会跑。商品导入仍只跑商品规则。
- 没配推送地址时，`send` 就算带了 `dry_run=true` 也返回 400。配了地址的 dry_run 只返回正文。
- 表结构改由 Alembic 管，C01 的表是第一个迁移。本地如果还有旧的 `create_all` 库、又没有 `alembic_version`，启动时会先标到 `c01` 再升级，避免把已有表再建一遍。
- 推送地址只读环境变量，没有写进代码、样表或这份报告。
