import { defineConfig, devices } from '@playwright/test';

/**
 * MobileClaw Playwright Test Configuration (Headless - No WebServer Required)
 * For CI/CD and local testing without Expo server
 */
export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 30000,
  reporter: [
    ['list'],
    ['json', { outputFile: '../test-results.json' }]
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'Desktop',
      use: { ...devices['Desktop Chrome'], headless: true },
    },
  ],
  
  // No webServer - tests should mock the app or use static HTML
});
