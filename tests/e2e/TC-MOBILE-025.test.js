/**
 * TC-MOBILE-025: App State Preservation (Background/Foreground)
 * Category: Cross-Platform
 * Priority: P1 (High)
 * Feature: All
 * 
 * NOTE: This test includes automated checks, but actual app suspend/resume
 * testing is best done manually on real devices.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';

const AddTaskScreen = require('../../src/screens/Tasks/AddTaskScreen').default;
const VaultContentsScreen = require('../../src/screens/Vault/VaultContentsScreen').default;

describe('TC-MOBILE-025: App State Preservation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('task form: state preserved after backgrounding', async () => {
    const { getByTestId, rerender } = render(<AddTaskScreen />);

    // Fill form partially
    fireEvent.changeText(getByTestId('task-title-input'), 'Half-filled task');
    fireEvent(getByTestId('due-date-field'), 'onDateChange', new Date('2026-02-10'));

    // App goes to background
    AppState.currentState = 'background';
    AppState.emit('change', 'background');

    // Wait 30 seconds
    jest.advanceTimersByTime(30000);

    // App returns to foreground
    AppState.currentState = 'active';
    AppState.emit('change', 'active');

    // State preserved
    rerender(<AddTaskScreen />);
    
    const titleInput = getByTestId('task-title-input');
    const dueDateField = getByTestId('due-date-field');
    
    expect(titleInput.props.value).toBe('Half-filled task');
    expect(dueDateField.props.selectedDate).toEqual(new Date('2026-02-10'));
  });

  test('vault: remains unlocked <5min, locks after 5min', async () => {
    const { getByTestId, queryByTestId } = render(
      <VaultContentsScreen unlocked={true} autoLockMinutes={5} />
    );

    // Vault unlocked initially
    expect(getByTestId('vault-contents')).toBeTruthy();

    // Background for 30 seconds
    AppState.currentState = 'background';
    AppState.emit('change', 'background');
    jest.advanceTimersByTime(30000);

    // Foreground: still unlocked
    AppState.currentState = 'active';
    AppState.emit('change', 'active');
    
    expect(getByTestId('vault-contents')).toBeTruthy();

    // Background for 5 minutes
    AppState.currentState = 'background';
    AppState.emit('change', 'background');
    jest.advanceTimersByTime(5 * 60 * 1000);

    // Foreground: should be locked
    AppState.currentState = 'active';
    AppState.emit('change', 'active');

    await waitFor(() => {
      expect(queryByTestId('vault-contents')).toBeNull();
      expect(getByTestId('vault-unlock-screen')).toBeTruthy();
    });
  });

  test('AppState events handled correctly', () => {
    const mockOnBackground = jest.fn();
    const mockOnForeground = jest.fn();

    const { rerender } = render(
      <AddTaskScreen 
        onBackground={mockOnBackground}
        onForeground={mockOnForeground}
      />
    );

    // Go to background
    AppState.currentState = 'background';
    AppState.emit('change', 'background');
    
    expect(mockOnBackground).toHaveBeenCalled();

    // Return to foreground
    AppState.currentState = 'active';
    AppState.emit('change', 'active');
    
    expect(mockOnForeground).toHaveBeenCalled();
  });

  test('iOS: handles inactive state (phone call, Siri)', () => {
    const mockOnInactive = jest.fn();

    render(<AddTaskScreen onInactive={mockOnInactive} />);

    // iOS-specific inactive state
    AppState.currentState = 'inactive';
    AppState.emit('change', 'inactive');
    
    expect(mockOnInactive).toHaveBeenCalled();
  });

  test('Android: state persisted to disk on low memory', async () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    
    const { getByTestId } = render(<AddTaskScreen />);

    // Fill form
    fireEvent.changeText(getByTestId('task-title-input'), 'Test Task');
    
    // Simulate low memory (Android may kill app)
    AppState.currentState = 'background';
    AppState.emit('change', 'background');
    AppState.emit('memoryWarning');

    // State should be saved to AsyncStorage
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'unsavedTaskForm',
        expect.stringContaining('Test Task')
      );
    });
  });

  test('no data loss on resume', () => {
    const { getByTestId } = render(<AddTaskScreen />);

    fireEvent.changeText(getByTestId('task-title-input'), 'Important Task');
    
    // Background and foreground
    AppState.currentState = 'background';
    AppState.emit('change', 'background');
    AppState.currentState = 'active';
    AppState.emit('change', 'active');

    // Data preserved
    expect(getByTestId('task-title-input').props.value).toBe('Important Task');
  });

  test('no crash on resume', () => {
    const { getByTestId } = render(<AddTaskScreen />);

    // Should not throw
    expect(() => {
      AppState.currentState = 'background';
      AppState.emit('change', 'background');
      AppState.currentState = 'active';
      AppState.emit('change', 'active');
    }).not.toThrow();
    
    // App still functional
    expect(getByTestId('add-task-screen')).toBeTruthy();
  });

  test('manual test checklist', () => {
    const manualSteps = [
      'Fill task form partially',
      'Press Home button (app to background)',
      'Wait 30 seconds',
      'Reopen app from app switcher',
      'Verify form state preserved',
      'Unlock vault',
      'Background app for 5+ minutes',
      'Reopen app',
      'Verify vault requires re-authentication',
    ];

    console.log('Manual App State Preservation Test:');
    manualSteps.forEach((step, i) => {
      console.log(`${i + 1}. ${step}`);
    });

    expect(manualSteps.length).toBe(8);
  });
});
