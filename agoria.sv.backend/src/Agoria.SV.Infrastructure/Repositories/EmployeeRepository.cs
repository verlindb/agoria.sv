using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Agoria.SV.Infrastructure.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly ApplicationDbContext _context;

    public EmployeeRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Employee>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Employees
            .Include(e => e.TechnicalBusinessUnit)
            .ToListAsync(cancellationToken);
    }

    public async Task<Employee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Employees
            .Include(e => e.TechnicalBusinessUnit)
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<Employee?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Employees
            .Include(e => e.TechnicalBusinessUnit)
            .FirstOrDefaultAsync(e => e.Email == email, cancellationToken);
    }

    public async Task<IEnumerable<Employee>> GetByTechnicalBusinessUnitIdAsync(Guid technicalBusinessUnitId, CancellationToken cancellationToken = default)
    {
        return await _context.Employees
            .Include(e => e.TechnicalBusinessUnit)
            .Where(e => e.TechnicalBusinessUnitId == technicalBusinessUnitId)
            .ToListAsync(cancellationToken);
    }

    public async Task<Employee> AddAsync(Employee entity, CancellationToken cancellationToken = default)
    {
        _context.Employees.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<Employee> UpdateAsync(Employee entity, CancellationToken cancellationToken = default)
    {
        _context.Employees.Update(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<Employee> UpsertAsync(Employee entity, CancellationToken cancellationToken = default)
    {
        var existing = await GetByEmailAsync(entity.Email, cancellationToken);
        if (existing != null)
        {
            // Update existing record using the UpdateAll method
            existing.UpdateAll(
                entity.TechnicalBusinessUnitId,
                entity.FirstName,
                entity.LastName,
                entity.Phone,
                entity.Role,
                entity.StartDate
            );
            
            return await UpdateAsync(existing, cancellationToken);
        }
        else
        {
            // Create new record
            return await AddAsync(entity, cancellationToken);
        }
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Employees.FindAsync(new object[] { id }, cancellationToken);
        if (entity == null)
            return false;

        _context.Employees.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IEnumerable<Employee>> BulkAddAsync(IEnumerable<Employee> entities, CancellationToken cancellationToken = default)
    {
        var employeeList = entities.ToList();
        _context.Employees.AddRange(employeeList);
        await _context.SaveChangesAsync(cancellationToken);
        return employeeList;
    }

    public async Task<IEnumerable<Employee>> BulkUpsertAsync(IEnumerable<Employee> entities, CancellationToken cancellationToken = default)
    {
        var result = new List<Employee>();
        
        foreach (var employee in entities)
        {
            var upserted = await UpsertAsync(employee, cancellationToken);
            result.Add(upserted);
        }
        
        return result;
    }
}
