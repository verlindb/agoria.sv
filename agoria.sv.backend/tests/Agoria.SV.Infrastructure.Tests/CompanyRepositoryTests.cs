using System;
using System.Threading.Tasks;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Infrastructure.Persistence;
using Agoria.SV.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Agoria.SV.Infrastructure.Tests;

public class CompanyRepositoryTests
{
    private static ApplicationDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task AddAndGetById_ShouldReturnEntity()
    {
        var context = CreateContext("AddAndGetById");
        var repo = new CompanyRepository(context);

        var company = new Company { Id = Guid.NewGuid(), Name = "TestCo", Ondernemingsnummer = "BE0123456789", LegalName = "TestCo NV", Type = "Ltd", Sector = "IT", NumberOfEmployees = 10, Address = null!, ContactPerson = null! };

        await repo.AddAsync(company);

        var fetched = await repo.GetByIdAsync(company.Id);

        fetched.Should().NotBeNull();
        fetched!.Id.Should().Be(company.Id);
    }

    [Fact]
    public async Task Exists_ShouldReturnTrueAfterAdd()
    {
        var context = CreateContext("ExistsShouldReturnTrue");
        var repo = new CompanyRepository(context);

        var company = new Company { Id = Guid.NewGuid(), Name = "TestCo2", Ondernemingsnummer = "BE0123456789", LegalName = "TestCo NV", Type = "Ltd", Sector = "IT", NumberOfEmployees = 5, Address = null!, ContactPerson = null! };

        await repo.AddAsync(company);

        (await repo.ExistsAsync(company.Id)).Should().BeTrue();
    }

    [Fact]
    public async Task Delete_ShouldRemoveEntity()
    {
        var context = CreateContext("DeleteShouldRemove");
        var repo = new CompanyRepository(context);

        var company = new Company { Id = Guid.NewGuid(), Name = "TestCo3", Ondernemingsnummer = "BE0123456789", LegalName = "TestCo NV", Type = "Ltd", Sector = "IT", NumberOfEmployees = 5, Address = null!, ContactPerson = null! };

        await repo.AddAsync(company);
        await repo.DeleteAsync(company.Id);

        (await repo.ExistsAsync(company.Id)).Should().BeFalse();
    }
}
