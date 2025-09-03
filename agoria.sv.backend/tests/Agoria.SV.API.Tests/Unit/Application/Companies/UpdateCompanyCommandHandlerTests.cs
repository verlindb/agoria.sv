using Xunit;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Application.Features.Companies.Commands.UpdateCompany;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Domain.ValueObjects;
using AutoMapper;
using FluentAssertions;
using Moq;

namespace Agoria.SV.API.Tests.Unit.Application.Companies;

public class UpdateCompanyCommandHandlerTests
{
    private readonly Mock<ICompanyRepository> _mockRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly UpdateCompanyCommandHandler _handler;

    public UpdateCompanyCommandHandlerTests()
    {
        _mockRepository = new Mock<ICompanyRepository>();
        _mockMapper = new Mock<IMapper>();
        _handler = new UpdateCompanyCommandHandler(_mockRepository.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task Handle_WithValidCommand_ShouldUpdateCompanySuccessfully()
    {
        // Arrange
        var companyId = Guid.NewGuid();
        var existingCompany = new Company 
        { 
            Id = companyId, 
            Name = "Old Name", 
            Ondernemingsnummer = "BE0123456789",
            Address = new Address("Old Street", "1", "1000", "Brussels", "Belgium"),
            ContactPerson = new ContactPerson("John", "Doe", "john.doe@example.com", "+32123456789")
        };

        var addressDto = new AddressDto 
        { 
            Street = "New Street", 
            Number = "2", 
            PostalCode = "2000", 
            City = "Antwerp", 
            Country = "Belgium" 
        };
        var contactPersonDto = new ContactPersonDto 
        { 
            FirstName = "Jane", 
            LastName = "Smith", 
            Email = "jane.smith@example.com", 
            PhoneNumber = "+32987654321" 
        };

        var command = new UpdateCompanyCommand(
            companyId,
            "New Name",
            "New Legal Name",
            "BE0987654321",
            "Corporation",
            "Active",
            "Technology",
            100,
            addressDto,
            contactPersonDto
        );

        var expectedDto = new CompanyDto 
        { 
            Id = companyId, 
            Name = "New Name", 
            Ondernemingsnummer = "BE0987654321" 
        };

        _mockRepository.Setup(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingCompany);
        _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        _mockMapper.Setup(m => m.Map<CompanyDto>(It.IsAny<Company>()))
            .Returns(expectedDto);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedDto);
        
        _mockRepository.Verify(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()), Times.Once);
        _mockRepository.Verify(r => r.UpdateAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()), Times.Once);
        _mockMapper.Verify(m => m.Map<CompanyDto>(It.IsAny<Company>()), Times.Once);

        // Verify company properties were updated
        existingCompany.Name.Should().Be("New Name");
        existingCompany.LegalName.Should().Be("New Legal Name");
        existingCompany.Ondernemingsnummer.Should().Be("BE0987654321");
        existingCompany.Type.Should().Be("Corporation");
        existingCompany.Status.Should().Be("Active");
        existingCompany.Sector.Should().Be("Technology");
        existingCompany.NumberOfEmployees.Should().Be(100);
    }

    [Fact]
    public async Task Handle_WithNonExistentCompany_ShouldThrowKeyNotFoundException()
    {
        // Arrange
        var companyId = Guid.NewGuid();
        var addressDto = new AddressDto { Street = "Street", Number = "1", PostalCode = "1000", City = "Brussels", Country = "Belgium" };
        var contactPersonDto = new ContactPersonDto { FirstName = "John", LastName = "Doe", Email = "john@example.com", PhoneNumber = "+32123456789" };

        var command = new UpdateCompanyCommand(
            companyId,
            "Name",
            "Legal Name",
            "BE0123456789",
            "Corporation",
            "Active",
            "Technology",
            50,
            addressDto,
            contactPersonDto
        );

        _mockRepository.Setup(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Company)null);

        // Act & Assert
        await Assert.ThrowsAsync<KeyNotFoundException>(() => 
            _handler.Handle(command, CancellationToken.None));
            
        _mockRepository.Verify(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()), Times.Once);
        _mockRepository.Verify(r => r.UpdateAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}