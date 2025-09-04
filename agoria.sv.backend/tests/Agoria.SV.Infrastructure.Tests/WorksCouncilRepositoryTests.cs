using System;
using System.Threading.Tasks;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Infrastructure.Persistence;
using Agoria.SV.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Agoria.SV.Infrastructure.Tests;

public class WorksCouncilRepositoryTests
{
    private static ApplicationDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task AddAndGetByTechnicalBusinessUnitId_ShouldReturn()
    {
        var ctx = CreateContext("Wc_Add");
        var repo = new WorksCouncilRepository(ctx);

        var tbuId = Guid.NewGuid();
        var wc = new WorksCouncil(tbuId);

        await repo.AddAsync(wc);

    (await ctx.WorksCouncils.AnyAsync(w => w.TechnicalBusinessUnitId == tbuId)).Should().BeTrue();
    }
}
