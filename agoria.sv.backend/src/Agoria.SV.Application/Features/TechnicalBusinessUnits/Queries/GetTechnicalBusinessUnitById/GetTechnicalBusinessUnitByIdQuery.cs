using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.TechnicalBusinessUnits.Queries.GetTechnicalBusinessUnitById;

public record GetTechnicalBusinessUnitByIdQuery(Guid Id) : IRequest<TechnicalBusinessUnitDto?>;
