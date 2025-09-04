using System;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Agoria.SV.Domain.Tests;

public class OrMembershipTests
{
    [Fact]
    public void Constructor_ShouldSetPropertiesAndTimestamps()
    {
        var wcId = Guid.NewGuid();
        var tbuId = Guid.NewGuid();
        var empId = Guid.NewGuid();

        var om = new OrMembership(wcId, tbuId, empId, ORCategory.Bedienden, 1);

        om.WorksCouncilId.Should().Be(wcId);
        om.TechnicalBusinessUnitId.Should().Be(tbuId);
        om.EmployeeId.Should().Be(empId);
        om.Category.Should().Be(ORCategory.Bedienden);
        om.Order.Should().Be(1);
        om.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void UpdateOrder_ShouldChangeOrderAndTimestamp()
    {
        var om = new OrMembership(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), ORCategory.Arbeiders, 1);
        var before = om.UpdatedAt;

        om.UpdateOrder(3);

        om.Order.Should().Be(3);
        om.UpdatedAt.Should().BeAfter(before);
    }

    [Fact]
    public void UpdateCategory_ShouldChangeCategoryAndTimestamp()
    {
        var om = new OrMembership(Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), ORCategory.Arbeiders, 1);
        var before = om.UpdatedAt;

        om.UpdateCategory(ORCategory.Kaderleden);

        om.Category.Should().Be(ORCategory.Kaderleden);
        om.UpdatedAt.Should().BeAfter(before);
    }
}
