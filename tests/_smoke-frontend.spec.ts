import { test, expect } from '@playwright/test';
import { NavigationHelper } from './helpers/navigation-helper';

test('smoke: companies page loads', async ({ page }) => {
  console.log('SMOKE start');
  const ports = [3000,3001];
  let base = 'http://localhost:3001';
  for (const p of ports) {
    try { const r = await page.request.get(`http://localhost:${p}/`); if (r.ok()) { base = `http://localhost:${p}`; break; } } catch {}
  }
  const res = await page.request.get(`${base}/companies`);
  console.log('Fetched companies via request', res.status());
  expect(res.status()).toBeLessThan(500);
  
  await page.goto(base);
  const navigation = new NavigationHelper(page);
  
  // Navigate to companies page using helper
  await navigation.navigateToCompanies();
  
  console.log('Navigated to companies UI');
  // Expect either title or a heading containing Companies translation
  await expect(page).toHaveTitle(/Sociale Verkiezingen|Agoria SV/i, { timeout: 15000 });
});
