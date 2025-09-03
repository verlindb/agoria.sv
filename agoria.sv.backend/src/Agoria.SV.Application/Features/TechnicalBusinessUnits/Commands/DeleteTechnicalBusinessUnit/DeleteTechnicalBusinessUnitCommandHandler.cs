using Agoria.SV.Domain.Interfaces;
using MediatR;

namespace Agoria.SV.Application.Features.TechnicalBusinessUnits.Commands.DeleteTechnicalBusinessUnit;

public class DeleteTechnicalBusinessUnitCommandHandler : IRequestHandler<DeleteTechnicalBusinessUnitCommand, bool>
{
    private readonly ITechnicalBusinessUnitRepository _repository;

    public DeleteTechnicalBusinessUnitCommandHandler(ITechnicalBusinessUnitRepository repository)
    {
        _repository = repository;
    }

    public async Task<bool> Handle(DeleteTechnicalBusinessUnitCommand request, CancellationToken cancellationToken)
    {
        return await _repository.DeleteAsync(request.Id);
    }
}
