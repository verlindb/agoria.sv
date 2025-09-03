using Xunit;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Application.Features.Employees.Queries.GetAllEmployees;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using AutoMapper;
using FluentAssertions;
using Moq;

namespace Agoria.SV.API.Tests.Unit.Application.Employees;

public class GetAllEmployeesQueryHandlerTests
{
    private readonly Mock<IEmployeeRepository> _mockRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly GetAllEmployeesQueryHandler _handler;

    public GetAllEmployeesQueryHandlerTests()
    {
        _mockRepository = new Mock<IEmployeeRepository>();
        _mockMapper = new Mock<IMapper>();
        _handler = new GetAllEmployeesQueryHandler(_mockRepository.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnMappedEmployees()
    {
        // Arrange
        var employees = new List<Employee>
        {
            new() { Id = Guid.NewGuid(), FirstName = "John", LastName = "Doe", Email = "john.doe@example.com" },
            new() { Id = Guid.NewGuid(), FirstName = "Jane", LastName = "Smith", Email = "jane.smith@example.com" }
        };

        var employeeDtos = new List<EmployeeDto>
        {
            new() { Id = employees[0].Id, FirstName = "John", LastName = "Doe", Email = "john.doe@example.com" },
            new() { Id = employees[1].Id, FirstName = "Jane", LastName = "Smith", Email = "jane.smith@example.com" }
        };

        _mockRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(employees);
        _mockMapper.Setup(m => m.Map<IEnumerable<EmployeeDto>>(employees))
            .Returns(employeeDtos);

        var query = new GetAllEmployeesQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(employeeDtos);
        
        _mockRepository.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
        _mockMapper.Verify(m => m.Map<IEnumerable<EmployeeDto>>(employees), Times.Once);
    }

    [Fact]
    public async Task Handle_WithEmptyRepository_ShouldReturnEmptyCollection()
    {
        // Arrange
        var emptyEmployees = new List<Employee>();
        var emptyEmployeeDtos = new List<EmployeeDto>();

        _mockRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(emptyEmployees);
        _mockMapper.Setup(m => m.Map<IEnumerable<EmployeeDto>>(emptyEmployees))
            .Returns(emptyEmployeeDtos);

        var query = new GetAllEmployeesQuery();

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }
}