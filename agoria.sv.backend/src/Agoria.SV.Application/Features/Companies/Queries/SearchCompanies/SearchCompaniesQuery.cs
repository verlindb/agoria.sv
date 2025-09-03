using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.Companies.Queries.SearchCompanies;

public record SearchCompaniesQuery(
    string? SearchTerm,
    string? Type,
    string? Status,
    string? Sector,
    string? City,
    string? PostalCode,
    string? Country
) : IRequest<IEnumerable<CompanyDto>>;
