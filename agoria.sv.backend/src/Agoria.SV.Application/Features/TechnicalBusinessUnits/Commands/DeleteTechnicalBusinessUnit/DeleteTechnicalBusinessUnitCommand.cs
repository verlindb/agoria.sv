using MediatR;

namespace Agoria.SV.Application.Features.TechnicalBusinessUnits.Commands.DeleteTechnicalBusinessUnit;

public record DeleteTechnicalBusinessUnitCommand(Guid Id) : IRequest<bool>;
