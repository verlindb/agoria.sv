using Xunit;
using Agoria.SV.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace Agoria.SV.API.Tests.Unit.Domain.Entities;

public class EmployeeTests
{
    private readonly Guid _technicalBusinessUnitId = Guid.NewGuid();
    private const string FirstName = "John";
    private const string LastName = "Doe";
    private const string Email = "john.doe@company.com";
    private const string Phone = "+32 1 111 11 11";
    private const string Role = "Software Developer";
    private readonly DateTime _startDate = new DateTime(2023, 1, 15);

    [Fact]
    public void Employee_ShouldInheritFromBaseEntity()
    {
        // Assert
        typeof(Employee).BaseType?.Name.Should().Be("BaseEntity");
    }

    [Fact]
    public void Employee_WithValidParameters_ShouldCreateSuccessfully()
    {
        // Act
        var employee = new Employee(_technicalBusinessUnitId, FirstName, LastName, Email, Phone, Role, _startDate);

        // Assert
        employee.TechnicalBusinessUnitId.Should().Be(_technicalBusinessUnitId);
        employee.FirstName.Should().Be(FirstName);
        employee.LastName.Should().Be(LastName);
        employee.Email.Should().Be(Email);
        employee.Phone.Should().Be(Phone);
        employee.Role.Should().Be(Role);
        employee.StartDate.Should().Be(_startDate);
        employee.Status.Should().Be("active");
    }

