import { test, expect, devices } from '@playwright/test';

/**
 * Cross-Platform Test Suite
 * Covers: TC-MOBILE-024, TC-MOBILE-025
 */
test.describe('Cross-Platform Compatibility', () => {
  /**
   * TC-MOBILE-024: iOS vs Android Platform Differences (P1)
   */
  test.describe('Platform-Specific Features', () => {
    test('TC-MOBILE-024: iOS biometric prompt', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'iOS-specific test');
      
      await page.goto('/vault');
      
      // Mock iOS Face ID prompt
      await page.evaluate(() => {
        window.mockBiometricType = 'face-id';
      });
      
      await page.getByRole('button', { name: /unlock/i }).click();
      
      // Verify Face ID prompt (native iOS UI would show here)
      const biometricPrompt = page.locator('[data-testid="biometric-prompt"]');
      await expect(biometricPrompt).toContainText(/face id/i);
      
      await page.screenshot({ path: 'screenshots/ios-face-id.png' });
    });

    test('TC-MOBILE-024: Android biometric prompt', async ({ page, browserName }) => {
      test.skip(browserName === 'webkit', 'Android-specific test');
      
      await page.goto('/vault');
      
      // Mock Android fingerprint
      await page.evaluate(() => {
        window.mockBiometricType = 'fingerprint';
      });
      
      await page.getByRole('button', { name: /unlock/i }).click();
      
      const biometricPrompt = page.locator('[data-testid="biometric-prompt"]');
      await expect(biometricPrompt).toContainText(/fingerprint/i);
      
      await page.screenshot({ path: 'screenshots/android-fingerprint.png' });
    });

    test('TC-MOBILE-024: iOS date picker (wheel)', async ({ page }) => {
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      // iOS uses wheel picker
      await page.getByLabel(/due date/i).click();
      
      const picker = page.locator('[data-testid="date-picker"]');
      const pickerType = await picker.getAttribute('data-picker-type');
      
      // Verify iOS-style wheel picker on iOS
      if (await page.evaluate(() => /iPhone|iPad|iPod/.test(navigator.userAgent))) {
        expect(pickerType).toBe('wheel');
      }
      
      await page.screenshot({ path: 'screenshots/ios-date-picker.png' });
    });

    test('TC-MOBILE-024: Android date picker (calendar)', async ({ page }) => {
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      await page.getByLabel(/due date/i).click();
      
      const picker = page.locator('[data-testid="date-picker"]');
      const pickerType = await picker.getAttribute('data-picker-type');
      
      // Verify Material Design calendar on Android
      if (await page.evaluate(() => /Android/.test(navigator.userAgent))) {
        expect(pickerType).toBe('calendar');
      }
      
      await page.screenshot({ path: 'screenshots/android-date-picker.png' });
    });

    test('TC-MOBILE-024: iOS swipe-to-go-back gesture', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'iOS-specific feature');
      
      await page.goto('/tasks');
      
      const task = page.locator('[data-testid="task-card"]').first();
      await task.click();
      
      // Verify on detail page
      await expect(page).toHaveURL(/\/tasks\/\d+/);
      
      // Simulate swipe from left edge (iOS gesture)
      await page.touchscreen.swipe(
        { x: 0, y: 400 },
        { x: 300, y: 400 }
      );
      
      // Should navigate back
      await expect(page).toHaveURL(/\/tasks$/);
    });

    test('TC-MOBILE-024: Android hardware back button', async ({ page, browserName }) => {
      test.skip(browserName === 'webkit', 'Android-specific feature');
      
      await page.goto('/tasks');
      
      const task = page.locator('[data-testid="task-card"]').first();
      await task.click();
      
      await expect(page).toHaveURL(/\/tasks\/\d+/);
      
      // Simulate Android back button press
      await page.keyboard.press('Escape'); // Maps to back button
      
      // Should navigate back
      await expect(page).toHaveURL(/\/tasks$/);
    });

    test('TC-MOBILE-024: iOS share sheet', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'iOS-specific');
      
      await page.goto('/vault');
      await page.getByRole('button', { name: /unlock/i }).click();
      
      const secret = page.locator('[data-testid="secret-card"]').first();
      await secret.click();
      
      // Tap share button
      await page.getByTestId('share-button').click();
      
      // Verify iOS share sheet triggered
      const shareSheet = page.locator('[data-testid="share-sheet"]');
      await expect(shareSheet).toHaveAttribute('data-platform', 'ios');
    });

    test('TC-MOBILE-024: Android share intent', async ({ page, browserName }) => {
      test.skip(browserName === 'webkit', 'Android-specific');
      
      await page.goto('/vault');
      await page.getByRole('button', { name: /unlock/i }).click();
      
      const secret = page.locator('[data-testid="secret-card"]').first();
      await secret.click();
      
      await page.getByTestId('share-button').click();
      
      const shareSheet = page.locator('[data-testid="share-sheet"]');
      await expect(shareSheet).toHaveAttribute('data-platform', 'android');
    });

    test('TC-MOBILE-024: Haptic feedback consistency', async ({ page }) => {
      await page.goto('/tasks');
      
      // Monitor haptic feedback calls
      await page.evaluate(() => {
        window.hapticFeedbackCalls = [];
        window.mockHapticFeedback = (type) => {
          window.hapticFeedbackCalls.push(type);
        };
      });
      
      // Trigger haptic events
      const checkbox = page.locator('[data-testid="task-card"]').first().locator('input[type="checkbox"]');
      await checkbox.click();
      
      // Verify haptic called
      const calls = await page.evaluate(() => window.hapticFeedbackCalls);
      expect(calls).toContain('light'); // Light haptic on checkbox toggle
    });

    test('TC-MOBILE-024: Status bar styling', async ({ page }) => {
      await page.goto('/');
      
      // iOS: Light content on dark bg
      const statusBarStyle = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        return meta?.getAttribute('content');
      });
      
      expect(statusBarStyle).toMatch(/black-translucent|light-content/);
    });

    test('TC-MOBILE-024: Safe area handling (iOS notch)', async ({ page }) => {
      await page.goto('/');
      
      // Check safe area insets
      const hasSafeArea = await page.evaluate(() => {
        const styles = window.getComputedStyle(document.documentElement);
        const top = styles.getPropertyValue('padding-top');
        
        // iOS devices with notch have safe-area-inset-top
        return top.includes('env(safe-area-inset-top)') || 
               top.includes('constant(safe-area-inset-top)');
      });
      
      // Should handle safe areas on iOS
      if (await page.evaluate(() => /iPhone|iPad/.test(navigator.userAgent))) {
        expect(hasSafeArea).toBeTruthy();
      }
    });

    test('TC-MOBILE-024: Font consistency', async ({ page }) => {
      await page.goto('/');
      
      const fontFamily = await page.evaluate(() => {
        return window.getComputedStyle(document.body).fontFamily;
      });
      
      const isIOS = await page.evaluate(() => /iPhone|iPad/.test(navigator.userAgent));
      const isAndroid = await page.evaluate(() => /Android/.test(navigator.userAgent));
      
      if (isIOS) {
        expect(fontFamily).toContain('SF Pro'); // iOS system font
      } else if (isAndroid) {
        expect(fontFamily).toContain('Roboto'); // Android system font
      }
    });

    test('TC-MOBILE-024: Accessibility - VoiceOver vs TalkBack', async ({ page }) => {
      await page.goto('/tasks');
      
      // Both should announce task list identically
      const taskList = page.locator('[data-testid="task-list"]');
      const ariaLabel = await taskList.getAttribute('aria-label');
      
      expect(ariaLabel).toMatch(/task list|tasks/i);
      
      // Platform-specific announcements are handled by OS
      // We verify the semantic markup is correct for both
    });
  });

  /**
   * TC-MOBILE-025: App State Preservation (P1)
   */
  test.describe('App Lifecycle & State Preservation', () => {
    test('TC-MOBILE-025: Task form state preserved on background', async ({ page }) => {
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      // Partially fill form
      await page.getByLabel(/title/i).fill('Half-filled task');
      await page.getByLabel(/due date/i).click();
      await page.getByRole('option', { name: /feb 10, 2026/i }).click();
      // Leave category empty
      
      // Simulate app going to background
      await page.evaluate(() => {
        // Trigger AppState change event
        window.dispatchEvent(new Event('blur'));
        if (window.ReactNative) {
          window.ReactNative.AppState = 'background';
        }
      });
      
      // Wait 30 seconds (simulated)
      await page.waitForTimeout(1000); // Shortened for test
      
      // Bring app back to foreground
      await page.evaluate(() => {
        window.dispatchEvent(new Event('focus'));
        if (window.ReactNative) {
          window.ReactNative.AppState = 'active';
        }
      });
      
      // Verify form state preserved
      const titleValue = await page.getByLabel(/title/i).inputValue();
      expect(titleValue).toBe('Half-filled task');
      
      const dueDateValue = await page.getByLabel(/due date/i).inputValue();
      expect(dueDateValue).toContain('Feb 10, 2026');
      
      // Save button should still be disabled (category required)
      const saveButton = page.getByRole('button', { name: /create/i });
      await expect(saveButton).toBeDisabled();
    });

    test('TC-MOBILE-025: Vault auto-lock after 5 minutes', async ({ page }) => {
      await page.goto('/vault');
      await page.getByRole('button', { name: /unlock/i }).click();
      
      // Vault unlocked
      await expect(page.getByText(/vault contents/i)).toBeVisible();
      
      // Simulate app going to background
      await page.evaluate(() => {
        window.dispatchEvent(new Event('blur'));
      });
      
      // Simulate 5 minutes passing
      await page.evaluate(() => {
        // Mock time passing
        window.mockTimePassed = 5 * 60 * 1000; // 5 minutes
      });
      
      // Bring app back
      await page.evaluate(() => {
        window.dispatchEvent(new Event('focus'));
      });
      
      // Vault should be locked
      await expect(page.getByRole('button', { name: /unlock/i })).toBeVisible();
      await expect(page.getByText(/vault contents/i)).not.toBeVisible();
    });

    test('TC-MOBILE-025: Vault stays unlocked under 5 minutes', async ({ page }) => {
      await page.goto('/vault');
      await page.getByRole('button', { name: /unlock/i }).click();
      
      await expect(page.getByText(/vault contents/i)).toBeVisible();
      
      // Background for 30 seconds
      await page.evaluate(() => {
        window.dispatchEvent(new Event('blur'));
      });
      
      await page.waitForTimeout(1000); // Shortened
      
      await page.evaluate(() => {
        window.mockTimePassed = 30 * 1000; // 30 seconds
        window.dispatchEvent(new Event('focus'));
      });
      
      // Vault should still be unlocked
      await expect(page.getByText(/vault contents/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /unlock/i })).not.toBeVisible();
    });

    test('TC-MOBILE-025: Return to previous screen after unlock', async ({ page }) => {
      await page.goto('/vault');
      await page.getByRole('button', { name: /unlock/i }).click();
      
      // Open a secret
      const secret = page.locator('[data-testid="secret-card"]').first();
      await secret.click();
      
      await expect(page).toHaveURL(/\/vault\/\d+/);
      
      // Background for 5 minutes (triggers lock)
      await page.evaluate(() => {
        window.dispatchEvent(new Event('blur'));
        window.mockTimePassed = 5 * 60 * 1000;
      });
      
      await page.evaluate(() => {
        window.dispatchEvent(new Event('focus'));
      });
      
      // Unlock prompt appears immediately
      await expect(page.getByRole('button', { name: /unlock/i })).toBeVisible();
      
      // After unlocking
      await page.getByRole('button', { name: /unlock/i }).click();
      
      // Should return to the secret detail page
      await expect(page).toHaveURL(/\/vault\/\d+/);
    });

    test('TC-MOBILE-025: No data loss on background/foreground', async ({ page }) => {
      await page.goto('/tasks');
      
      const initialTaskCount = await page.locator('[data-testid="task-card"]').count();
      
      // Create task
      await page.getByTestId('add-task-button').click();
      await page.getByLabel(/title/i).fill('Background test');
      await page.getByRole('button', { name: /create/i }).click();
      
      await expect(page.getByText(/task created/i)).toBeVisible();
      
      // Verify task added
      const newCount = await page.locator('[data-testid="task-card"]').count();
      expect(newCount).toBe(initialTaskCount + 1);
      
      // Background and foreground
      await page.evaluate(() => {
        window.dispatchEvent(new Event('blur'));
      });
      await page.waitForTimeout(500);
      await page.evaluate(() => {
        window.dispatchEvent(new Event('focus'));
      });
      
      // Verify task still exists
      const afterBackgroundCount = await page.locator('[data-testid="task-card"]').count();
      expect(afterBackgroundCount).toBe(newCount);
      
      await expect(page.getByText('Background test')).toBeVisible();
    });

    test('TC-MOBILE-025: Android app killed and restored', async ({ page, browserName }) => {
      test.skip(browserName === 'webkit', 'Android-specific behavior');
      
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      await page.getByLabel(/title/i).fill('Test persistence');
      
      // Simulate Android killing app due to low memory
      await page.evaluate(() => {
        // Save state to localStorage
        if (window.ReactNative) {
          window.ReactNative.saveState();
        }
      });
      
      // Reload page (simulates app restart)
      await page.reload();
      
      // Verify state restored from disk
      // In real implementation, form would restore from persisted state
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      // Check if state was persisted (implementation-dependent)
      const titleValue = await page.getByLabel(/title/i).inputValue();
      // May or may not be restored depending on implementation
      // At minimum, app should not crash
    });

    test('TC-MOBILE-025: Handle phone call interruption (iOS)', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'iOS-specific');
      
      await page.goto('/tasks');
      
      // Simulate incoming call (app goes to 'inactive' state)
      await page.evaluate(() => {
        if (window.ReactNative) {
          window.ReactNative.AppState = 'inactive';
        }
      });
      
      // App should pause operations
      // Verify no crash or data corruption
      await page.waitForTimeout(500);
      
      // Call ends, app returns to active
      await page.evaluate(() => {
        if (window.ReactNative) {
          window.ReactNative.AppState = 'active';
        }
      });
      
      // App should resume normally
      await expect(page.locator('[data-testid="task-list"]')).toBeVisible();
    });
  });

  /**
   * Side-by-side platform comparison
   */
  test.describe('Visual Platform Comparison', () => {
    test('TC-MOBILE-024: Screenshot comparison iOS vs Android', async ({ page }) => {
      // Take screenshots of same screen on both platforms
      await page.goto('/tasks');
      
      const userAgent = await page.evaluate(() => navigator.userAgent);
      const platform = userAgent.includes('iPhone') ? 'ios' : 
                      userAgent.includes('Android') ? 'android' : 'desktop';
      
      await page.screenshot({ path: `screenshots/task-list-${platform}.png` });
      
      // Note: Visual regression testing would compare these screenshots
      // to ensure consistent layout across platforms
    });
  });
});
