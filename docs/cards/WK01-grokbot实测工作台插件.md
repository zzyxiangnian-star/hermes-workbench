# WK01 在 grokbot 的电脑上打包并实测“工作台”插件

> 在 Hermes 里打开 grokbot 的对话，把下面全文发给它。实测、截图都由它在自己那台电脑上做；写代码或排查主要交给那台电脑上的 Antigravity，opencode 备用。
> 可以沿用 K01 的环境 `/workspace/hermes-k01/`（hermes-agent 已装好依赖），测试用独立的 `HERMES_HOME=/workspace/hermes-k01/hermes-test`，不碰 `~/.hermes`。

## 背景
我们在给一个电商客户做 Hermes 插件“工作台”：左上角变成“会话 | 机器人 | 工作台”，点“工作台”看到电商、品牌活动两个工作台，各 4 个分页（现在每页还是空状态）。代码在 https://github.com/zzyxiangnian-star/hermes-workbench 的 `plugin/` 目录，后端在 `server/`（这次不用）。界面代码由用户电脑上的 Antigravity 写，已在预览里看过，但**还没在真实 Hermes 里跑过**，这次由你来跑。

## 要做的事
1. 拉代码：`git clone --depth 1 https://github.com/zzyxiangnian-star/hermes-workbench /workspace/hermes-workbench`，记录 `git log --oneline -1`。
2. 打包：
   ```
   cd /workspace/hermes-workbench/plugin
   npm ci
   HERMES_SRC=/workspace/hermes-k01/hermes-agent node build.mjs
   ```
   应生成 `plugin/dist/hermes-workbench/plugin.js`。打包要用到 hermes-agent 自己的 node_modules（styles.css 里引用了 tailwindcss、tw-shimmer 等），如果报找不到模块，先在 hermes-agent 根目录 `npm install`。记录 plugin.js 大小和 SHA256。
3. 安装：复制到 `$HERMES_HOME/desktop-plugins/hermes-workbench/plugin.js`，重启 webapp（或 `apps/desktop` 下 `npm run dev`），用新的 launch ticket 在全新浏览器窗口打开。
4. 逐项检查，每项记“通过 / 不通过 + 现象”：
   1. 设置 → 插件里有“工作台”，打开它。
   2. 左上角出现“会话 | 机器人 | 工作台”；点“工作台”看到电商（经营、商品、客户、安装）、品牌活动（活动、内容、设计、资料），商品和客户右边有数字。
   3. 点每个分页，主区域打开对应页面（空状态写着这页以后做什么）；标签页标题是“电商 · 商品”这种中文，不是路径或英文。
   4. 在某个分页上刷新浏览器，仍停在这一页。**重点**：路径是 `/workbench/ecommerce/products` 这种三段式，Hermes 文档写着路由只支持一段，所以这条要仔细看：能不能打开、刷新后在不在、会不会被当成对话打开。
   5. 从工作台切回“会话”打开一个对话，再切回“工作台”：左栏不再高亮刚才的分页，对话也没有被工作台页面挡住。
   6. 窗口拉窄到侧栏自动收起，标签条和工作台面板还能用。
   7. 浅色、深色主题各看一遍，颜色跟着变。
   8. 设置 → 插件里关掉“工作台”：标签消失，其他功能正常；再打开能恢复。
   9. 开发者工具 Console 里所有红色报错，原文抄下来（特别是带 hermes-workbench、routes、panes 字样的）。
5. 截图：工作台标签打开（浅色）、深色、窄窗口、标签页标题；再把“会话”标签和“工作台”标签各截一张拼在一起，方便对比行高、字号、图标、选中色。

## 交回（写成报告给用户，用户转给总指挥）
`/workspace/hermes-workbench/WK01-报告.md`：每一步实际执行的命令和报错、plugin.js 大小和 SHA256、第 4 步逐项结果、Console 报错原文、截图。

## 不要做
- 不改 hermes-workbench 和 hermes-agent 的任何代码，不提交、不推送；发现问题只记现象，由总指挥安排修。
- 不需要任何 Key；不要把 launch ticket 写进报告或截图。
