using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Agoria.SV.Application.Features.Employees.Queries.SearchEmployees;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Domain.Entities;
using AutoMapper;
using FluentAssertions;
using Moq;
using Xunit;

namespace Agoria.SV.Application.Tests;

public class SearchEmployeesQueryHandlerTests
{
    [Fact]
    public async Task Handle_WithSearchTerm_ShouldFilterAndMap()
    {
        var repoMock = new Mock<Agoria.SV.Domain.Interfaces.IEmployeeRepository>();
        var mapperMock = new Mock<IMapper>();

        var employees = new List<Employee>
        {
            new Employee(Guid.NewGuid(), "John", "Doe", "john@example.com", "123", "dev", DateTime.UtcNow),
            new Employee(Guid.NewGuid(), "Jane", "Smith", "jane@example.com", "456", "qa", DateTime.UtcNow)
        };

        // set ids via reflection where necessary
        typeof(Employee).GetProperty("Id")!.SetValue(employees[0], Guid.NewGuid());
        typeof(Employee).GetProperty("Id")!.SetValue(employees[1], Guid.NewGuid());

        repoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(employees);

        mapperMock.Setup(m => m.Map<IEnumerable<EmployeeDto>>(It.IsAny<IEnumerable<Employee>>()))
            .Returns((IEnumerable<Employee> src) => src.Select(e => new EmployeeDto { Id = e.Id, FirstName = e.FirstName, LastName = e.LastName }));

        var handler = new SearchEmployeesQueryHandler(repoMock.Object, mapperMock.Object);
        var query = new SearchEmployeesQuery("john", null, null, null, null);

        var result = await handler.Handle(query, CancellationToken.None);

        result.Should().ContainSingle().Which.FirstName.Should().Be("John");
    }
}
