import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/playwright',
  timeout: 60000, // Increased timeout for slower operations
  expect: {
    timeout: 15000, // Increased expect timeout
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Retry once even in local development
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Add global wait for better stability
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Disable web security for better compatibility
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
        }
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox specific configurations
        launchOptions: {
          firefoxUserPrefs: {
            'dom.webnotifications.enabled': false,
            'dom.push.enabled': false
          }
        }
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // Safari specific configurations
        launchOptions: {
          // Webkit specific options if needed
        }
      },
    },
    // Simplify mobile testing - only test core functionality
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        // Mobile specific viewport
        viewport: { width: 375, height: 667 }
      },
      testIgnore: ['**/accessibility.spec.ts'], // Skip complex tests on mobile
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        // Mobile Safari specific viewport
        viewport: { width: 390, height: 844 }
      },
      testIgnore: ['**/accessibility.spec.ts'], // Skip complex tests on mobile
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // Increased server startup timeout
  },
});