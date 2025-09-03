using Xunit;
using Agoria.SV.Application.Features.Companies.Commands.DeleteCompany;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using FluentAssertions;
using Moq;

namespace Agoria.SV.API.Tests.Unit.Application.Companies;

public class DeleteCompanyCommandHandlerTests
{
    private readonly Mock<ICompanyRepository> _mockRepository;
    private readonly DeleteCompanyCommandHandler _handler;

    public DeleteCompanyCommandHandlerTests()
    {
        _mockRepository = new Mock<ICompanyRepository>();
        _handler = new DeleteCompanyCommandHandler(_mockRepository.Object);
    }

    [Fact]
    public async Task Handle_WithExistingCompany_ShouldDeleteSuccessfully()
    {
        // Arrange
        var companyId = Guid.NewGuid();
        var existingCompany = new Company 
        { 
            Id = companyId, 
            Name = "Test Company", 
            Ondernemingsnummer = "BE0123456789" 
        };

        _mockRepository.Setup(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingCompany);
        _mockRepository.Setup(r => r.DeleteAsync(existingCompany, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new DeleteCompanyCommand(companyId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();
        
        _mockRepository.Verify(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()), Times.Once);
        _mockRepository.Verify(r => r.DeleteAsync(existingCompany, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentCompany_ShouldReturnFalse()
    {
        // Arrange
        var companyId = Guid.NewGuid();

        _mockRepository.Setup(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Company)null);

        var command = new DeleteCompanyCommand(companyId);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeFalse();
        
        _mockRepository.Verify(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()), Times.Once);
        _mockRepository.Verify(r => r.DeleteAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithCancellationToken_ShouldPassTokenToRepository()
    {
        // Arrange
        var companyId = Guid.NewGuid();
        var cancellationToken = new CancellationToken(true);

        _mockRepository.Setup(r => r.GetByIdAsync(companyId, cancellationToken))
            .ReturnsAsync((Company)null);

        var command = new DeleteCompanyCommand(companyId);

        // Act & Assert
        await Assert.ThrowsAsync<OperationCanceledException>(() => 
            _handler.Handle(command, cancellationToken));
    }
}