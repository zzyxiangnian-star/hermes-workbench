# 电商助手 Bot

配合“工作台”插件的电商工作台使用。Bot 通过 MCP 读取工作台后端的数据，只能查和写备注。

## 文件

- `SOUL.md`：Bot 的人设和规矩，复制为该 Bot 的 SOUL.md。
- `config.yaml`：要合并进该 Bot `config.yaml` 的片段（MCP 地址、关掉的工具集）。

## 安装

1. 启动工作台后端：在 `server/` 目录 `pip install -e .` 后运行 `workbench-api`（监听 `127.0.0.1:8000`）。
2. 在 Hermes 里新建机器人“电商助手”，从 default 克隆。
3. 把 `SOUL.md` 放进这个 Bot 的目录，把 `config.yaml` 里的 `mcp_servers` 和 `agent.disabled_toolsets` 合并进它的 `config.yaml`。
4. 重开这个 Bot 的会话，问“现在有哪些商品问题”，应当调用 `wb_list_product_issues`。

## 工具

见 [docs/CONTRACT-mcp.md](../../docs/CONTRACT-mcp.md)。

## 不开 HTTP 时

也可以让 Hermes 用 stdio 方式拉起工具：

```yaml
mcp_servers:
  hermes-workbench:
    # workbench-mcp 是 pip install -e server 装上的命令；Windows 上写它在虚拟环境 Scripts 里的完整路径
    command: workbench-mcp
    args: ["--stdio"]
```

日常用 HTTP 方式，和工作台页面看到的是同一份数据。
