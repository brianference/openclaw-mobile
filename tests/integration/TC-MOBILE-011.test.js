/**
 * TC-MOBILE-011: Vault Decryption Failure
 * Category: Error Handling
 * Priority: P0 (Critical)
 * Feature: Encrypted Vault
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const VaultContentsScreen = require('../../src/screens/Vault/VaultContentsScreen').default;

describe('TC-MOBILE-011: Vault Decryption Failure', () => {
  let mockDecrypt;

  beforeEach(() => {
    mockDecrypt = jest.fn();
  });

  test('should show error modal on decryption failure', async () => {
    // Simulate corrupted data
    mockDecrypt.mockRejectedValue(new Error('Decryption failed'));

    const { getByTestId, getByText } = render(
      <VaultContentsScreen 
        secrets={[
          { id: '1', title: 'GitHub Login', encryptedData: 'corrupted_base64' }
        ]}
        onDecrypt={mockDecrypt}
      />
    );

    // Step 2: Tap secret to view
    const secretCard = getByTestId('secret-item-0');
    fireEvent.press(secretCard);

    // Expected Result: Loading spinner appears
    await waitFor(() => {
      expect(getByTestId('decryption-spinner')).toBeTruthy();
    });

    // Expected Result: After 2s timeout, error modal
    await waitFor(() => {
      expect(getByText('Decryption Failed')).toBeTruthy();
      expect(getByText('Unable to decrypt this secret. Data may be corrupted.')).toBeTruthy();
    }, { timeout: 2000 });

    // Modal actions present
    expect(getByText('Try Again')).toBeTruthy();
    expect(getByText('Report Issue')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  test('should retry decryption on "Try Again"', async () => {
    mockDecrypt.mockRejectedValueOnce(new Error('Decryption failed'));
    mockDecrypt.mockResolvedValueOnce({ username: 'test', password: 'pass' });

    const { getByTestId, getByText } = render(
      <VaultContentsScreen 
        secrets={[{ id: '1', title: 'Test Secret', encryptedData: 'data' }]}
        onDecrypt={mockDecrypt}
      />
    );

    fireEvent.press(getByTestId('secret-item-0'));

    await waitFor(() => {
      expect(getByText('Decryption Failed')).toBeTruthy();
    });

    // Tap Try Again
    fireEvent.press(getByText('Try Again'));

    // Expected Result: Re-attempts decryption
    await waitFor(() => {
      expect(mockDecrypt).toHaveBeenCalledTimes(2);
    });

    // Expected Result: Success on second attempt
    await waitFor(() => {
      expect(getByTestId('secret-detail-screen')).toBeTruthy();
    });
  });

  test('should handle mid-reveal decryption error', async () => {
    mockDecrypt.mockRejectedValue(new Error('Decryption failed'));

    const { getByTestId, getByText } = render(
      <VaultContentsScreen 
        secrets={[{ id: '1', title: 'Test', encrypted: true }]}
        onDecrypt={mockDecrypt}
      />
    );

    // Tap reveal password button
    const revealButton = getByTestId('reveal-password-button-0');
    fireEvent.press(revealButton);

    // Expected Result: Reveal button shows spinner
    await waitFor(() => {
      expect(getByTestId('reveal-spinner')).toBeTruthy();
    });

    // Expected Result: Error toast
    await waitFor(() => {
      expect(getByText('Unable to reveal password. Try again.')).toBeTruthy();
    });

    // Expected Result: Password remains hidden
    const passwordField = getByTestId('password-field-0');
    expect(passwordField.props.children).toMatch(/•+/);
  });

  test('accessibility: error modal has focus trap', async () => {
    mockDecrypt.mockRejectedValue(new Error('Decryption failed'));

    const { getByTestId } = render(
      <VaultContentsScreen 
        secrets={[{ id: '1', title: 'Test' }]}
        onDecrypt={mockDecrypt}
      />
    );

    fireEvent.press(getByTestId('secret-item-0'));

    await waitFor(() => {
      const modal = getByTestId('decryption-error-modal');
      expect(modal.props.accessibilityViewIsModal).toBe(true);
    });
  });

  test('accessibility: error announced clearly', async () => {
    mockDecrypt.mockRejectedValue(new Error('Decryption failed'));

    const { getByTestId } = render(
      <VaultContentsScreen 
        secrets={[{ id: '1', title: 'Test' }]}
        onDecrypt={mockDecrypt}
      />
    );

    fireEvent.press(getByTestId('secret-item-0'));

    await waitFor(() => {
      const modalTitle = getByTestId('error-modal-title');
      expect(modalTitle.props.accessibilityRole).toBe('alert');
      expect(modalTitle.props.accessibilityLabel).toMatch(/Alert.*Decryption Failed/i);
    });
  });

  test('security: no plaintext data in DOM on error', async () => {
    mockDecrypt.mockRejectedValue(new Error('Decryption failed'));

    const { queryByText, getByTestId } = render(
      <VaultContentsScreen 
        secrets={[{ id: '1', title: 'Test', encryptedData: 'U2FsdGVk...' }]}
        onDecrypt={mockDecrypt}
      />
    );

    fireEvent.press(getByTestId('secret-item-0'));

    await waitFor(() => {
      expect(queryByText('Decryption Failed')).toBeTruthy();
    });

    // Verify no decrypted content visible
    expect(queryByText('password')).toBeNull();
    expect(queryByText('username')).toBeNull();
  });

  test('security: error does not leak key material', async () => {
    const consoleSpy = jest.spyOn(console, 'error');
    mockDecrypt.mockRejectedValue(new Error('Decryption failed: Invalid key'));

    const { getByTestId } = render(
      <VaultContentsScreen 
        secrets={[{ id: '1', title: 'Test' }]}
        onDecrypt={mockDecrypt}
      />
    );

    fireEvent.press(getByTestId('secret-item-0'));

    await waitFor(() => {
      expect(getByTestId('decryption-error-modal')).toBeTruthy();
    });

    // Verify console errors don't contain key material
    consoleSpy.mock.calls.forEach(call => {
      const errorString = call.join(' ');
      expect(errorString).not.toMatch(/key|secret|password/i);
    });

    consoleSpy.mockRestore();
  });

  test('inject corrupted base64 data', () => {
    const corruptedData = 'NOT_VALID_BASE64!!!';
    
    expect(() => {
      atob(corruptedData);
    }).toThrow();
  });

  test('mock crypto.decrypt to throw error', async () => {
    const mockCrypto = {
      decrypt: jest.fn().mockRejectedValue(new Error('Crypto error')),
    };

    await expect(mockCrypto.decrypt('data')).rejects.toThrow('Crypto error');
  });
});
