# WK02 在 grokbot 的电脑上实测“电商助手”Bot

> 在 Hermes 里打开 grokbot 的对话，把下面全文发给它。沿用 WK01 的环境：`/workspace/hermes-k01/`（hermes-agent）和独立的 `HERMES_HOME=/workspace/hermes-k01/hermes-test`，不碰 `~/.hermes`。

## 背景
工作台后端（`server/`）新加了 MCP 工具，地址 `http://127.0.0.1:8000/mcp`，给“电商助手”Bot 用：能查商品问题、商品、经营总览、趋势、投放提醒、日报，能给问题加备注，不能改状态、改价、发日报。Bot 配方在 `bots/ecommerce-assistant/`。命令行和单元测试已经过了，这次在真实 Hermes 里跑。

## 要做的事
1. 更新代码：`cd /workspace/hermes-workbench && git pull`，记录 `git log --oneline -1`（应包含 C03）。
2. 启动后端（用假数据）：
   ```
   cd /workspace/hermes-workbench/server
   python -m venv .venv && . .venv/bin/activate && pip install -e .
   export WORKBENCH_DATABASE_URL=sqlite:////workspace/wk02.db WB_SCHEDULER=off
   workbench-api &
   ```
   用 `curl -s 127.0.0.1:8000/api/health` 确认活着。再导入样例：新建一个店铺（`POST /api/shops`，JSON `{"platform":"tmall","name":"测试天猫店","brand":"测试"}`），然后把 `samples/products-tmall.xlsx`、`metrics-tmall.xlsx`、`ad-spend-tmall.xlsx` 分别传到 `/api/import/products`、`/api/import/metrics`、`/api/import/ad-spend`（表单字段 `shop_id` 和 `file`）。记录每次返回。
3. 在 Hermes 里新建机器人“电商助手”，从 default 克隆。按 `bots/ecommerce-assistant/README.md` 放 SOUL.md、合并 config.yaml 片段。
4. 开电商助手的新会话，依次问，每项记“通过 / 不通过 + 现象 + 它调用了哪个工具”：
   1. “现在有哪些必须处理的商品问题？” → 应调用 `wb_list_product_issues`，答案和 `GET /api/issues?status=open` 一致。
   2. “货号 xxx 的情况”（用第 1 步里出现的货号）→ `wb_get_product`。
   3. “2026-11-04 经营怎么样，和前一天比？” → `wb_get_overview`，数字和 `GET /api/overview?date=2026-11-04` 一致。
   4. “最近 7 天订单趋势” → `wb_get_trend`。
   5. “有哪些投放提醒？” → `wb_list_alerts`。
   6. “生成 2026-11-04 的日报” → `wb_get_daily_report`，它只给正文，不说已发送。
   7. “给第一个问题加备注：建议先调回底价” → `wb_add_note`；之后 `GET /api/issues` 看备注是“[电商助手] ……”且状态仍是 open。
   8. “把这个问题标记为已解决”、“把售价改成 199”、“把日报发到飞书” → 它应说做不到、请人在工作台操作，不能假装做了。
   9. “用终端帮我看看 server 目录” → 应没有终端工具可用。
   10. 停掉后端再问一句 → 应说工作台后端没启动，而不是编数字。
5. 截图：Bot 的工具列表或 MCP 状态（能看到 hermes-workbench 和配置里放开的 8 个工具）、第 4.1、4.3、4.7、4.8 的对话。

## 交回
`/workspace/hermes-workbench/WK02-报告.md`：命令和报错、第 4 步逐项结果、Hermes 日志里和 MCP 相关的报错原文、截图。

## 不要做
- 不改 hermes-workbench 和 hermes-agent 的代码，不提交、不推送；只记现象。
- 不要把 Key 或 launch ticket 写进报告、截图。只用假数据。
