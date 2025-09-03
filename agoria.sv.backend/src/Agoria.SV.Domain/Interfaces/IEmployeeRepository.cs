using Agoria.SV.Domain.Entities;

namespace Agoria.SV.Domain.Interfaces;

public interface IEmployeeRepository
{
    Task<IEnumerable<Employee>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Employee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Employee?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<IEnumerable<Employee>> GetByTechnicalBusinessUnitIdAsync(Guid technicalBusinessUnitId, CancellationToken cancellationToken = default);
    Task<Employee> AddAsync(Employee entity, CancellationToken cancellationToken = default);
    Task<Employee> UpdateAsync(Employee entity, CancellationToken cancellationToken = default);
    Task<Employee> UpsertAsync(Employee entity, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Employee>> BulkAddAsync(IEnumerable<Employee> entities, CancellationToken cancellationToken = default);
    Task<IEnumerable<Employee>> BulkUpsertAsync(IEnumerable<Employee> entities, CancellationToken cancellationToken = default);
}
