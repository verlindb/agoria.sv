import { Page, APIRequestContext, expect } from '@playwright/test';

/**
 * High-level input model for creating a company via the UI.
 * Only a subset is required; sensible defaults are applied for the rest.
 */
export interface CompanyInput {
  baseName: string;               // Logical base name used to build a unique company name
  legalSuffix?: string;           // e.g. NV, BV
  employees?: string;             // numeric string for employees count
  sector?: string;                // sector label
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  contactFirst?: string;
  contactLast?: string;
  contactEmailPrefix?: string;    // prefix before +unique@example.com
  contactPhone?: string;
  contactRole?: string;
}

export interface CreatedCompanyResult {
  /** Generated unique (display) name used inside the grid */
  name: string;
  /** Generated legal name */
  legalName: string;
  /** Enterprise number (ondernemingsnummer) */
  enterpriseNumber: string;
  /** Backend identifier resolved via search API (if available) */
  id: string | null;
}

/**
 * Reusable helper for company creation inside Playwright tests.
 * Consolidates the duplicated logic across multiple specs while adding a small
 * amount of resiliency around selector variations observed in the existing tests.
 */
export class CompanyHelper {
  /** Base frontend URL (overridable via BASE env variable inside tests) */
  static readonly BASE = process.env.BASE ?? 'http://localhost:3000';

  /** Default values applied when fields are not provided */
  private static defaults: Required<CompanyInput> = {
    baseName: 'AutoCompany',
    legalSuffix: 'NV',
    employees: '5',
    sector: 'IT',
    street: 'Teststraat',
    houseNumber: '1A',
    postalCode: '1000',
    city: 'Brussel',
    contactFirst: 'Test',
    contactLast: 'User',
    contactEmailPrefix: 'test.user',
    contactPhone: '+32123456789',
    contactRole: 'QA'
  };

  /** Build a timestamp-based unique suffix */
  private static uniqueSuffix(): number { return Date.now(); }

  /**
   * Main public convenience: create a company via the UI and resolve its backend id (if possible).
   * @param page Playwright Page
   * @param request Playwright APIRequestContext for backend lookups & cleanup
   * @param overrides Partial field overrides (baseName mandatory at least)
   */
  static async createCompany(page: Page, request: APIRequestContext, overrides: Partial<CompanyInput> & Pick<CompanyInput,'baseName'>): Promise<CreatedCompanyResult> {
    const data = { ...this.defaults, ...overrides } as CompanyInput & typeof CompanyHelper.defaults;
    const uniquePart = this.uniqueSuffix();
    const name = `${data.baseName}-${uniquePart}`;
    const legalName = `${name} ${data.legalSuffix ?? 'NV'}`;
    const enterpriseNumber = this.randomEnterpriseNumber(uniquePart);

    await this.gotoCompanies(page);
    await this.openCreateDialog(page);
    await this.fillCoreFields(page, { name, legalName, enterpriseNumber, data });
    await this.fillAddress(page, data);
    await this.fillContact(page, data, uniquePart);
    await this.submit(page);
    await this.verifyInGrid(page, name);
    const id = await this.resolveId(request, name);

    return { name, legalName, enterpriseNumber, id };
  }

  /** Navigate to companies list with network idle wait */
  private static async gotoCompanies(page: Page) {
    await page.goto(`${this.BASE}/companies`);
    await page.waitForLoadState('networkidle').catch(() => null);
  }

  /** Click the New Company button & wait for dialog */
  private static async openCreateDialog(page: Page) {
    const button = page.getByRole('button', { name: /nieuw bedrijf/i });
    await button.first().click();
    const dialog = page.getByRole('dialog');
    // Wait until at least the "Bedrijfsnaam" textbox is visible
    await dialog.getByRole('textbox', { name: /bedrijfsnaam/i }).first().waitFor({ state: 'visible', timeout: 15000 });
  }

