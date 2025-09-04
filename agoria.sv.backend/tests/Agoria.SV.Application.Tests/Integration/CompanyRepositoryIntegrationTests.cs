using System;
using System.Threading;
using System.Threading.Tasks;
using Agoria.SV.Infrastructure.Persistence;
using Agoria.SV.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Agoria.SV.Application.Features.Companies.Commands.CreateCompany;
using Agoria.SV.Application.DTOs;
using AutoMapper;
using Moq;
using Xunit;

namespace Agoria.SV.Application.Tests.Integration;

public class CompanyRepositoryIntegrationTests
{
    [Fact]
    public async Task CreateCompany_EndToEnd_PersistsAndMaps()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase("test_db_create_company")
            .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        using var db = new ApplicationDbContext(options);
        var repo = new CompanyRepository(db);

        var mapperMock = new Mock<IMapper>();
        mapperMock.Setup(m => m.Map<Agoria.SV.Application.DTOs.CompanyDto>(It.IsAny<Agoria.SV.Domain.Entities.Company>()))
            .Returns((Agoria.SV.Domain.Entities.Company c) => new CompanyDto(c.Id, c.Name, c.LegalName ?? string.Empty, c.Ondernemingsnummer ?? string.Empty, c.Type ?? string.Empty, c.Status ?? string.Empty, c.Sector ?? string.Empty, c.NumberOfEmployees, new AddressDto("","","","",""), new ContactPersonDto("","","","", null), c.CreatedAt, c.UpdatedAt));

        var handler = new CreateCompanyCommandHandler(repo, mapperMock.Object);

    // use valid ondernemingsnummer BE0123456789 to satisfy domain validation
    var command = new CreateCompanyCommand("T","LT","BE0123456789","T","IT",1,new AddressDto("S","1","1000","C","Country"), new ContactPersonDto("F","L","f@l","0", null));

        var dto = await handler.Handle(command, CancellationToken.None);

        Assert.NotNull(dto);
        var persisted = await db.Companies.FindAsync(dto.Id);
        Assert.NotNull(persisted);
    }
}
