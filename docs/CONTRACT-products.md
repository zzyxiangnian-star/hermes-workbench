# 商品接口约定

给 Antigravity 接「商品」页用。后端只听 `127.0.0.1:8000`，所有路径以 `/api` 开头，请求和响应都是 JSON。浏览器来源放行 `http://localhost` 和 `http://127.0.0.1`（端口不限），以及 Origin 为 `null` 的 Hermes 桌面版（界面从 `file://` 打开）。还要放行别的来源时，设置环境变量 `WB_ALLOWED_ORIGINS`，多个地址用逗号分隔。其他来源不返回 `Access-Control-Allow-Origin`。

金额是数字，时间是 UTC，形如 `2026-11-05T08:35:55.973510+00:00`。下面的例子来自本机导入两张样表后的真实返回，时间会随运行变化。

出错时 HTTP 状态是 4xx/5xx，正文一律是：

```json
{ "error": { "code": "shop_not_found", "message": "店铺不存在" } }
```

## 店铺

`POST /api/shops`

```json
{ "platform": "tmall", "name": "星年天猫旗舰店", "brand": "星年" }
```

`platform` 只能是 `tmall`、`jd`、`pdd`、`douyin`。`201`：

```json
{ "id": 1, "platform": "tmall", "name": "星年天猫旗舰店", "brand": "星年" }
```

平台不对时 `422`：

```json
{ "error": { "code": "validation_error", "message": "平台必须是 tmall、jd、pdd 或 douyin" } }
```

`GET /api/shops` 返回数组，按 id 升序：

```json
[
  { "id": 1, "platform": "tmall", "name": "星年天猫旗舰店", "brand": "星年" },
  { "id": 2, "platform": "jd", "name": "星年京东旗舰店", "brand": "星年" }
]
```

## 商品

`GET /api/products?shop_id=&brand=&q=&has_issue=&issue_level=&page=&page_size=`

- `shop_id`：店铺 id
- `brand`：店铺品牌，全字匹配
- `q`：在标题、商品编码、货号里做包含匹配
- `has_issue`：`true` 只留有未处理问题的商品，`false` 只留没有的
- `issue_level`：`must` / `warn`，只留有该级别未处理问题的商品（W03 后加）
- `page` 从 1 开始，默认 1；`page_size` 默认 20，最大 100

`GET /api/products?shop_id=1&q=TM-SN-011&has_issue=true&page=1&page_size=5`

```json
{
  "items": [
    {
      "id": 11,
      "shop_id": 1,
      "shop_name": "星年天猫旗舰店",
      "platform": "tmall",
      "brand": "星年",
      "sku": "TM-SN-011",
      "product_code": "SN-011",
      "title": "星年纯色袜子三双装",
      "price": 189.0,
      "floor_price": 199.0,
      "stock": 40,
      "activity": "春季上新",
      "updated_at": "2026-11-05T08:35:55.973510+00:00",
      "open_issue_count": 1
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 5
}
```

`open_issue_count` 是该商品当前 `open` 的问题数，左栏和列表上的徽标可以用它。`floor_price`、`product_code`、`activity` 可以是 `null`。

## 问题

`GET /api/issues?status=&level=&shop_id=&product_id=`

参数都可省略（`product_id` 是 W03 后加的，抽屉直接用它）。`status` 是 `open` / `resolved` / `ignored`，`level` 是 `must` / `warn`。不传 `status` 时三种都返回。按发现时间从新到旧。

`GET /api/issues?status=open&level=must&shop_id=1` 的第一条：

```json
{
  "id": 1,
  "product_id": 11,
  "rule_id": 1,
  "rule_kind": "below_floor",
  "level": "must",
  "message": "售价 189 低于底价 199",
  "status": "open",
  "found_at": "2026-11-05T08:35:56.004278+00:00",
  "resolved_at": null,
  "note": null,
  "shop_id": 1,
  "shop_name": "星年天猫旗舰店",
  "sku": "TM-SN-011",
  "product_code": "SN-011",
  "title": "星年纯色袜子三双装"
}
```

