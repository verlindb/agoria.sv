using Agoria.SV.Domain.Entities;
using FluentAssertions;

namespace Agoria.SV.Domain.Tests;

public class EmployeeTests
{
    [Fact]
    public void Employee_ShouldCreateValidEmployee_WhenValidParametersProvided()
    {
        // Arrange
        var technicalBusinessUnitId = Guid.NewGuid();
        var firstName = "John";
        var lastName = "Doe";
        var email = "john.doe@example.com";
        var phone = "+32123456789";
        var role = "Developer";
        var startDate = DateTime.Today;

        // Act
        var employee = new Employee(technicalBusinessUnitId, firstName, lastName, email, phone, role, startDate);

        // Assert
        employee.TechnicalBusinessUnitId.Should().Be(technicalBusinessUnitId);
        employee.FirstName.Should().Be(firstName);
        employee.LastName.Should().Be(lastName);
        employee.Email.Should().Be(email);
        employee.Phone.Should().Be(phone);
        employee.Role.Should().Be(role);
        employee.StartDate.Should().Be(startDate);
        employee.Status.Should().Be("active");
    }

    [Theory]
    [InlineData(null)]
    public void Employee_ShouldThrowArgumentNullException_WhenFirstNameIsNull(string? firstName)
    {
        // Arrange
        var technicalBusinessUnitId = Guid.NewGuid();
        var lastName = "Doe";
        var email = "john.doe@example.com";
        var phone = "+32123456789";
        var role = "Developer";
        var startDate = DateTime.Today;

        // Act & Assert
        Action act = () => new Employee(technicalBusinessUnitId, firstName!, lastName, email, phone, role, startDate);
        act.Should().Throw<ArgumentNullException>().WithParameterName(nameof(firstName));
    }

    [Theory]
    [InlineData(null)]
    public void Employee_ShouldThrowArgumentNullException_WhenLastNameIsNull(string? lastName)
    {
        // Arrange
        var technicalBusinessUnitId = Guid.NewGuid();
        var firstName = "John";
        var email = "john.doe@example.com";
        var phone = "+32123456789";
        var role = "Developer";
        var startDate = DateTime.Today;

        // Act & Assert
        Action act = () => new Employee(technicalBusinessUnitId, firstName, lastName!, email, phone, role, startDate);
        act.Should().Throw<ArgumentNullException>().WithParameterName(nameof(lastName));
    }

    [Theory]
    [InlineData(null)]
    public void Employee_ShouldThrowArgumentNullException_WhenEmailIsNull(string? email)
    {
        // Arrange
        var technicalBusinessUnitId = Guid.NewGuid();
        var firstName = "John";
        var lastName = "Doe";
        var phone = "+32123456789";
        var role = "Developer";
        var startDate = DateTime.Today;

        // Act & Assert
        Action act = () => new Employee(technicalBusinessUnitId, firstName, lastName, email!, phone, role, startDate);
        act.Should().Throw<ArgumentNullException>().WithParameterName(nameof(email));
    }

