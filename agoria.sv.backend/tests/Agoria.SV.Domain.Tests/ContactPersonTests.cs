using Agoria.SV.Domain.ValueObjects;
using FluentAssertions;

namespace Agoria.SV.Domain.Tests;

public class ContactPersonTests
{
    [Fact]
    public void ContactPerson_ShouldCreateValidContactPerson_WhenValidParametersProvided()
    {
        // Arrange
        var firstName = "John";
        var lastName = "Doe";
        var email = "john.doe@example.com";
        var phone = "+32123456789";
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
    public void ContactPerson_ShouldCreateValidContactPerson_WhenFunctionIsNull()
    {
        // Arrange
        var firstName = "John";
        var lastName = "Doe";
        var email = "john.doe@example.com";
        var phone = "+32123456789";

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
    [InlineData(null)]
    public void ContactPerson_ShouldThrowArgumentNullException_WhenFirstNameIsNull(string? firstName)
    {
        // Arrange
        var lastName = "Doe";
        var email = "john.doe@example.com";
        var phone = "+32123456789";

        // Act & Assert
        Action act = () => new ContactPerson(firstName!, lastName, email, phone);
        act.Should().Throw<ArgumentNullException>().WithParameterName(nameof(firstName));
    }

    [Theory]
    [InlineData(null)]
    public void ContactPerson_ShouldThrowArgumentNullException_WhenLastNameIsNull(string? lastName)
    {
        // Arrange
        var firstName = "John";
        var email = "john.doe@example.com";
        var phone = "+32123456789";

        // Act & Assert
        Action act = () => new ContactPerson(firstName, lastName!, email, phone);
        act.Should().Throw<ArgumentNullException>().WithParameterName(nameof(lastName));
    }

    [Theory]
    [InlineData(null)]
    public void ContactPerson_ShouldThrowArgumentNullException_WhenEmailIsNull(string? email)
    {
        // Arrange
        var firstName = "John";
        var lastName = "Doe";
        var phone = "+32123456789";

        // Act & Assert
        Action act = () => new ContactPerson(firstName, lastName, email!, phone);
        act.Should().Throw<ArgumentNullException>().WithParameterName(nameof(email));
    }

    [Theory]
    [InlineData(null)]
    public void ContactPerson_ShouldThrowArgumentNullException_WhenPhoneIsNull(string? phone)
    {
        // Arrange
        var firstName = "John";
        var lastName = "Doe";
        var email = "john.doe@example.com";

        // Act & Assert
        Action act = () => new ContactPerson(firstName, lastName, email, phone!);
        act.Should().Throw<ArgumentNullException>().WithParameterName(nameof(phone));
    }

    [Fact]
    public void ContactPerson_ShouldBeImmutable_AfterCreation()
    {
        // Arrange
        var firstName = "John";
        var lastName = "Doe";
        var email = "john.doe@example.com";
        var phone = "+32123456789";

        // Act
        var contactPerson = new ContactPerson(firstName, lastName, email, phone);

        // Assert - Properties should have private setters (immutable)
        typeof(ContactPerson).GetProperty(nameof(ContactPerson.FirstName))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
        typeof(ContactPerson).GetProperty(nameof(ContactPerson.LastName))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
        typeof(ContactPerson).GetProperty(nameof(ContactPerson.Email))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
        typeof(ContactPerson).GetProperty(nameof(ContactPerson.Phone))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
        typeof(ContactPerson).GetProperty(nameof(ContactPerson.Function))!.SetMethod.Should().NotBeNull().And.Subject!.IsPrivate.Should().BeTrue();
    }

    [Fact]
    public void ContactPerson_ShouldAcceptEmptyStrings()
    {
        // Arrange & Act
        var contactPerson = new ContactPerson("", "", "", "", "");

        // Assert
        contactPerson.FirstName.Should().Be("");
        contactPerson.LastName.Should().Be("");
        contactPerson.Email.Should().Be("");
        contactPerson.Phone.Should().Be("");
        contactPerson.Function.Should().Be("");
    }
}