# Agoria SV Backend

.NET 9 Minimal API with Clean Architecture for managing Juridische Entiteiten.

## Architecture

- **Clean Architecture** with Domain, Application, Infrastructure, and API layers
- **CQRS** pattern with MediatR v12.x
- **AutoMapper** v12.x for object mapping
- **Entity Framework Core** with SQL Server LocalDB
- **NSwag** for OpenAPI documentation
- **FluentValidation** for request validation

## Getting Started

### Prerequisites

- .NET 9 SDK
- SQL Server LocalDB

### Running the Application

1. Navigate to the API project:
   ```bash
   cd src/Agoria.SV.API
   ```

2. Create initial migration:
   ```bash
   dotnet ef migrations add InitialCreate -p ../Agoria.SV.Infrastructure -s . -o Persistence/Migrations
   ```

3. Run the application:
   ```bash
   dotnet run
   ```

4. Access Swagger UI at: `http://localhost:5000/swagger`

## API Endpoints

### Juridische Entiteiten

- `GET /api/juridische-entiteiten` - Get all entities
- `GET /api/juridische-entiteiten/{id}` - Get entity by ID
- `POST /api/juridische-entiteiten` - Create new entity
- `PUT /api/juridische-entiteiten/{id}` - Update entity
- `DELETE /api/juridische-entiteiten/{id}` - Delete entity

## Project Structure

```
agoria.sv.backend/
├── src/
│   ├── Agoria.SV.Domain/          # Domain entities and interfaces
│   ├── Agoria.SV.Application/     # Business logic, CQRS handlers
│   ├── Agoria.SV.Infrastructure/  # Data access, EF Core
│   └── Agoria.SV.API/             # Minimal API endpoints
└── Agoria.SV.sln
```
