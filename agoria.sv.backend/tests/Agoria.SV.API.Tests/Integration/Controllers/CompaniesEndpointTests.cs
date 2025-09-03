using Agoria.SV.Application.DTOs;
using Agoria.SV.Application.Features.Companies.Commands.CreateCompany;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using Xunit;
using System.Text.Json;
using Agoria.SV.API.Tests.Fixtures;

namespace Agoria.SV.API.Tests.Integration.Controllers;

public class CompaniesEndpointTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly TestWebApplicationFactory _factory;

    public CompaniesEndpointTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetAllCompanies_ShouldReturnOkResult()
    {
        // Act
        var response = await _client.GetAsync("/api/companies");

        // Assert
        response.Should().NotBeNull();
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeNull();
    }

    [Fact]
    public async Task GetCompanyById_WithValidId_ShouldReturnCompany()
    {
        // Arrange
        var createCommand = new CreateCompanyCommand(
            "Test Company API",
            "Test Company API NV",
            "BE0987654321",
            "Corporation",
            "Active",
            "Technology",
            25,
            new AddressDto { Street = "API Street", Number = "1", PostalCode = "1000", City = "Brussels", Country = "Belgium" },
            new ContactPersonDto { FirstName = "API", LastName = "Test", Email = "api@test.com", PhoneNumber = "+32123456789" }
        );

        // Create a company first
        var createResponse = await _client.PostAsJsonAsync("/api/companies", createCommand);
        createResponse.IsSuccessStatusCode.Should().BeTrue();
        
        var createdCompany = await createResponse.Content.ReadFromJsonAsync<CompanyDto>();
        createdCompany.Should().NotBeNull();

        // Act - Get the created company
        var getResponse = await _client.GetAsync($"/api/companies/{createdCompany!.Id}");

        // Assert
        getResponse.IsSuccessStatusCode.Should().BeTrue();
        
        var retrievedCompany = await getResponse.Content.ReadFromJsonAsync<CompanyDto>();
        retrievedCompany.Should().NotBeNull();
        retrievedCompany!.Id.Should().Be(createdCompany.Id);
        retrievedCompany.Name.Should().Be("Test Company API");
        retrievedCompany.Ondernemingsnummer.Should().Be("BE0987654321");
    }

    [Fact]
    public async Task GetCompanyById_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var invalidId = Guid.NewGuid();

        // Act
        var response = await _client.GetAsync($"/api/companies/{invalidId}");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateCompany_WithValidData_ShouldCreateSuccessfully()
    {
        // Arrange
        var command = new CreateCompanyCommand(
            "Integration Test Company",
            "Integration Test Company BVBA",
            "BE0555123456",
            "BVBA",
            "Active",
            "Software",
            15,
            new AddressDto { Street = "Integration Street", Number = "99", PostalCode = "2000", City = "Antwerp", Country = "Belgium" },
            new ContactPersonDto { FirstName = "Integration", LastName = "Tester", Email = "integration@test.com", PhoneNumber = "+32987654321" }
        );

        // Act
        var response = await _client.PostAsJsonAsync("/api/companies", command);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.Created);

        var createdCompany = await response.Content.ReadFromJsonAsync<CompanyDto>();
        createdCompany.Should().NotBeNull();
        createdCompany!.Name.Should().Be("Integration Test Company");
        createdCompany.Ondernemingsnummer.Should().Be("BE0555123456");
        createdCompany.Type.Should().Be("BVBA");
        createdCompany.Status.Should().Be("Active");
        createdCompany.Sector.Should().Be("Software");
        createdCompany.NumberOfEmployees.Should().Be(15);
    }

    [Fact]
    public async Task SearchCompanies_WithSearchTerm_ShouldReturnFilteredResults()
    {
        // Arrange
        var searchTerm = "Tech";

        // Act
        var response = await _client.GetAsync($"/api/companies/search?q={searchTerm}");

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeNull();
        
        var companies = JsonSerializer.Deserialize<List<CompanyDto>>(content, new JsonSerializerOptions 
        { 
            PropertyNameCaseInsensitive = true 
        });
        companies.Should().NotBeNull();
    }

    [Fact]
    public async Task SearchCompanies_WithMultipleFilters_ShouldReturnFilteredResults()
    {
        // Act
        var response = await _client.GetAsync("/api/companies/search?type=Corporation&status=Active&city=Brussels");

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeNull();
    }

    [Fact]
    public async Task DeleteCompany_WithValidId_ShouldDeleteSuccessfully()
    {
        // Arrange - Create a company first
        var createCommand = new CreateCompanyCommand(
            "Company To Delete",
            "Company To Delete NV",
            "BE0111222333",
            "NV",
            "Active",
            "Test",
            1,
            new AddressDto { Street = "Delete Street", Number = "1", PostalCode = "1000", City = "Brussels", Country = "Belgium" },
            new ContactPersonDto { FirstName = "Delete", LastName = "Me", Email = "delete@test.com", PhoneNumber = "+32123456789" }
        );

        var createResponse = await _client.PostAsJsonAsync("/api/companies", createCommand);
        var createdCompany = await createResponse.Content.ReadFromJsonAsync<CompanyDto>();

        // Act - Delete the company
        var deleteResponse = await _client.DeleteAsync($"/api/companies/{createdCompany!.Id}");

        // Assert
        deleteResponse.StatusCode.Should().Be(System.Net.HttpStatusCode.NoContent);

        // Verify the company is deleted
        var getResponse = await _client.GetAsync($"/api/companies/{createdCompany.Id}");
        getResponse.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteCompany_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var invalidId = Guid.NewGuid();

        // Act
        var response = await _client.DeleteAsync($"/api/companies/{invalidId}");

        // Assert
        response.StatusCode.Should().Be(System.Net.HttpStatusCode.NotFound);
    }
}