    [Fact]
    public void Employee_UpdateDetails_ShouldUpdatePropertiesAndTimestamp()
    {
        // Arrange
        var employee = CreateValidEmployee();
        var newFirstName = "Jane";
        var newLastName = "Smith";
        var newEmail = "jane.smith@example.com";
        var newPhone = "+32987654321";
        var newRole = "Manager";
        var newStartDate = DateTime.Today.AddDays(1);
        var originalUpdatedAt = employee.UpdatedAt;

        // Wait a small amount to ensure UpdatedAt changes
        Thread.Sleep(10);

        // Act
        employee.UpdateDetails(newFirstName, newLastName, newEmail, newPhone, newRole, newStartDate);

        // Assert
        employee.FirstName.Should().Be(newFirstName);
        employee.LastName.Should().Be(newLastName);
        employee.Email.Should().Be(newEmail);
        employee.Phone.Should().Be(newPhone);
        employee.Role.Should().Be(newRole);
        employee.StartDate.Should().Be(newStartDate);
        employee.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    [Theory]
    [InlineData("active")]
    [InlineData("inactive")]
    public void Employee_UpdateStatus_ShouldUpdateStatusAndTimestamp(string newStatus)
    {
        // Arrange
        var employee = CreateValidEmployee();
        var originalUpdatedAt = employee.UpdatedAt;

        // Wait a small amount to ensure UpdatedAt changes
        Thread.Sleep(10);

        // Act
        employee.UpdateStatus(newStatus);

        // Assert
        employee.Status.Should().Be(newStatus);
        employee.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    [Theory]
    [InlineData("invalid")]
    [InlineData("pending")]
    [InlineData("")]
    public void Employee_UpdateStatus_ShouldThrowArgumentException_WhenInvalidStatus(string invalidStatus)
    {
        // Arrange
        var employee = CreateValidEmployee();

        // Act & Assert
        Action act = () => employee.UpdateStatus(invalidStatus);
        act.Should().Throw<ArgumentException>()
           .WithMessage("Status must be 'active' or 'inactive'*")
           .And.ParamName.Should().Be("status");
    }

    [Fact]
    public void Employee_UpdateTechnicalBusinessUnit_ShouldUpdateTbuIdAndTimestamp()
    {
        // Arrange
        var employee = CreateValidEmployee();
        var newTbuId = Guid.NewGuid();
        var originalUpdatedAt = employee.UpdatedAt;

        // Wait a small amount to ensure UpdatedAt changes
        Thread.Sleep(10);

        // Act
        employee.UpdateTechnicalBusinessUnit(newTbuId);

        // Assert
        employee.TechnicalBusinessUnitId.Should().Be(newTbuId);
        employee.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    [Fact]
    public void Employee_UpdateAll_ShouldUpdateAllPropertiesAndTimestamp()
    {
        // Arrange
        var employee = CreateValidEmployee();
        var newTbuId = Guid.NewGuid();
        var newFirstName = "Jane";
        var newLastName = "Smith";
        var newPhone = "+32987654321";
        var newRole = "Manager";
        var newStartDate = DateTime.Today.AddDays(1);
        var originalUpdatedAt = employee.UpdatedAt;

        // Wait a small amount to ensure UpdatedAt changes
        Thread.Sleep(10);

        // Act
        employee.UpdateAll(newTbuId, newFirstName, newLastName, newPhone, newRole, newStartDate);

        // Assert
        employee.TechnicalBusinessUnitId.Should().Be(newTbuId);
        employee.FirstName.Should().Be(newFirstName);
        employee.LastName.Should().Be(newLastName);
        employee.Phone.Should().Be(newPhone);
        employee.Role.Should().Be(newRole);
        employee.StartDate.Should().Be(newStartDate);
        employee.UpdatedAt.Should().BeAfter(originalUpdatedAt);
    }

    private static Employee CreateValidEmployee()
    {
        return new Employee(
            Guid.NewGuid(),
            "John",
            "Doe",
            "john.doe@example.com",
            "+32123456789",
            "Developer",
            DateTime.Today);
    }

    [Fact]
    public void Employee_ShouldAcceptEmptyStrings()
    {
        // Arrange
        var technicalBusinessUnitId = Guid.NewGuid();
        var startDate = DateTime.Today;

        // Act
        var employee = new Employee(technicalBusinessUnitId, "", "", "", "", "", startDate);

        // Assert
        employee.TechnicalBusinessUnitId.Should().Be(technicalBusinessUnitId);
        employee.FirstName.Should().Be("");
        employee.LastName.Should().Be("");
        employee.Email.Should().Be("");
        employee.Phone.Should().Be("");
        employee.Role.Should().Be("");
        employee.StartDate.Should().Be(startDate);
        employee.Status.Should().Be("active");
    }
}