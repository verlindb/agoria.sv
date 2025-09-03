using Agoria.SV.Application.DTOs;
using MediatR;

namespace Agoria.SV.Application.Features.Companies.Queries.GetAllCompanies;

public record GetAllCompaniesQuery : IRequest<IEnumerable<CompanyDto>>;
