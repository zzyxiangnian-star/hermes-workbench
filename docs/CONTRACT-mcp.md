# 工作台 MCP 工具约定（C03–C07）

- 服务名：`hermes-workbench`
- HTTP：随后端一起启动，`http://127.0.0.1:8000/mcp`（Streamable HTTP，无状态，JSON 响应）。只接受 Host 为 `127.0.0.1` / `localhost` 的请求，其他 Host 返回 421。
- stdio：`workbench-mcp --stdio`（等同 `python -m app.mcp_server --stdio`），读同一个数据库。
- 出错时工具返回 `isError: true`，文字是中文原因（例如“找不到这个商品”）。
- 日期一律 `YYYY-MM-DD`；金额是数字；比率是小数（0.05 = 5%）。

## 工具

| 工具 | 参数 | 返回 | 对应接口 |
|---|---|---|---|
| `wb_list_product_issues` | `status`=open（open/resolved/ignored）、`level`（must/warn）、`shop_id`、`limit`=20（最多 50） | `{total, returned, items: IssueOut[]}` | `GET /api/issues` |
| `wb_get_product` | `product_id` 或 `sku` 或 `product_code`（至少一个） | `{items: [商品 + issues: IssueOut[]]}`，最多 10 个 | — |
| `wb_get_overview` | `date`（默认有数据的最近一天）、`shop_id`、`brand` | 同 `GET /api/overview` | `GET /api/overview` |
| `wb_get_trend` | `metric`（必填）、`days`=30（1–366）、`shop_id` | 同 `GET /api/overview/trend` | `GET /api/overview/trend` |
| `wb_list_alerts` | `status`=open、`level`、`shop_id`、`limit`=20（最多 50） | `{total, returned, items: AlertOut[]}` | `GET /api/alerts` |
| `wb_get_daily_report` | `date`（默认昨天，北京时间） | 同 `GET /api/reports/daily` | `GET /api/reports/daily` |
| `wb_add_note` | `issue_id`、`note`（1–500 字） | 更新后的 `IssueOut` | — |
| `wb_list_campaigns` | `date_from`、`date_to`、`brand`、`status` | `{items: 活动[]}` | `GET /api/campaigns` |
| `wb_get_campaign` | `campaign_id` | `{campaign: 详情含任务, review: 复盘}` | `GET /api/campaigns/{id}` + `/review` |
| `wb_check_compliance` | `text`（最多 5 万字） | 同 `POST /api/compliance/check` | `POST /api/compliance/check` |
| `wb_get_product_card` | `product_code` 精确，或 `q` 模糊（最多 10 个） | `{items: 资料卡[]}` | `GET /api/product-cards` |
| `wb_get_brand_guide` | `brand` | 品牌规范 | `GET /api/brand-guides/{brand}` |

| `wb_list_contents` | `status`、`brand`、`campaign_id`、`platform`、`q` | `{items: 稿件[]}` | `GET /api/contents` |
| `wb_get_content` | `content_id` | `{content: 稿件详情, compliance: 合规检查}` | `GET /api/contents/{id}` + `/compliance` |
| `wb_create_draft` | `title`、`brand`、`body`、`kind`=article、`campaign_id`、`variants[{platform,title,body}]` | `{id, status:"draft", version, platforms}` | `POST /api/contents` |

| `wb_list_installs` | `status`、`shop_id`、`overdue`、`limit`=20（最多 50） | `{summary, total, items: 工单[]}`（打码） | `GET /api/installs` |
| `wb_get_install` | `install_id` | 工单详情含处理记录（打码） | `GET /api/installs/{id}` |
| `wb_add_install_note` | `install_id`、`note`（1–500 字） | 工单详情（打码） | `POST /api/installs/{id}/notes` |

| `wb_list_customers` | `segment`、`kind`、`q`、`limit`=20（最多 50） | `{summary: 分层人数, total, items: 客户[]}`（打码） | `GET /api/customers` + `/segments` |
| `wb_get_customer` | `customer_id` | 客户详情含最近订单和询盘（打码） | `GET /api/customers/{id}` |
| `wb_list_inquiries` | `status`（含 `open`）、`q`、`limit` | `{total, items: 询盘[]}`（打码） | `GET /api/inquiries` |
| `wb_get_inquiry` | `inquiry_id` | 询盘详情 + `products`（资料卡）（打码） | `GET /api/inquiries/{id}` + `/products` |
| `wb_add_inquiry_note` | `inquiry_id`、`note`（1–500 字） | 询盘详情（打码） | `POST /api/inquiries/{id}/notes` |

