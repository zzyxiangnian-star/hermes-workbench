# 视频助手 Bot

配合“工作台”插件的品牌活动工作台“视频”页使用：写分镜脚本、用 Hermes 的配音和生图工具给每镜配口播和画面，交回工作台。人审核脚本后下载初剪包（素材按镜号排好 + 字幕 + 时间线）到剪映里精修。

## 安装

和电商助手一样，见 [../ecommerce-assistant/README.md](../ecommerce-assistant/README.md)：Bot 名用“视频助手”，用这里的 `SOUL.md` 和 `config.yaml`。白名单 9 个工具；写操作只有新建脚本、给写脚本中的项目交配音和画面。

## 配音和生图

- 配音：Hermes 的 `text_to_speech`（`tts` 工具集），默认 Edge TTS，免费、不用 Key；文件存在 Hermes 目录的 `cache/audio` 下，工作台能直接读（`WB_AI_IMAGE_DIRS`，默认 `~/.hermes`）。
- 生图：同设计助手，见 [../design-assistant/README.md](../design-assistant/README.md)。
- 在 Hermes 里确认这个 Bot 的工具里打开了“配音”和“生图”。

工具见 [docs/CONTRACT-mcp.md](../../docs/CONTRACT-mcp.md)，视频页接口见 [docs/CONTRACT-video.md](../../docs/CONTRACT-video.md)。
