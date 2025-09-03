namespace Agoria.SV.Application.DTOs;

public class EmployeeDto
{
    public Guid Id { get; set; }
    public Guid TechnicalBusinessUnitId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // OR membership information - matches frontend expectation
    public Dictionary<string, OrMembershipInfo>? OrMembership { get; set; }
}

public class OrMembershipInfo
{
    public bool Member { get; set; }
    public int? Order { get; set; }
}
