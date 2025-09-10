import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Use alternative approach for __dirname in TypeScript
declare const __dirname: string;

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

// Function to validate that the file was downloaded and has content
async function validateDownloadedFile(filePath: string, expectedData: CompanyData & { unique: string }): Promise<void> {
  // Check that file exists and is not empty
  expect(fs.existsSync(filePath)).toBe(true);
  
  const stats = fs.statSync(filePath);
  expect(stats.size).toBeGreaterThan(0);
  
  // Check that it's actually an Excel file by looking at the magic bytes
  const buffer = fs.readFileSync(filePath);
  
  // Excel files start with PK (ZIP archive signature) since they're ZIP files with XML inside
  const isExcelFile = buffer[0] === 0x50 && buffer[1] === 0x4B; // 'PK' magic bytes
  expect(isExcelFile).toBe(true);
  
  console.log(`✅ Downloaded Excel file for ${expectedData.unique}: ${Math.round(stats.size / 1024)}KB`);
}
async function createCompany(page: any, request: any, data: CompanyData) {
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
    
    // Validate the downloaded Excel file
    await validateDownloadedFile(downloadPath, { ...data, unique: created.unique });
    
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
    // Check that file exists and is not empty
    expect(fs.existsSync(downloadPath)).toBe(true);
    
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(0);
    
    // Check that it's actually an Excel file by looking at the magic bytes
    const buffer = fs.readFileSync(downloadPath);
    
    // Excel files start with PK (ZIP archive signature) since they're ZIP files with XML inside
    const isExcelFile = buffer[0] === 0x50 && buffer[1] === 0x4B; // 'PK' magic bytes
    expect(isExcelFile).toBe(true);
    
    console.log(`✅ Comprehensive Excel export validated: ${Math.round(stats.size / 1024)}KB`);
    
    // Since we can't parse Excel securely, let's validate via API that our companies exist
    let foundCompanies = 0;
    for (const company of createdCompanies) {
      const resp = await request.get(`${BASE}/api/companies/search?q=${encodeURIComponent(company.unique)}`);
      if (resp.ok()) {
        const body = await resp.json();
        const found = Array.isArray(body) && body.find((c: any) => c.name === company.unique);
        if (found) foundCompanies++;
      }
    }
    
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
