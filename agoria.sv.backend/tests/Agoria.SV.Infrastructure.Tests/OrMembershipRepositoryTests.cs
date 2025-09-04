using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.ValueObjects;
using Agoria.SV.Infrastructure.Persistence;
using Agoria.SV.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Agoria.SV.Infrastructure.Tests;

public class OrMembershipRepositoryTests
{
    private static ApplicationDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task AddAndGetByEmployeeId_ShouldReturn()
    {
        var ctx = CreateContext("Om_Add");
        var repo = new OrMembershipRepository(ctx);

        var om = new OrMembership(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), ORCategory.Arbeiders, 1);
        await repo.AddAsync(om);

    (await ctx.OrMemberships.AnyAsync(x => x.EmployeeId == om.EmployeeId)).Should().BeTrue();
    }

    [Fact]
    public async Task DeleteByEmployeeIdAndCategory_ShouldReturnTrue()
    {
        var ctx = CreateContext("Om_Delete");
        var repo = new OrMembershipRepository(ctx);

        var om = new OrMembership(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), ORCategory.Bedienden, 2);
        await repo.AddAsync(om);

        var deleted = await repo.DeleteByEmployeeIdAndCategoryAsync(om.EmployeeId, ORCategory.Bedienden);

        deleted.Should().BeTrue();
    }

    [Fact]
    public async Task BulkAddAndBulkDelete_ShouldReturnEntities()
    {
        var ctx = CreateContext("Om_Bulk");
        var repo = new OrMembershipRepository(ctx);

        var list = new List<OrMembership>
        {
            new OrMembership(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), ORCategory.Arbeiders, 1),
            new OrMembership(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), ORCategory.Arbeiders, 2),
        };

        var added = (await repo.BulkAddAsync(list)).ToList();
        added.Should().HaveCount(2);

        var employeeIds = added.Select(a => a.EmployeeId).ToList();
        var deleted = (await repo.BulkDeleteByEmployeeIdsAndCategoryAsync(employeeIds, ORCategory.Arbeiders)).ToList();

        deleted.Should().HaveCount(2);
    }
}
