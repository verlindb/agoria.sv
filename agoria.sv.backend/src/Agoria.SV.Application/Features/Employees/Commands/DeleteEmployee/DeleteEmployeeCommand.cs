using MediatR;

namespace Agoria.SV.Application.Features.Employees.Commands.DeleteEmployee;

public record DeleteEmployeeCommand(Guid Id) : IRequest<bool>;
