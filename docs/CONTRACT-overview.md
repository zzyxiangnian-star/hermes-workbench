# 经营、投放和日报

给「经营」页用。路径、错误格式、金额和时间格式与 `docs/CONTRACT-products.md` 相同。下面的数字来自导入 `samples/metrics-tmall.xlsx` 和 `samples/ad-spend-tmall.xlsx` 到「星年天猫旗舰店」之后的真实返回。`found_at` 会随运行变化。

比率和环比不入库。

- 转化率 = 订单 / 访客。访客为 0 时是 `null`。有访客但没有订单时是 `0`。
- 客单价 = 销售额 / 订单。订单为 0 时是 `null`。
- ROI = 投放 GMV / 投放花费。花费为 0 时是 `null`，接口不报错。
- `change` 是环比 `(本期 - 上期) / 上期`。上期为 0，或本期、上期有一个是 `null` 时，`change` 是 `null`。`0` 表示持平。
- 转化率和 ROI 保留 4 位小数。金额保留 2 位。环比保留 4 位。

`shop_id` 和 `brand` 可以一起用，同时满足才计入。店铺不存在是 `404`，`code` 为 `shop_not_found`。

## 导入

和商品导入一样：`xlsx` / `csv`，自动识别中文列名，可传 `mapping`，坏行记行号，不中断其他行，写入 `import_runs`。

`POST /api/import/metrics`

样表列名：日期、访客数、订单数、销售额、退款金额。退款可以空。也认「统计日期、UV、支付订单数、支付金额、成功退款金额」。

```json
{
  "id": 1,
  "file_name": "metrics-tmall.xlsx",
  "shop_id": 1,
  "kind": "metrics",
  "rows_ok": 30,
  "rows_failed": 2,
  "errors": [
    { "row": 32, "reason": "缺少日期" },
    { "row": 33, "reason": "访客不是整数" }
  ],
  "created_at": "2026-11-05T13:26:49.139808+00:00",
  "rules": null
}
```

经营导入不跑规则，`rules` 是 `null`。同一天同一店铺再次导入会覆盖。

`POST /api/import/ad-spend`

样表列名：日期、投放工具、计划名称、花费、成交金额、点击量、展现量。点击和展现可以空。工具只认：万相台、京准通、多多推广、巨量千川、其他。`拼多多推广` 记成多多推广，`千川` 记成巨量千川。

导入成功后自动跑投放规则。

```json
{
  "kind": "ad_spend",
  "rows_ok": 120,
  "rows_failed": 2,
  "errors": [
    { "row": 122, "reason": "缺少日期" },
    { "row": 123, "reason": "花费不是数字" }
  ],
  "rules": { "rules_run": 3, "opened": 2, "updated": 0, "resolved": 0, "open_remaining": 2 }
}
```

`rules` 的字段和商品规则的 `POST /api/rules/run` 一样，数的是投放提醒。

## 总览

`GET /api/overview?date=2026-11-04&shop_id=1`

不传 `date` 时用这批店铺里经营或投放数据的最晚一天。对比日固定是前一天。`open_alerts` 是这一天、当前筛选范围内 `open` 的投放提醒数。

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

多店时先把访客、订单、金额、花费加总，再算转化率、客单价和 ROI。

## 趋势

`GET /api/overview/trend?days=7&shop_id=1&metric=visitors`

`metric` 必须是 `visitors`、`orders`、`sales_amount`、`conversion_rate`、`avg_order_value`、`ad_spend`、`ad_gmv`、`roi`。不认识时 `400`，`code` 为 `invalid_metric`。`days` 默认 30，范围 1 到 366。序列含结束日。可传 `date` 指定结束日（和总览选的日期对齐）；不传时结束日是最晚有数据的那天。没有记录的日期，人数和金额是 0，比率是 `null`。

```json
{
  "metric": "visitors",
  "days": 7,
  "shop_id": 1,
  "points": [
    { "date": "2026-10-29", "value": 1000 },
    { "date": "2026-10-30", "value": 1000 },
    { "date": "2026-10-31", "value": 1000 },
    { "date": "2026-11-01", "value": 1000 },
    { "date": "2026-11-02", "value": 1000 },
    { "date": "2026-11-03", "value": 1000 },
    { "date": "2026-11-04", "value": 1200 }
  ]
}
```

## 投放列表

`GET /api/ad-spend?date_from=2026-11-04&date_to=2026-11-04&shop_id=1&tool=万相台`

按店铺、工具、计划汇总。`has_alert` 表示这个范围内有没有 `open` 的提醒。花费为 0 时 `roi` 是 `null`。

