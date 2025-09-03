using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Domain.ValueObjects;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.WorksCouncil.Commands.BulkRemoveMembers;

public class BulkRemoveMembersCommandHandler : IRequestHandler<BulkRemoveMembersCommand, IEnumerable<EmployeeDto>>
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IOrMembershipRepository _orMembershipRepository;
    private readonly IMapper _mapper;

    public BulkRemoveMembersCommandHandler(
        IEmployeeRepository employeeRepository,
        IOrMembershipRepository orMembershipRepository,
        IMapper mapper)
    {
        _employeeRepository = employeeRepository;
        _orMembershipRepository = orMembershipRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<EmployeeDto>> Handle(BulkRemoveMembersCommand request, CancellationToken cancellationToken)
    {
        if (!request.EmployeeIds.Any())
            return new List<EmployeeDto>();

        // Parse category
        var category = ORCategoryHelper.FromString(request.Category);

        // Get all employees
        var allEmployees = await _employeeRepository.GetAllAsync(cancellationToken);
        var employeeDict = allEmployees.ToDictionary(e => e.Id);

        var validEmployees = new List<Employee>();

        // Validate employees exist and belong to the specified technical unit
        foreach (var employeeId in request.EmployeeIds)
        {
            if (!employeeDict.TryGetValue(employeeId, out var employee))
                throw new KeyNotFoundException($"Employee with ID {employeeId} not found");

            if (employee.TechnicalBusinessUnitId != request.TechnicalBusinessUnitId)
                throw new InvalidOperationException($"Employee {employee.FirstName} {employee.LastName} does not belong to the specified technical business unit");

            validEmployees.Add(employee);
        }

        // Bulk remove memberships
        await _orMembershipRepository.BulkDeleteByEmployeeIdsAndCategoryAsync(
            request.EmployeeIds, category, cancellationToken);

        // Compact orders for the technical unit
        await CompactOrders(request.TechnicalBusinessUnitId, category, cancellationToken);

        // Get remaining memberships for affected employees to build enriched response
        var result = new List<EmployeeDto>();
        foreach (var employee in validEmployees)
        {
            var allMemberships = await _orMembershipRepository.GetByEmployeeIdAsync(employee.Id, cancellationToken);
            result.Add(MapEmployeeWithMemberships(employee, allMemberships));
        }

        return result;
    }

    private async Task CompactOrders(Guid technicalBusinessUnitId, ORCategory category, CancellationToken cancellationToken)
    {
        var memberships = await _orMembershipRepository.GetByTechnicalBusinessUnitIdAndCategoryAsync(
            technicalBusinessUnitId, category, cancellationToken);
        
        var orderedMemberships = memberships.OrderBy(m => m.Order).ToList();
        
        for (int i = 0; i < orderedMemberships.Count; i++)
        {
            var membership = orderedMemberships[i];
            if (membership.Order != i + 1)
            {
                membership.UpdateOrder(i + 1);
                await _orMembershipRepository.UpdateAsync(membership, cancellationToken);
            }
        }
    }

    private EmployeeDto MapEmployeeWithMemberships(Employee employee, IEnumerable<OrMembership> memberships)
    {
        var employeeDto = _mapper.Map<EmployeeDto>(employee);
        
        if (memberships.Any())
        {
            employeeDto.OrMembership = memberships.ToDictionary(
                m => m.Category.ToStringValue(),
                m => new OrMembershipInfo { Member = true, Order = m.Order }
            );
        }
        
        return employeeDto;
    }
}
