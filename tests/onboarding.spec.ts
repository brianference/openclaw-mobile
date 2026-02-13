import { test, expect } from '@playwright/test';

/**
 * TC-MOBILE-004: Onboarding to First Task (P0)
 * Complete user journey from fresh install to first task creation
 */
test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all storage to simulate fresh install
    await context.clearCookies();
    await page.goto('/');
  });

  test('TC-MOBILE-004: Complete onboarding and create first task', async ({ page }) => {
    // Step 1: Welcome screen
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
    await expect(page.getByText(/step 1 of 3/i)).toBeVisible();
    
    // Step 2: Next to features screen
    await page.getByRole('button', { name: /next/i }).click();
    await expect(page.getByText(/step 2 of 3/i)).toBeVisible();
    await expect(page.getByRole('list')).toBeVisible();
    
    // Step 3: Next to password setup
    await page.getByRole('button', { name: /next/i }).click();
    await expect(page.getByText(/step 3 of 3/i)).toBeVisible();
    
    // Step 4: Enter master password
    const passwordField = page.getByLabel(/master password/i);
    await passwordField.fill('SecurePass123!');
    
    // Step 5: Confirm password
    const confirmField = page.getByLabel(/confirm password/i);
    await confirmField.fill('SecurePass123!');
    
    // Step 6: Check password strength
    await expect(page.getByText(/strong/i)).toBeVisible();
    await expect(page.locator('.password-strength')).toHaveClass(/green|success/);
    
    // Step 7: Enable biometric (checkbox)
    await page.getByLabel(/enable biometric/i).check();
    
    // Step 8: Submit onboarding
    const getStartedButton = page.getByRole('button', { name: /get started/i });
    await expect(getStartedButton).toBeEnabled();
    await getStartedButton.click();
    
    // Step 9: Verify navigation to task list
    await expect(page).toHaveURL(/\/tasks/);
    
    // Step 10: Verify empty state
    await expect(page.getByText(/no tasks yet/i)).toBeVisible();
    await expect(page.getByText(/tap.*to create your first task/i)).toBeVisible();
    
    // Step 11: Create first task
    await page.getByTestId('add-task-button').click();
    
    // Step 12: Fill task form
    await page.getByLabel(/title/i).fill('Write design spec');
    
    // Step 13: Set due date
    await page.getByLabel(/due date/i).click();
    await page.getByRole('option', { name: /feb 9.*2026/i }).click();
    await page.getByRole('option', { name: /2:00 pm/i }).click();
    
    // Step 14: Set category
    await page.getByLabel(/category/i).click();
    await page.getByRole('option', { name: /work/i }).click();
    
    // Step 15: Set reminder
    await page.getByLabel(/reminder/i).click();
    await page.getByRole('option', { name: /1 hour before/i }).click();
    
    // Step 16: Add notes
    await page.getByLabel(/notes/i).fill('Complete all 25 screens');
    
    // Step 17: Create task
    const createButton = page.getByRole('button', { name: /create task/i });
    await expect(createButton).toBeEnabled();
    await expect(createButton).toHaveClass(/gradient/);
    
    // Take screenshot before submission
    await page.screenshot({ path: 'screenshots/task-form-before-submit.png' });
    
    await createButton.click();
    
    // Step 18: Wait for toast
    await expect(page.getByText(/task created successfully/i)).toBeVisible();
    await page.waitForTimeout(4000); // Toast auto-dismisses after 4s
    
    // Step 19: Verify navigation back to task list
    await expect(page).toHaveURL(/\/tasks/);
    
    // Step 20: Verify new task appears
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard).toBeVisible();
    await expect(taskCard).toContainText('Write design spec');
    await expect(taskCard).toContainText(/feb 9.*2pm/i);
    await expect(taskCard).toContainText('📋 Work');
    await expect(taskCard.locator('input[type="checkbox"]')).not.toBeChecked();
    
    // Take screenshot after success
    await page.screenshot({ path: 'screenshots/task-created-success.png' });
  });

  test('TC-MOBILE-004: Accessibility - VoiceOver announcements', async ({ page }) => {
    // Test keyboard navigation through onboarding
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAccessibleName(/next/i);
    
    // Verify stepper accessibility
    const stepper = page.getByRole('navigation', { name: /progress/i });
    await expect(stepper).toHaveAttribute('aria-label', /step 1 of 3/i);
  });

  test('TC-MOBILE-004: Responsive - Different breakpoints', async ({ page, viewport }) => {
    const breakpoints = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 14 Pro', width: 430, height: 932 },
      { name: 'iPad', width: 768, height: 1024 },
    ];

    for (const bp of breakpoints) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      
      // Verify onboarding renders correctly at this breakpoint
      const heading = page.getByRole('heading').first();
      await expect(heading).toBeVisible();
      
      // Take screenshot for visual regression
      await page.screenshot({ path: `screenshots/onboarding-${bp.name}.png` });
    }
  });
});
