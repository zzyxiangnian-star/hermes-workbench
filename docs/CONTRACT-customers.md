# 客户：客户档案、会员分层、B 端询盘和报价、批量跟进（C08）

给电商工作台的「客户」页用。路径前缀 `/api`，错误格式同 `CONTRACT-products.md`。时间存 UTC、返回带时区的 ISO 字符串，页面按北京时间显示。

原则：**系统不自动给客户发任何消息。** 跟进话术和报价单都由人复制到企微、平台客服、短信或邮件里发；发完回工作台点“已发”。

## 客户档案

- 导入订单（`POST /api/import/orders` 或报表文件夹）时，按手机号自动建档：只留数字、去掉 `+86`，同一手机号算同一个人（跨店铺合并）。返回里多了 `"customers":{"created":N}`。
- 企业客户（B 端）可手动新建，或在新建询盘时按手机号 / 公司名自动建。
- 订单数按（店铺, 订单号）去重；状态含“关闭、取消、退款成功、已退款”的订单不计入订单数和金额。

### 分层（每次现算，一个客户可以在多层）

| segment | 名称 | 规则 |
|---|---|---|
| `new` | 新客 | 只买过 1 单，且在最近 30 天内 |
| `repeat` | 复购 | 买过 2 单及以上 |
| `dormant` | 沉睡 | 最近一单在 90 天以前 |
| `inquiry_open` | 询盘未成交 | 有 new/replied/quoted 的询盘，且超过 7 天没更新 |

“加购未买”需要平台接口，第二期接入后再加。

### 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/customers/segments` | `{total, members, businesses, wecom_added, segments:[{segment,label,count,rule}], open_inquiries}` |
| GET | `/customers` | 参数 `segment`、`kind`(member/business)、`q`（姓名、公司、手机、订单号、商品）、`wecom_added`、`page`、`page_size`(≤200)。返回 `{items, total, page, page_size}` |
| POST | `/customers` | `{kind="business", name, phone, company, wecom_added, tags[], note}`；企业客户必须有 `company`；手机号重复 409 `duplicate_customer` |
| GET | `/customers/{id}` | 客户 + `orders`（最近 50 笔）+ `inquiries` |
| PATCH | `/customers/{id}` | `kind`、`name`、`company`、`wecom_added`、`tags`、`note`（手机号不能改） |
| POST | `/customers/sync` | 给没挂上客户的订单补档案 `{created, linked}` |

客户字段：`id, kind, name, phone, company, wecom_added, tags, note, segments[], order_count, total, first_paid_at, last_paid_at, last_title, shops[], open_inquiries, created_at`。

## 询盘（B 端）

状态：`new` 新询盘 → `replied` 已回复 → `quoted` 已报价 → `won` 成交 / `lost` 丢单。

| 从 | 可以到 |
|---|---|
| new | replied、quoted、won、lost |
| replied | quoted、won、lost |
| quoted | replied、won、lost |
| won | — |
| lost | replied（客户又回来了） |

`lost` 必须带 `reason`（`reason_required`）。渠道 `channel`：wecom、phone、tmall、jd、pdd、douyin、email、other。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/inquiries` | 参数 `status`（另有 `open` = 未关闭）、`channel`、`q`、`customer_id` |
| POST | `/inquiries` | `{channel, content, company, contact, phone, product_codes[], assignee, customer_id, by}` → 201 |
| GET / PATCH / DELETE | `/inquiries/{id}` | 详情含 `events`、`quotes` |
| POST | `/inquiries/{id}/status` | `{status, by, reason}` |
| POST | `/inquiries/{id}/notes` | `{note, by}` |
| GET | `/inquiries/{id}/products` | 侧栏资料：`{cards: 资料卡[]（含各店售价库存 listings）, missing: [{product_code, listed}]}` |
| POST | `/inquiries/{id}/quotes` | `{items:[{product_code, name, quantity, unit_price, note}], valid_until, terms, by}` → 201 |
| GET | `/quotes/{id}` | 报价单 |
| GET | `/quotes/{id}/document` | `{number, markdown}`，页面渲染后可打印成 PDF 或复制 |

询盘字段多一个 `stale`（未关闭且超过 7 天没更新）和 `quote_count`。出报价单时：编号 `BJyyyymmdd-NNN`（按北京时间当天流水），金额 = 数量 × 单价，有效期默认 15 天；询盘是 new/replied 的自动变成 quoted；已成交或丢单的不能再报价（409 `inquiry_closed`）。

## 批量跟进

状态：`draft` 草稿 → `approved` 已审核 → `done` 已完成；`draft`/`approved` 可 `cancelled`。

1. 运营选分层、渠道（wecom、platform、sms、phone）、写话术，`POST /followups` 生成名单。话术可用占位符：`{称呼}`（张先生/女士；名字本身带“先生、女士”就原样用）、`{姓名}`、`{最近商品}`、`{店铺}`、`{公司}`。
2. 企微渠道只发给 `wecom_added` 的客户，其余记为 `skipped`（备注“未加企业微信”）；短信、电话渠道没有手机号的跳过。单次最多 1000 人。
3. 草稿阶段可 `PATCH` 改名称和话术，改话术会重新生成每个人的消息。
4. 主管 `approve`：话术先过违禁词，有 must 级的返回 400 `compliance_failed`；没有待发对象返回 400 `no_targets`。
5. 审核后才能导出名单（CSV，含完整手机号，只在本机）和标记每个人 `sent`/`skipped`（审核前 409 `not_approved`）。全部不是 pending 时任务自动 `done`。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/followups` | 参数 `status`；每条带 `counts:{pending,sent,skipped}` |
| POST | `/followups` | `{name, segment, channel, template, by}` → 201，返回带 `targets` |
| GET / PATCH / DELETE | `/followups/{id}` | PATCH、DELETE 只限草稿（409 `followup_locked`） |
| POST | `/followups/{id}/approve` | `{by}` |
| POST | `/followups/{id}/cancel` | |
| GET | `/followups/{id}/export` | CSV：序号、客户、手机、企业微信、公司、话术、状态 |
| PATCH | `/followup-targets/{id}` | `{status, note}`，返回整个跟进任务 |

target 字段：`id, customer_id, customer_name, phone, wecom_added, message, status, sent_at, note`。

## 给 AI 的数据

电商助手的 `wb_list_customers`、`wb_get_customer`、`wb_list_inquiries`、`wb_get_inquiry`、`wb_add_inquiry_note` 见 `CONTRACT-mcp.md`。姓名、联系人只留姓，手机号留前三后四，询盘原文和备注里的手机号也打码；公司名不打码。AI 不能出报价单、改询盘状态、建或审跟进任务。
