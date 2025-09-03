using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.TechnicalBusinessUnits.Queries.SearchTechnicalBusinessUnits;

public class SearchTechnicalBusinessUnitsQueryHandler : IRequestHandler<SearchTechnicalBusinessUnitsQuery, IEnumerable<TechnicalBusinessUnitDto>>
{
    private readonly ITechnicalBusinessUnitRepository _repository;
    private readonly IMapper _mapper;

    public SearchTechnicalBusinessUnitsQueryHandler(ITechnicalBusinessUnitRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<TechnicalBusinessUnitDto>> Handle(SearchTechnicalBusinessUnitsQuery request, CancellationToken cancellationToken)
    {
        var entities = await _repository.GetAllAsync();
        
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            entities = entities.Where(e => 
                e.Name.ToLower().Contains(searchTerm) ||
                e.Code.ToLower().Contains(searchTerm) ||
                e.Description.ToLower().Contains(searchTerm) ||
                e.Manager.ToLower().Contains(searchTerm) ||
                e.Department.ToLower().Contains(searchTerm) ||
                e.FodDossierBase.ToLower().Contains(searchTerm) ||
                (e.Location?.City != null && e.Location.City.ToLower().Contains(searchTerm)) ||
                (e.Location?.Street != null && e.Location.Street.ToLower().Contains(searchTerm)) ||
                (e.Company?.Name != null && e.Company.Name.ToLower().Contains(searchTerm))
            );
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            entities = entities.Where(e => e.Status.ToLower() == request.Status.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(request.Department))
        {
            entities = entities.Where(e => e.Department.ToLower().Contains(request.Department.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(request.Language))
        {
            entities = entities.Where(e => e.Language.ToLower() == request.Language.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(request.City))
        {
            entities = entities.Where(e => e.Location?.City != null && e.Location.City.ToLower().Contains(request.City.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(request.PostalCode))
        {
            entities = entities.Where(e => e.Location?.PostalCode != null && e.Location.PostalCode.Contains(request.PostalCode));
        }

        if (!string.IsNullOrWhiteSpace(request.Country))
        {
            entities = entities.Where(e => e.Location?.Country != null && e.Location.Country.ToLower().Contains(request.Country.ToLower()));
        }

        return _mapper.Map<IEnumerable<TechnicalBusinessUnitDto>>(entities);
    }
}
