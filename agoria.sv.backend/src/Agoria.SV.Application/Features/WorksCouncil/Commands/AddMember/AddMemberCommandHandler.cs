using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Domain.ValueObjects;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.WorksCouncil.Commands.AddMember;

public class AddMemberCommandHandler : IRequestHandler<AddMemberCommand, EmployeeDto>
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IWorksCouncilRepository _worksCouncilRepository;
    private readonly IOrMembershipRepository _orMembershipRepository;
    private readonly IMapper _mapper;

    public AddMemberCommandHandler(
        IEmployeeRepository employeeRepository,
        IWorksCouncilRepository worksCouncilRepository,
        IOrMembershipRepository orMembershipRepository,
        IMapper mapper)
    {
        _employeeRepository = employeeRepository;
        _worksCouncilRepository = worksCouncilRepository;
        _orMembershipRepository = orMembershipRepository;
        _mapper = mapper;
    }

    public async Task<EmployeeDto> Handle(AddMemberCommand request, CancellationToken cancellationToken)
    {
        // Validate and get employee
        var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
            throw new KeyNotFoundException($"Employee with ID {request.EmployeeId} not found");

        // Parse category
        var category = ORCategoryHelper.FromString(request.Category);

        // Check if already a member of this category
        var existingMembership = await _orMembershipRepository.GetByEmployeeIdAndCategoryAsync(
            request.EmployeeId, category, cancellationToken);
        
        if (existingMembership != null)
            throw new InvalidOperationException($"Employee is already a member of category {request.Category}");

        // Ensure works council exists for the technical unit
        var worksCouncil = await _worksCouncilRepository.GetByTechnicalBusinessUnitIdAsync(
            employee.TechnicalBusinessUnitId, cancellationToken);
        
        if (worksCouncil == null)
        {
            worksCouncil = new Domain.Entities.WorksCouncil(employee.TechnicalBusinessUnitId);
            worksCouncil = await _worksCouncilRepository.AddAsync(worksCouncil, cancellationToken);
        }

        // Get existing memberships to determine order
        var existingMemberships = await _orMembershipRepository.GetByTechnicalBusinessUnitIdAndCategoryAsync(
            employee.TechnicalBusinessUnitId, category, cancellationToken);
        
        var maxOrder = existingMemberships.Any() ? existingMemberships.Max(m => m.Order) : 0;

        // Create new membership
        var membership = new OrMembership(
            worksCouncil.Id,
            employee.TechnicalBusinessUnitId,
            request.EmployeeId,
            category,
            maxOrder + 1);

        await _orMembershipRepository.AddAsync(membership, cancellationToken);

        // Get all memberships for this employee to build the enriched response
        var allMemberships = await _orMembershipRepository.GetByEmployeeIdAsync(request.EmployeeId, cancellationToken);
        
        return MapEmployeeWithMemberships(employee, allMemberships);
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
