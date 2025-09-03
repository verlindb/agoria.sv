using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Domain.ValueObjects;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.WorksCouncil.Commands.RemoveMember;

public class RemoveMemberCommandHandler : IRequestHandler<RemoveMemberCommand, EmployeeDto>
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IOrMembershipRepository _orMembershipRepository;
    private readonly IMapper _mapper;

    public RemoveMemberCommandHandler(
        IEmployeeRepository employeeRepository,
        IOrMembershipRepository orMembershipRepository,
        IMapper mapper)
    {
        _employeeRepository = employeeRepository;
        _orMembershipRepository = orMembershipRepository;
        _mapper = mapper;
    }

    public async Task<EmployeeDto> Handle(RemoveMemberCommand request, CancellationToken cancellationToken)
    {
        // Validate and get employee
        var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
            throw new KeyNotFoundException($"Employee with ID {request.EmployeeId} not found");

        // Parse category
        var category = ORCategoryHelper.FromString(request.Category);

        // Remove membership
        var removed = await _orMembershipRepository.DeleteByEmployeeIdAndCategoryAsync(
            request.EmployeeId, category, cancellationToken);
        
        if (!removed)
            throw new KeyNotFoundException($"Employee is not a member of category {request.Category}");

        // Compact orders for remaining members in this category
        await CompactOrders(employee.TechnicalBusinessUnitId, category, cancellationToken);

        // Get remaining memberships for this employee to build the enriched response
        var allMemberships = await _orMembershipRepository.GetByEmployeeIdAsync(request.EmployeeId, cancellationToken);
        
        return MapEmployeeWithMemberships(employee, allMemberships);
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
