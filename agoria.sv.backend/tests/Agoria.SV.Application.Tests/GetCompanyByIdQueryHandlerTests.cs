#nullable enable
using System;
using System.Threading;
using System.Threading.Tasks;
using Agoria.SV.Application.Features.Companies.Queries.GetCompanyById;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using AutoMapper;
using FluentAssertions;
using Moq;
using Xunit;

namespace Agoria.SV.Application.Tests;

public class GetCompanyByIdQueryHandlerTests
{
    [Fact]
    public async Task Handle_WhenNotFound_ReturnsNull()
    {
        var repoMock = new Mock<Agoria.SV.Domain.Interfaces.ICompanyRepository>();
        var mapperMock = new Mock<IMapper>();
        repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((Company?)null);

        var handler = new GetCompanyByIdQueryHandler(repoMock.Object, mapperMock.Object);
        var query = new GetCompanyByIdQuery(Guid.NewGuid());

        var result = await handler.Handle(query, CancellationToken.None);
        result.Should().BeNull();
    }
}
