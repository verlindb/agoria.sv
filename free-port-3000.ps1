param([int]$Port=3000)
Write-Host "Checking port $Port..." -ForegroundColor Cyan
$lines = netstat -ano | Select-String ":$Port" | Where-Object { $_ -match 'LISTENING' }
if (-not $lines) { Write-Host "Port $Port is free." -ForegroundColor Green; exit 0 }
$pids = $lines | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique
foreach ($pid in $pids) {
  try {
    $proc = Get-Process -Id $pid -ErrorAction Stop
    Write-Host "Stopping PID $pid ($($proc.ProcessName)) using port $Port" -ForegroundColor Yellow
    Stop-Process -Id $pid -Force
  } catch {
    $err = $_
    Write-Host ("Could not stop PID {0}: {1}" -f $pid, $err) -ForegroundColor Red
  }
}
Write-Host "Port $Port freed." -ForegroundColor Green
