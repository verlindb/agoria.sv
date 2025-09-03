using Agoria.SV.Application;
using Agoria.SV.Application.Features.TechnicalBusinessUnits.Commands.CreateTechnicalBusinessUnit;
using Agoria.SV.Application.Features.TechnicalBusinessUnits.Commands.UpdateTechnicalBusinessUnit;
using Agoria.SV.Application.Features.TechnicalBusinessUnits.Commands.DeleteTechnicalBusinessUnit;
using Agoria.SV.Application.Features.TechnicalBusinessUnits.Commands.BulkUpsertTechnicalBusinessUnits;
using Agoria.SV.Application.Features.TechnicalBusinessUnits.Queries.GetAllTechnicalBusinessUnits;
using Agoria.SV.Application.Features.TechnicalBusinessUnits.Queries.GetTechnicalBusinessUnitById;
using Agoria.SV.Application.Features.Employees.Commands.CreateEmployee;
using Agoria.SV.Application.Features.Employees.Commands.UpdateEmployee;
using Agoria.SV.Application.Features.Employees.Commands.DeleteEmployee;
using Microsoft.AspNetCore.Mvc;
using Agoria.SV.Application.Features.Employees.Commands.BulkUpsertEmployees;
using Agoria.SV.Application.Features.Employees.Queries.GetAllEmployees;
using Agoria.SV.Application.Features.Employees.Queries.GetEmployeeById;
using Agoria.SV.Application.Features.Employees.Queries.SearchEmployees;
using Agoria.SV.Application.Features.Companies.Commands.CreateCompany;
using Agoria.SV.Application.Features.Companies.Commands.DeleteCompany;
using Agoria.SV.Application.Features.Companies.Commands.UpdateCompany;
using Agoria.SV.Application.Features.Companies.Queries.GetAllCompanies;
using Agoria.SV.Application.Features.Companies.Queries.GetCompanyById;
using Agoria.SV.Application.Features.Companies.Queries.SearchCompanies;
using Agoria.SV.Application.Features.TechnicalBusinessUnits.Queries.SearchTechnicalBusinessUnits;
using Agoria.SV.Application.Features.WorksCouncil.Commands.AddMember;
using Agoria.SV.Application.Features.WorksCouncil.Commands.RemoveMember;
using Agoria.SV.Application.Features.WorksCouncil.Commands.BulkAddMembers;
using Agoria.SV.Application.Features.WorksCouncil.Commands.BulkRemoveMembers;
using Agoria.SV.Application.Features.WorksCouncil.Commands.ReorderMembers;
using Agoria.SV.Application.Features.WorksCouncil.Queries.GetMembers;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Infrastructure;
using Agoria.SV.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins(
                      "http://localhost:3000",
                      "http://localhost:3001",
                      "http://localhost:3002",
                      "http://localhost:3003",
                      "http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Add OpenAPI/Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "Agoria SV API";
    config.Version = "v1";
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
    
    // Auto-create database and run migrations
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
}

app.UseCors("AllowReactApp");

// API Endpoints
var api = app.MapGroup("/api");

// New Companies endpoints (alias for Juridische Entiteiten)
var companies = api.MapGroup("/companies")
    .WithTags("Companies");

companies.MapGet("/", async (ISender mediator, CancellationToken ct) =>
{
    var result = await mediator.Send(new GetAllCompaniesQuery(), ct);
    return Results.Ok(result);
})
.WithName("GetAllCompanies")
.Produces(StatusCodes.Status200OK);

companies.MapGet("/search", async (
    string? q,
    string? searchTerm,
    string? type,
    string? status,
    string? sector,
    string? city,
    string? postalCode,
    string? country,
    ISender mediator,
    CancellationToken ct) =>
{
    var term = string.IsNullOrWhiteSpace(q) ? searchTerm : q;
    var query = new SearchCompaniesQuery(term, type, status, sector, city, postalCode, country);
    var result = await mediator.Send(query, ct);
    return Results.Ok(result);
})
.WithName("SearchCompanies")
.Produces(StatusCodes.Status200OK);

