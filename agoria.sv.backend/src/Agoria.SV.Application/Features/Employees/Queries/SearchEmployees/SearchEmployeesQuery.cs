using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.Employees.Queries.SearchEmployees;

public record SearchEmployeesQuery(
    string? SearchTerm = null,
    string? TechnicalBusinessUnitId = null,
    string? Role = null,
    string? Status = null,
    string? Email = null
) : IRequest<IEnumerable<EmployeeDto>>;
