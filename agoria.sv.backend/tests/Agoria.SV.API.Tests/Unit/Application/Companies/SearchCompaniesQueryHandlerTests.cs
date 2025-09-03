using Xunit;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Application.Features.Companies.Queries.SearchCompanies;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using AutoMapper;
using FluentAssertions;
using Moq;

namespace Agoria.SV.API.Tests.Unit.Application.Companies;

public class SearchCompaniesQueryHandlerTests
{
    private readonly Mock<ICompanyRepository> _mockRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly SearchCompaniesQueryHandler _handler;

    public SearchCompaniesQueryHandlerTests()
    {
        _mockRepository = new Mock<ICompanyRepository>();
        _mockMapper = new Mock<IMapper>();
        _handler = new SearchCompaniesQueryHandler(_mockRepository.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task Handle_WithSearchTerm_ShouldReturnFilteredCompanies()
    {
        // Arrange
        var searchTerm = "Tech";
        var companies = new List<Company>
        {
            new() { Id = Guid.NewGuid(), Name = "Tech Corp", Ondernemingsnummer = "BE0123456789" },
            new() { Id = Guid.NewGuid(), Name = "Innovation Tech", Ondernemingsnummer = "BE0987654321" }
        };

        var companyDtos = new List<CompanyDto>
        {
            new() { Id = companies[0].Id, Name = "Tech Corp", Ondernemingsnummer = "BE0123456789" },
            new() { Id = companies[1].Id, Name = "Innovation Tech", Ondernemingsnummer = "BE0987654321" }
        };

        _mockRepository.Setup(r => r.SearchAsync(searchTerm, null, null, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(companies);
        _mockMapper.Setup(m => m.Map<IEnumerable<CompanyDto>>(companies))
            .Returns(companyDtos);

        var query = new SearchCompaniesQuery(searchTerm, null, null, null, null, null, null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(companyDtos);
        
        _mockRepository.Verify(r => r.SearchAsync(searchTerm, null, null, null, null, null, null, It.IsAny<CancellationToken>()), Times.Once);
        _mockMapper.Verify(m => m.Map<IEnumerable<CompanyDto>>(companies), Times.Once);
    }

    [Fact]
    public async Task Handle_WithAllFilters_ShouldPassAllParametersToRepository()
    {
        // Arrange
        var searchTerm = "Tech";
        var type = "Corporation";
        var status = "Active";
        var sector = "IT";
        var city = "Brussels";
        var postalCode = "1000";
        var country = "Belgium";

        var companies = new List<Company>();
        var companyDtos = new List<CompanyDto>();

        _mockRepository.Setup(r => r.SearchAsync(searchTerm, type, status, sector, city, postalCode, country, It.IsAny<CancellationToken>()))
            .ReturnsAsync(companies);
        _mockMapper.Setup(m => m.Map<IEnumerable<CompanyDto>>(companies))
            .Returns(companyDtos);

        var query = new SearchCompaniesQuery(searchTerm, type, status, sector, city, postalCode, country);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        
        _mockRepository.Verify(r => r.SearchAsync(searchTerm, type, status, sector, city, postalCode, country, It.IsAny<CancellationToken>()), Times.Once);
        _mockMapper.Verify(m => m.Map<IEnumerable<CompanyDto>>(companies), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNoMatches_ShouldReturnEmptyCollection()
    {
        // Arrange
        var searchTerm = "NonExistent";
        var emptyCompanies = new List<Company>();
        var emptyCompanyDtos = new List<CompanyDto>();

        _mockRepository.Setup(r => r.SearchAsync(searchTerm, null, null, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(emptyCompanies);
        _mockMapper.Setup(m => m.Map<IEnumerable<CompanyDto>>(emptyCompanies))
            .Returns(emptyCompanyDtos);

        var query = new SearchCompaniesQuery(searchTerm, null, null, null, null, null, null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }
}