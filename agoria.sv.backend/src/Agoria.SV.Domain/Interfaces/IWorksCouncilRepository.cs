using Agoria.SV.Domain.Entities;

namespace Agoria.SV.Domain.Interfaces;

public interface IWorksCouncilRepository
{
    Task<WorksCouncil?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<WorksCouncil?> GetByTechnicalBusinessUnitIdAsync(Guid technicalBusinessUnitId, CancellationToken cancellationToken = default);
    Task<WorksCouncil> AddAsync(WorksCouncil entity, CancellationToken cancellationToken = default);
    Task<WorksCouncil> UpdateAsync(WorksCouncil entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
