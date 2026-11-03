# ============================================================
#  把本机 MySQL 8.4 注册成 Windows 服务（需要管理员权限）
#  用法：
#    右键 install-mysql-service.bat → 以管理员身份运行
#    或：powershell -ExecutionPolicy Bypass -File install-mysql-service.ps1
#  卸载：
#    net stop MySQL84
#    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --remove MySQL84
# ============================================================
$ErrorActionPreference = 'Continue'

$svcName = 'MySQL84'
$base    = 'C:\Program Files\MySQL\MySQL Server 8.4'
$dataDir = 'C:\ProgramData\MySQL\mysql84'
$ini     = Join-Path $dataDir 'my.ini'
$cfgFile = Join-Path (Join-Path (Join-Path $PSScriptRoot '..') '..') 'server\config.json'
$log     = Join-Path $env:TEMP 'mysql-service-install.log'

"" | Set-Content -Path $log -Encoding UTF8
function Say($msg) {
  $line = '[' + (Get-Date -Format 'HH:mm:ss') + '] ' + $msg
  Write-Host $line
  Add-Content -Path $log -Value $line -Encoding UTF8
}

Say '检查管理员权限'
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
  Say '[x] 当前不是管理员，请用「以管理员身份运行」重跑 install-mysql-service.bat'
  exit 1
}

if (-not (Test-Path $ini)) { Say "[x] 找不到配置文件：$ini"; exit 1 }
Say "配置：$ini"

# ---------- 1. 先停掉以进程方式跑着的实例（服务启动需要独占 datadir） ----------
$cred = $null
try { $cred = (Get-Content $cfgFile -Raw -Encoding UTF8 | ConvertFrom-Json).mysql } catch { }
if ($cred) {
  Say "优雅关闭现有 mysqld（用 $($cred.user) 账号）"
  & "$base\bin\mysqladmin.exe" -h 127.0.0.1 -P ([int]$cred.port) -u $cred.user "-p$($cred.password)" shutdown 2>$null | Out-Null
  Start-Sleep -Seconds 3
}
$left = Get-Process mysqld -ErrorAction SilentlyContinue
if ($left) {
  Say "仍有 $($left.Count) 个 mysqld 进程，强制结束"
  $left | Stop-Process -Force -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 3
}
if (Get-Process mysqld -ErrorAction SilentlyContinue) { Say '[x] mysqld 未能停止，请手动结束后重试'; exit 1 }
Say '现有实例已停止'

# ---------- 2. 注册服务 ----------
$existing = Get-Service -Name $svcName -ErrorAction SilentlyContinue
if ($existing) {
  Say "服务 $svcName 已存在，先移除旧注册"
  & "$base\bin\mysqld.exe" --remove $svcName 2>&1 | Out-Null
  Start-Sleep -Seconds 2
}

Say "执行：mysqld --install $svcName --defaults-file=`"$ini`""
$out = & "$base\bin\mysqld.exe" --install $svcName "--defaults-file=$ini" 2>&1
$out | ForEach-Object { Say ('  ' + $_) }
if (-not (Get-Service -Name $svcName -ErrorAction SilentlyContinue)) {
  Say '[x] 服务注册失败，请看上面的输出'
  exit 1
}

# ---------- 3. 设为自动启动并拉起 ----------
Say '设置启动类型：自动'
Set-Service -Name $svcName -StartupType Automatic
Say '启动服务'
Start-Service -Name $svcName
Start-Sleep -Seconds 6

$svc = Get-Service -Name $svcName
Say "服务状态：$($svc.Status) / 启动类型：$((Get-Service $svcName).StartType)"

# ---------- 4. 验证能连上 ----------
if ($cred) {
  $ping = & "$base\bin\mysqladmin.exe" -h 127.0.0.1 -P ([int]$cred.port) -u $cred.user "-p$($cred.password)" ping 2>&1
  Say "连通性：$($ping -join ' ')"
}
$listen = Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue
Say ('端口 3306 监听：' + $(if ($listen) { '是' } else { '否' }))
Say "完成后可关闭本窗口。日志：$log"
