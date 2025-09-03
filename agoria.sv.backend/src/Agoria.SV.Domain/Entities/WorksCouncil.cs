using Agoria.SV.Domain.Common;

namespace Agoria.SV.Domain.Entities;

public class WorksCouncil : BaseEntity
{
    public Guid TechnicalBusinessUnitId { get; private set; }
    
    // Navigation properties
    public TechnicalBusinessUnit TechnicalBusinessUnit { get; private set; } = null!;
    public ICollection<OrMembership> Memberships { get; private set; } = new List<OrMembership>();
    
    private WorksCouncil() { } // For EF Core
    
    public WorksCouncil(Guid technicalBusinessUnitId)
    {
        TechnicalBusinessUnitId = technicalBusinessUnitId;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void UpdateTechnicalBusinessUnit(Guid technicalBusinessUnitId)
    {
        TechnicalBusinessUnitId = technicalBusinessUnitId;
        UpdatedAt = DateTime.UtcNow;
    }
}
