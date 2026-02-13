/**
 * TC-MOBILE-005: Empty States Across All Features
 * Category: Edge Cases
 * Priority: P1 (High)
 * Feature: All
 */

import React from 'react';
import { render } from '@testing-library/react-native';

describe('TC-MOBILE-005: Empty States Across All Features', () => {
  const emptyStates = [
    { screen: 'TaskListScreen', testId: 'tasks-empty-state', text: 'No tasks yet' },
    { screen: 'BrainScreen', testId: 'brain-empty-state', text: 'Your second brain is empty' },
    { screen: 'VaultContentsScreen', testId: 'vault-empty-state', text: 'Your vault is secure but empty' },
    { screen: 'PlacesMapScreen', testId: 'places-empty-state', text: 'No saved places' },
    { screen: 'DocumentsScreen', testId: 'documents-empty-state', text: 'No scanned documents yet' },
  ];

  emptyStates.forEach(({ screen, testId, text }) => {
    test(`${screen}: shows empty state with CTA`, () => {
      const Component = require(`../../src/screens/${screen}`).default;
      const { getByTestId, getByText } = render(<Component data={[]} />);

      expect(getByTestId(testId)).toBeTruthy();
      expect(getByText(new RegExp(text, 'i'))).toBeTruthy();
      
      // CTA button should be visible and tappable
      const ctaButton = getByTestId(`${testId}-cta-button`);
      expect(ctaButton).toBeTruthy();
      expect(ctaButton.props.accessible).not.toBe(false);
    });
  });

  test('all empty states have ≥44px touch targets', () => {
    emptyStates.forEach(({ screen, testId }) => {
      const Component = require(`../../src/screens/${screen}`).default;
      const { getByTestId } = render(<Component data={[]} />);
      
      const ctaButton = getByTestId(`${testId}-cta-button`);
      expect(ctaButton.props.style.minHeight || ctaButton.props.style.height).toBeGreaterThanOrEqual(44);
    });
  });

  test('accessibility: empty states clearly announced', () => {
    const { getByTestId } = require('../../src/screens/TaskListScreen').default;
    const { render } = require('@testing-library/react-native');
    const { getByTestId: getById } = render(<getByTestId data={[]} />);
    
    const emptyState = getById('tasks-empty-state');
    expect(emptyState.props.accessibilityLabel).toMatch(/No.*Tap.*to/i);
  });
});
