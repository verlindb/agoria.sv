using System;
using Agoria.SV.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace Agoria.SV.Domain.Tests;

public class TechnicalBusinessUnitTests
{
    [Theory]
    [InlineData("active")]
    [InlineData("inactive")]
    public void SettingAllowedStatus_ShouldAssign(string status)
    {
        var tbu = new TechnicalBusinessUnit { Status = status };

        tbu.Status.Should().Be(status);
    }

    [Fact]
    public void SettingInvalidStatus_ShouldThrow()
    {
        var tbu = new TechnicalBusinessUnit();

        Action act = () => tbu.Status = "paused";

        act.Should().Throw<ArgumentException>().WithMessage("Status must be 'active' or 'inactive'.");
    }

    [Theory]
    [InlineData("N")] [InlineData("F")] [InlineData("N+F")] [InlineData("D")]
    public void SettingAllowedLanguage_ShouldAssign(string lang)
    {
        var tbu = new TechnicalBusinessUnit { Language = lang };

        tbu.Language.Should().Be(lang);
    }

    [Fact]
    public void SettingInvalidLanguage_ShouldThrow()
    {
        var tbu = new TechnicalBusinessUnit();

        Action act = () => tbu.Language = "X";

        act.Should().Throw<ArgumentException>().WithMessage("Language must be 'N', 'F', 'N+F', or 'D'.");
    }

    [Fact]
    public void SettingInvalidFodDossierSuffix_ShouldThrow()
    {
        var tbu = new TechnicalBusinessUnit();

        Action act = () => tbu.FodDossierSuffix = "3";

        act.Should().Throw<ArgumentException>().WithMessage("FOD dossier suffix must be '1' or '2'.");
    }
}
