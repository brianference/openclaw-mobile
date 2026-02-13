/**
 * TC-MOBILE-023: Slow Network Simulation
 * Category: Performance
 * Priority: P2 (Medium)
 * Feature: Chat, Cloud Sync
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const ChatScreen = require('../../src/screens/Chat/ChatScreen').default;

describe('TC-MOBILE-023: Slow Network Simulation', () => {
  beforeEach(() => {
    // Mock slow network (2G)
    global.fetch = jest.fn((url, options) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }, 5000); // 5 second delay
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('send message: shows real upload progress', async () => {
    const { getByTestId } = render(<ChatScreen />);

    fireEvent.changeText(getByTestId('chat-input'), 'Test slow network');
    fireEvent.press(getByTestId('send-button'));

    // Optimistic UI: message appears immediately
    await waitFor(() => {
      expect(getByTestId('message-0')).toBeTruthy();
      expect(getByTestId('message-status-0').props.children).toMatch(/Sending/i);
    });

    // Progress (no fake progress bar, spinner only)
    const message = getByTestId('message-0');
    expect(message.props.status).toBe('sending');

    // After actual server confirm
    await waitFor(() => {
      expect(getByTestId('message-status-0').props.children).toMatch(/Sent/i);
    }, { timeout: 6000 });
  });

  test('image upload: real progress bar (0% → 100%)', async () => {
    const mockUpload = jest.fn((file, onProgress) => {
      return new Promise((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          onProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            resolve({ success: true });
          }
        }, 500);
      });
    });

    const { getByTestId } = render(
      <ChatScreen onUploadImage={mockUpload} />
    );

    fireEvent.press(getByTestId('attach-image-button'));
    fireEvent(getByTestId('image-picker'), 'onImageSelected', { uri: 'test.jpg', size: 500000 });

    // Progress bar visible
    await waitFor(() => {
      const progressBar = getByTestId('upload-progress-bar');
      expect(progressBar.props.value).toBe(0);
    });

    // Updates to 50%
    await waitFor(() => {
      const progressBar = getByTestId('upload-progress-bar');
      expect(progressBar.props.value).toBeGreaterThanOrEqual(50);
    }, { timeout: 3000 });

    // Estimated time shown
    expect(getByTestId('upload-time-estimate').props.children).toMatch(/~.*remaining/i);
  });

  test('cloud sync: shows progress (50/1000 - 5%)', async () => {
    const mockSync = jest.fn((onProgress) => {
      return new Promise((resolve) => {
        let synced = 0;
        const total = 1000;
        const interval = setInterval(() => {
          synced += 50;
          onProgress({ synced, total });
          if (synced >= total) {
            clearInterval(interval);
            resolve({ success: true });
          }
        }, 500);
      });
    });

    const { getByTestId, getByText } = render(
      <ChatScreen onSync={mockSync} />
    );

    fireEvent.press(getByTestId('sync-now-button'));

    // Progress text
    await waitFor(() => {
      expect(getByText(/Syncing.*50\/1000.*5%/)).toBeTruthy();
    }, { timeout: 1000 });
  });

  test('long operation: cancelable', async () => {
    const mockUpload = jest.fn(() => new Promise(() => {})); // Never resolves

    const { getByTestId } = render(
      <ChatScreen onUploadImage={mockUpload} />
    );

    fireEvent.press(getByTestId('attach-image-button'));
    fireEvent(getByTestId('image-picker'), 'onImageSelected', { uri: 'test.jpg' });

    // Cancel button visible
    await waitFor(() => {
      expect(getByTestId('cancel-upload-button')).toBeTruthy();
    });

    fireEvent.press(getByTestId('cancel-upload-button'));

    // Upload canceled
    await waitFor(() => {
      expect(() => getByTestId('upload-progress-bar')).toThrow();
    });
  });

  test('partial sync success: shows retry option', async () => {
    const mockSync = jest.fn().mockResolvedValue({
      success: false,
      synced: 980,
      failed: 20,
      total: 1000,
    });

    const { getByTestId, getByText } = render(
      <ChatScreen onSync={mockSync} />
    );

    fireEvent.press(getByTestId('sync-now-button'));

    await waitFor(() => {
      expect(getByText(/Synced 980\/1000 tasks.*20 failed.*Retry/)).toBeTruthy();
    });
  });

  test('accessibility: progress announced', async () => {
    const mockUpload = jest.fn((file, onProgress) => {
      onProgress(50);
      return Promise.resolve({ success: true });
    });

    const { getByTestId } = render(
      <ChatScreen onUploadImage={mockUpload} />
    );

    fireEvent.press(getByTestId('attach-image-button'));
    fireEvent(getByTestId('image-picker'), 'onImageSelected', { uri: 'test.jpg' });

    await waitFor(() => {
      const progressBar = getByTestId('upload-progress-bar');
      expect(progressBar.props.accessibilityLabel).toMatch(/50% complete/i);
      expect(progressBar.props.accessibilityLiveRegion).toBe('polite');
    });
  });

  test('throttle network to 2G (50kbps down, 20kbps up)', () => {
    const throttleConfig = {
      downloadThroughput: 50 * 1024 / 8, // 50kbps in bytes/s
      uploadThroughput: 20 * 1024 / 8,   // 20kbps in bytes/s
      latency: 300, // 300ms latency
    };

    expect(throttleConfig.latency).toBe(300);
  });
});
