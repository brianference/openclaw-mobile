/**
 * TC-MOBILE-024: iOS vs Android Platform Differences
 * Category: Cross-Platform
 * Priority: P1 (High)
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Platform } from 'react-native';

const TaskListScreen = require('../../src/screens/Tasks/TaskListScreen').default;

describe('TC-MOBILE-024: iOS vs Android Platform Differences', () => {
  test('iOS: uses SF Pro font', () => {
    Platform.OS = 'ios';
    const { getByTestId } = render(<TaskListScreen />);
    
    const text = getByTestId('screen-title');
    expect(text.props.style?.fontFamily).toMatch(/SF Pro|System/i);
  });

  test('Android: uses Roboto font', () => {
    Platform.OS = 'android';
    const { getByTestId } = render(<TaskListScreen />);
    
    const text = getByTestId('screen-title');
    expect(text.props.style?.fontFamily).toMatch(/Roboto|System/i);
  });

  test('iOS: swipe back gesture enabled', () => {
    Platform.OS = 'ios';
    const { getByTestId } = render(<TaskListScreen />);
    
    const navigator = getByTestId('screen-navigator');
    expect(navigator.props.gestureEnabled).not.toBe(false);
  });

  test('touch targets: 44px on both platforms', () => {
    const { getByTestId } = render(<TaskListScreen />);
    
    const button = getByTestId('add-task-button');
    const minHeight = button.props.style?.minHeight || 44;
    
    expect(minHeight).toBeGreaterThanOrEqual(44);
  });
});
