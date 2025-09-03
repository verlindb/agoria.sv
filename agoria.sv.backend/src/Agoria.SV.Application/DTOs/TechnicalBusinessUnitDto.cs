namespace Agoria.SV.Application.DTOs;

public record TechnicalBusinessUnitDto(
    Guid Id,
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
    ElectionBodiesDto ElectionBodies,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
