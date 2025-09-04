# Agoria.SV.Domain.Tests

This folder contains unit tests for the Domain layer (Agoria.SV.Domain).

Run tests (from repository root):

```pwsh
# Run all tests in the backend solution
dotnet test "agoria.sv.backend/Agoria.SV.sln"
```

Notes:
- .NET 9 (net9.0) is used as the target framework.
- Tests use xUnit, Moq (for mocking when needed) and FluentAssertions.
- If package restore fails for a package version, adjust versions in `Agoria.SV.Domain.Tests.csproj` or run `dotnet restore` with updated NuGet sources.
