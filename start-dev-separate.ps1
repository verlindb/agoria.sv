# Development Startup Script for Agoria SV
# Starts backend via Aspire and frontend separately

Write-Host "🚀 Starting Agoria SV Development Environment" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Check if Aspire is running (basic check for port 17287)
$aspireRunning = $false
try {
    $response = Invoke-WebRequest -Uri "https://localhost:17287" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    $aspireRunning = $true
    Write-Host "✅ Aspire Dashboard already running" -ForegroundColor Yellow
} catch {
    Write-Host "🔧 Starting Aspire Dashboard and Backend..." -ForegroundColor Blue
}

if (-not $aspireRunning) {
    # Start Aspire in background
    Write-Host "▶️  Starting Backend API via Aspire..." -ForegroundColor Blue
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; dotnet run --project Agoria.SV.AppHost\Agoria.SV.AppHost.csproj"
    
    # Wait a bit for Aspire to start
    Write-Host "⏳ Waiting for Aspire Dashboard to start..." -ForegroundColor Blue
    Start-Sleep 5
    
    # Try to get the API endpoint from dashboard (simplified approach)
    Write-Host "🔍 Dashboard should be available at: https://localhost:17287" -ForegroundColor Green
}

# Start Frontend
Write-Host "▶️  Starting Frontend Development Server..." -ForegroundColor Blue
$frontendPath = Join-Path $PWD "agoria.sv.frontend"

if (Test-Path $frontendPath) {
    # Set environment variables for frontend
    $env:VITE_API_BASE_URL = "https://localhost:7034"  # Default Aspire API port
    $env:VITE_USE_API = "true"
    
    Write-Host "🌐 Frontend environment:" -ForegroundColor Gray
    Write-Host "   API URL: $env:VITE_API_BASE_URL" -ForegroundColor Gray
    Write-Host "   Use API: $env:VITE_USE_API" -ForegroundColor Gray
    
    # Start frontend in new window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev"
} else {
    Write-Host "❌ Frontend directory not found: $frontendPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Development Environment Started!" -ForegroundColor Green
Write-Host "📊 Aspire Dashboard: https://localhost:17287" -ForegroundColor Cyan
Write-Host "🔧 Backend API: https://localhost:7034 (check dashboard for actual port)" -ForegroundColor Cyan  
Write-Host "🌐 Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "   - Check the Aspire Dashboard for exact API endpoint" -ForegroundColor Gray
Write-Host "   - If API port differs, update VITE_API_BASE_URL in frontend terminal" -ForegroundColor Gray
Write-Host "   - Use Ctrl+C to stop services" -ForegroundColor Gray
Write-Host ""

# Open dashboard
Start-Process "https://localhost:17287"
