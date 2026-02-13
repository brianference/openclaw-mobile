import { test, expect } from '@playwright/test';

/**
 * Task Board Test Suite
 * Covers: TC-MOBILE-001, TC-MOBILE-007, TC-MOBILE-010, TC-MOBILE-022
 */
test.describe('Task Board', () => {
  test.beforeEach(async ({ page }) => {
    // Assume authenticated user
    await page.goto('/tasks');
  });

  /**
   * TC-MOBILE-001: Complete Task Creation Flow (P0)
   */
  test('TC-MOBILE-001: Create task with all fields', async ({ page }) => {
    // Click Add button
    await page.getByTestId('add-task-button').click();
    
    // Fill form
    await page.getByLabel(/title/i).fill('Write design spec');
    
    // Due date picker
    await page.getByLabel(/due date/i).click();
    await page.getByRole('option', { name: /feb 9, 2026/i }).click();
    await page.getByRole('option', { name: /2:00 pm/i }).click();
    
    // Category selection
    await page.getByLabel(/category/i).click();
    await page.getByRole('option', { name: /work/i }).click();
    
    // Reminder
    await page.getByLabel(/reminder/i).click();
    await page.getByRole('option', { name: /1 hour before/i }).click();
    
    // Notes
    await page.getByLabel(/notes/i).fill('Complete all 25 screens');
    
    // Verify create button is enabled with gradient
    const createButton = page.getByRole('button', { name: /create task/i });
    await expect(createButton).toBeEnabled();
    await expect(createButton).toHaveCSS('background', /gradient/);
    
    // Screenshot before submit
    await page.screenshot({ path: 'screenshots/task-form-filled.png' });
    
    // Submit
    await createButton.click();
    
    // Wait for spinner and toast
    await expect(page.locator('.spinner')).toBeVisible();
    await expect(page.getByText(/task created successfully/i)).toBeVisible();
    
    // Verify navigation and task appears
    await expect(page).toHaveURL(/\/tasks/);
    
    const newTask = page.locator('[data-testid="task-card"]').first();
    await expect(newTask).toContainText('Write design spec');
    await expect(newTask).toContainText(/feb 9.*2pm/i);
    await expect(newTask).toContainText('📋 Work');
    await expect(newTask.locator('input[type="checkbox"]')).not.toBeChecked();
    
    await page.screenshot({ path: 'screenshots/task-created.png' });
  });

  /**
   * TC-MOBILE-001: Accessibility checks
   */
  test('TC-MOBILE-001: VoiceOver announcements on task creation', async ({ page }) => {
    await page.getByTestId('add-task-button').click();
    await page.getByLabel(/title/i).fill('Test task');
    await page.getByRole('button', { name: /create task/i }).click();
    
    // Verify toast is announced
    const toast = page.getByRole('status').filter({ hasText: /task created successfully/i });
    await expect(toast).toHaveAttribute('role', 'status');
    await expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  /**
   * TC-MOBILE-001: Keyboard navigation through form
   */
  test('TC-MOBILE-001: Tab navigates all fields in logical order', async ({ page }) => {
    await page.getByTestId('add-task-button').click();
    
    // Tab through all fields
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('name', /title/i);
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('name', /due date/i);
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('name', /category/i);
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('name', /reminder/i);
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('name', /notes/i);
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAccessibleName(/create task/i);
  });

  /**
   * TC-MOBILE-007: Rapid Interaction & Race Conditions (P1)
   */
  test('TC-MOBILE-007: Debounced checkbox toggle', async ({ page }) => {
    // Seed with 10 tasks
    // ... (assume tasks exist)
    
    const checkbox = page.locator('[data-testid="task-card"]').first().locator('input[type="checkbox"]');
    
    // Rapid click 3 times within 1 second
    await checkbox.click({ delay: 10 });
    await checkbox.click({ delay: 10 });
    await checkbox.click({ delay: 10 });
    
    // Wait for debounce
    await page.waitForTimeout(500);
    
    // Verify only final state applied (3 toggles = 1 toggle from unchecked to checked)
    await expect(checkbox).toBeChecked();
    
    // Verify only 1 API call made (check network logs)
    const apiCalls = page.locator('[data-testid="api-call-count"]');
    await expect(apiCalls).toHaveText('1');
  });

  test('TC-MOBILE-007: Queued swipe actions', async ({ page }) => {
    const task2 = page.locator('[data-testid="task-card"]').nth(1);
    const task3 = page.locator('[data-testid="task-card"]').nth(2);
    
    // Swipe task 2 left to delete
    await task2.swipe('left');
    
    // Immediately swipe task 3 (before animation completes)
    await task3.swipe('left');
    
    // Verify task 2 deletes first
    await expect(page.getByText(/deleted/i)).toBeVisible();
    await page.waitForTimeout(300); // Animation duration
    
    // Then task 3 swipe action reveals
    await expect(task3.locator('[data-testid="delete-button"]')).toBeVisible();
  });

  /**
   * TC-MOBILE-010: Network Failure During Sync (P0)
   */
  test('TC-MOBILE-010: Offline task creation', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    
    // Create task
    await page.getByTestId('add-task-button').click();
    await page.getByLabel(/title/i).fill('Offline Task');
    await page.getByRole('button', { name: /create task/i }).click();
    
    // Verify offline toast
    await expect(page.getByText(/saved offline.*will sync when online/i)).toBeVisible();
    
    // Verify sync pending indicator
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard.locator('[data-testid="sync-pending"]')).toBeVisible();
    await expect(taskCard.locator('[data-testid="sync-pending"]')).toHaveText('🔄');
    
    // Go online
    await context.setOffline(false);
    
    // Wait for auto-sync
    await expect(page.getByText(/syncing.*changes/i)).toBeVisible();
    await expect(page.getByText(/synced successfully/i)).toBeVisible();
    
    // Verify sync indicator disappears
    await expect(taskCard.locator('[data-testid="sync-pending"]')).not.toBeVisible();
  });

  test('TC-MOBILE-010: Offline edit and delete', async ({ page, context }) => {
    await context.setOffline(true);
    
    const task = page.locator('[data-testid="task-card"]').first();
    
    // Edit
    await task.click();
    await page.getByLabel(/title/i).fill('Updated offline');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/saved offline/i)).toBeVisible();
    
    // Delete
    await task.swipe('left');
    await page.getByTestId('delete-button').click();
    await expect(page.getByText(/deleted offline/i)).toBeVisible();
    await expect(task).not.toBeVisible();
    
    // Go online and verify sync
    await context.setOffline(false);
    await expect(page.getByText(/syncing/i)).toBeVisible();
    await expect(page.getByText(/synced successfully/i)).toBeVisible();
  });

  test('TC-MOBILE-010: Pull-to-refresh offline', async ({ page, context }) => {
    await context.setOffline(true);
    
    // Pull to refresh
    await page.locator('[data-testid="task-list"]').swipe('down');
    
    // Verify error toast
    await expect(page.getByText(/no internet connection.*showing offline data/i)).toBeVisible();
    
    // Verify no crash
    await expect(page.locator('[data-testid="task-list"]')).toBeVisible();
  });

  /**
   * TC-MOBILE-022: Large Dataset Rendering (P1)
   */
  test('TC-MOBILE-022: Render 500 tasks with virtualization', async ({ page }) => {
    // Seed database with 500 tasks
    await page.evaluate(() => {
      // Mock seeding function
      window.seedTasks(500);
    });
    
    await page.goto('/tasks');
    
    // Measure initial render time
    const startTime = Date.now();
    await expect(page.locator('[data-testid="task-card"]').first()).toBeVisible();
    const renderTime = Date.now() - startTime;
    
    // Assert: Render time < 2s
    expect(renderTime).toBeLessThan(2000);
    
    // Verify virtualization (only ~10-15 items in DOM)
    const renderedTasks = await page.locator('[data-testid="task-card"]').count();
    expect(renderedTasks).toBeLessThan(20);
    
    // Scroll to bottom
    await page.locator('[data-testid="task-list"]').evaluate(el => {
      el.scrollTo(0, el.scrollHeight);
    });
    
    // Verify scroll to task 500
    await expect(page.locator('[data-testid="task-card"]').last()).toContainText(/task 500/i);
    
    // Measure FPS during scroll (advanced - requires performance API)
    const fps = await page.evaluate(() => {
      return window.performance.getEntriesByType('measure')[0].fps;
    });
    expect(fps).toBeGreaterThanOrEqual(55);
    
    // Screenshot
    await page.screenshot({ path: 'screenshots/large-task-list.png' });
  });

  test('TC-MOBILE-022: Memory usage with 500 tasks', async ({ page }) => {
    await page.evaluate(() => window.seedTasks(500));
    await page.goto('/tasks');
    
    const metrics = await page.metrics();
    const memoryMB = metrics.JSHeapUsedSize / 1024 / 1024;
    
    // Assert: Memory < 150MB
    expect(memoryMB).toBeLessThan(150);
  });
});
