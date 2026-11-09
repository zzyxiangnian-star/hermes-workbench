@echo off
chcp 65001 >nul
rem 工作台安装：找到 Hermes 实际用的数据目录，备份旧版，装插件和后端，桌面放快捷方式。
rem 升级也是双击这个。数据（数据库、素材、设置）不会被覆盖。
cd /d "%~dp0"
set "PY="
py -3 -c "import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)" >nul 2>&1 && set "PY=py -3"
if not defined PY python -c "import sys; sys.exit(0 if sys.version_info >= (3, 11) else 1)" >nul 2>&1 && set "PY=python"
if not defined PY (
  echo 没找到 Python 3.11 或更新版本。请先安装：https://www.python.org/downloads/
  echo 安装时勾选 "Add python.exe to PATH"，装好后再双击这个文件。
  pause
  exit /b 1
)
%PY% workbench_ctl.py install
pause
