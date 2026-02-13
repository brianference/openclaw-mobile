#!/bin/bash

# This script generates stub test files for remaining test cases
# Each file includes basic structure that can be expanded

echo "Generating remaining test files..."

# TC-MOBILE-005: Empty States
cat > /root/.openclaw/workspace/projects/mobileclaw/tests/integration/TC-MOBILE-005.test.js << 'TESTEOF'
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
TESTEOF

# TC-MOBILE-007: Rapid Interaction
cat > /root/.openclaw/workspace/projects/mobileclaw/tests/integration/TC-MOBILE-007.test.js << 'TESTEOF'
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
TESTEOF

# TC-MOBILE-012: Camera/Location Permission Denied
cat > /root/.openclaw/workspace/projects/mobileclaw/tests/integration/TC-MOBILE-012.test.js << 'TESTEOF'
/**
 * TC-MOBILE-012: Camera/Location Permission Denied
 * Category: Error Handling
 * Priority: P1 (High)
 * Feature: Scanner, Places
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import * as Camera from 'expo-camera';
import * as Location from 'expo-location';

const ScannerScreen = require('../../src/screens/Scanner/ScannerScreen').default;
const PlacesMapScreen = require('../../src/screens/Places/PlacesMapScreen').default;

describe('TC-MOBILE-012: Camera/Location Permission Denied', () => {
  beforeEach(() => {
    // Mock permissions denied
    Camera.requestCameraPermissionsAsync.mockResolvedValue({ status: 'denied' });
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });
  });

  test('scanner: shows error state when camera permission denied', async () => {
    const { getByTestId, getByText } = render(<ScannerScreen />);

    fireEvent.press(getByTestId('scan-document-button'));

    await waitFor(() => {
      expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalled();
    });

    // Error state shown
    await waitFor(() => {
      expect(getByText('Camera access required to scan documents.')).toBeTruthy();
      expect(getByText('Open Settings')).toBeTruthy();
    });

    // Icon grayed out
    const cameraIcon = getByTestId('camera-icon');
    expect(cameraIcon.props.style.opacity).toBeLessThan(1);
  });

  test('places: shows error state when location permission denied', async () => {
    const { getByText } = render(<PlacesMapScreen />);

    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });

    // Toast notification
    expect(getByText('Location access denied. Enable in Settings to use this feature.')).toBeTruthy();

    // Map still functional (generic view, no user location)
    const map = getByTestId('places-map');
    expect(map).toBeTruthy();
    expect(map.props.showsUserLocation).toBe(false);
  });

  test('"Open Settings" button deep links to app permissions', () => {
    const { getByTestId } = render(<ScannerScreen />);

    const openSettingsButton = getByTestId('open-settings-button');
    
    // Should have onPress handler
    expect(openSettingsButton.props.onPress).toBeDefined();
    
    // Would open iOS Settings app (can't automate actual navigation)
    // Implementation uses Linking.openSettings()
  });

  test('places: search works without location', async () => {
    const mockSearchPlaces = jest.fn().mockResolvedValue([
      { id: '1', name: 'Place 1' }
    ]);

    const { getByTestId, getByText } = render(
      <PlacesMapScreen onSearchPlaces={mockSearchPlaces} />
    );

    // Search by name works
    fireEvent.changeText(getByTestId('places-search-bar'), 'cafe');
    
    await waitFor(() => {
      expect(mockSearchPlaces).toHaveBeenCalledWith('cafe');
      expect(getByText('Place 1')).toBeTruthy();
    });

    // Note about nearby places
    expect(getByText(/Nearby places unavailable without location access/i)).toBeTruthy();
  });

  test('accessibility: error states clearly announced', () => {
    const { getByTestId } = render(<ScannerScreen />);

    const errorState = getByTestId('camera-permission-error');
    expect(errorState.props.accessibilityLabel).toMatch(/Camera access required/i);
    expect(errorState.props.accessibilityRole).toBe('alert');
  });

  test('mock permission APIs: set denied state', () => {
    expect(Camera.requestCameraPermissionsAsync).toBeDefined();
    expect(Location.requestForegroundPermissionsAsync).toBeDefined();
  });
});
TESTEOF

# TC-MOBILE-013: API Timeout & Slow Network
cat > /root/.openclaw/workspace/projects/mobileclaw/tests/integration/TC-MOBILE-013.test.js << 'TESTEOF'
/**
 * TC-MOBILE-013: API Timeout & Slow Network
 * Category: Error Handling
 * Priority: P1 (High)
 * Feature: Chat, Cloud Sync
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const ChatScreen = require('../../src/screens/Chat/ChatScreen').default;

describe('TC-MOBILE-013: API Timeout & Slow Network', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('chat: message fails after 30s timeout', async () => {
    const mockSendMessage = jest.fn(() => new Promise(() => {})); // Never resolves

    const { getByTestId, getByText } = render(
      <ChatScreen onSendMessage={mockSendMessage} />
    );

    fireEvent.changeText(getByTestId('chat-input'), 'Test timeout');
    fireEvent.press(getByTestId('send-button'));

    // Sending status
    await waitFor(() => {
      expect(getByText('Sending...')).toBeTruthy();
    });

    // Fast-forward 30 seconds
    jest.advanceTimersByTime(30000);

    // Failed status
    await waitFor(() => {
      expect(getByText(/Failed.*⚠️/)).toBeTruthy();
    });

    // Retry option available
    const failedMessage = getByTestId('message-0');
    fireEvent.press(failedMessage);
    expect(getByText('Retry')).toBeTruthy();
    expect(getByText('Delete')).toBeTruthy();
  });

  test('cloud sync: shows timeout error after 60s', async () => {
    const mockSync = jest.fn(() => new Promise(() => {}));

    const { getByTestId, getByText } = render(
      <ChatScreen onSync={mockSync} />
    );

    fireEvent.press(getByTestId('sync-now-button'));

    // Progress text
    await waitFor(() => {
      expect(getByText(/Syncing.*may take a while/i)).toBeTruthy();
    });

    // Fast-forward 60 seconds
    jest.advanceTimersByTime(60000);

    // Timeout error
    await waitFor(() => {
      expect(getByText('Sync timed out. Check your connection and try again.')).toBeTruthy();
    });
  });

  test('retry: successful with fast connection', async () => {
    let callCount = 0;
    const mockSendMessage = jest.fn(() => {
      callCount++;
      if (callCount === 1) {
        return new Promise(() => {}); // Timeout first time
      }
      return Promise.resolve({ success: true }); // Success on retry
    });

    const { getByTestId, getByText } = render(
      <ChatScreen onSendMessage={mockSendMessage} />
    );

    // First attempt
    fireEvent.changeText(getByTestId('chat-input'), 'Test');
    fireEvent.press(getByTestId('send-button'));

    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(getByText(/Failed/)).toBeTruthy();
    });

    // Retry
    fireEvent.press(getByTestId('message-0'));
    fireEvent.press(getByText('Retry'));

    await waitFor(() => {
      expect(getByText('Sent')).toBeTruthy();
    });
  });

  test('status changes announced for screen readers', async () => {
    const mockSend = jest.fn(() => new Promise(() => {}));

    const { getByTestId } = render(<ChatScreen onSendMessage={mockSend} />);

    fireEvent.changeText(getByTestId('chat-input'), 'Test');
    fireEvent.press(getByTestId('send-button'));

    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      const statusText = getByTestId('message-status-0');
      expect(statusText.props.accessibilityLiveRegion).toBe('polite');
      expect(statusText.props.accessibilityLabel).toMatch(/failed.*retry/i);
    });
  });

  test('mock network delay: 30s+', async () => {
    const slowRequest = () => new Promise(resolve => setTimeout(resolve, 35000));
    
    const promise = slowRequest();
    jest.advanceTimersByTime(35000);
    
    await expect(promise).resolves.toBeUndefined();
  });
});
TESTEOF

echo "Generated test stubs for TC-005, TC-007, TC-012, TC-013"
echo "Remaining tests to be created manually or via additional script"
