# Domain Layer Testing Documentation

## Overview
This document outlines the comprehensive test suite created for the domain layer of the Agoria.SV.Backend project, using .NET 9, xUnit, Moq, and FluentAssertions.

## Test Structure

### Test Projects
- **Agoria.SV.Domain.Tests**: Main test project for domain layer testing
  - Target Framework: .NET 9.0
  - Testing Framework: xUnit
  - Mocking Framework: Moq 4.20.72
  - Assertion Library: FluentAssertions 8.6.0

### Coverage Areas

#### 1. Entities Testing
The following domain entities are thoroughly tested:

- **Company** (`CompanyTests.cs`)
  - Ondernemingsnummer validation (BE0123456789 format)
  - Status validation (active/inactive/pending)
  - Property initialization and default values

- **Employee** (`EmployeeTests.cs`)
  - Constructor validation and null checking
  - Update methods (UpdateDetails, UpdateStatus, UpdateTechnicalBusinessUnit, UpdateAll)
  - Immutable properties behavior
  - Timestamp management on updates

- **TechnicalBusinessUnit** (`TechnicalBusinessUnitTests.cs`)
  - Status validation (active/inactive)
  - Language validation (N/F/N+F/D)
  - FOD dossier suffix validation (1/2)
  - Default value initialization

- **WorksCouncil** (`WorksCouncilTests.cs`)
  - Constructor behavior and entity creation
  - Technical business unit relationship management
  - Timestamp handling
  - Collections initialization

- **OrMembership** (`OrMembershipTests.cs`)
  - Entity creation with valid parameters
  - Update methods (UpdateOrder, UpdateCategory)
  - ORCategory enum integration
  - Relationship management

#### 2. Value Objects Testing

- **Address** (`AddressTests.cs`)
  - Constructor validation and null checking
  - Immutability verification
  - Property encapsulation testing

- **ContactPerson** (`ContactPersonTests.cs`)
  - Constructor validation with optional parameters
  - Null parameter handling
  - Immutability verification

- **ElectionBodies** (`ElectionBodiesTests.cs`)
  - Boolean property handling
  - All combination testing
  - Immutability verification

- **ORCategory** (`ORCategoryTests.cs`)
  - Enum extension methods testing
  - String conversion methods (ToStringValue/FromString)
  - Case-insensitive parsing
  - Round-trip conversion testing

#### 3. Base Infrastructure Testing

- **BaseEntity** (`BaseEntityTests.cs`)
  - Property type validation
  - Inheritance behavior testing
  - Setter accessibility verification

#### 4. Repository Interface Testing

- **Repository Interfaces** (`RepositoryInterfaceTests.cs`)
  - Mock-based testing using Moq
  - CRUD operation verification
  - Cancellation token support
  - Interface contract validation

## Testing Best Practices Implemented

### 1. Arrange-Act-Assert (AAA) Pattern
All tests follow the AAA pattern for clarity and maintainability:
```csharp
[Fact]
public void Method_ShouldBehavior_WhenCondition()
{
    // Arrange
    var input = CreateTestData();
    
    // Act
    var result = systemUnderTest.Method(input);
    
    // Assert
    result.Should().Be(expectedValue);
}
```

### 2. Descriptive Test Names
Test names follow the convention: `MethodName_ShouldExpectedBehavior_WhenCondition`

### 3. Theory-based Testing
Using `[Theory]` and `[InlineData]` for testing multiple scenarios:
```csharp
[Theory]
[InlineData("active")]
[InlineData("inactive")]
[InlineData("pending")]
public void Company_ShouldSetValidStatus_WhenValidStatusProvided(string validStatus)
```

### 4. Edge Case Testing
- Null parameter validation
- Empty string handling
- Boundary value testing
- Invalid input scenarios

### 5. Domain-Specific Validation Testing
- Business rule enforcement (e.g., Ondernemingsnummer format)
- Status transitions
- Immutability constraints
- Relationship integrity

### 6. Mock-based Testing for Interfaces
Using Moq to test repository interfaces:
```csharp
var mockRepository = new Mock<ICompanyRepository>();
mockRepository.Setup(r => r.GetByIdAsync(companyId, It.IsAny<CancellationToken>()))
             .ReturnsAsync(expectedCompany);
```

### 7. Fluent Assertions for Readability
Using FluentAssertions for expressive and readable assertions:
```csharp
result.Should().NotBeNull();
result.Name.Should().Be(expectedName);
result.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
```

## Test Metrics
- **Total Tests**: 140
- **Test Categories**:
  - Entity Tests: ~80 tests
  - Value Object Tests: ~40 tests
  - Repository Interface Tests: ~15 tests
  - Base Infrastructure Tests: ~5 tests

## Running Tests

### Command Line
```bash
# Run all tests
dotnet test tests/Agoria.SV.Domain.Tests

# Run with detailed output
dotnet test tests/Agoria.SV.Domain.Tests --verbosity normal

# Run specific test class
dotnet test tests/Agoria.SV.Domain.Tests --filter "CompanyTests"
```

### IDE Integration
Tests are compatible with:
- Visual Studio Test Explorer
- JetBrains Rider
- VS Code with C# extension

## Continuous Integration
The test project is integrated into the solution and can be included in CI/CD pipelines for automated testing.

## Future Enhancements
1. **Code Coverage**: Add code coverage reporting
2. **Performance Tests**: Add performance benchmarks for critical operations
3. **Integration Tests**: Add tests for entity relationships and complex scenarios
4. **Property-based Testing**: Consider adding property-based tests for complex validation logic