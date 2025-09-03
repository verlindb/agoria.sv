using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Domain.ValueObjects;
using AutoMapper;
using MediatR;

namespace Agoria.SV.Application.Features.Companies.Commands.UpdateCompany;

public class UpdateCompanyCommandHandler : IRequestHandler<UpdateCompanyCommand, CompanyDto>
{
    private readonly ICompanyRepository _repository;
    private readonly IMapper _mapper;

    public UpdateCompanyCommandHandler(ICompanyRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<CompanyDto> Handle(UpdateCompanyCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new KeyNotFoundException($"Company with id {request.Id} not found");

        entity.Name = request.Name;
        entity.LegalName = request.LegalName;
        entity.Ondernemingsnummer = request.Ondernemingsnummer;
        entity.Type = request.Type;
        entity.Status = request.Status;
        entity.Sector = request.Sector;
        entity.NumberOfEmployees = request.NumberOfEmployees;
        entity.Address = new Address(
            request.Address.Street,
            request.Address.Number,
            request.Address.PostalCode,
            request.Address.City,
            request.Address.Country
        );
        entity.ContactPerson = new ContactPerson(
            request.ContactPerson.FirstName,
            request.ContactPerson.LastName,
            request.ContactPerson.Email,
            request.ContactPerson.Phone,
            request.ContactPerson.Function
        );
        entity.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(entity, cancellationToken);
        return _mapper.Map<CompanyDto>(entity);
    }
}
