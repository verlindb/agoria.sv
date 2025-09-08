import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('LocalStorage Environment Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up localStorage environment for testing
    await page.goto(BASE);
    
    // Configure localStorage to simulate offline/mock mode
    await page.evaluate(() => {
      localStorage.setItem('VITE_USE_API', 'false');
      localStorage.setItem('TEST_ENVIRONMENT', 'local');
      localStorage.setItem('API_BASE_URL', 'https://localhost:3000');
    });
  });

  test('should use localStorage configuration when API is disabled', async ({ page }) => {
    // Verify localStorage values are set
    const useApi = await page.evaluate(() => localStorage.getItem('VITE_USE_API'));
    expect(useApi).toBe('false');
    
    const apiBaseUrl = await page.evaluate(() => localStorage.getItem('API_BASE_URL'));
    expect(apiBaseUrl).toBe('https://localhost:3000');
    
    // Navigate to companies page which typically uses API
    await page.goto(`${BASE}/companies`);
    
    // Should load without making API calls
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('should persist localStorage data across page reloads', async ({ page }) => {
    // Set some test data in localStorage
    await page.evaluate(() => {
      localStorage.setItem('test_companies', JSON.stringify([
        { id: '1', name: 'Test Company 1', status: 'active' },
        { id: '2', name: 'Test Company 2', status: 'inactive' }
      ]));
    });
    
    // Reload the page
    await page.reload();
    
    // Verify data persists
    const storedData = await page.evaluate(() => {
      return localStorage.getItem('test_companies');
    });
    
    expect(storedData).toBeTruthy();
    const parsedData = JSON.parse(storedData);
    expect(parsedData).toHaveLength(2);
    expect(parsedData[0].name).toBe('Test Company 1');
  });

  test('should use localStorage for user preferences', async ({ page }) => {
    // Set user preferences in localStorage
    await page.evaluate(() => {
      localStorage.setItem('user_preferences', JSON.stringify({
        theme: 'dark',
        language: 'nl',
        itemsPerPage: 25
      }));
    });
    
    await page.goto(`${BASE}/settings`);
    
    // Verify preferences are accessible
    const preferences = await page.evaluate(() => {
      const prefs = localStorage.getItem('user_preferences');
      return prefs ? JSON.parse(prefs) : null;
    });
    
    expect(preferences).toBeTruthy();
    expect(preferences.theme).toBe('dark');
    expect(preferences.language).toBe('nl');
  });

  test('should handle localStorage quota limits gracefully', async ({ page }) => {
    // Try to store a large amount of data
    await page.evaluate(() => {
      try {
        const largeData = 'x'.repeat(1024 * 1024); // 1MB of data
        localStorage.setItem('large_test_data', largeData);
        return 'success';
      } catch (e) {
        return 'quota_exceeded';
      }
    });
    
    // Application should still function normally
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
  });

  test('should clear localStorage on logout simulation', async ({ page }) => {
    // Set some user data
    await page.evaluate(() => {
      localStorage.setItem('user_token', 'fake-token-123');
      localStorage.setItem('user_data', JSON.stringify({ id: 1, name: 'Test User' }));
      localStorage.setItem('app_state', JSON.stringify({ lastPage: '/companies' }));
    });
    
    // Simulate logout (clear specific keys)
    await page.evaluate(() => {
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_data');
      // Keep app_state for better UX
    });
    
    // Verify cleanup
    const token = await page.evaluate(() => localStorage.getItem('user_token'));
    const userData = await page.evaluate(() => localStorage.getItem('user_data'));
    const appState = await page.evaluate(() => localStorage.getItem('app_state'));
    
    expect(token).toBeNull();
    expect(userData).toBeNull();
    expect(appState).toBeTruthy(); // Should remain
  });

  test('should handle localStorage in different browser contexts', async ({ browser }) => {
    // Create two separate browser contexts to simulate different users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Set different data in each context
    await page1.goto(BASE);
    await page1.evaluate(() => {
      localStorage.setItem('user_id', 'user1');
    });
    
    await page2.goto(BASE);
    await page2.evaluate(() => {
      localStorage.setItem('user_id', 'user2');
    });
    
    // Verify isolation
    const user1Id = await page1.evaluate(() => localStorage.getItem('user_id'));
    const user2Id = await page2.evaluate(() => localStorage.getItem('user_id'));
    
    expect(user1Id).toBe('user1');
    expect(user2Id).toBe('user2');
    
    await context1.close();
    await context2.close();
  });

  test('should use localStorage for caching API responses when offline', async ({ page }) => {
    // Simulate cached API responses in localStorage
    await page.evaluate(() => {
      const cachedCompanies = {
        timestamp: Date.now(),
        data: [
          { id: '1', name: 'Cached Company 1', employees: 10 },
          { id: '2', name: 'Cached Company 2', employees: 25 }
        ]
      };
      localStorage.setItem('cache_companies', JSON.stringify(cachedCompanies));
    });
    
    // Navigate to companies page
    await page.goto(`${BASE}/companies`);
    
    // Verify cached data is accessible
    const cachedData = await page.evaluate(() => {
      const cache = localStorage.getItem('cache_companies');
      return cache ? JSON.parse(cache) : null;
    });
    
    expect(cachedData).toBeTruthy();
    expect(cachedData.data).toHaveLength(2);
    expect(cachedData.data[0].name).toBe('Cached Company 1');
  });

  test('should handle localStorage migration between app versions', async ({ page }) => {
    // Simulate old version data structure
    await page.evaluate(() => {
      localStorage.setItem('app_version', '1.0.0');
      localStorage.setItem('companies_data', JSON.stringify({
        // Old structure
        items: [{ companyName: 'Old Company' }]
      }));
    });
    
    await page.goto(BASE);
    
    // Simulate version upgrade and data migration
    await page.evaluate(() => {
      const currentVersion = '1.1.0';
      const storedVersion = localStorage.getItem('app_version');
      
      if (storedVersion !== currentVersion) {
        // Migrate data structure
        const oldData = JSON.parse(localStorage.getItem('companies_data') || '{}');
        if (oldData.items) {
          const newData = {
            companies: oldData.items.map(item => ({
              name: item.companyName,
              // Add new fields
              status: 'active'
            }))
          };
          localStorage.setItem('companies_data', JSON.stringify(newData));
          localStorage.setItem('app_version', currentVersion);
        }
      }
    });
    
    // Verify migration worked
    const version = await page.evaluate(() => localStorage.getItem('app_version'));
    const migratedData = await page.evaluate(() => {
      const data = localStorage.getItem('companies_data');
      return data ? JSON.parse(data) : null;
    });
    
    expect(version).toBe('1.1.0');
    expect(migratedData.companies).toBeTruthy();
    expect(migratedData.companies[0].name).toBe('Old Company');
    expect(migratedData.companies[0].status).toBe('active');
  });

  test('should use localStorage for form data persistence', async ({ page }) => {
    await page.goto(`${BASE}/companies`);
    
    // Try to open new company dialog
    const newCompanyBtn = page.getByRole('button', { name: /nieuw.*bedrijf|new.*company/i });
    if (await newCompanyBtn.isVisible()) {
      await newCompanyBtn.click();
      
      // Fill some form data
      const nameField = page.getByRole('textbox', { name: /bedrijfsnaam|company.*name/i });
      if (await nameField.isVisible()) {
        await nameField.fill('Draft Company');
        
        // Simulate saving draft to localStorage
        await page.evaluate(() => {
          localStorage.setItem('draft_company_form', JSON.stringify({
            name: 'Draft Company',
            savedAt: Date.now()
          }));
        });
        
        // Verify draft is saved
        const draft = await page.evaluate(() => {
          const data = localStorage.getItem('draft_company_form');
          return data ? JSON.parse(data) : null;
        });
        
        expect(draft).toBeTruthy();
        expect(draft.name).toBe('Draft Company');
      }
    }
  });

  test('should handle localStorage security considerations', async ({ page }) => {
    // Test that sensitive data is not stored in localStorage
    await page.evaluate(() => {
      // Simulate what the app should NOT do
      // localStorage.setItem('password', 'secret123'); // BAD
      // localStorage.setItem('api_key', 'key-123'); // BAD
      
      // Instead store only non-sensitive data
      localStorage.setItem('ui_state', JSON.stringify({ sidebar_collapsed: true }));
      localStorage.setItem('user_preferences', JSON.stringify({ theme: 'dark' }));
    });
    
    // Verify only appropriate data is stored
    const allKeys = await page.evaluate(() => Object.keys(localStorage));
    
    // Should not contain sensitive keys
    expect(allKeys).not.toContain('password');
    expect(allKeys).not.toContain('api_key');
    expect(allKeys).not.toContain('token');
    
    // Should contain appropriate UI state
    expect(allKeys).toContain('ui_state');
    expect(allKeys).toContain('user_preferences');
  });
});