# .NET Aspire Setup Notes

## Overview
This project now includes .NET Aspire orchestration to easily start and manage both the frontend (React/Vite) and backend (.NET API) services together. Aspire provides a unified development experience with service discovery, telemetry, and monitoring.

## Project Structure

```
├── Agoria.SV.AppHost/                 # 🎯 Aspire Orchestrator
│   ├── AppHost.cs                     # Main orchestration configuration
│   ├── Properties/launchSettings.json # Dashboard ports and settings
│   └── Agoria.SV.AppHost.csproj       # Includes Aspire.Hosting packages
│
├── Agoria.SV.ServiceDefaults/         # 🛠️ Shared Configuration
│   ├── Extensions.cs                  # Service defaults (telemetry, health checks)
│   └── Agoria.SV.ServiceDefaults.csproj
│
├── agoria.sv.backend/                 # 🔧 Backend API (Updated)
│   └── src/Agoria.SV.API/
│       └── Program.cs                 # Now includes builder.AddServiceDefaults()
│
└── agoria.sv.frontend/                # 🌐 Frontend (Orchestrated)
    ├── package.json                   # Npm scripts for dev server
    └── ...
```

## Key Features Implemented

### ✅ Single Command Startup
- **Command**: `dotnet run --project Agoria.SV.AppHost\Agoria.SV.AppHost.csproj`
- **VS Code Task**: `run-aspire` (Ctrl+Shift+P → "Tasks: Run Task" → "run-aspire")
- **What it does**: Starts both frontend and backend automatically

### ✅ Service Discovery
- Backend API automatically discovered by frontend
- Environment variables automatically configured:
  - `VITE_API_BASE_URL` → Points to backend API endpoint
  - `VITE_USE_API=true` → Enables API integration

### ✅ Aspire Dashboard
- **URL**: `https://localhost:17287` (auto-opens)
- **Features**:
  - Real-time service status
  - Live logs from both services
  - Resource monitoring
  - Health checks
  - Request tracing
  - Metrics visualization

### ✅ Enhanced Backend
- Service defaults for resilience and telemetry
- Health check endpoints (`/health`, `/alive`)
- OpenTelemetry integration
- Automatic service discovery registration

## How to Use

### Starting the Application
```bash
# Option 1: Direct command
dotnet run --project Agoria.SV.AppHost\Agoria.SV.AppHost.csproj

# Option 2: VS Code task
# Press Ctrl+Shift+P → "Tasks: Run Task" → "run-aspire"

# Option 3: VS Code terminal task
# Press Ctrl+Shift+` → Select "run-aspire" from dropdown
```

### Accessing Services
- **Aspire Dashboard**: `https://localhost:17287`
- **Backend API**: Check dashboard for assigned port (usually `https://localhost:52790`)
- **Frontend**: Check dashboard for assigned port (usually `http://localhost:3001`)
- **API Swagger**: Backend endpoint + `/swagger`

### Stopping Services
- **Keyboard**: `Ctrl+C` in the terminal running AppHost
- **VS Code**: Use the stop button in the terminal panel
- **PowerShell**: `Stop-Process -Name "Agoria.SV.AppHost" -Force`

## Configuration Details

### AppHost Configuration (`AppHost.cs`)
```csharp
// Backend API - Orchestrated as .NET project
var apiService = builder.AddProject<Projects.Agoria_SV_API>("api")
    .WithExternalHttpEndpoints();

// Frontend - Orchestrated as Node.js NPM app
var frontend = builder.AddNpmApp("frontend", "../agoria.sv.frontend", "dev")
    .WithHttpEndpoint(port: 3000, env: "PORT")
    .WithExternalHttpEndpoints()
    .WithEnvironment("VITE_API_BASE_URL", apiService.GetEndpoint("https"))
    .WithEnvironment("VITE_USE_API", "true");
```

### Service Defaults Features
- **Resilience**: HTTP retry policies and circuit breakers
- **Service Discovery**: Automatic endpoint resolution
- **Telemetry**: OpenTelemetry tracing, metrics, and logging
- **Health Checks**: `/health` and `/alive` endpoints

### Environment Variables
The frontend automatically receives these environment variables:
- `VITE_API_BASE_URL`: Backend API base URL (e.g., `https://localhost:52790`)
- `VITE_USE_API`: Set to `"true"` to enable API calls
- `PORT`: Frontend port (set to 3000)

## Troubleshooting

### Common Issues

#### 🚨 Frontend TCP Connection Errors
**Error**: `Could not establish TCP connection to endpoint: dial tcp [::1]:65342: connectex: No connection could be made because the target machine actively refused it.`

**Problem**: The frontend Node.js process isn't starting or binding to the expected port.

**Solutions** (try in order):

1. **Check Node.js Installation**:
   ```bash
   node --version  # Should show v18+ 
   npm --version   # Should show v9+
   ```

2. **Install Frontend Dependencies**:
   ```bash
   cd agoria.sv.frontend
   npm install
   ```

3. **Test Frontend Independently**:
   ```bash
   cd agoria.sv.frontend
   npm run dev
   # Should start on http://localhost:3001 or next available port
   ```

4. **Alternative AppHost Configuration** (if NPM app keeps failing):
   ```csharp
   // In AppHost.cs - Replace AddNpmApp with AddExecutable
   var frontend = builder.AddExecutable("frontend", "npm", "../agoria.sv.frontend", "run", "dev")
       .WithWorkingDirectory("../agoria.sv.frontend")
       .WithExternalHttpEndpoints()
       .WithEnvironment("VITE_API_BASE_URL", apiService.GetEndpoint("https"))
       .WithEnvironment("VITE_USE_API", "true");
   ```

