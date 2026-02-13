/**
 * TC-MOBILE-010: Network Failure During Sync
 * Category: Error Handling
 * Priority: P0 (Critical)
 * Feature: Task Board, Cloud Sync
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';

const TaskListScreen = require('../../src/screens/Tasks/TaskListScreen').default;

describe('TC-MOBILE-010: Network Failure During Sync', () => {
  let mockSyncTask;
  let mockLocalSave;

  beforeEach(() => {
    mockSyncTask = jest.fn();
    mockLocalSave = jest.fn().mockResolvedValue({ success: true });
    
    // Start online
    NetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should save task offline and sync when reconnected', async () => {
    const { getByTestId, getByText } = render(
      <TaskListScreen 
        onSyncTask={mockSyncTask}
        onLocalSave={mockLocalSave}
      />
    );

    // Step 1: Create new task (online)
    fireEvent.press(getByTestId('add-task-button'));
    
    await waitFor(() => {
      expect(getByTestId('add-task-screen')).toBeTruthy();
    });
    
    fireEvent.changeText(getByTestId('task-title-input'), 'Test Task');
    
    // Step 2: Turn on Airplane Mode (disconnect network)
    NetInfo.fetch.mockResolvedValue({
      isConnected: false,
      isInternetReachable: false,
    });
    
    // Trigger network change event
    NetInfo.addEventListener.mock.calls[0][0]({
      isConnected: false,
      isInternetReachable: false,
    });

    // Step 3: Observe task save behavior
    fireEvent.press(getByTestId('create-task-button'));

    // Expected Result: Task saves locally
    await waitFor(() => {
      expect(mockLocalSave).toHaveBeenCalledWith({
        title: 'Test Task',
        syncStatus: 'pending',
      });
    });

    // Expected Result: Toast notification
    await waitFor(() => {
      expect(getByText('Saved offline. Will sync when online.')).toBeTruthy();
    });

    // Expected Result: Task shows sync pending indicator
    await waitFor(() => {
      const task = getByTestId('task-item-0');
      expect(task).toBeTruthy();
      expect(getByText('🔄')).toBeTruthy(); // Sync indicator
    });

    // Step 7: Turn off Airplane Mode (reconnect)
    NetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
    });
    
    NetInfo.addEventListener.mock.calls[0][0]({
      isConnected: true,
      isInternetReachable: true,
    });

    // Expected Result: Automatic background sync starts
    await waitFor(() => {
      expect(getByText('Syncing 1 changes...')).toBeTruthy();
    });

    // Mock successful sync
    mockSyncTask.mockResolvedValue({ success: true });

    // Expected Result: Success toast
    await waitFor(() => {
      expect(getByText('Synced successfully')).toBeTruthy();
    }, { timeout: 3000 });

    // Expected Result: Sync indicator disappears
    await waitFor(() => {
      const task = getByTestId('task-item-0');
      expect(task.props.syncStatus).toBe('synced');
    });
  });

  test('should handle edit task offline', async () => {
    const { getByTestId, getByText } = render(
      <TaskListScreen 
        initialTasks={[{ id: '1', title: 'Existing Task', syncStatus: 'synced' }]}
        onLocalSave={mockLocalSave}
      />
    );

    // Go offline
    NetInfo.fetch.mockResolvedValue({ isConnected: false });
    NetInfo.addEventListener.mock.calls[0][0]({ isConnected: false });

    // Edit task
    fireEvent.press(getByTestId('task-item-0'));
    fireEvent.changeText(getByTestId('task-title-input'), 'Updated Task');
    fireEvent.press(getByTestId('save-task-button'));

    // Expected Result: Changes saved locally
    await waitFor(() => {
      expect(mockLocalSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Task',
          syncStatus: 'pending',
        })
      );
    });

    // Expected Result: Same "Saved offline" toast
    expect(getByText('Saved offline. Will sync when online.')).toBeTruthy();
  });

  test('should handle delete task offline', async () => {
    const { getByTestId, getByText } = render(
      <TaskListScreen 
        initialTasks={[{ id: '1', title: 'Task to Delete' }]}
        onLocalSave={mockLocalSave}
      />
    );

    // Go offline
    NetInfo.fetch.mockResolvedValue({ isConnected: false });

    // Delete task
    fireEvent(getByTestId('task-item-0'), 'swipeLeft');
    fireEvent.press(getByTestId('delete-button'));

    // Expected Result: Soft delete locally
    await waitFor(() => {
      expect(mockLocalSave).toHaveBeenCalledWith(
        expect.objectContaining({
          deleted: true,
          syncStatus: 'pending',
        })
      );
    });

    // Expected Result: Toast
    expect(getByText('Deleted offline. Will sync when online.')).toBeTruthy();

    // Expected Result: Task hidden from list
    expect(() => getByTestId('task-item-0')).toThrow();
  });

  test('should handle pull-to-refresh offline', async () => {
    const { getByTestId, getByText } = render(<TaskListScreen />);

    // Go offline
    NetInfo.fetch.mockResolvedValue({ isConnected: false });

    // Pull to refresh
    const scrollView = getByTestId('task-list-scroll');
    fireEvent(scrollView, 'refresh');

    // Expected Result: Error toast
    await waitFor(() => {
      expect(getByText('No internet connection. Showing offline data.')).toBeTruthy();
    });

    // Expected Result: Refresh indicator dismisses
    await waitFor(() => {
      expect(scrollView.props.refreshing).toBe(false);
    });
  });

  test('accessibility: offline status announced', async () => {
    const { getByTestId } = render(<TaskListScreen />);

    // Go offline
    NetInfo.fetch.mockResolvedValue({ isConnected: false });
    NetInfo.addEventListener.mock.calls[0][0]({ isConnected: false });

    await waitFor(() => {
      const statusBar = getByTestId('network-status-bar');
      expect(statusBar.props.accessibilityLabel).toMatch(/Offline mode.*sync later/i);
      expect(statusBar.props.accessibilityLiveRegion).toBe('polite');
    });
  });

  test('sync progress announced', async () => {
    const { getByTestId } = render(
      <TaskListScreen 
        pendingSyncTasks={[
          { id: '1', title: 'Task 1' },
          { id: '2', title: 'Task 2' },
          { id: '3', title: 'Task 3' },
        ]}
      />
    );

    // Go online
    NetInfo.fetch.mockResolvedValue({ isConnected: true });
    NetInfo.addEventListener.mock.calls[0][0]({ isConnected: true });

    await waitFor(() => {
      const syncStatus = getByTestId('sync-status');
      expect(syncStatus.props.accessibilityLabel).toMatch(/Syncing.*3 items pending/i);
    });
  });

  test('mock network state transitions', () => {
    // Online → Offline
    let currentState = { isConnected: true };
    NetInfo.fetch.mockResolvedValue(currentState);
    
    expect(currentState.isConnected).toBe(true);
    
    // Transition to offline
    currentState = { isConnected: false };
    NetInfo.fetch.mockResolvedValue(currentState);
    
    expect(currentState.isConnected).toBe(false);
    
    // Back online
    currentState = { isConnected: true };
    NetInfo.fetch.mockResolvedValue(currentState);
    
    expect(currentState.isConnected).toBe(true);
  });

  test('changes persisted in local DB', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    
    const { getByTestId } = render(<TaskListScreen onLocalSave={mockLocalSave} />);

    // Go offline and create task
    NetInfo.fetch.mockResolvedValue({ isConnected: false });
    
    fireEvent.press(getByTestId('add-task-button'));
    fireEvent.changeText(getByTestId('task-title-input'), 'Offline Task');
    fireEvent.press(getByTestId('create-task-button'));

    // Verify saved to AsyncStorage
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'tasks',
        expect.stringContaining('Offline Task')
      );
    });
  });
});
