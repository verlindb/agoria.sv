using Xunit;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Application.Features.Employees.Queries.SearchEmployees;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using AutoMapper;
using FluentAssertions;
using Moq;

namespace Agoria.SV.API.Tests.Unit.Application.Employees;

public class SearchEmployeesQueryHandlerTests
{
    private readonly Mock<IEmployeeRepository> _mockRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly SearchEmployeesQueryHandler _handler;

    public SearchEmployeesQueryHandlerTests()
    {
        _mockRepository = new Mock<IEmployeeRepository>();
        _mockMapper = new Mock<IMapper>();
        _handler = new SearchEmployeesQueryHandler(_mockRepository.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task Handle_WithSearchTerm_ShouldReturnFilteredEmployees()
    {
        // Arrange
        var searchTerm = "John";
        var employees = new List<Employee>
        {
            new() { Id = Guid.NewGuid(), FirstName = "John", LastName = "Doe", Email = "john.doe@example.com" },
            new() { Id = Guid.NewGuid(), FirstName = "Johnny", LastName = "Smith", Email = "johnny.smith@example.com" }
        };

        var employeeDtos = new List<EmployeeDto>
        {
            new() { Id = employees[0].Id, FirstName = "John", LastName = "Doe", Email = "john.doe@example.com" },
            new() { Id = employees[1].Id, FirstName = "Johnny", LastName = "Smith", Email = "johnny.smith@example.com" }
        };

        _mockRepository.Setup(r => r.SearchAsync(searchTerm, null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employees);
        _mockMapper.Setup(m => m.Map<IEnumerable<EmployeeDto>>(employees))
            .Returns(employeeDtos);

        var query = new SearchEmployeesQuery(searchTerm, null, null, null, null);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(employeeDtos);
        
        _mockRepository.Verify(r => r.SearchAsync(searchTerm, null, null, null, null, It.IsAny<CancellationToken>()), Times.Once);
        _mockMapper.Verify(m => m.Map<IEnumerable<EmployeeDto>>(employees), Times.Once);
    }

    [Fact]
    public async Task Handle_WithAllFilters_ShouldPassAllParametersToRepository()
    {
        // Arrange
        var searchTerm = "Dev";
        var technicalBusinessUnitId = Guid.NewGuid().ToString();
        var role = "Developer";
        var status = "Active";
        var email = "dev@example.com";

        var employees = new List<Employee>();
        var employeeDtos = new List<EmployeeDto>();

        _mockRepository.Setup(r => r.SearchAsync(searchTerm, technicalBusinessUnitId, role, status, email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employees);
        _mockMapper.Setup(m => m.Map<IEnumerable<EmployeeDto>>(employees))
            .Returns(employeeDtos);

        var query = new SearchEmployeesQuery(searchTerm, technicalBusinessUnitId, role, status, email);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        
        _mockRepository.Verify(r => r.SearchAsync(searchTerm, technicalBusinessUnitId, role, status, email, It.IsAny<CancellationToken>()), Times.Once);
        _mockMapper.Verify(m => m.Map<IEnumerable<EmployeeDto>>(employees), Times.Once);
    }
}