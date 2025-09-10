import { Page, expect } from '@playwright/test';

export interface TechnicalUnitInput {
  code: string;
  name: string;
  afdeling?: string;
  manager?: string;
  employees?: number; // aantal werknemers
  street?: string;
  number?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  dossierNummer?: string; // FOD dossier
  dossierSuffix?: string; // optional suffix option label
  taal?: string;          // option label e.g. Vlaanderen
  pcArbeiders?: string;   // option label
  pcBedienden?: string;   // option label
}

export class TechnicalUnitHelper {
  static async addTechnicalUnit(page: Page, input: TechnicalUnitInput) {
    // Open add TU dialog
    await page.getByRole('button', { name: /nieuwe eenheid/i }).click();
    const dialog = page.getByRole('dialog', { name: /technische eenheid/i }).first();
    await expect(dialog).toBeVisible({ timeout: 8000 });

    // Generic safe fill by label regex
    async function fillLabel(regex: RegExp, value: string) {
      const field = dialog.getByRole('textbox', { name: regex }).first();
      if (await field.count()) {
        await field.fill(value);
        return;
      }
      // fallback to input whose associated label matches
      const fallback = dialog.locator('label').filter({ hasText: regex }).first();
      if (await fallback.count()) {
        const forAttr = await fallback.getAttribute('for');
        if (forAttr) {
          await dialog.locator(`#${forAttr}`).fill(value).catch(() => null);
        }
      }
    }

    await fillLabel(/code/i, input.code);
    await fillLabel(/naam$/i, input.name);
    if (input.afdeling) await fillLabel(/afdeling/i, input.afdeling);
    if (input.manager) await fillLabel(/manager/i, input.manager);
    if (input.employees != null) await fillLabel(/aantal werknemers/i, String(input.employees));
    await fillLabel(/straat/i, input.street ?? 'TU Street');
    await fillLabel(/nummer$/i, input.number ?? '1');
    await fillLabel(/postcode/i, input.postalCode ?? '3000');
    await fillLabel(/stad/i, input.city ?? 'City');
    await fillLabel(/land/i, input.country ?? 'België');
    if (input.dossierNummer) await fillLabel(/dossiernummer fod werk/i, input.dossierNummer);

    // Select inputs
    if (input.taal) {
      const taal = dialog.getByLabel(/Taal van de TBE/i).first();
      if (await taal.count()) {
        await taal.click().catch(()=>null);
        await page.getByRole('option', { name: new RegExp(input.taal, 'i') }).first().click().catch(()=>null);
      }
    }
    if (input.pcArbeiders) {
      const pcA = dialog.getByLabel(/PC Arbeiders/i).first();
      if (await pcA.count()) {
        await pcA.click().catch(()=>null);
        await page.getByRole('option', { name: new RegExp(input.pcArbeiders, 'i') }).first().click().catch(()=>null);
      }
    }
    if (input.pcBedienden) {
      const pcB = dialog.getByLabel(/PC Bedienden/i).first();
      if (await pcB.count()) {
        await pcB.click().catch(()=>null);
        await page.getByRole('option', { name: new RegExp(input.pcBedienden, 'i') }).first().click().catch(()=>null);
      }
    }
    if (input.dossierSuffix) {
      const suffix = dialog.getByLabel(/FOD Dossier Suffix/i).first();
      if (await suffix.count()) {
        await suffix.click().catch(()=>null);
        await page.getByRole('option', { name: new RegExp(input.dossierSuffix, 'i') }).first().click().catch(()=>null);
      }
    }

    // Submit
    await dialog.getByRole('button', { name: /toevoegen|opslaan/i }).first().click();
    await expect(dialog).toBeHidden({ timeout: 8000 }).catch(()=>null);

    // Verify row in grid
    const grid = page.getByTestId('technical-units-grid');
    await expect(grid).toBeVisible({ timeout: 8000 });
    await expect(grid.locator('div[role="row"]', { hasText: input.code }).first()).toBeVisible({ timeout: 8000 });
  }
}

export default TechnicalUnitHelper;
