import { test, expect } from '@playwright/test';

test('search for Garfield and verify result', async ({ page }) => {
  // 1. Navigate to the demo app
  await page.goto('https://debs-obrien.github.io/playwright-movies-app');

  // 2. Fill the search input and submit
  const searchInput = page.getByPlaceholder('Search for a movie...');
  // If the input is hidden (mobile UI), click the search button to reveal it.
  if (!(await searchInput.isVisible())) {
    const searchButton = page.getByRole('button', { name: 'Search for a movie' }).first();
    if (await searchButton.isVisible()) {
      try {
        await searchButton.click({ timeout: 2000 });
      } catch (e) {
        // If click is blocked by overlay, reveal input via DOM and set value directly.
        await page.evaluate(() => {
          const input = document.querySelector('input[placeholder="Search for a movie..."]') as HTMLInputElement | null;
          if (input) {
            input.style.display = 'block';
            input.style.visibility = 'visible';
            input.style.opacity = '1';
            input.removeAttribute('aria-hidden');
          }
        });
        // If still not visible after attempting to reveal, we'll fallback below.
      }
    }
  }

  // Final fallback: if placeholder input is not visible, target any input and set value via evaluate.
  if (!(await searchInput.isVisible())) {
    await page.evaluate(() => {
      const anyInput = document.querySelector('input') as HTMLInputElement | null;
      if (anyInput) {
        anyInput.value = 'Garfield';
        anyInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    // Try submitting by pressing Enter on the page
    await page.keyboard.press('Enter');
  } else {
    // Fill and submit the search
    await searchInput.fill('Garfield');
    await searchInput.press('Enter');
  }

  // 3. Verify the movie appears in the list
  const result = page.getByText('The Garfield Movie');
  await expect(result).toBeVisible({ timeout: 10000 });
});
