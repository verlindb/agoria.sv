using System;
using Agoria.SV.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace Agoria.SV.Domain.Tests;

public class EmployeeTests
{
    [Fact]
    public void Constructor_WithValidArguments_ShouldCreateEmployee()
    {
        var tbuId = Guid.NewGuid();
        var start = new DateTime(2020,1,1);

        var emp = new Employee(tbuId, "John", "Doe", "john@example.com", "012345", "Engineer", start);

        emp.TechnicalBusinessUnitId.Should().Be(tbuId);
        emp.FirstName.Should().Be("John");
        emp.LastName.Should().Be("Doe");
        emp.Email.Should().Be("john@example.com");
        emp.Phone.Should().Be("012345");
        emp.Role.Should().Be("Engineer");
        emp.StartDate.Should().Be(start);
        emp.Status.Should().Be("active");
    }

    [Theory]
    [InlineData(null, "Doe")]
    [InlineData("John", null)]
    [InlineData("John", "Doe")]
    public void Constructor_WithNullArguments_ShouldThrow(string? first, string? last)
    {
        var tbuId = Guid.NewGuid();
        var start = DateTime.UtcNow;

        Action act = () => new Employee(tbuId, first!, last!, "a@b.com", "1", "r", start);

        if (first is null || last is null)
            act.Should().Throw<ArgumentNullException>();
    }

    [Fact]
    public void UpdateStatus_ToInvalid_ShouldThrow()
    {
        var emp = new Employee(Guid.NewGuid(), "A", "B", "a@b.com", "1", "r", DateTime.UtcNow);

        Action act = () => emp.UpdateStatus("paused");

        act.Should().Throw<ArgumentException>().WithMessage("Status must be 'active' or 'inactive'*");
    }

    [Fact]
    public void UpdateDetails_ShouldUpdatePropertiesAndUpdatedAt()
    {
        var emp = new Employee(Guid.NewGuid(), "A", "B", "a@b.com", "1", "r", DateTime.UtcNow);
        var before = emp.UpdatedAt;
        var newStart = new DateTime(2021,1,1);

        emp.UpdateDetails("X","Y","x@y.com","9","Manager", newStart);

        emp.FirstName.Should().Be("X");
        emp.LastName.Should().Be("Y");
        emp.Email.Should().Be("x@y.com");
        emp.Phone.Should().Be("9");
        emp.Role.Should().Be("Manager");
        emp.StartDate.Should().Be(newStart);
        emp.UpdatedAt.Should().BeAfter(before);
    }
}