同一接口里，库存和跨店价差的原文是：

- `库存 3 低于最低库存 10`
- `货号 SN-019 在星年天猫旗舰店售价 100，在星年京东旗舰店售价 120，价差 20% 超过 5%`

状态不合法时 `400`：

```json
{ "error": { "code": "invalid_status", "message": "状态必须是 open、resolved 或 ignored" } }
```

`PATCH /api/issues/{id}` 改状态和备注，字段都可以不传。备注传空字符串会清空。

```json
{ "status": "ignored", "note": "先核对活动价" }
```

```json
{
  "id": 5,
  "product_id": 27,
  "rule_id": 1,
  "rule_kind": "below_floor",
  "level": "must",
  "message": "售价 88 低于底价 90",
  "status": "open",
  "found_at": "2026-11-05T08:35:56.004278+00:00",
  "resolved_at": null,
  "note": "先核对活动价",
  "shop_id": 1,
  "shop_name": "星年天猫旗舰店",
  "sku": "TM-SN-T01",
  "product_code": "SN-T01",
  "title": "星年帆布腰带"
}
```

改成 `resolved` 时带上 `resolved_at`；改回 `open` 或 `ignored` 时 `resolved_at` 变为 `null`。找不到时：

```json
{ "error": { "code": "issue_not_found", "message": "问题不存在" } }
```

检查规则时：同一商品、同一规则已经有 `open` 的问题就不另建；标成 `ignored` 且问题还在，也不另建。问题不再成立（包括原先 `ignored` 的）会自动改成 `resolved`。若人工标成 `resolved` 但数据仍然违规，下次检查会新开一条。

`GET /api/issues/summary?shop_id=` 给左栏徽标和商品页顶部汇总。每个店铺都在，没有问题的 `open_count` 是 0。W03 后加了三项：`must_open`、`warn_open`、`products_with_open`（涉及商品数），这三项会按 `shop_id` 筛选；`shops` 和 `total_open` 始终是全局的。

导入 `samples/products-tmall.xlsx` 和 `samples/products-jd.csv` 之后：

```json
{
  "shops": [
    {
      "shop_id": 1,
      "name": "星年天猫旗舰店",
      "platform": "tmall",
      "brand": "星年",
      "open_count": 14
    },
    {
      "shop_id": 2,
      "name": "星年京东旗舰店",
      "platform": "jd",
      "brand": "星年",
      "open_count": 6
    }
  ],
  "total_open": 20,
  "must_open": 6,
  "warn_open": 14,
  "products_with_open": 18
}
```

## 规则

第一次启动写入四条，之后不覆盖已有规则。

`GET /api/rules`

```json
[
  { "id": 1, "kind": "below_floor", "name": "售价低于底价", "params": {}, "level": "must", "enabled": true },
  { "id": 2, "kind": "cross_shop_gap", "name": "跨店价差过大", "params": { "max_gap_pct": 5 }, "level": "warn", "enabled": true },
  { "id": 3, "kind": "low_stock", "name": "库存过低", "params": { "min_stock": 10 }, "level": "warn", "enabled": true },
  { "id": 4, "kind": "missing_activity", "name": "未报名指定活动", "params": { "required_activity": null }, "level": "warn", "enabled": true }
]
```

| kind | 何时命中 | params |
|---|---|---|
| `below_floor` | 售价低于底价。底价为空不算 | 无 |
| `cross_shop_gap` | 同一货号在不同店铺的最低价和最高价之差，超过最低价的百分比。等于上限不算 | `max_gap_pct`，默认 5 |
| `low_stock` | 库存小于最低库存。等于不算 | `min_stock`，默认 10 |
| `missing_activity` | `required_activity` 非空，且把活动按 `,` `，` `、` `/` 拆开后不包含这个名字 | `required_activity`，默认空，空着时这条不命中 |

`PATCH /api/rules/{id}` 只改 `params` 和 `enabled`。`params` 按该规则的字段整份提交，缺的键用默认值。

```json
{ "params": { "min_stock": 10 }, "enabled": true }
```

