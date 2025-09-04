using Agoria.SV.Domain.ValueObjects;
using FluentAssertions;

namespace Agoria.SV.Domain.Tests;

public class ORCategoryTests
{
    [Theory]
    [InlineData(ORCategory.Arbeiders, "arbeiders")]
    [InlineData(ORCategory.Bedienden, "bedienden")]
    [InlineData(ORCategory.Kaderleden, "kaderleden")]
    [InlineData(ORCategory.Jeugdige, "jeugdige")]
    public void ORCategoryExtensions_ToStringValue_ShouldReturnCorrectString(ORCategory category, string expectedString)
    {
        // Act
        var result = category.ToStringValue();

        // Assert
        result.Should().Be(expectedString);
    }

    [Fact]
    public void ORCategoryExtensions_ToStringValue_ShouldThrowArgumentOutOfRangeException_WhenInvalidCategory()
    {
        // Arrange
        var invalidCategory = (ORCategory)999;

        // Act & Assert
        Action act = () => invalidCategory.ToStringValue();
        act.Should().Throw<ArgumentOutOfRangeException>()
           .WithParameterName("category");
    }

    [Theory]
    [InlineData("arbeiders", ORCategory.Arbeiders)]
    [InlineData("bedienden", ORCategory.Bedienden)]
    [InlineData("kaderleden", ORCategory.Kaderleden)]
    [InlineData("jeugdige", ORCategory.Jeugdige)]
    [InlineData("ARBEIDERS", ORCategory.Arbeiders)]
    [InlineData("BEDIENDEN", ORCategory.Bedienden)]
    [InlineData("Arbeiders", ORCategory.Arbeiders)]
    [InlineData("Bedienden", ORCategory.Bedienden)]
    public void ORCategoryHelper_FromString_ShouldReturnCorrectCategory(string value, ORCategory expectedCategory)
    {
        // Act
        var result = ORCategoryHelper.FromString(value);

        // Assert
        result.Should().Be(expectedCategory);
    }

    [Theory]
    [InlineData("invalid")]
    [InlineData("")]
    [InlineData("worker")]
    [InlineData("employee")]
    [InlineData(null)]
    public void ORCategoryHelper_FromString_ShouldThrowArgumentException_WhenInvalidValue(string? invalidValue)
    {
        // Act & Assert
        Action act = () => ORCategoryHelper.FromString(invalidValue!);
        act.Should().Throw<ArgumentException>()
           .WithMessage($"Invalid ORCategory value: {invalidValue}*")
           .WithParameterName("value");
    }

    [Fact]
    public void ORCategoryHelper_FromString_ShouldBeCaseInsensitive()
    {
        // Arrange
        var testCases = new[]
        {
            ("arbeiders", ORCategory.Arbeiders),
            ("ARBEIDERS", ORCategory.Arbeiders),
            ("Arbeiders", ORCategory.Arbeiders),
            ("ArBeIdErS", ORCategory.Arbeiders),
            ("bedienden", ORCategory.Bedienden),
            ("BEDIENDEN", ORCategory.Bedienden),
            ("Bedienden", ORCategory.Bedienden),
            ("BeDiEnDeN", ORCategory.Bedienden)
        };

        foreach (var (input, expected) in testCases)
        {
            // Act
            var result = ORCategoryHelper.FromString(input);

            // Assert
            result.Should().Be(expected);
        }
    }

    [Fact]
    public void ORCategory_ShouldHaveCorrectEnumValues()
    {
        // Assert
        Enum.GetValues<ORCategory>().Should().HaveCount(4);
        Enum.GetValues<ORCategory>().Should().Contain(new[]
        {
            ORCategory.Arbeiders,
            ORCategory.Bedienden,
            ORCategory.Kaderleden,
            ORCategory.Jeugdige
        });
    }

    [Fact]
    public void ORCategory_RoundTrip_ShouldWorkCorrectly()
    {
        // Test that ToStringValue and FromString work together
        var allCategories = Enum.GetValues<ORCategory>();

        foreach (var category in allCategories)
        {
            // Act
            var stringValue = category.ToStringValue();
            var roundTripCategory = ORCategoryHelper.FromString(stringValue);

            // Assert
            roundTripCategory.Should().Be(category);
        }
    }
}