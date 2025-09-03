using Agoria.SV.Domain.Entities;

namespace Agoria.SV.Domain.Interfaces;

public interface ITechnicalBusinessUnitRepository
{
    Task<IEnumerable<TechnicalBusinessUnit>> GetAllAsync();
    Task<TechnicalBusinessUnit?> GetByIdAsync(Guid id);
    Task<TechnicalBusinessUnit?> GetByCodeAsync(string code);
    Task<TechnicalBusinessUnit> CreateAsync(TechnicalBusinessUnit technicalUnit);
    Task<TechnicalBusinessUnit> UpdateAsync(TechnicalBusinessUnit technicalUnit);
    Task<TechnicalBusinessUnit> UpsertAsync(TechnicalBusinessUnit technicalUnit);
    Task<bool> DeleteAsync(Guid id);
    Task<IEnumerable<TechnicalBusinessUnit>> GetByCompanyIdAsync(Guid companyId);
    Task<IEnumerable<TechnicalBusinessUnit>> BulkUpsertAsync(IEnumerable<TechnicalBusinessUnit> technicalUnits);
}
