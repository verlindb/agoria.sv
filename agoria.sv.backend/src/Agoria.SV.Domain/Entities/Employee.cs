using Agoria.SV.Domain.Common;
using Agoria.SV.Domain.ValueObjects;

namespace Agoria.SV.Domain.Entities;

public class Employee : BaseEntity
{
    public Guid TechnicalBusinessUnitId { get; private set; }
    public string FirstName { get; private set; } = string.Empty;
    public string LastName { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string Role { get; private set; } = string.Empty;
    public DateTime StartDate { get; private set; }
    public string Status { get; private set; } = "active";

    // Navigation property
    public TechnicalBusinessUnit TechnicalBusinessUnit { get; private set; } = null!;

    private Employee() { } // For EF Core

    public Employee(
        Guid technicalBusinessUnitId,
        string firstName,
        string lastName,
        string email,
        string phone,
        string role,
        DateTime startDate)
    {
        TechnicalBusinessUnitId = technicalBusinessUnitId;
        FirstName = firstName ?? throw new ArgumentNullException(nameof(firstName));
        LastName = lastName ?? throw new ArgumentNullException(nameof(lastName));
        Email = email ?? throw new ArgumentNullException(nameof(email));
        Phone = phone ?? throw new ArgumentNullException(nameof(phone));
        Role = role ?? throw new ArgumentNullException(nameof(role));
        StartDate = startDate;
        Status = "active";
    }

    public void UpdateDetails(
        string firstName,
        string lastName,
        string email,
        string phone,
        string role,
        DateTime startDate)
    {
        FirstName = firstName ?? throw new ArgumentNullException(nameof(firstName));
        LastName = lastName ?? throw new ArgumentNullException(nameof(lastName));
        Email = email ?? throw new ArgumentNullException(nameof(email));
        Phone = phone ?? throw new ArgumentNullException(nameof(phone));
        Role = role ?? throw new ArgumentNullException(nameof(role));
        StartDate = startDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateStatus(string status)
    {
        if (status != "active" && status != "inactive")
            throw new ArgumentException("Status must be 'active' or 'inactive'", nameof(status));
        
        Status = status;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateTechnicalBusinessUnit(Guid technicalBusinessUnitId)
    {
        TechnicalBusinessUnitId = technicalBusinessUnitId;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateAll(
        Guid technicalBusinessUnitId,
        string firstName,
        string lastName,
        string phone,
        string role,
        DateTime startDate)
    {
        TechnicalBusinessUnitId = technicalBusinessUnitId;
        FirstName = firstName ?? throw new ArgumentNullException(nameof(firstName));
        LastName = lastName ?? throw new ArgumentNullException(nameof(lastName));
        Phone = phone ?? throw new ArgumentNullException(nameof(phone));
        Role = role ?? throw new ArgumentNullException(nameof(role));
        StartDate = startDate;
        UpdatedAt = DateTime.UtcNow;
    }
}
