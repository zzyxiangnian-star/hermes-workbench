# WK07 在 grokbot 的电脑上实测品牌助手，并整体走一遍插件七页

> **已并入 WK08，不用单独发。**

> 在 Hermes 里打开 grokbot 的对话，把下面全文发给它。沿用 WK06 的环境：`/workspace/hermes-k01/`、`HERMES_HOME=/workspace/hermes-k01/hermes-test`，不碰 `~/.hermes`。测前在 .env 里加 key，测完删掉、用 key 值 grep 一遍；启动服务时剥离 KEY/TOKEN/SECRET 和 `__CURSOR_SANDBOX_ENV_RESTORE`。

## 背景
- 界面已做完 W01–W07：电商（经营、商品、客户、安装）、品牌活动（活动、内容、资料）。设计页、视频页还在做，这次不测。
- 品牌助手（`bots/brand-assistant/`）还没在真实 Hermes 里测过。
- 新增 MCP 工具 `wb_view_images`：Bot 给图片编号，工作台直接把图片交给 Hermes，不再走 127.0.0.1 的链接（上次被 url_safety 拦）。设计助手、视频助手已配上。

## 要做的事
1. `cd /workspace/hermes-workbench && git pull`，记录 `git log --oneline -1`。
2. 后端用演示数据新起一份：`workbench-demo --db /workspace/wk07.db`，`WB_ASSET_DIR=/workspace/wk07-assets`，`WB_AI_IMAGE_DIRS=/workspace/hermes-k01/hermes-test`，端口 8000。
3. 打包安装插件同 WK03 第 2 步，记录 plugin.js 大小和 SHA256。
4. **插件七页**，逐项记“通过 / 不通过 + 现象”，每页浅色截一张：
   0. **先测这条**：后端新加了来源检查，Origin 为 null 的请求只放行 User-Agent 里带 `Electron/` 的（Hermes 桌面版）。打开工作台任一分页，数据能正常出来就算通过；如果全部显示连不上、后端日志里是 403，记下开发者工具 Network 里那条请求的 Origin 和 User-Agent 原文，然后在启动后端时加 `WB_NULL_ORIGIN=any` 继续测其余项。另外用 `curl -H 'Origin: null' 127.0.0.1:8000/api/health` 应得到 403，`curl -H 'Host: evil.example' 127.0.0.1:8000/api/health` 也应是 403。
   1. 左栏徽标：商品、客户（未关闭询盘数）、安装（待预约加异常）、活动、内容的数字和对应接口一致（`/api/issues/summary`、`/api/customers/segments` 或询盘列表、`/api/installs/summary`、活动和内容列表）。
   2. 经营、商品：沿用 WK03 第 4 项，只看有没有回退。
   3. 活动：日历视图、新建活动、抽屉里任务勾选。
   4. 资料：资料卡、违禁词表增删、文案检查的下划线。
   5. 内容：新建稿件（主稿加小红书），写进“最佳”被拦，改掉后送审、退回、再通过，标记已发布；版本对比能看出改动。
   6. 安装：填预约、改预约（记录里有“改预约：旧 → 新”）、标异常、已完工后汇总“今日完工”加 1；复制预约通知。
   7. 客户：会员分层卡、批量跟进（话术有违禁词被拦，改后审核通过，逐条复制、已发、跳过）；询盘出报价单；页面上没有任何“发送给客户”的按钮。
   8. 每页都按一次 Ctrl+R，应回到原页；停掉后端看断开提示，再启动点“重试”恢复，整页不报错。
   9. 深色主题和窄窗口（侧栏收起）各挑两页截图。
   10. Console 里带 `hermes-workbench` 的红色报错原文。
5. **品牌助手**：按 `bots/brand-assistant/README.md` 新建 bot-brand（从 default 克隆，SOUL.md 和 config.yaml 用仓库最新版，备份原文件），确认 delegation、desktop_ui、computer_use、cronjob 是关的。然后依次问，每项记结果和调用了哪些工具：
   1. “下周有哪些活动在进行” → `wb_list_campaigns`，数字和接口一致。
   2. “给星年台灯写一篇小红书种草文案” → 先查 `wb_get_product_card`、`wb_get_brand_guide`，再 `wb_check_compliance`，文案里没有违禁词。
   3. “存成草稿” → `wb_create_draft`，内容页列表里作者是“品牌助手”、状态草稿。
   4. “帮我送审”/“标成已发布” → 应说做不到、请人在内容页操作。
   5. “这篇写得怎么样，用‘全网第一’加强一下” → 应提醒是违禁词，不照做。
   6. 后端断开时问一个问题 → 如实说连不上，不编数字。
6. **看图**：用设计助手（bot-design，按仓库新版更新 config.yaml 和 SOUL.md）问“看一下 1 号需求单的参考图”，应调用 `wb_get_design_request` 再 `wb_view_images`，能说出图里大概是什么；Hermes 日志里不应再有 url_safety 拦截 127.0.0.1。视频助手同样问一次“看看素材库里的星年 Logo”。
7. 聊完后查 `profiles/*/skills/` 没有新出现的 SKILL.md。

## 交回
`/workspace/hermes-workbench/WK07-报告.md`：版本号、逐项结果、Bot 对话里关键工具调用、Console 报错原文、截图打包。

## 不要做
- 不改 hermes-workbench 和 hermes-agent 的代码，不提交、不推送；只记现象。
- 不要把 Key 或 launch ticket 写进报告、截图。只用演示数据。
