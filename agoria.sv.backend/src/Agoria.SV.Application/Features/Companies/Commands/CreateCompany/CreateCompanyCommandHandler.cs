using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Domain.ValueObjects;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.Companies.Commands.CreateCompany;

public class CreateCompanyCommandHandler : IRequestHandler<CreateCompanyCommand, CompanyDto>
{
    private readonly ICompanyRepository _repository;
    private readonly IMapper _mapper;

    public CreateCompanyCommandHandler(ICompanyRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<CompanyDto> Handle(CreateCompanyCommand request, CancellationToken cancellationToken)
    {
        var entity = new Company
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            LegalName = request.LegalName,
            Ondernemingsnummer = request.Ondernemingsnummer,
            Type = request.Type,
            Status = "active",
            Sector = request.Sector,
            NumberOfEmployees = request.NumberOfEmployees,
            Address = new Address(
                request.Address.Street,
                request.Address.Number,
                request.Address.PostalCode,
                request.Address.City,
                request.Address.Country
            ),
            ContactPerson = new ContactPerson(
                request.ContactPerson.FirstName,
                request.ContactPerson.LastName,
                request.ContactPerson.Email,
                request.ContactPerson.Phone,
                request.ContactPerson.Function
            ),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity, cancellationToken);
        return _mapper.Map<CompanyDto>(created);
    }
}
