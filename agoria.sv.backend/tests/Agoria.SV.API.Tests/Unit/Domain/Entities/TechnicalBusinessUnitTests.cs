using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Agoria.SV.API.Tests.Unit.Domain.Entities;

public class TechnicalBusinessUnitTests
{
    [Fact]
    public void TechnicalBusinessUnit_ShouldInheritFromBaseEntity()
    {
        // Assert
        typeof(TechnicalBusinessUnit).BaseType?.Name.Should().Be("BaseEntity");
    }

    [Fact]
    public void TechnicalBusinessUnit_ShouldHaveDefaultValues()
    {
        // Act
        var unit = new TechnicalBusinessUnit();

        // Assert
        unit.CompanyId.Should().Be(Guid.Empty);
        unit.Name.Should().Be(string.Empty);
        unit.Code.Should().Be(string.Empty);
        unit.Description.Should().Be(string.Empty);
        unit.NumberOfEmployees.Should().Be(0);
        unit.Manager.Should().Be(string.Empty);
        unit.Department.Should().Be(string.Empty);
        unit.Status.Should().Be("active");
        unit.Language.Should().Be("N");
        unit.PcWorkers.Should().Be(string.Empty);
        unit.PcClerks.Should().Be(string.Empty);
        unit.FodDossierBase.Should().Be(string.Empty);
        unit.FodDossierSuffix.Should().Be("1");
    }

    [Theory]
    [InlineData("active")]
    [InlineData("inactive")]
    public void Status_WithValidValues_ShouldSetCorrectly(string validStatus)
    {
        // Arrange
        var unit = new TechnicalBusinessUnit();

        // Act
        unit.Status = validStatus;

        // Assert
        unit.Status.Should().Be(validStatus);
    }

    [Theory]
    [InlineData("")]
    [InlineData("pending")]
    [InlineData("deleted")]
    [InlineData("ACTIVE")]
    [InlineData("Active")]
    public void Status_WithInvalidValues_ShouldThrowArgumentException(string invalidStatus)
    {
        // Arrange
        var unit = new TechnicalBusinessUnit();

        // Act & Assert
        var action = () => unit.Status = invalidStatus;
        action.Should().Throw<ArgumentException>()
            .WithMessage("Status must be 'active' or 'inactive'.");
    }

    [Theory]
    [InlineData("N")]
    [InlineData("F")]
    [InlineData("N+F")]
    [InlineData("D")]
    public void Language_WithValidValues_ShouldSetCorrectly(string validLanguage)
    {
        // Arrange
        var unit = new TechnicalBusinessUnit();

        // Act
        unit.Language = validLanguage;

        // Assert
        unit.Language.Should().Be(validLanguage);
    }

    [Theory]
    [InlineData("")]
    [InlineData("E")]
    [InlineData("EN")]
    [InlineData("NL")]
    [InlineData("FR")]
    [InlineData("n")]
    [InlineData("f")]
    public void Language_WithInvalidValues_ShouldThrowArgumentException(string invalidLanguage)
    {
        // Arrange
        var unit = new TechnicalBusinessUnit();

        // Act & Assert
        var action = () => unit.Language = invalidLanguage;
        action.Should().Throw<ArgumentException>()
            .WithMessage("Language must be 'N', 'F', 'N+F', or 'D'.");
    }

    [Theory]
    [InlineData("1")]
    [InlineData("2")]
    public void FodDossierSuffix_WithValidValues_ShouldSetCorrectly(string validSuffix)
    {
        // Arrange
        var unit = new TechnicalBusinessUnit();

        // Act
        unit.FodDossierSuffix = validSuffix;

        // Assert
        unit.FodDossierSuffix.Should().Be(validSuffix);
    }

    [Theory]
    [InlineData("")]
    [InlineData("0")]
    [InlineData("3")]
    [InlineData("01")]
    [InlineData("A")]
    public void FodDossierSuffix_WithInvalidValues_ShouldThrowArgumentException(string invalidSuffix)
    {
        // Arrange
        var unit = new TechnicalBusinessUnit();

        // Act & Assert
        var action = () => unit.FodDossierSuffix = invalidSuffix;
        action.Should().Throw<ArgumentException>()
            .WithMessage("FOD dossier suffix must be '1' or '2'.");
    }

