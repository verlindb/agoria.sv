using System;
using System.Data.Common;
using System.Threading.Tasks;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Agoria.SV.Infrastructure.Tests;

public class RepositoryTransactionsConcurrencyTests : IDisposable
{
    private readonly DbConnection _connection;

    public RepositoryTransactionsConcurrencyTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
    }

    private ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(_connection)
            .Options;

        var ctx = new ApplicationDbContext(options);
        ctx.Database.EnsureCreated();
        return ctx;
    }

    [Fact]
    public async Task Transaction_Rollback_ShouldNotPersist()
    {
        using var ctx = CreateContext();

        using var tran = await ctx.Database.BeginTransactionAsync();

        var repo = new Agoria.SV.Infrastructure.Repositories.CompanyRepository(ctx);
        var c = new Company
        {
            Id = Guid.NewGuid(),
            Name = "TxCo",
            Ondernemingsnummer = "BE0123456789",
            LegalName = "TxCo NV",
            Type = "X",
            Sector = "IT",
            NumberOfEmployees = 1,
            Address = new Agoria.SV.Domain.ValueObjects.Address("Main St", "1", "1000", "City", "Country"),
            ContactPerson = new Agoria.SV.Domain.ValueObjects.ContactPerson("First", "Last", "first.last@example.com", "0123", "Manager")
        };
        await repo.AddAsync(c);

        // rollback
        await tran.RollbackAsync();

        // new context to verify
        using var verifyCtx = CreateContext();
        (await verifyCtx.Companies.AnyAsync(x => x.Id == c.Id)).Should().BeFalse();
    }

    [Fact]
    public async Task Concurrency_LastWriteWins_SimpleScenario()
    {
        var initial = new Company
        {
            Id = Guid.NewGuid(),
            Name = "Orig",
            Ondernemingsnummer = "BE0123456789",
            LegalName = "Orig NV",
            Type = "X",
            Sector = "IT",
            NumberOfEmployees = 1,
            Address = new Agoria.SV.Domain.ValueObjects.Address("Seed St", "2", "1000", "City", "Country"),
            ContactPerson = new Agoria.SV.Domain.ValueObjects.ContactPerson("Seed", "Person", "seed@example.com", "0000", null)
        };

        // Seed
        using (var seedCtx = CreateContext())
        {
            seedCtx.Companies.Add(initial);
            await seedCtx.SaveChangesAsync();
        }

        // Two contexts simulate concurrent actors
        using var ctx1 = CreateContext();
        using var ctx2 = CreateContext();

        var repo1 = new Agoria.SV.Infrastructure.Repositories.CompanyRepository(ctx1);
        var repo2 = new Agoria.SV.Infrastructure.Repositories.CompanyRepository(ctx2);

        var a = await repo1.GetByIdAsync(initial.Id);
        var b = await repo2.GetByIdAsync(initial.Id);

    a!.Name = "Writer1";
    await repo1.UpdateAsync(a);

    b!.Name = "Writer2";

    Func<Task> act = async () => await repo2.UpdateAsync(b);

    await act.Should().ThrowAsync<DbUpdateConcurrencyException>();
    }

    [Fact]
    public async Task NestedTransaction_Savepoint_WorksAsExpected()
    {
        using var ctx = CreateContext();
        await using var tran = await ctx.Database.BeginTransactionAsync();

        var repo = new Agoria.SV.Infrastructure.Repositories.CompanyRepository(ctx);
        var c1 = new Company
        {
            Id = Guid.NewGuid(),
            Name = "SP1",
            Ondernemingsnummer = "BE0123456790",
            LegalName = "SP1 NV",
            Type = "X",
            Sector = "IT",
            NumberOfEmployees = 1,
            Address = new Agoria.SV.Domain.ValueObjects.Address("A","1","1000","C","Co"),
            ContactPerson = new Agoria.SV.Domain.ValueObjects.ContactPerson("F","L","f@l.com","0",null)
        };

        await repo.AddAsync(c1);

        // create a savepoint (sqlite supports it)
        await ctx.Database.ExecuteSqlRawAsync("SAVEPOINT sp1");

        var c2 = new Company
        {
            Id = Guid.NewGuid(),
            Name = "SP2",
            Ondernemingsnummer = "BE0123456791",
            LegalName = "SP2 NV",
            Type = "X",
            Sector = "IT",
            NumberOfEmployees = 1,
            Address = new Agoria.SV.Domain.ValueObjects.Address("B","2","1000","C","Co"),
            ContactPerson = new Agoria.SV.Domain.ValueObjects.ContactPerson("F","L","f2@l.com","0",null)
        };

        await repo.AddAsync(c2);

        // rollback to savepoint sp1 (c2 will be rolled back)
        await ctx.Database.ExecuteSqlRawAsync("ROLLBACK TO SAVEPOINT sp1");

        // commit outer transaction
        await tran.CommitAsync();

        using var verify = CreateContext();
        (await verify.Companies.AnyAsync(x => x.Id == c1.Id)).Should().BeTrue();
        (await verify.Companies.AnyAsync(x => x.Id == c2.Id)).Should().BeFalse();
    }

    [Fact]
    public async Task OptimisticConcurrency_ShouldThrow_DbUpdateConcurrencyException()
    {
        var initial = new Company
        {
            Id = Guid.NewGuid(),
            Name = "Concur",
            Ondernemingsnummer = "BE0123456792",
            LegalName = "Concur NV",
            Type = "X",
            Sector = "IT",
            NumberOfEmployees = 1,
            Address = new Agoria.SV.Domain.ValueObjects.Address("C","3","1000","C","Co"),
            ContactPerson = new Agoria.SV.Domain.ValueObjects.ContactPerson("F","L","f3@l.com","0",null)
        };

        using (var seed = CreateContext())
        {
            seed.Companies.Add(initial);
            await seed.SaveChangesAsync();
        }

        using var c1 = CreateContext();
        using var c2 = CreateContext();

        var repo1 = new Agoria.SV.Infrastructure.Repositories.CompanyRepository(c1);
        var repo2 = new Agoria.SV.Infrastructure.Repositories.CompanyRepository(c2);

        var e1 = await repo1.GetByIdAsync(initial.Id);
        var e2 = await repo2.GetByIdAsync(initial.Id);

        e1!.Name = "One";
        await repo1.UpdateAsync(e1);

        e2!.Name = "Two";

        Func<Task> act = async () => await repo2.UpdateAsync(e2);

        await act.Should().ThrowAsync<DbUpdateConcurrencyException>();
    }

    public void Dispose()
    {
        _connection.Dispose();
    }
}
