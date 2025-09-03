using Agoria.SV.Domain.Interfaces;
using MediatR;

namespace Agoria.SV.Application.Features.Companies.Commands.DeleteCompany;

public class DeleteCompanyCommandHandler : IRequestHandler<DeleteCompanyCommand, bool>
{
    private readonly ICompanyRepository _repository;

    public DeleteCompanyCommandHandler(ICompanyRepository repository)
    {
        _repository = repository;
    }

    public async Task<bool> Handle(DeleteCompanyCommand request, CancellationToken cancellationToken)
    {
        if (!await _repository.ExistsAsync(request.Id, cancellationToken))
            return false;

        await _repository.DeleteAsync(request.Id, cancellationToken);
        return true;
    }
}
