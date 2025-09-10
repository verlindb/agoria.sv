using System.Reflection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection; // Needed for IServiceCollection.AddLogging

// Attempt to enable resource logging (as per upstream PR #5878) if the current Aspire version supports it.
// Toggle with ASPIRE_ENABLE_RESOURCE_LOGS=0 to disable.
var enableResourceLogging = Environment.GetEnvironmentVariable("ASPIRE_ENABLE_RESOURCE_LOGS") != "0";
var builder = DistributedApplication.CreateBuilder(args);

// Elevate resource log categories so they always appear (can be overridden by env Logging__LogLevel__*)
builder.Services.AddLogging(lb =>
{
    lb.AddSimpleConsole(o =>
    {
        o.SingleLine = true;
        o.TimestampFormat = "HH:mm:ss.fff ";
    });
    // Ensure resource category at least Information
    lb.AddFilter("Agoria.SV.AppHost.Resources", LogLevel.Information);
    // Orchestrator internals remain at Information (tune as needed)
    lb.AddFilter("Aspire.Hosting", LogLevel.Information);
});

try
{
    var optsField = typeof(DistributedApplicationBuilder).GetField("_options", BindingFlags.Instance | BindingFlags.NonPublic);
    var opts = optsField?.GetValue(builder);
    var prop = opts?.GetType().GetProperty("EnableResourceLogging", BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
    if (prop != null && prop.CanWrite)
    {
        prop.SetValue(opts, enableResourceLogging);
        Console.WriteLine(enableResourceLogging
            ? "[AppHost] Resource logging ENABLED via reflection (property found)."
            : "[AppHost] Resource logging explicitly disabled (ASPIRE_ENABLE_RESOURCE_LOGS=0)." );
    }
    else
    {
        Console.WriteLine("[AppHost] EnableResourceLogging property not present in current Aspire package (version likely < PR #5878 merge). Upgrade Aspire to use built-in resource logging.");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"[AppHost] Failed attempting to toggle resource logging: {ex.Message}");
}

// Backend API project (exposes HTTP/S externally for local dev)
var apiService = builder.AddProject<Projects.Agoria_SV_API>("api")
    .WithExternalHttpEndpoints();

// Optional: allow skipping frontend orchestration so it can be run manually for direct terminal logs.
var skipFrontend = Environment.GetEnvironmentVariable("FRONTEND_EXTERNAL_RUN") == "1";
if (!skipFrontend)
{
    // Orchestrated frontend (logs visible in Aspire dashboard)
    var frontend = builder.AddNpmApp("frontend", "../agoria.sv.frontend", "dev")
        .WithHttpEndpoint(port: 3001, env: "PORT")
        .WithExternalHttpEndpoints()
        .WithEnvironment("VITE_API_BASE_URL", apiService.GetEndpoint("https"))
        .WithEnvironment("VITE_USE_API", "true")
        .WithEnvironment("FORCE_COLOR", "1");
}
else
{
    Console.WriteLine("[AppHost] Skipping frontend orchestration (FRONTEND_EXTERNAL_RUN=1). Start it manually: cd agoria.sv.frontend; set PORT=3001; npm run dev");
}

builder.Build().Run();
