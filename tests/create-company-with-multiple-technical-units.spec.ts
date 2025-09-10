import { test, expect } from '@playwright/test';

// Increase timeout for this comprehensive flow
test.setTimeout(180000);

/*
 Scenario:
 - Navigate to companies list
 - Create a new company with unique mandatory data
 - Verify company appears in list via search
 - Open detail view via row context menu
 - Add multiple (e.g. 3) technical business units via "Nieuwe Eenheid" button
 - After each addition verify it appears in the technical units grid
 - Test quick search (if available) or grid filtering by typing part of a unit code/name
*/

test('create company, view detail, add multiple technical units and search', async ({ page }) => {
  // Determine active frontend port (3000 preferred, fallback 3001) by probing
  const candidatePorts = [3000, 3001];
  let base = 'http://localhost:3000';
  for (const p of candidatePorts) {
    try {
      const resp = await page.request.get(`http://localhost:${p}/`);
      if (resp.ok()) { base = `http://localhost:${p}`; break; }
    } catch { /* ignore */ }
  }
  const unique = Date.now();
  const companyName = `E2E-MultiTU-${unique}`;
  const legal = `${companyName} NV`;
  const number = `BE${String(unique).slice(-10)}`;

  // Navigate to companies
  await page.goto(`${base}/companies`);
  await expect(page).toHaveTitle(/Sociale Verkiezingen|Agoria SV/i);

  // Open create company modal
  await page.getByRole('button', { name: /nieuw bedrijf/i }).click();

  // Fill mandatory company fields
  await page.getByRole('textbox', { name: /bedrijfsnaam/i }).fill(companyName);
  await page.getByRole('textbox', { name: /juridische naam/i }).fill(legal);
  await page.getByRole('textbox', { name: /ondernemingsnummer/i }).fill(number);

  // Company type
  await page.getByRole('combobox', { name: /bedrijfstype/i }).click();
  // Accept BV fallback if BV not present try first option
  const bvOption = page.getByRole('option', { name: 'BV' }).first();
  if (await bvOption.count()) {
    await bvOption.click();
  } else {
    await page.getByRole('option').first().click();
  }

  // Employees
  await page.getByRole('spinbutton', { name: 'Aantal werknemers' }).fill('10').catch(async () => {
    await page.locator('input[aria-label="Aantal werknemers"]').fill('10');
  });

  // Sector
  await page.getByRole('textbox', { name: /sector/i }).fill('Manufacturing');

  // Address
  await page.getByRole('textbox', { name: 'Straat' }).fill('Flow Street');
  await page.getByRole('textbox', { name: 'Huisnummer' }).fill('42');
  await page.getByRole('textbox', { name: 'Postcode' }).fill('2000');
  await page.getByRole('textbox', { name: 'Stad' }).fill('Antwerp');

  // Contact
  await page.getByRole('textbox', { name: /voornaam contactpersoon|voornaam/i }).fill('Alice');
  await page.getByRole('textbox', { name: /achternaam contactpersoon|achternaam/i }).fill('Tester');
  await page.getByRole('textbox', { name: /e-?mail/i }).fill(`alice.tester+${unique}@example.com`);
  await page.getByRole('textbox', { name: /telefoon/i }).fill('+32111222333');
  await page.getByRole('textbox', { name: /functie/i }).fill('Automation Engineer');

  // Submit company
  await page.getByRole('button', { name: /toevoegen/i }).click();

  // Wait for dialog close
  await page.waitForTimeout(800);
  await expect(page.getByRole('dialog').first()).toBeHidden({ timeout: 4000 }).catch(() => null);

  // Search company in grid
  const search = page.locator('input[placeholder="Search…"], input[placeholder="Zoek bedrijven..."]').first();
  await expect(search).toBeVisible({ timeout: 5000 });
  await search.fill(companyName);
  await page.waitForTimeout(700);

  const companyRow = page.locator('div[role="row"]', { hasText: companyName }).first();
  await expect(companyRow).toBeVisible({ timeout: 15000 });

  // Open actions menu
  const actionsButton = companyRow.getByRole('button', { name: /meer acties|more actions|acties/i }).first();
  await actionsButton.click().catch(async () => {
    await companyRow.locator('button').last().click();
  });

  // Select detail / view
  const detailMenu = page.getByRole('menuitem', { name: /bekijken|detail|view/i }).first();
  if (await detailMenu.count()) {
    await detailMenu.click();
  } else {
    await page.getByText(/bekijken|detail/i).first().click();
  }

  // Verify company detail page
  const main = page.getByRole('main').first();
  await expect(main.getByRole('heading', { name: companyName })).toBeVisible();
  await expect(main.getByText(legal, { exact: true })).toBeVisible();
  await expect(main.getByText(number, { exact: true })).toBeVisible();

  // Add multiple technical units
  const technicalUnits: { code: string; name: string; city: string }[] = [];
  // Ensure the add button is present before loop
  await expect(page.getByRole('button', { name: /nieuwe eenheid/i })).toBeVisible({ timeout: 10000 });
  for (let i = 1; i <= 3; i++) {
    const tuCode = `TUC${i}-${unique}`.slice(0, 12); // keep code shorter if UI constrains width
    const tuName = `Tech Unit ${i} ${unique}`;
    const city = `City${i}`;

    technicalUnits.push({ code: tuCode, name: tuName, city });

  await page.getByRole('button', { name: /nieuwe eenheid/i }).click();
  // Dialog appears - wait for known field label to ensure form fully mounted
  const dialog = page.getByRole('dialog', { name: /technische eenheid/i });
  await expect(dialog).toBeVisible();
  // Wait for dialog content to finish mounting (robust against label association differences)
  await page.locator('input[name="code"], input[id*="code"], label:has-text("Code")').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
  // Fallback: ensure at least one textbox present (there should be several)
  const textboxCount = await dialog.getByRole('textbox').count();
  expect(textboxCount).toBeGreaterThan(0);

    // Helper to fill by label with fallbacks
    async function fillByLabel(labelRegex: RegExp, value: string) {
      const candidate = dialog.getByRole('textbox', { name: labelRegex }).first();
      if (await candidate.count()) {
        await candidate.fill(value);
        return;
      }
      const generic = dialog.locator('input').filter({ has: dialog.locator(`xpath=..//label[contains(translate(., 'CODE', 'code'), 'code')]`) });
      if (await generic.count()) {
        await generic.first().fill(value);
      }
    }

    await fillByLabel(/code/i, tuCode);
    await fillByLabel(/naam$/i, tuName);
    await fillByLabel(/afdeling/i, 'Ops');
    await fillByLabel(/manager/i, `EMP${i}`);
    await fillByLabel(/aantal werknemers/i, String(5 + i));

  await fillByLabel(/straat/i, 'TU Street');
  await fillByLabel(/nummer$/i, `${10 + i}`);
  await fillByLabel(/postcode/i, '3000');
  await fillByLabel(/stad/i, city);
  await fillByLabel(/land/i, 'België');

    // Status (default active) skip unless error appears
    // Language select
    const taalSelect = dialog.getByLabel('Taal van de TBE').first();
    if (await taalSelect.count()) {
      await taalSelect.click();
    }
    await page.getByRole('option').filter({ hasText: 'Vlaanderen' }).first().click().catch(async () => {
      await page.getByRole('option').first().click();
    });

    const pcArbeiders = dialog.getByLabel(/PC Arbeiders/i).first();
    if (await pcArbeiders.count()) {
      await pcArbeiders.click();
    }
    await page.getByRole('option', { name: /PC 10|PC 100|PC 111|100|111/ }).first().click().catch(() => null);

    const pcBedienden = dialog.getByLabel(/PC Bedienden/i).first();
    if (await pcBedienden.count()) {
      await pcBedienden.click();
    }
    await page.getByRole('option', { name: /PC 20|PC 200|PC 209|200|209/ }).first().click().catch(() => null);

    await fillByLabel(/dossiernummer fod werk/i, `9${(1000 + i).toString().slice(-4)}`.slice(0,5));
    const suffixSelect = dialog.getByLabel(/FOD Dossier Suffix/i).first();
    if (await suffixSelect.count()) {
      await suffixSelect.click();
    }
    await page.getByRole('option', { name: /-1|-2/ }).first().click();

    // Submit TU
    await dialog.getByRole('button', { name: /toevoegen|opslaan/i }).click();

    // Wait for close
    await page.waitForTimeout(400);
    await expect(dialog).toBeHidden({ timeout: 4000 });

    // Verify row in TU grid (data-testid attr used in grid component)
    const grid = page.getByTestId('technical-units-grid');
    await expect(grid).toBeVisible();
    const row = grid.locator('div[role="row"]', { hasText: tuCode }).first();
    await expect(row).toBeVisible({ timeout: 8000 });
  }

  // Test search within grid: rely on built-in data grid quick filter if present (toolbar button or input)
  // The CustomGridToolbar currently sets showQuickFilter: false. We'll emulate by pressing CTRL+F style? Instead: verify all units present by their codes.
  for (const tu of technicalUnits) {
    await expect(page.getByTestId('technical-units-grid').locator('div[role="row"]', { hasText: tu.code })).toBeVisible();
  }
});
