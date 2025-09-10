import { test, expect } from '@playwright/test';
import CompanyHelper from './helpers/company-helper';
import { NavigationHelper } from './helpers/navigation-helper';
import { GridHelper } from './helpers/grid-helper';
import { FormHelper } from './helpers/form-helper';

test.setTimeout(120_000);

test('create and delete company end-to-end', async ({ page, request }) => {
  // Initialize helpers
  const navigation = new NavigationHelper(page);
  const grid = new GridHelper(page);
  const form = new FormHelper(page);

  const created = await CompanyHelper.createCompany(page, request, { 
    baseName: 'DeleteTestCompany', 
    sector: 'Retail', 
    employees: '8', 
    city: 'Leuven', 
    street: 'Delete Street', 
    houseNumber: '456', 
    postalCode: '3000', 
    contactFirst: 'Jane', 
    contactLast: 'Smith', 
    contactEmailPrefix: 'jane.smith.delete', 
    contactRole: 'Director', 
    contactPhone: '+32987654321' 
  });

  // Search for the created company using grid helper
  await grid.search(created.name);
  await grid.expectRowExists(created.name);

  // Delete the company using grid helper
  await grid.clickRowAction(created.name, 'button[name*="meer acties"], button[name*="more actions"], button[name*="acties"]');
  await page.getByRole('menuitem', { name: /verwijderen|delete/i }).first().click();
  
  // Confirm deletion in modal
  await form.waitForModal();
  await page.getByRole('button', { name: /verwijderen|delete/i }).last().click();
  await form.waitForModalToClose();

  // Verify company is deleted - grid should be empty or show no results
  await page.waitForTimeout(600);
  await expect(page.getByText(/no results found|geen resultaten gevonden|no rows/i)).toBeVisible({ timeout: 5000 });

  // Ensure backend deletion (in case UI failed) best-effort
  if (created.id) {
    await request.delete(`${CompanyHelper.BASE}/api/companies/${created.id}`).catch(()=>null);
  }
});
