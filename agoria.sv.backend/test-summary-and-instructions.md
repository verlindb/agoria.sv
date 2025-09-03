# Test Suite Status Report and Instructions

## Current Status: COMPILATION ERRORS PREVENTING TEST EXECUTION

The test suite contains extensive tests (220+ tests as mentioned in the PR) but cannot currently run due to **117 compilation errors** and **20 warnings**.

## .NET Framework Status ✅
- **.NET 9 SDK Successfully Installed**: The environment now has .NET 9.0.304 installed and working
- **Package Restore**: Successfully completed 
- **Framework Compatibility**: All projects correctly target `net9.0`

## Test Infrastructure ✅
The test project has excellent infrastructure with all necessary packages:
- **xUnit 2.6.1**: Primary testing framework
- **Moq 4.20.70**: Mocking framework  
- **FluentAssertions 6.12.0**: Assertion library
- **Entity Framework InMemory 9.0.0**: Database testing
- **Microsoft.AspNetCore.Mvc.Testing 9.0.0**: Integration testing
- **NBomber 5.8.2**: Performance testing
- **Coverlet + ReportGenerator**: Code coverage

## Major Issues Preventing Test Execution

### 1. **Domain Model Mismatch** (Primary Issue)
The tests were written assuming different domain model structures than what actually exists:

**Examples of Mismatches:**
- Tests expect `TechnicalBusinessUnit.ContactPerson` but entity only has `Location` (Address)
- Tests use `ORCategory.ArbeiderVertegenwoordiger` but enum only has `Arbeiders`, `Bedienden`, `Kaderleden`, `Jeugdige`
- Tests expect mutable properties on `OrMembership` but properties are read-only with private setters
- Tests expect `WorksCouncil.Name` property but it doesn't exist
- Tests expect different constructor signatures than what's actually implemented

### 2. **Missing Repository Methods**
Tests reference methods that don't exist in the repository interfaces:
- `ICompanyRepository.SearchAsync()` - not implemented
- `IEmployeeRepository.SearchAsync()` - not implemented

### 3. **DTO Structure Mismatches**
Tests expect DTO properties that don't exist:
- `TechnicalBusinessUnitDto.Address` and `ContactPerson` - DTO uses `Location` instead
- `ElectionBodiesDto.Bodies` - property doesn't exist
- `ContactPersonDto.PhoneNumber` - property structure mismatch

### 4. **Command/Query Structure Issues**
- `CreateCompanyCommand` constructor expects different parameters than tests provide
- Tests expect 9 arguments but constructor has different signature

## Summary of Compilation Errors by Category

| Category | Count | Examples |
|----------|-------|----------|
| Missing Properties/Methods | 45+ | `TechnicalBusinessUnit.ContactPerson`, `SearchAsync()` |
| Constructor Mismatches | 15+ | `CreateCompanyCommand`, `ElectionBodies`, `OrMembership` |
| Read-only Property Assignments | 10+ | `OrMembership.EmployeeId`, `Order`, `Category` |
| Enum Value Mismatches | 5+ | `ORCategory.ArbeiderVertegenwoordiger` |
| DTO Property Mismatches | 20+ | `ElectionBodiesDto.Bodies`, `ContactPersonDto.PhoneNumber` |
| Type/Namespace Issues | 22+ | Namespace references, generic type issues |

## Test Suite Structure (Current - Cannot Execute)

```
tests/Agoria.SV.API.Tests/
├── Unit/                          (~115+ tests)
│   ├── Domain/                   (Entity and Value Object tests)
│   ├── Application/              (CQRS handler tests)
│   ├── Infrastructure/           (Repository tests)
│   └── Mappings/                 (AutoMapper tests)
├── Integration/                   (~10+ tests)
│   └── Controllers/              (HTTP endpoint tests)
├── Performance/                   (~4+ tests)
│   └── NBomber tests
└── Fixtures/
    └── TestWebApplicationFactory.cs
```

## How to Run Tests (After Fixing Compilation Errors)

### Prerequisites
```bash
# Ensure .NET 9 is available (already done)
export PATH="$HOME/.dotnet:$PATH"
dotnet --version  # Should show 9.0.304
```

### Build and Test Commands
```bash
cd /home/runner/work/agoria.sv/agoria.sv/agoria.sv.backend

# 1. Restore packages
dotnet restore

# 2. Build solution (CURRENTLY FAILS)
dotnet build

# 3. Run all tests (AFTER fixing compilation errors)
dotnet test --verbosity normal

# 4. Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# 5. Run specific test categories
dotnet test --filter "Category=Unit"
dotnet test --filter "Category=Integration" 
dotnet test --filter "Category=Performance"

# 6. Generate coverage report (after tests pass)
./generate-coverage-report.sh
```

## Recommended Fix Strategy

### Option 1: Comprehensive Test Rewrite (Recommended)
1. **Analyze Current Domain Models**: Document actual entity structures, properties, and relationships
2. **Review Actual DTOs**: Understand current DTO implementations  
3. **Check Repository Interfaces**: Implement missing methods like `SearchAsync()`
4. **Rewrite Tests**: Update tests to match actual domain model structure
5. **Validate Mappings**: Ensure AutoMapper tests match actual mapping profiles

### Option 2: Incremental Fixes
1. **Fix Simple Issues First**: Remove duplicate usings, fix namespace references
2. **Update Constructor Calls**: Match actual constructor signatures
3. **Fix Property Access**: Use correct property names and access modifiers
4. **Implement Missing Methods**: Add missing repository methods
5. **Update Test Data**: Align test data with actual model constraints

### Option 3: Start Fresh (Alternative)
1. **Create New Test Project**: Start with working domain models
2. **Build Core Tests First**: Focus on essential entity and repository tests
3. **Add Integration Tests**: Build up HTTP endpoint tests gradually
4. **Add Performance Tests**: Implement NBomber tests last

## Current Test Environment Capabilities

The testing infrastructure is properly set up and will work once compilation errors are resolved:

- ✅ **Unit Testing**: xUnit, Moq, FluentAssertions ready
- ✅ **Integration Testing**: TestWebApplicationFactory configured with in-memory database
- ✅ **Performance Testing**: NBomber framework available
- ✅ **Code Coverage**: Coverlet and ReportGenerator configured
- ✅ **.NET 9**: Proper framework targeting and dependencies

## Next Steps

1. **Choose Fix Strategy**: Decide between comprehensive rewrite vs incremental fixes
2. **Document Domain Models**: Create accurate documentation of current entity structures
3. **Priority Order**: Start with core domain entity tests, then repositories, then application layer
4. **Validate Each Layer**: Ensure tests pass at each layer before moving to next
5. **Performance Testing**: Add performance tests last once functional tests pass

The test suite architecture and infrastructure are solid - the main issue is synchronizing the test expectations with the actual domain model implementation.