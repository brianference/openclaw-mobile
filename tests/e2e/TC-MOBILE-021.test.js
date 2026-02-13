/**
 * TC-MOBILE-021: Tablet Master-Detail Layout
 * Category: Responsiveness
 * Priority: P2 (Medium)
 * Feature: Task Board, Vault
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Dimensions } from 'react-native';

const TaskListScreen = require('../../src/screens/Tasks/TaskListScreen').default;

describe('TC-MOBILE-021: Tablet Master-Detail Layout', () => {
  beforeEach(() => {
    // Set iPad dimensions
    Dimensions.get = jest.fn().mockReturnValue({ width: 768, height: 1024 });
  });

  test('iPad: master-detail layout (320px + remaining)', () => {
    const { getByTestId } = render(
      <TaskListScreen tasks={[{ id: '1', title: 'Task 1' }]} />
    );

    const masterPane = getByTestId('task-list-pane');
    const detailPane = getByTestId('task-detail-pane');

    // Left pane: 320px fixed
    expect(masterPane.props.style?.width).toBe(320);
    
    // Right pane: fills remaining
    expect(detailPane.props.style?.flex).toBe(1);
  });

  test('selected task: highlighted in list', async () => {
    const { getByTestId } = render(
      <TaskListScreen tasks={[
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' },
      ]} />
    );

    const task1 = getByTestId('task-item-0');
    fireEvent.press(task1);

    await waitFor(() => {
      // Blue left border indicates selection
      expect(task1.props.style?.borderLeftColor).toBe('#0ea5e9');
      expect(task1.props.style?.borderLeftWidth).toBeGreaterThan(0);
    });
  });

  test('detail pane: updates immediately (optimistic UI)', async () => {
    const mockUpdateTask = jest.fn().mockResolvedValue({ success: true });
    
    const { getByTestId } = render(
      <TaskListScreen 
        tasks={[{ id: '1', title: 'Task 1', completed: false }]}
        onUpdateTask={mockUpdateTask}
      />
    );

    // Select task
    fireEvent.press(getByTestId('task-item-0'));

    // Edit in detail pane
    const titleInput = getByTestId('task-title-input');
    fireEvent.changeText(titleInput, 'Updated Task');

    // List updates immediately
    await waitFor(() => {
      const taskTitle = getByTestId('task-title-0');
      expect(taskTitle.props.children).toBe('Updated Task');
    });
  });

  test('keyboard navigation: tab between panes', () => {
    const { getByTestId } = render(<TaskListScreen />);

    const masterPane = getByTestId('task-list-pane');
    const detailPane = getByTestId('task-detail-pane');

    // Both panes accessible
    expect(masterPane.props.accessible).not.toBe(false);
    expect(detailPane.props.accessible).not.toBe(false);
  });

  test('mobile (<768px): full-screen navigation (no master-detail)', () => {
    Dimensions.get = jest.fn().mockReturnValue({ width: 375, height: 667 });
    
    const { queryByTestId } = render(
      <TaskListScreen tasks={[{ id: '1', title: 'Task 1' }]} />
    );

    // No split view
    expect(queryByTestId('task-detail-pane')).toBeNull();
  });

  test('screen reader: announces panes correctly', () => {
    const { getByTestId } = render(<TaskListScreen />);

    const masterPane = getByTestId('task-list-pane');
    const detailPane = getByTestId('task-detail-pane');

    expect(masterPane.props.accessibilityLabel).toMatch(/Task list.*Main content/i);
    expect(detailPane.props.accessibilityLabel).toMatch(/Task detail.*Complementary/i);
  });

  test('vault: same master-detail layout', () => {
    const VaultContentsScreen = require('../../src/screens/Vault/VaultContentsScreen').default;
    const { getByTestId } = render(
      <VaultContentsScreen secrets={[{ id: '1', title: 'Secret 1' }]} />
    );

    const masterPane = getByTestId('vault-list-pane');
    const detailPane = getByTestId('vault-detail-pane');

    expect(masterPane.props.style?.width).toBe(320);
    expect(detailPane.props.style?.flex).toBe(1);
  });
});
