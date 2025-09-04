using Agoria.SV.Domain.Common;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.ValueObjects;
using FluentAssertions;

namespace Agoria.SV.Domain.Tests;

public class OrMembershipTests
{
    [Fact]
    public void OrMembership_ShouldCreateValidOrMembership_WhenValidParametersProvided()
    {
        // Arrange
        var worksCouncilId = Guid.NewGuid();
        var technicalBusinessUnitId = Guid.NewGuid();
        var employeeId = Guid.NewGuid();
        var category = ORCategory.Arbeiders;
        var order = 1;

        // Act
        var orMembership = new OrMembership(worksCouncilId, technicalBusinessUnitId, employeeId, category, order);

        // Assert
        orMembership.WorksCouncilId.Should().Be(worksCouncilId);
        orMembership.TechnicalBusinessUnitId.Should().Be(technicalBusinessUnitId);
        orMembership.EmployeeId.Should().Be(employeeId);
        orMembership.Category.Should().Be(category);
        orMembership.Order.Should().Be(order);
        orMembership.Id.Should().Be(Guid.Empty); // Not auto-generated
        orMembership.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        orMembership.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Theory]
    [InlineData(ORCategory.Arbeiders)]
    [InlineData(ORCategory.Bedienden)]
    [InlineData(ORCategory.Kaderleden)]
    [InlineData(ORCategory.Jeugdige)]
    public void OrMembership_ShouldAcceptAllValidORCategories(ORCategory category)
    {
        // Arrange
        var worksCouncilId = Guid.NewGuid();
        var technicalBusinessUnitId = Guid.NewGuid();
        var employeeId = Guid.NewGuid();
        var order = 1;

        // Act
        var orMembership = new OrMembership(worksCouncilId, technicalBusinessUnitId, employeeId, category, order);

        // Assert
        orMembership.Category.Should().Be(category);
    }

    [Fact]
    public void OrMembership_UpdateOrder_ShouldUpdateOrderAndTimestamp()
    {
        // Arrange
        var orMembership = CreateValidOrMembership();
        var newOrder = 5;
        var originalUpdatedAt = orMembership.UpdatedAt;

        // Wait a small amount to ensure UpdatedAt changes
        Thread.Sleep(10);

        // Act
        orMembership.UpdateOrder(newOrder);

        // Assert
        orMembership.Order.Should().Be(newOrder);
        orMembership.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    [Fact]
    public void OrMembership_UpdateCategory_ShouldUpdateCategoryAndTimestamp()
    {
        // Arrange
        var orMembership = CreateValidOrMembership();
        var newCategory = ORCategory.Bedienden;
        var originalUpdatedAt = orMembership.UpdatedAt;

        // Wait a small amount to ensure UpdatedAt changes
        Thread.Sleep(10);

        // Act
        orMembership.UpdateCategory(newCategory);

        // Assert
        orMembership.Category.Should().Be(newCategory);
        orMembership.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    [Fact]
    public void OrMembership_ShouldInheritFromBaseEntity()
    {
        // Arrange & Act
        var orMembership = CreateValidOrMembership();

        // Assert
        orMembership.Should().BeAssignableTo<BaseEntity>();
        orMembership.Id.Should().Be(Guid.Empty); // Not auto-generated
    }

    [Fact]
    public void OrMembership_AllProperties_ShouldBeReadOnly()
    {
        // Assert - All properties should have private setters except for navigation properties
        typeof(OrMembership).GetProperty(nameof(OrMembership.WorksCouncilId))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
        typeof(OrMembership).GetProperty(nameof(OrMembership.TechnicalBusinessUnitId))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
        typeof(OrMembership).GetProperty(nameof(OrMembership.EmployeeId))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
        typeof(OrMembership).GetProperty(nameof(OrMembership.Category))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
        typeof(OrMembership).GetProperty(nameof(OrMembership.Order))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
    }

    [Fact]
    public void OrMembership_CreatedAtAndUpdatedAt_ShouldBeSetOnCreation()
    {
        // Arrange
        var beforeCreation = DateTime.UtcNow;

        // Act
        var orMembership = CreateValidOrMembership();
        var afterCreation = DateTime.UtcNow;

        // Assert
        orMembership.CreatedAt.Should().BeOnOrAfter(beforeCreation).And.BeOnOrBefore(afterCreation);
        orMembership.UpdatedAt.Should().BeOnOrAfter(beforeCreation).And.BeOnOrBefore(afterCreation);
        orMembership.CreatedAt.Should().BeCloseTo(orMembership.UpdatedAt, TimeSpan.FromMilliseconds(100));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(10)]
    [InlineData(-1)]
    public void OrMembership_ShouldAcceptAnyOrderValue(int order)
    {
        // Arrange
        var worksCouncilId = Guid.NewGuid();
        var technicalBusinessUnitId = Guid.NewGuid();
        var employeeId = Guid.NewGuid();
        var category = ORCategory.Arbeiders;

        // Act
        var orMembership = new OrMembership(worksCouncilId, technicalBusinessUnitId, employeeId, category, order);

        // Assert
        orMembership.Order.Should().Be(order);
    }

    private static OrMembership CreateValidOrMembership()
    {
        return new OrMembership(
            Guid.NewGuid(),
            Guid.NewGuid(),
            Guid.NewGuid(),
            ORCategory.Arbeiders,
            1);
    }
}