# WK08 在 grokbot 的电脑上做试用前的最终总测

> W09 已审查通过；等 W09.1（分镜页右栏）交回后再发。沿用 WK07 的环境：`/workspace/hermes-k01/`、`HERMES_HOME=/workspace/hermes-k01/hermes-test`，不碰 `~/.hermes`。测前在 .env 里加 key，测完删掉、用 key 值 grep 一遍；启动服务时剥离 KEY/TOKEN/SECRET 和 `__CURSOR_SANDBOX_ENV_RESTORE`。

## 背景
九页界面全部做完。这次**按客户的方式安装**：用交付包，不用仓库目录，看说明书走不走得通；再把 WK07 没测的设计页、视频页、备份面板测完。

## 要做的事
1. `cd /workspace/hermes-workbench && git pull`，记录 `git log --oneline -1`。
2. **打交付包**：`cd plugin && npm ci && HERMES_SRC=/workspace/hermes-k01/hermes-agent node build.mjs`，回到根目录 `python tools/package.py`。解压到 `/workspace/交付测试/`（新目录）。
3. **只看包里的 `说明.md` 安装**（Linux 上用 `python -m venv .venv && .venv/bin/pip install -e .` 代替 start.bat，其余照做）：后端用 `workbench-demo --db /workspace/wk08.db` 的演示数据、`WB_ASSET_DIR=/workspace/wk08-assets`、`WB_BACKUP_DIR=/workspace/wk08-备份`；`plugin.js` 放进插件目录；四个 Bot 按包里 `bots/*/README.md` 重新配一遍（先备份原 profile）。记下说明书里**看不懂、步骤缺失或和实际不符**的每一处。
4. 逐项记“通过 / 不通过 + 现象”：
   1. 设计页：需求单列表和左栏徽标；新建需求（尺寸写成 `800×800` 也能认）；上传候选稿 A/B、并排对比；在图上点一下加批注、标已解决；文案写“最佳”时定稿被拦，改掉后定稿；素材库筛选、改标签。批注栏在宽窗口下紧跟大图、正文不被裁。
   2. 视频页：项目列表；分镜编辑（加镜、改时长、删镜）；上传配音后时长按配音变；字幕下载（SRT）；送审、退回、通过；下载初剪包，`unzip -l` 贴进报告；上传成片后项目完成、成片出现在素材库。
   3. 设置里的“数据备份”：显示备份目录和快照，点“立即备份”后多一份；显示的版本号和 `/api/health` 一致。
   4. 设计助手：“看一下 1 号需求单的参考图和候选稿”（应调用 `wb_view_images`，能描述图）；“给 1 号单出一版”—— 没有生图 key 的话应如实说生图不可用，不编造。
   5. 视频助手：重做 WK06 的 5.1（分镜、存到工作台、配音），然后在视频页里看到配音、时长对得上。
   6. 九页每页按一次 Ctrl+R 都回到原页；后端停掉再起来，九页都能“重试”恢复；Console 里带 `hermes-workbench` 的红色报错原文。
   7. 深色主题下设计页、视频页各一张截图；窄窗口各一张。
5. 查 `profiles/*/skills/` 没有新出现的 SKILL.md；`/workspace/wk08-备份/数据库/` 里有快照。

## 交回
`/workspace/hermes-workbench/WK08-报告.md`：版本号和 plugin.js 的 SHA256、说明书问题清单（逐条写在哪一节、哪里卡住）、逐项结果、Console 报错原文、截图打包。

## 不要做
- 不改 hermes-workbench 和 hermes-agent 的代码，不提交、不推送；只记现象。
- 不要把 Key 或 launch ticket 写进报告、截图。只用演示数据。
