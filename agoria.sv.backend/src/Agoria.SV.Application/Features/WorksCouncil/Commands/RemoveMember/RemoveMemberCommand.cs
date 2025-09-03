using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.WorksCouncil.Commands.RemoveMember;

public record RemoveMemberCommand(
    Guid EmployeeId,
    string Category
) : IRequest<EmployeeDto>;
