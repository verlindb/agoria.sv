var builder = DistributedApplication.CreateBuilder(args);

// Add the backend API project only
var apiService = builder.AddProject<Projects.Agoria_SV_API>("api")
    .WithExternalHttpEndpoints();

// Frontend will be started separately
// Dashboard will still show logs and monitoring for the API

builder.Build().Run();
