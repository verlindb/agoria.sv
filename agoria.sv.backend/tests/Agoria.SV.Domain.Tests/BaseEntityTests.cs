using Agoria.SV.Domain.Common;
using FluentAssertions;

namespace Agoria.SV.Domain.Tests;

// Test concrete implementation of BaseEntity for testing purposes
public class TestEntity : BaseEntity
{
    public string Name { get; set; } = string.Empty;
}

public class BaseEntityTests
{
    [Fact]
    public void BaseEntity_ShouldHaveGuidId()
    {
        // Arrange & Act
        var entity = new TestEntity();

        // Assert
        Assert.IsType<Guid>(entity.Id);
        entity.Id.Should().Be(Guid.Empty); // Default value
    }

    [Fact]
    public void BaseEntity_ShouldHaveCreatedAtProperty()
    {
        // Arrange & Act
        var entity = new TestEntity();

        // Assert
        Assert.IsType<DateTime>(entity.CreatedAt);
        entity.CreatedAt.Should().Be(default(DateTime)); // Default value
    }

    [Fact]
    public void BaseEntity_ShouldHaveUpdatedAtProperty()
    {
        // Arrange & Act
        var entity = new TestEntity();

        // Assert
        Assert.IsType<DateTime>(entity.UpdatedAt);
        entity.UpdatedAt.Should().Be(default(DateTime)); // Default value
    }

    [Fact]
    public void BaseEntity_ShouldAllowSettingId()
    {
        // Arrange
        var entity = new TestEntity();
        var newId = Guid.NewGuid();

        // Act
        entity.Id = newId;

        // Assert
        entity.Id.Should().Be(newId);
    }

    [Fact]
    public void BaseEntity_ShouldAllowSettingCreatedAt()
    {
        // Arrange
        var entity = new TestEntity();
        var createdAt = DateTime.UtcNow;

        // Act
        entity.CreatedAt = createdAt;

        // Assert
        entity.CreatedAt.Should().Be(createdAt);
    }

    [Fact]
    public void BaseEntity_ShouldAllowSettingUpdatedAt()
    {
        // Arrange
        var entity = new TestEntity();
        var updatedAt = DateTime.UtcNow;

        // Act
        entity.UpdatedAt = updatedAt;

        // Assert
        entity.UpdatedAt.Should().Be(updatedAt);
    }

    [Fact]
    public void BaseEntity_Properties_ShouldHavePublicSetters()
    {
        // Assert - Properties should have public setters for ORM usage
        typeof(BaseEntity).GetProperty(nameof(BaseEntity.Id))!.SetMethod.Should().NotBeNull().And.Subject!.IsPublic.Should().BeTrue();
        typeof(BaseEntity).GetProperty(nameof(BaseEntity.CreatedAt))!.SetMethod.Should().NotBeNull().And.Subject!.IsPublic.Should().BeTrue();
        typeof(BaseEntity).GetProperty(nameof(BaseEntity.UpdatedAt))!.SetMethod.Should().NotBeNull().And.Subject!.IsPublic.Should().BeTrue();
    }

    [Fact]
    public void BaseEntity_ShouldBeAbstractClass()
    {
        // Assert
        typeof(BaseEntity).IsAbstract.Should().BeTrue();
    }

    [Fact]
    public void BaseEntity_DerivedClass_ShouldInheritAllProperties()
    {
        // Arrange & Act
        var entity = new TestEntity();

        // Assert
        entity.Should().BeAssignableTo<BaseEntity>();
        typeof(TestEntity).GetProperty("Id").Should().NotBeNull();
        typeof(TestEntity).GetProperty("CreatedAt").Should().NotBeNull();
        typeof(TestEntity).GetProperty("UpdatedAt").Should().NotBeNull();
        typeof(TestEntity).GetProperty("Name").Should().NotBeNull();
    }
}