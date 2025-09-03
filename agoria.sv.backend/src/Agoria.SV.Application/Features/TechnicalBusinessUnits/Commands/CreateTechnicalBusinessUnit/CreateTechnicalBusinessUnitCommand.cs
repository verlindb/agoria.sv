using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.TechnicalBusinessUnits.Commands.CreateTechnicalBusinessUnit;

public record CreateTechnicalBusinessUnitCommand(
    Guid CompanyId,
    string Name,
    string Code,
    string Description,
    int NumberOfEmployees,
    string Manager,
    string Department,
    AddressDto Location,
    string Status,
    string Language,
    string PcWorkers,
    string PcClerks,
    string FodDossierBase,
    string FodDossierSuffix,
    ElectionBodiesDto ElectionBodies
) : IRequest<TechnicalBusinessUnitDto>;
