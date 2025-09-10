import { Page, expect, Locator } from '@playwright/test';

export class GridHelper {
  constructor(private page: Page) {}

  /**
   * Get a grid by its role
   */
  getGrid(): Locator {
    return this.page.locator('[role="grid"]');
  }

  /**
   * Wait for grid to be loaded and visible
   */
  async waitForGrid(): Promise<void> {
    await this.page.waitForSelector('[role="grid"]', { timeout: 10000 });
    await this.page.waitForLoadState('networkidle');
    // Wait a bit for any async data loading
    await this.page.waitForTimeout(1000);
  }

  /**
   * Wait for grid refresh to complete after an action
   */
  async waitForGridRefresh(): Promise<void> {
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get all rows in the grid (excluding header)
   */
  getRows(): Locator {
    return this.page.locator('[role="grid"] [role="rowgroup"]:last-of-type [role="row"]');
  }

  /**
   * Get a specific row by index (0-based)
   */
  getRow(index: number): Locator {
    return this.getRows().nth(index);
  }

  /**
   * Get row count (excluding header)
   */
  async getRowCount(): Promise<number> {
    await this.waitForGrid();
    return await this.getRows().count();
  }

  /**
   * Find a row by cell content
   */
  getRowByText(text: string): Locator {
    return this.page.locator(`[role="grid"] [role="rowgroup"]:last-of-type [role="row"]:has([role="cell"]:has-text("${text}"))`);
  }

  /**
   * Get a cell by row and column text
   */
  getCell(rowText: string, columnText: string): Locator {
    return this.page.getByRole('cell', { name: rowText });
  }

  /**
   * Click on a cell
   */
  async clickCell(text: string): Promise<void> {
    await this.page.getByRole('cell', { name: text }).first().click();
  }

  /**
   * Double-click on a cell to navigate
   */
  async doubleClickCell(text: string): Promise<void> {
    await this.page.getByRole('cell', { name: text }).first().dblclick();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify that a row with specific text exists
   */
  async expectRowExists(text: string): Promise<void> {
    await expect(this.page.getByRole('cell', { name: text }).first()).toBeVisible();
  }

  /**
   * Verify that a row with specific text does not exist
   */
  async expectRowNotExists(text: string): Promise<void> {
    await expect(this.page.getByRole('cell', { name: text })).not.toBeVisible();
  }

  /**
   * Search in the grid using the search box
   */
  async search(searchTerm: string): Promise<void> {
    // Try the main search box first (companies/technical units page level search)
    let searchBox = this.page.getByPlaceholder(/zoek bedrijven|zoek technische|search companies|search technical/i);
    
    // If that doesn't exist, try the grid-specific search
    if (!(await searchBox.count())) {
      searchBox = this.page.locator('[role="grid"]').getByPlaceholder(/search|zoek/i);
    }
    
    // If still not found, use the first available search box
    if (!(await searchBox.count())) {
      searchBox = this.page.getByPlaceholder(/zoek|search/i).first();
    }
    
    await searchBox.fill(searchTerm);
    await this.page.waitForTimeout(500);
    await this.waitForGridRefresh();
  }

  /**
   * Clear search in the grid
   */
  async clearSearch(): Promise<void> {
    // Try the main search box first (companies/technical units page level search)
    let searchBox = this.page.getByPlaceholder(/zoek bedrijven|zoek technische|search companies|search technical/i);
    
    // If that doesn't exist, try the grid-specific search
    if (!(await searchBox.count())) {
      searchBox = this.page.locator('[role="grid"]').getByPlaceholder(/search|zoek/i);
    }
    
    // If still not found, use the first available search box
    if (!(await searchBox.count())) {
      searchBox = this.page.getByPlaceholder(/zoek|search/i).first();
    }
    
    await searchBox.clear();
    await this.waitForGridRefresh();
  }

  /**
   * Click on an action button in a row
   */
  async clickRowAction(rowText: string, actionSelector: string = 'button'): Promise<void> {
    const row = this.getRowByText(rowText);
    
    // Try different approaches to find the action button
    let actionButton = row.locator(actionSelector).first();
    
    // If custom selector doesn't work, try the common patterns
    if (!(await actionButton.count())) {
      // Try "Meer acties" button specifically
      actionButton = row.getByRole('button', { name: /meer acties|more actions/i }).first();
    }
    
    if (!(await actionButton.count())) {
      // Try any button in the row
      actionButton = row.locator('button').last();
    }
    
    await actionButton.click();
  }

  /**
   * Get column header by name
   */
  getColumnHeader(name: string): Locator {
    return this.page.getByRole('columnheader', { name });
  }

  /**
   * Sort by column
   */
  async sortByColumn(columnName: string): Promise<void> {
    await this.getColumnHeader(columnName).click();
    await this.waitForGridRefresh();
  }

  /**
   * Verify grid has specific number of rows
   */
  async expectRowCount(count: number): Promise<void> {
    await this.waitForGrid();
    const actualCount = await this.getRowCount();
    expect(actualCount).toBe(count);
  }

  /**
   * Verify grid is empty
   */
  async expectEmptyGrid(): Promise<void> {
    await this.expectRowCount(0);
  }

  /**
   * Wait for a specific text to appear in the grid
   */
  async waitForText(text: string): Promise<void> {
    await expect(this.page.getByRole('cell', { name: text }).first()).toBeVisible({ timeout: 10000 });
  }

  /**
   * Wait for a specific text to disappear from the grid
   */
  async waitForTextToDisappear(text: string): Promise<void> {
    await expect(this.page.getByRole('cell', { name: text })).not.toBeVisible({ timeout: 10000 });
  }
}
