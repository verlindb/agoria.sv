using Agoria.SV.Application.DTOs;
using Agoria.SV.Application.Features.Employees.Commands.CreateEmployee;
using MediatR;

namespace Agoria.SV.Application.Features.Employees.Commands.BulkUpsertEmployees;

public record BulkUpsertEmployeesCommand(
    IEnumerable<CreateEmployeeCommand> Employees
) : IRequest<IEnumerable<EmployeeDto>>;
