import { test, expect } from '@playwright/test';
import CompanyHelper from './helpers/company-helper';

test.setTimeout(120_000);

test('create and delete company end-to-end', async ({ page, request }) => {
  const created = await CompanyHelper.createCompany(page, request, { baseName: 'DeleteTestCompany', sector: 'Retail', employees: '8', city: 'Leuven', street: 'Delete Street', houseNumber: '456', postalCode: '3000', contactFirst: 'Jane', contactLast: 'Smith', contactEmailPrefix: 'jane.smith.delete', contactRole: 'Director', contactPhone: '+32987654321' });

  // Filter and locate row
  const searchInput = page.locator('input[placeholder="Search…"], input[placeholder="Zoek bedrijven..."]').first();
  await searchInput.fill(created.name);
  await page.waitForTimeout(600);
  const row = page.locator('div[role="row"]', { hasText: created.name }).first();
  await expect(row).toBeVisible();

  await row.getByRole('button', { name: /meer acties|more actions|acties/i }).first().click();
  await page.getByRole('menuitem', { name: /verwijderen|delete/i }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: /verwijderen|delete/i }).last().click();
  await page.waitForTimeout(600);
  await expect(page.getByText(/no results found|geen resultaten gevonden/i)).toBeVisible({ timeout: 5000 });

  // Ensure backend deletion (in case UI failed) best-effort
  if (created.id) {
    await request.delete(`${CompanyHelper.BASE}/api/companies/${created.id}`).catch(()=>null);
  }
});
