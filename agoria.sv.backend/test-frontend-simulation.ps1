#!/usr/bin/env pwsh

Write-Host "Testing frontend employee import simulation..." -ForegroundColor Green

# Get the technical unit ID (this is what the frontend would have)
Write-Host "`nGetting technical unit ID..." -ForegroundColor Yellow
$technicalUnits = Invoke-RestMethod -Uri "https://localhost:52790/api/technical-units" -SkipCertificateCheck
$technicalUnitId = $technicalUnits[0].id
Write-Host "Using technical unit ID: $technicalUnitId" -ForegroundColor Cyan

# Simulate what the frontend parseEmployeesFromExcel function would create
Write-Host "`nCreating employee data as frontend would..." -ForegroundColor Yellow
$employeeData = @"
[
  {
    "technicalBusinessUnitId": "$technicalUnitId",
    "firstName": "Frontend Sim",
    "lastName": "Test User",
    "email": "frontend.sim@example.com",
    "phone": "+32 3 777 77 77",
    "role": "Frontend Simulation Tester",
    "startDate": "2025-01-01T00:00:00Z",
    "status": "active"
  }
]
"@

# Test the bulk import endpoint (this is what the frontend importEmployees function calls)
Write-Host "`nTesting bulk import as frontend would call it..." -ForegroundColor Yellow
try {
  $result = Invoke-RestMethod -Uri "https://localhost:52790/api/employees/import" -Method POST -Body $employeeData -ContentType "application/json" -SkipCertificateCheck
  Write-Host "✅ Bulk import succeeded!" -ForegroundColor Green
  Write-Host "Created employee: $($result[0].firstName) $($result[0].lastName) ($($result[0].email))" -ForegroundColor Cyan
} catch {
  Write-Host "❌ Bulk import failed!" -ForegroundColor Red
  Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nFrontend employee import simulation completed!" -ForegroundColor Green
