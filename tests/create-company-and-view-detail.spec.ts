import { test, expect } from '@playwright/test';

// extend the default test timeout for slow CI / local dev
test.setTimeout(120000);

test('create company and view detail', async ({ page }) => {
  const unique = Date.now();
  const name = `E2E-Company-${unique}`;
  const legal = `${name} NV`;
  const number = `BE${String(unique).slice(-10)}`;

  // Navigate to companies
  await page.goto('http://localhost:3000/companies');
  await expect(page).toHaveTitle(/Sociale Verkiezingen|Agoria SV/i);

  // Open create modal
  await page.getByRole('button', { name: /nieuw bedrijf/i }).click();

  // Fill mandatory fields
  await page.getByRole('textbox', { name: /bedrijfsnaam/i }).fill(name);
  await page.getByRole('textbox', { name: /juridische naam/i }).fill(legal);
  await page.getByRole('textbox', { name: /ondernemingsnummer/i }).fill(number);

  // Select type
  await page.getByRole('combobox', { name: /bedrijfstype/i }).click();
  await page.getByRole('option', { name: 'BV' }).click();

  // Ensure employees is >= 1 to satisfy validation
  await page.getByRole('spinbutton', { name: 'Aantal werknemers' }).fill('7').catch(() =>
    page.locator('input[aria-label="Aantal werknemers"]').fill('7')
  );

  // Sector (mandatory in UI)
  await page.getByRole('textbox', { name: /sector/i }).fill('Technology');

  // Address minimal (use exact labels to avoid ambiguous matches)
  await page.getByRole('textbox', { name: 'Straat' }).fill('The Test Street');
  await page.getByRole('textbox', { name: 'Huisnummer' }).fill('314');
  await page.getByRole('textbox', { name: 'Postcode' }).fill('1000');
  await page.getByRole('textbox', { name: 'Stad' }).fill('Brussels');

  // Contact person minimal
  await page.getByRole('textbox', { name: /voornaam contactpersoon|voornaam/i }).fill('John');
  await page.getByRole('textbox', { name: /achternaam contactpersoon|achternaam/i }).fill('Doe');
  await page.getByRole('textbox', { name: /e-?mail/i }).fill(`john.doe+${unique}@example.com`);
  await page.getByRole('textbox', { name: /telefoon/i }).fill('+32123456789');
  await page.getByRole('textbox', { name: /functie/i }).fill('QA Engineer');

  // Submit
  await page.getByRole('button', { name: /toevoegen/i }).click();

  // Wait for modal to close (best-effort)
  await page.waitForTimeout(800);
  await expect(page.getByRole('dialog').first()).toBeHidden({ timeout: 3000 }).catch(() => null);

  // Search in table using either English or Dutch placeholder
  const search = page.locator('input[placeholder="Search…"], input[placeholder="Zoek bedrijven..."]');
  const searchInput = search.first();
  await expect(searchInput).toBeVisible({ timeout: 5000 });
  await searchInput.fill(name);
  await page.waitForTimeout(800);

  // Verify row exists in grid (use grid row role for Material UI DataGrid)
  const gridRow = page.locator('div[role="row"]', { hasText: name }).first();
  await expect(gridRow).toBeVisible({ timeout: 15000 });

  // Open row actions (button labelled 'Meer acties' / 'More actions')
  const actionsButton = gridRow.getByRole('button', { name: /meer acties|more actions|meer actie|acties/i }).first();
  await expect(actionsButton).toBeVisible({ timeout: 5000 });
  await actionsButton.click().catch(async () => await gridRow.locator('button').last().click());

  // Click the detail/view action. App is NL; prefer 'Bekijken' but allow fallbacks.
  const detailMenu = page.getByRole('menuitem', { name: /bekijken|bekijk|detail|view/i }).first();
  await detailMenu.waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
  if (await detailMenu.count() > 0) {
    await detailMenu.click();
  } else {
    await page.getByText(/^Bekijken$/i).first().click().catch(async () => await page.getByText(/detail/i).first().click());
  }

  // Verify detail view shows company data scoped to the main content (avoid duplicates in nav)
  const main = page.getByRole('main').first();
  // Company name is rendered as a heading in the main region
  await expect(main.getByRole('heading', { name })).toBeVisible({ timeout: 5000 });
  // Legal name and number appear in the bedrijfsinformatie section
  await expect(main.getByText(legal, { exact: true })).toBeVisible();
  await expect(main.getByText(number, { exact: true })).toBeVisible();
});
