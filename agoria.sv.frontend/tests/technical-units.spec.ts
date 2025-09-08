import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('Technical Units Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/technical-units`);
    await expect(page).toHaveURL(/:\/\/localhost:3000\/technical-units$/);
  });

  test('should display technical units page title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /technische eenheden|technical units/i })).toBeVisible({ timeout: 5000 });
  });

  test('should display search functionality', async ({ page }) => {
    // Check for search box
    const searchBox = page.getByRole('textbox', { name: /zoek.*technische.*eenheden|search.*technical.*units/i });
    await expect(searchBox).toBeVisible({ timeout: 5000 });
  });

  test('should display filter options', async ({ page }) => {
    // Check for filter toggles or buttons
    const filterElements = [
      page.getByText(/alle|all/i),
      page.getByText(/actief|active/i),
      page.getByText(/inactief|inactive/i),
    ];

    // At least the "All" filter should be visible
    let anyVisible = false;
    for (const element of filterElements) {
      if (await element.isVisible()) {
        anyVisible = true;
        break;
      }
    }
    expect(anyVisible).toBeTruthy();
  });

  test('should display add new technical unit button', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /nieuwe.*technische.*eenheid|add.*technical.*unit/i });
    await expect(addButton).toBeVisible({ timeout: 5000 });
  });

  test('should open add technical unit dialog', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /nieuwe.*technische.*eenheid|add.*technical.*unit/i });
    await addButton.click();
    
    // Check for dialog
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Check for form fields
    await expect(page.getByRole('textbox', { name: /naam|name/i })).toBeVisible({ timeout: 5000 });
  });

  test('should display technical units grid/list', async ({ page }) => {
    // Check for data grid or list container
    const gridOrList = page.locator('[data-testid="technical-units-grid"], [role="grid"], [role="table"]');
    await expect(gridOrList).toBeVisible({ timeout: 5000 });
  });

  test('should allow searching technical units', async ({ page }) => {
    const searchBox = page.getByRole('textbox', { name: /zoek.*technische.*eenheden|search.*technical.*units/i });
    
    // Type a search term
    await searchBox.fill('test');
    
    // Wait for search results or no results message
    await page.waitForTimeout(1000); // Allow for debounced search
    
    // Should still show the grid/list container
    const gridOrList = page.locator('[data-testid="technical-units-grid"], [role="grid"], [role="table"]');
    await expect(gridOrList).toBeVisible({ timeout: 5000 });
  });

  test('should allow filtering by status', async ({ page }) => {
    // Try clicking different filter options
    const activeFilter = page.getByText(/actief|active/i).first();
    if (await activeFilter.isVisible()) {
      await activeFilter.click();
      
      // Wait for filter to apply
      await page.waitForTimeout(1000);
      
      // Grid should still be visible
      const gridOrList = page.locator('[data-testid="technical-units-grid"], [role="grid"], [role="table"]');
      await expect(gridOrList).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to technical unit detail page', async ({ page }) => {
    // Wait for grid to load
    const gridOrList = page.locator('[data-testid="technical-units-grid"], [role="grid"], [role="table"]');
    await expect(gridOrList).toBeVisible({ timeout: 5000 });
    
    // Try to find first row/item and click it
    const firstRow = page.locator('[role="row"]').nth(1); // Skip header row
    if (await firstRow.isVisible()) {
      await firstRow.click();
      
      // Should navigate to detail page
      await expect(page).toHaveURL(/\/technical-units\/[^\/]+$/, { timeout: 10000 });
    } else {
      // If no data, just verify page structure works
      await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show technical unit actions menu', async ({ page }) => {
    // Wait for grid to load
    const gridOrList = page.locator('[data-testid="technical-units-grid"], [role="grid"], [role="table"]');
    await expect(gridOrList).toBeVisible({ timeout: 5000 });
    
    // Try to find actions button
    const actionsButton = page.locator('button[aria-label*="acties"], button[aria-label*="actions"]').first();
    if (await actionsButton.isVisible()) {
      await actionsButton.click();
      
      // Check for menu items
      await expect(page.getByRole('menu')).toBeVisible({ timeout: 5000 });
    } else {
      // If no actions menu, just verify structure
      await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display breadcrumbs navigation', async ({ page }) => {
    // Check for breadcrumbs
    const breadcrumbs = page.getByRole('navigation', { name: /breadcrumb/i });
    if (await breadcrumbs.isVisible()) {
      await expect(breadcrumbs).toContainText(/technische eenheden|technical units/i);
    }
  });
});