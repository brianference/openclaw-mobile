import { defineConfig, devices } from '@playwright/test';

/**
 * MobileClaw Visual Regression Testing Configuration
 * Runs visual regression tests on 3 platforms for all implemented screens
 */
export default defineConfig({
  testDir: './tests-visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: 1,
  timeout: 30000,
  
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/visual-results.json' }],
    ['list']
  ],
  
  use: {
    baseURL: 'http://localhost:19006',
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'Desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
      },
    },
    {
      name: 'iPhone 12',
      use: {
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'Pixel 5',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 },
      },
    },
  ],

  webServer: {
    command: 'npm run web',
    url: 'http://localhost:19006',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
