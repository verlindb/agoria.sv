using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.Employees.Queries.GetAllEmployees;

public record GetAllEmployeesQuery() : IRequest<IEnumerable<EmployeeDto>>;
