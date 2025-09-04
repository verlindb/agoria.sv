using Agoria.SV.Domain.Entities;
using FluentAssertions;

namespace Agoria.SV.Domain.Tests;

public class TechnicalBusinessUnitTests
{
    [Theory]
    [InlineData("active")]
    [InlineData("inactive")]
    public void TechnicalBusinessUnit_ShouldSetValidStatus_WhenValidStatusProvided(string validStatus)
    {
        // Arrange
        var tbu = new TechnicalBusinessUnit();
        
        // Act
        tbu.Status = validStatus;
        
        // Assert
        tbu.Status.Should().Be(validStatus);
    }

    [Theory]
    [InlineData("invalid")]
    [InlineData("pending")]
    [InlineData("ACTIVE")]
    [InlineData("")]
    public void TechnicalBusinessUnit_ShouldThrowArgumentException_WhenInvalidStatus(string invalidStatus)
    {
        // Arrange
        var tbu = new TechnicalBusinessUnit();
        
        // Act & Assert
        Action act = () => tbu.Status = invalidStatus;
        act.Should().Throw<ArgumentException>()
           .WithMessage("Status must be 'active' or 'inactive'.");
    }

    [Fact]
    public void TechnicalBusinessUnit_ShouldHaveDefaultActiveStatus()
    {
        // Arrange & Act
        var tbu = new TechnicalBusinessUnit();
        
        // Assert
        tbu.Status.Should().Be("active");
    }

    [Theory]
    [InlineData("N")]
    [InlineData("F")]
    [InlineData("N+F")]
    [InlineData("D")]
    public void TechnicalBusinessUnit_ShouldSetValidLanguage_WhenValidLanguageProvided(string validLanguage)
    {
        // Arrange
        var tbu = new TechnicalBusinessUnit();
        
        // Act
        tbu.Language = validLanguage;
        
        // Assert
        tbu.Language.Should().Be(validLanguage);
    }

    [Theory]
    [InlineData("E")]
    [InlineData("EN")]
    [InlineData("n")]
    [InlineData("f")]
    [InlineData("NL")]
    [InlineData("")]
    public void TechnicalBusinessUnit_ShouldThrowArgumentException_WhenInvalidLanguage(string invalidLanguage)
    {
        // Arrange
        var tbu = new TechnicalBusinessUnit();
        
        // Act & Assert
        Action act = () => tbu.Language = invalidLanguage;
        act.Should().Throw<ArgumentException>()
           .WithMessage("Language must be 'N', 'F', 'N+F', or 'D'.");
    }

    [Fact]
    public void TechnicalBusinessUnit_ShouldHaveDefaultLanguageN()
    {
        // Arrange & Act
        var tbu = new TechnicalBusinessUnit();
        
        // Assert
        tbu.Language.Should().Be("N");
    }

    [Theory]
    [InlineData("1")]
    [InlineData("2")]
    public void TechnicalBusinessUnit_ShouldSetValidFodDossierSuffix_WhenValidSuffixProvided(string validSuffix)
    {
        // Arrange
        var tbu = new TechnicalBusinessUnit();
        
        // Act
        tbu.FodDossierSuffix = validSuffix;
        
        // Assert
        tbu.FodDossierSuffix.Should().Be(validSuffix);
    }

    [Theory]
    [InlineData("0")]
    [InlineData("3")]
    [InlineData("")]
    [InlineData("01")]
    [InlineData("a")]
    public void TechnicalBusinessUnit_ShouldThrowArgumentException_WhenInvalidFodDossierSuffix(string invalidSuffix)
    {
        // Arrange
        var tbu = new TechnicalBusinessUnit();
        
        // Act & Assert
        Action act = () => tbu.FodDossierSuffix = invalidSuffix;
        act.Should().Throw<ArgumentException>()
           .WithMessage("FOD dossier suffix must be '1' or '2'.");
    }

    [Fact]
    public void TechnicalBusinessUnit_ShouldHaveDefaultFodDossierSuffixOne()
    {
        // Arrange & Act
        var tbu = new TechnicalBusinessUnit();
        
        // Assert
        tbu.FodDossierSuffix.Should().Be("1");
    }

    [Fact]
    public void TechnicalBusinessUnit_ShouldInitializeWithEmptyStrings()
    {
        // Arrange & Act
        var tbu = new TechnicalBusinessUnit();
        
        // Assert
        tbu.Name.Should().Be(string.Empty);
        tbu.Code.Should().Be(string.Empty);
        tbu.Description.Should().Be(string.Empty);
        tbu.Manager.Should().Be(string.Empty);
        tbu.Department.Should().Be(string.Empty);
        tbu.PcWorkers.Should().Be(string.Empty);
        tbu.PcClerks.Should().Be(string.Empty);
        tbu.FodDossierBase.Should().Be(string.Empty);
    }

    [Fact]
    public void TechnicalBusinessUnit_ShouldInitializeWithDefaultValues()
    {
        // Arrange & Act
        var tbu = new TechnicalBusinessUnit();
        
        // Assert
        tbu.CompanyId.Should().Be(Guid.Empty);
        tbu.NumberOfEmployees.Should().Be(0);
        tbu.Status.Should().Be("active");
        tbu.Language.Should().Be("N");
        tbu.FodDossierSuffix.Should().Be("1");
    }
}