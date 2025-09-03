# Simple test to verify the GetMembers endpoint
$baseUrl = "https://localhost:52790"

$techUnits = Invoke-RestMethod -Uri "$baseUrl/api/technical-units" -SkipCertificateCheck
$testTechUnit = $techUnits[0]
Write-Host "Testing with tech unit: $($testTechUnit.name) (ID: $($testTechUnit.id))"

# Test GET endpoint
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/works-council/$($testTechUnit.id)/members" -SkipCertificateCheck
    Write-Host "✓ GET endpoint works. Status: $($response.StatusCode)"
    $members = $response.Content | ConvertFrom-Json
    Write-Host "Found $($members.Count) members."
} catch {
    Write-Host "✗ GET endpoint failed: $($_.Exception.Message)"
    if ($_.ErrorDetails) {
        Write-Host "Response: $($_.ErrorDetails.Message)"
    }
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    }
}