5. **Manual Two-Service Approach** (Recommended workaround):
   ```bash
   # Terminal 1: Start AppHost with backend only
   # First, comment out the frontend configuration in AppHost.cs
   dotnet run --project Agoria.SV.AppHost\Agoria.SV.AppHost.csproj
   
   # Terminal 2: Start frontend manually with proper API endpoint
   cd agoria.sv.frontend
   $env:VITE_API_BASE_URL="https://localhost:7034"  # Check dashboard for actual backend port
   $env:VITE_USE_API="true"
   npm run dev
   ```

   **Quick Setup**: Use the provided PowerShell script:
   ```powershell
   # Create a quick-start script
   ./start-dev-separate.ps1
   ```

#### 1. "Node.js not found" Error
**Problem**: Frontend doesn't start because npm/node is not in PATH
```bash
# Solution: Ensure Node.js is installed and in PATH
node --version
npm --version
```

#### 2. Port Already in Use
**Problem**: Default ports are occupied by other services
**Solution**: 
- Stop conflicting services
- Or let Aspire auto-assign different ports (check dashboard)

#### 3. Frontend Dependencies Missing
**Problem**: NPM packages not installed
```bash
# Solution: Install dependencies
cd agoria.sv.frontend
npm install
```

#### 4. API Service Won't Start
**Problem**: Database connection or other backend issues
**Check**: 
- Database is running (LocalDB)
- Connection strings in `appsettings.json`
- Check dashboard logs for detailed error messages

#### 5. Dashboard Not Loading
**Problem**: Certificate issues or firewall
**Solution**:
- Accept the self-signed certificate when prompted
- Try the HTTP version: `http://localhost:15102`

### Debug Information
```bash
# Check Aspire version
dotnet --list-sdks

# Verify packages are installed
dotnet list package --include-transitive | findstr Aspire

# Check process status
Get-Process | Where-Object {$_.Name -like "*Agoria*"}
```

## VS Code Integration

### Tasks (`/.vscode/tasks.json`)
- `run-aspire`: Start Aspire AppHost
- `build-aspire`: Build AppHost project
- (Original tasks still available for individual service startup)

### Launch Configuration
- Chrome debugging for frontend still works
- Backend API can be debugged through Aspire dashboard

## Benefits Over Manual Startup

| Feature | Manual | With Aspire |
|---------|--------|-------------|
| **Startup** | Multiple terminal windows | Single command |
| **Service Discovery** | Manual URL configuration | Automatic |
| **Monitoring** | Separate tools needed | Built-in dashboard |
| **Logs** | Multiple consoles | Centralized view |
| **Health Checks** | Manual testing | Automatic monitoring |
| **Environment Setup** | Manual env vars | Automatic configuration |
| **Development Flow** | Context switching | Unified experience |

## Advanced Configuration

### Adding More Services
```csharp
// Example: Adding a database
var database = builder.AddSqlServer("sql")
    .AddDatabase("AgoriaSVDb", "agoria-db");

// Reference in API
var apiService = builder.AddProject<Projects.Agoria_SV_API>("api")
    .WithReference(database)
    .WithExternalHttpEndpoints();
```

### Custom Environment Variables
```csharp
var frontend = builder.AddNpmApp("frontend", "../agoria.sv.frontend", "dev")
    .WithEnvironment("VITE_CUSTOM_CONFIG", "development")
    .WithEnvironment("VITE_FEATURE_FLAGS", "true");
```

### Port Configuration
```csharp
// Fixed port
.WithHttpEndpoint(port: 3000)

// Port range
.WithHttpEndpoint(targetPort: 3000, port: 3001)
```

## Production Considerations

### Deployment
- Aspire can generate deployment manifests for Azure Container Apps
- Use `azd` (Azure Developer CLI) for cloud deployment
- Production apps should use separate orchestration (Docker Compose, Kubernetes)

### Security
- Development certificates are auto-generated for HTTPS
- Production requires proper SSL certificates
- Service-to-service authentication should be implemented

### Monitoring
- Aspire dashboard is for development only
- Production monitoring: Application Insights, Prometheus, etc.
- Use `builder.Services.AddOpenTelemetry()` for production telemetry

## Next Steps

1. **Add Database Orchestration**: Include LocalDB or SQL Server in Aspire
2. **Add Redis Caching**: For session state and output caching  
3. **Implement Health Checks**: Custom health checks for business logic
4. **Add Integration Tests**: Test services through Aspire orchestration
5. **Explore Deployment**: Use `azd` for Azure deployment

## Resources

- [.NET Aspire Documentation](https://learn.microsoft.com/en-us/dotnet/aspire/)
- [Aspire Community Samples](https://github.com/dotnet/aspire-samples)
- [Service Discovery in .NET Aspire](https://learn.microsoft.com/en-us/dotnet/aspire/service-discovery/overview)
- [Aspire Dashboard Overview](https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/dashboard/overview)

---

## Quick Reference Commands

```bash
# Start everything
dotnet run --project Agoria.SV.AppHost\Agoria.SV.AppHost.csproj

# Build AppHost
dotnet build Agoria.SV.AppHost\Agoria.SV.AppHost.csproj

# Clean build
dotnet clean Agoria.SV.AppHost\Agoria.SV.AppHost.csproj

# Stop services
# Ctrl+C or Stop-Process -Name "Agoria.SV.AppHost" -Force
```

**Dashboard URL**: `https://localhost:17287`
