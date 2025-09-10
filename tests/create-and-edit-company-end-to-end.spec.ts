import { test, expect } from '@playwright/test';
import CompanyHelper from './helpers/company-helper';
import { NavigationHelper } from './helpers/navigation-helper';
import { GridHelper } from './helpers/grid-helper';
import { FormHelper } from './helpers/form-helper';
import { trackCompany } from './helpers/cleanup';

test.setTimeout(120_000);

test('create and edit company end-to-end', async ({ page, request }) => {
  // Initialize helpers
  const navigation = new NavigationHelper(page);
  const grid = new GridHelper(page);
  const form = new FormHelper(page);

  const created = await CompanyHelper.createCompany(page, request, { 
    baseName: 'TestCompany', 
    employees: '10', 
    sector: 'Technology' 
  });
  trackCompany(created.id);

  // Search for the created company using grid helper
  await grid.search(created.name);
  await grid.expectRowExists(created.name);

  // Find the row and click actions menu manually (more reliable)
  const row = page.locator('div[role="row"]', { hasText: created.name }).first();
  await row.getByRole('button', { name: /meer acties|more actions|acties/i }).first().click();
  await page.getByRole('menuitem', { name: /bewerken|edit/i }).first().click();
  
  // Wait for modal to appear
  await form.waitForModal();

  const updatedName = `${created.name}-UPDATED`;
  
  // Fill updated form data
  await page.getByRole('textbox', { name: /bedrijfsnaam/i }).fill(updatedName);
  await page.getByRole('spinbutton', { name: /aantal werknemers/i }).fill('15').catch(()=>null);
  await page.getByRole('textbox', { name: /functie/i }).fill('Senior Manager');
  
  // Save changes
  await page.getByRole('button', { name: /opslaan/i }).first().click();
  await form.waitForModalToClose();

  // Search for updated company
  await grid.search(updatedName);
  await grid.expectRowExists(updatedName);
  await grid.expectRowExists('15'); // Check updated employee count
});
