namespace Agoria.SV.Domain.ValueObjects;

public class Address
{
    public string Street { get; private set; } = string.Empty;
    public string Number { get; private set; } = string.Empty;
    public string PostalCode { get; private set; } = string.Empty;
    public string City { get; private set; } = string.Empty;
    public string Country { get; private set; } = string.Empty;

    protected Address() { } // For EF Core

    public Address(string street, string number, string postalCode, string city, string country)
    {
        Street = street ?? throw new ArgumentNullException(nameof(street));
        Number = number ?? throw new ArgumentNullException(nameof(number));
        PostalCode = postalCode ?? throw new ArgumentNullException(nameof(postalCode));
        City = city ?? throw new ArgumentNullException(nameof(city));
        Country = country ?? throw new ArgumentNullException(nameof(country));
    }
}
