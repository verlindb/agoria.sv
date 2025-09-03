namespace Agoria.SV.Application.DTOs;

public record ContactPersonDto(
    string FirstName,
    string LastName,
    string Email,
    string Phone,
    string? Function
);
