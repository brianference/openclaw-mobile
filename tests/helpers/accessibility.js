/**
 * Accessibility testing helpers
 */

/**
 * Check if element meets minimum touch target size (44x44px)
 */
export const assertTouchTarget = (element, minSize = 44) => {
  const { width, height } = element.props.style || {};
  
  // Check if explicit dimensions meet minimum
  if (width && height) {
    expect(width).toBeGreaterThanOrEqual(minSize);
    expect(height).toBeGreaterThanOrEqual(minSize);
  }
  
  // Check if padding makes up for smaller explicit size
  const padding = element.props.style?.padding || 0;
  const minDimension = Math.min(width || 0, height || 0) + (padding * 2);
  expect(minDimension).toBeGreaterThanOrEqual(minSize);
};

/**
 * Check if element has accessibility label
 */
export const assertAccessibilityLabel = (element, expectedLabel) => {
  const label = element.props.accessibilityLabel || element.props['aria-label'];
  expect(label).toBeDefined();
  if (expectedLabel) {
    expect(label).toBe(expectedLabel);
  }
};

/**
 * Check if element has proper accessibility role
 */
export const assertAccessibilityRole = (element, expectedRole) => {
  const role = element.props.accessibilityRole || element.props.role;
  expect(role).toBe(expectedRole);
};

/**
 * Check if form field has associated label and hint
 */
export const assertFormAccessibility = (element) => {
  expect(element.props.accessibilityLabel).toBeDefined();
  
  // Check for error messaging setup
  if (element.props['aria-invalid']) {
    expect(element.props['aria-describedby']).toBeDefined();
  }
};

/**
 * Simulate screen reader announcement check
 */
export const assertScreenReaderAnnouncement = (element, expectedText) => {
  const liveRegion = element.props.accessibilityLiveRegion;
  expect(liveRegion).toBeDefined();
  expect(['polite', 'assertive']).toContain(liveRegion);
};

/**
 * Check color contrast ratio (simplified check)
 */
export const assertColorContrast = (foreground, background, minRatio = 4.5) => {
  // This is a simplified check - in production use a library like color-contrast-checker
  const contrast = calculateContrast(foreground, background);
  expect(contrast).toBeGreaterThanOrEqual(minRatio);
};

// Helper to calculate relative luminance (simplified)
const calculateContrast = (fg, bg) => {
  // Simplified implementation - use proper library in production
  const fgLuminance = getLuminance(fg);
  const bgLuminance = getLuminance(bg);
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);
  return (lighter + 0.05) / (darker + 0.05);
};

const getLuminance = (color) => {
  // Simplified - assumes hex color
  if (!color) return 0;
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