companies.MapGet("/{id:guid}", async (Guid id, ISender mediator, CancellationToken ct) =>
{
    var result = await mediator.Send(new GetCompanyByIdQuery(id), ct);
    return result == null ? Results.NotFound() : Results.Ok(result);
})
.WithName("GetCompanyById")
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status404NotFound);

companies.MapPost("/", async (CreateCompanyCommand command, ISender mediator, CancellationToken ct) =>
{
    var result = await mediator.Send(command, ct);
    return Results.Created($"/api/companies/{result.Id}", result);
})
.WithName("CreateCompany")
.Produces(StatusCodes.Status201Created)
.Produces(StatusCodes.Status400BadRequest);

companies.MapPut("/{id:guid}", async (Guid id, UpdateCompanyCommand command, ISender mediator, CancellationToken ct) =>
{
    if (id != command.Id)
        return Results.BadRequest("ID mismatch");

    try
    {
        var result = await mediator.Send(command, ct);
        return Results.Ok(result);
    }
    catch (KeyNotFoundException)
    {
        return Results.NotFound();
    }
})
.WithName("UpdateCompany")
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status404NotFound);

companies.MapDelete("/{id:guid}", async (Guid id, ISender mediator, CancellationToken ct) =>
{
    var result = await mediator.Send(new DeleteCompanyCommand(id), ct);
    return result ? Results.NoContent() : Results.NotFound();
})
.WithName("DeleteCompany")
.Produces(StatusCodes.Status204NoContent)
.Produces(StatusCodes.Status404NotFound);

companies.MapPost("/import", async (List<CreateCompanyCommand> items, ISender mediator, CancellationToken ct) =>
{
    var created = new List<Agoria.SV.Application.DTOs.CompanyDto>();
    foreach (var item in items)
    {
        var result = await mediator.Send(item, ct);
        created.Add(result);
    }
    return Results.Ok(created);
})
.WithName("BulkImportCompanies")
.Produces(StatusCodes.Status200OK);

// Technical Business Units endpoints
var technicalUnits = api.MapGroup("/technical-units")
    .WithTags("Technical Business Units");

technicalUnits.MapGet("/", async (ISender mediator, CancellationToken ct) =>
{
    var result = await mediator.Send(new GetAllTechnicalBusinessUnitsQuery(), ct);
    return Results.Ok(result);
})
.WithName("GetAllTechnicalBusinessUnits")
.Produces(StatusCodes.Status200OK);

technicalUnits.MapGet("/search", async (
    string? q,
    string? searchTerm,
    string? status,
    string? department,
    string? language,
    string? city,
    string? postalCode,
    string? country,
    ISender mediator,
    CancellationToken ct) =>
{
    var term = string.IsNullOrWhiteSpace(q) ? searchTerm : q;
    var query = new SearchTechnicalBusinessUnitsQuery(term, status, department, language, city, postalCode, country);
    var result = await mediator.Send(query, ct);
    return Results.Ok(result);
})
.WithName("SearchTechnicalBusinessUnits")
.Produces(StatusCodes.Status200OK);

technicalUnits.MapGet("/{id:guid}", async (Guid id, ISender mediator, CancellationToken ct) =>
{
    var result = await mediator.Send(new GetTechnicalBusinessUnitByIdQuery(id), ct);
    return result == null ? Results.NotFound() : Results.Ok(result);
})
.WithName("GetTechnicalBusinessUnitById")
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status404NotFound);

technicalUnits.MapPost("/", async (CreateTechnicalBusinessUnitCommand command, ISender mediator, CancellationToken ct) =>
{
    var result = await mediator.Send(command, ct);
    return Results.Created($"/api/technical-units/{result.Id}", result);
})
.WithName("CreateTechnicalBusinessUnit")
.Produces(StatusCodes.Status201Created)
.Produces(StatusCodes.Status400BadRequest);

