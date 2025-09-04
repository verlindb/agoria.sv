using System;
using Agoria.SV.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace Agoria.SV.Domain.Tests;

public class WorksCouncilTests
{
    [Fact]
    public void Constructor_ShouldInitializeIdsAndTimestamps()
    {
        var tbuId = Guid.NewGuid();

        var wc = new WorksCouncil(tbuId);

        wc.TechnicalBusinessUnitId.Should().Be(tbuId);
        wc.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        wc.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void UpdateTechnicalBusinessUnit_ShouldChangeIdAndUpdateTimestamp()
    {
        var wc = new WorksCouncil(Guid.NewGuid());
        var before = wc.UpdatedAt;
        var newId = Guid.NewGuid();

        wc.UpdateTechnicalBusinessUnit(newId);

        wc.TechnicalBusinessUnitId.Should().Be(newId);
        wc.UpdatedAt.Should().BeAfter(before);
    }
}
