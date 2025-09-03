using Xunit;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Application.Features.TechnicalBusinessUnits.Queries.GetAllTechnicalBusinessUnits;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using AutoMapper;
using FluentAssertions;
using Moq;

namespace Agoria.SV.API.Tests.Unit.Application.TechnicalBusinessUnits;

public class GetAllTechnicalBusinessUnitsQueryHandlerTests
{
    private readonly Mock<ITechnicalBusinessUnitRepository> _mockRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly GetAllTechnicalBusinessUnitsQueryHandler _handler;

    public GetAllTechnicalBusinessUnitsQueryHandlerTests()
    {
        _mockRepository = new Mock<ITechnicalBusinessUnitRepository>();
        _mockMapper = new Mock<IMapper>();
        _handler = new GetAllTechnicalBusinessUnitsQueryHandler(_mockRepository.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnMappedTechnicalBusinessUnits()
    {
        // Arrange
        var technicalUnits = new List<TechnicalBusinessUnit>
        {
            new() { Id = Guid.NewGuid(), Name = "IT Department", Status = "Active" },
            new() { Id = Guid.NewGuid(), Name = "HR Department", Status = "Active" }
        };

        var technicalUnitDtos = new List<TechnicalBusinessUnitDto>
        {
            new() { Id = technicalUnits[0].Id, Name = "IT Department", Status = "Active" },
            new() { Id = technicalUnits[1].Id, Name = "HR Department", Status = "Active" }
        };

        _mockRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(technicalUnits);
        _mockMapper.Setup(m => m.Map<IEnumerable<TechnicalBusinessUnitDto>>(technicalUnits))
            .Returns(technicalUnitDtos);

        var query = new GetAllTechnicalBusinessUnitsQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(technicalUnitDtos);
        
        _mockRepository.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
        _mockMapper.Verify(m => m.Map<IEnumerable<TechnicalBusinessUnitDto>>(technicalUnits), Times.Once);
    }

    [Fact]
    public async Task Handle_WithEmptyRepository_ShouldReturnEmptyCollection()
    {
        // Arrange
        var emptyTechnicalUnits = new List<TechnicalBusinessUnit>();
        var emptyTechnicalUnitDtos = new List<TechnicalBusinessUnitDto>();

        _mockRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(emptyTechnicalUnits);
        _mockMapper.Setup(m => m.Map<IEnumerable<TechnicalBusinessUnitDto>>(emptyTechnicalUnits))
            .Returns(emptyTechnicalUnitDtos);

        var query = new GetAllTechnicalBusinessUnitsQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }
}