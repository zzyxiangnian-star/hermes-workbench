@echo off
chcp 65001 >nul
rem 生成一套演示数据（假数据，写在 data\demo.db，每次运行都会重建），然后用它启动后端。
rem 不会碰正式数据库 data\workbench.db。
cd /d "%~dp0.."
if not exist .venv\Scripts\python.exe (
  py -3 -m venv .venv 2>nul || python -m venv .venv
)
.venv\Scripts\python.exe -m pip install -q -e .
if errorlevel 1 (
  if exist .venv\Scripts\workbench-api.exe (echo 依赖更新失败（可能没联网），先用已装好的版本) else (echo 依赖安装失败，请检查网络后重试 & pause & exit /b 1)
)
.venv\Scripts\python.exe -m app.demo || (pause & exit /b 1)
set WORKBENCH_DATABASE_URL=sqlite:///%CD:\=/%/data/demo.db
set WB_SCHEDULER=off
echo 演示后端已启动：http://127.0.0.1:8000  （关闭这个窗口就停止）
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
pause
