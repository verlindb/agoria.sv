using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Domain.ValueObjects;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.WorksCouncil.Commands.ReorderMembers;

public class ReorderMembersCommandHandler : IRequestHandler<ReorderMembersCommand, IEnumerable<EmployeeDto>>
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IOrMembershipRepository _orMembershipRepository;
    private readonly IMapper _mapper;

    public ReorderMembersCommandHandler(
        IEmployeeRepository employeeRepository,
        IOrMembershipRepository orMembershipRepository,
        IMapper mapper)
    {
        _employeeRepository = employeeRepository;
        _orMembershipRepository = orMembershipRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<EmployeeDto>> Handle(ReorderMembersCommand request, CancellationToken cancellationToken)
    {
        // Parse category
        var category = ORCategoryHelper.FromString(request.Category);

        // Get existing memberships for this category and technical unit
        var memberships = await _orMembershipRepository.GetByTechnicalBusinessUnitIdAndCategoryAsync(
            request.TechnicalBusinessUnitId, category, cancellationToken);
        
        var membershipDict = memberships.ToDictionary(m => m.EmployeeId);

        // Create order mapping
        var orderMapping = new Dictionary<Guid, int>();
        var order = 1;
        foreach (var employeeId in request.OrderedIds)
        {
            if (membershipDict.ContainsKey(employeeId))
            {
                orderMapping[employeeId] = order++;
            }
        }

        // Update orders
        foreach (var membership in memberships)
        {
            if (orderMapping.TryGetValue(membership.EmployeeId, out var newOrder))
            {
                if (membership.Order != newOrder)
                {
                    membership.UpdateOrder(newOrder);
                    await _orMembershipRepository.UpdateAsync(membership, cancellationToken);
                }
            }
        }

        // Get affected employees
        var employeeIds = request.OrderedIds.ToList();
        var allEmployees = await _employeeRepository.GetAllAsync(cancellationToken);
        var affectedEmployees = allEmployees.Where(e => employeeIds.Contains(e.Id)).ToList();

        // Build enriched response
        var result = new List<EmployeeDto>();
        foreach (var employee in affectedEmployees)
        {
            var allMemberships = await _orMembershipRepository.GetByEmployeeIdAsync(employee.Id, cancellationToken);
            result.Add(MapEmployeeWithMemberships(employee, allMemberships));
        }

        return result;
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
