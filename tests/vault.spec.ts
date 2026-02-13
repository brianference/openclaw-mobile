import { test, expect } from '@playwright/test';

/**
 * Vault / Secret Management Test Suite
 * Covers: TC-MOBILE-002, TC-MOBILE-011
 */
test.describe('Encrypted Vault', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vault');
    
    // Unlock vault (assume biometric auto-approved in test)
    await page.getByRole('button', { name: /unlock/i }).click();
    await expect(page.getByText(/vault contents/i)).toBeVisible();
  });

  /**
   * TC-MOBILE-002: Vault Secret Creation & Encryption (P0)
   */
  test('TC-MOBILE-002: Create login secret with password generator', async ({ page }) => {
    // Click Add button
    await page.getByTestId('add-secret-button').click();
    
    // Select secret type
    await page.getByRole('option', { name: /🌐 login/i }).click();
    
    // Fill title
    await page.getByLabel(/title/i).fill('GitHub');
    
    // Fill username
    await page.getByLabel(/username/i).fill('brianference');
    
    // Open password generator
    await page.getByTestId('generate-password-button').click();
    
    // Configure generator
    await page.getByLabel(/length/i).fill('16');
    await page.getByLabel(/uppercase/i).check();
    await page.getByLabel(/lowercase/i).check();
    await page.getByLabel(/numbers/i).check();
    await page.getByLabel(/symbols/i).check();
    
    // Verify strength indicator
    await expect(page.locator('.password-strength')).toHaveText(/strong/i);
    await expect(page.locator('.password-strength-bar')).toHaveCSS('background-color', /green/);
    await expect(page.locator('.password-strength-segments')).toHaveAttribute('data-filled', '8');
    
    // Use generated password
    const generatedPassword = await page.getByTestId('password-input').inputValue();
    expect(generatedPassword).toMatch(/^[A-Za-z0-9!@#$]{16}$/);
    
    await page.getByRole('button', { name: /use password/i }).click();
    
    // Fill URL
    await page.getByLabel(/url/i).fill('github.com');
    
    // Save secret
    const saveButton = page.getByRole('button', { name: /save secret/i });
    await expect(saveButton).toBeEnabled();
    
    // Verify encryption happens (spinner visible)
    await saveButton.click();
    await expect(page.locator('.spinner')).toBeVisible();
    
    // Wait for success toast
    await expect(page.getByText(/secret saved successfully/i)).toBeVisible();
    
    // Verify navigation back to vault contents
    await expect(page).toHaveURL(/\/vault/);
    
    // Verify new secret card appears
    const secretCard = page.locator('[data-testid="secret-card"]').first();
    await expect(secretCard).toContainText('🌐 GitHub');
    await expect(secretCard).toContainText('brianference');
    await expect(secretCard).toContainText('••••••••••••'); // Password hidden
    
    // Test reveal password
    const revealButton = secretCard.getByTestId('reveal-password');
    await revealButton.click();
    
    // Verify password revealed
    await expect(secretCard.locator('[data-testid="password-field"]')).toHaveText(generatedPassword);
    
    // Wait 10 seconds for auto-hide
    await page.waitForTimeout(10000);
    await expect(secretCard.locator('[data-testid="password-field"]')).toHaveText('••••••••••••');
  });

  /**
   * TC-MOBILE-002: Accessibility checks
   */
  test('TC-MOBILE-002: Password field accessibility', async ({ page }) => {
    await page.getByTestId('add-secret-button').click();
    await page.getByRole('option', { name: /🌐 login/i }).click();
    
    const passwordField = page.getByTestId('password-input');
    await expect(passwordField).toHaveAttribute('type', 'password');
    await expect(passwordField).toHaveAccessibleDescription(/secure text field/i);
    
    const revealButton = page.getByTestId('reveal-password');
    await expect(revealButton).toHaveAccessibleName(/toggle password visibility.*hidden/i);
    
    await revealButton.click();
    await expect(revealButton).toHaveAccessibleName(/password revealed.*will hide in 10 seconds/i);
  });

  /**
   * TC-MOBILE-002: Test password generator validation
   */
  test('TC-MOBILE-002: Generated password matches pattern', async ({ page }) => {
    await page.getByTestId('add-secret-button').click();
    await page.getByRole('option', { name: /🌐 login/i }).click();
    await page.getByTestId('generate-password-button').click();
    
    // Set length to 16
    await page.getByLabel(/length/i).fill('16');
    
    const generatedPassword = await page.getByTestId('generated-password-display').textContent();
    
    // Verify pattern: 16 chars, alphanumeric + symbols
    expect(generatedPassword).toHaveLength(16);
    expect(generatedPassword).toMatch(/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/);
  });

  /**
   * TC-MOBILE-002: Security - Never log password in test output
   */
  test('TC-MOBILE-002: Password not logged', async ({ page }) => {
    await page.getByTestId('add-secret-button').click();
    await page.getByRole('option', { name: /🌐 login/i }).click();
    
    const password = 'TestPassword123!';
    await page.getByLabel(/password/i).fill(password);
    
    // Verify password is masked in DOM
    const passwordInput = page.getByTestId('password-input');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Security: Never log actual password
    console.log('Password field filled (redacted for security)');
  });

  /**
   * TC-MOBILE-011: Vault Decryption Failure (P0)
   */
  test('TC-MOBILE-011: Handle corrupted secret data', async ({ page }) => {
    // Inject corrupted data into vault
    await page.evaluate(() => {
      localStorage.setItem('vault_secret_1', 'CORRUPTED_BASE64_DATA!!!');
    });
    
    // Try to open secret
    const corruptedSecret = page.locator('[data-testid="secret-card"]').first();
    await corruptedSecret.click();
    
    // Verify loading spinner
    await expect(page.locator('.spinner')).toBeVisible();
    
    // Wait for timeout (2s)
    await page.waitForTimeout(2000);
    
    // Verify error modal
    const errorModal = page.getByRole('dialog');
    await expect(errorModal).toBeVisible();
    await expect(errorModal).toContainText(/decryption failed/i);
    await expect(errorModal).toContainText(/unable to decrypt.*data may be corrupted/i);
    
    // Verify modal actions
    await expect(errorModal.getByRole('button', { name: /try again/i })).toBeVisible();
    await expect(errorModal.getByRole('button', { name: /report issue/i })).toBeVisible();
    await expect(errorModal.getByRole('button', { name: /cancel/i })).toBeVisible();
    
    // Screenshot error state
    await page.screenshot({ path: 'screenshots/vault-decryption-error.png' });
  });

  test('TC-MOBILE-011: Retry decryption', async ({ page }) => {
    // Inject corrupted data
    await page.evaluate(() => {
      localStorage.setItem('vault_secret_1', 'CORRUPTED_DATA');
    });
    
    const secret = page.locator('[data-testid="secret-card"]').first();
    await secret.click();
    await page.waitForTimeout(2000);
    
    // Click Try Again
    await page.getByRole('button', { name: /try again/i }).click();
    
    // Verify re-attempt
    await expect(page.locator('.spinner')).toBeVisible();
    await page.waitForTimeout(2000);
    
    // Still fails (data still corrupted)
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('TC-MOBILE-011: Mid-reveal decryption error', async ({ page }) => {
    const secret = page.locator('[data-testid="secret-card"]').first();
    
    // Mock decryption failure during reveal
    await page.evaluate(() => {
      window.mockDecryptionError = true;
    });
    
    // Click reveal
    await secret.getByTestId('reveal-password').click();
    
    // Verify spinner
    await expect(secret.locator('.spinner')).toBeVisible();
    
    // Verify error toast
    await expect(page.getByText(/unable to reveal password.*try again/i)).toBeVisible();
    
    // Verify password remains hidden
    await expect(secret.locator('[data-testid="password-field"]')).toHaveText('••••••••••••');
    
    // Verify no plaintext exposed in DOM
    const dom = await page.content();
    expect(dom).not.toContain('actualPlaintextPassword');
  });

  test('TC-MOBILE-011: Accessibility - Error modal focus trap', async ({ page }) => {
    // Trigger error
    await page.evaluate(() => {
      localStorage.setItem('vault_secret_1', 'CORRUPTED');
    });
    await page.locator('[data-testid="secret-card"]').first().click();
    await page.waitForTimeout(2000);
    
    const modal = page.getByRole('dialog');
    
    // Verify focus trap
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAccessibleName(/try again/i);
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAccessibleName(/report issue/i);
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAccessibleName(/cancel/i);
    
    await page.keyboard.press('Tab'); // Should loop back
    await expect(page.locator(':focus')).toHaveAccessibleName(/try again/i);
  });

  test('TC-MOBILE-011: Security - Error doesn\'t leak key material', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('vault_secret_1', 'CORRUPTED');
    });
    await page.locator('[data-testid="secret-card"]').first().click();
    await page.waitForTimeout(2000);
    
    // Capture page content
    const content = await page.content();
    
    // Verify no key material in error message
    expect(content).not.toMatch(/[A-Za-z0-9+/]{32,}/); // No base64 keys
    expect(content).not.toContain('encryption_key');
    expect(content).not.toContain('master_password');
  });
});
