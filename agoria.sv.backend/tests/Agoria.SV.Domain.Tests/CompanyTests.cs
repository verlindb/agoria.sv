using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.ValueObjects;
using FluentAssertions;

namespace Agoria.SV.Domain.Tests;

public class CompanyTests
{
    [Fact]
    public void Company_ShouldSetValidOndernemingsnummer_WhenValidFormat()
    {
        // Arrange
        var company = new Company();
        
        // Act
        company.Ondernemingsnummer = "BE0123456789";
        
        // Assert
        company.Ondernemingsnummer.Should().Be("BE0123456789");
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("123456789")]
    [InlineData("BE123456789")]
    [InlineData("BE01234567890")]
    [InlineData("NL0123456789")]
    public void Company_ShouldThrowArgumentException_WhenInvalidOndernemingsnummer(string invalidNumber)
    {
        // Arrange
        var company = new Company();
        
        // Act & Assert
        Action act = () => company.Ondernemingsnummer = invalidNumber;
        act.Should().Throw<ArgumentException>()
           .WithMessage("Ondernemingsnummer moet het formaat BE0123456789 hebben.");
    }

    [Theory]
    [InlineData("active")]
    [InlineData("inactive")]
    [InlineData("pending")]
    public void Company_ShouldSetValidStatus_WhenValidStatusProvided(string validStatus)
    {
        // Arrange
        var company = new Company();
        
        // Act
        company.Status = validStatus;
        
        // Assert
        company.Status.Should().Be(validStatus);
    }

    [Theory]
    [InlineData("invalid")]
    [InlineData("")]
    [InlineData("ACTIVE")]
    [InlineData("deleted")]
    public void Company_ShouldThrowArgumentException_WhenInvalidStatus(string invalidStatus)
    {
        // Arrange
        var company = new Company();
        
        // Act & Assert
        Action act = () => company.Status = invalidStatus;
        act.Should().Throw<ArgumentException>()
           .WithMessage("Status must be 'active', 'inactive', or 'pending'.");
    }

    [Fact]
    public void Company_ShouldHaveDefaultActiveStatus()
    {
        // Arrange & Act
        var company = new Company();
        
        // Assert
        company.Status.Should().Be("active");
    }

    [Fact]
    public void Company_ShouldInitializeWithEmptyStrings()
    {
        // Arrange & Act
        var company = new Company();
        
        // Assert
        company.Name.Should().Be(string.Empty);
        company.LegalName.Should().Be(string.Empty);
        company.Type.Should().Be(string.Empty);
        company.Sector.Should().Be(string.Empty);
    }
}