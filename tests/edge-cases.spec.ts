import { test, expect } from '@playwright/test';

/**
 * Edge Cases Test Suite
 * Covers: TC-MOBILE-005, TC-MOBILE-006, TC-MOBILE-008, TC-MOBILE-009
 */
test.describe('Edge Cases', () => {
  /**
   * TC-MOBILE-005: Empty States Across All Features (P1)
   */
  test.describe('Empty States', () => {
    test.beforeEach(async ({ page, context }) => {
      // Fresh account with no data
      await context.clearCookies();
      await page.goto('/');
      // Complete onboarding (abbreviated)
      // ... assume authenticated but empty state
    });

    test('TC-MOBILE-005: Tasks empty state', async ({ page }) => {
      await page.goto('/tasks');
      
      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
      await expect(page.getByText(/no tasks yet/i)).toBeVisible();
      await expect(page.getByText(/tap.*to create your first task/i)).toBeVisible();
      
      const cta = page.getByRole('button', { name: /create task/i });
      await expect(cta).toBeVisible();
      
      // Verify CTA is tappable
      await cta.click();
      await expect(page.getByLabel(/title/i)).toBeVisible();
      
      await page.screenshot({ path: 'screenshots/empty-state-tasks.png' });
    });

    test('TC-MOBILE-005: Brain empty state', async ({ page }) => {
      await page.goto('/brain');
      
      await expect(page.getByText(/your second brain is empty/i)).toBeVisible();
      await expect(page.getByText(/add your first note or skill/i)).toBeVisible();
      
      const cta = page.getByRole('button', { name: /add/i });
      await expect(cta).toBeVisible();
      
      await page.screenshot({ path: 'screenshots/empty-state-brain.png' });
    });

    test('TC-MOBILE-005: Vault empty state', async ({ page }) => {
      await page.goto('/vault');
      await page.getByRole('button', { name: /unlock/i }).click();
      
      await expect(page.getByText(/your vault is secure but empty/i)).toBeVisible();
      await expect(page.getByText(/add your first secret/i)).toBeVisible();
      
      const cta = page.getByRole('button', { name: /add secret/i });
      await expect(cta).toBeVisible();
      
      await page.screenshot({ path: 'screenshots/empty-state-vault.png' });
    });

    test('TC-MOBILE-005: Places empty state', async ({ page }) => {
      await page.goto('/places');
      
      // Map shows user location only
      await expect(page.locator('[data-testid="map"]')).toBeVisible();
      await expect(page.getByText(/no saved places/i)).toBeVisible();
      await expect(page.getByText(/search to add your first location/i)).toBeVisible();
      
      const searchBar = page.getByPlaceholder(/search places/i);
      await expect(searchBar).toBeVisible();
      
      await page.screenshot({ path: 'screenshots/empty-state-places.png' });
    });

    test('TC-MOBILE-005: Scanner documents empty state', async ({ page }) => {
      await page.goto('/scanner/documents');
      
      await expect(page.getByText(/no scanned documents yet/i)).toBeVisible();
      await expect(page.getByText(/tap the camera button to scan/i)).toBeVisible();
      
      const cameraButton = page.getByTestId('camera-button');
      await expect(cameraButton).toBeVisible();
      
      await page.screenshot({ path: 'screenshots/empty-state-scanner.png' });
    });

    test('TC-MOBILE-005: Accessibility - Empty state announcements', async ({ page }) => {
      await page.goto('/tasks');
      
      const emptyState = page.locator('[data-testid="empty-state"]');
      await expect(emptyState).toHaveAccessibleDescription(/no tasks.*tap.*to create/i);
      
      const cta = page.getByRole('button', { name: /create/i });
      const bounds = await cta.boundingBox();
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.width).toBeGreaterThanOrEqual(44);
    });
  });

  /**
   * TC-MOBILE-006: Maximum Length Input Handling (P2)
   */
  test.describe('Maximum Length Inputs', () => {
    test('TC-MOBILE-006: Task title max 200 chars', async ({ page }) => {
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      const titleField = page.getByLabel(/title/i);
      const maxLengthText = 'A'.repeat(200);
      
      await titleField.fill(maxLengthText);
      
      // Verify character counter
      await expect(page.getByText('200/200')).toBeVisible();
      
      // Try to type more (blocked)
      await titleField.press('A');
      const value = await titleField.inputValue();
      expect(value).toHaveLength(200);
      
      // Screenshot
      await page.screenshot({ path: 'screenshots/max-length-task-title.png' });
    });

    test('TC-MOBILE-006: Task notes 5000 chars scrollable', async ({ page }) => {
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      const notesField = page.getByLabel(/notes/i);
      const longText = 'B'.repeat(5000);
      
      await notesField.fill(longText);
      
      // Verify scrollable
      const isScrollable = await notesField.evaluate(el => el.scrollHeight > el.clientHeight);
      expect(isScrollable).toBeTruthy();
      
      // Fill rest of form and submit
      await page.getByLabel(/title/i).fill('Long notes task');
      await page.getByRole('button', { name: /create/i }).click();
      
      // Verify saves successfully
      await expect(page.getByText(/task created/i)).toBeVisible();
    });

    test('TC-MOBILE-006: Vault secret max lengths', async ({ page }) => {
      await page.goto('/vault');
      await page.getByRole('button', { name: /unlock/i }).click();
      await page.getByTestId('add-secret-button').click();
      await page.getByRole('option', { name: /login/i }).click();
      
      // Title: 100 chars max
      const titleField = page.getByLabel(/title/i);
      await titleField.fill('T'.repeat(100));
      expect(await titleField.inputValue()).toHaveLength(100);
      await titleField.press('T'); // Blocked
      expect(await titleField.inputValue()).toHaveLength(100);
      
      // Username: 200 chars max
      const usernameField = page.getByLabel(/username/i);
      await usernameField.fill('U'.repeat(200));
      expect(await usernameField.inputValue()).toHaveLength(200);
      
      // Password: 128 chars max
      const passwordField = page.getByLabel(/password/i);
      await passwordField.fill('P'.repeat(128));
      expect(await passwordField.inputValue()).toHaveLength(128);
      
      await page.screenshot({ path: 'screenshots/max-length-vault-fields.png' });
    });

    test('TC-MOBILE-006: Accessibility - Character counter announced', async ({ page }) => {
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      const titleField = page.getByLabel(/title/i);
      await titleField.fill('A'.repeat(200));
      
      const counter = page.getByText('200/200');
      await expect(counter).toHaveAccessibleName(/200 of 200 characters used/i);
    });
  });

  /**
   * TC-MOBILE-008: Overflow Content & Scroll Behavior (P2)
   */
  test.describe('Overflow & Scroll Performance', () => {
    test.beforeEach(async ({ page }) => {
      // Seed large datasets
      await page.evaluate(() => {
        window.seedTasks(100);
        window.seedVaultSecrets(50);
      });
    });

    test('TC-MOBILE-008: Task list scroll performance', async ({ page }) => {
      await page.goto('/tasks');
      
      const taskList = page.locator('[data-testid="task-list"]');
      
      // Scroll to bottom
      await taskList.evaluate(el => el.scrollTo(0, el.scrollHeight));
      await expect(page.getByText(/task 100/i)).toBeVisible();
      
      // Measure FPS (simplified)
      const fps = await page.evaluate(() => {
        let frameCount = 0;
        const startTime = performance.now();
        
        return new Promise(resolve => {
          function countFrame() {
            frameCount++;
            if (performance.now() - startTime < 1000) {
              requestAnimationFrame(countFrame);
            } else {
              resolve(frameCount);
            }
          }
          requestAnimationFrame(countFrame);
        });
      });
      
      expect(fps).toBeGreaterThanOrEqual(55);
      
      // Verify scroll position preserved
      await page.getByText(/task 100/i).click();
      await page.goBack();
      await expect(page.getByText(/task 100/i)).toBeVisible();
    });

    test('TC-MOBILE-008: Vault scroll with decryption', async ({ page }) => {
      await page.goto('/vault');
      await page.getByRole('button', { name: /unlock/i }).click();
      
      const vaultList = page.locator('[data-testid="vault-list"]');
      
      // Scroll to bottom (secret 50)
      await vaultList.evaluate(el => el.scrollTo(0, el.scrollHeight));
      await expect(page.getByText(/secret 50/i)).toBeVisible();
      
      // Verify encrypted fields load instantly (pre-decrypted in cache)
      const secretCard = page.locator('[data-testid="secret-card"]').last();
      await expect(secretCard.locator('[data-testid="username"]')).toBeVisible();
    });

    test('TC-MOBILE-008: Long notes field scroll', async ({ page }) => {
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      const notesField = page.getByLabel(/notes/i);
      await notesField.fill('X'.repeat(5000));
      
      // Scroll within field
      await notesField.evaluate(el => el.scrollTo(0, el.scrollHeight));
      
      // Verify no lag when typing at max length
      const startTime = Date.now();
      await notesField.press('Y');
      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(100); // < 100ms lag
    });
  });

  /**
   * TC-MOBILE-009: Boundary Values & Invalid Data (P2)
   */
  test.describe('Boundary Values & Validation', () => {
    test('TC-MOBILE-009: Task title validation', async ({ page }) => {
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      const saveButton = page.getByRole('button', { name: /create task/i });
      
      // Empty title
      await expect(saveButton).toBeDisabled();
      await expect(page.getByText(/title required/i)).toBeVisible();
      
      // Single space (trimmed)
      await page.getByLabel(/title/i).fill(' ');
      await page.getByLabel(/title/i).blur();
      await expect(saveButton).toBeDisabled();
      await expect(page.getByText(/title required/i)).toBeVisible();
      
      // Special chars (valid)
      await page.getByLabel(/title/i).fill('!@#$%^&*()');
      await expect(saveButton).toBeEnabled();
    });

    test('TC-MOBILE-009: Past due date warning', async ({ page }) => {
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      await page.getByLabel(/title/i).fill('Test task');
      
      // Set past date
      await page.getByLabel(/due date/i).click();
      await page.getByRole('option', { name: /yesterday/i }).click();
      
      const saveButton = page.getByRole('button', { name: /create task/i });
      await saveButton.click();
      
      // Verify warning confirmation
      await expect(page.getByText(/due date is in the past.*continue/i)).toBeVisible();
      await page.getByRole('button', { name: /yes, continue/i }).click();
      
      // Task created
      await expect(page.getByText(/task created/i)).toBeVisible();
    });

    test('TC-MOBILE-009: Vault weak password warnings', async ({ page }) => {
      await page.goto('/vault');
      await page.getByRole('button', { name: /unlock/i }).click();
      await page.getByTestId('add-secret-button').click();
      await page.getByRole('option', { name: /login/i }).click();
      
      await page.getByLabel(/title/i).fill('Test');
      
      // Single char password
      await page.getByLabel(/password/i).fill('a');
      await expect(page.locator('.password-strength')).toHaveText(/very weak/i);
      await expect(page.locator('.password-strength-bar')).toHaveCSS('background-color', /red/);
      
      // All same char
      await page.getByLabel(/password/i).fill('aaaaaaaaaa');
      await expect(page.locator('.password-strength')).toHaveText(/weak/i);
      
      // Both should allow save but show warning
      const saveButton = page.getByRole('button', { name: /save secret/i });
      await expect(saveButton).toBeEnabled();
      
      await saveButton.click();
      await expect(page.getByText(/weak password.*continue/i)).toBeVisible();
    });

    test('TC-MOBILE-009: Vault URL validation', async ({ page }) => {
      await page.goto('/vault');
      await page.getByRole('button', { name: /unlock/i }).click();
      await page.getByTestId('add-secret-button').click();
      await page.getByRole('option', { name: /login/i }).click();
      
      await page.getByLabel(/title/i).fill('Test');
      await page.getByLabel(/password/i).fill('StrongPass123!');
      
      // Invalid URL format
      await page.getByLabel(/url/i).fill('not a url');
      await page.getByRole('button', { name: /save secret/i }).click();
      
      // Should save (URL not required) but no link icon
      await expect(page.getByText(/secret saved/i)).toBeVisible();
      const secretCard = page.locator('[data-testid="secret-card"]').first();
      await expect(secretCard.getByTestId('url-link')).not.toBeVisible();
      
      // Valid URL
      await page.getByTestId('add-secret-button').click();
      await page.getByLabel(/url/i).fill('https://github.com');
      await page.getByRole('button', { name: /save secret/i }).click();
      
      const newSecretCard = page.locator('[data-testid="secret-card"]').first();
      await expect(newSecretCard.getByTestId('url-link')).toBeVisible();
    });
  });
});
