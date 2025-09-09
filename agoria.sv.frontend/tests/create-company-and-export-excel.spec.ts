import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';

test.describe('Company Export to Excel', () => {
  const uniqueTimestamp = Math.floor(Date.now() / 1000);
  const testCompanyName = `ExportTestCompany-${uniqueTimestamp}`;

  test('create company and export to excel', async ({ page }) => {
    // Navigate to companies page
    await page.goto('http://localhost:3000/companies');
    
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Bedrijven")');
    
    // Click "Nieuw Bedrijf" button to open modal
    await page.getByRole('button', { name: 'Nieuw bedrijf toevoegen' }).click();
    
    // Wait for modal to open
    await page.waitForSelector('h2:has-text("Nieuw bedrijf toevoegen")');
    
    // Fill all mandatory fields with test data
    await page.getByRole('textbox', { name: 'Bedrijfsnaam' }).fill(testCompanyName);
    await page.getByRole('textbox', { name: 'Juridische naam' }).fill(`${testCompanyName} NV`);
    await page.getByRole('textbox', { name: 'Ondernemingsnummer' }).fill('BE1234567890');
    await page.getByRole('textbox', { name: 'Aantal werknemers' }).fill('5');
    await page.getByRole('combobox', { name: 'Sector' }).click();
    await page.getByRole('option', { name: 'Technologie' }).click();
    await page.getByRole('textbox', { name: 'Straat' }).fill('Teststraat');
    await page.getByRole('textbox', { name: 'Huisnummer' }).fill('123');
    await page.getByRole('textbox', { name: 'Postcode' }).fill('1000');
    await page.getByRole('textbox', { name: 'Stad' }).fill('Brussel');
    await page.getByRole('textbox', { name: 'Voornaam contactpersoon' }).fill('Test');
    await page.getByRole('textbox', { name: 'Achternaam contactpersoon' }).fill('Persoon');
    await page.getByRole('textbox', { name: 'E-mail contactpersoon' }).fill('test@example.com');
    await page.getByRole('textbox', { name: 'Telefoon contactpersoon' }).fill('+32123456789');
    await page.getByRole('textbox', { name: 'Functie contactpersoon' }).fill('Manager');
    
    // Save the company
    await page.getByRole('button', { name: 'Toevoegen' }).click();
    
    // Wait for the company to appear in the grid
    await page.waitForSelector(`text=${testCompanyName}`);
    
    // Verify the company appears in the grid with correct data
    const companyRow = page.locator('tr').filter({ hasText: testCompanyName });
    await expect(companyRow).toBeVisible();
    await expect(companyRow).toContainText(`${testCompanyName} NV`); // Juridische naam
    await expect(companyRow).toContainText('BE1234567890'); // Ondernemingsnummer
    await expect(companyRow).toContainText('5'); // Werknemers
    await expect(companyRow).toContainText('Actief'); // Status
    
    // Click export button to download Excel file
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Exporteer bedrijven' }).click();
    const download = await downloadPromise;
    
    // Save the downloaded file
    const downloadPath = join(__dirname, '../test-results', 'bedrijven_export.xlsx');
    await download.saveAs(downloadPath);
    
    // Verify the file was downloaded
    expect(existsSync(downloadPath)).toBeTruthy();
    
    // Read and validate Excel file contents
    const workbook = XLSX.readFile(downloadPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Verify our test company is in the exported data
    const exportedCompany = data.find((row: any) => 
      row['Naam'] === testCompanyName || 
      row['Bedrijfsnaam'] === testCompanyName ||
      Object.values(row).some(value => value === testCompanyName)
    );
    
    expect(exportedCompany).toBeDefined();
    
    // Verify the exported data contains key fields (adjust field names based on actual export)
    if (exportedCompany) {
      const companyData = exportedCompany as any;
      
      // Check for company name (could be in different columns)
      const hasCompanyName = Object.values(companyData).some(value => 
        typeof value === 'string' && value.includes(testCompanyName)
      );
      expect(hasCompanyName).toBeTruthy();
      
      // Check for ondernemingsnummer
      const hasOndernemingsnummer = Object.values(companyData).some(value => 
        value === 'BE1234567890'
      );
      expect(hasOndernemingsnummer).toBeTruthy();
      
      // Check for employee count
      const hasEmployeeCount = Object.values(companyData).some(value => 
        value === 5 || value === '5'
      );
      expect(hasEmployeeCount).toBeTruthy();
    }
    
    console.log('✅ Company export to Excel validation completed successfully');
    console.log(`✅ Test company "${testCompanyName}" was created and found in Excel export`);
    console.log(`✅ Excel file saved to: ${downloadPath}`);
    
    // Clean up: Delete the test file
    if (existsSync(downloadPath)) {
      unlinkSync(downloadPath);
    }
    
    // Optional: Clean up the created company via API (if available)
    // This would require implementing the same cleanup logic as in create-company.spec.ts
  });
});
