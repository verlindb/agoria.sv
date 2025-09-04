using System;
using Agoria.SV.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Agoria.SV.Domain.Tests;

public class ORCategoryTests
{
    [Theory]
    [InlineData(ORCategory.Arbeiders, "arbeiders")]
    [InlineData(ORCategory.Bedienden, "bedienden")]
    [InlineData(ORCategory.Kaderleden, "kaderleden")]
    [InlineData(ORCategory.Jeugdige, "jeugdige")]
    public void ToStringValue_ShouldReturnExpected(ORCategory category, string expected)
    {
        category.ToStringValue().Should().Be(expected);
    }

    [Theory]
    [InlineData("arbeiders", ORCategory.Arbeiders)]
    [InlineData("bedienden", ORCategory.Bedienden)]
    [InlineData("kaderleden", ORCategory.Kaderleden)]
    [InlineData("jeugdige", ORCategory.Jeugdige)]
    public void FromString_ShouldReturnExpected(string value, ORCategory expected)
    {
        ORCategoryHelper.FromString(value).Should().Be(expected);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("invalid")]
    public void FromString_Invalid_ShouldThrow(string? value)
    {
        Action act = () => ORCategoryHelper.FromString(value!);

        act.Should().Throw<ArgumentException>().WithMessage("Invalid ORCategory value:*");
    }
}
