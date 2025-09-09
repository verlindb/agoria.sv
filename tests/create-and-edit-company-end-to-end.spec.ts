import { test, expect } from '@playwright/test';

// extend the default test timeout for slow CI / local dev
test.setTimeout(120000);

test('create and edit company end-to-end', async ({ page }) => {
  const unique = Date.now();
  const name = `TestCompany-${unique}`;
  const legal = `${name} NV`;
  const number = `BE0${String(unique).slice(-9)}`;
  const updatedName = `${name}-UPDATED`;

  // Navigate to companies page
  await page.goto('http://localhost:3000/companies');
  await expect(page).toHaveTitle(/Sociale Verkiezingen|Agoria SV/i);

  // Click on 'nieuw bedrijf' (New Company) button
  await page.getByRole('button', { name: /nieuw bedrijf/i }).click();

  // Fill in the modal form with all mandatory data using unique data
  // Company basic information
  await page.getByRole('textbox', { name: /bedrijfsnaam/i }).fill(name);
  await page.getByRole('textbox', { name: /juridische naam/i }).fill(legal);
  await page.getByRole('textbox', { name: /ondernemingsnummer/i }).fill(number);

  // Select company type (BV is already selected by default)
  await page.getByRole('combobox', { name: /bedrijfstype/i }).click();
  await page.getByRole('option', { name: 'BV' }).click();

  // Set number of employees
  await page.getByRole('spinbutton', { name: 'Aantal werknemers' }).fill('10');

  // Sector (mandatory)
  await page.getByRole('textbox', { name: /sector/i }).fill('Technology');

  // Address information
  await page.getByRole('textbox', { name: 'Straat' }).fill('Test Street');
  await page.getByRole('textbox', { name: 'Huisnummer' }).fill('123');
  await page.getByRole('textbox', { name: 'Postcode' }).fill('2000');
  await page.getByRole('textbox', { name: 'Stad' }).fill('Antwerp');

  // Contact person information
  await page.getByRole('textbox', { name: /voornaam contactpersoon|voornaam/i }).fill('John');
  await page.getByRole('textbox', { name: /achternaam contactpersoon|achternaam/i }).fill('Doe');
  await page.getByRole('textbox', { name: /e-?mail/i }).fill(`john.doe+${unique}@example.com`);
  await page.getByRole('textbox', { name: /telefoon/i }).fill('+32123456789');
  await page.getByRole('textbox', { name: /functie/i }).fill('Manager');

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

  // Click the context menu in the grid 'bewerken' (edit)
  const actionsButton = gridRow.getByRole('button', { name: /meer acties/i }).first();
  await expect(actionsButton).toBeVisible({ timeout: 5000 });
  await actionsButton.click();

  // Click 'Bewerken' option from context menu
  await page.getByRole('menuitem', { name: /bewerken/i }).click();

  // Wait for edit modal to open
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

  // Update some data in the modal
  await page.getByRole('textbox', { name: /bedrijfsnaam/i }).fill(updatedName);
  await page.getByRole('spinbutton', { name: 'Aantal werknemers' }).fill('15');
  await page.getByRole('textbox', { name: /functie/i }).fill('Senior Manager');

  // Save the changes
  await page.getByRole('button', { name: /opslaan/i }).click();

  // Wait for modal to close
  await page.waitForTimeout(800);
  await expect(page.getByRole('dialog').first()).toBeHidden({ timeout: 3000 }).catch(() => null);

  // Check if the data is saved by searching in the grid
  await searchInput.fill(updatedName);
  await page.waitForTimeout(1000);

  // Verify the updated company appears in the grid with updated data
  const updatedGridRow = page.locator('div[role="row"]', { hasText: updatedName }).first();
  await expect(updatedGridRow).toBeVisible({ timeout: 10000 });

  // Verify that the number of employees was updated to 15
  await expect(updatedGridRow.getByText('15')).toBeVisible();

  // Verify the company name was updated
  await expect(updatedGridRow.getByText(updatedName)).toBeVisible();
});
