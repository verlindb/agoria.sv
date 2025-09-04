using System;
using System.Threading;
using System.Threading.Tasks;
using Agoria.SV.Application.Features.Employees.Commands.UpdateEmployee;
using Agoria.SV.Domain.Entities;
using AutoMapper;
using Moq;
using Xunit;

namespace Agoria.SV.Application.Tests;

public class ConcurrencyHandlerTests
{
    [Fact]
    public async Task UpdateEmployee_WhenRepositoryThrowsConcurrency_ShouldSurface()
    {
        var repoMock = new Mock<Agoria.SV.Domain.Interfaces.IEmployeeRepository>();
        var mapper = new Mock<IMapper>();

        var id = Guid.NewGuid();
        var existing = new Employee(Guid.NewGuid(), "A", "B", "a@b", "p", "r", DateTime.UtcNow);
        typeof(Employee).GetProperty("Id")!.SetValue(existing, id);

        repoMock.Setup(r => r.GetByIdAsync(id, It.IsAny<CancellationToken>())).ReturnsAsync(existing);
        repoMock.Setup(r => r.UpdateAsync(It.IsAny<Employee>(), It.IsAny<CancellationToken>())).ThrowsAsync(new InvalidOperationException("Concurrency conflict"));

        var handler = new UpdateEmployeeCommandHandler(repoMock.Object, mapper.Object);
        var command = new UpdateEmployeeCommand(id, existing.TechnicalBusinessUnitId, "A", "B", "a@b", "p", "r", DateTime.UtcNow, "active");

        await Assert.ThrowsAsync<InvalidOperationException>(() => handler.Handle(command, CancellationToken.None));
    }
}
