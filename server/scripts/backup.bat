@echo off
chcp 65001 >nul
rem 立刻备份一次：数据库快照 + 新增的素材。后端开着也可以备份。
rem 备份位置在 env.bat 里用 WB_BACKUP_DIR 设置，默认 server\data\backups。
cd /d "%~dp0.."
if not exist .venv\Scripts\python.exe (
  echo 还没装好，请先双击 start.bat 启动一次。
  pause
  exit /b 1
)
if exist scripts\env.bat call scripts\env.bat
.venv\Scripts\python.exe -m app.backup
pause
