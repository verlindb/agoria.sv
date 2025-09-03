using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.WorksCouncil.Commands.AddMember;

public record AddMemberCommand(
    Guid EmployeeId,
    string Category
) : IRequest<EmployeeDto>;
