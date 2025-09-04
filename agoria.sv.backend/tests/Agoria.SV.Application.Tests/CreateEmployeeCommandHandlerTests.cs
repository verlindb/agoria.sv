using System;
using System.Threading;
using System.Threading.Tasks;
using Agoria.SV.Application.Features.Employees.Commands.CreateEmployee;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using AutoMapper;
using FluentAssertions;
using Moq;
using Xunit;

namespace Agoria.SV.Application.Tests;

public class CreateEmployeeCommandHandlerTests
{
    [Fact]
    public async Task Handle_ShouldCallRepositoryAndReturnDto()
    {
        var repoMock = new Mock<Agoria.SV.Domain.Interfaces.IEmployeeRepository>();
        var mapperMock = new Mock<IMapper>();

        var command = new CreateEmployeeCommand(Guid.NewGuid(), "F", "L", "e@x.com", "p", "role", DateTime.UtcNow);

        var created = new Employee(command.TechnicalBusinessUnitId, command.FirstName, command.LastName, command.Email, command.Phone, command.Role, command.StartDate)
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        repoMock.Setup(r => r.AddAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>())).ReturnsAsync(created).Verifiable();

        var dto = new EmployeeDto { Id = created.Id, FirstName = created.FirstName, LastName = created.LastName };
        mapperMock.Setup(m => m.Map<EmployeeDto>(created)).Returns(dto);

        var handler = new CreateEmployeeCommandHandler(repoMock.Object, mapperMock.Object);

        var result = await handler.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.Id.Should().Be(created.Id);
        repoMock.Verify();
    }
}
