using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.Companies.Commands.CreateCompany;

public record CreateCompanyCommand(
    string Name,
    string LegalName,
    string Ondernemingsnummer,
    string Type,
    string Sector,
    int NumberOfEmployees,
    AddressDto Address,
    ContactPersonDto ContactPerson
) : IRequest<CompanyDto>;
