using Xunit;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Application.Features.Companies.Queries.GetAllCompanies;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using AutoMapper;
using FluentAssertions;
using Moq;
using Xunit;

namespace Agoria.SV.API.Tests.Unit.Application.Companies;

public class GetAllCompaniesQueryHandlerTests
{
    private readonly Mock<ICompanyRepository> _mockRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly GetAllCompaniesQueryHandler _handler;

    public GetAllCompaniesQueryHandlerTests()
    {
        _mockRepository = new Mock<ICompanyRepository>();
        _mockMapper = new Mock<IMapper>();
        _handler = new GetAllCompaniesQueryHandler(_mockRepository.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnMappedCompanies()
    {
        // Arrange
        var companies = new List<Company>
        {
            new() { Id = Guid.NewGuid(), Name = "Company 1", Ondernemingsnummer = "BE0123456789" },
            new() { Id = Guid.NewGuid(), Name = "Company 2", Ondernemingsnummer = "BE0987654321" }
        };

        var companyDtos = new List<CompanyDto>
        {
            new() { Id = companies[0].Id, Name = "Company 1", Ondernemingsnummer = "BE0123456789" },
            new() { Id = companies[1].Id, Name = "Company 2", Ondernemingsnummer = "BE0987654321" }
        };

        _mockRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(companies);
        _mockMapper.Setup(m => m.Map<IEnumerable<CompanyDto>>(companies))
            .Returns(companyDtos);

        var query = new GetAllCompaniesQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(companyDtos);
        
        _mockRepository.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
        _mockMapper.Verify(m => m.Map<IEnumerable<CompanyDto>>(companies), Times.Once);
    }

    [Fact]
    public async Task Handle_WithEmptyRepository_ShouldReturnEmptyCollection()
    {
        // Arrange
        var emptyCompanies = new List<Company>();
        var emptyCompanyDtos = new List<CompanyDto>();

        _mockRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(emptyCompanies);
        _mockMapper.Setup(m => m.Map<IEnumerable<CompanyDto>>(emptyCompanies))
            .Returns(emptyCompanyDtos);

        var query = new GetAllCompaniesQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
        
        _mockRepository.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
        _mockMapper.Verify(m => m.Map<IEnumerable<CompanyDto>>(emptyCompanies), Times.Once);
    }

    [Fact]
    public async Task Handle_WithCancellationToken_ShouldPassTokenToRepository()
    {
        // Arrange
        var cancellationToken = new CancellationToken(true);
        var companies = new List<Company>();
        var companyDtos = new List<CompanyDto>();

        _mockRepository.Setup(r => r.GetAllAsync(cancellationToken))
            .ReturnsAsync(companies);
        _mockMapper.Setup(m => m.Map<IEnumerable<CompanyDto>>(companies))
            .Returns(companyDtos);

        var query = new GetAllCompaniesQuery();

        // Act & Assert
        await Assert.ThrowsAsync<OperationCanceledException>(() => 
            _handler.Handle(query, cancellationToken));
    }
}