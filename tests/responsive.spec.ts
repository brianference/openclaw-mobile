import { test, expect } from '@playwright/test';

/**
 * Responsive Design Test Suite
 * Covers: TC-MOBILE-019, TC-MOBILE-020, TC-MOBILE-021
 */
test.describe('Responsive Design', () => {
  /**
   * TC-MOBILE-019: Breakpoint Transitions (P1)
   */
  test.describe('Breakpoint Testing', () => {
    const breakpoints = [
      { name: 'iPhone SE', width: 375, height: 667, columns: 1 },
      { name: 'iPhone 14 Pro', width: 430, height: 932, columns: 1 },
      { name: 'iPad Portrait', width: 768, height: 1024, columns: 2 },
      { name: 'iPad Landscape', width: 1024, height: 768, columns: 3 },
    ];

    for (const bp of breakpoints) {
      test(`TC-MOBILE-019: Task list at ${bp.name} (${bp.width}px)`, async ({ page }) => {
        await page.setViewportSize({ width: bp.width, height: bp.height });
        await page.goto('/tasks');
        
        // Verify layout
        const taskList = page.locator('[data-testid="task-list"]');
        await expect(taskList).toBeVisible();
        
        // Check column count based on breakpoint
        if (bp.width >= 1024) {
          // Three column layout
          const gridColumns = await taskList.evaluate(el => {
            return window.getComputedStyle(el).gridTemplateColumns;
          });
          expect(gridColumns.split(' ').length).toBe(3);
        } else if (bp.width >= 768) {
          // Two column layout
          const gridColumns = await taskList.evaluate(el => {
            return window.getComputedStyle(el).gridTemplateColumns;
          });
          expect(gridColumns.split(' ').length).toBe(2);
        } else {
          // Single column layout
          const gridColumns = await taskList.evaluate(el => {
            return window.getComputedStyle(el).gridTemplateColumns;
          });
          expect(gridColumns.split(' ').length).toBe(1);
        }
        
        // Verify no horizontal scroll
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalScroll).toBeFalsy();
        
        // Verify touch targets ≥44px
        const button = page.getByTestId('add-task-button');
        const bounds = await button.boundingBox();
        expect(bounds.height).toBeGreaterThanOrEqual(44);
        expect(bounds.width).toBeGreaterThanOrEqual(44);
        
        // Screenshot for visual regression
        await page.screenshot({ path: `screenshots/task-list-${bp.name.replace(/\s+/g, '-')}.png` });
      });
    }

    test('TC-MOBILE-019: Task detail modal responsiveness', async ({ page }) => {
      // Mobile: Full-screen modal
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      const modal = page.getByRole('dialog');
      const mobileBounds = await modal.boundingBox();
      expect(mobileBounds.width).toBe(375); // Full width
      
      await page.screenshot({ path: 'screenshots/modal-mobile.png' });
      
      // Tablet: Centered modal (500px width)
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      const tabletBounds = await modal.boundingBox();
      expect(tabletBounds.width).toBe(500);
      
      // Verify centered
      const viewportCenter = 768 / 2;
      const modalCenter = tabletBounds.x + (tabletBounds.width / 2);
      expect(Math.abs(modalCenter - viewportCenter)).toBeLessThan(10);
      
      await page.screenshot({ path: 'screenshots/modal-tablet.png' });
    });

    test('TC-MOBILE-019: Settings layout at different breakpoints', async ({ page }) => {
      const breakpoints = [375, 430, 768, 1024];
      
      for (const width of breakpoints) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto('/settings');
        
        const container = page.locator('[data-testid="settings-container"]');
        
        if (width >= 768) {
          // Centered with max-width: 600px
          const maxWidth = await container.evaluate(el => {
            return window.getComputedStyle(el).maxWidth;
          });
          expect(maxWidth).toBe('600px');
        } else {
          // Full width on mobile
          const containerWidth = await container.evaluate(el => el.offsetWidth);
          expect(containerWidth).toBe(width - 32); // Minus padding
        }
        
        await page.screenshot({ path: `screenshots/settings-${width}px.png` });
      }
    });

    test('TC-MOBILE-019: Bottom tab bar vs side tabs', async ({ page }) => {
      // Mobile: Bottom tab bar
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      const bottomTabs = page.locator('[data-testid="tab-bar"]');
      await expect(bottomTabs).toBeVisible();
      
      const position = await bottomTabs.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return { bottom: rect.bottom, height: rect.height };
      });
      
      expect(position.height).toBe(64);
      expect(position.bottom).toBe(667); // At bottom of viewport
      
      // Tablet: Could be bottom OR side tabs (implementation choice)
      // For this test, assume bottom tabs on all platforms
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(bottomTabs).toBeVisible();
    });
  });

  /**
   * TC-MOBILE-020: Orientation Changes (P2)
   */
  test.describe('Orientation Handling', () => {
    test('TC-MOBILE-020: Places map orientation change', async ({ page }) => {
      await page.goto('/places');
      
      // Portrait
      await page.setViewportSize({ width: 375, height: 667 });
      
      const map = page.locator('[data-testid="map"]');
      await expect(map).toBeVisible();
      
      const portraitBounds = await map.boundingBox();
      expect(portraitBounds.width).toBe(375);
      
      // Bottom sheet in portrait
      const bottomSheet = page.locator('[data-testid="bottom-sheet"]');
      await expect(bottomSheet).toBeVisible();
      
      await page.screenshot({ path: 'screenshots/places-portrait.png' });
      
      // Landscape
      await page.setViewportSize({ width: 667, height: 375 });
      
      // Map should still be visible
      await expect(map).toBeVisible();
      
      const landscapeBounds = await map.boundingBox();
      expect(landscapeBounds.width).toBe(667);
      
      await page.screenshot({ path: 'screenshots/places-landscape.png' });
    });

    test('TC-MOBILE-020: Scanner camera orientation', async ({ page, context }) => {
      await context.grantPermissions(['camera']);
      await page.goto('/scanner');
      
      // Portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await page.getByTestId('scan-document-button').click();
      
      const camera = page.locator('[data-testid="camera-view"]');
      await expect(camera).toBeVisible();
      
      // Controls at bottom
      const controls = page.locator('[data-testid="camera-controls"]');
      const portraitControlsPos = await controls.evaluate(el => {
        return el.getBoundingClientRect().bottom;
      });
      expect(portraitControlsPos).toBeGreaterThan(600); // Near bottom
      
      await page.screenshot({ path: 'screenshots/scanner-portrait.png' });
      
      // Landscape
      await page.setViewportSize({ width: 667, height: 375 });
      
      // Controls on right side
      const landscapeControlsPos = await controls.evaluate(el => {
        return el.getBoundingClientRect().right;
      });
      expect(landscapeControlsPos).toBeGreaterThan(600); // Near right edge
      
      await page.screenshot({ path: 'screenshots/scanner-landscape.png' });
    });

    test('TC-MOBILE-020: Scroll position preserved on rotation', async ({ page }) => {
      await page.goto('/tasks');
      
      // Seed many tasks
      await page.evaluate(() => window.seedTasks(50));
      
      // Portrait: Scroll to middle
      await page.setViewportSize({ width: 375, height: 667 });
      
      const taskList = page.locator('[data-testid="task-list"]');
      await taskList.evaluate(el => el.scrollTo(0, 1000));
      
      const portraitScroll = await taskList.evaluate(el => el.scrollTop);
      expect(portraitScroll).toBe(1000);
      
      // Rotate to landscape
      await page.setViewportSize({ width: 667, height: 375 });
      
      // Scroll position should be preserved
      const landscapeScroll = await taskList.evaluate(el => el.scrollTop);
      expect(landscapeScroll).toBe(1000);
    });
  });

  /**
   * TC-MOBILE-021: Tablet Master-Detail Layout (P2)
   */
  test.describe('Master-Detail Layout', () => {
    test('TC-MOBILE-021: Task list master-detail on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/tasks');
      
      // Verify master-detail layout
      const masterPane = page.locator('[data-testid="task-list-pane"]');
      const detailPane = page.locator('[data-testid="task-detail-pane"]');
      
      await expect(masterPane).toBeVisible();
      await expect(detailPane).toBeVisible();
      
      // Master pane: 320px fixed width
      const masterBounds = await masterPane.boundingBox();
      expect(masterBounds.width).toBe(320);
      
      // Detail pane: Fills remaining space
      const detailBounds = await detailPane.boundingBox();
      expect(detailBounds.width).toBe(768 - 320 - 1); // Minus master width and divider
      
      // Divider
      const divider = page.locator('[data-testid="master-detail-divider"]');
      await expect(divider).toBeVisible();
      const dividerWidth = await divider.evaluate(el => el.offsetWidth);
      expect(dividerWidth).toBe(1);
      
      await page.screenshot({ path: 'screenshots/master-detail-tablet.png' });
    });

    test('TC-MOBILE-021: Task selection highlights in master pane', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/tasks');
      
      const firstTask = page.locator('[data-testid="task-card"]').first();
      await firstTask.click();
      
      // Verify selected state
      await expect(firstTask).toHaveClass(/selected|active/);
      
      // Verify left border indicator
      const borderLeft = await firstTask.evaluate(el => {
        return window.getComputedStyle(el).borderLeftColor;
      });
      expect(borderLeft).toMatch(/rgb\(14, 165, 233\)/); // Blue
      
      // Detail pane shows task detail
      const detailPane = page.locator('[data-testid="task-detail-pane"]');
      await expect(detailPane).toContainText(/task detail/i);
    });

    test('TC-MOBILE-021: Optimistic UI update in master pane', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/tasks');
      
      const task = page.locator('[data-testid="task-card"]').first();
      await task.click();
      
      // Edit in detail pane
      const titleField = page.locator('[data-testid="task-detail-pane"]').getByLabel(/title/i);
      await titleField.fill('Updated Title');
      
      // Save
      await page.getByRole('button', { name: /save/i }).click();
      
      // Verify master pane updates immediately
      await expect(task).toContainText('Updated Title');
    });

    test('TC-MOBILE-021: Keyboard navigation between panes', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/tasks');
      
      // Focus in master pane
      const firstTask = page.locator('[data-testid="task-card"]').first();
      await firstTask.focus();
      
      // Tab to detail pane
      await page.keyboard.press('Tab');
      
      const detailPane = page.locator('[data-testid="task-detail-pane"]');
      const focusedElement = page.locator(':focus');
      
      // Verify focus moved to detail pane
      const isInDetailPane = await focusedElement.evaluate((el, pane) => {
        return pane.contains(el);
      }, await detailPane.elementHandle());
      
      expect(isInDetailPane).toBeTruthy();
    });

    test('TC-MOBILE-021: Mobile uses full-screen navigation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/tasks');
      
      // No master-detail (should not exist)
      await expect(page.locator('[data-testid="task-detail-pane"]')).not.toBeVisible();
      
      // Click task
      const task = page.locator('[data-testid="task-card"]').first();
      await task.click();
      
      // Full-screen detail view
      await expect(page).toHaveURL(/\/tasks\/\d+/);
      await expect(page.locator('[data-testid="task-list-pane"]')).not.toBeVisible();
      
      // Back navigation
      await page.goBack();
      await expect(page.locator('[data-testid="task-list"]')).toBeVisible();
    });

    test('TC-MOBILE-021: Vault master-detail', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/vault');
      await page.getByRole('button', { name: /unlock/i }).click();
      
      // Master-detail layout
      const masterPane = page.locator('[data-testid="vault-list-pane"]');
      const detailPane = page.locator('[data-testid="vault-detail-pane"]');
      
      await expect(masterPane).toBeVisible();
      await expect(detailPane).toBeVisible();
      
      // Select secret
      const secret = page.locator('[data-testid="secret-card"]').first();
      await secret.click();
      
      // Detail pane shows secret
      await expect(detailPane).toContainText(/github/i);
      
      // Reveal password in detail pane only
      await detailPane.getByTestId('reveal-password').click();
      
      // Master pane still shows hidden password
      await expect(secret.locator('[data-testid="password-field"]')).toHaveText('••••••••••••');
      
      // Detail pane shows revealed password
      await expect(detailPane.locator('[data-testid="password-field"]')).not.toHaveText('••••••••••••');
    });
  });
});
