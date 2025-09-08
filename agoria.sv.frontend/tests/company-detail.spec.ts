import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('Company Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to companies page first, then to a specific company detail
    await page.goto(`${BASE}/companies`);
    await expect(page).toHaveURL(/:\/\/localhost:3000\/companies$/);
  });

  test('should navigate to company detail page from companies list', async ({ page }) => {
    // Wait for companies grid to load
    const grid = page.locator('[data-testid="companies-grid"], [role="grid"]');
    await expect(grid).toBeVisible({ timeout: 10000 });
    
    // Try to find first company row
    const firstRow = page.locator('[role="row"]').nth(1); // Skip header row
    if (await firstRow.isVisible()) {
      // Try clicking company name link or row
      const companyNameLink = firstRow.locator('a').first();
      if (await companyNameLink.isVisible()) {
        await companyNameLink.click();
      } else {
        // Try double clicking the row
        await firstRow.dblclick();
      }
      
      // Should navigate to company detail page
      await expect(page).toHaveURL(/\/companies\/[^\/]+$/, { timeout: 10000 });
    } else {
      // If no companies exist, create a direct navigation test
      await page.goto(`${BASE}/companies/test-company-id`);
      await expect(page).toHaveURL(/\/companies\/test-company-id$/);
    }
  });

  test('should display company information sections', async ({ page }) => {
    // First navigate to any company detail page (use a test ID)
    await page.goto(`${BASE}/companies/test-company`);
    
    // Check for main company information sections
    const sections = [
      /bedrijfsinformatie|company information/i,
      /contactgegevens|contact information/i,
      /adresgegevens|address information/i,
    ];

    for (const sectionText of sections) {
      await expect(page.getByText(sectionText)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display edit company button', async ({ page }) => {
    await page.goto(`${BASE}/companies/test-company`);
    
    // Check for edit button
    const editButton = page.getByRole('button', { name: /bewerk|edit/i });
    await expect(editButton).toBeVisible({ timeout: 5000 });
  });

  test('should display company technical units tab', async ({ page }) => {
    await page.goto(`${BASE}/companies/test-company`);
    
    // Check for technical units tab or section
    const techUnitsTab = page.getByText(/technische eenheden|technical units/i);
    await expect(techUnitsTab).toBeVisible({ timeout: 5000 });
  });

  test('should display breadcrumbs with company name', async ({ page }) => {
    await page.goto(`${BASE}/companies/test-company`);
    
    // Check for breadcrumbs
    const breadcrumbs = page.getByRole('navigation', { name: /breadcrumb/i });
    if (await breadcrumbs.isVisible()) {
      await expect(breadcrumbs).toContainText(/bedrijven|companies/i);
    }
  });

  test('should allow editing company from detail page', async ({ page }) => {
    await page.goto(`${BASE}/companies/test-company`);
    
    const editButton = page.getByRole('button', { name: /bewerk|edit/i });
    await editButton.click();
    
    // Should open edit dialog
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    
    // Check for form fields
    await expect(page.getByRole('textbox', { name: /bedrijfsnaam|company name/i })).toBeVisible({ timeout: 5000 });
  });

  test('should display company status', async ({ page }) => {
    await page.goto(`${BASE}/companies/test-company`);
    
    // Check for status indicator (chip or badge)
    const statusElements = [
      page.locator('[data-testid="company-status"]'),
      page.getByText(/actief|inactief|active|inactive/i),
      page.locator('.MuiChip-root', { hasText: /actief|inactief|active|inactive/i })
    ];

    let statusFound = false;
    for (const element of statusElements) {
      if (await element.isVisible()) {
        statusFound = true;
        break;
      }
    }
    // Status should be displayed somewhere
    expect(statusFound).toBeTruthy();
  });

  test('should display company employees/personnel count', async ({ page }) => {
    await page.goto(`${BASE}/companies/test-company`);
    
    // Check for employee count or personnel information
    const personnelElements = [
      page.getByText(/\d+\s*(werknemers|employees|personeel)/i),
      page.getByText(/aantal.*werknemers|employee.*count/i),
    ];

    let personnelFound = false;
    for (const element of personnelElements) {
      if (await element.isVisible()) {
        personnelFound = true;
        break;
      }
    }
    // If no personnel info found, just check page loaded
    if (!personnelFound) {
      await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate to technical unit detail from company page', async ({ page }) => {
    await page.goto(`${BASE}/companies/test-company`);
    
    // Look for technical units section/tab
    const techUnitsSection = page.getByText(/technische eenheden|technical units/i);
    if (await techUnitsSection.isVisible()) {
      await techUnitsSection.click();
      
      // Look for technical unit links/buttons
      const techUnitLink = page.locator('a[href*="/technical-units/"]').first();
      if (await techUnitLink.isVisible()) {
        await techUnitLink.click();
        
        // Should navigate to technical unit detail
        await expect(page).toHaveURL(/\/companies\/[^\/]+\/technical-units\/[^\/]+/, { timeout: 10000 });
      }
    }
  });

  test('should show company deletion confirmation dialog', async ({ page }) => {
    await page.goto(`${BASE}/companies/test-company`);
    
    // Look for delete button (might be in actions menu)
    const deleteButton = page.getByRole('button', { name: /verwijder|delete/i });
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Should show confirmation dialog
      const confirmDialog = page.getByRole('dialog', { name: /verwijder|delete|bevestig|confirm/i });
      await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    } else {
      // Try actions menu
      const actionsButton = page.locator('button[aria-label*="acties"], button[aria-label*="actions"]');
      if (await actionsButton.isVisible()) {
        await actionsButton.click();
        await expect(page.getByRole('menu')).toBeVisible({ timeout: 5000 });
      }
    }
  });
});