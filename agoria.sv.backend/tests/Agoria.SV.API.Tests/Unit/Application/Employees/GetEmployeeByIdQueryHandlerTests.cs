using Xunit;
using Agoria.SV.Application.DTOs;
using Agoria.SV.Application.Features.Employees.Queries.GetEmployeeById;
using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using AutoMapper;
using FluentAssertions;
using Moq;

namespace Agoria.SV.API.Tests.Unit.Application.Employees;

public class GetEmployeeByIdQueryHandlerTests
{
    private readonly Mock<IEmployeeRepository> _mockRepository;
    private readonly Mock<IMapper> _mockMapper;
    private readonly GetEmployeeByIdQueryHandler _handler;

    public GetEmployeeByIdQueryHandlerTests()
    {
        _mockRepository = new Mock<IEmployeeRepository>();
        _mockMapper = new Mock<IMapper>();
        _handler = new GetEmployeeByIdQueryHandler(_mockRepository.Object, _mockMapper.Object);
    }

    [Fact]
    public async Task Handle_WithValidId_ShouldReturnMappedEmployee()
    {
        // Arrange
        var employeeId = Guid.NewGuid();
        var employee = new Employee 
        { 
            Id = employeeId, 
            FirstName = "John", 
            LastName = "Doe", 
            Email = "john.doe@example.com" 
        };
        var employeeDto = new EmployeeDto 
        { 
            Id = employeeId, 
            FirstName = "John", 
            LastName = "Doe", 
            Email = "john.doe@example.com" 
        };

        _mockRepository.Setup(r => r.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);
        _mockMapper.Setup(m => m.Map<EmployeeDto>(employee))
            .Returns(employeeDto);

        var query = new GetEmployeeByIdQuery(employeeId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(employeeDto);
        
        _mockRepository.Verify(r => r.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()), Times.Once);
        _mockMapper.Verify(m => m.Map<EmployeeDto>(employee), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentId_ShouldReturnNull()
    {
        // Arrange
        var employeeId = Guid.NewGuid();

        _mockRepository.Setup(r => r.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Employee)null);

        var query = new GetEmployeeByIdQuery(employeeId);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().BeNull();
        
        _mockRepository.Verify(r => r.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()), Times.Once);
        _mockMapper.Verify(m => m.Map<EmployeeDto>(It.IsAny<Employee>()), Times.Never);
    }
}