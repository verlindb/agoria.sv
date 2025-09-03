using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.ValueObjects;
using AutoMapper;

namespace Agoria.SV.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Address, AddressDto>();
        CreateMap<ContactPerson, ContactPersonDto>();
        CreateMap<Company, CompanyDto>();
        CreateMap<ElectionBodies, ElectionBodiesDto>();
        CreateMap<TechnicalBusinessUnit, TechnicalBusinessUnitDto>();
        CreateMap<Employee, EmployeeDto>()
            .ForMember(dest => dest.OrMembership, opt => opt.Ignore()); // OR membership is handled separately in handlers
        CreateMap<WorksCouncil, WorksCouncilDto>();
        CreateMap<OrMembership, OrMembershipDto>()
            .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category.ToStringValue()));
    }
}
