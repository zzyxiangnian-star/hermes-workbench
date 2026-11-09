<#
  工作台一键安装 / 升级（Windows，适用于任何一台装了 Hermes 桌面版的电脑）

  用法一：解压交付包后双击“安装工作台.bat”。
  用法二：不解压，直接在 PowerShell 里运行（会自己下载最新交付包）：
      powershell -NoProfile -ExecutionPolicy Bypass -Command "& ([scriptblock]::Create(((irm https://raw.githubusercontent.com/zzyxiangnian-star/hermes-workbench/main/install/install.ps1) -replace '^\uFEFF',''))) -Yes"
  用法三：让 Hermes 自己装：把 docs/给Hermes的安装指令.md 里的那段话发给 Hermes。

  它会做：
    1. 找到这台电脑上 Hermes 实际使用的数据目录（HERMES_HOME、%LOCALAPPDATA%\hermes、%USERPROFILE%\.hermes，存在几个装几个）；
    2. 插件：旧的 plugin.js 备份成 plugin.js.bak，换上新的，核对 SHA256；
    3. 后端：装到 D:\工作台（没有 D 盘就装到 %USERPROFILE%\工作台）。升级时先备份数据库，保留 data\ 和 scripts\env.bat，
       app\ 和 alembic\ 整目录替换（旧版删掉的文件一并清掉）；
    4. 准备 Python 环境（需要 Python 3.11+；没有时可以用 winget 自动装）；
    5. 桌面放“工作台后端”“工作台演示”两个快捷方式；
    6. 提示完全退出 Hermes 再打开。

  参数：
    -InstallDir <路径>   后端装到哪（默认见上）
    -HermesHome <路径>   只装到这个 Hermes 数据目录（默认自动找）
    -Start demo|normal   装完直接在新窗口启动演示 / 正式后端
    -Yes                 不提问，全部用默认（给 Hermes 等自动化用）
    -NoShortcut          不建桌面快捷方式
    -SkipPython          不准备 Python 环境（第一次双击 start.bat 时再装）
#>
[CmdletBinding()]
param(
  [string]$InstallDir = '',
  [string]$HermesHome = '',
  [ValidateSet('', 'demo', 'normal')][string]$Start = '',
  [switch]$Yes,
  [switch]$NoShortcut,
  [switch]$SkipPython,
  [string]$Source = ''
)

