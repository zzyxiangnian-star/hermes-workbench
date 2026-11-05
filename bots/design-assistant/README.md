# 设计助手（生图）Bot

配合“工作台”插件的品牌活动工作台“设计”页使用。读设计需求单，用 Hermes 自带的生图工具（`image_gen` 工具集里的 `image_generate`）出初稿，再通过 MCP 把图交回需求单当候选稿，由人评审、定稿。

## 安装

和电商助手一样，见 [../ecommerce-assistant/README.md](../ecommerce-assistant/README.md)：Bot 名用“设计助手”，用这里的 `SOUL.md` 和 `config.yaml`。白名单 6 个工具，唯一的写操作是交候选稿。

## 生图服务

Hermes 的 `image_generate` 默认走 FAL（要 `FAL_KEY`），也可以用 Hermes 的生图插件换成别的服务。客户在国内的话，FAL 的速度和合规要评估，可能要换国内的生图服务（这一项待定，见 docs/reports/C09-report.md）。在 Hermes 里确认这个 Bot 的工具里打开了“生图”。

## 图怎么交回工作台

`image_generate` 返回的 `image` 可能是：

- https 链接（FAL 等在线服务）：工作台后端去下载，只允许公网地址，最多 20 MB；
- 本机文件路径（生图插件存在 Hermes 目录里）：只认 `WB_AI_IMAGE_DIRS` 里的目录，默认 `~/.hermes`（或 `HERMES_HOME`）；
- `data:image/...;base64,...`。

只收 PNG、JPG、GIF、WebP；每张需求单每一轮 AI 最多交 8 张。

工具见 [docs/CONTRACT-mcp.md](../../docs/CONTRACT-mcp.md)，设计页接口见 [docs/CONTRACT-design.md](../../docs/CONTRACT-design.md)。
