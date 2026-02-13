import { test, expect } from '@playwright/test';

/**
 * Performance Test Suite
 * Covers: TC-MOBILE-023 (TC-MOBILE-022 is in tasks.spec.ts)
 */
test.describe('Performance', () => {
  /**
   * TC-MOBILE-023: Slow Network Simulation (P2)
   */
  test.describe('Slow Network Handling', () => {
    test('TC-MOBILE-023: Chat message on 2G network', async ({ page }) => {
      await page.goto('/chat');
      
      // Throttle network to 2G
      const client = await page.context().newCDPSession(page);
      await client.send('Network.enable');
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: (50 * 1024) / 8, // 50kbps in bytes/sec
        uploadThroughput: (20 * 1024) / 8,   // 20kbps in bytes/sec
        latency: 300, // 300ms
      });
      
      // Send message
      const messageField = page.getByPlaceholder(/type message/i);
      await messageField.fill('Test slow network');
      await page.getByRole('button', { name: /send/i }).click();
      
      // Verify optimistic UI
      const message = page.locator('[data-testid="message"]').last();
      await expect(message).toContainText('Test slow network');
      await expect(message.locator('.status')).toHaveText(/sending/i);
      await expect(message.locator('.status')).toHaveCSS('color', /gray/);
      
      // Wait for actual send (should complete, just slow)
      await expect(message.locator('.status')).toHaveText(/sent/i, { timeout: 10000 });
      await expect(message.locator('.status')).toContainText('✓');
    });

    test('TC-MOBILE-023: Image upload with progress bar', async ({ page }) => {
      await page.goto('/chat');
      
      // Throttle to 2G
      const client = await page.context().newCDPSession(page);
      await client.send('Network.enable');
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: (50 * 1024) / 8,
        uploadThroughput: (20 * 1024) / 8,
        latency: 300,
      });
      
      // Upload 500KB image
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'test-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.alloc(500 * 1024), // 500KB
      });
      
      // Verify upload progress
      const progressBar = page.locator('[data-testid="upload-progress"]');
      await expect(progressBar).toBeVisible();
      
      // Progress should update (check intermediate state)
      await expect(progressBar).toHaveAttribute('value', /.+/);
      
      // Estimated time shown
      await expect(page.getByText(/uploading.*remaining/i)).toBeVisible();
      
      // Thumbnail visible immediately (local preview)
      const thumbnail = page.locator('[data-testid="image-thumbnail"]');
      await expect(thumbnail).toBeVisible();
      
      // Cancel button available
      const cancelButton = page.getByRole('button', { name: /cancel/i });
      await expect(cancelButton).toBeVisible();
      
      // Wait for completion
      await expect(progressBar).toHaveAttribute('value', '100', { timeout: 120000 });
      await expect(page.getByText(/upload complete/i)).toBeVisible();
      
      await page.screenshot({ path: 'screenshots/image-upload-complete.png' });
    });

    test('TC-MOBILE-023: Cancel long upload', async ({ page }) => {
      await page.goto('/chat');
      
      // Very slow network
      const client = await page.context().newCDPSession(page);
      await client.send('Network.enable');
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: (10 * 1024) / 8, // 10kbps
        uploadThroughput: (5 * 1024) / 8,
        latency: 500,
      });
      
      // Upload large file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'large-image.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.alloc(2 * 1024 * 1024), // 2MB
      });
      
      // Wait for progress to start
      await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
      await page.waitForTimeout(2000);
      
      // Cancel upload
      await page.getByRole('button', { name: /cancel/i }).click();
      
      // Verify upload cancelled
      await expect(page.locator('[data-testid="upload-progress"]')).not.toBeVisible();
      await expect(page.getByText(/upload cancelled/i)).toBeVisible();
    });

    test('TC-MOBILE-023: Cloud sync with large dataset', async ({ page }) => {
      await page.goto('/settings/cloud-sync');
      
      // Seed 1000 tasks
      await page.evaluate(() => window.seedTasks(1000));
      
      // Throttle network
      const client = await page.context().newCDPSession(page);
      await client.send('Network.enable');
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: (50 * 1024) / 8,
        uploadThroughput: (20 * 1024) / 8,
        latency: 300,
      });
      
      // Tap Sync Now
      await page.getByRole('button', { name: /sync now/i }).click();
      
      // Verify progress indicator
      await expect(page.getByText(/syncing 1000 tasks/i)).toBeVisible();
      
      // Progress counter updates
      const progressText = page.locator('[data-testid="sync-progress"]');
      await expect(progressText).toHaveText(/\d+\/1000 \(\d+%\)/);
      
      // Estimated time
      await expect(page.getByText(/~\d+ min remaining/i)).toBeVisible();
      
      // Cancelable
      const cancelButton = page.getByRole('button', { name: /cancel/i });
      await expect(cancelButton).toBeVisible();
      
      // Wait for partial progress
      await page.waitForTimeout(5000);
      
      // Verify some tasks synced
      const currentProgress = await progressText.textContent();
      expect(currentProgress).toMatch(/[1-9]\d*\/1000/); // At least 1 synced
    });

    test('TC-MOBILE-023: Partial sync success', async ({ page }) => {
      await page.goto('/settings/cloud-sync');
      
      await page.evaluate(() => window.seedTasks(100));
      
      // Mock API to fail some tasks
      await page.route('**/api/sync', async route => {
        const data = await route.request().postDataJSON();
        
        // Simulate 20 failures out of 100
        const result = {
          synced: 80,
          failed: 20,
          total: 100,
        };
        
        route.fulfill({ status: 207, body: JSON.stringify(result) }); // Multi-status
      });
      
      await page.getByRole('button', { name: /sync now/i }).click();
      
      // Wait for completion
      await expect(page.getByText(/synced 80\/100 tasks/i)).toBeVisible();
      await expect(page.getByText(/20 failed.*retry/i)).toBeVisible();
      
      // Retry button for failed tasks
      const retryButton = page.getByRole('button', { name: /retry failed/i });
      await expect(retryButton).toBeVisible();
    });

    test('TC-MOBILE-023: No indefinite spinners', async ({ page }) => {
      await page.goto('/chat');
      
      // Mock very slow response
      await page.route('**/api/chat/send', async route => {
        // Delay but eventually respond
        await new Promise(resolve => setTimeout(resolve, 2000));
        route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
      });
      
      await page.getByPlaceholder(/type message/i).fill('Test');
      await page.getByRole('button', { name: /send/i }).click();
      
      // Spinner visible initially
      const spinner = page.locator('[data-testid="message"]').last().locator('.spinner');
      await expect(spinner).toBeVisible();
      
      // After completion, spinner gone
      await page.waitForTimeout(3000);
      await expect(spinner).not.toBeVisible();
      
      // Verify max timeout exists (30s for chat)
      // This is implementation-dependent, but verify in code or docs
    });

    test('TC-MOBILE-023: App remains usable during background sync', async ({ page }) => {
      await page.goto('/settings/cloud-sync');
      
      await page.evaluate(() => window.seedTasks(500));
      
      // Start sync
      await page.getByRole('button', { name: /sync now/i }).click();
      
      // Navigate away while syncing
      await page.goto('/tasks');
      
      // Verify app is usable
      await page.getByTestId('add-task-button').click();
      await expect(page.getByLabel(/title/i)).toBeVisible();
      
      // Background sync continues (shown in notification or status bar)
      const syncNotification = page.locator('[data-testid="sync-notification"]');
      await expect(syncNotification).toContainText(/syncing in background/i);
      
      // Can still interact with app
      await page.getByLabel(/title/i).fill('Created during sync');
      await page.getByRole('button', { name: /create/i }).click();
      
      await expect(page.getByText(/task created/i)).toBeVisible();
    });

    test('TC-MOBILE-023: Accessibility - Progress announcements', async ({ page }) => {
      await page.goto('/chat');
      
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'test.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.alloc(500 * 1024),
      });
      
      // Progress should be announced
      const progressRegion = page.locator('[aria-live="polite"]');
      await expect(progressRegion).toContainText(/uploading.*\d+% complete/i);
      
      // Estimated time announced
      await expect(progressRegion).toContainText(/approximately \d+ (second|minute)s? remaining/i);
    });
  });

  /**
   * Additional Performance Tests
   */
  test.describe('General Performance Metrics', () => {
    test('Initial page load time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      
      // Wait for page to be interactive
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      // Assert: Page loads in < 3s
      expect(loadTime).toBeLessThan(3000);
      
      console.log(`Page load time: ${loadTime}ms`);
    });

    test('Time to interactive', async ({ page }) => {
      await page.goto('/');
      
      const startTime = Date.now();
      
      // Wait for first interactive element
      await page.waitForSelector('[data-testid="add-task-button"]', { state: 'visible' });
      
      const interactiveTime = Date.now() - startTime;
      
      // Assert: Interactive in < 2s
      expect(interactiveTime).toBeLessThan(2000);
      
      console.log(`Time to interactive: ${interactiveTime}ms`);
    });

    test('JavaScript bundle size check', async ({ page }) => {
      await page.goto('/');
      
      // Get all JavaScript resources
      const metrics = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        const jsResources = resources.filter(r => r.name.endsWith('.js'));
        
        return {
          count: jsResources.length,
          totalSize: jsResources.reduce((sum, r) => sum + r.transferSize, 0),
        };
      });
      
      console.log(`JS bundles: ${metrics.count}, Total size: ${metrics.totalSize} bytes`);
      
      // Warn if bundle is large (not a hard failure)
      if (metrics.totalSize > 1024 * 1024) { // 1MB
        console.warn('Warning: JavaScript bundle size exceeds 1MB');
      }
    });
  });
});
