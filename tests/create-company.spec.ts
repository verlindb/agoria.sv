import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

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
  test(`create company: ${data.baseName}`, async ({ page, request }) => {
    const created = await createCompany(page, request, data);

    // Cleanup: delete created company via API if found
    if (created.id) {
      // issue DELETE and wait for success
      const del = await request.delete(`${BASE}/api/companies/${created.id}`);
      expect(del.ok()).toBeTruthy();
    }
  });
}
