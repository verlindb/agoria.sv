using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.TechnicalBusinessUnits.Queries.GetAllTechnicalBusinessUnits;

public record GetAllTechnicalBusinessUnitsQuery() : IRequest<IEnumerable<TechnicalBusinessUnitDto>>;
