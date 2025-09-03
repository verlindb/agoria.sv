using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.WorksCouncil.Commands.BulkRemoveMembers;

public record BulkRemoveMembersCommand(
    Guid TechnicalBusinessUnitId,
    IEnumerable<Guid> EmployeeIds,
    string Category
) : IRequest<IEnumerable<EmployeeDto>>;
