---
name: workbench
description: 工作台插件（电商 / 品牌活动）的启动、排错和使用规矩。用户提到“工作台”、工作台连不上、要看演示数据、要升级工作台时加载。
---

# 工作台

工作台是 Hermes 里的一个插件：左上角“会话 | 机器人 | 工作台”点“工作台”进入。
界面需要本机的工作台后端（http://127.0.0.1:8000）才有数据。

## 启动和排错

用 `workbench_backend` 工具，不要自己拼命令：

| 用户说 | 调用 |
|---|---|
| 启动工作台 / 工作台连不上 | `{"action": "status"}`，没在运行就 `{"action": "start"}` |
| 想先看看效果、要演示数据 | `{"action": "demo"}`（假数据，不碰正式数据库） |
| 关掉工作台后端 | `{"action": "stop"}` |

- 第一次启动要联网装依赖，几分钟。返回 `installing` 就告诉用户“正在准备，第一次要几分钟”，过一会儿再查 `status`。
- `failed` 时把 `message` 原样告诉用户，日志在返回的 `log` 路径里，可以读最后几十行找原因。
- 端口 8000 被占用：请用户关掉占用它的程序（以前用 start.bat / demo.bat 开的黑窗口也算），再 start。
- 启动好后让用户在工作台页面点“重试”。

命令行等价：`hermes workbench status|start|demo|stop|where`。

## 数据在哪

都在 Hermes 数据目录下的 `workbench/`（`hermes workbench where` 能查到）：
`data/workbench.db` 正式数据库，`data/assets/` 素材，`data/backups/` 每天 12:30 的自动备份，
`settings.env` 设置（报表文件夹、早报推送地址、备份位置等，一行一个 KEY=VALUE，改完 stop 再 start）。
升级或重装插件不会碰这些文件。

## 升级

`hermes plugins update hermes-workbench`，然后让用户完全退出 Hermes（托盘里也退出）再打开，再 start 一次后端。

## 规矩（必须遵守）

- 不登录任何电商平台，不改价、不改出价、不暂停投放、不报名活动、不代发内容。
- 不自动给顾客发任何消息。跟进话术、预约通知由人复制后自己发。
- 只写草稿和备注；送审、审核、发布、定稿、完工由人点。
- 不要把 `settings.env` 里的 webhook 地址等机密发到对话或群里。
