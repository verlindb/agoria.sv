using System;
using System.Threading;
using System.Threading.Tasks;
using Agoria.SV.Application.Features.Companies.Commands.CreateCompany;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Application.DTOs;
using AutoMapper;
using Moq;
using Xunit;

namespace Agoria.SV.Application.Tests;

public class MappingFailureTests
{
    [Fact]
    public async Task CreateCompany_WhenMapperThrows_ShouldPropagate()
    {
        var repoMock = new Mock<Agoria.SV.Domain.Interfaces.ICompanyRepository>();
        var mapperMock = new Mock<IMapper>();

    // use valid ondernemingsnummer format BE0123456789 to pass domain validation and reach mapper
    var command = new CreateCompanyCommand("X","LX","BE0123456789","T","IT",1,new AddressDto("","","","",""), new ContactPersonDto("","","","", null));

        var created = new Company { Id = Guid.NewGuid(), Name = command.Name };
        repoMock.Setup(r => r.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>())).ReturnsAsync(created);

        // Mapper fails (e.g., mapping config broken)
        mapperMock.Setup(m => m.Map<CompanyDto>(It.IsAny<Company>())).Throws(new InvalidOperationException("Mapping failure"));

        var handler = new CreateCompanyCommandHandler(repoMock.Object, mapperMock.Object);

        await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(command, CancellationToken.None));
    }
}
