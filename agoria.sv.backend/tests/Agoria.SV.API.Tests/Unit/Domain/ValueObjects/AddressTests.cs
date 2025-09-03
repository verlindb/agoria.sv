using Xunit;
using Agoria.SV.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Agoria.SV.API.Tests.Unit.Domain.ValueObjects;

public class AddressTests
{
    [Fact]
    public void Address_WithValidParameters_ShouldCreateSuccessfully()
    {
        // Arrange
        var street = "Test Street";
        var number = "123";
        var postalCode = "1000";
        var city = "Brussels";
        var country = "Belgium";

        // Act
        var address = new Address(street, number, postalCode, city, country);

        // Assert
        address.Street.Should().Be(street);
        address.Number.Should().Be(number);
        address.PostalCode.Should().Be(postalCode);
        address.City.Should().Be(city);
        address.Country.Should().Be(country);
    }

    [Fact]
    public void Address_WithNullStreet_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var action = () => new Address(null!, "123", "1000", "Brussels", "Belgium");
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("street");
    }

    [Fact]
    public void Address_WithNullNumber_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var action = () => new Address("Test Street", null!, "1000", "Brussels", "Belgium");
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("number");
    }

    [Fact]
    public void Address_WithNullPostalCode_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var action = () => new Address("Test Street", "123", null!, "Brussels", "Belgium");
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("postalCode");
    }

    [Fact]
    public void Address_WithNullCity_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var action = () => new Address("Test Street", "123", "1000", null!, "Belgium");
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("city");
    }

    [Fact]
    public void Address_WithNullCountry_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var action = () => new Address("Test Street", "123", "1000", "Brussels", null!);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("country");
    }

    [Fact]
    public void Address_PropertiesShouldBeReadonly()
    {
        // Arrange
        var address = new Address("Test Street", "123", "1000", "Brussels", "Belgium");

        // Assert
        typeof(Address).GetProperty("Street")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(Address).GetProperty("Number")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(Address).GetProperty("PostalCode")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(Address).GetProperty("City")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(Address).GetProperty("Country")?.SetMethod?.IsPublic.Should().BeFalse();
    }

    [Fact]
    public void Address_WithEmptyStrings_ShouldCreateSuccessfully()
    {
        // Act
        var address = new Address("", "", "", "", "");

        // Assert
        address.Street.Should().Be("");
        address.Number.Should().Be("");
        address.PostalCode.Should().Be("");
        address.City.Should().Be("");
        address.Country.Should().Be("");
    }

    [Theory]
    [InlineData("Lange Straatnaam", "123A", "1000-AB", "Brussels-Capital", "Kingdom of Belgium")]
    [InlineData("Avenue des Champs-Élysées", "1bis", "75008", "Paris", "France")]
    [InlineData("Βασιλίσσης Σοφίας", "46", "10676", "Αθήνα", "Ελλάδα")]
    public void Address_WithVariousFormats_ShouldCreateSuccessfully(string street, string number, string postalCode, string city, string country)
    {
        // Act
        var address = new Address(street, number, postalCode, city, country);

        // Assert
        address.Street.Should().Be(street);
        address.Number.Should().Be(number);
        address.PostalCode.Should().Be(postalCode);
        address.City.Should().Be(city);
        address.Country.Should().Be(country);
    }
}