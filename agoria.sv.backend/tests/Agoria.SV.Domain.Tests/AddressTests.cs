using Agoria.SV.Domain.ValueObjects;
using FluentAssertions;

namespace Agoria.SV.Domain.Tests;

public class AddressTests
{
    [Fact]
    public void Address_ShouldCreateValidAddress_WhenValidParametersProvided()
    {
        // Arrange
        var street = "Main Street";
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

    [Theory]
    [InlineData(null)]
    public void Address_ShouldThrowArgumentNullException_WhenStreetIsNull(string? street)
    {
        // Arrange
        var number = "123";
        var postalCode = "1000";
        var city = "Brussels";
        var country = "Belgium";

        // Act & Assert
        Action act = () => new Address(street!, number, postalCode, city, country);
        act.Should().Throw<ArgumentNullException>().WithParameterName(nameof(street));
    }

    [Theory]
    [InlineData(null)]
    public void Address_ShouldThrowArgumentNullException_WhenNumberIsNull(string? number)
    {
        // Arrange
        var street = "Main Street";
        var postalCode = "1000";
        var city = "Brussels";
        var country = "Belgium";

        // Act & Assert
        Action act = () => new Address(street, number!, postalCode, city, country);
        act.Should().Throw<ArgumentNullException>().WithParameterName(nameof(number));
    }

    [Theory]
    [InlineData(null)]
    public void Address_ShouldThrowArgumentNullException_WhenPostalCodeIsNull(string? postalCode)
    {
        // Arrange
        var street = "Main Street";
        var number = "123";
        var city = "Brussels";
        var country = "Belgium";

        // Act & Assert
        Action act = () => new Address(street, number, postalCode!, city, country);
        act.Should().Throw<ArgumentNullException>().WithParameterName(nameof(postalCode));
    }

    [Theory]
    [InlineData(null)]
    public void Address_ShouldThrowArgumentNullException_WhenCityIsNull(string? city)
    {
        // Arrange
        var street = "Main Street";
        var number = "123";
        var postalCode = "1000";
        var country = "Belgium";

        // Act & Assert
        Action act = () => new Address(street, number, postalCode, city!, country);
        act.Should().Throw<ArgumentNullException>().WithParameterName(nameof(city));
    }

    [Theory]
    [InlineData(null)]
    public void Address_ShouldThrowArgumentNullException_WhenCountryIsNull(string? country)
    {
        // Arrange
        var street = "Main Street";
        var number = "123";
        var postalCode = "1000";
        var city = "Brussels";

        // Act & Assert
        Action act = () => new Address(street, number, postalCode, city, country!);
        act.Should().Throw<ArgumentNullException>().WithParameterName(nameof(country));
    }

    [Fact]
    public void Address_ShouldBeImmutable_AfterCreation()
    {
        // Arrange
        var street = "Main Street";
        var number = "123";
        var postalCode = "1000";
        var city = "Brussels";
        var country = "Belgium";

        // Act
        var address = new Address(street, number, postalCode, city, country);

        // Assert - Properties should have private setters (immutable)
        typeof(Address).GetProperty(nameof(Address.Street))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
        typeof(Address).GetProperty(nameof(Address.Number))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
        typeof(Address).GetProperty(nameof(Address.PostalCode))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
        typeof(Address).GetProperty(nameof(Address.City))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
        typeof(Address).GetProperty(nameof(Address.Country))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
    }

    [Fact]
    public void Address_ShouldAcceptEmptyStrings()
    {
        // Arrange & Act
        var address = new Address("", "", "", "", "");

        // Assert
        address.Street.Should().Be("");
        address.Number.Should().Be("");
        address.PostalCode.Should().Be("");
        address.City.Should().Be("");
        address.Country.Should().Be("");
    }
}