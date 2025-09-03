using Xunit;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Application.Features.Companies.Commands.CreateCompany;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using AutoMapper;
using FluentAssertions;
using Moq;
using Xunit;

namespace Agoria.SV.API.Tests.Unit;

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
            c.Status == "active"
        ), It.IsAny<CancellationToken>()), Times.Once);

        _mockMapper.Verify(m => m.Map<CompanyDto>(It.IsAny<Company>()), Times.Once);
    }

    [Fact]
    public async Task Handle_BulkImportScenario_ShouldHandleMultipleCreationsIndependently()
    {
        // Arrange
        var commands = new List<CreateCompanyCommand>
        {
            new CreateCompanyCommand(
                Name: "Company 1",
                LegalName: "Company 1 BV",
                Ondernemingsnummer: "BE0123456780",
                Type: "BV",
                Sector: "IT",
                NumberOfEmployees: 10,
                Address: new AddressDto("Street 1", "1", "1000", "Brussels", "Belgium"),
                ContactPerson: new ContactPersonDto("John", "Doe", "john@company1.com", "+32 1 111 11 11", "Manager")
            ),
            new CreateCompanyCommand(
                Name: "Company 2",
                LegalName: "Company 2 NV",
                Ondernemingsnummer: "BE0123456781",
                Type: "NV",
                Sector: "Finance",
                NumberOfEmployees: 20,
                Address: new AddressDto("Street 2", "2", "2000", "Antwerp", "Belgium"),
                ContactPerson: new ContactPersonDto("Jane", "Smith", "jane@company2.com", "+32 2 222 22 22", "Director")
            )
        };

        var createdCompanies = new List<Company>();
        var expectedDtos = new List<CompanyDto>();

        // Setup for each command
        foreach (var command in commands)
        {
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

            var dto = new CompanyDto(
                createdCompany.Id,
                createdCompany.Name,
                createdCompany.LegalName,
                createdCompany.Ondernemingsnummer,
                createdCompany.Type,
                createdCompany.Status,
                createdCompany.Sector,
                createdCompany.NumberOfEmployees,
                command.Address,
                command.ContactPerson,
                createdCompany.CreatedAt,
                createdCompany.UpdatedAt
            );

            createdCompanies.Add(createdCompany);
            expectedDtos.Add(dto);

            _mockRepository.Setup(r => r.AddAsync(It.Is<Company>(c => c.Ondernemingsnummer == command.Ondernemingsnummer), It.IsAny<CancellationToken>()))
                          .ReturnsAsync(createdCompany);

            _mockMapper.Setup(m => m.Map<CompanyDto>(It.Is<Company>(c => c.Ondernemingsnummer == command.Ondernemingsnummer)))
                       .Returns(dto);
        }

        // Act
        var results = new List<CompanyDto>();
        foreach (var command in commands)
        {
            var result = await _handler.Handle(command, CancellationToken.None);
            results.Add(result);
        }

        // Assert
        results.Should().HaveCount(2);
        
        var company1Result = results.First(r => r.Name == "Company 1");
        company1Result.Ondernemingsnummer.Should().Be("BE0123456780");
        company1Result.Type.Should().Be("BV");
        company1Result.Sector.Should().Be("IT");
        company1Result.NumberOfEmployees.Should().Be(10);

        var company2Result = results.First(r => r.Name == "Company 2");
        company2Result.Ondernemingsnummer.Should().Be("BE0123456781");
        company2Result.Type.Should().Be("NV");
        company2Result.Sector.Should().Be("Finance");
        company2Result.NumberOfEmployees.Should().Be(20);

        _mockRepository.Verify(r => r.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()), Times.Exactly(2));
        _mockMapper.Verify(m => m.Map<CompanyDto>(It.IsAny<Company>()), Times.Exactly(2));
    }
}
