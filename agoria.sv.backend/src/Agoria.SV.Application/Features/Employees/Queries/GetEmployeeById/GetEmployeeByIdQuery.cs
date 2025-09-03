using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.Employees.Queries.GetEmployeeById;

public record GetEmployeeByIdQuery(Guid Id) : IRequest<EmployeeDto?>;
