import { Page, expect } from '@playwright/test';

export class NavigationHelper {
  constructor(private page: Page) {}

  /**
   * Navigate to the companies overview page
   */
  async navigateToCompanies(): Promise<void> {
    await this.page.getByRole('link', { name: 'Overview Bedrijven' }).click();
    await expect(this.page).toHaveURL(/.*\/companies/);
    await this.page.waitForSelector('[role="grid"]', { timeout: 10000 });
  }

  /**
   * Navigate to the technical units overview page
   */
  async navigateToTechnicalUnits(): Promise<void> {
    await this.page.getByRole('link', { name: 'Overview Technische Bedrijfseenheden' }).click();
    await expect(this.page).toHaveURL(/.*\/technical-units/);
    await this.page.waitForSelector('[role="grid"]', { timeout: 10000 });
  }

  /**
   * Navigate to a specific company detail page by clicking the actions menu
   */
  async navigateToCompanyDetail(companyName: string): Promise<void> {
    // Find the row containing the company name
    const row = this.page.locator('div[role="row"]', { hasText: companyName }).first();
    
    // Click the actions button
    const actionsButton = row.getByRole('button', { name: /meer acties|more actions|acties/i }).first();
    await actionsButton.click().catch(async () => await row.locator('button').last().click());

    // Click on the detail/view menu item
    const detailMenu = this.page.getByRole('menuitem', { name: /bekijken|detail|view/i }).first();
    if (await detailMenu.count()) {
      await detailMenu.click();
    } else {
      await this.page.getByText(/bekijken|detail/i).first().click();
    }

    // Wait for navigation to complete
    await this.page.waitForURL(/.*\/companies\/[a-f0-9-]+/);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to a specific technical unit detail page by double-clicking the technical unit name in grid
   */
  async navigateToTechnicalUnitDetail(technicalUnitName: string): Promise<void> {
    await this.page.getByRole('cell', { name: technicalUnitName }).first().dblclick();
    await this.page.waitForURL(/.*\/technical-units\/[a-f0-9-]+/);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Use the breadcrumb navigation to go back
   */
  async clickBackButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Terug' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click on a breadcrumb item
   */
  async clickBreadcrumb(text: string): Promise<void> {
    await this.page.getByRole('button', { name: text }).click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for a specific URL pattern
   */
  async waitForURL(urlPattern: RegExp): Promise<void> {
    await this.page.waitForURL(urlPattern);
  }

  /**
   * Verify current URL matches pattern
   */
  async expectURL(urlPattern: RegExp): Promise<void> {
    await expect(this.page).toHaveURL(urlPattern);
  }

  /**
   * Wait for page to be ready (grid loaded)
   */
  async waitForPageReady(): Promise<void> {
    await this.page.waitForSelector('[role="grid"]', { timeout: 10000 });
    await this.page.waitForLoadState('networkidle');
  }
}
