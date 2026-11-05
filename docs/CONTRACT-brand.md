# 品牌活动：资料和活动（C04）

给品牌活动工作台的「活动」「资料」两页用。路径前缀 `/api`，错误格式、金额和时间格式与 `docs/CONTRACT-products.md` 相同。下面的例子来自导入 `samples/metrics-tmall.xlsx`、`samples/ad-spend-tmall.xlsx` 到「星年天猫旗舰店」之后的真实返回，时间戳会变。

「内容」页（稿件、一稿多平台、审稿）的接口在下一张卡（C05）做；这里的合规检查它会复用。

## 品牌规范

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/brand-guides` | 全部品牌规范，按品牌名排序 |
| GET | `/brand-guides/{brand}` | 没有时 404 `brand_guide_not_found` |
| PUT | `/brand-guides/{brand}` | 整体保存（没有就新建）。没传的字段清空 |

```json
PUT /api/brand-guides/星年  {"tone":"亲切、专业","colors":["#C8102E"],"fonts":["思源黑体"]}
→ {"id":1,"brand":"星年","tone":"亲切、专业","colors":["#C8102E"],"fonts":["思源黑体"],"logo_rules":null,"notes":null,"updated_at":"2026-11-05T13:47:43.950247+00:00"}
```

## 违禁词和合规检查

首次启动自带 26 个词（广告法极限词、功效夸大、诱导用语），客户可增删改。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/banned-words` | 全部词，按 id |
| POST | `/banned-words` | `{word, level=must, category=自定义, suggestion?}`；重复 409 `banned_word_exists` |
| PATCH | `/banned-words/{id}` | `level`、`category`、`suggestion`、`enabled` |
| DELETE | `/banned-words/{id}` | 204 |
| POST | `/compliance/check` | `{text}`（最多 5 万字），只检查不保存 |

检查规则：不区分大小写的子串匹配，只用启用的词；有 `must` 命中就 `passed=false`。`hits` 先列 must，再按第一次出现的位置。`positions` 是字符下标（中文和 JS 字符串下标一致；含 emoji 时 JS 要按码点换算）。

```json
POST /api/compliance/check  {"text":"这是最佳选择，第一次购买送礼"}
→ {"passed":false,"must_count":1,"warn_count":1,"hits":[
    {"word":"最佳","level":"must","category":"广告法极限词","suggestion":"优秀","positions":[2]},
    {"word":"第一","level":"warn","category":"广告法极限词","suggestion":"确认不是排名用语，如“第一次”可忽略","positions":[7]}]}
```

## 商品资料卡

一个商品编码一张卡。`listings` 是各店铺里同编码商品的当前售价、库存和活动（来自商品导入），资料只维护一份。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/product-cards?brand=&q=` | `q` 模糊匹配名称和编码 |
| GET | `/product-cards/{id}` | 404 `product_card_not_found` |
| POST | `/product-cards` | `{product_code, brand, name, selling_points[], specs?, faq[{q,a}], install_required, notes?}`；编码重复 409 `product_card_exists` |
| PATCH | `/product-cards/{id}` | 除 `product_code` 外都能改；名称、品牌不能为空 |
| DELETE | `/product-cards/{id}` | 204 |

```json
{"id":1,"product_code":"RC-01","brand":"星年","name":"星年 3L 电饭煲","selling_points":["IH 加热"],"specs":null,
 "faq":[{"q":"保修多久","a":"整机一年"}],"install_required":false,"notes":null,"updated_at":"…",
 "listings":[{"shop_id":1,"shop_name":"星年天猫旗舰店","platform":"tmall","sku":"SKU-T","price":299.0,"stock":20,"activity":"双11"}]}
```

## 活动

- `kind`：`holiday` 节假日促销、`big_promo` 大促、`new_launch` 新品上市、`offline` 线下地推、`other`。
- `status`（人改的）：`planning` 筹备、`running` 进行中、`ended` 已结束、`cancelled` 已取消。
- `phase`（按今天的北京日期算，只读）：`upcoming`、`running`、`ended`、`cancelled`。日历上建议用 `phase` 上色。
- 任务 `kind`：`copy` 文案、`design` 设计、`ads` 投放、`member` 会员触达、`other`。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/campaign-templates` | 各类型的默认任务清单 |
| GET | `/campaigns?date_from=&date_to=&brand=&status=` | 日历：返回和时间段有交集的活动，按开始日期 |
| POST | `/campaigns` | `{name, brand, kind, start_date, end_date, goal?, target_sales?, budget?, product_codes[], use_template}`；结束早于开始 400 `invalid_dates` |
| GET | `/campaigns/{id}` | 详情 + `tasks` |
| PATCH | `/campaigns/{id}` | 任意字段（含 `status`） |
| DELETE | `/campaigns/{id}` | 连同任务删除 |
| POST | `/campaigns/{id}/tasks` | `{title, kind, owner?, due_date?, note?}` |
| PATCH | `/campaign-tasks/{id}` | 含 `done` |
| DELETE | `/campaign-tasks/{id}` | 204 |
| GET | `/campaigns/{id}/review` | 复盘 |

列表项字段：`id, name, brand, kind, status, phase, start_date, end_date, goal, target_sales, budget, product_codes, tasks_total, tasks_done, created_at, updated_at`；详情多一个 `tasks`。

### 复盘

取该品牌所有店铺在活动期间的经营和投放数据，和活动开始前同样天数对比。指标、比率、环比的算法和经营页一致（见 `CONTRACT-overview.md`）。`days_with_data` 小于 `days` 时说明有几天没导入经营数据。`target_rate` = 销售额 / 目标，`budget_rate` = 投放花费 / 预算，没设目标或预算时为 `null`。`markdown` 是一段现成的复盘摘要，品牌助手和日报可直接用。

```json
GET /api/campaigns/1/review   （活动 2026-11-04 单日，目标 24000，预算 2600）
→ {"campaign_id":1,"name":"单日测试","brand":"星年","phase":"ended",
   "start_date":"2026-11-04","end_date":"2026-11-04","compare_start":"2026-11-03","compare_end":"2026-11-03",
   "days":1,"days_with_data":1,
   "metrics":{"visitors":{"value":1200,"previous":1000,"change":0.2},
              "orders":{"value":60,"previous":40,"change":0.5},
              "sales_amount":{"value":12000.0,"previous":8000.0,"change":0.5},
              "conversion_rate":{"value":0.05,"previous":0.04,"change":0.25},
              "ad_spend":{"value":1300.0,"previous":900.0,"change":0.4444},
              "ad_gmv":{"value":2750.0,"previous":2800.0,"change":-0.0179},
              "roi":{"value":2.1154,"previous":3.1111,"change":-0.3201}},
   "target_sales":24000.0,"target_rate":0.5,"budget":2600.0,"budget_rate":0.5,
   "tasks_total":5,"tasks_done":0,
   "shops":[{"shop_id":1,"shop_name":"星年天猫旗舰店","platform":"tmall","sales_amount":12000.0,"orders":60,"ad_spend":1300.0,"roi":2.1154}],
   "markdown":"# 活动复盘：单日测试\n…"}
```
