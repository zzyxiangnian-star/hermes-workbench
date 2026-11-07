# W10 经营页 报告

由 Claude 直接写（用户在 WK08 后让我来改），没走 Antigravity。

## 做了什么
- `plugin/src/api/overview.ts`：总览、趋势、投放列表、投放提醒、投放规则、日报、经营/投放导入。
- `plugin/src/api/alert-count.ts`：左栏“经营”徽标 = 未处理投放提醒总数（`/api/alerts/summary.total_open`），60 秒刷新；`WorkbenchPane` 已订阅。
  - 卡里写的是“必须处理”数，但汇总接口没有分级别，所以用总数，和商品页口径一致。
- `pages/overview/OverviewPage.tsx`：店铺、日期筛选（默认最晚有数据的一天，可“回到最新一天”）；8 张指标卡（和前一天比，跌用 amber，ROI/转化率跌超 20% 用 destructive，每张 7 天小折线，点卡片切下面趋势图）；趋势图（销售额/订单/访客/投放花费/ROI，7/30 天，最高点数值，悬停看当天）；投放计划表（按花费倒序，有未处理提醒的计划前面一个 amber 圆点）；无数据时 EmptyState 带导入按钮。
- `Sparkline.tsx`：手画 SVG，单一 `--ui-accent` 色，null 断线不按 0 画。
- `AlertDrawer.tsx`：未处理提醒（备注、标为已处理、忽略二次确认）+ 投放规则（ROI 阈值、日上限按“计划名 金额”逐行写、花费突增 %，保存、立即检查）。
- `ReportDialog.tsx`：日报原文 + 复制，由人发群。
- `ImportDialog` 加了 `kinds`，经营页只给“经营 / 投放”两种。

## 顺手改的后端（两处）
1. `GET /api/overview/trend` 加可选 `date`（结束日）。不然选了旧日期，小折线和趋势图仍停在最新一天。
2. 投放规则只对最近 7 天开提醒和自动转已处理。原来每次检查都扫全部历史，预览里把 ROI 阈值改成 1 一下开出 30 条旧提醒。窗口外已有的提醒保持原状。
- 两处都补了测试，后端 88 个测试全过；`CONTRACT-overview.md` 已同步。

## 检查
- `npm run build`、`node build.mjs` 通过；`plugin.js` 里没有 react-dom、createPortal、`--ui-error`。
- 预览 + 演示数据走查（Playwright）：全部店铺→天猫，销售额 208,219.98→76,698.11；选 11-01 后卡片、表格、趋势都跟着变；切“订单 / 7 天”；标已处理后列表 3→2；改规则保存并立即检查；导入 `server/samples/ad-spend-tmall.xlsx` 成功 120 行、失败 2 行；日报复制成功。控制台无报错。
- 截图：`W10/w10-overview-light.png`、`w10-overview-dark.png`、`w10-alerts.png`、`w10-narrow.png`。

## 借鉴
- Tremor（Apache-2.0）KPI 卡排布，只看样式，没引包。Plausible（AGPL）只看指标卡和大图联动的思路，没拷代码。

## 还要实机测（grokbot）
- 经营页在 Hermes 里走一遍，加上 WK08 没测到的：后端断开横幅 + 点“重试”恢复。
