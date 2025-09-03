using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.WorksCouncil.Commands.ReorderMembers;

public record ReorderMembersCommand(
    Guid TechnicalBusinessUnitId,
    string Category,
    IEnumerable<Guid> OrderedIds
) : IRequest<IEnumerable<EmployeeDto>>;
