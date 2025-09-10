import { test, expect } from '@playwright/test';
import CompanyHelper from './helpers/company-helper';
import TechnicalUnitHelper from './helpers/technical-unit-helper';
import { trackCompany } from './helpers/cleanup';

test.setTimeout(180_000);

test('create company, view detail, add multiple technical units and search', async ({ page, request }) => {
  const created = await CompanyHelper.createCompany(page, request, { baseName: 'E2E-MultiTU', sector: 'Manufacturing', employees: '10', street: 'Flow Street', houseNumber: '42', city: 'Antwerp', postalCode: '2000', contactFirst: 'Alice', contactLast: 'Tester', contactEmailPrefix: 'alice.tester', contactPhone: '+32111222333', contactRole: 'Automation Engineer' });
  trackCompany(created.id);

  // Open detail view
  const row = page.locator('div[role="row"]', { hasText: created.name }).first();
  await row.getByRole('button', { name: /meer acties|more actions|acties/i }).first().click();
  const detailMenu = page.getByRole('menuitem', { name: /bekijken|detail|view/i }).first();
  if (await detailMenu.count()) await detailMenu.click(); else await page.getByText(/bekijken|detail/i).first().click();

  const main = page.getByRole('main').first();
  await expect(main.getByRole('heading', { name: created.name })).toBeVisible();
  await expect(main.getByText(created.legalName, { exact: true })).toBeVisible();
  await expect(main.getByText(created.enterpriseNumber, { exact: true })).toBeVisible();

  // Add three technical units
  for (let i = 1; i <= 3; i++) {
    await TechnicalUnitHelper.addTechnicalUnit(page, {
      code: `TUC${i}-${Date.now()}`.slice(0,12),
      name: `Tech Unit ${i} ${created.name}`,
      afdeling: 'Ops',
      manager: `EMP${i}`,
      employees: 5 + i,
      street: 'TU Street',
      number: String(10 + i),
      postalCode: '3000',
      city: `City${i}`,
      country: 'België',
      taal: 'Vlaanderen',
      pcArbeiders: 'PC 10',
      pcBedienden: 'PC 20',
      dossierNummer: `9${(1000 + i).toString().slice(-4)}`.slice(0,5),
      dossierSuffix: '-1'
    });
  }
});
