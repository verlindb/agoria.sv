#!/usr/bin/env pwsh

Write-Host "Testing Technical Business Units Search Functionality..." -ForegroundColor Green

# Test 1: Search by name
Write-Host "`n=== Test 1: Search by Name (IT) ===" -ForegroundColor Yellow
$nameResults = Invoke-RestMethod -Uri "https://localhost:52790/api/technical-units/search?q=IT" -SkipCertificateCheck
Write-Host "Found $($nameResults.Count) technical units containing 'IT':" -ForegroundColor Cyan
foreach ($unit in $nameResults) {
    Write-Host "  - $($unit.name) ($($unit.code))" -ForegroundColor White
}

# Test 2: Search by code
Write-Host "`n=== Test 2: Search by Code (TBE001) ===" -ForegroundColor Yellow
$codeResults = Invoke-RestMethod -Uri "https://localhost:52790/api/technical-units/search?q=TBE001" -SkipCertificateCheck
Write-Host "Found $($codeResults.Count) technical units with code 'TBE001':" -ForegroundColor Cyan
foreach ($unit in $codeResults) {
    Write-Host "  - $($unit.name) ($($unit.code))" -ForegroundColor White
}

# Test 3: Search by department filter
Write-Host "`n=== Test 3: Search by Department Filter (Technologie) ===" -ForegroundColor Yellow
$deptResults = Invoke-RestMethod -Uri "https://localhost:52790/api/technical-units/search?department=Technologie" -SkipCertificateCheck
Write-Host "Found $($deptResults.Count) technical units in 'Technologie' department:" -ForegroundColor Cyan
foreach ($unit in $deptResults) {
    Write-Host "  - $($unit.name) ($($unit.department))" -ForegroundColor White
}

# Test 4: Search by status filter
Write-Host "`n=== Test 4: Search by Status Filter (active) ===" -ForegroundColor Yellow
$statusResults = Invoke-RestMethod -Uri "https://localhost:52790/api/technical-units/search?status=active" -SkipCertificateCheck
Write-Host "Found $($statusResults.Count) technical units with 'active' status:" -ForegroundColor Cyan
foreach ($unit in $statusResults) {
    Write-Host "  - $($unit.name) ($($unit.status))" -ForegroundColor White
}

# Test 5: Search by city filter
Write-Host "`n=== Test 5: Search by City Filter (Antwerpen) ===" -ForegroundColor Yellow
$cityResults = Invoke-RestMethod -Uri "https://localhost:52790/api/technical-units/search?city=Antwerpen" -SkipCertificateCheck
Write-Host "Found $($cityResults.Count) technical units in 'Antwerpen':" -ForegroundColor Cyan
foreach ($unit in $cityResults) {
    Write-Host "  - $($unit.name) ($($unit.location.city))" -ForegroundColor White
}

# Test 6: Combined search with multiple filters
Write-Host "`n=== Test 6: Combined Search (department=Technologie AND status=active) ===" -ForegroundColor Yellow
$combinedResults = Invoke-RestMethod -Uri "https://localhost:52790/api/technical-units/search?department=Technologie&status=active" -SkipCertificateCheck
Write-Host "Found $($combinedResults.Count) technical units matching both filters:" -ForegroundColor Cyan
foreach ($unit in $combinedResults) {
    Write-Host "  - $($unit.name) - Dept: $($unit.department), Status: $($unit.status)" -ForegroundColor White
}

# Test 7: Empty search (should return all)
Write-Host "`n=== Test 7: Empty Search (should return all) ===" -ForegroundColor Yellow
$allResults = Invoke-RestMethod -Uri "https://localhost:52790/api/technical-units/search" -SkipCertificateCheck
Write-Host "Empty search returned $($allResults.Count) technical units (all units):" -ForegroundColor Cyan
foreach ($unit in $allResults) {
    Write-Host "  - $($unit.name) ($($unit.code))" -ForegroundColor White
}

Write-Host "`n✅ Technical Business Units Search Testing Completed!" -ForegroundColor Green
Write-Host "`nThe search endpoint supports the following parameters:" -ForegroundColor White
Write-Host "  - q (or searchTerm): General search across name, code, description, manager, etc." -ForegroundColor Gray
Write-Host "  - status: Filter by status (active, inactive)" -ForegroundColor Gray
Write-Host "  - department: Filter by department" -ForegroundColor Gray
Write-Host "  - language: Filter by language (N, F, N+F, D)" -ForegroundColor Gray
Write-Host "  - city: Filter by city" -ForegroundColor Gray
Write-Host "  - postalCode: Filter by postal code" -ForegroundColor Gray
Write-Host "  - country: Filter by country" -ForegroundColor Gray

Write-Host "`n🎉 Frontend can now use searchTechnicalUnits() function from AppContext!" -ForegroundColor Green
