using Xunit;
using Agoria.SV.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Agoria.SV.API.Tests.Unit.Domain.ValueObjects;

public class ContactPersonTests
{
    [Fact]
    public void ContactPerson_WithValidParameters_ShouldCreateSuccessfully()
    {
        // Arrange
        var firstName = "John";
        var lastName = "Doe";
        var email = "john.doe@test.com";
        var phone = "+32 1 111 11 11";
        var function = "Manager";

        // Act
        var contactPerson = new ContactPerson(firstName, lastName, email, phone, function);

        // Assert
        contactPerson.FirstName.Should().Be(firstName);
        contactPerson.LastName.Should().Be(lastName);
        contactPerson.Email.Should().Be(email);
        contactPerson.Phone.Should().Be(phone);
        contactPerson.Function.Should().Be(function);
    }

    [Fact]
    public void ContactPerson_WithoutFunction_ShouldCreateSuccessfully()
    {
        // Arrange
        var firstName = "Jane";
        var lastName = "Smith";
        var email = "jane.smith@test.com";
        var phone = "+32 2 222 22 22";

        // Act
        var contactPerson = new ContactPerson(firstName, lastName, email, phone);

        // Assert
        contactPerson.FirstName.Should().Be(firstName);
        contactPerson.LastName.Should().Be(lastName);
        contactPerson.Email.Should().Be(email);
        contactPerson.Phone.Should().Be(phone);
        contactPerson.Function.Should().BeNull();
    }

    [Fact]
    public void ContactPerson_WithNullFunction_ShouldCreateSuccessfully()
    {
        // Arrange
        var firstName = "Alice";
        var lastName = "Johnson";
        var email = "alice.johnson@test.com";
        var phone = "+32 3 333 33 33";

        // Act
        var contactPerson = new ContactPerson(firstName, lastName, email, phone, null);

        // Assert
        contactPerson.FirstName.Should().Be(firstName);
        contactPerson.LastName.Should().Be(lastName);
        contactPerson.Email.Should().Be(email);
        contactPerson.Phone.Should().Be(phone);
        contactPerson.Function.Should().BeNull();
    }

    [Fact]
    public void ContactPerson_WithNullFirstName_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var action = () => new ContactPerson(null!, "Doe", "john@test.com", "+32 1 111 11 11");
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("firstName");
    }

    [Fact]
    public void ContactPerson_WithNullLastName_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var action = () => new ContactPerson("John", null!, "john@test.com", "+32 1 111 11 11");
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("lastName");
    }

    [Fact]
    public void ContactPerson_WithNullEmail_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var action = () => new ContactPerson("John", "Doe", null!, "+32 1 111 11 11");
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("email");
    }

    [Fact]
    public void ContactPerson_WithNullPhone_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        var action = () => new ContactPerson("John", "Doe", "john@test.com", null!);
        action.Should().Throw<ArgumentNullException>()
            .WithParameterName("phone");
    }

    [Fact]
    public void ContactPerson_PropertiesShouldBeReadonly()
    {
        // Assert
        typeof(ContactPerson).GetProperty("FirstName")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(ContactPerson).GetProperty("LastName")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(ContactPerson).GetProperty("Email")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(ContactPerson).GetProperty("Phone")?.SetMethod?.IsPublic.Should().BeFalse();
        typeof(ContactPerson).GetProperty("Function")?.SetMethod?.IsPublic.Should().BeFalse();
    }

    [Theory]
    [InlineData("", "", "", "")]
    [InlineData("A", "B", "a@b.c", "1")]
    public void ContactPerson_WithEmptyOrMinimalStrings_ShouldCreateSuccessfully(string firstName, string lastName, string email, string phone)
    {
        // Act
        var contactPerson = new ContactPerson(firstName, lastName, email, phone);

        // Assert
        contactPerson.FirstName.Should().Be(firstName);
        contactPerson.LastName.Should().Be(lastName);
        contactPerson.Email.Should().Be(email);
        contactPerson.Phone.Should().Be(phone);
        contactPerson.Function.Should().BeNull();
    }

    [Theory]
    [InlineData("Jean-Claude", "Van Damme", "jcvd@action.com", "+32 4 444 44 44", "Actor & Martial Artist")]
    [InlineData("María José", "García-López", "maria.garcia@empresa.es", "+34 91 123 45 67", "Director Ejecutivo")]
    [InlineData("李", "明", "li.ming@company.cn", "+86 138 0013 8000", "总经理")]
    public void ContactPerson_WithInternationalNames_ShouldCreateSuccessfully(string firstName, string lastName, string email, string phone, string function)
    {
        // Act
        var contactPerson = new ContactPerson(firstName, lastName, email, phone, function);

        // Assert
        contactPerson.FirstName.Should().Be(firstName);
        contactPerson.LastName.Should().Be(lastName);
        contactPerson.Email.Should().Be(email);
        contactPerson.Phone.Should().Be(phone);
        contactPerson.Function.Should().Be(function);
    }

    [Fact]
    public void ContactPerson_WithEmptyFunction_ShouldCreateSuccessfully()
    {
        // Act
        var contactPerson = new ContactPerson("John", "Doe", "john@test.com", "+32 1 111 11 11", "");

        // Assert
        contactPerson.Function.Should().Be("");
    }
}