import { test, expect } from '@playwright/test';
import CompanyHelper from './helpers/company-helper';
import { NavigationHelper } from './helpers/navigation-helper';
import { GridHelper } from './helpers/grid-helper';
import { FormHelper } from './helpers/form-helper';
import { trackCompany } from './helpers/cleanup';

test.setTimeout(120_000);

test('create company and view detail', async ({ page, request }) => {
  // Initialize helpers
  const navigation = new NavigationHelper(page);
  const grid = new GridHelper(page);
  const form = new FormHelper(page);

  const created = await CompanyHelper.createCompany(page, request, { baseName: 'E2E-Company' });
  trackCompany(created.id);

  // Navigate to company detail page using navigation helper
  await navigation.navigateToCompanyDetail(created.name);

  // Verify we're on the company detail page
  const main = page.getByRole('main').first();
  await expect(main.getByRole('heading', { name: created.name })).toBeVisible({ timeout: 5000 });
  await expect(main.getByText(created.legalName, { exact: true })).toBeVisible();
  await expect(main.getByText(created.enterpriseNumber, { exact: true })).toBeVisible();
});
