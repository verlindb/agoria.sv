using Agoria.SV.Domain.Common;
using Agoria.SV.Domain.ValueObjects;

namespace Agoria.SV.Domain.Entities;

public class Company : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string LegalName { get; set; } = string.Empty;
    private string _ondernemingsnummer = string.Empty;
    public string Ondernemingsnummer
    {
        get => _ondernemingsnummer;
        set
        {
            if (string.IsNullOrWhiteSpace(value) || !System.Text.RegularExpressions.Regex.IsMatch(value, "^BE\\d{10}$"))
                throw new ArgumentException("Ondernemingsnummer moet het formaat BE0123456789 hebben.");
            _ondernemingsnummer = value;
        }
    }

    public string Type { get; set; } = string.Empty;

    private string _status = "active";
    public string Status
    {
        get => _status;
        set
        {
            if (value != "active" && value != "inactive" && value != "pending")
                throw new ArgumentException("Status must be 'active', 'inactive', or 'pending'.");
            _status = value;
        }
    }

    public string Sector { get; set; } = string.Empty;
    public int NumberOfEmployees { get; set; }
    public Address Address { get; set; } = null!;
    public ContactPerson ContactPerson { get; set; } = null!;
}
