/**
 * TC-MOBILE-006: Maximum Length Input Handling
 * Category: Edge Cases
 * Priority: P2 (Medium)
 * Feature: Task Board, Vault
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const AddTaskScreen = require('../../src/screens/Tasks/AddTaskScreen').default;
const AddSecretScreen = require('../../src/screens/Vault/AddSecretScreen').default;

describe('TC-MOBILE-006: Maximum Length Input Handling', () => {
  test('task title: hard limit at 200 chars', () => {
    const { getByTestId } = render(<AddTaskScreen />);
    
    const titleInput = getByTestId('task-title-input');
    const maxLength = 'A'.repeat(200);
    const tooLong = 'A'.repeat(201);
    
    fireEvent.changeText(titleInput, maxLength);
    expect(titleInput.props.value.length).toBe(200);
    
    // Character counter visible
    expect(getByTestId('char-counter').props.children).toMatch(/200/200/);
    
    // Try to type more - blocked
    fireEvent.changeText(titleInput, tooLong);
    expect(titleInput.props.value.length).toBe(200);
  });

  test('notes field: scrollable, warn at 5000 chars', () => {
    const { getByTestId, queryByText } = render(<AddTaskScreen />);
    
    const notesField = getByTestId('notes-field');
    const longNotes = 'A'.repeat(5000);
    
    fireEvent.changeText(notesField, longNotes);
    
    // Scrollable
    expect(notesField.props.scrollEnabled).not.toBe(false);
    
    // Warning at 5000 chars
    expect(queryByText(/Note is very long/i)).toBeTruthy();
  });

  test('vault title: hard limit at 100 chars', () => {
    const { getByTestId } = render(<AddSecretScreen />);
    
    const titleInput = getByTestId('secret-title-input');
    const maxLength = 'A'.repeat(100);
    
    fireEvent.changeText(titleInput, maxLength);
    expect(titleInput.props.value.length).toBe(100);
    expect(titleInput.props.maxLength).toBe(100);
  });

  test('vault password: hard limit at 128 chars', () => {
    const { getByTestId } = render(<AddSecretScreen />);
    
    const passwordInput = getByTestId('password-input');
    const maxLength = 'A'.repeat(128);
    
    fireEvent.changeText(passwordInput, maxLength);
    expect(passwordInput.props.value.length).toBe(128);
    expect(passwordInput.props.maxLength).toBe(128);
  });

  test('no text truncation on display', () => {
    const { getByTestId } = render(<AddTaskScreen initialTask={{ title: 'A'.repeat(200) }} />);
    
    const titleDisplay = getByTestId('task-title-display');
    
    // No ellipsis
    expect(titleDisplay.props.numberOfLines).toBeUndefined();
    expect(titleDisplay.props.ellipsizeMode).toBeUndefined();
  });

  test('character counter updates in real-time', () => {
    const { getByTestId } = render(<AddTaskScreen />);
    
    const titleInput = getByTestId('task-title-input');
    const counter = getByTestId('char-counter');
    
    fireEvent.changeText(titleInput, 'Test');
    expect(counter.props.children).toMatch(/4/200/);
    
    fireEvent.changeText(titleInput, 'Test Task');
    expect(counter.props.children).toMatch(/9/200/);
  });
});