| `wb_list_design_requests` | `status`=active、`brand`、`limit` | `{total, items: 需求单[]}` | `GET /api/design-requests` |
| `wb_get_design_request` | `request_id` | 需求单详情（参考图、各轮候选稿、批注、文案检查） | `GET /api/design-requests/{id}` |
| `wb_add_design_candidate` | `request_id`、`image`、`prompt`、`note`（≤500 字） | `{request_status, round, candidate}` | `POST /api/design-requests/{id}/assets` |

| `wb_list_video_projects` | `status`=active、`brand`、`limit` | `{total, items: 视频项目[]}` | `GET /api/video-projects` |
| `wb_get_video_project` | `project_id` | 项目详情（分镜、起止时间、素材、审核记录、违禁词检查） | `GET /api/video-projects/{id}` |
| `wb_create_video_project` | `title`、`brand`、`shots[{duration, visual, voiceover, subtitle}]`、`product_code`、`campaign_id`、`platform`、`aspect`、`brief` | `{id, status:"draft", shot_count, duration}` | `POST /api/video-projects` |
| `wb_add_shot_media` | `project_id`、`seq`、`slot`（voice / visual）、`file` 或 `asset_id`、`prompt` | `{project_status, duration, shot}` | `POST /api/video-projects/{id}/shots/{seq}/media` |
| `wb_search_library` | `brand`、`product_code`、`kind`、`q`、`limit` | `{total, items: 素材[]}`（只有信息，没有文件内容） | `GET /api/assets` |

C10 的 5 个给视频助手用，字段见 [CONTRACT-video.md](CONTRACT-video.md)。`wb_create_video_project` 作者固定为“视频助手”、状态固定为写脚本；`wb_add_shot_media` 只能改写脚本中的项目，`file` 的规矩同 `wb_add_design_candidate`（配音一般是 `text_to_speech` 返回的本机路径），`asset_id` 只能选素材库里的图或视频当画面。

C09 的 3 个给设计助手用，字段见 [CONTRACT-design.md](CONTRACT-design.md)。`image` 填 Hermes `image_generate` 返回的 `image`：https 链接（只允许公网地址，不跟随跳转）、`data:image/…;base64,…`，或 `WB_AI_IMAGE_DIRS`（默认 `~/.hermes`）里的本机文件。只收 PNG、JPG、GIF、WebP，单张 ≤20 MB，每张单每轮 AI 最多 8 张。交的稿记为 `source=ai`、`created_by=设计助手`。

C08 的 5 个也给电商助手用，字段见 [CONTRACT-customers.md](CONTRACT-customers.md)。姓名和联系人只留姓、手机留前三后四，询盘原文和备注里的手机号也打码。

C07 的 3 个给电商助手用，字段见 [CONTRACT-installs.md](CONTRACT-installs.md)。顾客姓名、手机、地址在返回前打码；备注加 `[电商助手] ` 前缀、不改状态。

C04、C05 的 8 个给品牌助手用，字段见 [CONTRACT-brand.md](CONTRACT-brand.md)。`wb_create_draft` 只能新建，作者固定为“品牌助手”，状态固定为草稿，没有改作者或状态的参数；送审、通过、发布只在工作台里由人操作。

`IssueOut`、`AlertOut`、总览、趋势的字段见 [CONTRACT-products.md](CONTRACT-products.md) 和 [CONTRACT-overview.md](CONTRACT-overview.md)。

## 写操作的规矩

### `wb_add_note`

- 备注前面自动加 `[电商助手] `，接在原备注下一行，不覆盖。
- 不改 `status`，不改 `resolved_at`。多传的参数（例如 `status`）不起作用。

## 故意不做成工具的

改问题或提醒的状态、改规则和投放规则、导入表格、发送日报、改价；新建或修改活动、任务、资料卡、品牌规范、违禁词；修改已有稿件、送审、审核、标记发布；改安装工单状态、导出预约表、生成顾客通知；改询盘状态、出报价单、建或审核批量跟进、导出跟进名单、标记已发；新建或修改设计需求单、定稿、退回、删除素材、上传素材库；视频项目送审、通过、退回、取消、交成片、下载初剪包。这些都由人在工作台里操作。测试 `test_tool_list_is_read_only_plus_note` 会在有人加了这类工具时失败。
