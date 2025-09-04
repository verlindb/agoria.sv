using Agoria.SV.Domain.Common;
using Agoria.SV.Domain.Entities;
using FluentAssertions;

namespace Agoria.SV.Domain.Tests;

public class WorksCouncilTests
{
    [Fact]
    public void WorksCouncil_ShouldCreateValidWorksCouncil_WhenValidTechnicalBusinessUnitIdProvided()
    {
        // Arrange
        var technicalBusinessUnitId = Guid.NewGuid();

        // Act
        var worksCouncil = new WorksCouncil(technicalBusinessUnitId);

        // Assert
        worksCouncil.TechnicalBusinessUnitId.Should().Be(technicalBusinessUnitId);
        worksCouncil.Id.Should().Be(Guid.Empty); // Not auto-generated
        worksCouncil.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        worksCouncil.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        worksCouncil.Memberships.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void WorksCouncil_UpdateTechnicalBusinessUnit_ShouldUpdateTbuIdAndTimestamp()
    {
        // Arrange
        var originalTbuId = Guid.NewGuid();
        var newTbuId = Guid.NewGuid();
        var worksCouncil = new WorksCouncil(originalTbuId);
        var originalUpdatedAt = worksCouncil.UpdatedAt;

        // Wait a small amount to ensure UpdatedAt changes
        Thread.Sleep(10);

        // Act
        worksCouncil.UpdateTechnicalBusinessUnit(newTbuId);

        // Assert
        worksCouncil.TechnicalBusinessUnitId.Should().Be(newTbuId);
        worksCouncil.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    [Fact]
    public void WorksCouncil_ShouldHaveInitializedMembershipsCollection()
    {
        // Arrange
        var technicalBusinessUnitId = Guid.NewGuid();

        // Act
        var worksCouncil = new WorksCouncil(technicalBusinessUnitId);

        // Assert
        worksCouncil.Memberships.Should().NotBeNull();
        worksCouncil.Memberships.Should().BeOfType<List<OrMembership>>();
        worksCouncil.Memberships.Should().BeEmpty();
    }

    [Fact]
    public void WorksCouncil_ShouldInheritFromBaseEntity()
    {
        // Arrange
        var technicalBusinessUnitId = Guid.NewGuid();

        // Act
        var worksCouncil = new WorksCouncil(technicalBusinessUnitId);

        // Assert
        worksCouncil.Should().BeAssignableTo<BaseEntity>();
        worksCouncil.Id.Should().Be(Guid.Empty); // Not auto-generated
    }

    [Fact]
    public void WorksCouncil_CreatedAtAndUpdatedAt_ShouldBeSetOnCreation()
    {
        // Arrange
        var beforeCreation = DateTime.UtcNow;
        var technicalBusinessUnitId = Guid.NewGuid();

        // Act
        var worksCouncil = new WorksCouncil(technicalBusinessUnitId);
        var afterCreation = DateTime.UtcNow;

        // Assert
        worksCouncil.CreatedAt.Should().BeOnOrAfter(beforeCreation).And.BeOnOrBefore(afterCreation);
        worksCouncil.UpdatedAt.Should().BeOnOrAfter(beforeCreation).And.BeOnOrBefore(afterCreation);
        worksCouncil.CreatedAt.Should().BeCloseTo(worksCouncil.UpdatedAt, TimeSpan.FromMilliseconds(100));
    }

    [Fact]
    public void WorksCouncil_TechnicalBusinessUnitId_ShouldBeReadOnly()
    {
        // Arrange
        var technicalBusinessUnitId = Guid.NewGuid();
        var worksCouncil = new WorksCouncil(technicalBusinessUnitId);

        // Assert - TechnicalBusinessUnitId property should have private setter
        typeof(WorksCouncil).GetProperty(nameof(WorksCouncil.TechnicalBusinessUnitId))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
    }

    [Fact]
    public void WorksCouncil_Memberships_ShouldBeReadOnly()
    {
        // Arrange
        var technicalBusinessUnitId = Guid.NewGuid();
        var worksCouncil = new WorksCouncil(technicalBusinessUnitId);

        // Assert - Memberships property should have private setter
        typeof(WorksCouncil).GetProperty(nameof(WorksCouncil.Memberships))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
    }
}