using MediatR;

namespace Agoria.SV.Application.Features.Companies.Commands.DeleteCompany;

public record DeleteCompanyCommand(Guid Id) : IRequest<bool>;
