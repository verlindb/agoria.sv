using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Domain.ValueObjects;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.TechnicalBusinessUnits.Commands.CreateTechnicalBusinessUnit;

public class CreateTechnicalBusinessUnitCommandHandler : IRequestHandler<CreateTechnicalBusinessUnitCommand, TechnicalBusinessUnitDto>
{
    private readonly ITechnicalBusinessUnitRepository _repository;
    private readonly IMapper _mapper;

    public CreateTechnicalBusinessUnitCommandHandler(ITechnicalBusinessUnitRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<TechnicalBusinessUnitDto> Handle(CreateTechnicalBusinessUnitCommand request, CancellationToken cancellationToken)
    {
        var technicalUnit = new TechnicalBusinessUnit
        {
            CompanyId = request.CompanyId,
            Name = request.Name,
            Code = request.Code,
            Description = request.Description,
            NumberOfEmployees = request.NumberOfEmployees,
            Manager = request.Manager,
            Department = request.Department,
            Location = new Address(
                request.Location.Street,
                request.Location.Number,
                request.Location.PostalCode,
                request.Location.City,
                request.Location.Country
            ),
            Status = request.Status,
            Language = request.Language,
            PcWorkers = request.PcWorkers,
            PcClerks = request.PcClerks,
            FodDossierBase = request.FodDossierBase,
            FodDossierSuffix = request.FodDossierSuffix,
            ElectionBodies = new ElectionBodies(
                request.ElectionBodies.Cpbw,
                request.ElectionBodies.Or,
                request.ElectionBodies.SdWorkers,
                request.ElectionBodies.SdClerks
            )
        };

        var created = await _repository.CreateAsync(technicalUnit);
        return _mapper.Map<TechnicalBusinessUnitDto>(created);
    }
}
