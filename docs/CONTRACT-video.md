# 短视频：视频项目、分镜、配音、初剪包（C10）

给品牌活动工作台的「视频」页用。路径前缀 `/api`，错误格式同 `CONTRACT-products.md`；时间存 UTC、返回带时区的 ISO 字符串。素材文件存法同 `CONTRACT-design.md`（`WB_ASSET_DIR`），视频用到的画面和配音是 `role=material`，不进素材库默认列表；成片是 `role=final`、`kind=video`，进素材库。

## 流程

`draft` 写脚本 → 送审 `in_review` 待审核 → `approved` 已通过 → 交成片 `done` 已完成；`draft`、`in_review`、`approved` 都可以 `cancelled`。

| 动作 | 路径 | 从 → 到 | 规则 |
|---|---|---|---|
| 送审 | `POST /video-projects/{id}/submit` `{by}` | draft → in_review | 至少 1 镜（`no_shots`）；标题、口播、字幕有 must 级违禁词时 400 `compliance_failed` |
| 撤回 | `POST …/withdraw` `{by}` | in_review → draft | |
| 通过 | `POST …/approve` `{by}` | in_review → approved | 记 `reviewer` |
| 退回 | `POST …/reject` `{by, note}` | in_review / approved → draft | `note` 必填（`note_required`） |
| 取消 | `POST …/cancel` `{by}` | 未完成 → cancelled | |
| 交成片 | `POST …/final` 表单 `file`、`by` | approved → done | 只收 MP4、MOV（`invalid_media`） |

只有 `draft` 能改分镜、传画面和配音、换背景音乐，其他状态 409 `project_locked`。每一步记进 `events`。

## 项目和分镜

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/video-projects/summary` | 各状态数量 + `needs_action`（待审核数） |
| GET | `/video-projects` | 参数 `status`（另有 `active` = 未完成）、`brand`、`campaign_id`、`q`（标题、说明、口播、画面说明） |
| POST | `/video-projects` | `{title, brand, campaign_id, product_code, platform, aspect="9:16", brief, author, shots[]}` → 201 |
| GET / PATCH / DELETE | `/video-projects/{id}` | PATCH：`title, campaign_id, product_code, platform, aspect, brief, editor, bgm_asset_id`；DELETE 只限写脚本中、已取消 |
| PUT | `/video-projects/{id}/shots` | `{shots: [...]}` 整体替换，镜号按顺序重排 |
| POST | `/video-projects/{id}/shots/{seq}/media` | 表单 `file`、`slot`（`visual` 画面：图片或视频 / `voice` 配音：MP3、WAV、M4A、OGG）、`by` |
| POST | `/video-projects/{id}/bgm` | 表单 `file`、`by`，背景音乐 |
| GET | `/video-projects/{id}/compliance` | 标题 + 口播 + 字幕的违禁词检查 |
| GET | `/video-projects/{id}/timeline` | 时间线 JSON（见下） |
| GET | `/video-projects/{id}/subtitles.srt` | 字幕文件 |
| GET | `/video-projects/{id}/package` | 初剪包 zip，审核通过后才能下（409 `not_approved`） |

分镜输入：`{duration 秒（0–60，默认 3）, visual 画面说明, voiceover 口播, subtitle 字幕, media_asset_id, voice_asset_id, note}`。`subtitle` 不传（`null`）表示和口播一样，传空字符串表示这镜不要字幕。`media_asset_id` 可以直接用素材库里的图或视频（例如设计页的定稿）。最多 60 镜。

画幅 `aspect`：`9:16`（1080x1920）、`16:9`（1920x1080）、`1:1`（1080x1080）、`3:4`（1080x1440）。平台 `platform`：douyin、xiaohongshu、wechat、weibo、tmall、jd、pdd、other。

列表字段：`id, title, brand, campaign_id, campaign_name, product_code, platform, aspect, brief, status, author, reviewer, editor, shot_count, duration（总长，秒）, missing_media（没画面的镜数）, missing_voice（有口播没配音的镜数）, cover（第一张画面图）, final（成片）, created_at, updated_at`。

详情多：`shots[]`（`seq, duration 写的时长, length 实际时长, start 起点, visual, voiceover, subtitle, media, voice, note`）、`bgm`、`events`、`compliance`。

**实际时长**：有配音时，一镜至少和配音一样长（MP3、WAV 能读出配音时长；M4A、OGG 读不出时按写的时长）。

## 时间线和初剪包

`timeline`：`{project_id, title, aspect, width, height, duration, shots: [{seq, start, end, duration, visual, voiceover, subtitle, media, voice}], bgm}`，`media`/`voice`/`bgm` 是 `{asset_id, file_name, mime, url, package_name}`。

字幕：每镜按标点切开、短句拼回去，每条不超过 16 个字，时间按字数分；行末标点去掉。

初剪包 zip 内容：
```
素材/01_画面.png  素材/01_配音.mp3  …  素材/bgm.mp3
字幕.srt          ← UTF-8，剪映“导入字幕”可用
分镜表.csv        ← 镜号、起止时间、画面说明、口播、字幕、对应文件
时间线.json       ← 同 /timeline，package_name 指向包里的文件
说明.txt          ← 在剪映里怎么摆
```

剪映草稿直接生成（不用手动摆）是 C11，由 Cursor 在装了剪映的 Windows 电脑上做和测。

## 给 AI 的

视频助手的 `wb_list_video_projects`、`wb_get_video_project`、`wb_create_video_project`、`wb_add_shot_media`、`wb_search_library` 见 `CONTRACT-mcp.md`。AI 只能新建脚本、给写脚本中的项目交配音和画面；不能送审、通过、退回、取消、交成片。
