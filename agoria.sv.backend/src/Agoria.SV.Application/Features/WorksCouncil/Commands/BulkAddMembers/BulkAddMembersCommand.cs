using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.WorksCouncil.Commands.BulkAddMembers;

public record BulkAddMembersCommand(
    Guid TechnicalBusinessUnitId,
    IEnumerable<Guid> EmployeeIds,
    string Category
) : IRequest<IEnumerable<EmployeeDto>>;
