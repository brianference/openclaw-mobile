/**
 * TC-MOBILE-009: Boundary Values & Invalid Data
 * Category: Edge Cases
 * Priority: P2 (Medium)
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const AddTaskScreen = require('../../src/screens/Tasks/AddTaskScreen').default;

describe('TC-MOBILE-009: Boundary Values & Invalid Data', () => {
  test('empty title: save button disabled', () => {
    const { getByTestId } = render(<AddTaskScreen />);
    
    const titleInput = getByTestId('task-title-input');
    fireEvent.changeText(titleInput, '');
    
    const saveButton = getByTestId('create-task-button');
    expect(saveButton.props.disabled).toBe(true);
  });

  test('single space title: treated as empty', () => {
    const { getByTestId, getByText } = render(<AddTaskScreen />);
    
    fireEvent.changeText(getByTestId('task-title-input'), ' ');
    fireEvent.press(getByTestId('create-task-button'));
    
    expect(getByText('Title required')).toBeTruthy();
  });

  test('past due date: warning confirmation required', async () => {
    const { getByTestId, getByText } = render(<AddTaskScreen />);
    
    const yesterday = new Date(Date.now() - 86400000);
    fireEvent(getByTestId('due-date-field'), 'onDateChange', yesterday);
    fireEvent.press(getByTestId('create-task-button'));
    
    await waitFor(() => {
      expect(getByText(/Due date is in the past.*Continue/)).toBeTruthy();
    });
  });

  test('weak password: save allowed with warning', () => {
    const AddSecretScreen = require('../../src/screens/Vault/AddSecretScreen').default;
    const { getByTestId } = render(<AddSecretScreen />);
    
    fireEvent.changeText(getByTestId('password-input'), 'a');
    
    const strengthMeter = getByTestId('password-strength-meter');
    expect(strengthMeter.props.accessibilityLabel).toMatch(/Very Weak/i);
    
    // Save still allowed
    const saveButton = getByTestId('save-secret-button');
    expect(saveButton.props.disabled).toBe(false);
  });

  test('invalid URL format: save allowed (not required)', () => {
    const AddSecretScreen = require('../../src/screens/Vault/AddSecretScreen').default;
    const { getByTestId } = render(<AddSecretScreen />);
    
    fireEvent.changeText(getByTestId('url-input'), 'not a url');
    fireEvent.press(getByTestId('save-secret-button'));
    
    // No error - URL is optional
  });
});
