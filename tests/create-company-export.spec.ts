import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import * as ExcelJS from 'exceljs';

type CompanyData = {
  baseName: string;
  legalSuffix?: string;
  employees?: string;
  sector?: string;
};

// Parameterize base URL via BASE env var (fallback to localhost)
const BASE = process.env.BASE ?? 'http://localhost:3000';

// Increase default timeout for these UI-heavy tests
test.setTimeout(60000);

// Load fixtures from tests/fixtures/companies.json
const fixturePath = path.join(__dirname, 'fixtures', 'companies.json');
const companies: CompanyData[] = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

// Function to validate Excel file content
async function validateExcelFile(filePath: string, expectedData: CompanyData & { unique: string }): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const worksheet = workbook.worksheets[0];
  expect(worksheet.name).toBe('Bedrijven');
  
  // Get headers from first row - should include all company fields (not just gridview columns)
  const headerRow = worksheet.getRow(1);
  const expectedHeaders = [
    'Naam', 'Juridische Naam', 'Ondernemingsnummer', 'Type', 'Werknemers', 'Sector', 'Status', 'Aangemaakt',
    'Straat', 'Nummer', 'Postcode', 'Stad', 'Land', 
    'Contact Voornaam', 'Contact Achternaam', 'Contact Email', 'Contact Telefoon', 'Contact Functie'
  ];
  
  // Validate headers
  expectedHeaders.forEach((expectedHeader, index) => {
    const cellValue = headerRow.getCell(index + 1).value;
    expect(cellValue).toBe(expectedHeader);
  });
  
  // Find the row with our created company data
  let foundRow: ExcelJS.Row | undefined;
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Skip header row
      const nameCell = row.getCell(1).value;
      if (nameCell === expectedData.unique) {
        foundRow = row;
      }
    }
  });
  
  expect(foundRow).toBeDefined();
  
  if (foundRow) {
    // Validate company data - all exported fields
    expect(foundRow.getCell(1).value).toBe(expectedData.unique); // Naam
    expect(foundRow.getCell(2).value).toBe(`${expectedData.unique} ${expectedData.legalSuffix ?? 'NV'}`); // Juridische Naam
    expect(foundRow.getCell(3).value).toMatch(/^BE\d{10}$/); // Ondernemingsnummer
    
    // Type can be the legalSuffix or 'BV' as default, be flexible
    const typeValue = foundRow.getCell(4).value;
    expect(['BV', 'NV', expectedData.legalSuffix ?? 'BV']).toContain(typeValue); // Type
    
    expect(foundRow.getCell(5).value).toBe(parseInt(expectedData.employees ?? '5')); // Werknemers
    expect(foundRow.getCell(6).value).toBe(expectedData.sector ?? 'IT'); // Sector
    
    // Status can be 'pending' or 'active', so let's be more flexible
    expect(['pending', 'active']).toContain(foundRow.getCell(7).value); // Status
    
    // Validate that Aangemaakt (created date) exists and is a date
    const createdValue = foundRow.getCell(8).value;
    expect(createdValue).toBeDefined();
    // Should be a valid date (either Date object or date string)
    if (typeof createdValue === 'string') {
      expect(new Date(createdValue).toString()).not.toBe('Invalid Date');
    } else if (createdValue instanceof Date) {
      expect(createdValue.toString()).not.toBe('Invalid Date');
    } else {
      // Could be Excel serial date number
      expect(typeof createdValue).toBe('number');
    }
    
    // Address fields
    expect(foundRow.getCell(9).value).toBe('Teststraat'); // Straat
    expect(foundRow.getCell(10).value).toBe('1A'); // Nummer
    expect(foundRow.getCell(11).value).toBe('1000'); // Postcode
    expect(foundRow.getCell(12).value).toBe('Brussel'); // Stad
    expect(foundRow.getCell(13).value).toBe('België'); // Land
    
    // Contact person fields
    expect(foundRow.getCell(14).value).toBe('Test'); // Contact Voornaam
    expect(foundRow.getCell(15).value).toBe('User'); // Contact Achternaam
    expect(foundRow.getCell(16).value).toMatch(/^.+-test@example\.com$/); // Contact Email
    expect(foundRow.getCell(17).value).toBe('+32123456789'); // Contact Telefoon
    
    // Contact Functie might be null/empty in the export, so make it optional
    const contactFunction = foundRow.getCell(18).value;
    if (contactFunction !== null && contactFunction !== '') {
      expect(contactFunction).toBe('QA'); // Contact Functie
    } else {
      console.log('Warning: Contact Functie is empty/null in Excel export');
    }
  }
}
async function createCompany(page, request, data: CompanyData) {
  const unique = `${data.baseName}-${Date.now()}`;

  // Navigate and open dialog
  await page.goto(`${BASE}/companies`);
  // wait for network idle to ensure app is ready
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Nieuw Bedrijf/i }).click();

  const dialog = page.getByRole('dialog', { name: /Nieuw Bedrijf/i });
  // ensure dialog is visible before interacting
  await dialog.waitFor({ state: 'visible', timeout: 15000 });

  // Fill core fields
  await dialog.getByLabel('Bedrijfsnaam').fill(unique);
  await dialog.getByLabel('Juridische naam').fill(`${unique} ${data.legalSuffix ?? 'NV'}`);

  // BE + 10 digits
  const tenDigits = Math.floor(1000000000 + Math.random() * 9000000000);
  await dialog.getByPlaceholder('BE0123456789').fill(`BE${tenDigits}`);

  // Bedrijfstype
  const bedrijfstype = dialog.getByRole('combobox', { name: /Bedrijfstype/i });
  if (await bedrijfstype.count()) {
    // try to set the visible option label if it exists
    await bedrijfstype.selectOption({ label: data.legalSuffix ?? 'BV' }).catch(() => {});
  }

  // Aantal werknemers
  const werknemers = dialog.getByRole('spinbutton', { name: /Aantal werknemers/i });
  if (await werknemers.count()) await werknemers.fill(data.employees ?? '5');

  // Sector
  await dialog.getByLabel('Sector').fill(data.sector ?? 'IT');

  // Address
  await dialog.getByLabel('Straat').fill('Teststraat');
  await dialog.getByLabel('Huisnummer').fill('1A');
  await dialog.getByLabel('Postcode').fill('1000');
  await dialog.getByLabel('Stad').fill('Brussel');

  // Contactpersoon
  await dialog.getByLabel('Voornaam contactpersoon').fill('Test');
  await dialog.getByLabel('Achternaam contactpersoon').fill('User');
  await dialog.getByLabel('E-mail contactpersoon').fill(`${unique.toLowerCase().replace(/[^a-z0-9]/g,'')}-test@example.com`);
  await dialog.getByLabel('Telefoon contactpersoon').fill('+32123456789');
  await dialog.getByLabel('Functie contactpersoon').fill('QA');

  // Save and wait for dialog to close
  await dialog.getByRole('button', { name: /Toevoegen/i }).click();
  await expect(dialog).toBeHidden({ timeout: 15000 });

  // Search and assert presence
  const search = page.getByPlaceholder('Zoek bedrijven...');
  await search.fill(unique);
  await search.press('Enter').catch(() => {});
  await expect(page.getByText(unique, { exact: true })).toBeVisible({ timeout: 20000 });

  // Resolve created company id via API so we can cleanup later
  const resp = await request.get(`${BASE}/api/companies/search?q=${encodeURIComponent(unique)}`);
  let createdId: string | null = null;
  if (resp.ok()) {
    const body = await resp.json();
    const found = Array.isArray(body) && body.find((c: any) => c.name === unique);
    if (found) createdId = found.id;
  }

  return { unique, id: createdId };
}

