using System;
using System.Threading;
using System.Threading.Tasks;
using Agoria.SV.Application.Features.Companies.Commands.CreateCompany;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.ValueObjects;
using AutoMapper;
using FluentAssertions;
using Moq;
using Xunit;

namespace Agoria.SV.Application.Tests;

public class CreateCompanyCommandHandlerTests
{
    [Fact]
    public async Task Handle_ShouldCallRepositoryAndReturnDto()
    {
        var repoMock = new Mock<Agoria.SV.Domain.Interfaces.ICompanyRepository>();
        var mapperMock = new Mock<IMapper>();

        var command = new CreateCompanyCommand(
            "TestCo",
            "TestCo NV",
            "BE0000000001",
            "T",
            "IT",
            5,
            new Agoria.SV.Application.DTOs.AddressDto("S","1","1000","C","Country"),
            new Agoria.SV.Application.DTOs.ContactPersonDto("F","L","f@l","0", null)
        );

        var createdEntity = new Company
        {
            Id = Guid.NewGuid(),
            Name = command.Name,
            LegalName = command.LegalName,
            Ondernemingsnummer = command.Ondernemingsnummer,
            Type = command.Type,
            Sector = command.Sector,
            NumberOfEmployees = command.NumberOfEmployees,
            Address = new Address(command.Address.Street, command.Address.Number, command.Address.PostalCode, command.Address.City, command.Address.Country),
            ContactPerson = new ContactPerson(command.ContactPerson.FirstName, command.ContactPerson.LastName, command.ContactPerson.Email, command.ContactPerson.Phone, command.ContactPerson.Function),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        repoMock.Setup(r => r.AddAsync(It.IsAny<Company>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(createdEntity)
                .Verifiable();

        var expectedDto = new Agoria.SV.Application.DTOs.CompanyDto(
            createdEntity.Id,
            createdEntity.Name,
            createdEntity.LegalName,
            createdEntity.Ondernemingsnummer,
            createdEntity.Type,
            "active",
            createdEntity.Sector,
            createdEntity.NumberOfEmployees,
            new Agoria.SV.Application.DTOs.AddressDto(createdEntity.Address.Street, createdEntity.Address.Number, createdEntity.Address.PostalCode, createdEntity.Address.City, createdEntity.Address.Country),
            new Agoria.SV.Application.DTOs.ContactPersonDto(createdEntity.ContactPerson.FirstName, createdEntity.ContactPerson.LastName, createdEntity.ContactPerson.Email, createdEntity.ContactPerson.Phone, createdEntity.ContactPerson.Function),
            createdEntity.CreatedAt,
            createdEntity.UpdatedAt
        );
        mapperMock.Setup(m => m.Map<Agoria.SV.Application.DTOs.CompanyDto>(createdEntity)).Returns(expectedDto);

        var handler = new CreateCompanyCommandHandler(repoMock.Object, mapperMock.Object);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.Id.Should().Be(createdEntity.Id);
        result.Name.Should().Be(command.Name);

        repoMock.Verify();
    }

    [Fact]
    public async Task Handle_WithMissingRequiredFields_ShouldThrow()
    {
        var repoMock = new Mock<Agoria.SV.Domain.Interfaces.ICompanyRepository>();
        var mapperMock = new Mock<IMapper>();

    // CreateCompanyCommand is a record with positional args — an empty instance can't be constructed that way.
    // Instead, simulate invalid input by passing empty strings where required.
    var command = new CreateCompanyCommand("", "", "", "", "", 0, new Agoria.SV.Application.DTOs.AddressDto("", "", "", "", ""), new Agoria.SV.Application.DTOs.ContactPersonDto("", "", "", "", null));

        var handler = new CreateCompanyCommandHandler(repoMock.Object, mapperMock.Object);

    await Assert.ThrowsAsync<ArgumentException>(async () => await handler.Handle(command, CancellationToken.None));
    }
}
