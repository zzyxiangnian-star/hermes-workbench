# 设计：设计需求单、候选稿、图上批注、定稿和素材库（C09）

给品牌活动工作台的「设计」页用。路径前缀 `/api`，错误格式同 `CONTRACT-products.md`；时间存 UTC、返回带时区的 ISO 字符串。

文件存在本机 `WB_ASSET_DIR`（默认 `server/data/assets`，演示库用 `data/demo-assets`），按内容的 sha256 命名，同一张图只存一份。只收 PNG、JPG、GIF、WebP、PDF、PSD、MP4、MOV，类型按文件头判断、不看扩展名。单个文件默认最多 50 MB（`WB_ASSET_MAX_MB`）。图片会读出宽高。

## 需求单

类型 `kind`：`main_image` 主图、`detail_page` 详情页、`poster` 海报、`banner` 横幅、`video_cover` 视频封面、`other`。

状态：`open` 待接单 → `in_progress` 设计中 → `reviewing` 待评审 → `done` 已定稿；未定稿时都能 `cancelled`，取消的可以回到 `open`。

| 从 | 可以到 |
|---|---|
| open | in_progress、cancelled |
| in_progress | reviewing、cancelled |
| reviewing | in_progress（退回修改，必须写 `note`，进入下一轮 `round+1`）、cancelled；定稿走 `/finalize` |
| cancelled | open |

交候选稿时，`open`、`in_progress` 的单自动变 `reviewing`。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/design-requests/summary` | `{open, in_progress, reviewing, done, cancelled, overdue, needs_action}`，`needs_action` = 待接单 + 待评审；参数 `brand` |
| GET | `/design-requests` | 参数 `status`（另有 `active` = 未完成）、`brand`、`kind`、`campaign_id`、`product_code`、`assignee`、`q`（标题、说明、文案、商品编码） |
| POST | `/design-requests` | `{title, kind, brand, campaign_id, product_code, sizes[], copy_text, brief, due_date, requester, assignee}` → 201。`sizes` 写成 `800x800`（`×`、`*` 也认） |
| GET | `/design-requests/{id}` | 详情 |
| PATCH | `/design-requests/{id}` | 除 `brand`、`requester` 外都能改；已定稿 / 已取消的 409 `request_locked` |
| DELETE | `/design-requests/{id}` | 只限待接单、已取消；连同参考图、候选稿一起删 |
| POST | `/design-requests/{id}/status` | `{status, by, note}`；`status=done` 返回 400 `use_finalize` |
| POST | `/design-requests/{id}/assets` | 表单 `file`、`role`（`reference` 参考图 / `candidate` 候选稿，默认 candidate）、`by`、`note` → 201 素材 |
| POST | `/design-requests/{id}/finalize` | `{asset_ids[], by}`：只能是本单的候选稿；图上文案 `copy_text` 有 must 级违禁词时 400 `compliance_failed`；选中的变 `final` 进素材库，单子变 `done` |
| GET | `/design-requests/{id}/compliance` | 图上文案的违禁词检查（同 `/api/compliance/check`） |
| POST | `/design-requests/{id}/comments` | `{body, asset_id, x, y, author}`：`x`、`y` 是图上位置（0–1，左上为 0），要同时给，并且要指定 `asset_id` → 201 |
| PATCH / DELETE | `/design-comments/{id}` | `{resolved}` / 删除 |

列表项字段：`id, title, kind, brand, campaign_id, campaign_name, product_code, sizes, copy_text, brief, due_date, overdue（过了截止日还没完成）, requester, assignee, status, round, candidate_count, open_comments, cover（定稿第一张，没有就是最新候选稿）, created_at, updated_at`。

详情多：`references[]`、`candidates[]`（所有轮次，按 `round`、`label` 分组显示）、`finals[]`、`comments[]`、`events[]`（谁、何时、做了什么）、`compliance`。

候选稿编号：每一轮从 `A` 开始。`source` 是 `upload`（人传的）或 `ai`（设计助手交的，带 `prompt`）。

## 素材

字段：`id, request_id, role（reference/candidate/final/library）, file_name, url, mime, size, width, height, brand, product_code, campaign_id, kind, tags[], source, prompt, round, label, note, created_by, created_at`。

`url` 是 `/api/assets/{id}/file`，页面里直接当 `<img src>` 用（前面拼上后端地址）。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/assets` | 不传 `role` 就是素材库（`final` + `library`）。参数 `role`、`brand`、`product_code`、`campaign_id`、`kind`、`q`（文件名、说明、商品编码、标签）、`limit`（默认 200，最多 500） |
| POST | `/assets` | 直接放进素材库：表单 `file`、`brand`、`product_code`、`campaign_id`、`tags`（逗号分隔）、`note`、`by` → 201 |
| GET | `/assets/{id}` | 素材信息 |
| GET | `/assets/{id}/file` | 文件本身；`?download=true` 下载 |
| PATCH | `/assets/{id}` | `brand`、`product_code`、`campaign_id`、`tags`、`note` |
| DELETE | `/assets/{id}` | 定稿不能删（409 `asset_locked`）；没有别的记录用同一个文件时才删文件 |

## 给 AI 的

设计助手的 `wb_list_design_requests`、`wb_get_design_request`、`wb_add_design_candidate` 见 `CONTRACT-mcp.md`。AI 只能交候选稿，不能定稿、退回、删除。
