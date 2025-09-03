using Xunit;
using System.Net;
using System.Text;
using System.Text.Json;
using Agoria.SV.API.Tests.Fixtures;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Application.Features.Companies.Commands.CreateCompany;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Agoria.SV.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Agoria.SV.API.Tests.Integration;

public class BulkImportCompaniesTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public BulkImportCompaniesTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task BulkImportCompanies_WithValidPayload_ShouldCreateCompaniesSuccessfully()
    {
        // Arrange
        var bulkImportPayload = new List<CreateCompanyCommand>
        {
            new CreateCompanyCommand(
                Name: "Voorbeeld Bedrijf",
                LegalName: "Voorbeeld BV",
                Ondernemingsnummer: "BE0123456789",
                Type: "BV",
                Sector: "IT",
                NumberOfEmployees: 100,
                Address: new AddressDto(
                    Street: "Hoofdstraat",
                    Number: "1",
                    PostalCode: "1000",
                    City: "Brussel",
                    Country: "België"
                ),
                ContactPerson: new ContactPersonDto(
                    FirstName: "Jan",
                    LastName: "Janssen",
                    Email: "jan@voorbeeld.be",
                    Phone: "+32 2 123 45 67",
                    Function: "HR Manager"
                )
            )
        };

        var jsonContent = JsonSerializer.Serialize(bulkImportPayload);
        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/companies/import", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var responseContent = await response.Content.ReadAsStringAsync();
        var companies = JsonSerializer.Deserialize<List<CompanyDto>>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        companies.Should().NotBeNull();
        companies.Should().HaveCount(1);

        var company = companies!.First();
        company.Name.Should().Be("Voorbeeld Bedrijf");
        company.LegalName.Should().Be("Voorbeeld BV");
        company.Ondernemingsnummer.Should().Be("BE0123456789");
        company.Type.Should().Be("BV");
        company.Sector.Should().Be("IT");
        company.NumberOfEmployees.Should().Be(100);
        company.Status.Should().Be("active"); // Should be set to active by default

        // Address validation
        company.Address.Should().NotBeNull();
        company.Address.Street.Should().Be("Hoofdstraat");
        company.Address.Number.Should().Be("1");
        company.Address.PostalCode.Should().Be("1000");
        company.Address.City.Should().Be("Brussel");
        company.Address.Country.Should().Be("België");

        // Contact person validation
        company.ContactPerson.Should().NotBeNull();
        company.ContactPerson.FirstName.Should().Be("Jan");
        company.ContactPerson.LastName.Should().Be("Janssen");
        company.ContactPerson.Email.Should().Be("jan@voorbeeld.be");
        company.ContactPerson.Phone.Should().Be("+32 2 123 45 67");
        company.ContactPerson.Function.Should().Be("HR Manager");

        // Verify the company was actually saved to the database
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var savedCompany = await dbContext.Companies.FirstOrDefaultAsync(c => c.Ondernemingsnummer == "BE0123456789");
        
        savedCompany.Should().NotBeNull();
        savedCompany!.Name.Should().Be("Voorbeeld Bedrijf");
    }

    [Fact]
    public async Task BulkImportCompanies_WithMultipleCompanies_ShouldCreateAllCompaniesSuccessfully()
    {
        // Arrange
        var bulkImportPayload = new List<CreateCompanyCommand>
        {
            new CreateCompanyCommand(
                Name: "Company A",
                LegalName: "Company A BV",
                Ondernemingsnummer: "BE0123456780",
                Type: "BV",
                Sector: "IT",
                NumberOfEmployees: 50,
                Address: new AddressDto("Straat A", "1", "1000", "Brussels", "Belgium"),
                ContactPerson: new ContactPersonDto("John", "Doe", "john@companya.be", "+32 2 111 11 11", "Manager")
            ),
            new CreateCompanyCommand(
                Name: "Company B",
                LegalName: "Company B NV",
                Ondernemingsnummer: "BE0123456781",
                Type: "NV",
                Sector: "Finance",
                NumberOfEmployees: 75,
                Address: new AddressDto("Straat B", "2", "2000", "Antwerp", "Belgium"),
                ContactPerson: new ContactPersonDto("Jane", "Smith", "jane@companyb.be", "+32 3 222 22 22", "Director")
            )
        };

        var jsonContent = JsonSerializer.Serialize(bulkImportPayload);
        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/companies/import", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var responseContent = await response.Content.ReadAsStringAsync();
        var companies = JsonSerializer.Deserialize<List<CompanyDto>>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        companies.Should().NotBeNull();
        companies.Should().HaveCount(2);

        // Verify both companies were saved to the database
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var savedCompanies = await dbContext.Companies.ToListAsync();
        
        savedCompanies.Should().HaveCount(2);
        savedCompanies.Should().Contain(c => c.Name == "Company A");
        savedCompanies.Should().Contain(c => c.Name == "Company B");
    }

    [Fact]
    public async Task BulkImportCompanies_WithInvalidOndernemingnummer_ShouldReturnBadRequest()
    {
        // Arrange
        var bulkImportPayload = new List<CreateCompanyCommand>
        {
            new CreateCompanyCommand(
                Name: "Invalid Company",
                LegalName: "Invalid Company BV",
                Ondernemingsnummer: "INVALID_NUMBER", // Invalid format
                Type: "BV",
                Sector: "IT",
                NumberOfEmployees: 100,
                Address: new AddressDto("Street", "1", "1000", "City", "Country"),
                ContactPerson: new ContactPersonDto("John", "Doe", "john@example.com", "+32 1 111 11 11", "Manager")
            )
        };

        var jsonContent = JsonSerializer.Serialize(bulkImportPayload);
        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/companies/import", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task BulkImportCompanies_WithEmptyArray_ShouldReturnEmptyResult()
    {
        // Arrange
        var bulkImportPayload = new List<CreateCompanyCommand>();
        var jsonContent = JsonSerializer.Serialize(bulkImportPayload);
        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/companies/import", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var responseContent = await response.Content.ReadAsStringAsync();
        var companies = JsonSerializer.Deserialize<List<CompanyDto>>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        companies.Should().NotBeNull();
        companies.Should().HaveCount(0);
    }

    [Fact]
    public async Task BulkImportCompanies_WithExactUserProvidedPayload_ShouldSucceed()
    {
        // Arrange - Using the exact payload provided by the user
        var exactPayload = """
        [{"Name":"Voorbeeld Bedrijf","LegalName":"Voorbeeld BV","Ondernemingsnummer":"BE0123456789","Type":"BV","Sector":"IT","NumberOfEmployees":100,"Address":{"Street":"Hoofdstraat","Number":"1","PostalCode":"1000","City":"Brussel","Country":"België"},"ContactPerson":{"FirstName":"Jan","LastName":"Janssen","Email":"jan@voorbeeld.be","Phone":"+32 2 123 45 67","Function":"HR Manager"}}]
        """;

        var content = new StringContent(exactPayload, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/api/companies/import", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var responseContent = await response.Content.ReadAsStringAsync();
        var companies = JsonSerializer.Deserialize<List<CompanyDto>>(responseContent, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        companies.Should().NotBeNull();
        companies.Should().HaveCount(1);

        var company = companies!.First();
        company.Name.Should().Be("Voorbeeld Bedrijf");
        company.LegalName.Should().Be("Voorbeeld BV");
        company.Ondernemingsnummer.Should().Be("BE0123456789");
        company.Type.Should().Be("BV");
        company.Sector.Should().Be("IT");
        company.NumberOfEmployees.Should().Be(100);

        // Verify it was saved to database
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var savedCompany = await dbContext.Companies.FirstOrDefaultAsync(c => c.Ondernemingsnummer == "BE0123456789");
        
        savedCompany.Should().NotBeNull();
        savedCompany!.Name.Should().Be("Voorbeeld Bedrijf");
    }
}
