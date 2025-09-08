import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('Companies - create flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/companies`);
    await expect(page).toHaveURL(/:\/\/localhost:3000\/companies$/);
  });

  test('create new company fills required fields and shows new row', async ({ page }) => {
    const unique = `E2E Playwright ${Date.now()}`;

    // Open create dialog (use flexible button name matcher)
    const openBtn = page.getByRole('button', { name: /nieuw\s*bedrijf/i });
    await expect(openBtn).toBeVisible({ timeout: 5000 });
    await openBtn.click();

  // (No network mocking: test will use the real API)

    // Fill all required fields observed in manual run
    await page.getByRole('textbox', { name: /bedrijfsnaam/i }).fill(unique);
    await page.getByRole('textbox', { name: /juridische naam/i }).fill(`${unique} BV`);
    await page.getByRole('textbox', { name: /ondernemingsnummer/i }).fill('BE' + String(Date.now()).slice(-10));
    await page.getByRole('spinbutton', { name: /aantal werknemers/i }).fill('10');
    await page.getByRole('textbox', { name: /sector/i }).fill('ICT');

    // Address
    await page.getByRole('textbox', { name: /straat/i }).fill('Kerkstraat');
    // Use the explicit input name to avoid Playwright strict-mode ambiguity with similar labels
    await page.locator('input[name="address.number"]').fill('10A');
    await page.getByRole('textbox', { name: /postcode/i }).fill('1000');
    await page.getByRole('textbox', { name: /stad/i }).fill('Brussel');

    // Contact person
    await page.getByRole('textbox', { name: /voornaam contactpersoon|voornaam/i }).fill('Jan');
    await page.getByRole('textbox', { name: /achternaam contactpersoon|achternaam/i }).fill('Jansen');
    await page.getByRole('textbox', { name: /e-?mail contactpersoon|e-?mail/i }).fill(`jan.jansen+${Date.now()}@example.test`);
    await page.getByRole('textbox', { name: /telefoon contactpersoon|telefoon/i }).fill('+3212345678');
    await page.getByRole('textbox', { name: /functie contactpersoon|functie/i }).fill('Manager');

    // Submit
    const addBtn = page.getByRole('button', { name: /toevoegen|add/i });
    await expect(addBtn).toBeVisible({ timeout: 5000 });

    // Click submit 
    await addBtn.click();
    
    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

  // Then filter the companies list using the search box so the DataGrid renders the new row
  const searchBox = page.getByRole('textbox', { name: /zoek|search/i });
  await expect(searchBox).toBeVisible({ timeout: 5000 });
  await searchBox.fill(unique);
  
  // Wait a bit for the search to complete (localStorage search is immediate)
  await page.waitForTimeout(500);
  
  // Wait for the grid to show the unique name
  const grid = page.locator('[data-testid="companies-grid"]');
  await expect(grid).toContainText(unique, { timeout: 5000 });
  });

  test('create a company and delete it via context menu', async ({ page, request }) => {
    const unique = `E2E Delete ${Date.now()}`;

    // Open create dialog
    const openBtn = page.getByRole('button', { name: /nieuw\s*bedrijf/i });
    await expect(openBtn).toBeVisible({ timeout: 5000 });
    await openBtn.click();

    // Fill required fields
    await page.getByRole('textbox', { name: /bedrijfsnaam/i }).fill(unique);
    await page.getByRole('textbox', { name: /juridische naam/i }).fill(`${unique} BV`);
    await page.getByRole('textbox', { name: /ondernemingsnummer/i }).fill('BE' + String(Date.now()).slice(-10));
    await page.getByRole('spinbutton', { name: /aantal werknemers/i }).fill('2');
    await page.getByRole('textbox', { name: /sector/i }).fill('Test');

    // Address
    await page.getByRole('textbox', { name: /straat/i }).fill('Teststraat');
    await page.locator('input[name="address.number"]').fill('1');
    await page.getByRole('textbox', { name: /postcode/i }).fill('1000');
    await page.getByRole('textbox', { name: /stad/i }).fill('Brussel');

    // Contact person
    await page.getByRole('textbox', { name: /voornaam contactpersoon|voornaam/i }).fill('Piet');
    await page.getByRole('textbox', { name: /achternaam contactpersoon|achternaam/i }).fill('Peeters');
    await page.getByRole('textbox', { name: /e-?mail contactpersoon|e-?mail/i }).fill(`piet.peeters+${Date.now()}@example.test`);
    await page.getByRole('textbox', { name: /telefoon contactpersoon|telefoon/i }).fill('+3200000000');
    await page.getByRole('textbox', { name: /functie contactpersoon|functie/i }).fill('Owner');

    // Submit and wait for creation
    const addBtn = page.getByRole('button', { name: /toevoegen|add/i });
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();

    // Search for the created item
    const searchBox = page.getByRole('textbox', { name: /zoek bedrijven/i });
    await searchBox.fill(unique);
    await page.waitForTimeout(500); // Wait for localStorage search

    // Find the row and open its actions menu
    const row = page.locator('div[role="row"]', { hasText: unique }).first();
    await expect(row).toBeVisible({ timeout: 5000 });
    await row.locator('button[aria-label="Meer acties"]').click();

    // Click the 'Verwijderen' menu item to trigger delete dialog
    await page.getByRole('menuitem', { name: /verwijderen/i }).click();

    // Confirm deletion in dialog
    const dialog = page.getByRole('dialog', { name: /bedrijf verwijderen/i });
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await dialog.getByRole('button', { name: /verwijderen/i }).click();

  // Clear search and assert the row is gone in the UI
  await searchBox.fill('');
  await page.waitForTimeout(500); // Wait for search to clear
  await expect(page.locator('div[role="row"]', { hasText: unique })).toHaveCount(0, { timeout: 5000 });

  // In localStorage mode, the deletion is verified by the UI test above
  });
});
