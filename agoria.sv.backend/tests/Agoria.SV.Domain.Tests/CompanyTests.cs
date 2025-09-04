using System;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Agoria.SV.Domain.Tests;

public class CompanyTests
{
    [Fact]
    public void SettingValidOndernemingsnummer_ShouldAssignValue()
    {
        var company = new Company();
        var value = "BE0123456789";

        company.Ondernemingsnummer = value;

        company.Ondernemingsnummer.Should().Be(value);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("123")]
    [InlineData("BE123")]
    public void SettingInvalidOndernemingsnummer_ShouldThrow(string? value)
    {
        var company = new Company();

        Action act = () => company.Ondernemingsnummer = value!;

        act.Should().Throw<ArgumentException>().WithMessage("Ondernemingsnummer moet het formaat BE0123456789 hebben.");
    }

    [Theory]
    [InlineData("active")]
    [InlineData("inactive")]
    [InlineData("pending")]
    public void SettingAllowedStatus_ShouldAssign(string status)
    {
        var company = new Company { Status = status };

        company.Status.Should().Be(status);
    }

    [Fact]
    public void SettingInvalidStatus_ShouldThrow()
    {
        var company = new Company();

        Action act = () => company.Status = "deleted";

        act.Should().Throw<ArgumentException>().WithMessage("Status must be 'active', 'inactive', or 'pending'.");
    }
}
