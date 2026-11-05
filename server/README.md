# Hermes 工作台 · 商品后端

第一期没有平台接口授权。商品从客户导出的 Excel / CSV 导入，再按规则列出异常。只监听本机，不登录、不改价、不报名。

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

也可以 `python -m app.main`，同样只绑 `127.0.0.1:8000`。第一次启动会写入四条默认规则。浏览器来源只放行 `localhost` 和 `127.0.0.1`。

接口说明在仓库的 `docs/CONTRACT-products.md`。

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
