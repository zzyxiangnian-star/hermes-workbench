# WK03 在 grokbot 的电脑上复测工作台插件（W02 单段路由 + W03 商品页）

> 在 Hermes 里打开 grokbot 的对话，把下面全文发给它。沿用 WK01 的环境：`/workspace/hermes-k01/`（hermes-agent）和 `HERMES_HOME=/workspace/hermes-k01/hermes-test`，不碰 `~/.hermes`。可以和 WK02 一起做，后端同一个。

## 背景
WK01 之后改了三处：页面路径从 `/workbench/电商/商品` 这种三段式改成单段 `/wb-ecommerce-products`；刷新时把路径记进 sessionStorage，插件加载后跳回去；电商的“商品”页接上了后端（列表、问题抽屉、导入、规则）。这次在真实 Hermes 里复测。

## 要做的事
1. `cd /workspace/hermes-workbench && git pull`，记录 `git log --oneline -1`。
2. 打包安装同 WK01：`cd plugin && npm ci && HERMES_SRC=/workspace/hermes-k01/hermes-agent node build.mjs`，复制 `plugin/dist/hermes-workbench/plugin.js` 到 `$HERMES_HOME/desktop-plugins/hermes-workbench/`，重启，记录 plugin.js 大小和 SHA256。
3. 后端：如果 WK02 的后端还在跑就直接用，否则照 WK02 第 2 步启动并导入 `samples/products-tmall.xlsx`（再建一个京东店导入 `samples/products-jd.csv`）。
4. 逐项记“通过 / 不通过 + 现象”：
   1. 8 个分页都能打开，地址是 `/wb-…` 单段，没有多出 `UNTITLED SESSION` 标签。
   2. **在“商品”页按 Ctrl+R**：几秒内回到商品页（可能先闪一下新对话）；在一个普通对话里按 Ctrl+R，不会被拉到工作台。
   3. 设置 → 插件里“工作台”有简介文字。
   4. 商品页：顶部“必须处理 / 提醒 / 涉及商品”数字；筛选、搜索、翻页；点一行打开抽屉，“标为已处理”加备注后汇总和左栏“商品”徽标一起变；“忽略”有确认框；导入京东样表显示成功和失败行；规则抽屉改最低库存、保存、立即检查。走完把改过的问题改回未处理。
   5. 停掉后端：商品页显示“没有连上工作台服务”，有“重试”和“更改地址”；再启动后端点“重试”恢复。
   6. 深色主题看一遍商品页和抽屉；窗口拉窄到侧栏收起后商品页还能用。
   7. 开发者工具 Console 里带 `hermes-workbench` 的红色报错原文。
5. 截图：商品页浅色、深色、抽屉、导入结果、连不上后端、刷新后回到商品页；再把“会话”列表和工作台左栏各截一张拼在一起对比。

## 交回
`/workspace/hermes-workbench/WK03-报告.md`：命令和报错、第 4 步逐项结果、Console 原文、截图。

## 不要做
- 不改代码，不提交、不推送；只记现象。
- 不把 Key、launch ticket 写进报告或截图。只用样例数据。
