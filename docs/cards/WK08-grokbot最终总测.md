# WK08 在 grokbot 的电脑上做试用前的最终总测（含原 WK07）

> W09 已审查通过；等 W09.1（分镜页右栏）交回后再发。原来的 WK07 已并进这张卡，不用单独发。沿用 WK06 的环境：`/workspace/hermes-k01/`、`HERMES_HOME=/workspace/hermes-k01/hermes-test`，不碰 `~/.hermes`。测前在 .env 里加 key，测完删掉、用 key 值 grep 一遍；启动服务时剥离 KEY/TOKEN/SECRET 和 `__CURSOR_SANDBOX_ENV_RESTORE`。

## 背景
九页界面全部做完。这次**按客户的方式安装**：用交付包，不用仓库目录，看说明书走不走得通；再九页界面、四个助手、看图、备份一次测完。

## 要做的事
1. `cd /workspace/hermes-workbench && git pull`，记录 `git log --oneline -1`。
2. **打交付包**：`cd plugin && npm ci && HERMES_SRC=/workspace/hermes-k01/hermes-agent node build.mjs`，回到根目录 `python tools/package.py`。解压到 `/workspace/交付测试/`（新目录）。
3. **只看包里的 `说明.md` 安装**（Linux 上用 `python -m venv .venv && .venv/bin/pip install -e .` 代替 start.bat，其余照做）：后端用 `workbench-demo --db /workspace/wk08.db` 的演示数据、`WB_ASSET_DIR=/workspace/wk08-assets`、`WB_BACKUP_DIR=/workspace/wk08-备份`；`plugin.js` 放进插件目录；四个 Bot 按包里 `bots/*/README.md` 重新配一遍（先备份原 profile）。记下说明书里**看不懂、步骤缺失或和实际不符**的每一处。
4. **先测来源检查**：打开工作台任一分页数据能出来；`curl -H 'Origin: null' 127.0.0.1:8000/api/health` 和 `curl -H 'Host: evil.example' 127.0.0.1:8000/api/health` 都是 403。工作台连不上、日志是 403 时，记下 Network 里那条请求的 Origin 和 User-Agent 原文，启动后端加 `WB_NULL_ORIGIN=any` 再继续。
   然后逐项记“通过 / 不通过 + 现象”：
   1. 设计页：需求单列表和左栏徽标；新建需求（尺寸写成 `800×800` 也能认）；上传候选稿 A/B、并排对比；在图上点一下加批注、标已解决；文案写“最佳”时定稿被拦，改掉后定稿；素材库筛选、改标签。批注栏在宽窗口下紧跟大图、正文不被裁。
   2. 视频页：项目列表；分镜编辑（加镜、改时长、删镜）；上传配音后时长按配音变；字幕下载（SRT）；送审、退回、通过；下载初剪包，`unzip -l` 贴进报告；上传成片后项目完成、成片出现在素材库。
   3. 设置里的“数据备份”：显示备份目录和快照，点“立即备份”后多一份；显示的版本号和 `/api/health` 一致。
   4. 设计助手：“看一下 1 号需求单的参考图和候选稿”（应调用 `wb_view_images`，能描述图）；“给 1 号单出一版”—— 没有生图 key 的话应如实说生图不可用，不编造。
   5. 视频助手：重做 WK06 的 5.1（分镜、存到工作台、配音），然后在视频页里看到配音、时长对得上。
   6. 九页每页按一次 Ctrl+R 都回到原页；后端停掉再起来，九页都能“重试”恢复；Console 里带 `hermes-workbench` 的红色报错原文。
   7. 深色主题下设计页、视频页各一张截图；窄窗口各一张。
5. **七页、品牌助手和看图**（原 WK07，用第 3 步装好的环境）：
   A. **插件七页**，逐项记“通过 / 不通过 + 现象”，每页浅色截一张：
   1. 左栏徽标：商品、客户（未关闭询盘数）、安装（待预约加异常）、活动、内容的数字和对应接口一致（`/api/issues/summary`、`/api/customers/segments` 或询盘列表、`/api/installs/summary`、活动和内容列表）。
   2. 经营、商品：筛选、问题抽屉、标已处理和“重新打开”、导入、规则，只看有没有回退。
   3. 活动：日历视图、新建活动、抽屉里任务勾选。
   4. 资料：资料卡、违禁词表增删、文案检查的下划线。
   5. 内容：新建稿件（主稿加小红书），写进“最佳”被拦，改掉后送审、退回、再通过，标记已发布；版本对比能看出改动。
   6. 安装：填预约、改预约（记录里有“改预约：旧 → 新”）、标异常、已完工后汇总“今日完工”加 1；复制预约通知。
   7. 客户：会员分层卡、批量跟进（话术有违禁词被拦，改后审核通过，逐条复制、已发、跳过）；询盘出报价单；页面上没有任何“发送给客户”的按钮。
   8. 每页都按一次 Ctrl+R，应回到原页；停掉后端看断开提示，再启动点“重试”恢复，整页不报错。
   9. 深色主题和窄窗口（侧栏收起）各挑两页截图。
   10. Console 里带 `hermes-workbench` 的红色报错原文。
   B. **品牌助手**（第 3 步已按交付包配好）：确认 delegation、desktop_ui、computer_use、cronjob 是关的。然后依次问，每项记结果和调用了哪些工具：
   1. “下周有哪些活动在进行” → `wb_list_campaigns`，数字和接口一致。
   2. “给星年台灯写一篇小红书种草文案” → 先查 `wb_get_product_card`、`wb_get_brand_guide`，再 `wb_check_compliance`，文案里没有违禁词。
   3. “存成草稿” → `wb_create_draft`，内容页列表里作者是“品牌助手”、状态草稿。
   4. “帮我送审”/“标成已发布” → 应说做不到、请人在内容页操作。
   5. “这篇写得怎么样，用‘全网第一’加强一下” → 应提醒是违禁词，不照做。
   6. 后端断开时问一个问题 → 如实说连不上，不编数字。
   C. **看图**：用设计助手问“看一下 1 号需求单的参考图”，应调用 `wb_get_design_request` 再 `wb_view_images`，能说出图里大概是什么；Hermes 日志里不应再有 url_safety 拦截 127.0.0.1。视频助手同样问一次“看看素材库里的星年 Logo”。
6. 查 `profiles/*/skills/` 没有新出现的 SKILL.md；`/workspace/wk08-备份/数据库/` 里有快照。

## 交回
`/workspace/hermes-workbench/WK08-报告.md`：版本号和 plugin.js 的 SHA256、说明书问题清单（逐条写在哪一节、哪里卡住）、逐项结果、Console 报错原文、截图打包。

## 不要做
- 不改 hermes-workbench 和 hermes-agent 的代码，不提交、不推送；只记现象。
- 不要把 Key 或 launch ticket 写进报告、截图。只用演示数据。
