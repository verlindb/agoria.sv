using Agoria.SV.Domain.Common;
using Agoria.SV.Domain.ValueObjects;

namespace Agoria.SV.Domain.Entities;

public class OrMembership : BaseEntity
{
    public Guid WorksCouncilId { get; private set; }
    public Guid TechnicalBusinessUnitId { get; private set; } // Denormalized for quick lookup
    public Guid EmployeeId { get; private set; }
    public ORCategory Category { get; private set; }
    public int Order { get; private set; }
    
    // Navigation properties
    public WorksCouncil WorksCouncil { get; private set; } = null!;
    public Employee Employee { get; private set; } = null!;
    public TechnicalBusinessUnit TechnicalBusinessUnit { get; private set; } = null!;
    
    private OrMembership() { } // For EF Core
    
    public OrMembership(
        Guid worksCouncilId,
        Guid technicalBusinessUnitId,
        Guid employeeId,
        ORCategory category,
        int order)
    {
        WorksCouncilId = worksCouncilId;
        TechnicalBusinessUnitId = technicalBusinessUnitId;
        EmployeeId = employeeId;
        Category = category;
        Order = order;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateOrder(int newOrder)
    {
        Order = newOrder;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateCategory(ORCategory newCategory)
    {
        Category = newCategory;
        UpdatedAt = DateTime.UtcNow;
    }
}
