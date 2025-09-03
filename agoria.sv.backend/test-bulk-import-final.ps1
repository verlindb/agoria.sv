#!/usr/bin/env pwsh

Write-Host "Testing Bulk Import Functionality" -ForegroundColor Green

# Test Technical Units Bulk Import
Write-Host "`nTesting Technical Units Bulk Import..." -ForegroundColor Yellow

$technicalUnitsData = @"
[
  {
    "companyId": "e26d8687-8018-4618-8a20-1193873684b4",
    "name": "Final Test IT Department",
    "code": "TBE001",
    "description": "Final update to IT department",
    "numberOfEmployees": 35,
    "manager": "Final IT Manager",
    "department": "Information Technology",
    "location": {
      "street": "Final IT Street",
      "number": "100",
      "postalCode": "2000",
      "city": "Antwerpen",
      "country": "België"
    },
    "status": "active",
    "language": "N",
    "pcWorkers": "199",
    "pcClerks": "299",
    "fodDossierBase": "99999",
    "fodDossierSuffix": "2",
    "electionBodies": {
      "cpbw": true,
      "or": true,
      "sdWorkers": true,
      "sdClerks": true
    }
  },
  {
    "companyId": "e26d8687-8018-4618-8a20-1193873684b4",
    "name": "Sales Department",
    "code": "TBE004",
    "description": "New Sales department for testing",
    "numberOfEmployees": 12,
    "manager": "Sales Manager",
    "department": "Sales",
    "location": {
      "street": "Sales Street",
      "number": "40",
      "postalCode": "2000",
      "city": "Antwerpen",
      "country": "België"
    },
    "status": "active",
    "language": "N",
    "pcWorkers": "180",
    "pcClerks": "280",
    "fodDossierBase": "33333",
    "fodDossierSuffix": "1",
    "electionBodies": {
      "cpbw": true,
      "or": false,
      "sdWorkers": true,
      "sdClerks": false
    }
  }
]
"@

$response = Invoke-RestMethod -Uri "https://localhost:52790/api/technical-units/import" -Method POST -Body $technicalUnitsData -ContentType "application/json" -SkipCertificateCheck
Write-Host "Technical Units Bulk Import Response:" -ForegroundColor Cyan
$response | ConvertTo-Json -Depth 3

# Test Employees Bulk Import  
Write-Host "`n`nTesting Employees Bulk Import..." -ForegroundColor Yellow

$employeesData = @"
[
  {
    "technicalBusinessUnitId": "f7cb1b3a-370c-4f92-867b-4db649373da8",
    "firstName": "Final",
    "lastName": "Test Employee",
    "email": "frontend.test@example.com",
    "phone": "+32 9 111 11 11",
    "role": "Final Test Role",
    "startDate": "2025-01-01T00:00:00Z"
  },
  {
    "technicalBusinessUnitId": "816f88fa-7a31-4c66-bedb-8ed2becdf819",
    "firstName": "Test",
    "lastName": "Marketing Person",
    "email": "test.marketing@example.com",
    "phone": "+32 9 222 22 22",
    "role": "Marketing Tester",
    "startDate": "2025-01-01T00:00:00Z"
  }
]
"@

$response = Invoke-RestMethod -Uri "https://localhost:52790/api/employees/import" -Method POST -Body $employeesData -ContentType "application/json" -SkipCertificateCheck
Write-Host "Employees Bulk Import Response:" -ForegroundColor Cyan
$response | ConvertTo-Json -Depth 3

Write-Host "`n`nBulk Import Tests Completed Successfully!" -ForegroundColor Green
