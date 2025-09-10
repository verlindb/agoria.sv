import { test, expect } from '@playwright/test';
import CompanyHelper from './helpers/company-helper';
import { trackCompany } from './helpers/cleanup';

test.setTimeout(120_000);

test('create and edit company end-to-end', async ({ page, request }) => {
  const created = await CompanyHelper.createCompany(page, request, { baseName: 'TestCompany', employees: '10', sector: 'Technology' });
  trackCompany(created.id);

  // Search input already filtered once; ensure it's visible
  const searchInput = page.locator('input[placeholder="Search…"], input[placeholder="Zoek bedrijven..."]').first();
  await searchInput.fill(created.name);
  await page.waitForTimeout(500);
  const row = page.locator('div[role="row"]', { hasText: created.name }).first();
  await expect(row).toBeVisible();

  // Open edit
  await row.getByRole('button', { name: /meer acties|more actions|acties/i }).first().click();
  await page.getByRole('menuitem', { name: /bewerken|edit/i }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();

  const updatedName = `${created.name}-UPDATED`;
  await page.getByRole('textbox', { name: /bedrijfsnaam/i }).fill(updatedName);
  await page.getByRole('spinbutton', { name: /aantal werknemers/i }).fill('15').catch(()=>null);
  await page.getByRole('textbox', { name: /functie/i }).fill('Senior Manager');
  await page.getByRole('button', { name: /opslaan/i }).first().click();
  await expect(page.getByRole('dialog').first()).toBeHidden({ timeout: 5000 }).catch(()=>null);

  await searchInput.fill(updatedName);
  await page.waitForTimeout(600);
  const updatedRow = page.locator('div[role="row"]', { hasText: updatedName }).first();
  await expect(updatedRow).toBeVisible();
  await expect(updatedRow.getByText('15')).toBeVisible();
});
