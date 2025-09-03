namespace Agoria.SV.Domain.ValueObjects;

public class ContactPerson
{
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string? Function { get; private set; }

    protected ContactPerson() { } // For EF Core

    public ContactPerson(string firstName, string lastName, string email, string phone, string? function = null)
    {
        FirstName = firstName ?? throw new ArgumentNullException(nameof(firstName));
        LastName = lastName ?? throw new ArgumentNullException(nameof(lastName));
        Email = email ?? throw new ArgumentNullException(nameof(email));
        Phone = phone ?? throw new ArgumentNullException(nameof(phone));
        Function = function;
    }
}
