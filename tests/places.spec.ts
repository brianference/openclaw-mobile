import { test, expect } from '@playwright/test';

/**
 * Places Test Suite
 * Covers: TC-MOBILE-003
 */
test.describe('Places & Trip Planning', () => {
  /**
   * TC-MOBILE-003: Place Search & Trip Planning (P1)
   */
  test('TC-MOBILE-003: Complete place search and trip creation flow', async ({ page, context }) => {
    // Grant location permission
    await context.grantPermissions(['geolocation']);
    
    // Mock location (Phoenix, AZ)
    await context.setGeolocation({ latitude: 33.4484, longitude: -112.0740 });
    
    await page.goto('/places');
    
    // Step 1: Tap search bar
    const searchBar = page.getByPlaceholder(/search places/i);
    await searchBar.click();
    
    // Step 2: Enter search query
    await searchBar.fill('Favorite Cafe Phoenix');
    
    // Step 3: Wait for autocomplete results
    const autocompleteStart = Date.now();
    await expect(page.locator('[data-testid="autocomplete-results"]')).toBeVisible({ timeout: 500 });
    const autocompleteTime = Date.now() - autocompleteStart;
    
    // Verify autocomplete shows ≤5 results within 300ms
    expect(autocompleteTime).toBeLessThan(300);
    
    const results = await page.locator('[data-testid="autocomplete-result"]').count();
    expect(results).toBeLessThanOrEqual(5);
    
    // Step 4: Tap first result
    await page.locator('[data-testid="autocomplete-result"]').first().click();
    
    // Step 5: Map centers on place
    const map = page.locator('[data-testid="map"]');
    await expect(map).toBeVisible();
    
    // Verify marker shown
    const marker = page.locator('[data-testid="place-marker"]');
    await expect(marker).toBeVisible();
    
    // Step 6: Tap marker
    await marker.click();
    
    // Step 7: Bottom sheet shows preview
    const bottomSheet = page.locator('[data-testid="bottom-sheet"]');
    await expect(bottomSheet).toBeVisible();
    await expect(bottomSheet).toContainText('📍 Favorite Cafe');
    await expect(bottomSheet).toContainText(/0\.3 mi away/i);
    
    // Verify spring animation (check transition property)
    const animation = await bottomSheet.evaluate(el => {
      return window.getComputedStyle(el).transition;
    });
    expect(animation).toContain('transform');
    
    // Step 8: Tap "View Details"
    await bottomSheet.getByRole('button', { name: /view details/i }).click();
    
    // Step 9: Detail screen shows
    await expect(page).toHaveURL(/\/places\/\d+/);
    
    const detailScreen = page.locator('[data-testid="place-detail"]');
    await expect(detailScreen).toBeVisible();
    await expect(detailScreen).toContainText('Favorite Cafe');
    
    // Verify all detail fields
    await expect(detailScreen.locator('[data-testid="place-photo"]')).toBeVisible();
    await expect(detailScreen.locator('[data-testid="place-name"]')).toContainText('Favorite Cafe');
    await expect(detailScreen.locator('[data-testid="place-rating"]')).toBeVisible();
    await expect(detailScreen.locator('[data-testid="place-address"]')).toBeVisible();
    await expect(detailScreen.locator('[data-testid="place-phone"]')).toBeVisible();
    await expect(detailScreen.locator('[data-testid="place-website"]')).toBeVisible();
    
    // Step 10: Tap "Add to Trip"
    await page.getByRole('button', { name: /add to trip/i }).click();
    
    // Step 11: Trip selector sheet
    const tripSelector = page.locator('[data-testid="trip-selector"]');
    await expect(tripSelector).toBeVisible();
    
    // Step 12: Tap "New Trip"
    await tripSelector.getByRole('button', { name: /new trip/i }).click();
    
    // Step 13: Enter trip details
    await page.getByLabel(/trip name/i).fill('Phoenix Weekend');
    
    await page.getByLabel(/start date/i).click();
    await page.getByRole('option', { name: /feb 10, 2026/i }).click();
    
    await page.getByLabel(/end date/i).click();
    await page.getByRole('option', { name: /feb 12, 2026/i }).click();
    
    // Step 14: Create trip
    await page.getByRole('button', { name: /create & add/i }).click();
    
    // Step 15: Verify success toast
    await expect(page.getByText(/added to phoenix weekend trip/i)).toBeVisible();
    
    // Step 16: Navigate to Trip Planner
    await expect(page).toHaveURL(/\/trips/);
    
    const tripCard = page.locator('[data-testid="trip-card"]').first();
    await expect(tripCard).toContainText('Phoenix Weekend');
    await expect(tripCard).toContainText('Feb 10-12, 2026');
    await expect(tripCard).toContainText('1 place'); // First item
    
    // Open trip to verify place added
    await tripCard.click();
    
    const placeList = page.locator('[data-testid="trip-places"]');
    await expect(placeList.locator('[data-testid="trip-place"]').first()).toContainText('Favorite Cafe');
    
    await page.screenshot({ path: 'screenshots/trip-created-with-place.png' });
  });

  test('TC-MOBILE-003: Map animation performance', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 33.4484, longitude: -112.0740 });
    
    await page.goto('/places');
    
    // Search and select place
    await page.getByPlaceholder(/search places/i).fill('Test Place');
    await page.locator('[data-testid="autocomplete-result"]').first().click();
    
    // Measure map animation FPS
    const fps = await page.evaluate(() => {
      return new Promise(resolve => {
        let frameCount = 0;
        const startTime = performance.now();
        const duration = 1000; // 1 second
        
        function countFrame() {
          frameCount++;
          if (performance.now() - startTime < duration) {
            requestAnimationFrame(countFrame);
          } else {
            resolve(frameCount);
          }
        }
        
        requestAnimationFrame(countFrame);
      });
    });
    
    // Verify ≥60fps for smooth animation
    expect(fps).toBeGreaterThanOrEqual(55);
  });

  test('TC-MOBILE-003: Accessibility - Map and place search', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await page.goto('/places');
    
    // Search field accessibility
    const searchBar = page.getByPlaceholder(/search places/i);
    await expect(searchBar).toHaveAccessibleDescription(/search places.*text entry/i);
    
    // Search for place
    await searchBar.fill('Test Place');
    await page.locator('[data-testid="autocomplete-result"]').first().click();
    
    // Map accessibility
    const map = page.locator('[data-testid="map"]');
    const mapLabel = await map.getAttribute('aria-label');
    expect(mapLabel).toMatch(/map showing \d+ place/i);
    expect(mapLabel).toContain('0.3 miles away');
    
    // Bottom sheet accessibility
    const bottomSheet = page.locator('[data-testid="bottom-sheet"]');
    
    // Focus trap in bottom sheet
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    const isInBottomSheet = await focusedElement.evaluate((el, sheet) => {
      return sheet.contains(el);
    }, await bottomSheet.elementHandle());
    
    expect(isInBottomSheet).toBeTruthy();
    
    // Swipe to dismiss announced
    const dismissHint = await bottomSheet.getAttribute('aria-describedby');
    expect(dismissHint).toBeTruthy();
  });

  test('TC-MOBILE-003: Responsive - iPad side-by-side layout', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/places');
    
    // Search for place
    await page.getByPlaceholder(/search places/i).fill('Test Place');
    await page.locator('[data-testid="autocomplete-result"]').first().click();
    
    // On iPad: Map on left, detail on right
    const mapPane = page.locator('[data-testid="map-pane"]');
    const detailPane = page.locator('[data-testid="detail-pane"]');
    
    await expect(mapPane).toBeVisible();
    await expect(detailPane).toBeVisible();
    
    // Verify side-by-side layout
    const mapBounds = await mapPane.boundingBox();
    const detailBounds = await detailPane.boundingBox();
    
    // Map and detail should be horizontally adjacent
    expect(mapBounds.y).toBe(detailBounds.y); // Same vertical position
    expect(mapBounds.x).toBeLessThan(detailBounds.x); // Map on left
    
    await page.screenshot({ path: 'screenshots/places-ipad-layout.png' });
  });

  test('TC-MOBILE-003: Mock location API responses', async ({ page }) => {
    // Mock autocomplete API
    await page.route('**/api/places/autocomplete*', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          { 
            id: 1, 
            name: 'Favorite Cafe', 
            address: '123 Main St, Phoenix, AZ',
            distance: 0.3,
          },
          { 
            id: 2, 
            name: 'Phoenix Coffee Shop', 
            address: '456 Oak Ave, Phoenix, AZ',
            distance: 0.8,
          },
        ]),
      });
    });
    
    // Mock place detail API
    await page.route('**/api/places/1', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 1,
          name: 'Favorite Cafe',
          rating: 4.5,
          address: '123 Main St, Phoenix, AZ 85001',
          phone: '(602) 555-1234',
          website: 'https://favoritecafe.com',
          coordinates: { lat: 33.4484, lng: -112.0740 },
          photo: 'https://example.com/photo.jpg',
        }),
      });
    });
    
    await page.goto('/places');
    
    // Test with mocked data
    await page.getByPlaceholder(/search places/i).fill('Favorite');
    
    await expect(page.locator('[data-testid="autocomplete-result"]').first()).toContainText('Favorite Cafe');
    await expect(page.locator('[data-testid="autocomplete-result"]').first()).toContainText('0.3 mi away');
  });

  test('TC-MOBILE-003: Handle map idle event', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await page.goto('/places');
    
    // Search for place
    await page.getByPlaceholder(/search places/i).fill('Test Place');
    await page.locator('[data-testid="autocomplete-result"]').first().click();
    
    // Wait for map idle event before making assertions
    await page.waitForFunction(() => {
      return window.mapState?.idle === true;
    }, { timeout: 5000 });
    
    // Map should be fully loaded and idle
    const marker = page.locator('[data-testid="place-marker"]');
    await expect(marker).toBeVisible();
    
    await page.screenshot({ path: 'screenshots/map-idle-with-marker.png' });
  });
});
