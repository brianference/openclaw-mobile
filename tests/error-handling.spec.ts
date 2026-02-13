import { test, expect } from '@playwright/test';

/**
 * Error Handling Test Suite
 * Covers: TC-MOBILE-012, TC-MOBILE-013
 */
test.describe('Error Handling', () => {
  /**
   * TC-MOBILE-012: Camera/Location Permission Denied (P1)
   */
  test.describe('Permission Handling', () => {
    test('TC-MOBILE-012: Camera permission denied - Scanner', async ({ page, context }) => {
      // Deny camera permission
      await context.grantPermissions([], { permissions: [] });
      
      await page.goto('/scanner');
      
      // Tap scan document button
      await page.getByTestId('scan-document-button').click();
      
      // System permission prompt would appear (simulated in test)
      // Simulate denial
      await page.evaluate(() => {
        window.mockPermissionDenied('camera');
      });
      
      // Verify placeholder shown
      await expect(page.getByText(/camera access required to scan documents/i)).toBeVisible();
      
      const settingsButton = page.getByRole('button', { name: /open settings/i });
      await expect(settingsButton).toBeVisible();
      
      // Verify grayed out icon
      const cameraIcon = page.locator('[data-testid="camera-icon"]');
      await expect(cameraIcon).toHaveCSS('opacity', '0.5');
      
      await page.screenshot({ path: 'screenshots/camera-permission-denied.png' });
    });

    test('TC-MOBILE-012: Location permission denied - Places', async ({ page, context }) => {
      // Deny location permission
      await context.clearPermissions();
      
      await page.goto('/places');
      
      // Verify map shows generic view
      const map = page.locator('[data-testid="map"]');
      await expect(map).toBeVisible();
      
      // No user location pin
      await expect(page.locator('[data-testid="user-location-pin"]')).not.toBeVisible();
      
      // Toast notification
      await expect(page.getByText(/location access denied.*enable in settings/i)).toBeVisible();
      
      // Search still works
      const searchBar = page.getByPlaceholder(/search places/i);
      await expect(searchBar).toBeVisible();
      await searchBar.fill('Phoenix');
      
      // Verify nearby places warning
      await expect(page.getByText(/nearby places unavailable without location access/i)).toBeVisible();
      
      // Manual search still works
      await page.getByRole('option', { name: /phoenix, az/i }).click();
      await expect(map.locator('[data-testid="place-marker"]')).toBeVisible();
    });

    test('TC-MOBILE-012: Privacy settings screen', async ({ page }) => {
      await page.goto('/settings/privacy');
      
      // Verify permission states
      const cameraPermission = page.locator('[data-testid="permission-camera"]');
      await expect(cameraPermission).toContainText('📷 Camera: Denied');
      await expect(cameraPermission.locator('.status-indicator')).toHaveCSS('background-color', /red/);
      
      const locationPermission = page.locator('[data-testid="permission-location"]');
      await expect(locationPermission).toContainText('📍 Location: Denied');
      await expect(locationPermission.locator('.status-indicator')).toHaveCSS('background-color', /red/);
      
      // Verify settings buttons
      await expect(cameraPermission.getByRole('button', { name: /open system settings/i })).toBeVisible();
      await expect(locationPermission.getByRole('button', { name: /open system settings/i })).toBeVisible();
    });

    test('TC-MOBILE-012: Accessibility - Permission error announcements', async ({ page }) => {
      await page.goto('/scanner');
      await page.getByTestId('scan-document-button').click();
      
      await page.evaluate(() => window.mockPermissionDenied('camera'));
      
      const errorMessage = page.getByText(/camera access required/i);
      await expect(errorMessage).toHaveAttribute('role', 'alert');
      await expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    });
  });

  /**
   * TC-MOBILE-013: API Timeout & Slow Network (P1)
   */
  test.describe('Network Timeouts', () => {
    test('TC-MOBILE-013: Chat message timeout', async ({ page }) => {
      await page.goto('/chat');
      
      // Mock slow network (30s+ delay)
      await page.route('**/api/chat/send', async route => {
        await new Promise(resolve => setTimeout(resolve, 35000));
        route.fulfill({ status: 408, body: 'Timeout' });
      });
      
      // Send message
      await page.getByPlaceholder(/type message/i).fill('Test timeout');
      await page.getByRole('button', { name: /send/i }).click();
      
      // Verify "Sending..." status
      const message = page.locator('[data-testid="message"]').last();
      await expect(message).toContainText('Sending...');
      await expect(message.locator('.status')).toHaveCSS('color', /gray/);
      
      // Wait for timeout (30s)
      await page.waitForTimeout(31000);
      
      // Verify failed status
      await expect(message).toContainText('Failed ⚠️');
      await expect(message.locator('.status-icon')).toHaveCSS('color', /red/);
      
      // Tap failed message for options
      await message.click();
      await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();
      
      await page.screenshot({ path: 'screenshots/chat-timeout.png' });
    });

    test('TC-MOBILE-013: Chat retry after timeout', async ({ page }) => {
      await page.goto('/chat');
      
      // First attempt: timeout
      await page.route('**/api/chat/send', async (route, request) => {
        if (request.postDataJSON().retry) {
          // Retry succeeds
          route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
        } else {
          // First attempt fails
          await new Promise(resolve => setTimeout(resolve, 31000));
          route.fulfill({ status: 408 });
        }
      });
      
      await page.getByPlaceholder(/type message/i).fill('Retry test');
      await page.getByRole('button', { name: /send/i }).click();
      
      await page.waitForTimeout(31000);
      
      // Click retry
      const message = page.locator('[data-testid="message"]').last();
      await message.click();
      await page.getByRole('button', { name: /retry/i }).click();
      
      // Verify success
      await expect(message).toContainText('Sent ✓');
    });

    test('TC-MOBILE-013: Cloud sync timeout', async ({ page }) => {
      await page.goto('/settings/cloud-sync');
      
      // Mock slow sync (60s timeout)
      await page.route('**/api/sync', async route => {
        await new Promise(resolve => setTimeout(resolve, 65000));
        route.fulfill({ status: 408 });
      });
      
      // Tap sync now
      await page.getByRole('button', { name: /sync now/i }).click();
      
      // Verify progress
      await expect(page.getByText(/syncing/i)).toBeVisible();
      await expect(page.getByText(/may take a while on slow connection/i)).toBeVisible();
      
      // Wait for timeout (60s)
      await page.waitForTimeout(61000);
      
      // Verify error modal
      const errorModal = page.getByRole('dialog');
      await expect(errorModal).toContainText(/sync timed out/i);
      await expect(errorModal).toContainText(/check your connection and try again/i);
      
      await expect(errorModal.getByRole('button', { name: /try again/i })).toBeVisible();
      await expect(errorModal.getByRole('button', { name: /cancel/i })).toBeVisible();
    });

    test('TC-MOBILE-013: Retry sync with fast connection', async ({ page }) => {
      await page.goto('/settings/cloud-sync');
      
      let attemptCount = 0;
      await page.route('**/api/sync', async route => {
        attemptCount++;
        if (attemptCount === 1) {
          // First attempt: slow timeout
          await new Promise(resolve => setTimeout(resolve, 61000));
          route.fulfill({ status: 408 });
        } else {
          // Retry: fast success
          route.fulfill({ status: 200, body: JSON.stringify({ synced: 100 }) });
        }
      });
      
      await page.getByRole('button', { name: /sync now/i }).click();
      await page.waitForTimeout(61000);
      
      // Click Try Again
      await page.getByRole('button', { name: /try again/i }).click();
      
      // Verify success
      await expect(page.getByText(/synced successfully/i)).toBeVisible();
    });

    test('TC-MOBILE-013: Accessibility - Timeout announcements', async ({ page }) => {
      await page.goto('/chat');
      
      await page.route('**/api/chat/send', async route => {
        await new Promise(resolve => setTimeout(resolve, 31000));
        route.fulfill({ status: 408 });
      });
      
      await page.getByPlaceholder(/type message/i).fill('Test');
      await page.getByRole('button', { name: /send/i }).click();
      
      await page.waitForTimeout(31000);
      
      // Verify status announced
      const statusRegion = page.locator('[aria-live="polite"]');
      await expect(statusRegion).toContainText(/message failed to send.*retry/i);
    });

    test('TC-MOBILE-013: No indefinite spinners', async ({ page }) => {
      await page.goto('/settings/cloud-sync');
      
      await page.route('**/api/sync', async route => {
        // Never respond (simulates hang)
        await new Promise(() => {}); // Infinite wait
      });
      
      await page.getByRole('button', { name: /sync now/i }).click();
      
      // Verify spinner has timeout
      const spinner = page.locator('.spinner');
      await expect(spinner).toBeVisible();
      
      // After 60s, should show error (not still spinning)
      await page.waitForTimeout(61000);
      await expect(spinner).not.toBeVisible();
      await expect(page.getByText(/timed out/i)).toBeVisible();
    });
  });
});
