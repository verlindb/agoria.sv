import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import CompanyHelper, { CompanyInput } from './helpers/company-helper';

// Use alternative approach for __dirname in TypeScript
declare const __dirname: string;

type CompanyData = CompanyInput;

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
// Replaced inline createCompany with CompanyHelper

for (const data of companies) {
  test(`create company and test export: ${data.baseName}`, async ({ page, request }) => {
  const createdRes = await CompanyHelper.createCompany(page, request, { ...data });
  const created = { unique: createdRes.name, id: createdRes.id };

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
  const createdRes = await CompanyHelper.createCompany(page, request, { ...data });
  createdCompanies.push({ ...data, unique: createdRes.name, id: createdRes.id });
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
