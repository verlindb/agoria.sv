using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.Companies.Queries.GetCompanyById;

public record GetCompanyByIdQuery(Guid Id) : IRequest<CompanyDto?>;
