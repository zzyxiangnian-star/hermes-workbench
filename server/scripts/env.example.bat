@echo off
rem 复制成 env.bat 再改。env.bat 不进仓库。
rem 报表文件夹：子文件夹名 = 店铺名，放进去的表每 10 分钟自动导入
rem set WB_IMPORT_DIR=D:\工作台报表
rem set WB_IMPORT_EVERY=10
rem 早报时间和推送地址（地址是机密，不要发到群里或提交到仓库）
rem set WB_DAILY_AT=08:30
rem set WB_FEISHU_WEBHOOK=
rem set WB_WECOM_WEBHOOK=
rem 设计稿和素材存放位置（默认 server\data\assets），单个文件上限（MB）
rem set WB_ASSET_DIR=D:\工作台素材
rem set WB_ASSET_MAX_MB=50
rem 设计助手交图时允许读取的 Hermes 生图目录（默认 %USERPROFILE%\.hermes），多个用分号隔开
rem set WB_AI_IMAGE_DIRS=
rem 备份：每天 12:30 自动备份数据库和素材（off 关掉），只留最近 14 份数据库快照
rem 建议放到另一块硬盘或网盘同步文件夹
rem set WB_BACKUP_DIR=E:\工作台备份
rem set WB_BACKUP_AT=12:30
rem set WB_BACKUP_KEEP=14
