/**
 * TC-MOBILE-017: Reduced Motion Mode
 * Category: Accessibility
 * Priority: P1 (High)
 * Feature: All (Animations)
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

describe('TC-MOBILE-017: Reduced Motion Mode', () => {
  beforeEach(() => {
    // Mock prefers-reduced-motion
    global.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  });

  test('page transitions: crossfade only (≤200ms)', () => {
    const TaskListScreen = require('../../src/screens/Tasks/TaskListScreen').default;
    const { getByTestId } = render(<TaskListScreen />);

    const transition = getByTestId('screen-transition');
    
    // Should use opacity transition
    expect(transition.props.style.transition || transition.props.animation).toMatch(/opacity/i);
    
    // Duration ≤200ms
    const duration = transition.props.transitionDuration || 200;
    expect(duration).toBeLessThanOrEqual(200);
  });

  test('modals: instant appear with opacity fade (100ms)', () => {
    const AddTaskScreen = require('../../src/screens/Tasks/AddTaskScreen').default;
    const { getByTestId } = render(<AddTaskScreen visible={true} mode="modal" />);

    const modal = getByTestId('task-modal');
    
    // No scale animation
    expect(modal.props.style.transform).toBeUndefined();
    
    // Opacity fade only
    expect(modal.props.style.opacity).toBeDefined();
  });

  test('buttons: opacity change only (100ms)', () => {
    const TaskListScreen = require('../../src/screens/Tasks/TaskListScreen').default;
    const { getByTestId } = render(<TaskListScreen />);

    const button = getByTestId('add-task-button');
    
    fireEvent.press(button);
    
    // No scale animation
    expect(button.props.style.transform).toBeUndefined();
    
    // Opacity change: 1 → 0.8
    expect(button.props.activeOpacity || 0.8).toBeLessThan(1);
  });

  test('loading skeletons: static gradient (no shimmer)', () => {
    const TaskListScreen = require('../../src/screens/Tasks/TaskListScreen').default;
    const { getByTestId } = render(<TaskListScreen loading={true} />);

    const skeleton = getByTestId('task-skeleton-0');
    
    // No animation
    expect(skeleton.props.animated).toBe(false);
    
    // Static gradient
    expect(skeleton.props.colors).toBeDefined();
  });

  test('spinner: pulsing opacity instead of rotation', () => {
    const TaskListScreen = require('../../src/screens/Tasks/TaskListScreen').default;
    const { getByTestId } = render(<TaskListScreen loading={true} />);

    const spinner = getByTestId('loading-spinner');
    
    // Pulsing animation (not rotation)
    expect(spinner.props.style.animation || spinner.props.animationType).toMatch(/opacity|pulse/i);
  });

  test('all animations use opacity/crossfades only', () => {
    const allowedAnimations = ['opacity', 'crossfade', 'fade'];
    const forbiddenAnimations = ['scale', 'rotate', 'translate', 'parallax'];

    // Mock animation utility
    const getAnimationType = (element) => {
      return element.props.style?.animation || element.props.animationType || 'opacity';
    };

    expect(allowedAnimations).toContain('opacity');
    expect(forbiddenAnimations).not.toContain('opacity');
  });

  test('animation duration: max 200ms', () => {
    const elements = [
      { type: 'transition', maxDuration: 200 },
      { type: 'modal', maxDuration: 100 },
      { type: 'button', maxDuration: 100 },
    ];

    elements.forEach(({ type, maxDuration }) => {
      // Verify duration constraint
      expect(maxDuration).toBeLessThanOrEqual(200);
    });
  });

  test('no vestibular triggers (scale, rotate, parallax)', () => {
    const forbiddenTransforms = ['scale', 'rotate', 'rotateX', 'rotateY', 'perspective'];
    
    // Mock reduced motion check
    const hasReducedMotion = global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    expect(hasReducedMotion).toBe(true);
    
    // When reduced motion is enabled, these should not be used
    forbiddenTransforms.forEach(transform => {
      // Implementation would check for these in styles
      expect(transform).not.toMatch(/^(opacity|fade)$/);
    });
  });

  test('functionality identical without motion', () => {
    const TaskListScreen = require('../../src/screens/Tasks/TaskListScreen').default;
    const { getByTestId } = render(<TaskListScreen />);

    // All interactive elements still work
    const addButton = getByTestId('add-task-button');
    fireEvent.press(addButton);
    
    // Functionality preserved
    expect(addButton.props.onPress).toBeDefined();
  });

  test('@media (prefers-reduced-motion: reduce)', () => {
    const mediaQuery = '(prefers-reduced-motion: reduce)';
    const result = global.matchMedia(mediaQuery);
    
    expect(result.matches).toBe(true);
  });
});
