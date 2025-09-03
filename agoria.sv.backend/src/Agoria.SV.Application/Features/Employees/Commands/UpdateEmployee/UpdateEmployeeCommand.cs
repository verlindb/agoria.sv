using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.Employees.Commands.UpdateEmployee;

public record UpdateEmployeeCommand(
    Guid Id,
    Guid TechnicalBusinessUnitId,
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string Role,
    DateTime StartDate,
    string Status
) : IRequest<EmployeeDto>;
