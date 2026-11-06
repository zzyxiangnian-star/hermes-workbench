# C12 在 Windows 上实测启动脚本和打包脚本

> 发给你电脑上的 Cursor。在 `F:\工作台开发\hermes-workbench` 工作，先 `git pull`。半小时以内的小活，可以和 C11 一起做。
> 不要打开或操作 Hermes 窗口。不要动正在用的 `server\data\workbench.db`，也不要停掉 :8000 上正在跑的后端；下面所有测试都在一份**复制出来的目录**里做。

## 背景
交付给客户时，他们只会双击 `start.bat`、`demo.bat`。这两个脚本和打包脚本 `tools\package.py` 目前只在 Linux 上检查过，需要在 Windows 上真跑一遍。脚本这次改过：`.bat` 统一成 Windows 换行；依赖只在第一次和 `pyproject.toml` 变化时联网安装。

## 要做的事
1. 在 `plugin\` 里 `node build.mjs`，再在仓库根目录 `python tools\package.py`，记录输出（文件数、大小、版本.txt 内容）。
2. 把生成的 `dist\工作台-*.zip` 解压到一个新目录，例如 `D:\测试交付\`（路径里带中文，和客户情况一样）。
3. 在解压出来的目录里：
   1. 双击 `server\scripts\demo.bat`：第一次应建环境、装依赖，最后出现 `Uvicorn running on http://127.0.0.1:8000`。如果 8000 被占用，记下报错原文，然后临时把 `demo.bat` 最后一行的端口改成 8002 再试（只改测试目录里的这份）。浏览器打开 `/api/health`，`version` 应是 0.7.0。
   2. 关掉窗口，再双击一次：这次不应再出现“正在安装或更新依赖”，几秒内启动。
   3. 断网（或拔网线）再双击一次：仍能启动。
   4. 双击 `start.bat`（同样注意端口），确认建的是 `server\data\workbench.db`，第一次启动日志里能看到迁移到 `c10` 再出现 Uvicorn 启动行。
   5. 把 `env.example.bat` 复制成 `env.bat`，填一个 `WB_IMPORT_DIR`（路径带中文），重启后 `GET /api/import/folder` 显示启用。
4. 在 `env.bat` 里设 `WB_BACKUP_DIR`（路径带中文），后端开着时双击 `scripts\backup.bat`：应生成 `数据库\workbench-日期-时间.db` 和 `素材\`；再双击一次，素材显示新复制 0 个。用 DB Browser 或 `python -c "import sqlite3;print(sqlite3.connect(r'快照路径').execute('select count(*) from shops').fetchone())"` 确认快照能打开。
5. 确认 zip 里没有 `env.bat`、`.db`、`.venv`、`tests\`。

## 交回
`docs\reports\C12-report.md`：每一步的结果和报错原文、zip 文件列表的前 20 行、版本.txt。脚本有问题就直接改 `server\scripts\*.bat` 或 `tools\package.py` 并在报告里写清楚改了什么，提交信息以 `C12:` 开头。

## 不要做
- 不把 Key、webhook 地址写进 `env.bat` 以外的任何地方，`env.bat` 不提交。
- 不动正式库和 :8000 上的进程。
