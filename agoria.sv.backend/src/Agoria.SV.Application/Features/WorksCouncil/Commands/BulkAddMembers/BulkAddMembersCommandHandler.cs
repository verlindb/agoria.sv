using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Domain.ValueObjects;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.WorksCouncil.Commands.BulkAddMembers;

public class BulkAddMembersCommandHandler : IRequestHandler<BulkAddMembersCommand, IEnumerable<EmployeeDto>>
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IWorksCouncilRepository _worksCouncilRepository;
    private readonly IOrMembershipRepository _orMembershipRepository;
    private readonly IMapper _mapper;

    public BulkAddMembersCommandHandler(
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

    public async Task<IEnumerable<EmployeeDto>> Handle(BulkAddMembersCommand request, CancellationToken cancellationToken)
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

        // Ensure works council exists
        var worksCouncil = await _worksCouncilRepository.GetByTechnicalBusinessUnitIdAsync(
            request.TechnicalBusinessUnitId, cancellationToken);
        
        if (worksCouncil == null)
        {
            worksCouncil = new Domain.Entities.WorksCouncil(request.TechnicalBusinessUnitId);
            worksCouncil = await _worksCouncilRepository.AddAsync(worksCouncil, cancellationToken);
        }

        // Get existing memberships for this category
        var existingMemberships = await _orMembershipRepository.GetByTechnicalBusinessUnitIdAndCategoryAsync(
            request.TechnicalBusinessUnitId, category, cancellationToken);
        
        var existingEmployeeIds = existingMemberships.Select(m => m.EmployeeId).ToHashSet();
        var maxOrder = existingMemberships.Any() ? existingMemberships.Max(m => m.Order) : 0;

        // Create new memberships for employees not already in this category
        var newMemberships = new List<OrMembership>();
        var orderCounter = maxOrder;

        foreach (var employee in validEmployees)
        {
            if (!existingEmployeeIds.Contains(employee.Id))
            {
                orderCounter++;
                newMemberships.Add(new OrMembership(
                    worksCouncil.Id,
                    request.TechnicalBusinessUnitId,
                    employee.Id,
                    category,
                    orderCounter));
            }
        }

        // Bulk add new memberships
        if (newMemberships.Any())
        {
            await _orMembershipRepository.BulkAddAsync(newMemberships, cancellationToken);
        }

        // Get all memberships for affected employees to build enriched response
        var result = new List<EmployeeDto>();
        foreach (var employee in validEmployees)
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
