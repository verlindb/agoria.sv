using Xunit;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Application.Features.Companies.Queries.GetCompanyById;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using AutoMapper;
using FluentAssertions;
using Moq;
using Xunit;

namespace Agoria.SV.API.Tests.Unit.Application.Companies;

public class GetCompanyByIdQueryHandlerTests
{
    private readonly Mock<ICompanyRepository> _mockRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly GetCompanyByIdQueryHandler _handler;

    public GetCompanyByIdQueryHandlerTests()
    {
        _mockRepository = new Mock<ICompanyRepository>();
        _mockMapper = new Mock<IMapper>();
        _handler = new GetCompanyByIdQueryHandler(_mockRepository.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task Handle_WithValidId_ShouldReturnMappedCompany()
    {
        // Arrange
        var companyId = Guid.NewGuid();
        var company = new Company 
        { 
            Id = companyId, 
            Name = "Test Company", 
            Ondernemingsnummer = "BE0123456789" 
        };
        var companyDto = new CompanyDto 
        { 
            Id = companyId, 
            Name = "Test Company", 
            Ondernemingsnummer = "BE0123456789" 
        };

        _mockRepository.Setup(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(company);
        _mockMapper.Setup(m => m.Map<CompanyDto>(company))
            .Returns(companyDto);

        var query = new GetCompanyByIdQuery(companyId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(companyDto);
        
        _mockRepository.Verify(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()), Times.Once);
        _mockMapper.Verify(m => m.Map<CompanyDto>(company), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentId_ShouldReturnNull()
    {
        // Arrange
        var companyId = Guid.NewGuid();

        _mockRepository.Setup(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Company)null);

        var query = new GetCompanyByIdQuery(companyId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
        
        _mockRepository.Verify(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()), Times.Once);
        _mockMapper.Verify(m => m.Map<CompanyDto>(It.IsAny<Company>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithCancellationToken_ShouldPassTokenToRepository()
    {
        // Arrange
        var companyId = Guid.NewGuid();
        var cancellationToken = new CancellationToken(true);

        _mockRepository.Setup(r => r.GetByIdAsync(companyId, cancellationToken))
            .ReturnsAsync((Company)null);

        var query = new GetCompanyByIdQuery(companyId);

        // Act & Assert
        await Assert.ThrowsAsync<OperationCanceledException>(() => 
            _handler.Handle(query, cancellationToken));
    }
}