```json
[
  { "shop_id": 1, "shop_name": "星年天猫旗舰店", "tool": "万相台", "campaign": "双11预热", "spend": 500.0, "gmv": 650.0, "roi": 1.3, "has_alert": true },
  { "shop_id": 1, "shop_name": "星年天猫旗舰店", "tool": "万相台", "campaign": "爆发计划", "spend": 400.0, "gmv": 800.0, "roi": 2.0, "has_alert": true },
  { "shop_id": 1, "shop_name": "星年天猫旗舰店", "tool": "万相台", "campaign": "品牌词", "spend": 300.0, "gmv": 900.0, "roi": 3.0, "has_alert": false },
  { "shop_id": 1, "shop_name": "星年天猫旗舰店", "tool": "万相台", "campaign": "日常测款", "spend": 100.0, "gmv": 400.0, "roi": 4.0, "has_alert": false }
]
```

## 投放规则

第一次启动写入三条，之后不覆盖。

`GET /api/ad-rules`

```json
[
  { "id": 1, "kind": "roi_below", "name": "ROI 低于阈值", "params": { "min_roi": 2, "min_spend": 200 }, "level": "warn", "enabled": true },
  { "id": 2, "kind": "spend_over_cap", "name": "花费超过日上限", "params": { "daily_cap": {} }, "level": "must", "enabled": true },
  { "id": 3, "kind": "spend_spike", "name": "花费突然升高", "params": { "spike_pct": 150 }, "level": "warn", "enabled": true }
]
```

| kind | 何时命中 | params |
|---|---|---|
| `roi_below` | 当天 ROI 低于 `min_roi`，且花费达到 `min_spend`。等于不算。花费为 0 时没有 ROI，不算 | `min_roi` 默认 2，`min_spend` 默认 200 |
| `spend_over_cap` | 计划名在 `daily_cap` 里，且当天花费高于该上限。等于不算。没配置的计划不查 | `daily_cap` 默认 `{}`，键是计划名 |
| `spend_spike` | 当天花费高于前 7 个自然日平均花费的 `spike_pct`%。等于不算。这 7 天里没有记录就不报，缺的天不按 0 补 | `spike_pct` 默认 150 |

`PATCH /api/ad-rules/{id}` 只改 `params` 和 `enabled`，方式和商品规则一样。

`POST /api/ad-rules/run` 手动跑。只对最近 7 天（以投放表里最晚一天往前数，含当天）开提醒和自动转已处理；更早的提醒保持原状，改了阈值不会把旧数据翻出一堆提醒。去重和自动转已处理与商品问题相同：同一规则、店铺、工具、计划、日期已经有 `open` 的不另建；`ignored` 且问题还在也不另建；不再成立时（包括原先 `ignored` 的）改成 `resolved`。

样表在默认参数下会开两条：`万相台·双11预热 11-04 ROI 1.3，低于 2`，以及 `万相台·爆发计划 11-04 花费 400，高于前 7 天平均 100 的 150%`。

## 提醒

`GET /api/alerts?status=open&level=&shop_id=`

筛选和排序与 `/api/issues` 相同。`tool` 用来区分不同投放工具下的同名计划。

```json
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
```

`PATCH /api/alerts/{id}` 的正文和效果与 `PATCH /api/issues/{id}` 相同。找不到时：

```json
{ "error": { "code": "alert_not_found", "message": "提醒不存在" } }
```

`GET /api/alerts/summary` 与商品问题汇总同一形状，数的是 `open` 投放提醒。样表导入后：

```json
{
  "shops": [
    { "shop_id": 1, "name": "星年天猫旗舰店", "platform": "tmall", "brand": "星年", "open_count": 2 }
  ],
  "total_open": 2
}
```

## 日报

`GET /api/reports/daily?date=2026-11-04`

不传 `date` 时用上海时区的昨天。`overview` 是不按店铺筛选的总览。`abnormal_shops` 是当天有未处理投放提醒的店。`open_issue_count` 是当前全部未处理商品问题，商品问题没有业务日期。`alerts` 最多 5 条，先 `must` 后 `warn`，新的在前。`markdown` 是同一份内容排好的文本。

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

`POST /api/reports/daily/send?date=2026-11-04`

推送地址从 `WB_FEISHU_WEBHOOK`、`WB_WECOM_WEBHOOK` 读。两个都没有时 `400`：

```json
{ "error": { "code": "webhook_not_configured", "message": "没有配置推送地址" } }
```

`dry_run=true` 时仍要有地址，但只返回将要发送的正文，不发请求。飞书按文本消息发，企业微信按 markdown 发。两个都配置了就都发。推送失败是 `502`，`code` 为 `push_failed`，响应里不带地址。

定时任务在进程里用 APScheduler，每天 `WB_DAILY_AT`（默认 `08:30`，上海时区）先跑商品规则和投放规则，再生成昨天的日报。配了地址才发送。`WB_SCHEDULER=off` 关闭。
