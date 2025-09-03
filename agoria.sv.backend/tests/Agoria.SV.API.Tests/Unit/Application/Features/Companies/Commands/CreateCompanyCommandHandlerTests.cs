using Xunit;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Application.Features.Companies.Commands.CreateCompany;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using AutoMapper;
using FluentAssertions;
using Moq;
using Xunit;

namespace Agoria.SV.API.Tests.Unit.Application.Features.Companies.Commands;

public class CreateCompanyCommandHandlerTests
{
    private readonly Mock<ICompanyRepository> _mockRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly CreateCompanyCommandHandler _handler;

    public CreateCompanyCommandHandlerTests()
    {
        _mockRepository = new Mock<ICompanyRepository>();
        _mockMapper = new Mock<IMapper>();
        _handler = new CreateCompanyCommandHandler(_mockRepository.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ShouldCreateCompanySuccessfully()
    {
        // Arrange
        var command = new CreateCompanyCommand(
            Name: "Test Company",
            LegalName: "Test Company BV",
            Ondernemingsnummer: "BE0123456789",
            Type: "BV",
            Sector: "IT",
            NumberOfEmployees: 50,
            Address: new AddressDto("Test Street", "1", "1000", "Brussels", "Belgium"),
            ContactPerson: new ContactPersonDto("John", "Doe", "john@test.com", "+32 1 111 11 11", "Manager")
        );

        var createdCompany = new Company
        {
            Id = Guid.NewGuid(),
            Name = command.Name,
            LegalName = command.LegalName,
            Ondernemingsnummer = command.Ondernemingsnummer,
            Type = command.Type,
            Sector = command.Sector,
            NumberOfEmployees = command.NumberOfEmployees,
            Status = "active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var expectedDto = new CompanyDto(
            createdCompany.Id,
            createdCompany.Name,
            createdCompany.LegalName,
            createdCompany.Ondernemingsnummer,
            createdCompany.Type,
            createdCompany.Status,
            createdCompany.Sector,
            createdCompany.NumberOfEmployees,
            new AddressDto("Test Street", "1", "1000", "Brussels", "Belgium"),
            new ContactPersonDto("John", "Doe", "john@test.com", "+32 1 111 11 11", "Manager"),
            createdCompany.CreatedAt,
            createdCompany.UpdatedAt
        );

        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()))
                      .ReturnsAsync(createdCompany);

        _mockMapper.Setup(m => m.Map<CompanyDto>(It.IsAny<Company>()))
                   .Returns(expectedDto);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(command.Name);
        result.LegalName.Should().Be(command.LegalName);
        result.Ondernemingsnummer.Should().Be(command.Ondernemingsnummer);
        result.Type.Should().Be(command.Type);
        result.Sector.Should().Be(command.Sector);
        result.NumberOfEmployees.Should().Be(command.NumberOfEmployees);
        result.Status.Should().Be("active");

        _mockRepository.Verify(r => r.AddAsync(It.Is<Company>(c => 
            c.Name == command.Name &&
            c.LegalName == command.LegalName &&
            c.Ondernemingsnummer == command.Ondernemingsnummer &&
            c.Type == command.Type &&
            c.Sector == command.Sector &&
            c.NumberOfEmployees == command.NumberOfEmployees &&
            c.Status == "active" &&
            c.Id != Guid.Empty &&
            c.CreatedAt != default &&
            c.UpdatedAt != default
        ), It.IsAny<CancellationToken>()), Times.Once);

        _mockMapper.Verify(m => m.Map<CompanyDto>(It.IsAny<Company>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldSetCorrectTimestamps()
    {
        // Arrange
        var command = new CreateCompanyCommand(
            Name: "Test Company",
            LegalName: "Test Company BV",
            Ondernemingsnummer: "BE0123456789",
            Type: "BV",
            Sector: "IT",
            NumberOfEmployees: 50,
            Address: new AddressDto("Test Street", "1", "1000", "Brussels", "Belgium"),
            ContactPerson: new ContactPersonDto("John", "Doe", "john@test.com", "+32 1 111 11 11", "Manager")
        );

        var createdCompany = new Company();
        var expectedDto = new CompanyDto(Guid.NewGuid(), "", "", "", "", "", "", 0, 
            new AddressDto("", "", "", "", ""), new ContactPersonDto("", "", "", "", ""), 
            DateTime.UtcNow, DateTime.UtcNow);

        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()))
                      .ReturnsAsync(createdCompany);
        _mockMapper.Setup(m => m.Map<CompanyDto>(It.IsAny<Company>()))
                   .Returns(expectedDto);

        var startTime = DateTime.UtcNow;

        // Act
        await _handler.Handle(command, CancellationToken.None);

        var endTime = DateTime.UtcNow;

        // Assert
        _mockRepository.Verify(r => r.AddAsync(It.Is<Company>(c => 
            c.CreatedAt >= startTime && c.CreatedAt <= endTime &&
            c.UpdatedAt >= startTime && c.UpdatedAt <= endTime &&
            c.CreatedAt == c.UpdatedAt // Should be the same for new entities
        ), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldCreateEntityWithCorrectAddressAndContactPerson()
    {
        // Arrange
        var addressDto = new AddressDto("Rue de la Loi", "16", "1000", "Brussels", "Belgium");
        var contactPersonDto = new ContactPersonDto("Marie", "Dubois", "marie.dubois@company.be", "+32 2 123 45 67", "CEO");
        
        var command = new CreateCompanyCommand(
            Name: "Belgian Tech Corp",
            LegalName: "Belgian Technology Corporation BVBA",
            Ondernemingsnummer: "BE0987654321",
            Type: "BVBA",
            Sector: "Technology",
            NumberOfEmployees: 100,
            Address: addressDto,
            ContactPerson: contactPersonDto
        );

        var createdCompany = new Company();
        var expectedDto = new CompanyDto(Guid.NewGuid(), "", "", "", "", "", "", 0, 
            addressDto, contactPersonDto, DateTime.UtcNow, DateTime.UtcNow);

        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()))
                      .ReturnsAsync(createdCompany);
        _mockMapper.Setup(m => m.Map<CompanyDto>(It.IsAny<Company>()))
                   .Returns(expectedDto);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _mockRepository.Verify(r => r.AddAsync(It.Is<Company>(c => 
            c.Address.Street == "Rue de la Loi" &&
            c.Address.Number == "16" &&
            c.Address.PostalCode == "1000" &&
            c.Address.City == "Brussels" &&
            c.Address.Country == "Belgium" &&
            c.ContactPerson.FirstName == "Marie" &&
            c.ContactPerson.LastName == "Dubois" &&
            c.ContactPerson.Email == "marie.dubois@company.be" &&
            c.ContactPerson.Phone == "+32 2 123 45 67" &&
            c.ContactPerson.Function == "CEO"
        ), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithRepositoryException_ShouldPropagateException()
    {
        // Arrange
        var command = new CreateCompanyCommand(
            Name: "Test Company",
            LegalName: "Test Company BV",
            Ondernemingsnummer: "BE0123456789",
            Type: "BV",
            Sector: "IT",
            NumberOfEmployees: 50,
            Address: new AddressDto("Test Street", "1", "1000", "Brussels", "Belgium"),
            ContactPerson: new ContactPersonDto("John", "Doe", "john@test.com", "+32 1 111 11 11", "Manager")
        );

        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()))
                      .ThrowsAsync(new InvalidOperationException("Database error"));

        // Act & Assert
        var action = async () => await _handler.Handle(command, CancellationToken.None);
        await action.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Database error");

        _mockMapper.Verify(m => m.Map<CompanyDto>(It.IsAny<Company>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithMapperException_ShouldPropagateException()
    {
        // Arrange
        var command = new CreateCompanyCommand(
            Name: "Test Company",
            LegalName: "Test Company BV",
            Ondernemingsnummer: "BE0123456789",
            Type: "BV",
            Sector: "IT",
            NumberOfEmployees: 50,
            Address: new AddressDto("Test Street", "1", "1000", "Brussels", "Belgium"),
            ContactPerson: new ContactPersonDto("John", "Doe", "john@test.com", "+32 1 111 11 11", "Manager")
        );

        var createdCompany = new Company();

        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()))
                      .ReturnsAsync(createdCompany);

        _mockMapper.Setup(m => m.Map<CompanyDto>(It.IsAny<Company>()))
                   .Throws(new AutoMapperMappingException("Mapping error"));

        // Act & Assert
        var action = async () => await _handler.Handle(command, CancellationToken.None);
        await action.Should().ThrowAsync<AutoMapperMappingException>()
            .WithMessage("Mapping error");
    }

    [Fact]
    public async Task Handle_WithCancellationToken_ShouldPassTokenToRepository()
    {
        // Arrange
        var command = new CreateCompanyCommand(
            Name: "Test Company",
            LegalName: "Test Company BV",
            Ondernemingsnummer: "BE0123456789",
            Type: "BV",
            Sector: "IT",
            NumberOfEmployees: 50,
            Address: new AddressDto("Test Street", "1", "1000", "Brussels", "Belgium"),
            ContactPerson: new ContactPersonDto("John", "Doe", "john@test.com", "+32 1 111 11 11", "Manager")
        );

        var cancellationToken = new CancellationToken(true);
        var createdCompany = new Company();

        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Company>(), cancellationToken))
                      .ThrowsAsync(new OperationCanceledException());

        // Act & Assert
        var action = async () => await _handler.Handle(command, cancellationToken);
        await action.Should().ThrowAsync<OperationCanceledException>();

        _mockRepository.Verify(r => r.AddAsync(It.IsAny<Company>(), cancellationToken), Times.Once);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(5000)]
    [InlineData(int.MaxValue)]
    public async Task Handle_WithDifferentEmployeeCounts_ShouldCreateSuccessfully(int numberOfEmployees)
    {
        // Arrange
        var command = new CreateCompanyCommand(
            Name: "Test Company",
            LegalName: "Test Company BV",
            Ondernemingsnummer: "BE0123456789",
            Type: "BV",
            Sector: "IT",
            NumberOfEmployees: numberOfEmployees,
            Address: new AddressDto("Test Street", "1", "1000", "Brussels", "Belgium"),
            ContactPerson: new ContactPersonDto("John", "Doe", "john@test.com", "+32 1 111 11 11", "Manager")
        );

        var createdCompany = new Company();
        var expectedDto = new CompanyDto(Guid.NewGuid(), "", "", "", "", "", "", numberOfEmployees, 
            new AddressDto("", "", "", "", ""), new ContactPersonDto("", "", "", "", ""), 
            DateTime.UtcNow, DateTime.UtcNow);

        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()))
                      .ReturnsAsync(createdCompany);
        _mockMapper.Setup(m => m.Map<CompanyDto>(It.IsAny<Company>()))
                   .Returns(expectedDto);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        _mockRepository.Verify(r => r.AddAsync(It.Is<Company>(c => 
            c.NumberOfEmployees == numberOfEmployees
        ), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldGenerateUniqueId()
    {
        // Arrange
        var command = new CreateCompanyCommand(
            Name: "Test Company",
            LegalName: "Test Company BV",
            Ondernemingsnummer: "BE0123456789",
            Type: "BV",
            Sector: "IT",
            NumberOfEmployees: 50,
            Address: new AddressDto("Test Street", "1", "1000", "Brussels", "Belgium"),
            ContactPerson: new ContactPersonDto("John", "Doe", "john@test.com", "+32 1 111 11 11", "Manager")
        );

        var createdCompany = new Company();
        var expectedDto = new CompanyDto(Guid.NewGuid(), "", "", "", "", "", "", 0, 
            new AddressDto("", "", "", "", ""), new ContactPersonDto("", "", "", "", ""), 
            DateTime.UtcNow, DateTime.UtcNow);

        _mockRepository.Setup(r => r.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()))
                      .ReturnsAsync(createdCompany);
        _mockMapper.Setup(m => m.Map<CompanyDto>(It.IsAny<Company>()))
                   .Returns(expectedDto);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _mockRepository.Verify(r => r.AddAsync(It.Is<Company>(c => 
            c.Id != Guid.Empty
        ), It.IsAny<CancellationToken>()), Times.Once);
    }
}