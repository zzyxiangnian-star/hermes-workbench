# 四个助手 Bot 怎么装

| 目录 | 助手 | 建议的 Bot 名 | 能写什么 |
|---|---|---|---|
| `ecommerce-assistant` | 电商助手 | bot-ecommerce | 商品问题、安装工单、询盘的备注 |
| `brand-assistant` | 品牌助手 | bot-brand | 新建稿件草稿 |
| `design-assistant` | 设计助手 | bot-design | 给需求单交候选稿 |
| `video-assistant` | 视频助手 | bot-video | 新建分镜脚本、给分镜交配音和画面 |

每个目录里有 `SOUL.md`（人设和规矩）和 `config.yaml`（配置片段）。改状态、审核、发布、定稿都只能人在工作台里点，助手做不到。

## 步骤

1. 先启动工作台后端（双击 `server\scripts\start.bat`，监听 `127.0.0.1:8000`）。
2. 在 Hermes 的“机器人”里新建，从 default 克隆（模型和 Key 沿用 default），名字用上表建议的。
3. 把 `SOUL.md` 复制进这个 Bot 的目录（`<Hermes 数据目录>\profiles\<Bot 名>\`），覆盖原来的。
4. 打开这个 Bot 目录里的 `config.yaml`，把助手目录里 `config.yaml` 的**每一段**合并进去：`mcp_servers`、`agent`、`auxiliary`、`curator`、`skills`，视频助手还有 `tts`。已有同名段落时，只改片段里写到的那几项。
5. 重开这个 Bot 的会话，问一句和它工作相关的话（例如电商助手问“现在有哪些商品问题”），应能答出工作台里的数据。

## 设计、视频助手

- 生图用 Hermes 自带的 `image_generate`（默认 FAL，要 `FAL_KEY`），也可以换 Hermes 的其他生图插件。用哪家生图服务还在定。
- 配音用 Hermes 自带的 `text_to_speech`（默认 Edge TTS，免费），视频助手的配置里已经设成中文女声 `zh-CN-XiaoxiaoNeural`，男声可改 `zh-CN-YunxiNeural`。
- 生成的图片和配音存在 Hermes 数据目录下（例如 `cache\scratch`、`cache\audio`），工作台只从 `WB_AI_IMAGE_DIRS`（默认 Hermes 数据目录）读取。
- 在 Hermes 里确认这两个 Bot 的“生图”“配音”“看图”工具是开着的。

工具列表见 `docs\CONTRACT-mcp.md`。
