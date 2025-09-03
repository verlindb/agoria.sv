using Xunit;
using Agoria.SV.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Agoria.SV.API.Tests.Unit.Domain.ValueObjects;

public class ElectionBodiesTests
{
    [Fact]
    public void ElectionBodies_WithAllParameters_ShouldCreateSuccessfully()
    {
        // Arrange
        var cpbw = true;
        var or = false;
        var sdWorkers = true;
        var sdClerks = false;

        // Act
        var electionBodies = new ElectionBodies(cpbw, or, sdWorkers, sdClerks);

        // Assert
        electionBodies.Cpbw.Should().Be(cpbw);
        electionBodies.Or.Should().Be(or);
        electionBodies.SdWorkers.Should().Be(sdWorkers);
        electionBodies.SdClerks.Should().Be(sdClerks);
    }

    [Theory]
    [InlineData(true, true, true, true)]
    [InlineData(false, false, false, false)]
    [InlineData(true, false, true, false)]
    [InlineData(false, true, false, true)]
    public void ElectionBodies_WithDifferentCombinations_ShouldCreateSuccessfully(bool cpbw, bool or, bool sdWorkers, bool sdClerks)
    {
        // Act
        var electionBodies = new ElectionBodies(cpbw, or, sdWorkers, sdClerks);

        // Assert
        electionBodies.Cpbw.Should().Be(cpbw);
        electionBodies.Or.Should().Be(or);
        electionBodies.SdWorkers.Should().Be(sdWorkers);
        electionBodies.SdClerks.Should().Be(sdClerks);
    }

    [Fact]
    public void ElectionBodies_PropertiesShouldBeReadonly()
    {
        // Assert
        typeof(ElectionBodies).GetProperty("Cpbw")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(ElectionBodies).GetProperty("Or")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(ElectionBodies).GetProperty("SdWorkers")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(ElectionBodies).GetProperty("SdClerks")?.SetMethod?.IsPublic.Should().BeFalse();
    }

    [Fact]
    public void ElectionBodies_WithAllTrue_ShouldCreateSuccessfully()
    {
        // Act
        var electionBodies = new ElectionBodies(true, true, true, true);

        // Assert
        electionBodies.Cpbw.Should().BeTrue();
        electionBodies.Or.Should().BeTrue();
        electionBodies.SdWorkers.Should().BeTrue();
        electionBodies.SdClerks.Should().BeTrue();
    }

    [Fact]
    public void ElectionBodies_WithAllFalse_ShouldCreateSuccessfully()
    {
        // Act
        var electionBodies = new ElectionBodies(false, false, false, false);

        // Assert
        electionBodies.Cpbw.Should().BeFalse();
        electionBodies.Or.Should().BeFalse();
        electionBodies.SdWorkers.Should().BeFalse();
        electionBodies.SdClerks.Should().BeFalse();
    }

    [Fact]
    public void ElectionBodies_WithOnlyCpbw_ShouldCreateSuccessfully()
    {
        // Act
        var electionBodies = new ElectionBodies(true, false, false, false);

        // Assert
        electionBodies.Cpbw.Should().BeTrue();
        electionBodies.Or.Should().BeFalse();
        electionBodies.SdWorkers.Should().BeFalse();
        electionBodies.SdClerks.Should().BeFalse();
    }

    [Fact]
    public void ElectionBodies_WithOnlyOr_ShouldCreateSuccessfully()
    {
        // Act
        var electionBodies = new ElectionBodies(false, true, false, false);

        // Assert
        electionBodies.Cpbw.Should().BeFalse();
        electionBodies.Or.Should().BeTrue();
        electionBodies.SdWorkers.Should().BeFalse();
        electionBodies.SdClerks.Should().BeFalse();
    }

    [Fact]
    public void ElectionBodies_WithOnlySdWorkers_ShouldCreateSuccessfully()
    {
        // Act
        var electionBodies = new ElectionBodies(false, false, true, false);

        // Assert
        electionBodies.Cpbw.Should().BeFalse();
        electionBodies.Or.Should().BeFalse();
        electionBodies.SdWorkers.Should().BeTrue();
        electionBodies.SdClerks.Should().BeFalse();
    }

    [Fact]
    public void ElectionBodies_WithOnlySdClerks_ShouldCreateSuccessfully()
    {
        // Act
        var electionBodies = new ElectionBodies(false, false, false, true);

        // Assert
        electionBodies.Cpbw.Should().BeFalse();
        electionBodies.Or.Should().BeFalse();
        electionBodies.SdWorkers.Should().BeFalse();
        electionBodies.SdClerks.Should().BeTrue();
    }

    [Fact]
    public void ElectionBodies_WithWorkersAndClerks_ShouldCreateSuccessfully()
    {
        // Act
        var electionBodies = new ElectionBodies(false, false, true, true);

        // Assert
        electionBodies.Cpbw.Should().BeFalse();
        electionBodies.Or.Should().BeFalse();
        electionBodies.SdWorkers.Should().BeTrue();
        electionBodies.SdClerks.Should().BeTrue();
    }

    [Fact]
    public void ElectionBodies_WithCpbwAndOr_ShouldCreateSuccessfully()
    {
        // Act
        var electionBodies = new ElectionBodies(true, true, false, false);

        // Assert
        electionBodies.Cpbw.Should().BeTrue();
        electionBodies.Or.Should().BeTrue();
        electionBodies.SdWorkers.Should().BeFalse();
        electionBodies.SdClerks.Should().BeFalse();
    }

    [Fact]
    public void ElectionBodies_ShouldHaveProtectedParameterlessConstructor()
    {
        // This test ensures the parameterless constructor exists for EF Core
        // We can't call it directly as it's protected, but we can check it exists

        // Assert
        var parameterlessConstructor = typeof(ElectionBodies)
            .GetConstructors(System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
            .FirstOrDefault(c => c.GetParameters().Length == 0);

        parameterlessConstructor.Should().NotBeNull("ElectionBodies should have a parameterless constructor for EF Core");
        parameterlessConstructor!.IsFamily.Should().BeTrue("Parameterless constructor should be protected");
    }

    [Fact]
    public void ElectionBodies_PropertyNames_ShouldMatchExpectedBelgianTerminology()
    {
        // This test documents the expected Belgian labor law terminology

        // Assert
        typeof(ElectionBodies).GetProperty("Cpbw").Should().NotBeNull("Should have Cpbw property for Comité voor Preventie en Bescherming op het Werk");
        typeof(ElectionBodies).GetProperty("Or").Should().NotBeNull("Should have Or property for Ondernemingsraad");
        typeof(ElectionBodies).GetProperty("SdWorkers").Should().NotBeNull("Should have SdWorkers property for Syndicale delegatie arbeiders");
        typeof(ElectionBodies).GetProperty("SdClerks").Should().NotBeNull("Should have SdClerks property for Syndicale delegatie bedienden");
    }
}