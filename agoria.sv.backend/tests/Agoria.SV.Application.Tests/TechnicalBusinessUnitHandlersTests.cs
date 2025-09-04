using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Agoria.SV.Application.Features.TechnicalBusinessUnits.Commands.CreateTechnicalBusinessUnit;
using Agoria.SV.Application.Features.TechnicalBusinessUnits.Commands.DeleteTechnicalBusinessUnit;
using Agoria.SV.Application.Features.TechnicalBusinessUnits.Commands.UpdateTechnicalBusinessUnit;
using Agoria.SV.Application.Features.TechnicalBusinessUnits.Queries.GetTechnicalBusinessUnitById;
using Agoria.SV.Application.Features.TechnicalBusinessUnits.Queries.SearchTechnicalBusinessUnits;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using AutoMapper;
using FluentAssertions;
using Moq;
using Xunit;

namespace Agoria.SV.Application.Tests;

public class TechnicalBusinessUnitHandlersTests
{
    [Fact]
    public async Task CreateTechnicalBusinessUnit_ShouldCallRepositoryAndMap()
    {
        var repoMock = new Mock<Agoria.SV.Domain.Interfaces.ITechnicalBusinessUnitRepository>();
        var mapper = new Mock<IMapper>();

    var command = new CreateTechnicalBusinessUnitCommand(Guid.NewGuid(), "Name", "C", "D", 1, "M", "Dep", new AddressDto("","","","",""), "active", "N", "pw", "pc", "base", "1", new ElectionBodiesDto(false,false,false,false));

        var created = new TechnicalBusinessUnit { Id = Guid.NewGuid(), Name = command.Name };
        repoMock.Setup(r => r.CreateAsync(It.IsAny<TechnicalBusinessUnit>())).ReturnsAsync(created);
        mapper.Setup(m => m.Map<TechnicalBusinessUnitDto>(created)).Returns(new TechnicalBusinessUnitDto(created.Id, created.CompanyId, created.Name, created.Code ?? string.Empty, created.Description ?? string.Empty, created.NumberOfEmployees, created.Manager ?? string.Empty, created.Department ?? string.Empty, new AddressDto("","","","",""), created.Status ?? string.Empty, created.Language ?? string.Empty, created.PcWorkers ?? string.Empty, created.PcClerks ?? string.Empty, created.FodDossierBase ?? string.Empty, created.FodDossierSuffix ?? string.Empty, new ElectionBodiesDto(false,false,false,false), created.CreatedAt, created.UpdatedAt));

        var handler = new CreateTechnicalBusinessUnitCommandHandler(repoMock.Object, mapper.Object);
        var result = await handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
    }

    [Fact]
    public async Task GetTechnicalBusinessUnitById_WhenNotFound_ReturnsNull()
    {
        var repoMock = new Mock<Agoria.SV.Domain.Interfaces.ITechnicalBusinessUnitRepository>();
        var mapper = new Mock<IMapper>();
    repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((TechnicalBusinessUnit?)null);

        var handler = new GetTechnicalBusinessUnitByIdQueryHandler(repoMock.Object, mapper.Object);
        var query = new GetTechnicalBusinessUnitByIdQuery(Guid.NewGuid());

        var result = await handler.Handle(query, CancellationToken.None);
        result.Should().BeNull();
    }

    [Fact]
    public async Task SearchTechnicalBusinessUnits_ReturnsMapped()
    {
        var repoMock = new Mock<Agoria.SV.Domain.Interfaces.ITechnicalBusinessUnitRepository>();
        var mapper = new Mock<IMapper>();

        var units = new List<TechnicalBusinessUnit> { new TechnicalBusinessUnit { Id = Guid.NewGuid(), Name = "U" } };
    repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(units);
        mapper.Setup(m => m.Map<IEnumerable<TechnicalBusinessUnitDto>>(It.IsAny<IEnumerable<TechnicalBusinessUnit>>())).Returns(new List<TechnicalBusinessUnitDto>());

    var handler = new SearchTechnicalBusinessUnitsQueryHandler(repoMock.Object, mapper.Object);
    var query = new SearchTechnicalBusinessUnitsQuery(null, null, null, null, null, null, null);

        var result = await handler.Handle(query, CancellationToken.None);
        result.Should().NotBeNull();
    }

    [Fact]
    public async Task UpdateTechnicalBusinessUnit_WhenNotFound_ShouldThrow()
    {
        var repoMock = new Mock<Agoria.SV.Domain.Interfaces.ITechnicalBusinessUnitRepository>();
        var mapper = new Mock<IMapper>();
    repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((TechnicalBusinessUnit?)null);

    var command = new UpdateTechnicalBusinessUnitCommand(Guid.NewGuid(), Guid.NewGuid(), "N", "C", "D", 0, "M", "Dep", new AddressDto("","","","",""), "active", "nl", "pw", "pc", "base", "suf", new ElectionBodiesDto(false,false,false,false));
        var handler = new UpdateTechnicalBusinessUnitCommandHandler(repoMock.Object, mapper.Object);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task DeleteTechnicalBusinessUnit_WhenNotFound_ReturnsFalse()
    {
        var repoMock = new Mock<Agoria.SV.Domain.Interfaces.ITechnicalBusinessUnitRepository>();
        repoMock.Setup(r => r.DeleteAsync(It.IsAny<Guid>())).ReturnsAsync(false);

        var handler = new DeleteTechnicalBusinessUnitCommandHandler(repoMock.Object);
        var command = new DeleteTechnicalBusinessUnitCommand(Guid.NewGuid());

        var result = await handler.Handle(command, CancellationToken.None);
        result.Should().BeFalse();
    }
}
