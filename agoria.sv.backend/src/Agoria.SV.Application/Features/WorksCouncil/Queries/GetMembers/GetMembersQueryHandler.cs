using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Domain.ValueObjects;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.WorksCouncil.Queries.GetMembers;

public class GetMembersQueryHandler : IRequestHandler<GetMembersQuery, IEnumerable<EmployeeDto>>
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IOrMembershipRepository _orMembershipRepository;
    private readonly IMapper _mapper;

    public GetMembersQueryHandler(
        IEmployeeRepository employeeRepository,
        IOrMembershipRepository orMembershipRepository,
        IMapper mapper)
    {
        _employeeRepository = employeeRepository;
        _orMembershipRepository = orMembershipRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<EmployeeDto>> Handle(GetMembersQuery request, CancellationToken cancellationToken)
    {
        // Get memberships based on criteria
        IEnumerable<OrMembership> memberships;
        
        if (!string.IsNullOrEmpty(request.Category))
        {
            var category = ORCategoryHelper.FromString(request.Category);
            memberships = await _orMembershipRepository.GetByTechnicalBusinessUnitIdAndCategoryAsync(
                request.TechnicalBusinessUnitId, category, cancellationToken);
        }
        else
        {
            memberships = await _orMembershipRepository.GetByTechnicalBusinessUnitIdAsync(
                request.TechnicalBusinessUnitId, cancellationToken);
        }

        if (!memberships.Any())
            return new List<EmployeeDto>();

        // Get employees for these memberships
        var employeeIds = memberships.Select(m => m.EmployeeId).Distinct().ToList();
        var allEmployees = await _employeeRepository.GetAllAsync(cancellationToken);
        var memberEmployees = allEmployees.Where(e => employeeIds.Contains(e.Id)).ToList();

        // Group memberships by employee
        var membershipsByEmployee = memberships.GroupBy(m => m.EmployeeId)
            .ToDictionary(g => g.Key, g => g.ToList());

        // Build enriched response
        var result = new List<EmployeeDto>();
        foreach (var employee in memberEmployees)
        {
            var employeeMemberships = membershipsByEmployee.GetValueOrDefault(employee.Id, new List<OrMembership>());
            result.Add(MapEmployeeWithMemberships(employee, employeeMemberships));
        }

        // Sort by category and order if specific category was requested
        if (!string.IsNullOrEmpty(request.Category))
        {
            var category = ORCategoryHelper.FromString(request.Category);
            result = result.OrderBy(e => 
                e.OrMembership?.GetValueOrDefault(category.ToStringValue())?.Order ?? int.MaxValue
            ).ToList();
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
