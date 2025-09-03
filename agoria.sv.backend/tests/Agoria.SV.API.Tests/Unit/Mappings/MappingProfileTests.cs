using Xunit;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Application.Mappings;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Enums;
using Agoria.SV.Domain.ValueObjects;
using AutoMapper;
using FluentAssertions;

namespace Agoria.SV.API.Tests.Unit.Mappings;

public class MappingProfileTests
{
    private readonly IMapper _mapper;

    public MappingProfileTests()
    {
        var configuration = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
        _mapper = configuration.CreateMapper();
    }

    [Fact]
    public void Configuration_ShouldBeValid()
    {
        // Act & Assert
        _mapper.ConfigurationProvider.AssertConfigurationIsValid();
    }

    [Fact]
    public void Address_ShouldMapToAddressDto()
    {
        // Arrange
        var address = new Address("Main Street", "123", "1000", "Brussels", "Belgium");

        // Act
        var addressDto = _mapper.Map<AddressDto>(address);

        // Assert
        addressDto.Should().NotBeNull();
        addressDto.Street.Should().Be("Main Street");
        addressDto.Number.Should().Be("123");
        addressDto.PostalCode.Should().Be("1000");
        addressDto.City.Should().Be("Brussels");
        addressDto.Country.Should().Be("Belgium");
    }

    [Fact]
    public void ContactPerson_ShouldMapToContactPersonDto()
    {
        // Arrange
        var contactPerson = new ContactPerson("John", "Doe", "john.doe@example.com", "+32123456789");

        // Act
        var contactPersonDto = _mapper.Map<ContactPersonDto>(contactPerson);

        // Assert
        contactPersonDto.Should().NotBeNull();
        contactPersonDto.FirstName.Should().Be("John");
        contactPersonDto.LastName.Should().Be("Doe");
        contactPersonDto.Email.Should().Be("john.doe@example.com");
        contactPersonDto.PhoneNumber.Should().Be("+32123456789");
    }

    [Fact]
    public void Company_ShouldMapToCompanyDto()
    {
        // Arrange
        var company = new Company
        {
            Id = Guid.NewGuid(),
            Name = "Test Company",
            LegalName = "Test Company NV",
            Ondernemingsnummer = "BE0123456789",
            Type = "Corporation",
            Status = "Active",
            Sector = "Technology",
            NumberOfEmployees = 50,
            Address = new Address("Tech Street", "1", "1000", "Brussels", "Belgium"),
            ContactPerson = new ContactPerson("Jane", "Smith", "jane@test.com", "+32987654321")
        };

        // Act
        var companyDto = _mapper.Map<CompanyDto>(company);

        // Assert
        companyDto.Should().NotBeNull();
        companyDto.Id.Should().Be(company.Id);
        companyDto.Name.Should().Be("Test Company");
        companyDto.LegalName.Should().Be("Test Company NV");
        companyDto.Ondernemingsnummer.Should().Be("BE0123456789");
        companyDto.Type.Should().Be("Corporation");
        companyDto.Status.Should().Be("Active");
        companyDto.Sector.Should().Be("Technology");
        companyDto.NumberOfEmployees.Should().Be(50);
        companyDto.Address.Should().NotBeNull();
        companyDto.ContactPerson.Should().NotBeNull();
    }

    [Fact]
    public void Employee_ShouldMapToEmployeeDto()
    {
        // Arrange
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@example.com",
            Role = "Developer",
            Status = "Active",
            TechnicalBusinessUnitId = Guid.NewGuid()
        };

        // Act
        var employeeDto = _mapper.Map<EmployeeDto>(employee);

        // Assert
        employeeDto.Should().NotBeNull();
        employeeDto.Id.Should().Be(employee.Id);
        employeeDto.FirstName.Should().Be("John");
        employeeDto.LastName.Should().Be("Doe");
        employeeDto.Email.Should().Be("john.doe@example.com");
        employeeDto.Role.Should().Be("Developer");
        employeeDto.Status.Should().Be("Active");
        employeeDto.TechnicalBusinessUnitId.Should().Be(employee.TechnicalBusinessUnitId);
        employeeDto.OrMembership.Should().BeNull(); // Ignored in mapping
    }

    [Fact]
    public void TechnicalBusinessUnit_ShouldMapToTechnicalBusinessUnitDto()
    {
        // Arrange
        var technicalBusinessUnit = new TechnicalBusinessUnit
        {
            Id = Guid.NewGuid(),
            Name = "IT Department",
            Status = "Active",
            Language = "Dutch",
            FodDossierSuffix = "01",
            Address = new Address("Office Street", "5", "2000", "Antwerp", "Belgium"),
            ContactPerson = new ContactPerson("Manager", "Boss", "manager@company.com", "+32456789123"),
            ElectionBodies = new ElectionBodies(new List<string> { "Workers Council", "Safety Committee" })
        };

        // Act
        var dto = _mapper.Map<TechnicalBusinessUnitDto>(technicalBusinessUnit);

        // Assert
        dto.Should().NotBeNull();
        dto.Id.Should().Be(technicalBusinessUnit.Id);
        dto.Name.Should().Be("IT Department");
        dto.Status.Should().Be("Active");
        dto.Language.Should().Be("Dutch");
        dto.FodDossierSuffix.Should().Be("01");
        dto.Address.Should().NotBeNull();
        dto.ContactPerson.Should().NotBeNull();
        dto.ElectionBodies.Should().NotBeNull();
    }

    [Fact]
    public void OrMembership_ShouldMapToOrMembershipDto()
    {
        // Arrange
        var orMembership = new OrMembership
        {
            Id = Guid.NewGuid(),
            EmployeeId = Guid.NewGuid(),
            Category = ORCategory.ArbeiderVertegenwoordiger,
            Order = 1
        };

        // Act
        var dto = _mapper.Map<OrMembershipDto>(orMembership);

        // Assert
        dto.Should().NotBeNull();
        dto.Id.Should().Be(orMembership.Id);
        dto.EmployeeId.Should().Be(orMembership.EmployeeId);
        dto.Category.Should().Be("Arbeider vertegenwoordiger"); // Mapped to string value
        dto.Order.Should().Be(1);
    }

    [Fact]
    public void ElectionBodies_ShouldMapToElectionBodiesDto()
    {
        // Arrange
        var electionBodies = new ElectionBodies(new List<string> 
        { 
            "Workers Council", 
            "Safety Committee", 
            "Prevention Committee" 
        });

        // Act
        var dto = _mapper.Map<ElectionBodiesDto>(electionBodies);

        // Assert
        dto.Should().NotBeNull();
        dto.Bodies.Should().NotBeNull();
        dto.Bodies.Should().HaveCount(3);
        dto.Bodies.Should().Contain("Workers Council");
        dto.Bodies.Should().Contain("Safety Committee");
        dto.Bodies.Should().Contain("Prevention Committee");
    }

    [Fact]
    public void WorksCouncil_ShouldMapToWorksCouncilDto()
    {
        // Arrange
        var worksCouncil = new WorksCouncil
        {
            Id = Guid.NewGuid(),
            TechnicalBusinessUnitId = Guid.NewGuid(),
            Name = "Main Works Council"
        };

        // Act
        var dto = _mapper.Map<WorksCouncilDto>(worksCouncil);

        // Assert
        dto.Should().NotBeNull();
        dto.Id.Should().Be(worksCouncil.Id);
        dto.TechnicalBusinessUnitId.Should().Be(worksCouncil.TechnicalBusinessUnitId);
        dto.Name.Should().Be("Main Works Council");
    }
}