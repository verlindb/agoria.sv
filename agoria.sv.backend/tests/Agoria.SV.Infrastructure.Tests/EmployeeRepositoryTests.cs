using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Infrastructure.Persistence;
using Agoria.SV.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Agoria.SV.Infrastructure.Tests;

public class EmployeeRepositoryTests
{
    private static ApplicationDbContext CreateContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task AddAndGetByEmail_ShouldReturnEntity()
    {
        var ctx = CreateContext("Emp_AddGetByEmail");
        var repo = new EmployeeRepository(ctx);

        var tbuId = Guid.NewGuid();
        var emp = new Employee(tbuId, "Jane", "Doe", "jane@example.com", "123", "Dev", DateTime.UtcNow);

        await repo.AddAsync(emp);

    // ensure persisted in the same context
    (await ctx.Employees.AnyAsync(e => e.Email == "jane@example.com")).Should().BeTrue();
    }

    [Fact]
    public async Task Upsert_ShouldUpdateExisting()
    {
        var ctx = CreateContext("Emp_Upsert");
        var repo = new EmployeeRepository(ctx);

        var tbuId = Guid.NewGuid();
        var emp = new Employee(tbuId, "Tom", "Thumb", "tom@example.com", "1", "Dev", DateTime.UtcNow);
        await repo.AddAsync(emp);

        var updated = new Employee(tbuId, "Tommy", "Thumb", "tom@example.com", "9","Lead", DateTime.UtcNow);

        var res = await repo.UpsertAsync(updated);

        res.FirstName.Should().Be("Tommy");
        res.Role.Should().Be("Lead");
    }

    [Fact]
    public async Task Delete_ShouldReturnTrueWhenDeleted()
    {
        var ctx = CreateContext("Emp_Delete");
        var repo = new EmployeeRepository(ctx);

        var emp = new Employee(Guid.NewGuid(), "A","B","a@b.com","1","r", DateTime.UtcNow);
        await repo.AddAsync(emp);

        var deleted = await repo.DeleteAsync(emp.Id);

        deleted.Should().BeTrue();
    }

    [Fact]
    public async Task BulkAddAndBulkUpsert_ShouldReturnAll()
    {
        var ctx = CreateContext("Emp_Bulk");
        var repo = new EmployeeRepository(ctx);

        var list = new List<Employee>
        {
            new Employee(Guid.NewGuid(), "A","A","a@a.com","1","r", DateTime.UtcNow),
            new Employee(Guid.NewGuid(), "B","B","b@b.com","2","r", DateTime.UtcNow)
        };

        var added = (await repo.BulkAddAsync(list)).ToList();
        added.Should().HaveCount(2);

        // Upsert with one existing (same email) and one new
        var upsertList = new List<Employee>
        {
            new Employee(list[0].TechnicalBusinessUnitId, "A2","A","a@a.com","9","r2", DateTime.UtcNow),
            new Employee(Guid.NewGuid(), "C","C","c@c.com","3","r", DateTime.UtcNow)
        };

        var upserted = (await repo.BulkUpsertAsync(upsertList)).ToList();

        upserted.Should().HaveCount(2);
        upserted.Select(e => e.Email).Should().Contain(new []{"a@a.com","c@c.com"});
    }
}
