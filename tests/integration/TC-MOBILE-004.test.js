/**
 * TC-MOBILE-004: Onboarding to First Task
 * Category: Happy Path
 * Priority: P0 (Critical)
 * Feature: Onboarding + Task Board
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const OnboardingFlow = require('../../src/screens/Onboarding/OnboardingFlow').default;

describe('TC-MOBILE-004: Onboarding to First Task', () => {
  beforeEach(async () => {
    // Clear app data before test
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  test('should complete onboarding and create first task', async () => {
    const { getByTestId, getByText } = render(<OnboardingFlow />);

    // Step 1: App launches to Onboarding screen 1
    expect(getByText('MobileClaw')).toBeTruthy();
    expect(getByTestId('onboarding-stepper')).toBeTruthy();
    expect(getByText('Step 1 of 3')).toBeTruthy();

    // Step 3: Tap "Next"
    const nextButton = getByTestId('onboarding-next-button');
    fireEvent.press(nextButton);

    // Step 4: On screen 2, review features list
    await waitFor(() => {
      expect(getByText('Powerful Features')).toBeTruthy();
      expect(getByText('Step 2 of 3')).toBeTruthy();
    });

    // Step 5: Tap "Next"
    fireEvent.press(getByTestId('onboarding-next-button'));

    // Step 6: On screen 3, enter master password
    await waitFor(() => {
      expect(getByText('Secure Your Data')).toBeTruthy();
      expect(getByText('Step 3 of 3')).toBeTruthy();
    });

    const passwordInput = getByTestId('master-password-input');
    fireEvent.changeText(passwordInput, 'SecurePass123!');

    // Step 7: Confirm password
    const confirmInput = getByTestId('confirm-password-input');
    fireEvent.changeText(confirmInput, 'SecurePass123!');

    // Expected Result: Password strength meter shows "Strong" (green)
    await waitFor(() => {
      const strengthMeter = getByTestId('password-strength-meter');
      expect(strengthMeter.props.accessibilityLabel).toMatch(/Strong/i);
    });

    // Step 8: Enable biometric unlock
    const biometricToggle = getByTestId('biometric-toggle');
    fireEvent(biometricToggle, 'onValueChange', true);

    // Step 9: Tap "Get Started"
    const getStartedButton = getByTestId('get-started-button');
    expect(getStartedButton.props.disabled).toBe(false);
    
    fireEvent.press(getStartedButton);

    // Expected Result: Master password stored securely (hashed with PBKDF2)
    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'master_password_hash',
        expect.any(String)
      );
    });

    // Expected Result: Vault encryption key derived
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'vault_encryption_key',
      expect.any(String)
    );

    // Expected Result: Biometric key stored in system keychain
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'biometric_enabled',
      'true'
    );

    // Step 11: Navigate to Task List (empty state)
    await waitFor(() => {
      expect(getByTestId('task-list-screen')).toBeTruthy();
      expect(getByText('No tasks yet. Tap + to create your first task.')).toBeTruthy();
    });

    // Step 13: Tap "+ Add"
    const addButton = getByTestId('add-task-button');
    fireEvent.press(addButton);

    // Expected Result: Navigate to Add Task screen
    await waitFor(() => {
      expect(getByTestId('add-task-screen')).toBeTruthy();
    });

    // Create first task
    fireEvent.changeText(getByTestId('task-title-input'), 'My First Task');
    fireEvent.press(getByTestId('create-task-button'));

    // Expected Result: First task creation successful
    await waitFor(() => {
      expect(getByText('Task created successfully')).toBeTruthy();
    });
  });

  test('accessibility: stepper announces progress', () => {
    const { getByTestId } = render(<OnboardingFlow />);
    
    const stepper = getByTestId('onboarding-stepper');
    expect(stepper.props.accessibilityLabel).toMatch(/Step 1 of 3/i);
  });

  test('accessibility: password requirements read before input', () => {
    const { getByTestId } = render(<OnboardingFlow currentScreen={3} />);
    
    const requirements = getByTestId('password-requirements');
    expect(requirements.props.accessibilityLabel).toMatch(/8 or more characters/i);
    expect(requirements.props.accessibilityLabel).toMatch(/1 number/i);
    expect(requirements.props.accessibilityLabel).toMatch(/1 special character/i);
  });

  test('accessibility: Get Started button disabled state announced', () => {
    const { getByTestId } = render(<OnboardingFlow currentScreen={3} />);
    
    const getStartedButton = getByTestId('get-started-button');
    expect(getStartedButton.props.disabled).toBe(true);
    expect(getStartedButton.props.accessibilityLabel).toMatch(/disabled/i);
  });

  test('mock biometric prompts auto-approve', async () => {
    const mockBiometric = require('expo-local-authentication');
    
    const result = await mockBiometric.authenticateAsync();
    expect(result.success).toBe(true);
  });

  test('vault encryption key exists in secure storage', async () => {
    const { getByTestId } = render(<OnboardingFlow currentScreen={3} />);
    
    fireEvent.changeText(getByTestId('master-password-input'), 'SecurePass123!');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'SecurePass123!');
    fireEvent.press(getByTestId('get-started-button'));

    await waitFor(() => {
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'vault_encryption_key',
        expect.stringMatching(/^[A-Za-z0-9+/=]+$/) // Base64 pattern
      );
    });
  });

  test('password validation: weak password shows warning', () => {
    const { getByTestId } = render(<OnboardingFlow currentScreen={3} />);
    
    const passwordInput = getByTestId('master-password-input');
    fireEvent.changeText(passwordInput, 'weak');

    const strengthMeter = getByTestId('password-strength-meter');
    expect(strengthMeter.props.accessibilityLabel).toMatch(/weak/i);
    
    // Get Started button should remain disabled
    expect(getByTestId('get-started-button').props.disabled).toBe(true);
  });

  test('password validation: passwords must match', () => {
    const { getByTestId, getByText } = render(<OnboardingFlow currentScreen={3} />);
    
    fireEvent.changeText(getByTestId('master-password-input'), 'SecurePass123!');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'DifferentPass123!');

    expect(getByText("Passwords don't match")).toBeTruthy();
    expect(getByTestId('get-started-button').props.disabled).toBe(true);
  });
});
