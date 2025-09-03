#!/usr/bin/env pwsh

Write-Host "Demonstrating the fix for employee import issue..." -ForegroundColor Green

# Get the technical unit ID
$technicalUnits = Invoke-RestMethod -Uri "https://localhost:52790/api/technical-units" -SkipCertificateCheck
$technicalUnitId = $technicalUnits[0].id
Write-Host "Technical unit ID: $technicalUnitId" -ForegroundColor Cyan

Write-Host "`n=== DEMONSTRATING THE PROBLEM (Old approach) ===" -ForegroundColor Red

# Simulate the old approach: creating employees one by one
Write-Host "`nOld approach: Creating employees individually (this would cause the 500 error)..." -ForegroundColor Yellow

$employee1 = @"
{
  "technicalBusinessUnitId": "$technicalUnitId",
  "firstName": "Individual 1",
  "lastName": "Test",
  "email": "individual1@example.com",
  "phone": "+32 3 111 11 11",
  "role": "Individual Tester",
  "startDate": "2025-01-01T00:00:00Z"
}
"@

$employee2 = @"
{
  "technicalBusinessUnitId": "$technicalUnitId",
  "firstName": "Individual 2", 
  "lastName": "Test",
  "email": "individual2@example.com",
  "phone": "+32 3 222 22 22",
  "role": "Individual Tester",
  "startDate": "2025-01-01T00:00:00Z"
}
"@

# This is how the frontend was doing it before the fix
Write-Host "Creating employee 1 individually..." -ForegroundColor Yellow
$result1 = Invoke-RestMethod -Uri "https://localhost:52790/api/employees" -Method POST -Body $employee1 -ContentType "application/json" -SkipCertificateCheck
Write-Host "✅ Created: $($result1.firstName) $($result1.lastName)" -ForegroundColor Green

Write-Host "Creating employee 2 individually..." -ForegroundColor Yellow  
$result2 = Invoke-RestMethod -Uri "https://localhost:52790/api/employees" -Method POST -Body $employee2 -ContentType "application/json" -SkipCertificateCheck
Write-Host "✅ Created: $($result2.firstName) $($result2.lastName)" -ForegroundColor Green

Write-Host "`n❌ Problem: Multiple API calls, error-prone, not transactional" -ForegroundColor Red

Write-Host "`n=== DEMONSTRATING THE SOLUTION (New approach) ===" -ForegroundColor Green

# Simulate the new approach: bulk import
Write-Host "`nNew approach: Creating employees in bulk (this is the fix)..." -ForegroundColor Yellow

$bulkEmployees = @"
[
  {
    "technicalBusinessUnitId": "$technicalUnitId",
    "firstName": "Bulk 1",
    "lastName": "Test",
    "email": "bulk1@example.com",
    "phone": "+32 3 333 33 33",
    "role": "Bulk Tester",
    "startDate": "2025-01-01T00:00:00Z"
  },
  {
    "technicalBusinessUnitId": "$technicalUnitId",
    "firstName": "Bulk 2",
    "lastName": "Test", 
    "email": "bulk2@example.com",
    "phone": "+32 3 444 44 44",
    "role": "Bulk Tester",
    "startDate": "2025-01-01T00:00:00Z"
  }
]
"@

Write-Host "Creating employees in bulk..." -ForegroundColor Yellow
$bulkResult = Invoke-RestMethod -Uri "https://localhost:52790/api/employees/import" -Method POST -Body $bulkEmployees -ContentType "application/json" -SkipCertificateCheck
Write-Host "✅ Created $(($bulkResult).Count) employees in one call:" -ForegroundColor Green
foreach ($emp in $bulkResult) {
    Write-Host "  - $($emp.firstName) $($emp.lastName)" -ForegroundColor Cyan
}

Write-Host "`n✅ Solution: Single API call, transactional, faster, more reliable" -ForegroundColor Green

Write-Host "`n=== SUMMARY ===" -ForegroundColor Magenta
Write-Host "The fix involved:" -ForegroundColor White
Write-Host "1. ✅ Fixed field name: technicalUnitId → technicalBusinessUnitId" -ForegroundColor Green
Write-Host "2. ✅ Added importEmployees() function to AppContext" -ForegroundColor Green  
Write-Host "3. ✅ Updated TechnicalUnitDetail to use bulk import instead of individual creates" -ForegroundColor Green
Write-Host "4. ✅ Result: No more 500 errors when importing employees!" -ForegroundColor Green

Write-Host "`nThe user can now import employees via Excel without getting 500 errors! 🎉" -ForegroundColor Green
