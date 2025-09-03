using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Domain.ValueObjects;
using Agoria.SV.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Agoria.SV.Infrastructure.Repositories;

public class OrMembershipRepository : IOrMembershipRepository
{
    private readonly ApplicationDbContext _context;

    public OrMembershipRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<OrMembership>> GetByTechnicalBusinessUnitIdAsync(Guid technicalBusinessUnitId, CancellationToken cancellationToken = default)
    {
        return await _context.OrMemberships
            .Include(om => om.Employee)
            .Include(om => om.WorksCouncil)
            .Where(om => om.TechnicalBusinessUnitId == technicalBusinessUnitId)
            .OrderBy(om => om.Category)
            .ThenBy(om => om.Order)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<OrMembership>> GetByTechnicalBusinessUnitIdAndCategoryAsync(Guid technicalBusinessUnitId, ORCategory category, CancellationToken cancellationToken = default)
    {
        return await _context.OrMemberships
            .Include(om => om.Employee)
            .Include(om => om.WorksCouncil)
            .Where(om => om.TechnicalBusinessUnitId == technicalBusinessUnitId && om.Category == category)
            .OrderBy(om => om.Order)
            .ToListAsync(cancellationToken);
    }

    public async Task<OrMembership?> GetByEmployeeIdAndCategoryAsync(Guid employeeId, ORCategory category, CancellationToken cancellationToken = default)
    {
        return await _context.OrMemberships
            .Include(om => om.Employee)
            .Include(om => om.WorksCouncil)
            .FirstOrDefaultAsync(om => om.EmployeeId == employeeId && om.Category == category, cancellationToken);
    }

    public async Task<IEnumerable<OrMembership>> GetByEmployeeIdAsync(Guid employeeId, CancellationToken cancellationToken = default)
    {
        return await _context.OrMemberships
            .Include(om => om.Employee)
            .Include(om => om.WorksCouncil)
            .Where(om => om.EmployeeId == employeeId)
            .OrderBy(om => om.Category)
            .ThenBy(om => om.Order)
            .ToListAsync(cancellationToken);
    }

    public async Task<OrMembership> AddAsync(OrMembership entity, CancellationToken cancellationToken = default)
    {
        _context.OrMemberships.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<OrMembership> UpdateAsync(OrMembership entity, CancellationToken cancellationToken = default)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        _context.OrMemberships.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.OrMemberships.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null)
            return false;

        _context.OrMemberships.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteByEmployeeIdAndCategoryAsync(Guid employeeId, ORCategory category, CancellationToken cancellationToken = default)
    {
        var entity = await _context.OrMemberships
            .FirstOrDefaultAsync(om => om.EmployeeId == employeeId && om.Category == category, cancellationToken);
        
        if (entity == null)
            return false;

        _context.OrMemberships.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IEnumerable<OrMembership>> BulkAddAsync(IEnumerable<OrMembership> entities, CancellationToken cancellationToken = default)
    {
        var entitiesList = entities.ToList();
        _context.OrMemberships.AddRange(entitiesList);
        await _context.SaveChangesAsync(cancellationToken);
        return entitiesList;
    }

    public async Task<IEnumerable<OrMembership>> BulkDeleteByEmployeeIdsAndCategoryAsync(IEnumerable<Guid> employeeIds, ORCategory category, CancellationToken cancellationToken = default)
    {
        var employeeIdsList = employeeIds.ToList();
        var entities = await _context.OrMemberships
            .Where(om => employeeIdsList.Contains(om.EmployeeId) && om.Category == category)
            .ToListAsync(cancellationToken);

        if (entities.Any())
        {
            _context.OrMemberships.RemoveRange(entities);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return entities;
    }
}