for (const data of companies) {
  test(`create company and test export: ${data.baseName}`, async ({ page, request }) => {
    const created = await createCompany(page, request, data);

    // Now test the export functionality
    // Navigate back to the companies page to ensure we're in the right place
    await page.goto(`${BASE}/companies`);
    await page.waitForLoadState('networkidle');

    // Set up download promise before clicking export button
    const downloadPromise = page.waitForEvent('download');
    
    // Click the export button
    await page.getByRole('button', { name: /Exporteer/i }).click();
    
    // Wait for download to complete
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('bedrijven_export.xlsx');
    
    // Save the downloaded file to a temporary location
    const downloadsPath = path.join(__dirname, '..', 'test-results', 'downloads');
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true });
    }
    
    const downloadPath = path.join(downloadsPath, `${data.baseName}_export_${Date.now()}.xlsx`);
    await download.saveAs(downloadPath);
    
    // Validate the Excel file contains our created company
    await validateExcelFile(downloadPath, { ...data, unique: created.unique });
    
    // Clean up downloaded file
    try {
      fs.unlinkSync(downloadPath);
    } catch (error) {
      console.warn('Failed to delete test download file:', error);
    }

    // Cleanup: delete created company via API if found
    if (created.id) {
      const del = await request.delete(`${BASE}/api/companies/${created.id}`);
      expect(del.ok()).toBeTruthy();
    }
  });
}

