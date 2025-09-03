using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.WorksCouncil.Queries.GetMembers;

public record GetMembersQuery(
    Guid TechnicalBusinessUnitId,
    string? Category = null
) : IRequest<IEnumerable<EmployeeDto>>;
