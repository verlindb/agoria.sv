using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.TechnicalBusinessUnits.Queries.SearchTechnicalBusinessUnits;

public record SearchTechnicalBusinessUnitsQuery(
    string? SearchTerm,
    string? Status,
    string? Department,
    string? Language,
    string? City,
    string? PostalCode,
    string? Country
) : IRequest<IEnumerable<TechnicalBusinessUnitDto>>;
