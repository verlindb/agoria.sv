using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.TechnicalBusinessUnits.Queries.GetAllTechnicalBusinessUnits;

public class GetAllTechnicalBusinessUnitsQueryHandler : IRequestHandler<GetAllTechnicalBusinessUnitsQuery, IEnumerable<TechnicalBusinessUnitDto>>
{
    private readonly ITechnicalBusinessUnitRepository _repository;
    private readonly IMapper _mapper;

    public GetAllTechnicalBusinessUnitsQueryHandler(ITechnicalBusinessUnitRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<TechnicalBusinessUnitDto>> Handle(GetAllTechnicalBusinessUnitsQuery request, CancellationToken cancellationToken)
    {
        var technicalUnits = await _repository.GetAllAsync();
        return _mapper.Map<IEnumerable<TechnicalBusinessUnitDto>>(technicalUnits);
    }
}
