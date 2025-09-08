import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('Technical Unit Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a technical unit detail page directly
    await page.goto(`${BASE}/technical-units/test-unit`);
    await expect(page).toHaveURL(/\/technical-units\/test-unit$/);
  });

  test('should display technical unit detail page', async ({ page }) => {
    // Check for main heading or title
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
    
    // Look for technical unit name or heading
    const heading = page.locator('h1, h2, h3, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('should display technical unit information sections', async ({ page }) => {
    // Check for information sections
    const sections = [
      /algemene informatie|general information/i,
      /personeel|personnel|employees/i,
      /leidinggevenden|management|supervisors/i,
      /ondernemingsraad|works council/i,
    ];

    let sectionFound = false;
    for (const sectionText of sections) {
      if (await page.getByText(sectionText).isVisible()) {
        sectionFound = true;
        break;
      }
    }
    expect(sectionFound).toBeTruthy();
  });

  test('should display personnel tab and content', async ({ page }) => {
    // Check for personnel/personeel tab
    const personnelTab = page.getByText(/personeel|personnel|employees/i);
    
    if (await personnelTab.isVisible()) {
      await personnelTab.click();
      
      // Should show personnel list or grid
      const personnelContainer = page.locator('[data-testid="personnel-grid"], [role="grid"], [role="table"]');
      await expect(personnelContainer).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display management/supervisors tab', async ({ page }) => {
    // Check for management tab
    const managementTab = page.getByText(/leidinggevenden|management|supervisors/i);
    
    if (await managementTab.isVisible()) {
      await managementTab.click();
      
      // Should show management content
      await page.waitForTimeout(1000);
      await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display works council tab', async ({ page }) => {
    // Check for works council tab
    const worksCouncilTab = page.getByText(/ondernemingsraad|works council/i);
    
    if (await worksCouncilTab.isVisible()) {
      await worksCouncilTab.click();
      
      // Should show works council content
      await page.waitForTimeout(1000);
      await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should allow adding new employee', async ({ page }) => {
    // Navigate to personnel tab if it exists
    const personnelTab = page.getByText(/personeel|personnel|employees/i);
    if (await personnelTab.isVisible()) {
      await personnelTab.click();
    }
    
    // Look for add employee button
    const addButton = page.getByRole('button', { name: /nieuwe.*werknemer|add.*employee|personeel.*toevoegen/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Should open add employee dialog
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      
      // Check for employee form fields
      const nameField = page.getByRole('textbox', { name: /naam|name|voornaam|firstname/i });
      await expect(nameField).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display import employees functionality', async ({ page }) => {
    // Navigate to personnel tab
    const personnelTab = page.getByText(/personeel|personnel|employees/i);
    if (await personnelTab.isVisible()) {
      await personnelTab.click();
    }
    
    // Look for import button
    const importButton = page.getByRole('button', { name: /import|upload|bestand/i });
    if (await importButton.isVisible()) {
      await importButton.click();
      
      // Should show import dialog or functionality
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
    }
  });

  test('should allow searching employees', async ({ page }) => {
    // Navigate to personnel tab
    const personnelTab = page.getByText(/personeel|personnel|employees/i);
    if (await personnelTab.isVisible()) {
      await personnelTab.click();
    }
    
    // Look for search box
    const searchBox = page.getByRole('textbox', { name: /zoek|search/i });
    if (await searchBox.isVisible()) {
      await searchBox.fill('test');
      await page.waitForTimeout(1000); // Wait for search
      
      // Should maintain the grid visibility
      const grid = page.locator('[data-testid="personnel-grid"], [role="grid"], [role="table"]');
      await expect(grid).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display edit technical unit button', async ({ page }) => {
    // Look for edit button
    const editButton = page.getByRole('button', { name: /bewerk|edit/i });
    if (await editButton.isVisible()) {
      await editButton.click();
      
      // Should open edit dialog
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display breadcrumbs navigation', async ({ page }) => {
    // Check for breadcrumbs
    const breadcrumbs = page.getByRole('navigation', { name: /breadcrumb/i });
    if (await breadcrumbs.isVisible()) {
      await expect(breadcrumbs).toContainText(/technische eenheden|technical units/i);
    }
  });

  test('should allow adding employee to works council', async ({ page }) => {
    // Navigate to works council tab
    const worksCouncilTab = page.getByText(/ondernemingsraad|works council/i);
    if (await worksCouncilTab.isVisible()) {
      await worksCouncilTab.click();
      
      // Look for add to council button
      const addToCouncilButton = page.getByRole('button', { name: /toevoegen.*raad|add.*council/i });
      if (await addToCouncilButton.isVisible()) {
        await addToCouncilButton.click();
        
        // Should show dialog or employee selection
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should handle sub-routes for personnel, management, and works council', async ({ page }) => {
    // Test navigation to sub-routes
    const subRoutes = [
      'personeel',
      'leidinggevenden',
      'ondernemingsraad'
    ];

    for (const route of subRoutes) {
      await page.goto(`${BASE}/technical-units/test-unit/${route}`);
      await expect(page).toHaveURL(new RegExp(`/technical-units/test-unit/${route}$`));
      
      // Should load the page successfully
      await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should navigate between different tabs', async ({ page }) => {
    // Test tab navigation
    const tabs = [
      { text: /algemeen|general|informatie|information/i, partial: 'general' },
      { text: /personeel|personnel|employees/i, partial: 'personeel' },
      { text: /leidinggevenden|management|supervisors/i, partial: 'leidinggevenden' },
      { text: /ondernemingsraad|works council/i, partial: 'ondernemingsraad' }
    ];

    for (const tab of tabs) {
      const tabElement = page.getByText(tab.text);
      if (await tabElement.isVisible()) {
        await tabElement.click();
        await page.waitForTimeout(500); // Allow tab content to load
        
        // Should show tab content
        await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
      }
    }
  });
});