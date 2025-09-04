using Agoria.SV.Domain.ValueObjects;
using FluentAssertions;

namespace Agoria.SV.Domain.Tests;

public class ElectionBodiesTests
{
    [Theory]
    [InlineData(true, true, true, true)]
    [InlineData(false, false, false, false)]
    [InlineData(true, false, true, false)]
    [InlineData(false, true, false, true)]
    public void ElectionBodies_ShouldCreateValidElectionBodies_WhenParametersProvided(
        bool cpbw, bool or, bool sdWorkers, bool sdClerks)
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
    public void ElectionBodies_ShouldBeImmutable_AfterCreation()
    {
        // Arrange & Act
        var electionBodies = new ElectionBodies(true, false, true, false);

        // Assert - Properties should have private setters (immutable)
        typeof(ElectionBodies).GetProperty(nameof(ElectionBodies.Cpbw))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
        typeof(ElectionBodies).GetProperty(nameof(ElectionBodies.Or))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
        typeof(ElectionBodies).GetProperty(nameof(ElectionBodies.SdWorkers))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
        typeof(ElectionBodies).GetProperty(nameof(ElectionBodies.SdClerks))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
    }

    [Fact]
    public void ElectionBodies_ShouldHandleAllCombinations()
    {
        // Test all possible boolean combinations
        var combinations = new[]
        {
            (false, false, false, false),
            (true, false, false, false),
            (false, true, false, false),
            (false, false, true, false),
            (false, false, false, true),
            (true, true, false, false),
            (true, false, true, false),
            (true, false, false, true),
            (false, true, true, false),
            (false, true, false, true),
            (false, false, true, true),
            (true, true, true, false),
            (true, true, false, true),
            (true, false, true, true),
            (false, true, true, true),
            (true, true, true, true)
        };

        foreach (var (cpbw, or, sdWorkers, sdClerks) in combinations)
        {
            // Act
            var electionBodies = new ElectionBodies(cpbw, or, sdWorkers, sdClerks);

            // Assert
            electionBodies.Cpbw.Should().Be(cpbw);
            electionBodies.Or.Should().Be(or);
            electionBodies.SdWorkers.Should().Be(sdWorkers);
            electionBodies.SdClerks.Should().Be(sdClerks);
        }
    }
}