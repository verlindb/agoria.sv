using Agoria.SV.Domain.Entities;
using Agoria.SV.Domain.Interfaces;
using Agoria.SV.Domain.ValueObjects;
using FluentAssertions;
using Moq;

namespace Agoria.SV.Domain.Tests;

public class RepositoryInterfaceTests
{
    [Fact]
    public async Task ICompanyRepository_GetByIdAsync_ShouldReturnCompany_WhenCompanyExists()
    {
        // Arrange
        var companyId = Guid.NewGuid();
        var expectedCompany = CreateTestCompany(companyId);
        var mockRepository = new Mock<ICompanyRepository>();
        mockRepository.Setup(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()))
                     .ReturnsAsync(expectedCompany);

        // Act
        var result = await mockRepository.Object.GetByIdAsync(companyId);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(companyId);
        result.Name.Should().Be(expectedCompany.Name);
        mockRepository.Verify(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ICompanyRepository_GetByIdAsync_ShouldReturnNull_WhenCompanyDoesNotExist()
    {
        // Arrange
        var companyId = Guid.NewGuid();
        var mockRepository = new Mock<ICompanyRepository>();
        mockRepository.Setup(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()))
                     .ReturnsAsync((Company?)null);

        // Act
        var result = await mockRepository.Object.GetByIdAsync(companyId);

        // Assert
        result.Should().BeNull();
        mockRepository.Verify(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ICompanyRepository_AddAsync_ShouldReturnAddedCompany()
    {
        // Arrange
        var company = CreateTestCompany();
        var mockRepository = new Mock<ICompanyRepository>();
        mockRepository.Setup(r => r.AddAsync(company, It.IsAny<CancellationToken>()))
                     .ReturnsAsync(company);

        // Act
        var result = await mockRepository.Object.AddAsync(company);

        // Assert
        result.Should().Be(company);
        mockRepository.Verify(r => r.AddAsync(company, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ICompanyRepository_UpdateAsync_ShouldCallUpdateMethod()
    {
        // Arrange
        var company = CreateTestCompany();
        var mockRepository = new Mock<ICompanyRepository>();

        // Act
        await mockRepository.Object.UpdateAsync(company);

        // Assert
        mockRepository.Verify(r => r.UpdateAsync(company, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ICompanyRepository_DeleteAsync_ShouldCallDeleteMethod()
    {
        // Arrange
        var companyId = Guid.NewGuid();
        var mockRepository = new Mock<ICompanyRepository>();

        // Act
        await mockRepository.Object.DeleteAsync(companyId);

        // Assert
        mockRepository.Verify(r => r.DeleteAsync(companyId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ICompanyRepository_ExistsAsync_ShouldReturnTrue_WhenCompanyExists()
    {
        // Arrange
        var companyId = Guid.NewGuid();
        var mockRepository = new Mock<ICompanyRepository>();
        mockRepository.Setup(r => r.ExistsAsync(companyId, It.IsAny<CancellationToken>()))
                     .ReturnsAsync(true);

        // Act
        var result = await mockRepository.Object.ExistsAsync(companyId);

        // Assert
        result.Should().BeTrue();
        mockRepository.Verify(r => r.ExistsAsync(companyId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ICompanyRepository_ExistsAsync_ShouldReturnFalse_WhenCompanyDoesNotExist()
    {
        // Arrange
        var companyId = Guid.NewGuid();
        var mockRepository = new Mock<ICompanyRepository>();
        mockRepository.Setup(r => r.ExistsAsync(companyId, It.IsAny<CancellationToken>()))
                     .ReturnsAsync(false);

        // Act
        var result = await mockRepository.Object.ExistsAsync(companyId);

        // Assert
        result.Should().BeFalse();
        mockRepository.Verify(r => r.ExistsAsync(companyId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ICompanyRepository_GetAllAsync_ShouldReturnAllCompanies()
    {
        // Arrange
        var companies = new List<Company>
        {
            CreateTestCompany(Guid.NewGuid(), "Company 1"),
            CreateTestCompany(Guid.NewGuid(), "Company 2"),
            CreateTestCompany(Guid.NewGuid(), "Company 3")
        };
        var mockRepository = new Mock<ICompanyRepository>();
        mockRepository.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
                     .ReturnsAsync(companies);

        // Act
        var result = await mockRepository.Object.GetAllAsync();

        // Assert
        result.Should().HaveCount(3);
        result.Should().BeEquivalentTo(companies);
        mockRepository.Verify(r => r.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task IEmployeeRepository_ShouldSupportCancellationToken()
    {
        // Arrange
        var mockRepository = new Mock<IEmployeeRepository>();
        var cancellationToken = new CancellationToken(true); // Already cancelled
        var employeeId = Guid.NewGuid();

        mockRepository.Setup(r => r.GetByIdAsync(employeeId, cancellationToken))
                     .ThrowsAsync(new OperationCanceledException());

        // Act & Assert
        await mockRepository.Object.Invoking(r => r.GetByIdAsync(employeeId, cancellationToken))
                           .Should().ThrowAsync<OperationCanceledException>();
    }

    [Fact]
    public void Repository_Interfaces_ShouldHaveBasicCrudMethods()
    {
        // Arrange - Test basic repository interface structure
        var companyRepositoryType = typeof(ICompanyRepository);
        var employeeRepositoryType = typeof(IEmployeeRepository);

        // Assert - Each repository should have basic methods
        companyRepositoryType.GetMethod("GetByIdAsync").Should().NotBeNull();
        companyRepositoryType.GetMethod("GetAllAsync").Should().NotBeNull();
        companyRepositoryType.GetMethod("AddAsync").Should().NotBeNull();
        companyRepositoryType.GetMethod("UpdateAsync").Should().NotBeNull();
        companyRepositoryType.GetMethod("DeleteAsync").Should().NotBeNull();
        companyRepositoryType.GetMethod("ExistsAsync").Should().NotBeNull();

        employeeRepositoryType.GetMethod("GetByIdAsync").Should().NotBeNull();
        employeeRepositoryType.GetMethod("GetAllAsync").Should().NotBeNull();
        employeeRepositoryType.GetMethod("AddAsync").Should().NotBeNull();
        employeeRepositoryType.GetMethod("UpdateAsync").Should().NotBeNull();
    }

    private static Company CreateTestCompany(Guid? id = null, string name = "Test Company")
    {
        var company = new Company
        {
            Id = id ?? Guid.NewGuid(),
            Name = name,
            LegalName = $"{name} NV",
            Type = "NV",
            Sector = "Technology", 
            NumberOfEmployees = 100,
            Address = new Address("Test Street", "123", "1000", "Brussels", "Belgium"),
            ContactPerson = new ContactPerson("John", "Doe", "john@example.com", "+32123456789", "Manager")
        };
        company.Ondernemingsnummer = "BE0123456789";
        return company;
    }
}