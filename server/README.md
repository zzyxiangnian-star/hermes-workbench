# Hermes 工作台 · 后端

电商工作台（经营、商品）和品牌活动工作台（活动、内容、资料）的后端，外加给 Hermes Bot 用的 MCP 工具（`/mcp`）。第一期没有平台接口授权，数据从客户导出的 Excel / CSV 导入。只监听本机，不登录平台、不改价、不报名、不代发内容。

## Windows 一键启动

- `scripts\start.bat`：启动正式后端（第一次会自动建虚拟环境、装依赖）。
- `scripts\demo.bat`：重建一套演示数据（`data\demo.db`，全是假数据，日期按今天往前推 30 天），再用它启动。不碰正式库。
- 设置：把 `scripts\env.example.bat` 复制成 `scripts\env.bat` 再改（报表文件夹、早报时间、推送地址）。`env.bat` 不进仓库。

## 报表文件夹自动导入

设了 `WB_IMPORT_DIR` 就启用。每个店铺一个子文件夹，名字和工作台里的店铺名一字不差；运营把后台导出的表直接扔进去：

```
D:\工作台报表\
  星年天猫旗舰店\  商品1105.xlsx  经营1105.xlsx  投放1105.csv
  星年京东自营店\  ...
```

按表头自动认出是商品、经营、投放还是订单表。每 `WB_IMPORT_EVERY` 分钟（默认 10，0 表示只在早报前扫一次）扫一遍，早报前也会先扫一遍。导入成功的移到该店铺下的 `已导入\`（有坏行时旁边放一份 `.原因.txt`），失败的移到 `失败\` 并写明原因。刚放进去不到 10 秒的文件下一轮再导，避免读到写了一半的文件。也可以手动触发：`POST /api/import/folder/scan`；`GET /api/import/folder` 看是否启用。

## 演示数据

`python -m app.demo`（或 `workbench-demo`）写到 `data/demo.db`，`--db` 可换路径。4 个店铺（星年天猫、京东、拼多多，木屿抖音）、30 天经营和投放、约 20 条商品问题、昨天的 3 条投放提醒、品牌规范、4 张商品资料卡、3 个活动（已结束可复盘 / 进行中 / 即将开始）、4 篇稿件（已发布、送审中、被退回、品牌助手写的含违禁词草稿）、最近 3 天的订单和约 15 张安装工单（已预约、异常、带备注的各有一张；手机号用 100 号段，不是真号码）。

## 环境

- Python 3.11 或 3.12（任务卡写的是 3.12；下面的命令在 3.11 上同样可用）
- 依赖在 `pyproject.toml`

```powershell
cd server
python -m pip install -e ".[dev]"
```

## 启动

默认数据库是 `server/data/workbench.db`（SQLite）。想换路径可以设 `WORKBENCH_DATABASE_URL`。表结构不用 SQLite 专有语法，以后可以迁到 PostgreSQL。

```powershell
cd server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

也可以 `python -m app.main`，同样只绑 `127.0.0.1:8000`。第一次启动会写入四条商品规则和三条投放规则。表结构由 Alembic 管：空库启动时会 `upgrade head`。已经用旧版 `create_all` 建过、又没有版本记录的本地库，会先标到 `c01` 再升级。

浏览器来源放行 `localhost`、`127.0.0.1`（端口不限）和 Origin `null`。额外来源用 `WB_ALLOWED_ORIGINS`（逗号分隔）。

每天 `WB_DAILY_AT`（默认 `08:30`，上海时区）跑商品规则、投放规则，再生成昨天的日报。配了 `WB_FEISHU_WEBHOOK` 或 `WB_WECOM_WEBHOOK` 才推送。`WB_SCHEDULER=off` 关掉定时任务。

接口说明在 `docs/CONTRACT-products.md`、`docs/CONTRACT-overview.md`、`docs/CONTRACT-brand.md`，安装工单在 `docs/CONTRACT-installs.md`，客户和询盘在 `docs/CONTRACT-customers.md`，设计需求单和素材在 `docs/CONTRACT-design.md`，短视频在 `docs/CONTRACT-video.md`，MCP 工具在 `docs/CONTRACT-mcp.md`。

## 导入样表

样表是假数据，各 30 行（含 2 行故意写坏的）：

- `samples/products-tmall.xlsx`：列名是商品编码、货号、标题、售价、底价、库存、活动
- `samples/products-jd.csv`：列名是 SKU、商品货号、商品名称、价格、底价、可售库存、活动名称

先建店铺，再导入。导入按 `(店铺, 商品编码)` 更新或新建，**不会删除**这次表格里没有的商品。空行跳过。坏行记进行号，不中断其余行。导入结束后自动检查一次规则。

```powershell
cd server
python -c @"
import httpx
from pathlib import Path

base = 'http://127.0.0.1:8000/api'
client = httpx.Client(base_url=base, timeout=30)
tmall = client.post('/shops', json={'platform': 'tmall', 'name': '星年天猫旗舰店', 'brand': '星年'}).json()
jd = client.post('/shops', json={'platform': 'jd', 'name': '星年京东旗舰店', 'brand': '星年'}).json()
samples = Path('samples')
for shop, filename in ((tmall, 'products-tmall.xlsx'), (jd, 'products-jd.csv')):
    path = samples / filename
    response = client.post('/import/products', data={'shop_id': str(shop['id'])}, files={'file': (filename, path.read_bytes())})
    print(filename, response.status_code, response.json()['rows_ok'], response.json()['rows_failed'])
print(client.get('/issues/summary').json())
"@
```

两张表都导入后，默认规则下大约有 20 条未处理问题：天猫 14 条（低于底价、库存不足、跨店价差），京东 6 条（跨店价差，外加一条又低价又缺货）。`TM-SN-011` 的提示是「售价 189 低于底价 199」。货号 `SN-019` 到 `SN-022` 两店差 20%。`SN-023` 到 `SN-026` 只差 4%，不报。活动报名规则默认不指定活动名，所以不会响。

手动再跑一遍：

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/rules/run -Method POST
```

同一商品、同一规则如果已经有一条 `open` 的问题，不会再新建。问题不再成立时，自动改成 `resolved`。标成 `ignored` 的，在仍然违规时不会另开一条；数据改好后也会变成 `resolved`。

## 测试

```powershell
cd server
python -m pytest
```

重新生成样表：`python samples/build_samples.py`。
