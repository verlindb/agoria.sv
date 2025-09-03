using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Interfaces;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.Companies.Queries.SearchCompanies;

public class SearchCompaniesQueryHandler : IRequestHandler<SearchCompaniesQuery, IEnumerable<CompanyDto>>
{
    private readonly ICompanyRepository _repository;
    private readonly IMapper _mapper;

    public SearchCompaniesQueryHandler(ICompanyRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<CompanyDto>> Handle(SearchCompaniesQuery request, CancellationToken cancellationToken)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            entities = entities.Where(e => 
                e.Name.ToLower().Contains(searchTerm) ||
                e.LegalName.ToLower().Contains(searchTerm) ||
                e.Ondernemingsnummer.ToLower().Contains(searchTerm) ||
                e.ContactPerson.FirstName.ToLower().Contains(searchTerm) ||
                e.ContactPerson.LastName.ToLower().Contains(searchTerm) ||
                e.ContactPerson.Email.ToLower().Contains(searchTerm) ||
                e.Address.Street.ToLower().Contains(searchTerm) ||
                e.Address.City.ToLower().Contains(searchTerm)
            );
        }

        if (!string.IsNullOrWhiteSpace(request.Type))
        {
            entities = entities.Where(e => e.Type.Equals(request.Type, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            entities = entities.Where(e => e.Status.Equals(request.Status, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(request.Sector))
        {
            entities = entities.Where(e => e.Sector.Equals(request.Sector, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(request.City))
        {
            entities = entities.Where(e => e.Address.City.Equals(request.City, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(request.PostalCode))
        {
            entities = entities.Where(e => e.Address.PostalCode.Equals(request.PostalCode, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(request.Country))
        {
            entities = entities.Where(e => e.Address.Country.Equals(request.Country, StringComparison.OrdinalIgnoreCase));
        }

        return _mapper.Map<IEnumerable<CompanyDto>>(entities);
    }
}
