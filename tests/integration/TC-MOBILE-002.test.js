/**
 * TC-MOBILE-002: Vault Secret Creation & Encryption
 * Category: Happy Path
 * Priority: P0 (Critical)
 * Feature: Encrypted Vault
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { mockPasswordGenerator } from '../fixtures/vault';

const AddSecretScreen = require('../../src/screens/Vault/AddSecretScreen').default;

describe('TC-MOBILE-002: Vault Secret Creation & Encryption', () => {
  let mockEncrypt;
  let mockSaveSecret;

  beforeEach(() => {
    mockEncrypt = jest.fn().mockResolvedValue({
      encryptedData: 'U2FsdGVkX1/...',
      iv: 'abc123',
      authTag: 'xyz789',
    });
    mockSaveSecret = jest.fn().mockResolvedValue({ success: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create encrypted login with generated password', async () => {
    const { getByTestId, getByText } = render(
      <AddSecretScreen 
        onEncrypt={mockEncrypt}
        onSaveSecret={mockSaveSecret}
      />
    );

    // Step 2: Select secret type: Login
    const loginTypeButton = getByTestId('secret-type-login');
    fireEvent.press(loginTypeButton);

    // Step 3: Enter title
    const titleInput = getByTestId('secret-title-input');
    fireEvent.changeText(titleInput, 'GitHub');

    // Step 4: Enter username
    const usernameInput = getByTestId('username-input');
    fireEvent.changeText(usernameInput, 'brianference');

    // Step 5: Tap Generate password button
    const generateButton = getByTestId('generate-password-button');
    fireEvent.press(generateButton);

    // Step 6: In generator sheet
    await waitFor(() => {
      expect(getByTestId('password-generator-sheet')).toBeTruthy();
    });

    // Set length: 16
    const lengthSlider = getByTestId('password-length-slider');
    fireEvent(lengthSlider, 'onValueChange', 16);

    // All options enabled by default - verify
    expect(getByTestId('option-uppercase').props.value).toBe(true);
    expect(getByTestId('option-lowercase').props.value).toBe(true);
    expect(getByTestId('option-numbers').props.value).toBe(true);
    expect(getByTestId('option-symbols').props.value).toBe(true);

    // Tap Use Password
    const usePasswordButton = getByTestId('use-password-button');
    fireEvent.press(usePasswordButton);

    // Expected Result: Password generator shows strength
    await waitFor(() => {
      const strengthMeter = getByTestId('password-strength-meter');
      expect(strengthMeter.props.accessibilityLabel).toMatch(/Strong/i);
      // Green bar, 8/10 segments
      expect(strengthMeter.props.value).toBeGreaterThanOrEqual(0.8);
    });

    // Step 7: Enter URL
    const urlInput = getByTestId('url-input');
    fireEvent.changeText(urlInput, 'github.com');

    // Step 8: Tap Save Secret button
    const saveButton = getByTestId('save-secret-button');
    fireEvent.press(saveButton);

    // Expected Result: Encryption happens (AES-256-GCM)
    await waitFor(() => {
      expect(mockEncrypt).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'brianference',
          password: expect.stringMatching(/^[A-Za-z0-9!@#$]{16}$/),
          url: 'github.com',
        })
      );
    }, { timeout: 2000 });

    // Expected Result: Toast shows success
    await waitFor(() => {
      expect(getByText('Secret saved successfully')).toBeTruthy();
    });
  });

  test('password reveal auto-hides after 10 seconds', async () => {
    jest.useFakeTimers();
    
    const { getByTestId } = render(
      <AddSecretScreen 
        initialSecret={{
          username: 'testuser',
          password: 'Test123!@#',
        }}
      />
    );

    const revealButton = getByTestId('reveal-password-button');
    
    // Initial state: hidden
    expect(getByTestId('password-input').props.secureTextEntry).toBe(true);
    expect(revealButton.props.accessibilityLabel).toMatch(/Hidden/i);

    // Tap to reveal
    fireEvent.press(revealButton);
    
    expect(getByTestId('password-input').props.secureTextEntry).toBe(false);
    expect(revealButton.props.accessibilityLabel).toMatch(/revealed.*10 seconds/i);

    // After 10 seconds, auto-hide
    jest.advanceTimersByTime(10000);
    
    await waitFor(() => {
      expect(getByTestId('password-input').props.secureTextEntry).toBe(true);
    });

    jest.useRealTimers();
  });

  test('accessibility: password field announced as secure', () => {
    const { getByTestId } = render(<AddSecretScreen />);
    
    const passwordInput = getByTestId('password-input');
    expect(passwordInput.props.secureTextEntry).toBe(true);
    expect(passwordInput.props.accessibilityLabel).toMatch(/secure/i);
  });

  test('accessibility: reveal button announces state changes', () => {
    const { getByTestId } = render(<AddSecretScreen />);
    
    const revealButton = getByTestId('reveal-password-button');
    expect(revealButton.props.accessibilityRole).toBe('button');
    expect(revealButton.props.accessibilityLabel).toBeDefined();
  });

  test('security: never logs actual password in test output', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    const { getByTestId } = render(<AddSecretScreen />);
    
    fireEvent.changeText(getByTestId('password-input'), 'SuperSecret123!');
    
    // Verify password not in any console logs
    consoleSpy.mock.calls.forEach(call => {
      expect(call.join('')).not.toMatch(/SuperSecret123/);
    });
    
    consoleSpy.mockRestore();
  });

  test('validation: save button disabled when password empty', () => {
    const { getByTestId } = render(<AddSecretScreen />);
    
    fireEvent.changeText(getByTestId('secret-title-input'), 'Test');
    fireEvent.changeText(getByTestId('username-input'), 'user');
    
    const saveButton = getByTestId('save-secret-button');
    expect(saveButton.props.disabled).toBe(true);
  });

  test('password strength meter updates in real-time', () => {
    const { getByTestId } = render(<AddSecretScreen />);
    
    const passwordInput = getByTestId('password-input');
    const strengthMeter = getByTestId('password-strength-meter');

    // Weak password
    fireEvent.changeText(passwordInput, 'a');
    expect(strengthMeter.props.accessibilityLabel).toMatch(/weak/i);
    
    // Medium password
    fireEvent.changeText(passwordInput, 'Password1');
    expect(strengthMeter.props.accessibilityLabel).toMatch(/medium/i);
    
    // Strong password
    fireEvent.changeText(passwordInput, 'P@ssw0rd!123');
    expect(strengthMeter.props.accessibilityLabel).toMatch(/strong/i);
  });

  test('generated password matches pattern', () => {
    const { getByTestId } = render(<AddSecretScreen />);
    
    fireEvent.press(getByTestId('generate-password-button'));
    
    const generatedPassword = getByTestId('generated-password-preview').props.children;
    
    // Should match: 16 chars, mixed case, numbers, symbols
    expect(generatedPassword).toMatch(/^[A-Za-z0-9!@#$]{16}$/);
  });
});
