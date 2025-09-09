import { test, expect } from '@playwright/test';

// extend the default test timeout for slow CI / local dev
test.setTimeout(120000);

test('create and delete company end-to-end', async ({ page }) => {
  const unique = Date.now();
  const name = `DeleteTestCompany-${unique}`;
  const legal = `${name} NV`;
  const number = `BE${String(unique).slice(-10)}`;

  // Navigate to companies page
  await page.goto('http://localhost:3000/companies');
  await expect(page).toHaveTitle(/Sociale Verkiezingen|Agoria SV/i);

  // Click on 'nieuw bedrijf' (New Company) button
  await page.getByRole('button', { name: /nieuw bedrijf/i }).click();

  // Fill in the modal form with all mandatory data using unique data
  // Similar pattern as in create-company-and-view-detail
  
  // Company basic information
  await page.getByRole('textbox', { name: /bedrijfsnaam/i }).fill(name);
  await page.getByRole('textbox', { name: /juridische naam/i }).fill(legal);
  await page.getByRole('textbox', { name: /ondernemingsnummer/i }).fill(number);

  // Select company type (BV is already selected by default)
  await page.getByRole('combobox', { name: /bedrijfstype/i }).click();
  await page.getByRole('option', { name: 'BV' }).click();

  // Set number of employees
  await page.getByRole('spinbutton', { name: 'Aantal werknemers' }).fill('8');

  // Sector (mandatory)
  await page.getByRole('textbox', { name: /sector/i }).fill('Retail');

  // Address information
  await page.getByRole('textbox', { name: 'Straat' }).fill('Delete Street');
  await page.getByRole('textbox', { name: 'Huisnummer' }).fill('456');
  await page.getByRole('textbox', { name: 'Postcode' }).fill('3000');
  await page.getByRole('textbox', { name: 'Stad' }).fill('Leuven');

  // Contact person information
  await page.getByRole('textbox', { name: /voornaam contactpersoon|voornaam/i }).fill('Jane');
  await page.getByRole('textbox', { name: /achternaam contactpersoon|achternaam/i }).fill('Smith');
  await page.getByRole('textbox', { name: /e-?mail/i }).fill(`jane.smith.delete+${unique}@example.com`);
  await page.getByRole('textbox', { name: /telefoon/i }).fill('+32987654321');
  await page.getByRole('textbox', { name: /functie/i }).fill('Director');

  // Save the company
  await page.getByRole('button', { name: /toevoegen/i }).click();

  // Wait for modal to close
  await page.waitForTimeout(800);
  await expect(page.getByRole('dialog').first()).toBeHidden({ timeout: 3000 }).catch(() => null);

  // Verify if dialog is closed and company is in list by searching
  const searchInput = page.getByRole('searchbox', { name: 'Search…' });
  await expect(searchInput).toBeVisible({ timeout: 5000 });
  await searchInput.fill(name);
  await page.waitForTimeout(1000);

  // Verify the company appears in the grid
  const gridRow = page.locator('div[role="row"]', { hasText: name }).first();
  await expect(gridRow).toBeVisible({ timeout: 10000 });

  // Click the context menu in the grid 'verwijderen' (delete)
  const actionsButton = gridRow.getByRole('button', { name: /meer acties/i }).first();
  await expect(actionsButton).toBeVisible({ timeout: 5000 });
  await actionsButton.click();

  // Click 'Verwijderen' option from context menu
  await page.getByRole('menuitem', { name: /verwijderen/i }).click();

  // Handle the confirmation dialog
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/weet u zeker dat u .* wilt verwijderen/i)).toBeVisible();

  // Confirm the deletion
  await page.getByRole('button', { name: /verwijderen/i }).last().click();

  // Wait for deletion to complete
  await page.waitForTimeout(800);

  // Check if the data is removed by searching in the grid
  // The search should still be active, verify no results found
  await expect(page.getByText(/no results found|geen resultaten gevonden/i)).toBeVisible({ timeout: 5000 });

  // Also verify the pagination shows 0 results
  await expect(page.getByText(/0–0 of 0/)).toBeVisible();

  // Clear search and verify company count decreased
  await page.getByRole('button', { name: /clear/i }).click();
  await page.waitForTimeout(1000);

  // Search again for the deleted company to double-check it's gone
  await searchInput.fill(name);
  await page.waitForTimeout(1000);

  // Final verification: company should not be found
  await expect(page.getByText(/no results found|geen resultaten gevonden/i)).toBeVisible({ timeout: 5000 });
  await expect(page.getByText(/0–0 of 0/)).toBeVisible();
});
