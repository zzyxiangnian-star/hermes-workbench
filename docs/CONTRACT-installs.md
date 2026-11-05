# 安装：订单和安装工单（C07）

给电商工作台的「安装」页用。路径前缀 `/api`，错误格式同 `CONTRACT-products.md`。时间一律存 UTC、接口返回带时区的 ISO 字符串；页面按北京时间显示。

平台接口和啄木鸟接口都还没接（第二期），现在的做法：
1. 运营从后台导出订单表，上传或放进报表文件夹（会自动认出是订单表）。
2. 买了“需安装”商品的订单自动生成工单。哪些商品需安装，看商品资料卡的 `install_required`（订单没有货号时，用店铺商品表把商家编码对上货号）。改了资料卡会自动补工单。
3. 客服把待预约工单导出成表交给啄木鸟（或在啄木鸟后台录入），约好后回来填预约时间。
4. 复制预约通知发给顾客（系统不自动发）。

订单状态里含“关闭、取消、退款成功、已退款”的不建工单；已有工单还没完工的会自动取消。

## 订单导入

`POST /api/import/orders`（表单：`shop_id`、`file`、可选 `mapping`），同商品导入。认这些列名：

| 字段 | 列名 |
|---|---|
| 订单号（必填） | 订单编号、订单号、主订单编号、父订单号 |
| 付款时间（必填） | 付款时间、支付时间、下单时间、订单创建时间、创建时间 |
| 商品标题（必填） | 商品标题、宝贝标题、商品名称、标题 |
| 实付金额（必填） | 实付金额、买家实际支付金额、支付金额、订单金额、应付金额 |
| 商品编码 | 商家编码、商品编码、商家sku、sku、外部系统编号 |
| 货号 | 货号、商品货号、款号 |
| 数量 | 购买数量、商品数量、数量（空当 1） |
| 收货人 / 手机 / 地址 | 收货人姓名、收货人、收件人 / 联系手机、收货人手机、手机号、联系电话 / 收货地址、详细地址 |
| 备注 | 买家留言、订单备注、买家备注、备注 |
| 订单状态 | 订单状态、状态 |

订单号会去掉导出表常见的 `="…"`、引号和制表符。同一店铺下按（订单号、商品编码）更新或新建。

```json
{"id":3,"file_name":"订单.csv","shop_id":1,"kind":"orders","rows_ok":2,"rows_failed":1,
 "errors":[{"row":5,"reason":"付款时间格式不正确"}],"created_at":"…","installs":{"created":1,"cancelled":0}}
```

## 工单

状态：`pending` 待预约、`booked` 已预约、`done` 已完工、`exception` 异常、`cancelled` 已取消。允许的流转：

| 从 | 可以改成 |
|---|---|
| pending | booked、exception、cancelled |
| booked | done、exception、cancelled、pending |
| exception | pending、booked、cancelled |
| cancelled | pending |
| done | （不能再改） |

改成 `booked` 必须有 `appointment_at`（之前填过可以不再传）；改成 `exception` 必须有 `reason`。不允许的流转 409 `invalid_transition`。待预约超过 48 小时 `overdue=true`。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/installs?status=&shop_id=&q=&overdue=` | 按创建时间倒序；`q` 搜订单号、商品、收货人、手机 |
| GET | `/installs/summary?shop_id=` | `{pending, booked, done, exception, cancelled, overdue, needs_action}`，徽标用 `needs_action`（待预约 + 异常） |
| GET | `/installs/{id}` | 详情，多 `events`：`[{at, by, text}]` 处理记录 |
| POST | `/installs/{id}/status` | `{status, by?, appointment_at?, engineer?, provider_ref?, reason?}` → 详情 |
| POST | `/installs/{id}/notes` | `{note, by?}`，追加备注 → 详情 |
| GET | `/installs/{id}/notice` | `{"text": "张先生/女士，您购买的…已为您预约安装：2026-11-06 14:00，师傅：刘师傅。…"}`；没预约 409 `not_booked` |
| POST | `/installs/export` | `{ids?: [], status?: "pending"}` → CSV 文件（UTF-8 带 BOM，Excel 可直接打开），给服务商用；没有可导出的 404 |
| POST | `/installs/sync` | 重新给已导入订单补工单 → `{created, cancelled}` |

列表项字段：`id, code(AZ000001), status, overdue, shop_id, shop_name, order_id, order_no, paid_at, title, product_code, quantity, amount, buyer_name, phone, address, remark, provider(默认 啄木鸟), provider_ref, appointment_at, engineer, exception_reason, note, created_at, updated_at`。

## 隐私

工作台页面和导出表里是完整的姓名、手机、地址（本机使用）。经 MCP 给 AI 的一律打码：姓名只留姓、手机 `138****5678`、地址只留到区县。
