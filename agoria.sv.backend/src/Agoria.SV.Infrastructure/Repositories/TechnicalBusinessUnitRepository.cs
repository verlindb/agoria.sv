using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Agoria.SV.Infrastructure.Repositories;

public class TechnicalBusinessUnitRepository : ITechnicalBusinessUnitRepository
{
    private readonly ApplicationDbContext _context;

    public TechnicalBusinessUnitRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TechnicalBusinessUnit>> GetAllAsync()
    {
        return await _context.TechnicalBusinessUnits
            .Include(t => t.Company)
            .ToListAsync();
    }

    public async Task<TechnicalBusinessUnit?> GetByIdAsync(Guid id)
    {
        return await _context.TechnicalBusinessUnits
            .Include(t => t.Company)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<TechnicalBusinessUnit?> GetByCodeAsync(string code)
    {
        return await _context.TechnicalBusinessUnits
            .Include(t => t.Company)
            .FirstOrDefaultAsync(t => t.Code == code);
    }

    public async Task<TechnicalBusinessUnit> CreateAsync(TechnicalBusinessUnit technicalUnit)
    {
        technicalUnit.Id = Guid.NewGuid();
        technicalUnit.CreatedAt = DateTime.UtcNow;
        technicalUnit.UpdatedAt = DateTime.UtcNow;

        _context.TechnicalBusinessUnits.Add(technicalUnit);
        await _context.SaveChangesAsync();
        return technicalUnit;
    }

    public async Task<TechnicalBusinessUnit> UpdateAsync(TechnicalBusinessUnit technicalUnit)
    {
        technicalUnit.UpdatedAt = DateTime.UtcNow;
        _context.TechnicalBusinessUnits.Update(technicalUnit);
        await _context.SaveChangesAsync();
        return technicalUnit;
    }

    public async Task<TechnicalBusinessUnit> UpsertAsync(TechnicalBusinessUnit technicalUnit)
    {
        var existing = await GetByCodeAsync(technicalUnit.Code);
        if (existing != null)
        {
            // Update existing record
            existing.Name = technicalUnit.Name;
            existing.Description = technicalUnit.Description;
            existing.NumberOfEmployees = technicalUnit.NumberOfEmployees;
            existing.Manager = technicalUnit.Manager;
            existing.Department = technicalUnit.Department;
            existing.Location = technicalUnit.Location;
            existing.Status = technicalUnit.Status;
            existing.Language = technicalUnit.Language;
            existing.PcWorkers = technicalUnit.PcWorkers;
            existing.PcClerks = technicalUnit.PcClerks;
            existing.FodDossierBase = technicalUnit.FodDossierBase;
            existing.FodDossierSuffix = technicalUnit.FodDossierSuffix;
            existing.ElectionBodies = technicalUnit.ElectionBodies;
            existing.CompanyId = technicalUnit.CompanyId;
            
            return await UpdateAsync(existing);
        }
        else
        {
            // Create new record
            return await CreateAsync(technicalUnit);
        }
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var technicalUnit = await _context.TechnicalBusinessUnits.FindAsync(id);
        if (technicalUnit == null)
            return false;

        _context.TechnicalBusinessUnits.Remove(technicalUnit);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<TechnicalBusinessUnit>> GetByCompanyIdAsync(Guid companyId)
    {
        return await _context.TechnicalBusinessUnits
            .Include(t => t.Company)
            .Where(t => t.CompanyId == companyId)
            .ToListAsync();
    }

    public async Task<IEnumerable<TechnicalBusinessUnit>> BulkUpsertAsync(IEnumerable<TechnicalBusinessUnit> technicalUnits)
    {
        var result = new List<TechnicalBusinessUnit>();
        
        foreach (var unit in technicalUnits)
        {
            var upserted = await UpsertAsync(unit);
            result.Add(upserted);
        }
        
        return result;
    }
}
