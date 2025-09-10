import { test, expect } from '@playwright/test';
import CompanyHelper from './helpers/company-helper';
import { trackCompany } from './helpers/cleanup';

test.setTimeout(120_000);

test('create company and view detail', async ({ page, request }) => {
  const created = await CompanyHelper.createCompany(page, request, { baseName: 'E2E-Company' });
  trackCompany(created.id);

  // Row already verified by helper; open actions and view detail
  const row = page.locator('div[role="row"]', { hasText: created.name }).first();
  const actionsButton = row.getByRole('button', { name: /meer acties|more actions|acties/i }).first();
  await actionsButton.click().catch(async () => await row.locator('button').last().click());

  const detailMenu = page.getByRole('menuitem', { name: /bekijken|detail|view/i }).first();
  if (await detailMenu.count()) {
    await detailMenu.click();
  } else {
    await page.getByText(/bekijken|detail/i).first().click();
  }

  const main = page.getByRole('main').first();
  await expect(main.getByRole('heading', { name: created.name })).toBeVisible({ timeout: 5000 });
  await expect(main.getByText(created.legalName, { exact: true })).toBeVisible();
  await expect(main.getByText(created.enterpriseNumber, { exact: true })).toBeVisible();
});
