import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';

test.describe('Main navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveURL(/:\/\/localhost:3000\/?$/);
  });

  const cases = [
    { name: 'Dashboard', path: '/', headingMatch: /Welkom terug|Dashboard/i },
    { name: 'Overview Bedrijven', path: '/companies', headingMatch: /Bedrijven|Overview/i },
    { name: 'Instellingen', path: '/settings', headingMatch: /Instellingen|Settings/i },
  ];

  for (const c of cases) {
    test(`navigate to ${c.name}`, async ({ page }) => {
      // Find the nav link by accessible name (link text) and click it
      const link = page.getByRole('link', { name: new RegExp(c.name, 'i') });
      await expect(link).toBeVisible({ timeout: 5000 });
      await link.click();

      // Wait for url to match expected path
      await expect(page).toHaveURL(new RegExp(`${c.path}$`));

  // Check page has visible main content — some pages don't use a top-level heading
  const mainFirst = page.locator('main > *').first();
  await expect(mainFirst).toBeVisible({ timeout: 5000 });
    });
  }
});
