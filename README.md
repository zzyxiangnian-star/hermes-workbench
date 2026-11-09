# hermes-workbench

装进 Hermes 桌面版的“工作台”插件：左上角“会话 | 机器人 | 工作台”标签，第一版包含电商、品牌活动两个工作台。

## 安装（任选一种）

1. **让 Hermes 自己装**：在 Hermes 对话里说
   “帮我安装这个插件并启用：`hermes plugins install zzyxiangnian-star/hermes-workbench --enable --yes-deps`，装好后启用它的 Desktop 部分”。
2. **在 Hermes 里点**：Capabilities → Plugins → Install from Git，填 `zzyxiangnian-star/hermes-workbench`，勾上 Agent 和 Desktop。
   也可以在浏览器地址栏打开 `hermes://plugin/install?repo=zzyxiangnian-star/hermes-workbench&enable=1`。
3. **下载安装包**：从 `releases/` 下载最新的 `工作台-<版本>-<日期>.zip`，解压后双击 `安装.bat`（需要 Python 3.11+）。

装完从托盘完全退出 Hermes 再打开，进“工作台”点“启动工作台”。详细说明、数据位置、升级和常见问题见 [docs/交付说明.md](docs/交付说明.md)。

### 给 Hermes 看的安装步骤

1. `hermes plugins install zzyxiangnian-star/hermes-workbench --enable --yes-deps`（已装过加 `--force`，或用 `hermes plugins update hermes-workbench`）。
2. 提醒用户在 Capabilities → Plugins 里把“工作台”的 Desktop 开关打开，然后从托盘完全退出 Hermes 再打开。
3. 用 `workbench_backend` 工具（`{"action": "demo"}` 看效果，`{"action": "start"}` 用正式数据）或 `hermes workbench start --wait` 启动后端。第一次要联网装依赖，几分钟。
4. 规矩：不登录电商平台、不改价、不自动给顾客发消息；只写草稿和备注，审核和发布由人做。

- 方案：https://claude.ai/artifact/U2LDv6JTx2GPgfMddu3eSQ
- 分工与流程：docs/分工.md
- 任务卡：docs/cards/；交回报告：docs/reports/
