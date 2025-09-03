$payload = @'
[{"Name":"Voorbeeld Bedrijf","LegalName":"Voorbeeld BV","Ondernemingsnummer":"BE0123456789","Type":"BV","Sector":"IT","NumberOfEmployees":100,"Address":{"Street":"Hoofdstraat","Number":"1","PostalCode":"1000","City":"Brussel","Country":"België"},"ContactPerson":{"FirstName":"Jan","LastName":"Janssen","Email":"jan@voorbeeld.be","Phone":"+32 2 123 45 67","Function":"HR Manager"}}]
'@

try {
    $response = Invoke-RestMethod -Uri "http://localhost:52791/api/companies/import" -Method POST -Body $payload -ContentType "application/json"
    Write-Host "✅ Success! Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $responseContent = $_.Exception.Response.Content.ReadAsStringAsync().Result
        Write-Host "Response content: $responseContent" -ForegroundColor Yellow
    }
}
