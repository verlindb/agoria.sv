using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Agoria.SV.Application.Features.Companies.Queries.SearchCompanies;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using AutoMapper;
using FluentAssertions;
using Moq;
using Xunit;

namespace Agoria.SV.Application.Tests;

public class SearchCompaniesQueryHandlerTests
{
    [Fact]
    public async Task Handle_WithEmptySearch_ReturnsAllMapped()
    {
        var repoMock = new Mock<Agoria.SV.Domain.Interfaces.ICompanyRepository>();
        var mapperMock = new Mock<IMapper>();

        var companies = new List<Company>
        {
            new Company { Id = Guid.NewGuid(), Name = "A" },
            new Company { Id = Guid.NewGuid(), Name = "B" }
        };

        repoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(companies);
        mapperMock.Setup(m => m.Map<IEnumerable<CompanyDto>>(It.IsAny<IEnumerable<Company>>()))
            .Returns((IEnumerable<Company> src) => src.Select(c => new CompanyDto(c.Id, c.Name, c.LegalName ?? string.Empty, c.Ondernemingsnummer ?? string.Empty, c.Type ?? string.Empty, c.Status ?? string.Empty, c.Sector ?? string.Empty, c.NumberOfEmployees, new AddressDto("","","","",""), new ContactPersonDto("","","","",null), c.CreatedAt, c.UpdatedAt)));

    var handler = new SearchCompaniesQueryHandler(repoMock.Object, mapperMock.Object);
    var query = new SearchCompaniesQuery(null, null, null, null, null, null, null);

        var result = await handler.Handle(query, CancellationToken.None);

        result.Should().HaveCount(2);
    }
}
