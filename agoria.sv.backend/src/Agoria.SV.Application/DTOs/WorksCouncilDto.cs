namespace Agoria.SV.Application.DTOs;

public record WorksCouncilDto(
    Guid Id,
    Guid TechnicalBusinessUnitId,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