  private static async fillCoreFields(page: Page, opts: { name: string; legalName: string; enterpriseNumber: string; data: CompanyInput }) {
    const { name, legalName, enterpriseNumber, data } = opts;
    await page.getByRole('textbox', { name: /bedrijfsnaam/i }).fill(name);
    await page.getByRole('textbox', { name: /juridische naam/i }).fill(legalName);
    // Enterprise number textbox (placeholder variant OR label fallback)
    const numberField = page.getByRole('textbox', { name: /ondernemingsnummer/i }).first();
    if (await numberField.count()) {
      await numberField.fill(enterpriseNumber);
    } else {
      // Fallback by placeholder pattern
      await page.locator('input[placeholder^="BE"]').first().fill(enterpriseNumber);
    }

    // Company type (try selecting by visible option; swallow errors if UI changes) 
    const typeCombo = page.getByRole('combobox', { name: /bedrijfstype/i }).first();
    if (await typeCombo.count()) {
      await typeCombo.click().catch(() => null);
      const target = page.getByRole('option', { name: /BV|NV/ }).first();
      if (await target.count()) await target.click().catch(() => null);
    }

    // Employees spinbutton (fallback to aria-label index) 
    const employeeField = page.getByRole('spinbutton', { name: /aantal werknemers/i }).first();
    if (await employeeField.count()) {
      await employeeField.fill(data.employees ?? '5');
    } else {
      await page.locator('input[aria-label="Aantal werknemers"]').fill(data.employees ?? '5').catch(() => null);
    }

    // Sector mandatory
    const sectorField = page.getByRole('textbox', { name: /sector/i }).first();
    if (await sectorField.count()) await sectorField.fill(data.sector ?? 'IT');
  }

  private static async fillAddress(page: Page, data: CompanyInput) {
    await page.getByRole('textbox', { name: /^Straat$/i }).fill(data.street ?? this.defaults.street);
    await page.getByRole('textbox', { name: /^Huisnummer$/i }).fill(data.houseNumber ?? this.defaults.houseNumber);
    await page.getByRole('textbox', { name: /^Postcode$/i }).fill(data.postalCode ?? this.defaults.postalCode);
    await page.getByRole('textbox', { name: /^Stad$/i }).fill(data.city ?? this.defaults.city);
  }

  private static async fillContact(page: Page, data: CompanyInput, uniquePart: number) {
    await page.getByRole('textbox', { name: /voornaam contactpersoon|voornaam/i }).fill(data.contactFirst ?? this.defaults.contactFirst);
    await page.getByRole('textbox', { name: /achternaam contactpersoon|achternaam/i }).fill(data.contactLast ?? this.defaults.contactLast);
    await page.getByRole('textbox', { name: /e-?mail/i }).fill(`${(data.contactEmailPrefix ?? this.defaults.contactEmailPrefix)}+${uniquePart}@example.com`);
    await page.getByRole('textbox', { name: /telefoon/i }).fill(data.contactPhone ?? this.defaults.contactPhone);
    await page.getByRole('textbox', { name: /functie/i }).fill(data.contactRole ?? this.defaults.contactRole);
  }

  private static async submit(page: Page) {
    // Submit button localized 'Toevoegen' (allow variant 'Opslaan' in case of reuse for edit)
    const submit = page.getByRole('button', { name: /toevoegen|opslaan/i }).first();
    await submit.click();
    // Wait for dialog to become hidden (best-effort)
    await expect(page.getByRole('dialog').first()).toBeHidden({ timeout: 15_000 }).catch(() => null);
  }

  private static async verifyInGrid(page: Page, name: string) {
    // Search input placeholder variants
    const searchInput = page.locator('input[placeholder="Search…"], input[placeholder="Zoek bedrijven..."]').first();
    if (await searchInput.count()) {
      await searchInput.fill(name);
      // slight debounce to allow grid filter to apply
      await page.waitForTimeout(600);
    }
    const row = page.locator('div[role="row"]', { hasText: name }).first();
    await expect(row).toBeVisible({ timeout: 20_000 });
  }

  /** Query backend search endpoint to retrieve internal id (optional) */
  private static async resolveId(request: APIRequestContext, name: string): Promise<string | null> {
    try {
      const resp = await request.get(`${this.BASE}/api/companies/search?q=${encodeURIComponent(name)}`);
      if (!resp.ok()) return null;
      const body = await resp.json();
      if (Array.isArray(body)) {
        const found = body.find((c: any) => c.name === name);
        return found?.id ?? null;
      }
      return null;
    } catch {
      return null;
    }
  }

  /** Enterprise number pattern: BE + 10 digits (reuse suffix entropy) */
  private static randomEnterpriseNumber(unique: number): string {
    // Use last 10 digits of unique OR random fallback if not enough entropy
    const base = String(unique).slice(-10);
    const padded = base.length === 10 ? base : (base + Math.floor(Math.random()*1e10).toString()).slice(0,10);
    return `BE${padded}`;
  }
}

export default CompanyHelper;
