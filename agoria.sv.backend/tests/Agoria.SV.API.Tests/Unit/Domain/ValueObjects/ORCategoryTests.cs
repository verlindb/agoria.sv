using Agoria.SV.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Agoria.SV.API.Tests.Unit.Domain.ValueObjects;

public class ORCategoryTests
{
    [Fact]
    public void ORCategory_ShouldHaveExpectedEnumValues()
    {
        // Assert
        Enum.IsDefined(typeof(ORCategory), ORCategory.Arbeiders).Should().BeTrue();
        Enum.IsDefined(typeof(ORCategory), ORCategory.Bedienden).Should().BeTrue();
        Enum.IsDefined(typeof(ORCategory), ORCategory.Kaderleden).Should().BeTrue();
        Enum.IsDefined(typeof(ORCategory), ORCategory.Jeugdige).Should().BeTrue();
    }

    [Theory]
    [InlineData(ORCategory.Arbeiders, "arbeiders")]
    [InlineData(ORCategory.Bedienden, "bedienden")]
    [InlineData(ORCategory.Kaderleden, "kaderleden")]
    [InlineData(ORCategory.Jeugdige, "jeugdige")]
    public void ToStringValue_WithValidCategories_ShouldReturnCorrectString(ORCategory category, string expectedString)
    {
        // Act
        var result = category.ToStringValue();

        // Assert
        result.Should().Be(expectedString);
    }

    [Fact]
    public void ToStringValue_WithInvalidCategory_ShouldThrowArgumentOutOfRangeException()
    {
        // Arrange
        var invalidCategory = (ORCategory)999;

        // Act & Assert
        var action = () => invalidCategory.ToStringValue();
        action.Should().Throw<ArgumentOutOfRangeException>()
            .WithParameterName("category");
    }

    [Theory]
    [InlineData("arbeiders", ORCategory.Arbeiders)]
    [InlineData("bedienden", ORCategory.Bedienden)]
    [InlineData("kaderleden", ORCategory.Kaderleden)]
    [InlineData("jeugdige", ORCategory.Jeugdige)]
    public void FromString_WithValidStrings_ShouldReturnCorrectCategory(string input, ORCategory expectedCategory)
    {
        // Act
        var result = ORCategoryHelper.FromString(input);

        // Assert
        result.Should().Be(expectedCategory);
    }

    [Theory]
    [InlineData("ARBEIDERS", ORCategory.Arbeiders)]
    [InlineData("BEDIENDEN", ORCategory.Bedienden)]
    [InlineData("KADERLEDEN", ORCategory.Kaderleden)]
    [InlineData("JEUGDIGE", ORCategory.Jeugdige)]
    [InlineData("Arbeiders", ORCategory.Arbeiders)]
    [InlineData("Bedienden", ORCategory.Bedienden)]
    [InlineData("Kaderleden", ORCategory.Kaderleden)]
    [InlineData("Jeugdige", ORCategory.Jeugdige)]
    [InlineData("ArBeIdErS", ORCategory.Arbeiders)]
    [InlineData("BeDiEnDeN", ORCategory.Bedienden)]
    public void FromString_WithDifferentCasing_ShouldReturnCorrectCategory(string input, ORCategory expectedCategory)
    {
        // Act
        var result = ORCategoryHelper.FromString(input);

        // Assert
        result.Should().Be(expectedCategory);
    }

    [Theory]
    [InlineData("")]
    [InlineData("invalid")]
    [InlineData("worker")]
    [InlineData("employee")]
    [InlineData("123")]
    [InlineData("arbeider")] // Note: singular form
    [InlineData("bediende")] // Note: singular form
    public void FromString_WithInvalidStrings_ShouldThrowArgumentException(string invalidInput)
    {
        // Act & Assert
        var action = () => ORCategoryHelper.FromString(invalidInput);
        action.Should().Throw<ArgumentException>()
            .WithParameterName("value")
            .WithMessage($"Invalid ORCategory value: {invalidInput} (Parameter 'value')");
    }

    [Fact]
    public void FromString_WithNull_ShouldThrowArgumentException()
    {
        // Act & Assert
        var action = () => ORCategoryHelper.FromString(null!);
        action.Should().Throw<ArgumentException>()
            .WithParameterName("value")
            .WithMessage("Invalid ORCategory value:  (Parameter 'value')");
    }

    [Fact]
    public void FromString_WithWhitespace_ShouldThrowArgumentException()
    {
        // Act & Assert
        var action = () => ORCategoryHelper.FromString("   ");
        action.Should().Throw<ArgumentException>()
            .WithParameterName("value");
    }

    [Fact]
    public void ORCategory_RoundTrip_ShouldMaintainValue()
    {
        // Arrange
        var categories = new[] { ORCategory.Arbeiders, ORCategory.Bedienden, ORCategory.Kaderleden, ORCategory.Jeugdige };

        foreach (var category in categories)
        {
            // Act
            var stringValue = category.ToStringValue();
            var roundTripCategory = ORCategoryHelper.FromString(stringValue);

            // Assert
            roundTripCategory.Should().Be(category);
        }
    }

    [Fact]
    public void ORCategory_AllEnumValues_ShouldHaveStringRepresentation()
    {
        // Arrange
        var allCategories = Enum.GetValues<ORCategory>();

        foreach (var category in allCategories)
        {
            // Act & Assert
            var action = () => category.ToStringValue();
            action.Should().NotThrow();

            var stringValue = category.ToStringValue();
            stringValue.Should().NotBeNullOrWhiteSpace();
        }
    }

    [Fact]
    public void ORCategory_AllStringValues_ShouldHaveEnumRepresentation()
    {
        // Arrange
        var stringValues = new[] { "arbeiders", "bedienden", "kaderleden", "jeugdige" };

        foreach (var stringValue in stringValues)
        {
            // Act & Assert
            var action = () => ORCategoryHelper.FromString(stringValue);
            action.Should().NotThrow();

            var category = ORCategoryHelper.FromString(stringValue);
            Enum.IsDefined(typeof(ORCategory), category).Should().BeTrue();
        }
    }

    [Fact]
    public void ORCategory_EnumToString_ShouldUseLowercase()
    {
        // Arrange
        var categories = Enum.GetValues<ORCategory>();

        foreach (var category in categories)
        {
            // Act
            var stringValue = category.ToStringValue();

            // Assert
            stringValue.Should().Be(stringValue.ToLowerInvariant(), 
                $"String representation of {category} should be lowercase");
        }
    }

    [Fact]
    public void ORCategory_ShouldHaveExactlyFourValues()
    {
        // Act
        var values = Enum.GetValues<ORCategory>();

        // Assert
        values.Should().HaveCount(4, "ORCategory should have exactly 4 values");
        values.Should().Contain(ORCategory.Arbeiders);
        values.Should().Contain(ORCategory.Bedienden);
        values.Should().Contain(ORCategory.Kaderleden);
        values.Should().Contain(ORCategory.Jeugdige);
    }
}