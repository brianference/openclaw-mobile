/**
 * TC-MOBILE-007: Rapid Interaction & Race Conditions
 * Category: Edge Cases
 * Priority: P1 (High)
 * Feature: Task Board
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const TaskListScreen = require('../../src/screens/Tasks/TaskListScreen').default;

describe('TC-MOBILE-007: Rapid Interaction & Race Conditions', () => {
  let mockUpdateTask;
  let mockDeleteTask;

  beforeEach(() => {
    mockUpdateTask = jest.fn().mockResolvedValue({ success: true });
    mockDeleteTask = jest.fn().mockResolvedValue({ success: true });
  });

  test('checkbox: debounced to prevent duplicate API calls', async () => {
    const { getByTestId } = render(
      <TaskListScreen 
        tasks={[{ id: '1', title: 'Task 1', completed: false }]}
        onUpdateTask={mockUpdateTask}
      />
    );

    const checkbox = getByTestId('task-checkbox-0');

    // Rapidly tap 3 times within 1 second
    fireEvent.press(checkbox);
    fireEvent.press(checkbox);
    fireEvent.press(checkbox);

    // Only final state should be applied (odd number = completed)
    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledTimes(1);
      expect(mockUpdateTask).toHaveBeenCalledWith(
        expect.objectContaining({ completed: true })
      );
    }, { timeout: 1100 });
  });

  test('swipe actions: queued until first animation completes', async () => {
    const { getByTestId } = render(
      <TaskListScreen 
        tasks={[
          { id: '1', title: 'Task 1' },
          { id: '2', title: 'Task 2' },
        ]}
        onDeleteTask={mockDeleteTask}
      />
    );

    // Swipe Task 1 left
    fireEvent(getByTestId('task-item-0'), 'swipeLeft');
    fireEvent.press(getByTestId('delete-button-0'));

    // Immediately swipe Task 2 (before Task 1 animation completes)
    fireEvent(getByTestId('task-item-1'), 'swipeLeft');

    // Second swipe should be queued
    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledTimes(1);
    }, { timeout: 300 });

    // After first completes, second should execute
    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledTimes(2);
    }, { timeout: 1000 });
  });

  test('navigation: back cancels in-progress forward transition', async () => {
    const { getByTestId } = render(<TaskListScreen />);

    const taskItem = getByTestId('task-item-0');
    
    // Tap to navigate
    fireEvent.press(taskItem);
    
    // Immediately tap back (before transition completes)
    fireEvent.press(getByTestId('back-button'));

    await waitFor(() => {
      // Should be back on task list, no stuck state
      expect(getByTestId('task-list-screen')).toBeTruthy();
    });
  });

  test('pull-to-refresh: task tap blocked until refresh completes', async () => {
    const { getByTestId } = render(<TaskListScreen />);

    // Start refresh
    fireEvent(getByTestId('task-list-scroll'), 'refresh');

    // Try to tap task immediately
    const taskItem = getByTestId('task-item-0');
    fireEvent.press(taskItem);

    // Should be blocked (no navigation)
    expect(() => getByTestId('task-detail-screen')).toThrow();

    // After refresh completes, tap should work
    await waitFor(() => {
      expect(getByTestId('task-list-scroll').props.refreshing).toBe(false);
    });

    fireEvent.press(taskItem);
    await waitFor(() => {
      expect(getByTestId('task-detail-screen')).toBeTruthy();
    });
  });

  test('only 1 API call per intended action', async () => {
    const { getByTestId } = render(
      <TaskListScreen 
        tasks={[{ id: '1', title: 'Task 1', completed: false }]}
        onUpdateTask={mockUpdateTask}
      />
    );

    // Rapidly toggle checkbox
    const checkbox = getByTestId('task-checkbox-0');
    for (let i = 0; i < 5; i++) {
      fireEvent.press(checkbox);
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    await waitFor(() => {
      // Should only have 1 API call despite 5 taps
      expect(mockUpdateTask.mock.calls.length).toBeLessThanOrEqual(1);
    }, { timeout: 1000 });
  });

  test('UI state matches final expected state', async () => {
    const { getByTestId } = render(
      <TaskListScreen 
        tasks={[{ id: '1', title: 'Task 1', completed: false }]}
        onUpdateTask={mockUpdateTask}
      />
    );

    const checkbox = getByTestId('task-checkbox-0');
    
    // 3 rapid taps
    fireEvent.press(checkbox);
    fireEvent.press(checkbox);
    fireEvent.press(checkbox);

    await waitFor(() => {
      // Final state: completed (odd number of toggles)
      expect(checkbox.props.value || checkbox.props.checked).toBe(true);
    });
  });
});
