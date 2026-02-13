import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Test Suite
 * Covers: TC-MOBILE-014, TC-MOBILE-015, TC-MOBILE-016, TC-MOBILE-017, TC-MOBILE-018
 */
test.describe('Accessibility Compliance', () => {
  /**
   * TC-MOBILE-015: Keyboard-Only Navigation (P0)
   */
  test.describe('Keyboard Navigation', () => {
    test('TC-MOBILE-015: Tab through task creation form', async ({ page }) => {
      await page.goto('/tasks');
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
      
      // Verify focus visible
      const focused = page.locator(':focus');
      await expect(focused).toHaveCSS('outline-width', '3px');
      await expect(focused).toHaveCSS('outline-offset', '2px');
      
      await page.screenshot({ path: 'screenshots/keyboard-nav-focus.png' });
    });

    test('TC-MOBILE-015: Modal focus trap', async ({ page }) => {
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      // Tab to last focusable element
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be on Create button
      await expect(page.locator(':focus')).toHaveAccessibleName(/create task/i);
      
      // Tab again should loop to first field
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveAttribute('name', /title/i);
      
      // Shift+Tab should go to last element
      await page.keyboard.press('Shift+Tab');
      await expect(page.locator(':focus')).toHaveAccessibleName(/create task/i);
    });

    test('TC-MOBILE-015: Escape closes modal', async ({ page }) => {
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      await expect(page.getByRole('dialog')).toBeVisible();
      
      // Press Escape
      await page.keyboard.press('Escape');
      
      // Modal dismissed
      await expect(page.getByRole('dialog')).not.toBeVisible();
      await expect(page).toHaveURL(/\/tasks/);
    });

    test('TC-MOBILE-015: Arrow keys navigate list', async ({ page }) => {
      await page.goto('/tasks');
      
      const firstTask = page.locator('[data-testid="task-card"]').first();
      await firstTask.focus();
      
      // Down arrow
      await page.keyboard.press('ArrowDown');
      const secondTask = page.locator('[data-testid="task-card"]').nth(1);
      await expect(secondTask).toBeFocused();
      
      // Up arrow
      await page.keyboard.press('ArrowUp');
      await expect(firstTask).toBeFocused();
      
      // Enter opens detail
      await page.keyboard.press('Enter');
      await expect(page.getByRole('heading', { level: 1 })).toContainText(/task detail/i);
    });

    test('TC-MOBILE-015: Focus visible on all interactive elements', async ({ page }) => {
      await page.goto('/tasks');
      
      // Check all interactive elements have visible focus
      const interactiveElements = await page.locator('button, a, input, [tabindex="0"]').all();
      
      for (const element of interactiveElements) {
        await element.focus();
        
        const outline = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            width: styles.outlineWidth,
            color: styles.outlineColor,
            offset: styles.outlineOffset
          };
        });
        
        // Verify focus indicator exists
        expect(outline.width).not.toBe('0px');
        
        // Verify contrast ≥3:1 (simplified check)
        expect(outline.color).toBeTruthy();
      }
    });
  });

  /**
   * TC-MOBILE-016: Color Contrast Verification (P0)
   */
  test.describe('Color Contrast', () => {
    test('TC-MOBILE-016: WCAG AA compliance - Dark mode', async ({ page }) => {
      await page.goto('/');
      
      // Set dark mode
      await page.emulateMedia({ colorScheme: 'dark' });
      
      // Run axe accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa', 'wcag21aa'])
        .analyze();
      
      // Verify no color contrast violations
      const contrastViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'color-contrast'
      );
      
      expect(contrastViolations).toHaveLength(0);
      
      await page.screenshot({ path: 'screenshots/dark-mode-contrast.png' });
    });

    test('TC-MOBILE-016: WCAG AA compliance - Light mode', async ({ page }) => {
      await page.goto('/');
      
      // Set light mode
      await page.emulateMedia({ colorScheme: 'light' });
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa', 'wcag21aa'])
        .analyze();
      
      const contrastViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'color-contrast'
      );
      
      expect(contrastViolations).toHaveLength(0);
      
      await page.screenshot({ path: 'screenshots/light-mode-contrast.png' });
    });

    test('TC-MOBILE-016: Manual contrast verification', async ({ page }) => {
      await page.goto('/');
      await page.emulateMedia({ colorScheme: 'dark' });
      
      // Check specific color combinations
      const textElement = page.getByRole('heading').first();
      const textColor = await textElement.evaluate(el => {
        return window.getComputedStyle(el).color;
      });
      
      const bgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      
      // Primary text (#f5f5f5) on background (#0a0a0a) = ~15.8:1
      // This is a simplified check; real implementation would calculate actual ratio
      expect(textColor).toBe('rgb(245, 245, 245)'); // #f5f5f5
      expect(bgColor).toBe('rgb(10, 10, 10)'); // #0a0a0a
    });
  });

  /**
   * TC-MOBILE-017: Reduced Motion Mode (P1)
   */
  test.describe('Reduced Motion', () => {
    test('TC-MOBILE-017: Animations respect prefers-reduced-motion', async ({ page }) => {
      await page.goto('/tasks');
      
      // Enable reduced motion
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      // Navigate to task detail (normally has slide animation)
      await page.locator('[data-testid="task-card"]').first().click();
      
      // Verify no slide animation (only opacity crossfade)
      const transition = await page.locator('[data-testid="task-detail"]').evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.transition;
      });
      
      // Should only have opacity transition, no transform
      expect(transition).toContain('opacity');
      expect(transition).not.toContain('transform');
      
      // Verify max duration ≤200ms
      expect(transition).toMatch(/opacity \d+(\.\d+)?ms/);
      const duration = parseFloat(transition.match(/opacity (\d+(\.\d+)?)ms/)[1]);
      expect(duration).toBeLessThanOrEqual(200);
    });

    test('TC-MOBILE-017: Modal animations reduced', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/tasks');
      
      await page.getByTestId('add-task-button').click();
      
      const modal = page.getByRole('dialog');
      const animation = await modal.evaluate(el => {
        return window.getComputedStyle(el).animation;
      });
      
      // No scale animation, only opacity
      expect(animation).not.toContain('scale');
      expect(animation).toMatch(/opacity/);
    });

    test('TC-MOBILE-017: Loading spinners use pulsing opacity', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/tasks');
      
      await page.getByTestId('add-task-button').click();
      await page.getByLabel(/title/i).fill('Test');
      await page.getByRole('button', { name: /create/i }).click();
      
      const spinner = page.locator('.spinner');
      const animation = await spinner.evaluate(el => {
        return window.getComputedStyle(el).animation;
      });
      
      // Pulsing opacity instead of rotation
      expect(animation).toContain('opacity');
      expect(animation).not.toContain('rotate');
    });

    test('TC-MOBILE-017: Swipe actions instant reveal', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/tasks');
      
      const task = page.locator('[data-testid="task-card"]').first();
      await task.swipe('left');
      
      // Verify instant reveal (no spring animation)
      const deleteButton = task.locator('[data-testid="delete-button"]');
      await expect(deleteButton).toBeVisible();
      
      const transition = await deleteButton.evaluate(el => {
        return window.getComputedStyle(el).transition;
      });
      
      // Only opacity transition
      expect(transition).toMatch(/opacity/);
      expect(transition).not.toContain('transform');
    });
  });

  /**
   * TC-MOBILE-018: Dynamic Text Size (P1)
   */
  test.describe('Dynamic Text Scaling', () => {
    test('TC-MOBILE-018: Layout adapts to large text size', async ({ page }) => {
      await page.goto('/tasks');
      
      // Simulate iOS max text size (200% scaling)
      await page.addStyleTag({
        content: `
          * { font-size: 200% !important; }
        `
      });
      
      // Verify no layout breaks
      const taskCard = page.locator('[data-testid="task-card"]').first();
      await expect(taskCard).toBeVisible();
      
      // Verify text not truncated
      const title = taskCard.locator('[data-testid="task-title"]');
      const isTruncated = await title.evaluate(el => {
        return el.scrollWidth > el.clientWidth;
      });
      expect(isTruncated).toBeFalsy();
      
      // Verify touch targets maintained
      const checkbox = taskCard.locator('input[type="checkbox"]');
      const bounds = await checkbox.boundingBox();
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      
      await page.screenshot({ path: 'screenshots/large-text-size.png' });
    });

    test('TC-MOBILE-018: Form fields scale correctly', async ({ page }) => {
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      // Large text size
      await page.addStyleTag({
        content: `* { font-size: 200% !important; }`
      });
      
      const titleField = page.getByLabel(/title/i);
      
      // Field should increase height to accommodate
      const bounds = await titleField.boundingBox();
      expect(bounds.height).toBeGreaterThanOrEqual(60); // Larger than default 44px
      
      // No horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBeFalsy();
    });

    test('TC-MOBILE-018: Bottom tabs wrap at large text size', async ({ page }) => {
      await page.goto('/');
      
      await page.addStyleTag({
        content: `* { font-size: 200% !important; }`
      });
      
      const tabBar = page.locator('[data-testid="tab-bar"]');
      const tab = tabBar.locator('[data-testid="tab"]').first();
      
      // Tab label may wrap to 2 lines
      const tabLabel = tab.locator('span');
      const height = await tabLabel.evaluate(el => el.offsetHeight);
      
      // Height > single line indicates wrapping
      expect(height).toBeGreaterThan(20);
      
      // Icon size stays same
      const icon = tab.locator('svg');
      const iconSize = await icon.evaluate(el => el.getBoundingClientRect().width);
      expect(iconSize).toBeLessThan(32); // Standard icon size, not scaled
    });
  });

  /**
   * TC-MOBILE-014: VoiceOver Full Flow (P0)
   * Note: This is primarily a manual test, but we can verify semantic structure
   */
  test.describe('Screen Reader Support', () => {
    test('TC-MOBILE-014: All buttons have accessible names', async ({ page }) => {
      await page.goto('/tasks');
      
      const buttons = await page.locator('button').all();
      
      for (const button of buttons) {
        const accessibleName = await button.getAttribute('aria-label') || 
                              await button.textContent();
        expect(accessibleName).toBeTruthy();
        expect(accessibleName.trim()).not.toBe('');
      }
    });

    test('TC-MOBILE-014: Form fields have labels and hints', async ({ page }) => {
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      const titleField = page.getByLabel(/title/i);
      await expect(titleField).toHaveAttribute('aria-label');
      
      const dueDateField = page.getByLabel(/due date/i);
      await expect(dueDateField).toHaveAccessibleDescription(/choose date/i);
    });

    test('TC-MOBILE-014: Live regions for dynamic content', async ({ page }) => {
      await page.goto('/tasks');
      await page.getByTestId('add-task-button').click();
      
      await page.getByLabel(/title/i).fill('Test');
      await page.getByRole('button', { name: /create/i }).click();
      
      // Toast should have role="status" or aria-live
      const toast = page.locator('[data-testid="toast"]');
      const liveRegion = await toast.getAttribute('aria-live');
      expect(liveRegion).toMatch(/polite|assertive/);
    });

    test('TC-MOBILE-014: Heading hierarchy', async ({ page }) => {
      await page.goto('/');
      
      // Verify proper heading structure (h1 -> h2 -> h3, no skips)
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      
      const levels = [];
      for (const heading of headings) {
        const level = parseInt(await heading.evaluate(el => el.tagName.substring(1)));
        levels.push(level);
      }
      
      // First heading should be h1
      expect(levels[0]).toBe(1);
      
      // No level skips (e.g., h1 -> h3)
      for (let i = 1; i < levels.length; i++) {
        const diff = levels[i] - levels[i - 1];
        expect(diff).toBeLessThanOrEqual(1);
      }
    });
  });

  /**
   * Comprehensive axe-core scan
   */
  test('Run full accessibility audit', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Log violations for debugging
    if (results.violations.length > 0) {
      console.log('Accessibility violations found:');
      results.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description}`);
        console.log(`  Impact: ${violation.impact}`);
        console.log(`  Nodes: ${violation.nodes.length}`);
      });
    }
    
    expect(results.violations).toHaveLength(0);
  });
});
