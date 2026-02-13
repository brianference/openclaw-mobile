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