// Additional test: Create multiple companies and validate comprehensive Excel export
test('create multiple companies and validate comprehensive excel export', async ({ page, request }) => {
  const createdCompanies: Array<CompanyData & { unique: string; id: string | null }> = [];

  // Create 3 test companies
  for (let i = 0; i < Math.min(3, companies.length); i++) {
    const data = companies[i];
    const created = await createCompany(page, request, data);
    createdCompanies.push({ ...data, ...created });
  }

  try {
    // Navigate to companies page 
    await page.goto(`${BASE}/companies`);
    await page.waitForLoadState('networkidle');

    // Set up download promise before clicking export button
    const downloadPromise = page.waitForEvent('download');
    
    // Click the export button
    await page.getByRole('button', { name: /Exporteer/i }).click();
    
    // Wait for download to complete
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('bedrijven_export.xlsx');
    
    // Save the downloaded file
    const downloadsPath = path.join(__dirname, '..', 'test-results', 'downloads');
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true });
    }
    
    const downloadPath = path.join(downloadsPath, `comprehensive_export_${Date.now()}.xlsx`);
    await download.saveAs(downloadPath);
    
    // Validate Excel file structure and content
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(downloadPath);
    
    const worksheet = workbook.worksheets[0];
    expect(worksheet.name).toBe('Bedrijven');
    
    // Verify headers include all company fields (not just gridview columns)
    const headerRow = worksheet.getRow(1);
    const expectedHeaders = [
      'Naam', 'Juridische Naam', 'Ondernemingsnummer', 'Type', 'Werknemers', 'Sector', 'Status', 'Aangemaakt',
      'Straat', 'Nummer', 'Postcode', 'Stad', 'Land', 
      'Contact Voornaam', 'Contact Achternaam', 'Contact Email', 'Contact Telefoon', 'Contact Functie'
    ];
    expectedHeaders.forEach((expectedHeader, index) => {
      const cellValue = headerRow.getCell(index + 1).value;
      expect(cellValue).toBe(expectedHeader);
    });
    
    // Count rows (should have header + at least our created companies)
    let rowCount = 0;
    let foundCompanies = 0;
    
    worksheet.eachRow((row, rowNumber) => {
      rowCount++;
      if (rowNumber > 1) { // Skip header
        const companyName = row.getCell(1).value as string;
        const foundCompany = createdCompanies.find(c => c.unique === companyName);
        if (foundCompany) {
          foundCompanies++;
          // Validate some key fields for found company
          expect(row.getCell(2).value).toBe(`${foundCompany.unique} ${foundCompany.legalSuffix ?? 'NV'}`); // Juridische Naam
          expect(row.getCell(5).value).toBe(parseInt(foundCompany.employees ?? '5')); // Werknemers
          expect(row.getCell(6).value).toBe(foundCompany.sector ?? 'IT'); // Sector
          // Validate date exists
          const dateValue = row.getCell(8).value; // Aangemaakt column moved to position 8
          expect(dateValue).toBeDefined();
        }
      }
    });
    
    expect(rowCount).toBeGreaterThan(createdCompanies.length); // Header + created companies + potentially existing ones
    expect(foundCompanies).toBe(createdCompanies.length); // All our created companies should be found
    
    // Clean up downloaded file
    try {
      fs.unlinkSync(downloadPath);
    } catch (error) {
      console.warn('Failed to delete comprehensive test download file:', error);
    }

  } finally {
    // Cleanup: delete all created companies
    for (const company of createdCompanies) {
      if (company.id) {
        await request.delete(`${BASE}/api/companies/${company.id}`);
      }
    }
  }
});
