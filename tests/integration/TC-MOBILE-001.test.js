/**
 * TC-MOBILE-001: Complete Task Creation Flow
 * Category: Happy Path
 * Priority: P0 (Critical)
 * Feature: Task Board
 */

import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { mockTask } from '../fixtures/tasks';
import { assertAccessibilityLabel, assertTouchTarget } from '../helpers/accessibility';

// Mock components (replace with actual imports)
const AddTaskScreen = require('../../src/screens/Tasks/AddTaskScreen').default;

describe('TC-MOBILE-001: Complete Task Creation Flow', () => {
  let mockNavigate;
  let mockCreateTask;

  beforeEach(() => {
    mockNavigate = jest.fn();
    mockCreateTask = jest.fn().mockResolvedValue({ success: true });
    
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: mockNavigate,
      goBack: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should complete full task creation flow with all fields', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(
      <AddTaskScreen onCreateTask={mockCreateTask} />
    );

    // Step 2: Enter task title
    const titleInput = getByTestId('task-title-input');
    fireEvent.changeText(titleInput, 'Write design spec');
    
    expect(titleInput.props.value).toBe('Write design spec');

    // Step 4: Select due date
    const dueDateField = getByTestId('due-date-field');
    fireEvent.press(dueDateField);
    
    // Wait for date picker
    await waitFor(() => {
      expect(getByTestId('date-picker')).toBeTruthy();
    });
    
    // Select date: Feb 9, 2026, 2:00 PM
    const datePicker = getByTestId('date-picker');
    fireEvent(datePicker, 'onDateChange', new Date('2026-02-09T14:00:00Z'));
    
    // Step 6: Select category
    const categoryField = getByTestId('category-field');
    fireEvent.press(categoryField);
    
    await waitFor(() => {
      expect(getByText('Work')).toBeTruthy();
    });
    
    fireEvent.press(getByText('Work'));

    // Step 8: Select reminder
    const reminderField = getByTestId('reminder-field');
    fireEvent.press(reminderField);
    
    await waitFor(() => {
      expect(getByText('1 hour before')).toBeTruthy();
    });
    
    fireEvent.press(getByText('1 hour before'));

    // Step 10: Enter notes
    const notesField = getByTestId('notes-field');
    fireEvent.changeText(notesField, 'Complete all 25 screens');

    // Step 11: Tap Create Task button
    const createButton = getByTestId('create-task-button');
    
    // Verify button is enabled (gradient background)
    expect(createButton.props.disabled).toBe(false);
    
    fireEvent.press(createButton);

    // Expected Result: Form validates successfully
    await waitFor(() => {
      expect(mockCreateTask).toHaveBeenCalledWith({
        title: 'Write design spec',
        dueDate: expect.any(String),
        category: 'work',
        reminder: expect.any(String),
        notes: 'Complete all 25 screens',
      });
    });

    // Expected Result: Toast appears
    await waitFor(() => {
      expect(getByText('Task created successfully')).toBeTruthy();
    }, { timeout: 4000 });

    // Expected Result: Navigate back to Task List
    expect(mockNavigate).toHaveBeenCalledWith('TaskList');
  });

  test('accessibility: VoiceOver announces task created', async () => {
    const { getByTestId } = render(<AddTaskScreen onCreateTask={mockCreateTask} />);
    
    // Fill form
    fireEvent.changeText(getByTestId('task-title-input'), 'Test Task');
    fireEvent.press(getByTestId('create-task-button'));

    await waitFor(() => {
      const toast = getByTestId('toast-message');
      assertAccessibilityLabel(toast, 'Task created successfully');
      expect(toast.props.accessibilityLiveRegion).toBe('assertive');
    });
  });

  test('accessibility: keyboard navigation works through all fields', async () => {
    const { getByTestId } = render(<AddTaskScreen />);
    
    const titleInput = getByTestId('task-title-input');
    const dueDateField = getByTestId('due-date-field');
    const categoryField = getByTestId('category-field');
    const reminderField = getByTestId('reminder-field');
    const notesField = getByTestId('notes-field');
    const createButton = getByTestId('create-task-button');

    // All fields should be focusable
    expect(titleInput.props.accessible).toBe(true);
    expect(dueDateField.props.accessible).toBe(true);
    expect(categoryField.props.accessible).toBe(true);
    expect(reminderField.props.accessible).toBe(true);
    expect(notesField.props.accessible).toBe(true);
    
    // Touch targets meet minimum size
    assertTouchTarget(createButton, 44);
  });

  test('responsive: renders correctly at 375px (iPhone SE)', () => {
    const { getByTestId } = render(
      <AddTaskScreen />,
      { dimensions: { width: 375, height: 667 } }
    );
    
    // Full-screen modal with bottom CTA
    const container = getByTestId('add-task-container');
    expect(container.props.style).toMatchObject({
      width: '100%',
    });
  });

  test('responsive: renders correctly at 768px (iPad)', () => {
    const { getByTestId } = render(
      <AddTaskScreen />,
      { dimensions: { width: 768, height: 1024 } }
    );
    
    // Centered modal, 500px width
    const modal = getByTestId('add-task-modal');
    expect(modal.props.style).toMatchObject({
      maxWidth: 500,
    });
  });

  test('validation: create button disabled when title empty', () => {
    const { getByTestId } = render(<AddTaskScreen />);
    
    const createButton = getByTestId('create-task-button');
    expect(createButton.props.disabled).toBe(true);
  });

  test('validation: create button enabled when required fields filled', () => {
    const { getByTestId } = render(<AddTaskScreen />);
    
    fireEvent.changeText(getByTestId('task-title-input'), 'Test Task');
    fireEvent.press(getByTestId('category-field'));
    fireEvent.press(getByTestId('category-option-work'));
    
    const createButton = getByTestId('create-task-button');
    expect(createButton.props.disabled).toBe(false);
  });

  test('error handling: shows error toast on creation failure', async () => {
    const mockFailedCreate = jest.fn().mockRejectedValue(new Error('Network error'));
    const { getByTestId, getByText } = render(
      <AddTaskScreen onCreateTask={mockFailedCreate} />
    );
    
    fireEvent.changeText(getByTestId('task-title-input'), 'Test Task');
    fireEvent.press(getByTestId('create-task-button'));

    await waitFor(() => {
      expect(getByText(/failed/i)).toBeTruthy();
    });
  });
});
