using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.TechnicalBusinessUnits.Queries.GetTechnicalBusinessUnitById;

public class GetTechnicalBusinessUnitByIdQueryHandler : IRequestHandler<GetTechnicalBusinessUnitByIdQuery, TechnicalBusinessUnitDto?>
{
    private readonly ITechnicalBusinessUnitRepository _repository;
    private readonly IMapper _mapper;

    public GetTechnicalBusinessUnitByIdQueryHandler(ITechnicalBusinessUnitRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<TechnicalBusinessUnitDto?> Handle(GetTechnicalBusinessUnitByIdQuery request, CancellationToken cancellationToken)
    {
        var technicalUnit = await _repository.GetByIdAsync(request.Id);
        return technicalUnit == null ? null : _mapper.Map<TechnicalBusinessUnitDto>(technicalUnit);
    }
}
