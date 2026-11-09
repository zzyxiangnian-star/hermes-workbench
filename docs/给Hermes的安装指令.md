# 让 Hermes 自己安装工作台

在 Hermes 桌面版里新开一个会话，把下面方框里的整段话复制发给它。Hermes 会用自己的终端工具下载并运行官方安装程序，装完把结果告诉你。

```
请帮我在这台 Windows 电脑上安装或升级“工作台”插件（https://github.com/zzyxiangnian-star/hermes-workbench）。

只做下面这些，不要改 Hermes 本身的任何文件或设置：
1. 在 PowerShell 里运行这一条命令（它会下载最新交付包，自动找到你的数据目录，把插件装进 desktop-plugins\hermes-workbench\，把后端装到 D:\工作台 或 %USERPROFILE%\工作台，准备好 Python 环境，并在桌面放快捷方式）：
   powershell -NoProfile -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create(((irm https://raw.githubusercontent.com/zzyxiangnian-star/hermes-workbench/main/install/install.ps1) -replace '^\uFEFF',''))) -Yes -Start demo"
   第一次要联网装依赖，可能要几分钟，请等它跑完。
2. 把输出最后“完成”那一段原样告诉我（版本、后端位置、插件位置、插件 SHA256）。如果有“安装失败”或“注意”，也原样告诉我。
3. 运行完后访问 http://127.0.0.1:8000/api/health ，告诉我返回的 version。
4. 最后提醒我：完全退出 Hermes（右下角托盘里也退出）再重新打开，然后左上角点“工作台”。
```

说明：
- `-Start demo` 会在新窗口用演示数据启动后端，适合先看效果。正式使用时去掉它，之后每天双击桌面“工作台后端”。
- 安装程序只写这几处：Hermes 数据目录下的 `desktop-plugins\hermes-workbench\`、后端安装目录、桌面两个快捷方式。不碰 Hermes 程序、配置和密钥。
- 已经装过的电脑，同一段话就是升级：会先备份数据库，保留 `data\` 和 `env.bat`。
