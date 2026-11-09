@echo off
chcp 65001 >nul
rem 双击安装或升级工作台（插件 + 后端）。实际工作由 install\install.ps1 完成。
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install\install.ps1" %*
echo.
pause
