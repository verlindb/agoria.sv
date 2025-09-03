using Agoria.SV.Domain.Entities;

namespace Agoria.SV.Domain.Interfaces;

public interface ICompanyRepository
{
    Task<Company?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Company>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Company> AddAsync(Company entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Company entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
}
