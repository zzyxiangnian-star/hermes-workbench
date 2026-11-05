# 电商助手 MCP 工具约定（C03）

- 服务名：`hermes-workbench`
- HTTP：随后端一起启动，`http://127.0.0.1:8000/mcp`（Streamable HTTP，无状态，JSON 响应）。只接受 Host 为 `127.0.0.1` / `localhost` 的请求，其他 Host 返回 421。
- stdio：`workbench-mcp --stdio`（等同 `python -m app.mcp_server --stdio`），读同一个数据库。
- 出错时工具返回 `isError: true`，文字是中文原因（例如“找不到这个商品”）。
- 日期一律 `YYYY-MM-DD`；金额是数字；比率是小数（0.05 = 5%）。

## 工具

| 工具 | 参数 | 返回 | 对应接口 |
|---|---|---|---|
| `wb_list_product_issues` | `status`=open（open/resolved/ignored）、`level`（must/warn）、`shop_id`、`limit`=20（最多 50） | `{total, returned, items: IssueOut[]}` | `GET /api/issues` |
| `wb_get_product` | `product_id` 或 `sku` 或 `product_code`（至少一个） | `{items: [商品 + issues: IssueOut[]]}`，最多 10 个 | — |
| `wb_get_overview` | `date`（默认有数据的最近一天）、`shop_id`、`brand` | 同 `GET /api/overview` | `GET /api/overview` |
| `wb_get_trend` | `metric`（必填）、`days`=30（1–366）、`shop_id` | 同 `GET /api/overview/trend` | `GET /api/overview/trend` |
| `wb_list_alerts` | `status`=open、`level`、`shop_id`、`limit`=20（最多 50） | `{total, returned, items: AlertOut[]}` | `GET /api/alerts` |
| `wb_get_daily_report` | `date`（默认昨天，北京时间） | 同 `GET /api/reports/daily` | `GET /api/reports/daily` |
| `wb_add_note` | `issue_id`、`note`（1–500 字） | 更新后的 `IssueOut` | — |

`IssueOut`、`AlertOut`、总览、趋势的字段见 [CONTRACT-products.md](CONTRACT-products.md) 和 [CONTRACT-overview.md](CONTRACT-overview.md)。

## `wb_add_note` 的规矩

- 备注前面自动加 `[电商助手] `，接在原备注下一行，不覆盖。
- 不改 `status`，不改 `resolved_at`。多传的参数（例如 `status`）不起作用。

## 故意不做成工具的

改问题或提醒的状态、改规则和投放规则、导入表格、发送日报、改价。这些都由人在工作台里操作。测试 `test_tool_list_is_read_only_plus_note` 会在有人加了这类工具时失败。
