# Aspire Quick Start Guide

## 🚀 Getting Started

### Start Both Services (Recommended)
```bash
dotnet run --project Agoria.SV.AppHost\Agoria.SV.AppHost.csproj
```
**Opens**: Aspire Dashboard at `https://localhost:17287`

### VS Code Integration
- **Command Palette**: `Ctrl+Shift+P` → "Tasks: Run Task" → "run-aspire"
- **Terminal Dropdown**: Select "run-aspire" task

---

## 📊 What You Get

| Service | Status | Access |
|---------|---------|--------|
| **Aspire Dashboard** | ✅ Running | `https://localhost:17287` |
| **Backend API** | 🔄 Auto-detected | Check dashboard for URL |
| **Frontend React** | 🔄 Auto-detected | Check dashboard for URL |
| **Swagger UI** | 🔄 Auto-available | Backend URL + `/swagger` |

---

## 🔧 Common Tasks

### ✅ Development Workflow
```bash
# 1. Start everything with Aspire
dotnet run --project Agoria.SV.AppHost\Agoria.SV.AppHost.csproj

# 2. Open dashboard (auto-opens)
# https://localhost:17287

# 3. Access frontend from dashboard
# Click on 'frontend' endpoint

# 4. Access API from dashboard  
# Click on 'api' endpoint

# 5. Stop everything
# Ctrl+C in terminal
```

### 🛠️ Troubleshooting
```bash
# Check if services are running
Get-Process | Where-Object {$_.Name -like "*Agoria*"}

# Kill stuck processes
Stop-Process -Name "Agoria.SV.AppHost" -Force
Stop-Process -Name "node" -Force

# Clean build
dotnet clean Agoria.SV.AppHost\Agoria.SV.AppHost.csproj
dotnet build Agoria.SV.AppHost\Agoria.SV.AppHost.csproj

# Install frontend dependencies
cd agoria.sv.frontend && npm install
```

### 📱 Individual Service Testing
```bash
# Test backend only
cd agoria.sv.backend
dotnet run --project src/Agoria.SV.API/Agoria.SV.API.csproj

# Test frontend only  
cd agoria.sv.frontend
npm run dev
```

---

## 🎯 Key Files Modified

- ✅ `Agoria.SV.AppHost/AppHost.cs` - Orchestration config
- ✅ `agoria.sv.backend/src/Agoria.SV.API/Program.cs` - Added service defaults
- ✅ `.vscode/tasks.json` - Added Aspire tasks
- ✅ Backend now includes ServiceDefaults for telemetry & health checks

---

## 🌟 Benefits

| Before | After |
|--------|-------|
| Start backend manually | ✅ Single command |
| Start frontend manually | ✅ Auto-started |
| Configure API URLs | ✅ Auto-configured |
| Monitor services separately | ✅ Unified dashboard |
| Check logs in multiple places | ✅ Centralized logs |
| Manual health checking | ✅ Built-in health checks |

---

## 🔗 Quick Links

- **Dashboard**: `https://localhost:17287`
- **Full Documentation**: `ASPIRE-SETUP-NOTES.md`
- **VS Code Tasks**: `Ctrl+Shift+P` → "Tasks: Run Task"
- **.NET Aspire Docs**: https://learn.microsoft.com/dotnet/aspire/
