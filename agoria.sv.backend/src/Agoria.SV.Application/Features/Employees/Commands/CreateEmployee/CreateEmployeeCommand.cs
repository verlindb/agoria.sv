using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.Employees.Commands.CreateEmployee;

public record CreateEmployeeCommand(
    Guid TechnicalBusinessUnitId,
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string Role,
    DateTime StartDate
) : IRequest<EmployeeDto>;
