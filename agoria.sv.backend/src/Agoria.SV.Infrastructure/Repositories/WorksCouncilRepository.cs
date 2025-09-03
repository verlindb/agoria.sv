using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Agoria.SV.Infrastructure.Repositories;

public class WorksCouncilRepository : IWorksCouncilRepository
{
    private readonly ApplicationDbContext _context;

    public WorksCouncilRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<WorksCouncil?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.WorksCouncils
            .Include(wc => wc.TechnicalBusinessUnit)
            .Include(wc => wc.Memberships)
            .FirstOrDefaultAsync(wc => wc.Id == id, cancellationToken);
    }

    public async Task<WorksCouncil?> GetByTechnicalBusinessUnitIdAsync(Guid technicalBusinessUnitId, CancellationToken cancellationToken = default)
    {
        return await _context.WorksCouncils
            .Include(wc => wc.TechnicalBusinessUnit)
            .Include(wc => wc.Memberships)
            .FirstOrDefaultAsync(wc => wc.TechnicalBusinessUnitId == technicalBusinessUnitId, cancellationToken);
    }

    public async Task<WorksCouncil> AddAsync(WorksCouncil entity, CancellationToken cancellationToken = default)
    {
        _context.WorksCouncils.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<WorksCouncil> UpdateAsync(WorksCouncil entity, CancellationToken cancellationToken = default)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        _context.WorksCouncils.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.WorksCouncils.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null)
            return false;

        _context.WorksCouncils.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
