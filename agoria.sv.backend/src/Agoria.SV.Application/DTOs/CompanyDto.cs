namespace Agoria.SV.Application.DTOs;

public record CompanyDto(
    Guid Id,
    string Name,
    string LegalName,
    string Ondernemingsnummer,
    string Type,
    string Status,
    string Sector,
    int NumberOfEmployees,
    AddressDto Address,
    ContactPersonDto ContactPerson,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
