import { Page } from '@playwright/test';

/**
 * Test Utilities for MobileClaw
 * Common helper functions used across test suites
 */

/**
 * Seed database with test data
 */
export async function seedDatabase(page: Page, options: {
  tasks?: number;
  secrets?: number;
  notes?: number;
}) {
  await page.evaluate((opts) => {
    if (opts.tasks) {
      // @ts-ignore - Mock function injected in test environment
      window.seedTasks(opts.tasks);
    }
    if (opts.secrets) {
      // @ts-ignore
      window.seedVaultSecrets(opts.secrets);
    }
    if (opts.notes) {
      // @ts-ignore
      window.seedBrainNotes(opts.notes);
    }
  }, options);
}

/**
 * Complete onboarding flow (shortcut for tests)
 */
export async function completeOnboarding(page: Page, password = 'TestPass123!') {
  await page.goto('/');
  
  // Skip through onboarding screens
  await page.getByRole('button', { name: /next/i }).click();
  await page.getByRole('button', { name: /next/i }).click();
  
  // Set password
  await page.getByLabel(/master password/i).fill(password);
  await page.getByLabel(/confirm password/i).fill(password);
  
  // Enable biometric (optional)
  await page.getByLabel(/enable biometric/i).check();
  
  // Complete
  await page.getByRole('button', { name: /get started/i }).click();
}

/**
 * Unlock vault
 */
export async function unlockVault(page: Page) {
  await page.goto('/vault');
  await page.getByRole('button', { name: /unlock/i }).click();
  
  // Wait for unlock (biometric auto-approved in tests)
  await page.waitForSelector('[data-testid="vault-contents"]', { state: 'visible' });
}

/**
 * Wait for toast to appear and dismiss
 */
export async function waitForToast(page: Page, expectedText: RegExp | string) {
  const toast = page.locator('[data-testid="toast"]');
  await toast.waitFor({ state: 'visible' });
  
  if (expectedText) {
    await toast.getByText(expectedText).waitFor({ state: 'visible' });
  }
  
  // Wait for auto-dismiss (4 seconds)
  await page.waitForTimeout(4000);
  await toast.waitFor({ state: 'hidden' });
}

/**
 * Mock network to simulate offline state
 */
export async function goOffline(page: Page) {
  await page.context().setOffline(true);
}

/**
 * Restore network connection
 */
export async function goOnline(page: Page) {
  await page.context().setOffline(false);
}

/**
 * Simulate slow network (2G)
 */
export async function simulateSlowNetwork(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (50 * 1024) / 8, // 50kbps
    uploadThroughput: (20 * 1024) / 8,   // 20kbps
    latency: 300,
  });
}

/**
 * Reset network to normal speed
 */
export async function resetNetwork(page: Page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: -1, // No throttling
    uploadThroughput: -1,
    latency: 0,
  });
}

/**
 * Measure FPS during an operation
 */
export async function measureFPS(page: Page, durationMs = 1000): Promise<number> {
  return await page.evaluate((duration) => {
    return new Promise<number>((resolve) => {
      let frameCount = 0;
      const startTime = performance.now();
      
      function countFrame() {
        frameCount++;
        if (performance.now() - startTime < duration) {
          requestAnimationFrame(countFrame);
        } else {
          const fps = Math.round((frameCount / duration) * 1000);
          resolve(fps);
        }
      }
      
      requestAnimationFrame(countFrame);
    });
  }, durationMs);
}

/**
 * Check if element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.locator(selector).evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  });
}

/**
 * Get color contrast ratio
 */
export async function getContrastRatio(page: Page, selector: string): Promise<number> {
  return await page.locator(selector).evaluate((el) => {
    const styles = window.getComputedStyle(el);
    const fgColor = styles.color;
    const bgColor = styles.backgroundColor;
    
    // Simplified contrast calculation (real implementation would be more complex)
    // This is a placeholder - use axe-core for actual contrast testing
    return 0; // Placeholder
  });
}

/**
 * Take screenshot with consistent naming
 */
export async function takeTestScreenshot(page: Page, testName: string, suffix = '') {
  const filename = `screenshots/${testName}${suffix ? '-' + suffix : ''}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  return filename;
}

/**
 * Verify touch target size (minimum 44x44px)
 */
export async function verifyTouchTarget(page: Page, selector: string): Promise<boolean> {
  const box = await page.locator(selector).boundingBox();
  return box !== null && box.width >= 44 && box.height >= 44;
}

/**
 * Simulate app going to background
 */
export async function appToBackground(page: Page) {
  await page.evaluate(() => {
    window.dispatchEvent(new Event('blur'));
    // @ts-ignore
    if (window.ReactNative) {
      // @ts-ignore
      window.ReactNative.AppState = 'background';
    }
  });
}

/**
 * Simulate app returning to foreground
 */
export async function appToForeground(page: Page) {
  await page.evaluate(() => {
    window.dispatchEvent(new Event('focus'));
    // @ts-ignore
    if (window.ReactNative) {
      // @ts-ignore
      window.ReactNative.AppState = 'active';
    }
  });
}

/**
 * Mock geolocation
 */
export async function mockLocation(page: Page, lat: number, lng: number) {
  await page.context().setGeolocation({ latitude: lat, longitude: lng });
}

/**
 * Grant all permissions
 */
export async function grantAllPermissions(page: Page) {
  await page.context().grantPermissions([
    'geolocation',
    'camera',
    'microphone',
    'notifications',
  ]);
}

/**
 * Clear all app data
 */
export async function clearAppData(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    // @ts-ignore
    if (window.indexedDB?.databases) {
      // @ts-ignore
      window.indexedDB.databases().then((dbs) => {
        dbs.forEach((db) => window.indexedDB.deleteDatabase(db.name));
      });
    }
  });
}
