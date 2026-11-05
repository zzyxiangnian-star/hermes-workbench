# 品牌助手 Bot

配合“工作台”插件的品牌活动工作台使用。通过 MCP 读取活动、复盘、商品资料卡、品牌规范、稿件，用违禁词库检查文案，并能把文案存成新草稿（只能新建草稿）。

安装方法和电商助手一样，见 [../ecommerce-assistant/README.md](../ecommerce-assistant/README.md)，把 Bot 名改成“品牌助手”、用这里的 `SOUL.md` 和 `config.yaml`。两个 Bot 连同一个 MCP 服务，各自的 `config.yaml` 用 `tools.include` 只放开自己用的工具（品牌助手 10 个，唯一的写操作是新建草稿）。

工具见 [docs/CONTRACT-mcp.md](../../docs/CONTRACT-mcp.md)。