technicalUnits.MapPut("/{id:guid}", async (Guid id, UpdateTechnicalBusinessUnitCommand command, ISender mediator, CancellationToken ct) =>
{
    if (id != command.Id)
        return Results.BadRequest("ID mismatch");

    try
    {
        var result = await mediator.Send(command, ct);
        return Results.Ok(result);
    }
    catch (KeyNotFoundException)
    {
        return Results.NotFound();
    }
})
.WithName("UpdateTechnicalBusinessUnit")
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status404NotFound);

technicalUnits.MapDelete("/{id:guid}", async (Guid id, ISender mediator, CancellationToken ct) =>
{
    var result = await mediator.Send(new DeleteTechnicalBusinessUnitCommand(id), ct);
    return result ? Results.NoContent() : Results.NotFound();
})
.WithName("DeleteTechnicalBusinessUnit")
.Produces(StatusCodes.Status204NoContent)
.Produces(StatusCodes.Status404NotFound);

technicalUnits.MapPost("/import", async (List<CreateTechnicalBusinessUnitCommand> items, ISender mediator, CancellationToken ct) =>
{
    var command = new BulkUpsertTechnicalBusinessUnitsCommand(items);
    var result = await mediator.Send(command, ct);
    return Results.Ok(result);
})
.WithName("BulkImportTechnicalBusinessUnits")
.Produces(StatusCodes.Status200OK);

// Employee endpoints
var employees = api.MapGroup("/employees")
    .WithTags("Employees");

employees.MapGet("/", async (ISender mediator, CancellationToken ct) =>
{
    var result = await mediator.Send(new GetAllEmployeesQuery(), ct);
    return Results.Ok(result);
})
.WithName("GetAllEmployees")
.Produces(StatusCodes.Status200OK);

employees.MapGet("/{id:guid}", async (Guid id, ISender mediator, CancellationToken ct) =>
{
    var result = await mediator.Send(new GetEmployeeByIdQuery(id), ct);
    return result == null ? Results.NotFound() : Results.Ok(result);
})
.WithName("GetEmployeeById")
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status404NotFound);

employees.MapPost("/", async (CreateEmployeeCommand command, ISender mediator, CancellationToken ct) =>
{
    var result = await mediator.Send(command, ct);
    return Results.Created($"/api/employees/{result.Id}", result);
})
.WithName("CreateEmployee")
.Produces(StatusCodes.Status201Created)
.Produces(StatusCodes.Status400BadRequest);

employees.MapPut("/{id:guid}", async (Guid id, UpdateEmployeeCommand command, ISender mediator, CancellationToken ct) =>
{
    if (id != command.Id)
        return Results.BadRequest("ID mismatch");

    try
    {
        var result = await mediator.Send(command, ct);
        return Results.Ok(result);
    }
    catch (KeyNotFoundException)
    {
        return Results.NotFound();
    }
})
.WithName("UpdateEmployee")
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status404NotFound);

employees.MapDelete("/{id:guid}", async (Guid id, ISender mediator, CancellationToken ct) =>
{
    var result = await mediator.Send(new DeleteEmployeeCommand(id), ct);
    return result ? Results.NoContent() : Results.NotFound();
})
.WithName("DeleteEmployee")
.Produces(StatusCodes.Status204NoContent)
.Produces(StatusCodes.Status404NotFound);

employees.MapPost("/import", async (List<CreateEmployeeCommand> items, ISender mediator, CancellationToken ct) =>
{
    var command = new BulkUpsertEmployeesCommand(items);
    var result = await mediator.Send(command, ct);
    return Results.Ok(result);
})
.WithName("BulkImportEmployees")
.Produces(StatusCodes.Status200OK);

employees.MapGet("/search", async (
    string? q,
    string? technicalBusinessUnitId,
    string? role,
    string? status,
    string? email,
    ISender mediator,
    CancellationToken ct) =>
{
    var query = new SearchEmployeesQuery(q, technicalBusinessUnitId, role, status, email);
    var result = await mediator.Send(query, ct);
    return Results.Ok(result);
})
.WithName("SearchEmployees")
.Produces(StatusCodes.Status200OK);