```json
{ "id": 3, "kind": "low_stock", "name": "库存过低", "params": { "min_stock": 10 }, "level": "warn", "enabled": true }
```

`POST /api/rules/run` 跑全部启用的规则。导入成功后也会自动跑。样表导入后再手动跑一次：

```json
{ "rules_run": 4, "opened": 0, "updated": 0, "resolved": 0, "open_remaining": 20 }
```

`opened` 是新建条数，`updated` 是原问题还在、但提示文字变了，`resolved` 是这次自动关掉的条数。

## 导入

`POST /api/import/products`，`multipart/form-data`：

- `file`：`.xlsx` 或 `.csv`
- `shop_id`：店铺 id
- `mapping`：可选，JSON 字符串，报表列名 → 字段名

不传 `mapping` 时按常见中文列名识别，规则在 `server/app/importer.py` 的 `FIELD_ALIASES`。样表用的就是这套：天猫是「商品编码、货号、标题、售价、底价、库存、活动」，京东是「SKU、商品货号、商品名称、价格、底价、可售库存、活动名称」。

字段名只有：`sku`、`product_code`、`title`、`price`、`floor_price`、`stock`、`activity`。其中商品编码、标题、售价、库存必须能对上列，否则整份文件 `400`，不产生导入记录。传了 `mapping` 的列按映射来，其余列仍自动识别。

按 `(shop_id, sku)` 更新或新建。表格里没出现的商品不会删除。整行都空的跳过。坏行记行号（含表头，第一条数据是第 2 行），不中断其他行。

天猫样表的返回：

```json
{
  "id": 1,
  "file_name": "products-tmall.xlsx",
  "shop_id": 1,
  "kind": "products",
  "rows_ok": 28,
  "rows_failed": 2,
  "errors": [
    { "row": 30, "reason": "缺少商品编码" },
    { "row": 31, "reason": "售价不是数字" }
  ],
  "created_at": "2026-11-05T08:35:55.993762+00:00",
  "rules": { "rules_run": 4, "opened": 10, "updated": 0, "resolved": 0, "open_remaining": 10 }
}
```

店铺不存在是 `404`，`code` 为 `shop_not_found`。文件不是 xlsx/csv 是 `400`，`code` 为 `unsupported_file`。

`kind` 用来区分导入类型：`products`、`metrics`、`ad_spend`。商品导入固定是 `products`。

`GET /api/import/runs` 按 id 从新到旧。列表里的 `rules` 是 `null`（检查结果只在当次导入响应里）。

```json
{
  "id": 2,
  "file_name": "products-jd.csv",
  "shop_id": 2,
  "kind": "products",
  "rows_ok": 28,
  "rows_failed": 2,
  "errors": [
    { "row": 30, "reason": "缺少商品编码" },
    { "row": 31, "reason": "库存不是整数" }
  ],
  "created_at": "2026-11-05T08:35:56.064450+00:00",
  "rules": null
}
```

## 报表文件夹（C06）

`GET /api/import/folder` → `{"enabled": true, "path": "D:\\工作台报表", "exists": true}`。没设 `WB_IMPORT_DIR` 时 `enabled` 是 `false`。

`POST /api/import/folder/scan` 立即扫一遍（不等 10 秒的稳定期）。没配置时 400 `import_dir_not_configured`，文件夹不存在 400 `import_dir_missing`。

```json
{"path": "D:\\工作台报表", "imported": 3, "failed": 1, "files": [
  {"shop": "星年天猫旗舰店", "file": "商品1105.xlsx", "kind": "products", "ok": true, "rows_ok": 28, "rows_failed": 2, "reason": null},
  {"shop": "没有这个店", "file": "a.csv", "kind": null, "ok": false, "rows_ok": 0, "rows_failed": 0, "reason": "工作台里没有叫“没有这个店”的店铺，请先在商品页新建，或把文件夹改成店铺名"}]}
```

每个文件导入后照常写 `import_runs`，商品表导完自动查商品规则，投放表导完自动查投放规则。

## 健康检查

`GET /api/health`

```json
{ "status": "ok" }
```
