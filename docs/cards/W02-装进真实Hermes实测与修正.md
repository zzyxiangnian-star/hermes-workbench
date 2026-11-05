# W02 W01 修正 + 打包成 plugin.js 装进你电脑上的 Hermes 实测

> 发给 Antigravity 里的 Gemini。继续在 `F:\工作台开发\hermes-workbench` 工作，先 `git pull`。

## W01 审查结论（总指挥）
W01 通过。代码结构清楚，只用 Hermes 变量和 SDK 组件，路由不支持通配、SDK 没有读当前路径的接口这两点查得很准，处理也合理。截图里的行高、字号、徽标、截断提示都符合要求。
需要修正的地方：
1. **提交作者写成了 Claude**：W01 提交的作者是 `Claude <noreply@anthropic.com>`，这是从仓库历史抄的。以后用你自己的身份：在这个仓库里设 `git config user.name "Antigravity (Gemini)"`、`git config user.email "antigravity@local"`。W01 那条提交不用改历史。
2. **离开工作台后左栏仍然高亮**：`syncLocationFromPath` 遇到非工作台路径（比如切回某个对话）时什么都不做，左栏会一直高亮上次的分页。改成：解析不出工作台位置时把当前位置清空。
3. **去掉 `/workbench/*` 兜底路由**：`isContributedPath` 是严格相等，这条永远匹配不上，只会多出一条无用注册。
4. **路由要带标题**：Hermes 用路由的 `title` 当标签页标题（`apps/desktop/src/app/chat/route-tile.tsx` 第 54 行），没有就把路径转成英文标题。每条路由加 `title: '电商 · 商品'` 这种格式。
5. **多段路径要实测**：`RouteContribution` 的注释写着“One segment; no params”，`/workbench/ecommerce/products` 是三段。下面实测时重点看它能不能打开、刷新后还在不在、会不会被当成对话。不行就改成单段路径 `/wb-ecommerce-products`，`parsePath`/`toPath` 跟着改。
6. **代码挪进 `plugin/`**：按分工，界面代码放 `plugin/`，后端放 `server/`（Cursor 在做）。把 `src/`、`preview/`、`package.json`、`package-lock.json`、`tsconfig.json`、`vite.config.ts` 挪进 `plugin/`，`docs/` 留在根目录。

## 新任务：打包并装进真实 Hermes
### 1. 打包脚本 `plugin/build.mjs`
照 Hermes 改造里已经验证过的打包方式写（参考 `F:\Hermes改造\hermes-agent` 里 `bot-store/build-bots-plus.mjs`，如果你本地没有这个分支，用 `git fetch origin claude/project-thread-7hcvdn` 拿到后看）：
- esbuild，入口 `plugin/src/plugin.tsx`，输出 `plugin/dist/hermes-workbench/plugin.js`，`format: 'esm'`、`jsx: 'automatic'`、`target: 'es2022'`。
- `external: ['@hermes/plugin-sdk', 'react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom']`，其余依赖打进包里。
- Tailwind：照 `buildPluginCss()` 的做法，用 `@tailwindcss/node` 以 Hermes 的 `apps/desktop/src/styles.css` 为 `@reference`，只扫描 `plugin/src`，生成的 CSS 在插件启动时注入一个 `<style id="hermes-workbench-css">`（插件卸载时移除）。这样常见类和少量任意值类都能生效。Hermes 源码路径用环境变量 `HERMES_SRC` 传入，默认 `F:\Hermes改造\hermes-agent`。
- `package.json` 加 `"build:plugin": "node build.mjs"`。

### 2. 装进你电脑上的 Hermes
- 找到 `HERMES_HOME`（Windows 一般是 `%USERPROFILE%\.hermes`，以 Hermes 设置里显示的为准），把 `plugin.js` 放到 `HERMES_HOME\desktop-plugins\hermes-workbench\plugin.js`。
- 重启 Hermes，在“设置 → 插件”里找到它并打开。
- 不要改 Hermes 本体的任何文件，不要关掉别的插件。

### 3. 实测清单（报告里逐项写“通过 / 不通过 + 现象”）
1. 左上角出现“会话 | 机器人 | 工作台”，点“工作台”看到两个工作台和 8 个分页。
2. 点每个分页，主区域打开对应页面，标签页标题是“电商 · 商品”这种中文，而不是路径。
3. 打开某个分页后按 Ctrl+R 刷新，仍停在这一页。
4. 从工作台切回“会话”打开一个对话，再切回“工作台”：左栏不再高亮旧分页（第 2 条修正）；对话没有被工作台页面挡住。
5. 窗口拉窄到侧栏自动收起时，标签条和工作台面板还能用。
6. 浅色、深色主题各看一遍，颜色跟着 Hermes 变。
7. 在“设置 → 插件”关掉工作台插件：标签消失，Hermes 其他功能正常；再打开能恢复。
8. 打开开发者工具（Ctrl+Shift+I），抄下 Console 里所有和工作台有关的报错原文。

### 4. 补对比截图
W01 缺的并排对比图这次补上：同一窗口里“会话”标签和“工作台”标签各截一张，拼在一起，看行高、字号、图标、选中色是否一致；不一致的地方改掉再截。

## 参考项目
- Hermes 自己：`bot-store/build-bots-plus.mjs`（打包）、`apps/desktop/src/plugins/README.md`（外部插件放置位置）、`apps/desktop/src/app/chat/route-tile.tsx`（路由标题）。
- 这张卡不需要外部开源项目。

## 交回
- 推到 main，提交信息以 `W02:` 开头，作者用你自己的身份。
- `docs/reports/W02-report.md`：6 条修正各怎么改的；打包命令和输出文件大小；实测清单逐项结果、Console 报错原文；截图（工作台标签打开、分页页面、深色、窄窗口、和会话标签的对比图）。
- 不要把 `plugin/dist/` 提交进仓库（加进 .gitignore）。

## 不要做
- 不改 hermes-agent 仓库和 Hermes 安装目录里的任何文件（只往 `desktop-plugins` 里放我们的 plugin.js）。
- 不碰 `server/` 目录。
- 不改 `types.ts` 的字段。
