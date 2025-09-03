using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Domain.ValueObjects;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.TechnicalBusinessUnits.Commands.UpdateTechnicalBusinessUnit;

public class UpdateTechnicalBusinessUnitCommandHandler : IRequestHandler<UpdateTechnicalBusinessUnitCommand, TechnicalBusinessUnitDto>
{
    private readonly ITechnicalBusinessUnitRepository _repository;
    private readonly IMapper _mapper;

    public UpdateTechnicalBusinessUnitCommandHandler(ITechnicalBusinessUnitRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<TechnicalBusinessUnitDto> Handle(UpdateTechnicalBusinessUnitCommand request, CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByIdAsync(request.Id);
        if (existing == null)
            throw new KeyNotFoundException($"TechnicalBusinessUnit with ID {request.Id} not found.");

        existing.CompanyId = request.CompanyId;
        existing.Name = request.Name;
        existing.Code = request.Code;
        existing.Description = request.Description;
        existing.NumberOfEmployees = request.NumberOfEmployees;
        existing.Manager = request.Manager;
        existing.Department = request.Department;
        existing.Location = new Address(
            request.Location.Street,
            request.Location.Number,
            request.Location.PostalCode,
            request.Location.City,
            request.Location.Country
        );
        existing.Status = request.Status;
        existing.Language = request.Language;
        existing.PcWorkers = request.PcWorkers;
        existing.PcClerks = request.PcClerks;
        existing.FodDossierBase = request.FodDossierBase;
        existing.FodDossierSuffix = request.FodDossierSuffix;
        existing.ElectionBodies = new ElectionBodies(
            request.ElectionBodies.Cpbw,
            request.ElectionBodies.Or,
            request.ElectionBodies.SdWorkers,
            request.ElectionBodies.SdClerks
        );

        var updated = await _repository.UpdateAsync(existing);
        return _mapper.Map<TechnicalBusinessUnitDto>(updated);
    }
}
