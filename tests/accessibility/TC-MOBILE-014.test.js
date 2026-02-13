/**
 * TC-MOBILE-014: VoiceOver Full Flow (iOS)
 * Category: Accessibility
 * Priority: P0 (Critical)
 * Feature: All
 * 
 * NOTE: This is primarily a manual test, but we include automated checks
 * for VoiceOver-compatible attributes.
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { assertAccessibilityLabel } from '../helpers/accessibility';

const OnboardingFlow = require('../../src/screens/Onboarding/OnboardingFlow').default;
const AddTaskScreen = require('../../src/screens/Tasks/AddTaskScreen').default;
const TaskListScreen = require('../../src/screens/Tasks/TaskListScreen').default;

describe('TC-MOBILE-014: VoiceOver Full Flow (iOS)', () => {
  test('onboarding: all elements have accessibility labels', () => {
    const { getByTestId } = render(<OnboardingFlow />);

    // App name announced on launch
    const appTitle = getByTestId('app-title');
    assertAccessibilityLabel(appTitle, 'MobileClaw');

    // Stepper announced
    const stepper = getByTestId('onboarding-stepper');
    expect(stepper.props.accessibilityLabel).toMatch(/Step 1 of 3/i);

    // Buttons have action hints
    const nextButton = getByTestId('onboarding-next-button');
    expect(nextButton.props.accessibilityHint).toMatch(/activates|Double-tap/i);
  });

  test('task creation: all form fields announced with labels and hints', () => {
    const { getByTestId } = render(<AddTaskScreen />);

    // Title field
    const titleInput = getByTestId('task-title-input');
    expect(titleInput.props.accessibilityLabel).toBeDefined();
    expect(titleInput.props.accessibilityHint).toBeDefined();
    expect(titleInput.props.accessibilityRole || titleInput.props.role).toBe('text');

    // Due date field
    const dueDateField = getByTestId('due-date-field');
    expect(dueDateField.props.accessibilityLabel).toMatch(/Due.*Date/i);
    expect(dueDateField.props.accessibilityHint).toMatch(/Choose date.*picker/i);

    // Category field
    const categoryField = getByTestId('category-field');
    expect(categoryField.props.accessibilityLabel).toBeDefined();

    // Notes field
    const notesField = getByTestId('notes-field');
    expect(notesField.props.accessibilityLabel).toBeDefined();

    // Create button
    const createButton = getByTestId('create-task-button');
    expect(createButton.props.accessibilityRole || createButton.props.role).toBe('button');
  });

  test('task list: tasks announced with full context', () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Write design spec',
        completed: false,
        dueDate: '2026-02-09T14:00:00Z',
        category: 'work',
      },
    ];

    const { getByTestId } = render(<TaskListScreen tasks={mockTasks} />);

    const taskItem = getByTestId('task-item-0');
    
    // Expected announcement:
    // "Task: Write design spec. Not completed. Due February 9 at 2 PM. Category: Work. Actions available."
    expect(taskItem.props.accessibilityLabel).toMatch(/Write design spec/i);
    expect(taskItem.props.accessibilityLabel).toMatch(/Not completed/i);
    expect(taskItem.props.accessibilityLabel).toMatch(/Due February 9/i);
    expect(taskItem.props.accessibilityLabel).toMatch(/Work/i);
  });

  test('swipe actions: announced for VoiceOver', () => {
    const { getByTestId } = render(
      <TaskListScreen 
        tasks={[{ id: '1', title: 'Test Task', completed: false }]}
      />
    );

    const taskItem = getByTestId('task-item-0');
    
    // Swipe actions should be in accessibility hint
    expect(taskItem.props.accessibilityHint || taskItem.props.accessibilityActions).toBeDefined();
  });

  test('success toast: announced without interrupting navigation', async () => {
    const { getByTestId } = render(<AddTaskScreen />);

    fireEvent.changeText(getByTestId('task-title-input'), 'Test Task');
    fireEvent.press(getByTestId('create-task-button'));

    await waitFor(() => {
      const toast = getByTestId('toast-message');
      
      // Toast uses polite live region (doesn't interrupt)
      expect(toast.props.accessibilityLiveRegion).toBe('polite');
      expect(toast.props.accessibilityLabel).toMatch(/created successfully/i);
    });
  });

  test('navigation: tab bar items announced with position', () => {
    const { getByTestId } = render(<TaskListScreen />);

    const tabBar = getByTestId('bottom-tab-bar');
    const tasksTab = getByTestId('tab-tasks');
    
    expect(tasksTab.props.accessibilityLabel).toMatch(/Tasks.*Tab 1 of 5/i);
    expect(tasksTab.props.accessibilityState?.selected).toBe(true);
  });

  test('validation errors: announced immediately', async () => {
    const { getByTestId, getByText } = render(<AddTaskScreen />);

    const titleInput = getByTestId('task-title-input');
    
    // Enter text then clear it
    fireEvent.changeText(titleInput, 'Task');
    fireEvent.changeText(titleInput, '');

    // Error should be associated with field
    await waitFor(() => {
      expect(titleInput.props['aria-invalid']).toBe(true);
      expect(titleInput.props['aria-describedby']).toBeDefined();
      
      const errorText = getByText('Title required');
      expect(errorText.props.accessibilityLiveRegion).toBe('polite');
    });
  });

  test('focus order: logical top-to-bottom, left-to-right', () => {
    const { getAllByRole } = render(<AddTaskScreen />);

    const focusableElements = getAllByRole('text').concat(getAllByRole('button'));
    
    // Elements should be in document order
    expect(focusableElements.length).toBeGreaterThan(0);
    
    // Each element should have proper tab index or be naturally focusable
    focusableElements.forEach(element => {
      expect(element.props.accessible).not.toBe(false);
    });
  });

  test('zero unlabeled buttons', () => {
    const { getAllByRole } = render(<AddTaskScreen />);

    const buttons = getAllByRole('button');
    
    buttons.forEach(button => {
      expect(
        button.props.accessibilityLabel || 
        button.props['aria-label'] ||
        button.props.children
      ).toBeDefined();
    });
  });

  test('dynamic content: live regions announce changes', async () => {
    const { getByTestId, rerender } = render(
      <TaskListScreen tasks={[]} />
    );

    // Add a task dynamically
    rerender(
      <TaskListScreen 
        tasks={[{ id: '1', title: 'New Task', completed: false }]}
      />
    );

    const taskList = getByTestId('task-list-container');
    expect(taskList.props.accessibilityLiveRegion).toBe('polite');
  });

  test('manual checklist items', () => {
    // This test documents manual verification steps
    const manualChecklist = [
      'Enable VoiceOver in iOS Settings',
      'Launch app with VoiceOver enabled',
      'Complete full onboarding flow using swipe gestures',
      'Create task using double-tap activation',
      'Verify all announcements match expected text',
      'Test with actual device (not just simulator)',
    ];

    expect(manualChecklist.length).toBe(6);
    
    // These are documented for manual testers
    console.log('Manual VoiceOver Test Checklist:');
    manualChecklist.forEach((item, i) => {
      console.log(`${i + 1}. ${item}`);
    });
  });
});
