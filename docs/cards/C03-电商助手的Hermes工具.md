# C03 电商助手：给 Hermes 用的 MCP 工具 + Bot 配方

> 发给 Cursor。在 `F:\工作台开发\hermes-workbench` 工作，先 `git pull`。只动 `server/`、新建的 `bots/`、`docs/`。提交作者照旧用 `-c user.name="Cursor"`；**推之前先 `git pull --rebase`**，不要再产生 “Merge branch 'main'” 这种合并提交。

## C02 审查结论
C02 通过：29 项测试我这边也全过；Alembic 从空库建表正常，还处理了 C01 旧库补盖章，很周到；`Origin: null` 放行、活动拆分、推送地址只从环境变量读、`dry_run` 都对。唯一的小问题是那条合并提交，以后用 rebase。

## 背景
方案里“工作台功能为主，Bot 为辅”：每个工作台配一个助手 Bot。电商助手要能在 Hermes 对话里回答“今天哪些商品有问题”“昨天 ROI 怎么样”“帮我写一下今天的日报点评”，数据都来自我们的后端。
Hermes 通过 MCP 调工具。所以这张卡做：后端提供一组 MCP 工具，再写一个电商助手的 Bot 配方，用户在 Hermes 里新建 Bot 时可以照着配。

## 1. MCP 服务（server/app/mcp_server.py）
- 用官方 Python SDK `mcp`（MIT）的 FastMCP 写，挂在同一个 FastAPI 进程的 `/mcp` 路径（Streamable HTTP）；另外提供 `python -m app.mcp_server --stdio` 给本地调试。
- 工具直接调用现有的查询函数，不走 HTTP 绕一圈。返回中文、结构化的 JSON。
- 工具清单（名字照用）：
  | 工具 | 做什么 |
  |---|---|
  | `wb_list_product_issues` | 按状态、级别、店铺、关键词列商品问题，默认只列 open，最多 50 条 |
  | `wb_get_product` | 按 id 或 SKU 或货号查商品详情和它的问题 |
  | `wb_get_overview` | 某天（默认昨天）的经营总览和环比，可按店铺、品牌 |
  | `wb_get_trend` | 某指标最近 N 天的序列 |
  | `wb_list_alerts` | 投放提醒列表 |
  | `wb_get_daily_report` | 某天的日报（JSON + Markdown） |
  | `wb_add_note` | 给某条商品问题或投放提醒**追加**备注（前面自动加“[电商助手] ”），不能改状态 |
- **AI 不能做的**：改问题状态、改规则、导入、发送日报、改任何价格。这些都不做成工具。在报告里列出这条边界。
- 工具的描述（description）写清楚什么时候用、参数含义，用中文，Hermes 的模型靠它选工具。

## 2. 电商助手 Bot 配方（bots/ecommerce-assistant/）
```
bots/ecommerce-assistant/
  SOUL.md          ← 人设：电商运营助手；先查数据再回答、数字必须来自工具、标明日期和店铺；只能写备注和建议，处理和改价必须由人在工作台里做
  config.yaml      ← 只开用得到的内置工具集（file、memory、clarify 之类，**不开 terminal、browser**），MCP 指向 http://127.0.0.1:8000/mcp
  README.md        ← 怎么在 Hermes 里用：新建 Bot 时填哪些、把 MCP 地址加到哪里
```
config.yaml 的写法以 Hermes 源码为准：看 `F:\Hermes改造\hermes-agent` 里 `hermes_cli/config.py` 的 `mcp_servers` 和 `platform_toolsets` 是怎么写的（Hermes 改造实测过：**profile 的 mcp.json 运行时不读，MCP 必须写进 config.yaml**）。不确定的字段写进报告，不要猜。

## 3. 测试（必须）
- 每个工具至少一个用例：用 FastMCP 的内存客户端调用，检查返回内容。
- `wb_add_note` 只追加、不改状态；对不存在的 id 返回清楚的中文错误。
- 列一个测试确认没有任何能改状态、改规则、改价格的工具（扫工具清单）。
- 原有 29 项继续通过。

## 参考项目
- [modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk)（MIT）：FastMCP、Streamable HTTP 挂进 FastAPI 的写法。
- [mcp-cn-commerce](https://github.com/TonyWang-hub/mcp-cn-commerce)（MIT）：工具命名、只读边界、描述文字的写法；第二期接真实平台时它的工具会和我们的并排出现，所以我们的统一加 `wb_` 前缀避免撞名。
- 拷了代码就记进根目录 `THIRD_PARTY.md`。

## 交回
- 推到 main（先 `git pull --rebase`），提交信息以 `C03:` 开头。
- `docs/CONTRACT-mcp.md`：每个工具的参数和返回示例。
- `docs/reports/C03-report.md`：pytest 输出；用 MCP Inspector 或 stdio 调用每个工具的一次实际输出；Bot 配方里不确定的字段。

## 不要做
- 不动 `plugin/`。
- 不打开、不操作 Hermes 窗口（真机里让 Bot 调工具由 grokbot 测）。
- 不写任何 Key。
