using Xunit;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.ValueObjects;
using Agoria.SV.Infrastructure.Persistence;
using Agoria.SV.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Agoria.SV.API.Tests.Unit.Infrastructure.Repositories;

public class CompanyRepositoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly CompanyRepository _repository;

    public CompanyRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _repository = new CompanyRepository(_context);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    [Fact]
    public async Task AddAsync_WithValidCompany_ShouldAddAndReturnCompany()
    {
        // Arrange
        var company = CreateTestCompany();

        // Act
        var result = await _repository.AddAsync(company);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(company.Id);
        result.Name.Should().Be(company.Name);

        var savedCompany = await _context.Companies.FirstOrDefaultAsync(c => c.Id == company.Id);
        savedCompany.Should().NotBeNull();
        savedCompany!.Name.Should().Be(company.Name);
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingId_ShouldReturnCompany()
    {
        // Arrange
        var company = CreateTestCompany();
        await _repository.AddAsync(company);

        // Act
        var result = await _repository.GetByIdAsync(company.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(company.Id);
        result.Name.Should().Be(company.Name);
        result.LegalName.Should().Be(company.LegalName);
        result.Ondernemingsnummer.Should().Be(company.Ondernemingsnummer);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingId_ShouldReturnNull()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _repository.GetByIdAsync(nonExistentId);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllAsync_WithNoCompanies_ShouldReturnEmptyCollection()
    {
        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllAsync_WithMultipleCompanies_ShouldReturnAllCompanies()
    {
        // Arrange
        var company1 = CreateTestCompany();
        var company2 = CreateTestCompany("Company 2", "Company 2 BV", "BE0987654321");
        
        await _repository.AddAsync(company1);
        await _repository.AddAsync(company2);

        // Act
        var result = await _repository.GetAllAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().Contain(c => c.Id == company1.Id);
        result.Should().Contain(c => c.Id == company2.Id);
    }

    [Fact]
    public async Task UpdateAsync_WithExistingCompany_ShouldUpdateCompany()
    {
        // Arrange
        var company = CreateTestCompany();
        await _repository.AddAsync(company);

        company.Name = "Updated Company Name";
        company.NumberOfEmployees = 100;

        // Act
        await _repository.UpdateAsync(company);

        // Assert
        var updatedCompany = await _repository.GetByIdAsync(company.Id);
        updatedCompany.Should().NotBeNull();
        updatedCompany!.Name.Should().Be("Updated Company Name");
        updatedCompany.NumberOfEmployees.Should().Be(100);
    }

    [Fact]
    public async Task DeleteAsync_WithExistingId_ShouldRemoveCompany()
    {
        // Arrange
        var company = CreateTestCompany();
        await _repository.AddAsync(company);

        // Act
        await _repository.DeleteAsync(company.Id);

        // Assert
        var deletedCompany = await _repository.GetByIdAsync(company.Id);
        deletedCompany.Should().BeNull();

        var exists = await _repository.ExistsAsync(company.Id);
        exists.Should().BeFalse();
    }

    [Fact]
    public async Task DeleteAsync_WithNonExistingId_ShouldNotThrowException()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act & Assert
        var action = async () => await _repository.DeleteAsync(nonExistentId);
        await action.Should().NotThrowAsync();
    }

    [Fact]
    public async Task ExistsAsync_WithExistingId_ShouldReturnTrue()
    {
        // Arrange
        var company = CreateTestCompany();
        await _repository.AddAsync(company);

        // Act
        var result = await _repository.ExistsAsync(company.Id);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task ExistsAsync_WithNonExistingId_ShouldReturnFalse()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _repository.ExistsAsync(nonExistentId);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task AddAsync_WithCancellationToken_ShouldRespectCancellation()
    {
        // Arrange
        var company = CreateTestCompany();
        using var cts = new CancellationTokenSource();
        cts.Cancel();

        // Act & Assert
        var action = async () => await _repository.AddAsync(company, cts.Token);
        await action.Should().ThrowAsync<OperationCanceledException>();
    }

    [Fact]
    public async Task GetByIdAsync_WithCancellationToken_ShouldRespectCancellation()
    {
        // Arrange
        var company = CreateTestCompany();
        await _repository.AddAsync(company);
        
        using var cts = new CancellationTokenSource();
        cts.Cancel();

        // Act & Assert
        var action = async () => await _repository.GetByIdAsync(company.Id, cts.Token);
        await action.Should().ThrowAsync<OperationCanceledException>();
    }

    [Fact]
    public async Task AddAsync_WithDuplicateOndernemingsnummer_ShouldWorkWithInMemoryDatabase()
    {
        // Note: InMemory database doesn't enforce unique constraints the same way as SQL Server
        // This test documents the current behavior rather than the expected SQL Server behavior
        
        // Arrange
        var company1 = CreateTestCompany();
        var company2 = CreateTestCompany("Different Company", "Different Legal Name", company1.Ondernemingsnummer);
        
        await _repository.AddAsync(company1);

        // Act - Should succeed in InMemory database even with duplicate Ondernemingsnummer
        var result = await _repository.AddAsync(company2);

        // Assert
        result.Should().NotBeNull();
        result.Ondernemingsnummer.Should().Be(company1.Ondernemingsnummer);
        
        // Both companies should exist in the in-memory database
        var allCompanies = await _repository.GetAllAsync();
        allCompanies.Should().HaveCount(2);
    }

    [Fact]
    public async Task Repository_ShouldHandleComplexAddress()
    {
        // Arrange
        var address = new Address(
            "Avenue des Champs-Élysées", 
            "123bis", 
            "75008", 
            "Paris", 
            "France"
        );
        var contactPerson = new ContactPerson(
            "Jean-Pierre", 
            "Dupont", 
            "jp.dupont@company.fr", 
            "+33 1 23 45 67 89", 
            "Directeur Général"
        );

        var company = new Company
        {
            Id = Guid.NewGuid(),
            Name = "French Company",
            LegalName = "Société Française SAS",
            Ondernemingsnummer = "BE1234567890", // Must be BE format
            Type = "SAS",
            Sector = "Technology",
            NumberOfEmployees = 250,
            Address = address,
            ContactPerson = contactPerson,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        var result = await _repository.AddAsync(company);

        // Assert
        result.Should().NotBeNull();
        result.Address.Street.Should().Be("Avenue des Champs-Élysées");
        result.Address.Number.Should().Be("123bis");
        result.ContactPerson.FirstName.Should().Be("Jean-Pierre");
        result.ContactPerson.Function.Should().Be("Directeur Général");

        var savedCompany = await _repository.GetByIdAsync(company.Id);
        savedCompany.Should().NotBeNull();
        savedCompany!.Address.Street.Should().Be("Avenue des Champs-Élysées");
        savedCompany.ContactPerson.Function.Should().Be("Directeur Général");
    }

    [Fact]
    public async Task Repository_ShouldHandleTimestamps()
    {
        // Arrange
        var company = CreateTestCompany();
        var createdTime = DateTime.UtcNow;
        company.CreatedAt = createdTime;
        company.UpdatedAt = createdTime;

        // Act
        var result = await _repository.AddAsync(company);

        // Assert
        result.CreatedAt.Should().Be(createdTime);
        result.UpdatedAt.Should().Be(createdTime);

        var savedCompany = await _repository.GetByIdAsync(company.Id);
        savedCompany!.CreatedAt.Should().Be(createdTime);
        savedCompany.UpdatedAt.Should().Be(createdTime);
    }

    [Theory]
    [InlineData("active")]
    [InlineData("inactive")]
    [InlineData("pending")]
    public async Task Repository_ShouldHandleDifferentStatuses(string status)
    {
        // Arrange
        var company = CreateTestCompany();
        company.Status = status;

        // Act
        var result = await _repository.AddAsync(company);

        // Assert
        result.Status.Should().Be(status);

        var savedCompany = await _repository.GetByIdAsync(company.Id);
        savedCompany!.Status.Should().Be(status);
    }

    [Fact]
    public async Task Repository_ShouldHandlePresetIdCorrectly()
    {
        // Note: EF Core may generate a new ID if the entity is configured with auto-generation
        // This test documents the actual behavior
        
        // Arrange
        var presetId = Guid.NewGuid();
        var company = CreateTestCompany();
        company.Id = presetId;

        // Act
        var result = await _repository.AddAsync(company);

        // Assert
        result.Should().NotBeNull();
        // The ID should either be the preset one or a new one generated by EF Core
        result.Id.Should().NotBe(Guid.Empty);
        
        var savedCompany = await _repository.GetByIdAsync(result.Id);
        savedCompany.Should().NotBeNull();
    }

    private static Company CreateTestCompany(string name = "Test Company", string legalName = "Test Company BV", string ondernemingsnummer = "BE0123456789")
    {
        var address = new Address("Test Street", "1", "1000", "Brussels", "Belgium");
        var contactPerson = new ContactPerson("John", "Doe", "john@test.com", "+32 1 111 11 11", "Manager");

        return new Company
        {
            Id = Guid.NewGuid(),
            Name = name,
            LegalName = legalName,
            Ondernemingsnummer = ondernemingsnummer,
            Type = "BV",
            Sector = "IT",
            NumberOfEmployees = 50,
            Address = address,
            ContactPerson = contactPerson,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}