#nullable enable
using System;
using System.Threading;
using System.Threading.Tasks;
using Agoria.SV.Application.Features.Employees.Commands.UpdateEmployee;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using AutoMapper;
using FluentAssertions;
using Moq;
using Xunit;

namespace Agoria.SV.Application.Tests;

public class UpdateEmployeeCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenEmployeeNotFound_ShouldThrow()
    {
        var repoMock = new Mock<Agoria.SV.Domain.Interfaces.IEmployeeRepository>();
        var mapperMock = new Mock<IMapper>();

    repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((Agoria.SV.Domain.Entities.Employee?)null);

    var command = new UpdateEmployeeCommand(Guid.NewGuid(), Guid.NewGuid(), "F", "L", "e@x.com", "p", "role", DateTime.UtcNow, "active");
        var handler = new UpdateEmployeeCommandHandler(repoMock.Object, mapperMock.Object);

    await Assert.ThrowsAsync<System.Collections.Generic.KeyNotFoundException>(() => handler.Handle(command, CancellationToken.None));
    }
}
