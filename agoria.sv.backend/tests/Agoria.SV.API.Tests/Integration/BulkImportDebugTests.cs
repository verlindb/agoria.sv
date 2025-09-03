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
using Xunit.Abstractions;

namespace Agoria.SV.API.Tests.Integration;

public class BulkImportDebugTests : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;
    private readonly HttpClient _client;
    private readonly ITestOutputHelper _output;

    public BulkImportDebugTests(TestWebApplicationFactory factory, ITestOutputHelper output)
    {
        _factory = factory;
        _client = _factory.CreateClient();
        _output = output;
    }

    [Fact]
    public async Task Debug_BulkImportEndpoint_ShouldWork()
    {
        // Arrange
        var payload = """
        [{"Name":"Test Company","LegalName":"Test Company BV","Ondernemingsnummer":"BE0123456789","Type":"BV","Sector":"IT","NumberOfEmployees":100,"Address":{"Street":"Test Street","Number":"1","PostalCode":"1000","City":"Brussels","Country":"Belgium"},"ContactPerson":{"FirstName":"John","LastName":"Doe","Email":"john@test.com","Phone":"+32 1 111 11 11","Function":"Manager"}}]
        """;

        var content = new StringContent(payload, Encoding.UTF8, "application/json");

        _output.WriteLine("Request payload:");
        _output.WriteLine(payload);

        // Act
        var response = await _client.PostAsync("/api/companies/import", content);

        // Debug output
        _output.WriteLine($"Response status: {response.StatusCode}");
        
        var responseContent = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Response content: {responseContent}");

        // Check headers
        foreach (var header in response.Headers)
        {
            _output.WriteLine($"Header: {header.Key} = {string.Join(", ", header.Value)}");
        }

        foreach (var header in response.Content.Headers)
        {
            _output.WriteLine($"Content Header: {header.Key} = {string.Join(", ", header.Value)}");
        }

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        responseContent.Should().NotBeEmpty();
    }

    [Fact]
    public async Task Debug_TestSingleCreateEndpoint_ShouldWork()
    {
        // Test the single create endpoint first to make sure it works
        var command = new CreateCompanyCommand(
            Name: "Test Company",
            LegalName: "Test Company BV",
            Ondernemingsnummer: "BE0123456789",
            Type: "BV",
            Sector: "IT",
            NumberOfEmployees: 100,
            Address: new AddressDto("Test Street", "1", "1000", "Brussels", "Belgium"),
            ContactPerson: new ContactPersonDto("John", "Doe", "john@test.com", "+32 1 111 11 11", "Manager")
        );

        var jsonContent = JsonSerializer.Serialize(command);
        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

        _output.WriteLine("Single create payload:");
        _output.WriteLine(jsonContent);

        var response = await _client.PostAsync("/api/companies/", content);
        
        _output.WriteLine($"Single create response status: {response.StatusCode}");
        
        var responseContent = await response.Content.ReadAsStringAsync();
        _output.WriteLine($"Single create response content: {responseContent}");

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }
}