    [Fact]
    public void Employee_WithNullFirstName_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var action = () => new Employee(_technicalBusinessUnitId, null!, LastName, Email, Phone, Role, _startDate);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("firstName");
    }

    [Fact]
    public void Employee_WithNullLastName_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var action = () => new Employee(_technicalBusinessUnitId, FirstName, null!, Email, Phone, Role, _startDate);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("lastName");
    }

    [Fact]
    public void Employee_WithNullEmail_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var action = () => new Employee(_technicalBusinessUnitId, FirstName, LastName, null!, Phone, Role, _startDate);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("email");
    }

    [Fact]
    public void Employee_WithNullPhone_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var action = () => new Employee(_technicalBusinessUnitId, FirstName, LastName, Email, null!, Role, _startDate);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("phone");
    }

    [Fact]
    public void Employee_WithNullRole_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var action = () => new Employee(_technicalBusinessUnitId, FirstName, LastName, Email, Phone, null!, _startDate);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("role");
    }

    [Fact]
    public void UpdateDetails_WithValidParameters_ShouldUpdateSuccessfully()
    {
        // Arrange
        var employee = new Employee(_technicalBusinessUnitId, FirstName, LastName, Email, Phone, Role, _startDate);
        var newFirstName = "Jane";
        var newLastName = "Smith";
        var newEmail = "jane.smith@company.com";
        var newPhone = "+32 2 222 22 22";
        var newRole = "Senior Developer";
        var newStartDate = new DateTime(2023, 6, 1);

        // Act
        employee.UpdateDetails(newFirstName, newLastName, newEmail, newPhone, newRole, newStartDate);

        // Assert
        employee.FirstName.Should().Be(newFirstName);
        employee.LastName.Should().Be(newLastName);
        employee.Email.Should().Be(newEmail);
        employee.Phone.Should().Be(newPhone);
        employee.Role.Should().Be(newRole);
        employee.StartDate.Should().Be(newStartDate);
        employee.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void UpdateDetails_WithNullFirstName_ShouldThrowArgumentNullException()
    {
        // Arrange
        var employee = new Employee(_technicalBusinessUnitId, FirstName, LastName, Email, Phone, Role, _startDate);

        // Act & Assert
        var action = () => employee.UpdateDetails(null!, LastName, Email, Phone, Role, _startDate);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("firstName");
    }

    [Theory]
    [InlineData("active")]
    [InlineData("inactive")]
    public void UpdateStatus_WithValidStatus_ShouldUpdateSuccessfully(string status)
    {
        // Arrange
        var employee = new Employee(_technicalBusinessUnitId, FirstName, LastName, Email, Phone, Role, _startDate);

        // Act
        employee.UpdateStatus(status);

        // Assert
        employee.Status.Should().Be(status);
        employee.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Theory]
    [InlineData("")]
    [InlineData("pending")]
    [InlineData("deleted")]
    [InlineData("ACTIVE")]
    public void UpdateStatus_WithInvalidStatus_ShouldThrowArgumentException(string invalidStatus)
    {
        // Arrange
        var employee = new Employee(_technicalBusinessUnitId, FirstName, LastName, Email, Phone, Role, _startDate);

        // Act & Assert
        var action = () => employee.UpdateStatus(invalidStatus);
        action.Should().Throw<ArgumentException>()
            .WithParameterName("status")
            .WithMessage("Status must be 'active' or 'inactive' (Parameter 'status')");
    }

    [Fact]
    public void UpdateTechnicalBusinessUnit_WithValidId_ShouldUpdateSuccessfully()
    {
        // Arrange
        var employee = new Employee(_technicalBusinessUnitId, FirstName, LastName, Email, Phone, Role, _startDate);
        var newTechnicalBusinessUnitId = Guid.NewGuid();

        // Act
        employee.UpdateTechnicalBusinessUnit(newTechnicalBusinessUnitId);

        // Assert
        employee.TechnicalBusinessUnitId.Should().Be(newTechnicalBusinessUnitId);
        employee.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void UpdateAll_WithValidParameters_ShouldUpdateAllFields()
    {
        // Arrange
        var employee = new Employee(_technicalBusinessUnitId, FirstName, LastName, Email, Phone, Role, _startDate);
        var newTechnicalBusinessUnitId = Guid.NewGuid();
        var newFirstName = "Alice";
        var newLastName = "Johnson";
        var newPhone = "+32 3 333 33 33";
        var newRole = "Team Lead";
        var newStartDate = new DateTime(2023, 9, 1);

        // Act
        employee.UpdateAll(newTechnicalBusinessUnitId, newFirstName, newLastName, newPhone, newRole, newStartDate);

        // Assert
        employee.TechnicalBusinessUnitId.Should().Be(newTechnicalBusinessUnitId);
        employee.FirstName.Should().Be(newFirstName);
        employee.LastName.Should().Be(newLastName);
        employee.Phone.Should().Be(newPhone);
        employee.Role.Should().Be(newRole);
        employee.StartDate.Should().Be(newStartDate);
        employee.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        // Note: Email is not updated in UpdateAll method
        employee.Email.Should().Be(Email);
    }

    [Fact]
    public void UpdateAll_WithNullFirstName_ShouldThrowArgumentNullException()
    {
        // Arrange
        var employee = new Employee(_technicalBusinessUnitId, FirstName, LastName, Email, Phone, Role, _startDate);

        // Act & Assert
        var action = () => employee.UpdateAll(_technicalBusinessUnitId, null!, LastName, Phone, Role, _startDate);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("firstName");
    }

    [Fact]
    public void Employee_PropertiesShouldHaveCorrectVisibility()
    {
        // Assert
        typeof(Employee).GetProperty("TechnicalBusinessUnitId")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(Employee).GetProperty("FirstName")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(Employee).GetProperty("LastName")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(Employee).GetProperty("Email")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(Employee).GetProperty("Phone")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(Employee).GetProperty("Role")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(Employee).GetProperty("StartDate")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(Employee).GetProperty("Status")?.SetMethod?.IsPublic.Should().BeFalse();
    }

    [Fact]
    public void Employee_WithEmptyGuidTechnicalBusinessUnitId_ShouldCreateSuccessfully()
    {
        // Act
        var employee = new Employee(Guid.Empty, FirstName, LastName, Email, Phone, Role, _startDate);

        // Assert
        employee.TechnicalBusinessUnitId.Should().Be(Guid.Empty);
    }

    [Fact]
    public void Employee_WithFutureStartDate_ShouldCreateSuccessfully()
    {
        // Arrange
        var futureDate = DateTime.UtcNow.AddDays(30);

        // Act
        var employee = new Employee(_technicalBusinessUnitId, FirstName, LastName, Email, Phone, Role, futureDate);

        // Assert
        employee.StartDate.Should().Be(futureDate);
    }

    [Fact]
    public void Employee_WithPastStartDate_ShouldCreateSuccessfully()
    {
        // Arrange
        var pastDate = new DateTime(2020, 1, 1);

        // Act
        var employee = new Employee(_technicalBusinessUnitId, FirstName, LastName, Email, Phone, Role, pastDate);

        // Assert
        employee.StartDate.Should().Be(pastDate);
    }
}