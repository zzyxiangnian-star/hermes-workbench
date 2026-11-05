# C01 报告

后端在 `server/`。接口约定在 `docs/CONTRACT-products.md`。没有拷参考项目的代码，所以没有 `THIRD_PARTY.md`。

这台电脑是 Python 3.11.9，没有 3.12。代码按 3.11 来写，`requires-python` 是 `>=3.11`。测试和下面的启动都在 3.11.9 上完成。

## 启动

```powershell
cd server
python -m pip install -e ".[dev]"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

实际日志：

```text
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

`GET http://127.0.0.1:8000/api/health` 返回 `{"status":"ok"}`。

## pytest

在 `server/` 执行 `python -m pytest -v --tb=no`：

```text
============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-9.1.1, pluggy-1.7.0 -- C:\Users\30882\AppData\Local\Programs\Python\Python311\python.exe
cachedir: .pytest_cache
rootdir: F:\工作台开发\hermes-workbench\server
configfile: pyproject.toml
testpaths: tests
plugins: anyio-4.15.1
collecting ... collected 14 items

tests/test_api.py::test_health_rules_and_cors PASSED                     [  7%]
tests/test_api.py::test_pagination_filters_and_patch PASSED              [ 14%]
tests/test_api.py::test_error_shape_and_rule_patch PASSED                [ 21%]
tests/test_import.py::test_samples_import_and_keep_bad_rows PASSED       [ 28%]
tests/test_import.py::test_alias_detection_and_explicit_mapping PASSED   [ 35%]
tests/test_import.py::test_bad_row_does_not_stop_import PASSED           [ 42%]
tests/test_import.py::test_unknown_shop_and_unsupported_file_do_not_create_a_run PASSED [ 50%]
tests/test_import.py::test_reimport_updates_same_sku PASSED              [ 57%]
tests/test_rules.py::test_below_floor_hit_miss_and_resolve PASSED        [ 64%]
tests/test_rules.py::test_low_stock_hit_and_miss PASSED                  [ 71%]
tests/test_rules.py::test_cross_shop_gap_hit_miss_and_resolve PASSED     [ 78%]
tests/test_rules.py::test_missing_activity_hit_miss_and_no_duplicate PASSED [ 85%]
tests/test_rules.py::test_ignored_issue_is_not_reopened_until_it_clears PASSED [ 92%]
tests/test_rules.py::test_zero_price_gap_is_reported PASSED              [100%]

============================= 14 passed in 5.58s ==============================
```

## 导入两张样表后的 /issues/summary

先建了两个假店铺（星年天猫旗舰店、星年京东旗舰店），再上传 `samples/products-tmall.xlsx` 和 `samples/products-jd.csv`。

天猫：28 行成功，2 行失败（第 30 行缺少商品编码，第 31 行售价不是数字），当次新建 10 条问题。京东：28 行成功，2 行失败（第 30 行缺少商品编码，第 31 行库存不是整数），当次再新建 10 条。只导入天猫时还没有跨店价差；京东进来之后总数变成 20。

`GET /api/issues/summary`：

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
  "total_open": 20
}
```

天猫 14 条是：4 条售价低于底价、4 条库存过低、4 条跨店价差，再加上「星年帆布腰带」同时低于底价和库存不足。京东 6 条是：4 条跨店价差，再加上「星年运动水壶」又低于底价又缺货。`TM-SN-011` 的原文是「售价 189 低于底价 199」。货号 `SN-019` 的原文是「货号 SN-019 在星年天猫旗舰店售价 100，在星年京东旗舰店售价 120，价差 20% 超过 5%」。`SN-023` 到 `SN-026` 价差 4%，不报。活动规则默认没有指定活动名，所以不命中。

接着再 `POST /api/rules/run`，返回 `opened: 0, resolved: 0, open_remaining: 20`，没有重复建问题。

## 和参考项目比过之后的取舍

看过，没有拷代码。

**oms-erp（Apache-2.0）** 看了 `skyer-goods` 的 `Sku.java`（表 `sgoo_sku`）。SKU 挂在 SPU 上，有 `skuCode`、`skuName`、销售价、活动价、成本价以及另外几档价格，还有审核状态和长宽高。店铺在渠道模块，库存在库存模块，SKU 上没有店铺 id。第一期是报表导入，任务卡要求的是「一个店铺一行 SKU」，所以没有做成他们的商品中心，也没有多档价格和审核流。借用的只是：售价和另一档价格分开，业务主键用 sku。

**启航电商 ERP（AGPL，只看不拷）** 店铺用数字平台类型（淘宝 100、京东 200、拼多多 300、抖音 400），ERP 商品库和店铺商品分开。定时任务在 `sys_task`，拉取日志记新增、更新、失败条数。我们的平台值保持任务卡里的 `tmall` / `jd` / `pdd` / `douyin`。`import_runs` 同样记成功行、失败行和错误，但是给文件导入用的，不是他们的拉取日志。这张卡不建定时进程；每天要查就调 `POST /api/rules/run`，导入结束也会自动查一次。

**mcp-cn-commerce（MIT）** 看了当前的 `servers/jd/schema.py`。这份合同主要是订单和店铺读接口：`shop_id`、`vender_id`、`order_id`、`page`、`page_size`。商品库存在他们那边历史上用 `sku_id`。服务名是 `jd`、`taobao`、`pinduoduo`、`doudian`。我们的字段名按任务卡锁定。`sku` 对应以后的平台 sku，`shop_id` 对齐，`price`、`stock`、`title` 留给第二期适配器填。平台代码以后的对应关系是：`tmall`→淘宝、`jd`→京东、`pdd`→拼多多、`douyin`→抖店。

提交在本地 `main`，提交信息以 `C01:` 开头。远端这次没有推。
