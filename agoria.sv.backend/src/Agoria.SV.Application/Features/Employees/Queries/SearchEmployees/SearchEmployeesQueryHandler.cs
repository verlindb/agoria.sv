using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.Employees.Queries.SearchEmployees;

public class SearchEmployeesQueryHandler : IRequestHandler<SearchEmployeesQuery, IEnumerable<EmployeeDto>>
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IMapper _mapper;

    public SearchEmployeesQueryHandler(IEmployeeRepository employeeRepository, IMapper mapper)
    {
        _employeeRepository = employeeRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<EmployeeDto>> Handle(SearchEmployeesQuery request, CancellationToken cancellationToken)
    {
        // Get all employees with includes
        var allEmployees = await _employeeRepository.GetAllAsync(cancellationToken);
        var entities = allEmployees.AsQueryable();

        // Apply search term filter
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            entities = entities.Where(e =>
                (e.FirstName != null && e.FirstName.ToLower().Contains(searchTerm)) ||
                (e.LastName != null && e.LastName.ToLower().Contains(searchTerm)) ||
                (e.Email != null && e.Email.ToLower().Contains(searchTerm)) ||
                (e.Phone != null && e.Phone.ToLower().Contains(searchTerm)) ||
                (e.Role != null && e.Role.ToLower().Contains(searchTerm))
            );
        }

        // Apply technical business unit filter
        if (!string.IsNullOrWhiteSpace(request.TechnicalBusinessUnitId) && Guid.TryParse(request.TechnicalBusinessUnitId, out var unitId))
        {
            entities = entities.Where(e => e.TechnicalBusinessUnitId == unitId);
        }

        // Apply role filter
        if (!string.IsNullOrWhiteSpace(request.Role))
        {
            entities = entities.Where(e => e.Role != null && e.Role.ToLower().Contains(request.Role.ToLower()));
        }

        // Apply status filter
        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            entities = entities.Where(e => e.Status.ToLower() == request.Status.ToLower());
        }

        // Apply email filter
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            entities = entities.Where(e => e.Email != null && e.Email.ToLower().Contains(request.Email.ToLower()));
        }

        var results = entities.ToList();
        return _mapper.Map<IEnumerable<EmployeeDto>>(results);
    }
}
