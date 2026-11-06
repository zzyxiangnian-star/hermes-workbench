@echo off
chcp 65001 >nul
rem 启动工作台后端（只监听本机 127.0.0.1:8000）。第一次运行会自动建虚拟环境、装依赖。
rem 可选：在同一目录建 env.bat 写 set WB_IMPORT_DIR=D:\报表 之类的设置，会自动加载。
cd /d "%~dp0.."
if not exist .venv\Scripts\python.exe (
  echo 第一次运行，正在创建虚拟环境……
  py -3 -m venv .venv 2>nul || python -m venv .venv
  if errorlevel 1 (
    echo 没找到 Python 3.11 或更新版本，请先安装：https://www.python.org/downloads/
    pause
    exit /b 1
  )
)
rem 只在第一次和依赖有变化（pyproject.toml 改了）时联网安装，平时直接启动。
fc /b pyproject.toml .venv\pyproject.installed >nul 2>&1
if errorlevel 1 (
  echo 正在安装或更新依赖……
  .venv\Scripts\python.exe -m pip install -q -e .
  if errorlevel 1 (
    if exist .venv\Scripts\workbench-api.exe (echo 依赖更新失败（可能没联网），先用已装好的版本启动) else (echo 依赖安装失败，请检查网络后重试 & pause & exit /b 1)
  ) else (
    copy /y pyproject.toml .venv\pyproject.installed >nul
  )
)
if exist scripts\env.bat call scripts\env.bat
echo 工作台后端已启动：http://127.0.0.1:8000  （关闭这个窗口就停止）
.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
pause
