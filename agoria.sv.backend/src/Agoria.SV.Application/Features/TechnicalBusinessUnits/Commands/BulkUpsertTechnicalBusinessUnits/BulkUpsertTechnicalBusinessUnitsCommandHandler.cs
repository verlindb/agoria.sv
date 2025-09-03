using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Domain.ValueObjects;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.TechnicalBusinessUnits.Commands.BulkUpsertTechnicalBusinessUnits;

public class BulkUpsertTechnicalBusinessUnitsCommandHandler : IRequestHandler<BulkUpsertTechnicalBusinessUnitsCommand, IEnumerable<TechnicalBusinessUnitDto>>
{
    private readonly ITechnicalBusinessUnitRepository _repository;
    private readonly IMapper _mapper;

    public BulkUpsertTechnicalBusinessUnitsCommandHandler(
        ITechnicalBusinessUnitRepository repository,
        IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<TechnicalBusinessUnitDto>> Handle(BulkUpsertTechnicalBusinessUnitsCommand request, CancellationToken cancellationToken)
    {
        var technicalUnits = request.TechnicalBusinessUnits.Select(cmd => new TechnicalBusinessUnit
        {
            CompanyId = cmd.CompanyId,
            Name = cmd.Name,
            Code = cmd.Code,
            Description = cmd.Description,
            NumberOfEmployees = cmd.NumberOfEmployees,
            Manager = cmd.Manager,
            Department = cmd.Department,
            Location = new Address(
                cmd.Location.Street,
                cmd.Location.Number,
                cmd.Location.PostalCode,
                cmd.Location.City,
                cmd.Location.Country
            ),
            Status = cmd.Status,
            Language = cmd.Language,
            PcWorkers = cmd.PcWorkers,
            PcClerks = cmd.PcClerks,
            FodDossierBase = cmd.FodDossierBase,
            FodDossierSuffix = cmd.FodDossierSuffix,
            ElectionBodies = new ElectionBodies(
                cmd.ElectionBodies.Cpbw,
                cmd.ElectionBodies.Or,
                cmd.ElectionBodies.SdWorkers,
                cmd.ElectionBodies.SdClerks
            )
        }).ToList();

        var result = await _repository.BulkUpsertAsync(technicalUnits);
        return _mapper.Map<IEnumerable<TechnicalBusinessUnitDto>>(result);
    }
}