    [Fact]
    public void TechnicalBusinessUnit_ShouldAllowSettingAllProperties()
    {
        // Arrange
        var unit = new TechnicalBusinessUnit();
        var companyId = Guid.NewGuid();
        var location = new Address("Business Street", "42", "2000", "Antwerp", "Belgium");
        var electionBodies = new ElectionBodies(true, true, false, false);

        // Act
        unit.CompanyId = companyId;
        unit.Name = "IT Department";
        unit.Code = "IT001";
        unit.Description = "Information Technology Department";
        unit.NumberOfEmployees = 25;
        unit.Manager = "EMP001";
        unit.Department = "Technology";
        unit.Status = "active";
        unit.Language = "N+F";
        unit.PcWorkers = "PC100";
        unit.PcClerks = "PC200";
        unit.FodDossierBase = "12345";
        unit.FodDossierSuffix = "2";
        unit.Location = location;
        unit.ElectionBodies = electionBodies;

        // Assert
        unit.CompanyId.Should().Be(companyId);
        unit.Name.Should().Be("IT Department");
        unit.Code.Should().Be("IT001");
        unit.Description.Should().Be("Information Technology Department");
        unit.NumberOfEmployees.Should().Be(25);
        unit.Manager.Should().Be("EMP001");
        unit.Department.Should().Be("Technology");
        unit.Status.Should().Be("active");
        unit.Language.Should().Be("N+F");
        unit.PcWorkers.Should().Be("PC100");
        unit.PcClerks.Should().Be("PC200");
        unit.FodDossierBase.Should().Be("12345");
        unit.FodDossierSuffix.Should().Be("2");
        unit.Location.Should().Be(location);
        unit.ElectionBodies.Should().Be(electionBodies);
    }

    [Fact]
    public void TechnicalBusinessUnit_WithNegativeNumberOfEmployees_ShouldAllow()
    {
        // Arrange
        var unit = new TechnicalBusinessUnit();

        // Act
        unit.NumberOfEmployees = -5;

        // Assert
        unit.NumberOfEmployees.Should().Be(-5);
        // Note: No validation for negative employees, documenting current behavior
    }

    [Fact]
    public void TechnicalBusinessUnit_WithZeroEmployees_ShouldAllow()
    {
        // Arrange
        var unit = new TechnicalBusinessUnit();

        // Act
        unit.NumberOfEmployees = 0;

        // Assert
        unit.NumberOfEmployees.Should().Be(0);
    }

    [Fact]
    public void TechnicalBusinessUnit_WithLargeNumberOfEmployees_ShouldAllow()
    {
        // Arrange
        var unit = new TechnicalBusinessUnit();

        // Act
        unit.NumberOfEmployees = 10000;

        // Assert
        unit.NumberOfEmployees.Should().Be(10000);
    }

    [Fact]
    public void TechnicalBusinessUnit_WithEmptyStrings_ShouldAllow()
    {
        // Arrange
        var unit = new TechnicalBusinessUnit();

        // Act
        unit.Name = "";
        unit.Code = "";
        unit.Description = "";
        unit.Manager = "";
        unit.Department = "";
        unit.PcWorkers = "";
        unit.PcClerks = "";
        unit.FodDossierBase = "";

        // Assert
        unit.Name.Should().Be("");
        unit.Code.Should().Be("");
        unit.Description.Should().Be("");
        unit.Manager.Should().Be("");
        unit.Department.Should().Be("");
        unit.PcWorkers.Should().Be("");
        unit.PcClerks.Should().Be("");
        unit.FodDossierBase.Should().Be("");
    }

    [Fact]
    public void TechnicalBusinessUnit_WithLongStrings_ShouldAllow()
    {
        // Arrange
        var unit = new TechnicalBusinessUnit();
        var longName = new string('A', 200);
        var longDescription = new string('B', 500);

        // Act
        unit.Name = longName;
        unit.Description = longDescription;

        // Assert
        unit.Name.Should().Be(longName);
        unit.Description.Should().Be(longDescription);
    }

    [Theory]
    [InlineData("12345")]
    [InlineData("")]
    [InlineData("ABCDE")]
    [InlineData("1234567890")]
    public void FodDossierBase_WithAnyString_ShouldAllow(string fodDossierBase)
    {
        // Arrange
        var unit = new TechnicalBusinessUnit();

        // Act
        unit.FodDossierBase = fodDossierBase;

        // Assert
        unit.FodDossierBase.Should().Be(fodDossierBase);
        // Note: No validation on FodDossierBase format, documenting current behavior
    }
}