$ErrorActionPreference = 'Stop'
# 外部程序（pip、winget、robocopy）往 stderr 写提示时，PowerShell 5.1 在 Stop 模式下会当成错误中断；调用它们时临时放宽。
function Invoke-Native([scriptblock]$block) { $ErrorActionPreference = 'Continue'; & $block }
$Repo = 'zzyxiangnian-star/hermes-workbench'
$RawBase = "https://raw.githubusercontent.com/$Repo/main"
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}
try { [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12 } catch {}

function Say([string]$text, [string]$color = 'Gray') { Write-Host $text -ForegroundColor $color }
function Step([string]$text) { Write-Host ''; Write-Host "== $text" -ForegroundColor Cyan }
function Warn([string]$text) { Write-Host "注意：$text" -ForegroundColor Yellow }
function Fail([string]$text) { Write-Host "安装失败：$text" -ForegroundColor Red; exit 1 }
function Ask([string]$question) {
  if ($Yes) { return $true }
  $answer = Read-Host "$question [Y/n]"
  return ($answer -eq '' -or $answer -match '^[yY是]')
}

# ---------- 0. 找交付包：脚本旁边的，或者从 GitHub 下载最新的 ----------
function Find-Package([string]$dir) {
  if ($dir -and (Test-Path (Join-Path $dir 'plugin.js')) -and (Test-Path (Join-Path $dir 'server\app'))) { return (Resolve-Path $dir).Path }
  return $null
}

$pkg = $null
if ($Source) { $pkg = Find-Package $Source; if (-not $pkg) { Fail "-Source $Source 不是解压后的交付包（要有 plugin.js 和 server\）" } }
if (-not $pkg -and $PSScriptRoot) { $pkg = Find-Package (Split-Path $PSScriptRoot -Parent) }
if (-not $pkg) {
  Step '下载最新交付包'
  $tmp = Join-Path ([IO.Path]::GetTempPath()) ("workbench-" + [guid]::NewGuid().ToString('N').Substring(0, 8))
  New-Item -ItemType Directory -Force $tmp | Out-Null
  try {
    $zipName = ((Invoke-WebRequest "$RawBase/releases/latest.txt" -UseBasicParsing).Content | Out-String).Trim()
    if (-not $zipName) { throw 'releases/latest.txt 是空的' }
    $zipUrl = "$RawBase/releases/" + [uri]::EscapeDataString($zipName)
    Say "下载 $zipName ……"
    Invoke-WebRequest $zipUrl -OutFile (Join-Path $tmp 'pkg.zip') -UseBasicParsing
    Expand-Archive (Join-Path $tmp 'pkg.zip') (Join-Path $tmp 'x') -Force
  } catch { Fail "下载交付包失败（$($_.Exception.Message)）。请检查网络，或手动下载 https://github.com/$Repo/tree/main/releases 里的 zip，解压后双击其中的 安装工作台.bat。" }
  $pkg = Find-Package (Join-Path $tmp 'x\工作台')
  if (-not $pkg) { $pkg = Get-ChildItem (Join-Path $tmp 'x') -Directory | ForEach-Object { Find-Package $_.FullName } | Select-Object -First 1 }
  if (-not $pkg) { Fail '下载的交付包里没找到 plugin.js 和 server\' }
}

$versionFile = Join-Path $pkg '版本.txt'
$versionText = if (Test-Path $versionFile) { Get-Content $versionFile -Raw -Encoding UTF8 } else { '' }
$version = if ($versionText -match '工作台\s+(\S+)') { $Matches[1] } else { '未知版本' }
$expectedSha = if ($versionText -match 'SHA256\s+([0-9a-fA-F]{64})') { $Matches[1].ToUpper() } else { '' }
$pluginSrc = Join-Path $pkg 'plugin.js'
$pluginSha = (Get-FileHash $pluginSrc -Algorithm SHA256).Hash
if ($expectedSha -and $pluginSha -ne $expectedSha) { Fail "交付包里的 plugin.js 校验码不对（$($pluginSha.Substring(0,8))，应为 $($expectedSha.Substring(0,8))），包可能下载不完整，请重新下载。" }

Say ''
Say "工作台 $version 安装程序" 'White'
Say "交付包：$pkg"

# ---------- 1. 找 Hermes 数据目录 ----------
Step '查找 Hermes 数据目录'
$homes = New-Object System.Collections.Generic.List[string]
function Add-Home([string]$path) {
  if (-not $path) { return }
  $full = [IO.Path]::GetFullPath([Environment]::ExpandEnvironmentVariables($path.Trim()))
  foreach ($h in $homes) { if ($h -ieq $full) { return } }
  $homes.Add($full)
}
if ($HermesHome) {
  Add-Home $HermesHome
} else {
  foreach ($scope in 'Process', 'User', 'Machine') { Add-Home ([Environment]::GetEnvironmentVariable('HERMES_HOME', $scope)) }
  # Hermes 在 Windows 上的默认数据目录是 %LOCALAPPDATA%\hermes；老版本用过 %USERPROFILE%\.hermes。存在的都装上。
  $defaultHome = Join-Path $env:LOCALAPPDATA 'hermes'
  $legacyHome = Join-Path $env:USERPROFILE '.hermes'
  if (Test-Path $defaultHome) { Add-Home $defaultHome }
  if ((Test-Path (Join-Path $legacyHome 'desktop-plugins')) -or (Test-Path (Join-Path $legacyHome 'config.yaml'))) { Add-Home $legacyHome }
  if ($homes.Count -eq 0) {
    Warn "没找到 Hermes 的数据目录，先按默认位置 $defaultHome 安装。如果还没装 Hermes 桌面版，请先装好并打开一次。"
    Add-Home $defaultHome
  }
}
foreach ($h in $homes) { Say "  $h" }

# ---------- 2. 装插件 ----------
Step '安装插件 plugin.js'
$pluginTargets = @()
foreach ($h in $homes) {
  $dir = Join-Path $h 'desktop-plugins\hermes-workbench'
  New-Item -ItemType Directory -Force $dir | Out-Null
  $target = Join-Path $dir 'plugin.js'
  if (Test-Path $target) {
    $oldSha = (Get-FileHash $target -Algorithm SHA256).Hash
    if ($oldSha -eq $pluginSha) { Say "  已是最新：$target"; $pluginTargets += $target; continue }
    Copy-Item $target "$target.bak" -Force
    Say "  旧插件已备份：$target.bak"
  }
  Copy-Item $pluginSrc $target -Force
  if ((Get-FileHash $target -Algorithm SHA256).Hash -ne $pluginSha) { Fail "复制后校验不一致：$target" }
  Say "  已安装：$target" 'Green'
  $pluginTargets += $target
}

# ---------- 3. 装后端 ----------
Step '安装后端'
if (-not $InstallDir) {
  $dDrive = Get-PSDrive -Name D -PSProvider FileSystem -ErrorAction SilentlyContinue
  $isFixed = $false
  if ($dDrive) { try { $isFixed = ([IO.DriveInfo]'D:\').DriveType -eq 'Fixed' } catch {} }
  $InstallDir = if ($isFixed) { 'D:\工作台' } else { Join-Path $env:USERPROFILE '工作台' }
}
$InstallDir = [IO.Path]::GetFullPath($InstallDir)
$serverDst = Join-Path $InstallDir 'server'
$serverSrc = Join-Path $pkg 'server'
$samePlace = ([IO.Path]::GetFullPath($pkg).TrimEnd('\') -ieq $InstallDir.TrimEnd('\'))
Say "  位置：$InstallDir"

$listening = $null
try { $listening = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction Stop | Select-Object -First 1 } catch {}
if ($listening) {
  $proc = Get-Process -Id $listening.OwningProcess -ErrorAction SilentlyContinue
  Warn "8000 端口有程序在运行（$($proc.ProcessName)，PID $($listening.OwningProcess)），多半是旧的工作台后端窗口。装完后请关掉那个黑窗口再重新启动。"
}

$oldVersion = $null
$initPy = Join-Path $serverDst 'app\__init__.py'
if (Test-Path $initPy) {
  if ((Get-Content $initPy -Raw -Encoding UTF8) -match '__version__\s*=\s*"([^"]+)"') { $oldVersion = $Matches[1] }
  Say "  检测到已安装的版本：$oldVersion"
}

$db = Join-Path $serverDst 'data\workbench.db'
if ((Test-Path $db) -and -not $samePlace) {
  Say '  升级前备份数据库……'
  $backed = $false
  $venvPy = Join-Path $serverDst '.venv\Scripts\python.exe'
  if (Test-Path $venvPy) {
    $cmd = "cd /d `"$serverDst`" && (if exist scripts\env.bat call scripts\env.bat) && .venv\Scripts\python.exe -m app.backup"
    Invoke-Native { cmd /c $cmd 2>&1 | ForEach-Object { "$_" } | Where-Object { $_.Trim() -and $_ -ne 'System.Management.Automation.RemoteException' } | ForEach-Object { Say "    $_" } }
    $backed = ($LASTEXITCODE -eq 0)
  }
  if (-not $backed) {
    $bdir = Join-Path $serverDst 'data\backups\升级前'
    New-Item -ItemType Directory -Force $bdir | Out-Null
    $copy = Join-Path $bdir ("workbench-" + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.db')
    Copy-Item $db $copy -Force
    Say "    已复制一份数据库：$copy"
  }
}

if ($samePlace) {
  Say '  交付包就解压在安装位置，不用复制后端文件。'
} else {
  New-Item -ItemType Directory -Force $serverDst | Out-Null
  function Robo([string[]]$roboArgs) {
    Invoke-Native { & robocopy @roboArgs /NJH /NJS /NFL /NDL /NP | Out-Null }
    if ($LASTEXITCODE -ge 8) { Fail "复制文件出错（robocopy $LASTEXITCODE）：$($roboArgs[0]) → $($roboArgs[1])" }
  }
  foreach ($sub in 'app', 'alembic') {
    Robo @((Join-Path $serverSrc $sub), (Join-Path $serverDst $sub), '/MIR', '/XD', '__pycache__')
  }
  Robo @($serverSrc, $serverDst, '/E', '/XD', (Join-Path $serverSrc 'app'), (Join-Path $serverSrc 'alembic'), 'data', '.venv', '__pycache__', '/XF', 'env.bat')
  foreach ($extra in Get-ChildItem $pkg -Force | Where-Object { $_.Name -ne 'server' }) {
    if ($extra.PSIsContainer) { Robo @($extra.FullName, (Join-Path $InstallDir $extra.Name), '/E') }
    else { Copy-Item $extra.FullName (Join-Path $InstallDir $extra.Name) -Force }
  }
  New-Item -ItemType Directory -Force (Join-Path $serverDst 'data') | Out-Null
  Say "  后端文件已更新（data\ 和 scripts\env.bat 保留不动）" 'Green'
}

# ---------- 4. Python 环境 ----------
function Find-Python {
  foreach ($cand in @(@('py', '-3'), @('python'))) {
    $exe = $cand[0]; $pre = @($cand | Select-Object -Skip 1)
    if (-not (Get-Command $exe -ErrorAction SilentlyContinue)) { continue }
    try {
      $out = Invoke-Native { & $exe @pre -c "import sys; print('%d.%d' % sys.version_info[:2])" 2>$null }
      if ($LASTEXITCODE -eq 0 -and $out -match '^(\d+)\.(\d+)') {
        if ([int]$Matches[1] -gt 3 -or ([int]$Matches[1] -eq 3 -and [int]$Matches[2] -ge 11)) { return [pscustomobject]@{ Exe = $exe; Pre = $pre } }
      }
    } catch {}
  }
  return $null
}

$pyReady = $false
if (-not $SkipPython) {
  Step '准备 Python 环境'
  $venvPy = Join-Path $serverDst '.venv\Scripts\python.exe'
  $python = Find-Python
  if (-not (Test-Path $venvPy) -and -not $python) {
    $winget = Get-Command winget -ErrorAction SilentlyContinue
    if ($winget -and (Ask '没找到 Python 3.11 或更新版本。用 winget 自动安装 Python 3.12？')) {
      Invoke-Native { & winget install -e --id Python.Python.3.12 --scope user --accept-package-agreements --accept-source-agreements }
      $env:Path = [Environment]::GetEnvironmentVariable('Path', 'User') + ';' + [Environment]::GetEnvironmentVariable('Path', 'Machine')
      $python = Find-Python
    }
    if (-not $python) { Warn '没有 Python 3.11+。请从 https://www.python.org/downloads/ 安装（勾选 Add python.exe to PATH），再双击桌面上的“工作台后端”。' }
  }
  if (-not (Test-Path $venvPy) -and $python) {
    Say '  创建虚拟环境……'
    $pyPre = $python.Pre
    Invoke-Native { & $python.Exe @pyPre -m venv (Join-Path $serverDst '.venv') }
  }
  if (Test-Path $venvPy) {
    $pp = Join-Path $serverDst 'pyproject.toml'; $stamp = Join-Path $serverDst '.venv\pyproject.installed'
    $same = (Test-Path $stamp) -and ((Get-FileHash $pp).Hash -eq (Get-FileHash $stamp).Hash)
    if ($same) { Say '  依赖已是最新。'; $pyReady = $true }
    else {
      Say '  安装依赖（需要联网，第一次要几分钟）……'
      Push-Location $serverDst
      Invoke-Native { & $venvPy -m pip install -q --disable-pip-version-check -e . 2>&1 | ForEach-Object { "$_" } | Where-Object { $_.Trim() -and $_ -ne 'System.Management.Automation.RemoteException' } | ForEach-Object { Say "    $_" } }
      $ok = ($LASTEXITCODE -eq 0)
      Pop-Location
      if ($ok) { Copy-Item $pp $stamp -Force; $pyReady = $true; Say '  依赖装好了。' 'Green' }
      else { Warn '依赖没装成功（网络问题，或者旧后端还开着占用文件）。关掉旧后端窗口后双击“工作台后端”会自动再装一次。' }
    }
  }
}

# ---------- 5. 快捷方式 ----------
if (-not $NoShortcut) {
  Step '桌面快捷方式'
  try {
    $desktop = [Environment]::GetFolderPath('Desktop')
    $shell = New-Object -ComObject WScript.Shell
    foreach ($item in @(@('工作台后端', 'start.bat', '每天先双击它，再打开 Hermes'), @('工作台演示', 'demo.bat', '用一套假数据启动，看效果用'))) {
      $lnk = $shell.CreateShortcut((Join-Path $desktop ($item[0] + '.lnk')))
      $lnk.TargetPath = Join-Path $serverDst ('scripts\' + $item[1])
      $lnk.WorkingDirectory = Join-Path $serverDst 'scripts'
      $lnk.Description = $item[2]
      $lnk.Save()
      Say "  $($item[0])"
    }
  } catch { Warn "快捷方式没建成：$($_.Exception.Message)" }
}

# ---------- 6. 启动 / 收尾 ----------
if ($Start) {
  $bat = if ($Start -eq 'demo') { 'demo.bat' } else { 'start.bat' }
  if ($listening) { Warn '8000 端口已被占用，没有启动新的后端。请先关掉旧的后端窗口。' }
  else {
    Start-Process -FilePath (Join-Path $serverDst "scripts\$bat") -WorkingDirectory (Join-Path $serverDst 'scripts')
    Say "已在新窗口启动 $bat。" 'Green'
  }
}

Step '完成'
Say "工作台 $version 装好了。" 'Green'
if ($oldVersion) { Say "（从 $oldVersion 升级）" }
Say "  后端：$InstallDir"
foreach ($t in $pluginTargets) { Say "  插件：$t" }
Say "  插件 SHA256：$pluginSha"
Say ''
Say '接下来：' 'White'
Say '  1. 双击桌面“工作台后端”（看效果用“工作台演示”），黑窗口不要关。'
$hermesRunning = Get-Process -Name Hermes -ErrorAction SilentlyContinue
if ($hermesRunning) { Say '  2. Hermes 正在运行：请完全退出（右下角托盘里也退出），再重新打开。' 'Yellow' }
else { Say '  2. 打开 Hermes 桌面版。' }
Say '  3. 左上角点“工作台”。'
exit 0
