#!/usr/bin/env pwsh

Write-Host "Setting up test data for bulk import testing..." -ForegroundColor Green

# First, create a company
Write-Host "`nCreating test company..." -ForegroundColor Yellow

$companyData = @"
{
  "name": "Test Company",
  "legalName": "Test Company BV",
  "ondernemingsnummer": "BE0123456789",
  "sector": "Technology",
  "type": "BV",
  "numberOfEmployees": 100,
  "status": "active",
  "address": {
    "street": "Test Street",
    "number": "123",
    "postalCode": "2000",
    "city": "Antwerpen",
    "country": "België"
  },
  "contactPerson": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@testcompany.be",
    "phone": "+32 3 123 45 67",
    "function": "CEO"
  }
}
"@

$company = Invoke-RestMethod -Uri "https://localhost:52790/api/companies" -Method POST -Body $companyData -ContentType "application/json" -SkipCertificateCheck
Write-Host "Created company with ID: $($company.id)" -ForegroundColor Cyan

# Now create technical business units
Write-Host "`nCreating technical business units..." -ForegroundColor Yellow

$technicalUnitsData = @"
[
  {
    "companyId": "$($company.id)",
    "name": "IT Department",
    "code": "IT001",
    "description": "Information Technology Department",
    "numberOfEmployees": 25,
    "manager": "IT Manager",
    "department": "Technology",
    "location": {
      "street": "Tech Street",
      "number": "10",
      "postalCode": "2000",
      "city": "Antwerpen",
      "country": "België"
    },
    "status": "active",
    "language": "N",
    "pcWorkers": "100",
    "pcClerks": "200",
    "fodDossierBase": "12345",
    "fodDossierSuffix": "1",
    "electionBodies": {
      "cpbw": true,
      "or": true,
      "sdWorkers": false,
      "sdClerks": false
    }
  },
  {
    "companyId": "$($company.id)",
    "name": "HR Department",
    "code": "HR001",
    "description": "Human Resources Department",
    "numberOfEmployees": 10,
    "manager": "HR Manager",
    "department": "Human Resources",
    "location": {
      "street": "HR Street",
      "number": "20",
      "postalCode": "2000",
      "city": "Antwerpen",
      "country": "België"
    },
    "status": "active",
    "language": "N",
    "pcWorkers": "110",
    "pcClerks": "210",
    "fodDossierBase": "54321",
    "fodDossierSuffix": "2",
    "electionBodies": {
      "cpbw": true,
      "or": true,
      "sdWorkers": true,
      "sdClerks": true
    }
  }
]
"@

$technicalUnits = Invoke-RestMethod -Uri "https://localhost:52790/api/technical-units/import" -Method POST -Body $technicalUnitsData -ContentType "application/json" -SkipCertificateCheck
Write-Host "Created technical units:" -ForegroundColor Cyan
$technicalUnits | ConvertTo-Json -Depth 2

# Now test employee bulk import with valid technical unit IDs
Write-Host "`n`nTesting employee bulk import with valid data..." -ForegroundColor Yellow

$employeesData = @"
[
  {
    "technicalBusinessUnitId": "$($technicalUnits[0].id)",
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice.johnson@testcompany.be",
    "phone": "+32 3 111 11 11",
    "role": "Software Developer",
    "startDate": "2025-01-01T00:00:00Z"
  },
  {
    "technicalBusinessUnitId": "$($technicalUnits[0].id)",
    "firstName": "Bob",
    "lastName": "Smith",
    "email": "bob.smith@testcompany.be",
    "phone": "+32 3 222 22 22",
    "role": "DevOps Engineer",
    "startDate": "2025-01-15T00:00:00Z"
  },
  {
    "technicalBusinessUnitId": "$($technicalUnits[1].id)",
    "firstName": "Carol",
    "lastName": "Williams",
    "email": "carol.williams@testcompany.be",
    "phone": "+32 3 333 33 33",
    "role": "HR Specialist",
    "startDate": "2025-02-01T00:00:00Z"
  }
]
"@

$employees = Invoke-RestMethod -Uri "https://localhost:52790/api/employees/import" -Method POST -Body $employeesData -ContentType "application/json" -SkipCertificateCheck
Write-Host "Employee bulk import result:" -ForegroundColor Cyan
$employees | ConvertTo-Json -Depth 2

# Test update functionality - update Alice's role
Write-Host "`n`nTesting employee bulk import update functionality..." -ForegroundColor Yellow

$updateEmployeesData = @"
[
  {
    "technicalBusinessUnitId": "$($technicalUnits[0].id)",
    "firstName": "Alice",
    "lastName": "Johnson Updated",
    "email": "alice.johnson@testcompany.be",
    "phone": "+32 3 111 11 99",
    "role": "Senior Software Developer",
    "startDate": "2024-06-01T00:00:00Z"
  },
  {
    "technicalBusinessUnitId": "$($technicalUnits[1].id)",
    "firstName": "David",
    "lastName": "Brown",
    "email": "david.brown@testcompany.be",
    "phone": "+32 3 444 44 44",
    "role": "HR Manager",
    "startDate": "2025-03-01T00:00:00Z"
  }
]
"@

$updatedEmployees = Invoke-RestMethod -Uri "https://localhost:52790/api/employees/import" -Method POST -Body $updateEmployeesData -ContentType "application/json" -SkipCertificateCheck
Write-Host "Employee bulk import update result:" -ForegroundColor Cyan
$updatedEmployees | ConvertTo-Json -Depth 2

Write-Host "`n`nBulk import test completed successfully!" -ForegroundColor Green
