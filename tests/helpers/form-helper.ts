import { Page, expect, Locator } from '@playwright/test';

export class FormHelper {
  constructor(private page: Page) {}

  /**
   * Fill a text input field by label or placeholder
   */
  async fillField(identifier: string, value: string): Promise<void> {
    // Try different ways to find the field
    let field = this.page.getByLabel(identifier);
    if (!(await field.count())) {
      field = this.page.getByPlaceholder(identifier);
    }
    if (!(await field.count())) {
      field = this.page.locator(`input[name="${identifier}"]`);
    }
    
    await field.fill(value);
  }

  /**
   * Fill a textarea field
   */
  async fillTextarea(identifier: string, value: string): Promise<void> {
    const field = this.page.getByLabel(identifier).or(this.page.getByPlaceholder(identifier));
    await field.fill(value);
  }

  /**
   * Select an option from a dropdown/combobox
   */
  async selectOption(identifier: string, value: string): Promise<void> {
    const field = this.page.getByLabel(identifier).or(this.page.getByRole('combobox').filter({ hasText: identifier }));
    await field.click();
    await this.page.getByRole('option', { name: value }).click();
  }

  /**
   * Select an option from a dropdown by clicking the dropdown first
   */
  async selectFromDropdown(dropdownSelector: string, optionText: string): Promise<void> {
    await this.page.locator(dropdownSelector).click();
    await this.page.getByRole('option', { name: optionText }).click();
  }

  /**
   * Check a checkbox
   */
  async checkCheckbox(identifier: string): Promise<void> {
    const checkbox = this.page.getByLabel(identifier).or(this.page.locator(`input[type="checkbox"][name="${identifier}"]`));
    await checkbox.check();
  }

  /**
   * Uncheck a checkbox
   */
  async uncheckCheckbox(identifier: string): Promise<void> {
    const checkbox = this.page.getByLabel(identifier).or(this.page.locator(`input[type="checkbox"][name="${identifier}"]`));
    await checkbox.uncheck();
  }

  /**
   * Click a radio button
   */
  async selectRadio(identifier: string, value: string): Promise<void> {
    await this.page.getByLabel(value).check();
  }

  /**
   * Click a button by text or role
   */
  async clickButton(buttonText: string): Promise<void> {
    await this.page.getByRole('button', { name: buttonText }).click();
  }

  /**
   * Submit a form by clicking the submit button
   */
  async submitForm(submitButtonText: string = 'Submit'): Promise<void> {
    await this.clickButton(submitButtonText);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for a modal/dialog to appear
   */
  async waitForModal(): Promise<void> {
    await this.page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  }

  /**
   * Wait for a modal/dialog to disappear
   */
  async waitForModalToClose(): Promise<void> {
    await expect(this.page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Get modal/dialog locator
   */
  getModal(): Locator {
    return this.page.locator('[role="dialog"]');
  }

  /**
   * Fill a form with multiple fields
   */
  async fillForm(fields: Record<string, string>): Promise<void> {
    for (const [field, value] of Object.entries(fields)) {
      await this.fillField(field, value);
    }
  }

  /**
   * Verify field has specific value
   */
  async expectFieldValue(identifier: string, expectedValue: string): Promise<void> {
    const field = this.page.getByLabel(identifier).or(this.page.getByPlaceholder(identifier));
    await expect(field).toHaveValue(expectedValue);
  }

  /**
   * Verify field is empty
   */
  async expectFieldEmpty(identifier: string): Promise<void> {
    await this.expectFieldValue(identifier, '');
  }

  /**
   * Verify checkbox is checked
   */
  async expectCheckboxChecked(identifier: string): Promise<void> {
    const checkbox = this.page.getByLabel(identifier).or(this.page.locator(`input[type="checkbox"][name="${identifier}"]`));
    await expect(checkbox).toBeChecked();
  }

  /**
   * Verify checkbox is unchecked
   */
  async expectCheckboxUnchecked(identifier: string): Promise<void> {
    const checkbox = this.page.getByLabel(identifier).or(this.page.locator(`input[type="checkbox"][name="${identifier}"]`));
    await expect(checkbox).not.toBeChecked();
  }

  /**
   * Wait for form validation error
   */
  async waitForValidationError(): Promise<void> {
    await this.page.waitForSelector('.error, .invalid, [aria-invalid="true"]', { timeout: 5000 });
  }

  /**
   * Get form validation error message
   */
  async getValidationError(): Promise<string> {
    const errorElement = this.page.locator('.error, .invalid, [role="alert"]').first();
    return await errorElement.textContent() || '';
  }

  /**
   * Clear all form fields
   */
  async clearForm(): Promise<void> {
    const inputs = this.page.locator('input[type="text"], input[type="email"], input[type="tel"], textarea');
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      await inputs.nth(i).clear();
    }
  }

  /**
   * Upload a file
   */
  async uploadFile(fileInputSelector: string, filePath: string): Promise<void> {
    await this.page.setInputFiles(fileInputSelector, filePath);
  }

  /**
   * Click outside to close dropdown/modal
   */
  async clickOutside(): Promise<void> {
    await this.page.locator('body').click({ position: { x: 0, y: 0 } });
  }
}