// Works Council endpoints
var worksCouncil = api.MapGroup("/works-council")
    .WithTags("Works Council");

// Get members for a technical business unit (with optional category filter)
worksCouncil.MapGet("/{technicalBusinessUnitId:guid}/members", async (
    Guid technicalBusinessUnitId,
    string? category,
    ISender mediator,
    CancellationToken ct) =>
{
    var result = await mediator.Send(new GetMembersQuery(technicalBusinessUnitId, category), ct);
    return Results.Ok(result);
})
.WithName("GetWorksCouncilMembers")
.Produces(StatusCodes.Status200OK);

// Add a member to a category
worksCouncil.MapPost("/{technicalBusinessUnitId:guid}/members", async (
    Guid technicalBusinessUnitId,
    [FromBody] AddOrMembershipRequestDto request,
    ISender mediator,
    CancellationToken ct) =>
{
    try
    {
        var command = new AddMemberCommand(request.EmployeeId, request.Category);
        var result = await mediator.Send(command, ct);
        return Results.Ok(result);
    }
    catch (KeyNotFoundException ex)
    {
        return Results.NotFound(ex.Message);
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(ex.Message);
    }
})
.WithName("AddWorksCouncilMember")
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status404NotFound);

// Remove a member from a category
worksCouncil.MapDelete("/{technicalBusinessUnitId:guid}/members", async (
    Guid technicalBusinessUnitId,
    [FromBody] RemoveOrMembershipRequestDto request,
    ISender mediator,
    CancellationToken ct) =>
{
    try
    {
        var command = new RemoveMemberCommand(request.EmployeeId, request.Category);
        var result = await mediator.Send(command, ct);
        return Results.Ok(result);
    }
    catch (KeyNotFoundException ex)
    {
        return Results.NotFound(ex.Message);
    }
})
.WithName("RemoveWorksCouncilMember")
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status404NotFound);

// Bulk add members to a category
worksCouncil.MapPost("/{technicalBusinessUnitId:guid}/members/bulk-add", async (
    Guid technicalBusinessUnitId,
    [FromBody] BulkOrMembershipRequestDto request,
    ISender mediator,
    CancellationToken ct) =>
{
    try
    {
        var command = new BulkAddMembersCommand(technicalBusinessUnitId, request.EmployeeIds, request.Category);
        var result = await mediator.Send(command, ct);
        return Results.Ok(result);
    }
    catch (KeyNotFoundException ex)
    {
        return Results.NotFound(ex.Message);
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(ex.Message);
    }
})
.WithName("BulkAddWorksCouncilMembers")
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status404NotFound);

// Bulk remove members from a category
worksCouncil.MapPost("/{technicalBusinessUnitId:guid}/members/bulk-remove", async (
    Guid technicalBusinessUnitId,
    [FromBody] BulkOrMembershipRequestDto request,
    ISender mediator,
    CancellationToken ct) =>
{
    try
    {
        var command = new BulkRemoveMembersCommand(technicalBusinessUnitId, request.EmployeeIds, request.Category);
        var result = await mediator.Send(command, ct);
        return Results.Ok(result);
    }
    catch (KeyNotFoundException ex)
    {
        return Results.NotFound(ex.Message);
    }
})
.WithName("BulkRemoveWorksCouncilMembers")
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status404NotFound);

// Reorder members within a category
worksCouncil.MapPost("/{technicalBusinessUnitId:guid}/reorder", async (
    Guid technicalBusinessUnitId,
    [FromBody] ReorderOrMembershipRequestDto request,
    ISender mediator,
    CancellationToken ct) =>
{
    try
    {
        var command = new ReorderMembersCommand(technicalBusinessUnitId, request.Category, request.OrderedIds);
        var result = await mediator.Send(command, ct);
        return Results.Ok(result);
    }
    catch (ArgumentException ex)
    {
        return Results.BadRequest(ex.Message);
    }
})
.WithName("ReorderWorksCouncilMembers")
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status400BadRequest);

app.Run();

// Make Program class accessible for testing
public partial class Program { }
