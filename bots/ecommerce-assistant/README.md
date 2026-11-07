# 电商助手 Bot

配合电商工作台使用：查经营、商品问题、安装工单、客户和询盘（顾客信息打码），只能写备注。

安装步骤见上一级的 [README.md](../README.md)。能用哪些工具以本目录 `config.yaml` 里 `tools.include` 为准，工具说明见 `docs/CONTRACT-mcp.md`。

## 不开 HTTP 时

也可以让 Hermes 用 stdio 方式拉起工具（一般不用）：

```yaml
mcp_servers:
  hermes-workbench:
    # 写虚拟环境里 workbench-mcp 的完整路径，例如 D:\工作台\server\.venv\Scripts\workbench-mcp.exe
    command: workbench-mcp
    args: ["--stdio"]
```
