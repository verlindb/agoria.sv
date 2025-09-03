namespace Agoria.SV.Application.DTOs;

public record AddressDto(
    string Street,
    string Number,
    string PostalCode,
    string City,
    string Country
);
