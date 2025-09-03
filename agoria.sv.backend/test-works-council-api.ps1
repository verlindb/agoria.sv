# Test Works Council API Endpoints
# This script tests the new works council functionality

$baseUrl = "https://localhost:52790"

# Function to make HTTP requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Uri,
        [object]$Body = $null
    )
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        $params = @{
            Uri = $Uri
            Method = $Method
            Headers = $headers
            SkipCertificateCheck = $true
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        return $response
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host "=== Testing Works Council API Endpoints ===" -ForegroundColor Green

# Test 1: Get all employees (prerequisite)
Write-Host "`n1. Getting all employees..." -ForegroundColor Yellow
$employees = Invoke-ApiRequest -Method GET -Uri "$baseUrl/api/employees"
if ($employees) {
    Write-Host "✓ Found $($employees.Count) employees" -ForegroundColor Green
    $testEmployee = $employees[0]
    Write-Host "  Test employee: $($testEmployee.firstName) $($testEmployee.lastName) (ID: $($testEmployee.id))" -ForegroundColor Cyan
} else {
    Write-Host "✗ Failed to get employees" -ForegroundColor Red
    exit 1
}

# Test 2: Get all technical business units (prerequisite)
Write-Host "`n2. Getting all technical business units..." -ForegroundColor Yellow
$techUnits = Invoke-ApiRequest -Method GET -Uri "$baseUrl/api/technical-units"
if ($techUnits) {
    Write-Host "✓ Found $($techUnits.Count) technical business units" -ForegroundColor Green
    $testTechUnit = $techUnits[0]
    Write-Host "  Test tech unit: $($testTechUnit.name) (ID: $($testTechUnit.id))" -ForegroundColor Cyan
} else {
    Write-Host "✗ Failed to get technical business units" -ForegroundColor Red
    exit 1
}

# Test 3: Get members for a technical unit (should be empty initially)
Write-Host "`n3. Getting works council members for tech unit $($testTechUnit.id)..." -ForegroundColor Yellow
$members = Invoke-ApiRequest -Method GET -Uri "$baseUrl/api/works-council/$($testTechUnit.id)/members"
if ($members -ne $null) {
    Write-Host "✓ Retrieved works council members (count: $($members.Count))" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to get works council members" -ForegroundColor Red
}

# Test 4: Add a member to works council
Write-Host "`n4. Adding member to works council..." -ForegroundColor Yellow
$addMemberBody = @{
    employeeId = $testEmployee.id
    category = "arbeiders"
}
$addedMember = Invoke-ApiRequest -Method POST -Uri "$baseUrl/api/works-council/$($testTechUnit.id)/members" -Body $addMemberBody
if ($addedMember) {
    Write-Host "✓ Added member: $($addedMember.firstName) $($addedMember.lastName)" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to add member" -ForegroundColor Red
}

# Test 5: Get members again (should now have 1 member)
Write-Host "`n5. Getting works council members again..." -ForegroundColor Yellow
$members = Invoke-ApiRequest -Method GET -Uri "$baseUrl/api/works-council/$($testTechUnit.id)/members"
if ($members -ne $null) {
    Write-Host "✓ Retrieved works council members (count: $($members.Count))" -ForegroundColor Green
    if ($members.Count -gt 0) {
        $member = $members[0]
        Write-Host "  Member: $($member.firstName) $($member.lastName)" -ForegroundColor Cyan
        if ($member.orMembership -and $member.orMembership.arbeiders) {
            Write-Host "  OR Category: arbeiders (order: $($member.orMembership.arbeiders.order))" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "✗ Failed to get works council members" -ForegroundColor Red
}

# Test 6: Remove member from works council
Write-Host "`n6. Removing member from works council..." -ForegroundColor Yellow
$removeMemberBody = @{
    employeeId = $testEmployee.id
    category = "arbeiders"
}
$removedMember = Invoke-ApiRequest -Method DELETE -Uri "$baseUrl/api/works-council/$($testTechUnit.id)/members" -Body $removeMemberBody
if ($removedMember) {
    Write-Host "✓ Removed member: $($removedMember.firstName) $($removedMember.lastName)" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to remove member" -ForegroundColor Red
}

# Test 7: Bulk add members
Write-Host "`n7. Testing bulk add members..." -ForegroundColor Yellow
$employeeIds = $employees[0..2] | ForEach-Object { $_.id }
$bulkAddBody = @{
    employeeIds = $employeeIds
    category = "bedienden"
}
$bulkAddedMembers = Invoke-ApiRequest -Method POST -Uri "$baseUrl/api/works-council/members/bulk-add" -Body $bulkAddBody
if ($bulkAddedMembers) {
    Write-Host "✓ Bulk added $($bulkAddedMembers.Count) members" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to bulk add members" -ForegroundColor Red
}

# Test 8: Test reordering
Write-Host "`n8. Testing reorder members..." -ForegroundColor Yellow
if ($bulkAddedMembers -and $bulkAddedMembers.Count -gt 1) {
    $orderedIds = $bulkAddedMembers | ForEach-Object { $_.id }
    [array]::Reverse($orderedIds)  # Reverse the order
    
    $reorderBody = @{
        category = "bedienden"
        orderedIds = $orderedIds
    }
    $reorderedMembers = Invoke-ApiRequest -Method POST -Uri "$baseUrl/api/works-council/$($testTechUnit.id)/reorder" -Body $reorderBody
    if ($reorderedMembers) {
        Write-Host "✓ Reordered $($reorderedMembers.Count) members" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to reorder members" -ForegroundColor Red
    }
}

# Test 9: Bulk remove members
Write-Host "`n9. Testing bulk remove members..." -ForegroundColor Yellow
if ($bulkAddedMembers) {
    $employeeIds = $bulkAddedMembers | ForEach-Object { $_.id }
    $bulkRemoveBody = @{
        employeeIds = $employeeIds
        category = "bedienden"
    }
    $bulkRemovedMembers = Invoke-ApiRequest -Method POST -Uri "$baseUrl/api/works-council/members/bulk-remove" -Body $bulkRemoveBody
    if ($bulkRemovedMembers) {
        Write-Host "✓ Bulk removed $($bulkRemovedMembers.Count) members" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to bulk remove members" -ForegroundColor Red
    }
}

Write-Host "`n=== Works Council API Testing Complete ===" -ForegroundColor Green
