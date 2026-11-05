# C03 完成报告：电商助手的 Hermes 工具

做的人：Claude（用户让 Claude 自己写，没有交给 Cursor）。

## 做了什么

- `server/app/mcp_server.py`：7 个 MCP 工具（6 个只读 + `wb_add_note`），用官方 Python SDK `mcp`（1.x，FastMCP）。工具直接复用已有接口的查询函数，结果和工作台页面一致。
- `server/app/main.py`：把 MCP 挂在 `/mcp`，生命周期里启动它的会话管理；版本号 0.3.0。
- `server/pyproject.toml`：加依赖 `mcp>=1.12,<2`（2.x 改了接口名，先锁 1.x），加命令 `workbench-mcp`。
- `bots/ecommerce-assistant/`：`SOUL.md`、`config.yaml` 片段（MCP 地址 + 关掉 terminal/browser/code_execution/file）、`README.md`。
- `docs/CONTRACT-mcp.md`：工具约定。
- 安全：只认本机 Host（防 DNS 重绑定），外来 Host 返回 421；没有改状态、改规则、导入、发送、改价的工具。

## 自测

- `pytest`：36 个全过（原来 29 个 + 新增 7 个）。新增覆盖每个工具、`wb_add_note` 追加和不改状态、非本机 Host 被拒、工具清单里没有写操作。
- 用 `mcp` 官方客户端实际连了一次：HTTP（`uvicorn` 起在本机，完整 initialize → list_tools → call_tool）和 stdio（`python -m app.mcp_server --stdio`）都能列出 7 个工具并调用成功。

## 没做 / 待实机验证

- 没有在真实 Hermes 里装 Bot 测试：按分工交给 grokbot（WK02）。要确认的点：Bot 的 `config.yaml` 里 `mcp_servers` 能连上、`agent.disabled_toolsets` 生效、对话里能调用 `wb_*` 工具。
- 没有拷贝第三方代码，THIRD_PARTY.md 不用改；新依赖 `mcp` 是 MIT 许可。
