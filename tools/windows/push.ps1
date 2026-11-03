param([string]$Remote = 'origin', [string]$Branch = 'main')
# ============================================================
#  git push 助手：github.com:443 直连不通时，自动挂本地代理走可达节点
#  用法：powershell -ExecutionPolicy Bypass -File tools\windows\push.ps1
# ============================================================
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$candidates = @('140.82.112.3', '140.82.113.3', '20.27.177.113', '140.82.114.4', '20.205.243.168')

function Test-Port($h, $p) {
  $c = New-Object System.Net.Sockets.TcpClient
  try { $ok = $c.ConnectAsync($h, $p).Wait(2500) } catch { $ok = $false }
  $c.Close()
  return $ok
}

Write-Host '[..] 先试直连'
& git -C $root push $Remote $Branch
if ($LASTEXITCODE -eq 0) { Write-Host '[ok] 直连推送完成'; exit 0 }

Write-Host '[!] 直连失败（DNS 解析到的节点被挡），换用可达节点'
$ip = $null
foreach ($c in $candidates) {
  if (Test-Port $c 443) { $ip = $c; break }
}
if (-not $ip) { Write-Host '[x] 候选节点全部不可达，请检查网络或开代理'; exit 1 }
Write-Host "[ok] 使用节点 $ip"

$port = 7899
$proxy = Start-Process -FilePath 'node' -WindowStyle Hidden -PassThru `
  -ArgumentList (Join-Path $PSScriptRoot 'gh-proxy.cjs'), $ip, $port
Start-Sleep -Seconds 2

& git -C $root -c "http.proxy=http://127.0.0.1:$port" -c "https.proxy=http://127.0.0.1:$port" push $Remote $Branch
$code = $LASTEXITCODE

Stop-Process -Id $proxy.Id -Force -ErrorAction SilentlyContinue
if ($code -eq 0) { Write-Host '[ok] 推送完成（代理已停止）' } else { Write-Host "[x] 推送失败（退出码 $code）" }
exit $code
