using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Agoria.SV.API.Tests.Unit.Domain.Entities;

public class CompanyTests
{
    [Fact]
    public void Company_ShouldInheritFromBaseEntity()
    {
        // Assert
        typeof(Company).BaseType?.Name.Should().Be("BaseEntity");
    }

    [Fact]
    public void Company_ShouldHaveDefaultValues()
    {
        // Act
        var company = new Company();

        // Assert
        company.Name.Should().Be(string.Empty);
        company.LegalName.Should().Be(string.Empty);
        company.Type.Should().Be(string.Empty);
        company.Status.Should().Be("active");
        company.Sector.Should().Be(string.Empty);
        company.NumberOfEmployees.Should().Be(0);
    }

    [Theory]
    [InlineData("BE0123456789")]
    [InlineData("BE1234567890")]
    [InlineData("BE9876543210")]
    public void Ondernemingsnummer_WithValidFormat_ShouldSetCorrectly(string validOndernemingsnummer)
    {
        // Arrange
        var company = new Company();

        // Act
        company.Ondernemingsnummer = validOndernemingsnummer;

        // Assert
        company.Ondernemingsnummer.Should().Be(validOndernemingsnummer);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    [InlineData("123456789")]
    [InlineData("BE123456789")]
    [InlineData("BE12345678901")]
    [InlineData("NL123456789")]
    [InlineData("BE123456789A")]
    [InlineData("BEABCDEFGHIJ")]
    public void Ondernemingsnummer_WithInvalidFormat_ShouldThrowArgumentException(string invalidOndernemingsnummer)
    {
        // Arrange
        var company = new Company();

        // Act & Assert
        var action = () => company.Ondernemingsnummer = invalidOndernemingsnummer;
        action.Should().Throw<ArgumentException>()
            .WithMessage("Ondernemingsnummer moet het formaat BE0123456789 hebben.");
    }

    [Theory]
    [InlineData("active")]
    [InlineData("inactive")]
    [InlineData("pending")]
    public void Status_WithValidValues_ShouldSetCorrectly(string validStatus)
    {
        // Arrange
        var company = new Company();

        // Act
        company.Status = validStatus;

        // Assert
        company.Status.Should().Be(validStatus);
    }

    [Theory]
    [InlineData("")]
    [InlineData("deleted")]
    [InlineData("suspended")]
    [InlineData("ACTIVE")]
    [InlineData("Active")]
    public void Status_WithInvalidValues_ShouldThrowArgumentException(string invalidStatus)
    {
        // Arrange
        var company = new Company();

        // Act & Assert
        var action = () => company.Status = invalidStatus;
        action.Should().Throw<ArgumentException>()
            .WithMessage("Status must be 'active', 'inactive', or 'pending'.");
    }

    [Fact]
    public void Company_ShouldAllowSettingAllProperties()
    {
        // Arrange
        var company = new Company();
        var address = new Address("Test Street", "1", "1000", "Brussels", "Belgium");
        var contactPerson = new ContactPerson("John", "Doe", "john@test.com", "+32 1 111 11 11", "Manager");

        // Act
        company.Name = "Test Company";
        company.LegalName = "Test Company BV";
        company.Ondernemingsnummer = "BE0123456789";
        company.Type = "BV";
        company.Status = "active";
        company.Sector = "IT";
        company.NumberOfEmployees = 50;
        company.Address = address;
        company.ContactPerson = contactPerson;

        // Assert
        company.Name.Should().Be("Test Company");
        company.LegalName.Should().Be("Test Company BV");
        company.Ondernemingsnummer.Should().Be("BE0123456789");
        company.Type.Should().Be("BV");
        company.Status.Should().Be("active");
        company.Sector.Should().Be("IT");
        company.NumberOfEmployees.Should().Be(50);
        company.Address.Should().Be(address);
        company.ContactPerson.Should().Be(contactPerson);
    }

    [Fact]
    public void Company_WithNegativeNumberOfEmployees_ShouldStillAllow()
    {
        // Arrange
        var company = new Company();

        // Act
        company.NumberOfEmployees = -1;

        // Assert
        company.NumberOfEmployees.Should().Be(-1);
        // Note: The domain doesn't validate negative employees, this test confirms current behavior
    }

    [Fact]
    public void Company_WithZeroEmployees_ShouldAllow()
    {
        // Arrange
        var company = new Company();

        // Act
        company.NumberOfEmployees = 0;

        // Assert
        company.NumberOfEmployees.Should().Be(0);
    }

    [Fact]
    public void Company_WithLargeNumberOfEmployees_ShouldAllow()
    {
        // Arrange
        var company = new Company();

        // Act
        company.NumberOfEmployees = 1000000;

        // Assert
        company.NumberOfEmployees.Should().Be(1000000);
    }
}