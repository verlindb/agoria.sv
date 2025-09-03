using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.Companies.Commands.UpdateCompany;

public record UpdateCompanyCommand(
    Guid Id,
    string Name,
    string LegalName,
    string Ondernemingsnummer,
    string Type,
    string Status,
    string Sector,
    int NumberOfEmployees,
    AddressDto Address,
    ContactPersonDto ContactPerson
) : IRequest<CompanyDto>;
