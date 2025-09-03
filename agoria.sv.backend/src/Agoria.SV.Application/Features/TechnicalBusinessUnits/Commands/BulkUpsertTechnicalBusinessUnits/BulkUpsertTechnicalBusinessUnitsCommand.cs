using Agoria.SV.Application.DTOs;
using Agoria.SV.Application.Features.TechnicalBusinessUnits.Commands.CreateTechnicalBusinessUnit;
using MediatR;

namespace Agoria.SV.Application.Features.TechnicalBusinessUnits.Commands.BulkUpsertTechnicalBusinessUnits;

public record BulkUpsertTechnicalBusinessUnitsCommand(
    IEnumerable<CreateTechnicalBusinessUnitCommand> TechnicalBusinessUnits
) : IRequest<IEnumerable<TechnicalBusinessUnitDto>>;
