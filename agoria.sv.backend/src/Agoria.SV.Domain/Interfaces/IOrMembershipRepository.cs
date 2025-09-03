using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.ValueObjects;

namespace Agoria.SV.Domain.Interfaces;

public interface IOrMembershipRepository
{
    Task<IEnumerable<OrMembership>> GetByTechnicalBusinessUnitIdAsync(Guid technicalBusinessUnitId, CancellationToken cancellationToken = default);
    Task<IEnumerable<OrMembership>> GetByTechnicalBusinessUnitIdAndCategoryAsync(Guid technicalBusinessUnitId, ORCategory category, CancellationToken cancellationToken = default);
    Task<OrMembership?> GetByEmployeeIdAndCategoryAsync(Guid employeeId, ORCategory category, CancellationToken cancellationToken = default);
    Task<IEnumerable<OrMembership>> GetByEmployeeIdAsync(Guid employeeId, CancellationToken cancellationToken = default);
    Task<OrMembership> AddAsync(OrMembership entity, CancellationToken cancellationToken = default);
    Task<OrMembership> UpdateAsync(OrMembership entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> DeleteByEmployeeIdAndCategoryAsync(Guid employeeId, ORCategory category, CancellationToken cancellationToken = default);
    Task<IEnumerable<OrMembership>> BulkAddAsync(IEnumerable<OrMembership> entities, CancellationToken cancellationToken = default);
    Task<IEnumerable<OrMembership>> BulkDeleteByEmployeeIdsAndCategoryAsync(IEnumerable<Guid> employeeIds, ORCategory category, CancellationToken cancellationToken = default);
}
