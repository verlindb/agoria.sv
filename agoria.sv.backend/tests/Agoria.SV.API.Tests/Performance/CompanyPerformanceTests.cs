using Xunit;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Application.Features.Companies.Commands.CreateCompany;
using NBomber.CSharp;
using System.Net.Http.Json;
using Xunit;
using System.Text.Json;

namespace Agoria.SV.API.Tests.Performance;

public class CompanyPerformanceTests
{
    [Fact]
    public void BulkCreateCompanies_PerformanceTest()
    {
        var factory = new TestWebApplicationFactory<Program>();
        var httpClient = factory.CreateClient();

        var scenario = Scenario.Create("bulk_create_companies", async context =>
        {
            var command = new CreateCompanyCommand(
                $"Performance Test Company {context.ScenarioInfo.CurrentOperation}",
                $"Performance Test Company {context.ScenarioInfo.CurrentOperation} NV",
                $"BE{Random.Shared.Next(100000000, 999999999)}",
                "Corporation",
                "Active",
                "Technology",
                Random.Shared.Next(10, 1000),
                new AddressDto 
                { 
                    Street = "Performance Street", 
                    Number = context.ScenarioInfo.CurrentOperation.ToString(), 
                    PostalCode = "1000", 
                    City = "Brussels", 
                    Country = "Belgium" 
                },
                new ContactPersonDto 
                { 
                    FirstName = "Performance", 
                    LastName = "Test", 
                    Email = $"performance{context.ScenarioInfo.CurrentOperation}@test.com", 
                    PhoneNumber = "+32123456789" 
                }
            );

            using var response = await httpClient.PostAsJsonAsync("/api/companies", command);
            
            return response.IsSuccessStatusCode ? Response.Ok() : Response.Fail();
        })
        .WithLoadSimulations(
            Simulation.InjectPerSec(rate: 10, during: TimeSpan.FromSeconds(30))
        );

        NBomberRunner
            .RegisterScenarios(scenario)
            .Run();

        factory.Dispose();
    }

    [Fact]
    public void SearchCompanies_PerformanceTest()
    {
        var factory = new TestWebApplicationFactory<Program>();
        var httpClient = factory.CreateClient();

        var searchTerms = new[] { "Tech", "Corp", "Ltd", "NV", "BVBA", "Innovation", "Software", "Services" };

        var scenario = Scenario.Create("search_companies", async context =>
        {
            var searchTerm = searchTerms[Random.Shared.Next(searchTerms.Length)];
            
            using var response = await httpClient.GetAsync($"/api/companies/search?q={searchTerm}");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var companies = JsonSerializer.Deserialize<List<CompanyDto>>(content, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                });
                
                return Response.Ok();
            }
            
            return Response.Fail();
        })
        .WithLoadSimulations(
            Simulation.InjectPerSec(rate: 20, during: TimeSpan.FromSeconds(30))
        );

        NBomberRunner
            .RegisterScenarios(scenario)
            .Run();

        factory.Dispose();
    }

    [Fact]
    public void GetAllCompanies_PerformanceTest()
    {
        var factory = new TestWebApplicationFactory<Program>();
        var httpClient = factory.CreateClient();

        var scenario = Scenario.Create("get_all_companies", async context =>
        {
            using var response = await httpClient.GetAsync("/api/companies");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var companies = JsonSerializer.Deserialize<List<CompanyDto>>(content, new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true 
                });
                
                return Response.Ok();
            }
            
            return Response.Fail();
        })
        .WithLoadSimulations(
            Simulation.InjectPerSec(rate: 50, during: TimeSpan.FromSeconds(30))
        );

        NBomberRunner
            .RegisterScenarios(scenario)
            .Run();

        factory.Dispose();
    }

    [Fact]
    public void CrudOperations_PerformanceTest()
    {
        var factory = new TestWebApplicationFactory<Program>();
        var httpClient = factory.CreateClient();

        var scenario = Scenario.Create("crud_operations", async context =>
        {
            try
            {
                // Create
                var createCommand = new CreateCompanyCommand(
                    $"CRUD Test Company {context.ScenarioInfo.CurrentOperation}",
                    $"CRUD Test Company {context.ScenarioInfo.CurrentOperation} NV",
                    $"BE{Random.Shared.Next(100000000, 999999999)}",
                    "Corporation",
                    "Active",
                    "Technology",
                    Random.Shared.Next(10, 100),
                    new AddressDto { Street = "CRUD Street", Number = "1", PostalCode = "1000", City = "Brussels", Country = "Belgium" },
                    new ContactPersonDto { FirstName = "CRUD", LastName = "Test", Email = $"crud{context.ScenarioInfo.CurrentOperation}@test.com", PhoneNumber = "+32123456789" }
                );

                using var createResponse = await httpClient.PostAsJsonAsync("/api/companies", createCommand);
                if (!createResponse.IsSuccessStatusCode) return Response.Fail("Create failed");

                var createdCompany = await createResponse.Content.ReadFromJsonAsync<CompanyDto>();
                if (createdCompany == null) return Response.Fail("Created company is null");

                // Read
                using var getResponse = await httpClient.GetAsync($"/api/companies/{createdCompany.Id}");
                if (!getResponse.IsSuccessStatusCode) return Response.Fail("Get failed");

                // Delete
                using var deleteResponse = await httpClient.DeleteAsync($"/api/companies/{createdCompany.Id}");
                if (!deleteResponse.IsSuccessStatusCode) return Response.Fail("Delete failed");

                return Response.Ok();
            }
            catch (Exception ex)
            {
                return Response.Fail($"Exception: {ex.Message}");
            }
        })
        .WithLoadSimulations(
            Simulation.InjectPerSec(rate: 5, during: TimeSpan.FromSeconds(30))
        );

        NBomberRunner
            .RegisterScenarios(scenario)
            .Run();

        factory.Dispose();
    }
}