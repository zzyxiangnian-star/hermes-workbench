# WK04 在 grokbot 的电脑上实测“设计助手”（生图）Bot

> 在 Hermes 里打开 grokbot 的对话，把下面全文发给它。沿用 WK01 的环境：`/workspace/hermes-k01/`（hermes-agent）和独立的 `HERMES_HOME=/workspace/hermes-k01/hermes-test`，不碰 `~/.hermes`。

## 背景
工作台后端新加了“设计”页和 3 个 MCP 工具：列需求单、看需求单、把生成的图交成候选稿。设计助手用 Hermes 自带的 `image_generate` 出图，再用 `wb_add_design_candidate` 交回。配方在 `bots/design-assistant/`。单元测试已过，这次要确认在真实 Hermes 里：生图工具能用、它返回的 `image` 是什么样子、工作台能不能收下。

## 要做的事
1. 更新代码：`cd /workspace/hermes-workbench && git pull`，记录 `git log --oneline -1`（应包含 C09）。
2. 启动后端（演示数据）：
   ```
   cd /workspace/hermes-workbench/server
   . .venv/bin/activate && pip install -e .
   workbench-demo --db /workspace/wk04.db
   export WORKBENCH_DATABASE_URL=sqlite:////workspace/wk04.db WB_SCHEDULER=off
   export WB_ASSET_DIR=/workspace/wk04-assets WB_AI_IMAGE_DIRS=/workspace/hermes-k01/hermes-test
   workbench-api &
   ```
   `curl -s 127.0.0.1:8000/api/design-requests/summary` 应有 1 张待接单、1 张待评审。
3. 在 Hermes 里新建机器人“设计助手”，从 default 克隆，按 `bots/design-assistant/README.md` 放 SOUL.md、合并 config.yaml 片段。查一下这个 Bot 的工具里有没有 `image_generate`；没有的话，记录 Hermes 里打开“生图”工具集的步骤（设置界面在哪、或者 `hermes tools` 之类的命令），打开它。
4. 生图服务：如果环境里已有 FAL 或其他生图插件的 Key，就用它；**没有就不要去申请**，跳到第 6 步，只测不生图的部分，并在报告里写明。
5. 开设计助手的新会话，依次问，每项记“通过 / 不通过 + 现象 + 调用了哪个工具”：
   1. “现在有哪些设计需求没完成？” → `wb_list_design_requests`，和 `GET /api/design-requests?status=active` 一致。
   2. “看看电水壶详情页那张单” → `wb_get_design_request`，应提到尺寸 790x1200、文案、参考图；最好它还查了 `wb_get_product_card`、`wb_get_brand_guide`。
   3. “按这张单出两张初稿交上去” → 先 `image_generate`，再 `wb_add_design_candidate` 两次。**把 `image_generate` 返回的 `image` 原样记下来**（是 https 链接、本机路径还是 data 链接）。之后 `GET /api/design-requests/{id}` 应看到两张 `source=ai` 的候选稿、状态 reviewing；`GET /api/assets/{asset_id}/file` 能打开图。
   4. 如果第 3 步交图失败，记下工具返回的报错原文。
6. 不生图也要测的：
   1. “把空调主图的 B 稿定稿” → 它应说做不到、请人在工作台操作。
   2. “删掉那张参考图” → 同上。
   3. “用终端看看目录” → 应没有终端工具。
   4. 停掉后端再问一句 → 应说工作台后端没启动。
7. 截图：Bot 的工具列表（能看到 hermes-workbench 的 6 个工具和 image_generate）、第 5.3 和 6.1 的对话。

## 交回
`/workspace/hermes-workbench/WK04-报告.md`：命令和报错、第 5、6 步逐项结果、`image_generate` 返回的 `image` 原文（如果是带签名的链接，把签名参数打码）、打开生图工具集的步骤、Hermes 日志里和 MCP 相关的报错原文、截图。

## 不要做
- 不改 hermes-workbench 和 hermes-agent 的代码，不提交、不推送；只记现象。
- 不要把 Key 或 launch ticket 写进报告、截图。只用演示数据。
- 不生成真人肖像、商标、别家商品。
