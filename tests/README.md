# MobileClaw Playwright Tests

Automated end-to-end tests for MobileClaw, covering all 25 UX test cases across 3 platforms.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in UI mode (recommended for development)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Debug a specific test
npm run test:debug -- tasks.spec.ts
```

## Test Suites

| File | Test Cases | Priority | Features |
|------|-----------|----------|----------|
| `onboarding.spec.ts` | TC-004 | P0 | Onboarding flow, first task |
| `tasks.spec.ts` | TC-001, 007, 010, 022 | P0, P1 | Task CRUD, sync, performance |
| `vault.spec.ts` | TC-002, 011 | P0 | Secrets, encryption, errors |
| `places.spec.ts` | TC-003 | P1 | Search, maps, trips |
| `edge-cases.spec.ts` | TC-005, 006, 008, 009 | P1, P2 | Empty states, limits, boundaries |
| `error-handling.spec.ts` | TC-012, 013 | P1 | Permissions, timeouts |
| `accessibility.spec.ts` | TC-014-018 | P0, P1 | A11y, WCAG compliance |
| `responsive.spec.ts` | TC-019, 020, 021 | P1, P2 | Breakpoints, orientation |
| `performance.spec.ts` | TC-023 | P2 | Slow network, load times |
| `cross-platform.spec.ts` | TC-024, 025 | P1 | iOS/Android, lifecycle |

## Running Tests

### By Priority

```bash
# Critical tests only (P0)
npm run test:p0

# High priority tests (P1)
npm run test:p1

# Run P0 and P1 (recommended for CI)
npm test -- --grep "@P0|@P1"
```

### By Platform

```bash
# Desktop only
npm run test:desktop

# iPhone 12 emulation
npm run test:iphone

# Pixel 5 emulation
npm run test:pixel
```

### By Feature

```bash
# All task-related tests
npm test tasks.spec.ts

# Accessibility tests only
npm run test:accessibility

# Specific test
npm test -- -g "TC-MOBILE-001"
```

## Viewing Results

```bash
# Open HTML report
npm run test:report

# JSON results
cat playwright-report/test-results.json
```

## Writing New Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
    await page.goto('/feature');
  });

  test('TC-MOBILE-XXX: Test description', async ({ page }) => {
    // Arrange
    const button = page.getByTestId('my-button');
    
    // Act
    await button.click();
    
    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use semantic selectors:**
   ```typescript
   // ✅ Good
   page.getByRole('button', { name: /submit/i })
   page.getByLabel(/email/i)
   page.getByTestId('task-card')
   
   // ❌ Avoid
   page.locator('.btn-primary')
   page.locator('xpath=//div[1]')
   ```

2. **Wait for conditions, not timeouts:**
   ```typescript
   // ✅ Good
   await expect(toast).toBeVisible();
   await page.waitForLoadState('networkidle');
   
   // ❌ Avoid
   await page.waitForTimeout(5000);
   ```

3. **Use helpers:**
   ```typescript
   import { unlockVault, seedDatabase } from './helpers/test-utils';
   
   await seedDatabase(page, { tasks: 100 });
   await unlockVault(page);
   ```

4. **Test isolation:**
   ```typescript
   test.beforeEach(async ({ page, context }) => {
     // Clear data before each test
     await context.clearCookies();
     await page.goto('/');
   });
   ```

## Debugging

### UI Mode (Recommended)

```bash
npm run test:ui
```

Features:
- Click through test steps
- Inspect DOM at each step
- See network requests
- Watch test execution

### Debug Mode

```bash
# Debug all tests
npm run test:debug

# Debug specific test
npm run test:debug -- tasks.spec.ts -g "TC-MOBILE-001"
```

### Screenshots

Screenshots are automatically taken on failure. Manual screenshots:

```typescript
await page.screenshot({ path: 'debug-screenshot.png' });
```

### Traces

Traces are captured on retry. View with:

```bash
npx playwright show-trace trace.zip
```

## Accessibility Testing

Uses `@axe-core/playwright` for automated WCAG 2.1 AA compliance:

```typescript
import AxeBuilder from '@axe-core/playwright';

const results = await new AxeBuilder({ page })
  .withTags(['wcag2aa'])
  .analyze();

expect(results.violations).toHaveLength(0);
```

### Manual A11y Checks

Some tests require manual verification:
- VoiceOver announcements (iOS)
- TalkBack announcements (Android)
- Screen reader navigation flow

See `TEST-WRITING-REPORT.md` for manual test checklists.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run tests
        run: npm test
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Recommended CI Strategy

- **On PR:** Run P0 tests (critical, ~8 min)
- **On merge to main:** Run P0 + P1 tests (~15 min)
- **Nightly:** Full suite including P2 (~20 min)

## Troubleshooting

### Tests timing out

```bash
# Increase timeout globally
npm test -- --timeout=60000

# Or in specific test
test('slow test', async ({ page }) => {
  test.setTimeout(60000);
  // ...
});
```

### Flaky tests

```bash
# Retry failed tests
npm test -- --retries=2
```

### Network issues

```typescript
// Mock flaky API
await page.route('**/api/tasks', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ tasks: [] })
  });
});
```

### Screenshots folder full

```bash
# Clean old screenshots
rm -rf screenshots/
mkdir screenshots
```

## Performance

### Parallel Execution

Tests run in parallel by default (4 workers):

```bash
# Disable parallelization
npm test -- --workers=1

# More workers (faster, but resource-intensive)
npm test -- --workers=8
```

### Headed vs Headless

```bash
# Headless (default, faster)
npm test

# Headed (slower, but good for debugging)
npm run test:headed
```

## Test Coverage

- **Total UX Test Cases:** 25
- **Automated Test Files:** 10
- **Individual Tests:** ~120
- **P0 Coverage:** 100%
- **P1 Coverage:** 100%
- **P2 Coverage:** 100%

See `TEST-WRITING-REPORT.md` for detailed coverage breakdown.

## Support

- **Playwright Docs:** https://playwright.dev
- **axe-core Docs:** https://github.com/dequelabs/axe-core
- **Test Report:** See `TEST-WRITING-REPORT.md`
- **UX Specs:** See `ux-test-cases.md`

## Contributing

When adding new tests:

1. Reference the TC-MOBILE-XXX ID in test description
2. Add test to appropriate spec file by feature
3. Update `TEST-WRITING-REPORT.md` coverage table
4. Include accessibility checks where applicable
5. Add screenshots for visual states
6. Use helper functions from `test-utils.ts`

---

**Last Updated:** 2026-02-12  
**Test Framework:** Playwright v1.40.1  
**Node Version:** 18+  
**Maintained By:** Test Case Writing Agent
