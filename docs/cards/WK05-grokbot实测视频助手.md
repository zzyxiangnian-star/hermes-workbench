# WK05 在 grokbot 的电脑上实测“视频助手”Bot

> 在 Hermes 里打开 grokbot 的对话，把下面全文发给它。沿用 WK01 的环境：`/workspace/hermes-k01/`（hermes-agent）和独立的 `HERMES_HOME=/workspace/hermes-k01/hermes-test`，不碰 `~/.hermes`。可以和 WK04 一起做（同一个后端）。

## 背景
工作台后端新加了“视频”页和 5 个 MCP 工具：列项目、看项目、新建分镜脚本、给某一镜交配音或画面、在素材库里找图。视频助手用 Hermes 自带的 `text_to_speech` 配音（默认 Edge TTS，免费不用 Key），再用 `wb_add_shot_media` 交回。配方在 `bots/video-assistant/`。

## 要做的事
1. 更新代码：`cd /workspace/hermes-workbench && git pull`，记录 `git log --oneline -1`（应包含 C10）。
2. 启动后端（演示数据，同 WK04 第 2 步；`workbench-demo --db /workspace/wk05.db`，`WB_ASSET_DIR=/workspace/wk05-assets`，`WB_AI_IMAGE_DIRS=/workspace/hermes-k01/hermes-test`）。`curl -s 127.0.0.1:8000/api/video-projects/summary` 应有 1 个 draft、1 个 approved。
3. 在 Hermes 里新建机器人“视频助手”，从 default 克隆，按 `bots/video-assistant/README.md` 放 SOUL.md、合并 config.yaml。确认工具里有 `text_to_speech`（没有就记录打开“配音”工具集的步骤并打开）。
4. 开视频助手的新会话，依次问，每项记“通过 / 不通过 + 现象 + 调用了哪个工具”：
   1. “给星年 1.5 匹空调写一条 20 秒的抖音口播分镜” → 应先查 `wb_get_product_card`，用 `wb_check_compliance` 检查口播，给出分镜表。
   2. “可以，存到工作台” → `wb_create_video_project`；`GET /api/video-projects/{id}` 看作者是“视频助手”、状态 draft。
   3. “给每一镜配音” → 每镜先 `text_to_speech` 再 `wb_add_shot_media`（slot=voice）。**把 `text_to_speech` 返回的 `file_path` 原样记下来**（看是不是在 `HERMES_HOME` 下面）。之后 `GET /api/video-projects/{id}` 每镜应有 voice，`length` 按配音变了。
   4. “最后一镜用素材库里的星年 Logo” → `wb_search_library` 再 `wb_add_shot_media`（asset_id）。
   5. “帮我送审” / “把木屿那条通过” → 应说做不到、请人在工作台操作。
   6. 在后端用 `curl -X POST .../submit -H 'content-type: application/json' -d '{}'` 送审后，再让它“给第 1 镜换个配音” → 应被拒（已送审不能改）。
5. 下载“木屿夏凉被”的初剪包：`curl -o pack.zip 127.0.0.1:8000/api/video-projects/{id}/package`，`unzip -l pack.zip` 贴进报告，`字幕.srt` 内容贴进报告。
6. 截图：Bot 的工具列表（hermes-workbench 的 9 个工具和 text_to_speech）、第 4.3、4.5 的对话。

## 交回
`/workspace/hermes-workbench/WK05-报告.md`：命令和报错、第 4 步逐项结果、`text_to_speech` 返回原文、初剪包文件列表和字幕、Hermes 日志里和 MCP 相关的报错原文、截图。

## 不要做
- 不改 hermes-workbench 和 hermes-agent 的代码，不提交、不推送；只记现象。
- 不要把 Key 或 launch ticket 写进报告、截图。只用演示数据。
- 不用真人声音克隆。
