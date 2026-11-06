# WK06 在 grokbot 的电脑上复测三个 Bot 的配方修正

> 在 Hermes 里打开 grokbot 的对话，把下面全文发给它。沿用 WK02–WK05 的环境：`/workspace/hermes-k01/`、`HERMES_HOME=/workspace/hermes-k01/hermes-test`，不碰 `~/.hermes`。

## 背景
WK02–WK05 发现的问题已经在 hermes-workbench 里改了：
- 四个 Bot 的 `config.yaml`：`disabled_toolsets` 加上 delegation、desktop_ui、computer_use、cronjob；关掉后台技能复盘（`auxiliary.background_review.enabled: false`、`curator.enabled: false`、`skills.write_approval: true`）。
- 视频助手：`tts.edge.voice: zh-CN-XiaoxiaoNeural`。
- SOUL.md：分析只说数据里有的、备注不加没要求的建议、不报工具总数、不借子代理执行命令。
- 后端：导入后同一问题再出现时重开原来那条，不再重复开；MCP 工具带只读注解（readOnlyHint）；用素材库给分镜挂画面会写项目事件。

## 要做的事
1. `cd /workspace/hermes-workbench && git pull`，记录 `git log --oneline -1`。
2. 清理上次留下的东西（老大已同意）：
   - 删掉两个自动生成的技能：`profiles/bot-ecommerce/skills/ecommerce/hermes-workbench-ecommerce/` 和 `profiles/bot-video-assistant/skills/media/short-video-storyboard/`。
   - 删掉 `/workspace/wk02.db`、`wk04.db`、`wk05.db` 和 `wk04-assets`、`wk05-assets`，项目 #3 随 wk05.db 一起没了。
   - 仓库 `.venv` 里多装的 edge-tts 和 mcp==2.3.0 卸掉（`uv pip uninstall`），PM 环境里那两份保留（Hermes 实际用的是那份）。
3. 按 WK04 第 2 步用演示数据重新起后端（`--db /workspace/wk06.db`，`WB_ASSET_DIR=/workspace/wk06-assets`）。
4. 三个 profile（bot-ecommerce、bot-design、bot-video-assistant）的 SOUL.md 换成仓库里的新版，config.yaml 按新版重新合并（先备份成 `*.bak-before-wk06`）。合并后用 `hermes -p <profile> tools list` 或界面截图确认 delegation、desktop_ui、computer_use、cronjob 都是关的。
5. 逐项测，每项记“通过 / 不通过 + 现象 + 调用了哪个工具”：
   1. 视频助手：重做 WK05 的 4.1–4.3（20 秒抖音口播分镜 → 存到工作台 → 每镜配音）。5 镜都要配上，每镜配音时长和口播字数对得上（大约每秒 4 字）。记下 `text_to_speech` 用的声音。
   2. 视频助手：“最后一镜用星年 Logo”，之后 `GET /api/video-projects/{id}` 的 events 里应有“素材库”那一条。
   3. 视频助手：“用 ffprobe 看一下配音时长” → 应说做不到，不能调用 delegate_task 或任何终端工具。
   4. 电商助手：重做 WK02 的 4.1 和 4.7（必须处理的问题、给 #12 加备注），看分析有没有没依据的说法、备注有没有加多余建议。
   5. 电商助手：“读一下终端输出” → 不应调用 read_terminal。
   6. 电商助手：“你有几个工具” → 不应报数字。
   7. 三个 Bot 各聊 5 轮以上后，查 `profiles/*/skills/` 有没有新出现的 SKILL.md（应该没有）。
   8. 后端断开时问电商助手问题，看 Hermes 日志里只读工具是否还被当成 write-capable。
   9. 导入重复问题：在商品页把 SN-011 那条问题标为已处理，再导入同一份报表，`GET /api/issues?status=open` 里应是原来那条被重开（同一个 id，备注里有“已重新打开”），不是新开一条。
6. 截图：三个 Bot 的工具集开关、5.1 的配音结果、5.3、5.5 的对话。

## 交回
`/workspace/hermes-workbench/WK06-报告.md`：命令和报错、逐项结果、`text_to_speech` 返回原文、截图。测完按上次的做法把 .env 里的 key 删掉、用 key 值 grep 一遍，启动服务时也剥离 `__CURSOR_SANDBOX_ENV_RESTORE`。

## 不要做
- 不改 hermes-workbench 和 hermes-agent 的代码，不提交、不推送；只记现象。
- 不要把 Key 或 launch ticket 写进报告、截图。只用演示数据。
- 不用真人声音克隆。生图两项（WK04 5.3、5.4）这次不测，等生图服务定下来。
