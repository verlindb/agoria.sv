using System;
using System.Linq;
using System.Threading.Tasks;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Infrastructure.Persistence;
using Agoria.SV.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Agoria.SV.Infrastructure.Tests;

public class TechnicalBusinessUnitRepositoryTests
{
    private static ApplicationDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task CreateAndGetByCode_ShouldReturnEntity()
    {
        var ctx = CreateContext("Tbu_Create");
        var repo = new TechnicalBusinessUnitRepository(ctx);

        var tbu = new TechnicalBusinessUnit { Code = "T1", Name = "Unit 1", CompanyId = Guid.NewGuid(), Location = null! };

        var created = await repo.CreateAsync(tbu);

    (await ctx.TechnicalBusinessUnits.AnyAsync(t => t.Code == "T1")).Should().BeTrue();
    }

    [Fact]
    public async Task Upsert_ShouldUpdateExisting()
    {
        var ctx = CreateContext("Tbu_Upsert");
        var repo = new TechnicalBusinessUnitRepository(ctx);

        var tbu = new TechnicalBusinessUnit { Code = "T2", Name = "Old", CompanyId = Guid.NewGuid(), Location = null! };
        await repo.CreateAsync(tbu);

        var updated = new TechnicalBusinessUnit { Code = "T2", Name = "New", CompanyId = tbu.CompanyId, Location = null! };

        var res = await repo.UpsertAsync(updated);

        res.Name.Should().Be("New");
    }

    [Fact]
    public async Task Delete_ShouldReturnTrue()
    {
        var ctx = CreateContext("Tbu_Delete");
        var repo = new TechnicalBusinessUnitRepository(ctx);

    var tbu = new TechnicalBusinessUnit { Code = "TD", Name = "X", CompanyId = Guid.NewGuid(), Location = null! };
        await repo.CreateAsync(tbu);

        var deleted = await repo.DeleteAsync(tbu.Id);

        deleted.Should().BeTrue();
    }
}
