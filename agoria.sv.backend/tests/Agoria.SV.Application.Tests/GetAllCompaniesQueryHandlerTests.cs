using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Agoria.SV.Application.Features.Companies.Queries.GetAllCompanies;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using AutoMapper;
using FluentAssertions;
using Moq;
using Xunit;

namespace Agoria.SV.Application.Tests;

public class GetAllCompaniesQueryHandlerTests
{
    [Fact]
    public async Task Handle_ReturnsMappedCompanies()
    {
        var repoMock = new Mock<Agoria.SV.Domain.Interfaces.ICompanyRepository>();
        var mapperMock = new Mock<IMapper>();

        var companies = new List<Company> { new Company { Id = Guid.NewGuid(), Name = "X" } };
        repoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(companies);

        mapperMock.Setup(m => m.Map<IEnumerable<CompanyDto>>(It.IsAny<IEnumerable<Company>>()))
            .Returns(new List<CompanyDto>());

        var handler = new GetAllCompaniesQueryHandler(repoMock.Object, mapperMock.Object);
        var query = new GetAllCompaniesQuery();

        var result = await handler.Handle(query, CancellationToken.None);
        result.Should().NotBeNull();
    }
}
