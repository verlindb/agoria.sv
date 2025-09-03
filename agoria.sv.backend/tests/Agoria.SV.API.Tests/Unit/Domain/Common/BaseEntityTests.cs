using Agoria.SV.Domain.Common;
using FluentAssertions;
using Xunit;

namespace Agoria.SV.API.Tests.Unit.Domain.Common;

public class BaseEntityTests
{
    [Fact]
    public void BaseEntity_ShouldHaveCorrectProperties()
    {
        // Arrange & Act
        var entity = new TestEntity();

        // Assert
        entity.Id.Should().BeEmpty();
        entity.CreatedAt.Should().Be(default);
        entity.UpdatedAt.Should().Be(default);
    }

    [Fact]
    public void BaseEntity_ShouldAllowSettingProperties()
    {
        // Arrange
        var entity = new TestEntity();
        var id = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;
        var updatedAt = DateTime.UtcNow.AddMinutes(5);

        // Act
        entity.Id = id;
        entity.CreatedAt = createdAt;
        entity.UpdatedAt = updatedAt;

        // Assert
        entity.Id.Should().Be(id);
        entity.CreatedAt.Should().Be(createdAt);
        entity.UpdatedAt.Should().Be(updatedAt);
    }

    [Fact]
    public void BaseEntity_ShouldBeAbstract()
    {
        // Assert
        typeof(BaseEntity).IsAbstract.Should().BeTrue();
    }

    private class TestEntity : BaseEntity
    {
    }
}