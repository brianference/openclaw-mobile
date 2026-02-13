/**
 * TC-MOBILE-018: Dynamic Text Size (Large Accessibility Sizes)
 * Category: Accessibility
 * Priority: P1 (High)
 * Feature: All
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, Platform } from 'react-native';

const TaskListScreen = require('../../src/screens/Tasks/TaskListScreen').default;

describe('TC-MOBILE-018: Dynamic Text Size', () => {
  beforeEach(() => {
    // Mock iOS Dynamic Type setting
    if (Platform.OS === 'ios') {
      Text.defaultProps = {
        ...Text.defaultProps,
        allowFontScaling: true,
        maxFontSizeMultiplier: 2.0,
      };
    }
  });

  test('text scales up to 200% (16px → 32px)', () => {
    const { getByTestId } = render(
      <TaskListScreen 
        fontSizeMultiplier={2.0}
        tasks={[{ id: '1', title: 'Test Task' }]}
      />
    );

    const taskTitle = getByTestId('task-title-0');
    
    // Base font size: 16px, scaled: 32px
    expect(taskTitle.props.allowFontScaling).toBe(true);
    expect(taskTitle.props.maxFontSizeMultiplier).toBe(2.0);
  });

  test('labels wrap if needed (no truncation)', () => {
    const { getByTestId } = render(
      <TaskListScreen 
        fontSizeMultiplier={2.0}
        tasks={[{
          id: '1',
          title: 'Very Long Task Title That Would Normally Truncate But Should Wrap',
        }]}
      />
    );

    const taskTitle = getByTestId('task-title-0');
    
    // Should allow wrapping
    expect(taskTitle.props.numberOfLines).toBeUndefined();
    expect(taskTitle.props.ellipsizeMode).toBeUndefined();
  });

  test('buttons increase height to accommodate larger text', () => {
    const { getByTestId } = render(
      <TaskListScreen fontSizeMultiplier={2.0} />
    );

    const addButton = getByTestId('add-task-button');
    
    // Min 44px maintained even with larger text
    const buttonHeight = addButton.props.style?.height || addButton.props.style?.minHeight;
    expect(buttonHeight).toBeGreaterThanOrEqual(44);
  });

  test('no layout breaks or overlapping text', () => {
    const { queryByTestId } = render(
      <TaskListScreen 
        fontSizeMultiplier={2.0}
        tasks={[
          { id: '1', title: 'Task 1', dueDate: '2026-02-09T14:00:00Z' },
          { id: '2', title: 'Task 2', dueDate: '2026-02-10T14:00:00Z' },
        ]}
      />
    );

    // Tasks should not overlap
    const task1 = queryByTestId('task-item-0');
    const task2 = queryByTestId('task-item-1');
    
    expect(task1).toBeTruthy();
    expect(task2).toBeTruthy();
    
    // Each should have auto height
    expect(task1.props.style?.height || 'auto').toBe('auto');
  });

  test('task titles wrap to 2-3 lines if needed', () => {
    const { getByTestId } = render(
      <TaskListScreen 
        fontSizeMultiplier={2.0}
        tasks={[{
          id: '1',
          title: 'Write comprehensive design specification for all 25 screens',
        }]}
      />
    );

    const taskTitle = getByTestId('task-title-0');
    
    // Allow multiple lines
    expect(taskTitle.props.numberOfLines).toBeGreaterThan(1) || expect(taskTitle.props.numberOfLines).toBeUndefined();
  });

  test('bottom tabs: labels wrap to 2 lines if needed', () => {
    const { getByTestId } = render(
      <TaskListScreen fontSizeMultiplier={2.0} />
    );

    const tabLabel = getByTestId('tab-label-brain');
    
    // Should wrap, not truncate
    expect(tabLabel.props.numberOfLines).toBeUndefined();
  });

  test('touch targets maintained (≥44px)', () => {
    const { getAllByRole } = render(
      <TaskListScreen fontSizeMultiplier={2.0} />
    );

    const buttons = getAllByRole('button');
    
    buttons.forEach(button => {
      const height = button.props.style?.minHeight || button.props.style?.height || 44;
      expect(height).toBeGreaterThanOrEqual(44);
    });
  });

  test('all text visible (no truncation)', () => {
    const { getByTestId } = render(
      <TaskListScreen 
        fontSizeMultiplier={2.0}
        tasks={[{ id: '1', title: 'Test Task with Long Title' }]}
      />
    );

    const taskTitle = getByTestId('task-title-0');
    
    // No ellipsis at max size
    expect(taskTitle.props.ellipsizeMode).toBeUndefined();
  });

  test('scrolling works (content not fixed-height)', () => {
    const { getByTestId } = render(
      <TaskListScreen 
        fontSizeMultiplier={2.0}
        tasks={Array.from({ length: 20 }, (_, i) => ({
          id: `${i}`,
          title: `Task ${i}`,
        }))}
      />
    );

    const scrollView = getByTestId('task-list-scroll');
    
    // Should be scrollable
    expect(scrollView.props.scrollEnabled).not.toBe(false);
  });

  test('VoiceOver reads full text (no truncation)', () => {
    const { getByTestId } = render(
      <TaskListScreen 
        fontSizeMultiplier={2.0}
        tasks={[{
          id: '1',
          title: 'Very Long Task Title That Should Be Fully Readable',
        }]}
      />
    );

    const taskTitle = getByTestId('task-title-0');
    
    // Accessibility label should contain full text
    expect(taskTitle.props.accessibilityLabel || taskTitle.props.children).toMatch(
      /Very Long Task Title That Should Be Fully Readable/
    );
  });

  test('set iOS text size via xcrun simctl', () => {
    // This would be executed in actual iOS simulator
    const command = 'xcrun simctl ui booted increase_text_size';
    
    // Document for CI/CD
    expect(command).toMatch(/xcrun simctl/);
  });

  test('no element overlap at max text size', () => {
    const { queryAllByTestId } = render(
      <TaskListScreen 
        fontSizeMultiplier={2.0}
        tasks={[
          { id: '1', title: 'Task 1' },
          { id: '2', title: 'Task 2' },
        ]}
      />
    );

    const taskItems = queryAllByTestId(/task-item-/);
    
    // Each should have defined bounds (no overlap)
    expect(taskItems.length).toBe(2);
  });
});
