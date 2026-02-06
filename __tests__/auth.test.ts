/**
 * OpenClaw Mobile - Auth Store Tests
 * Tests for passphrase setup, verification, and lockout
 */

import { renderHook, act } from '@testing-library/react-native';

// Mock expo modules
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  getEnrolledLevelAsync: jest.fn(() => Promise.resolve(2)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2 },
  SecurityLevel: { BIOMETRIC_STRONG: 2 },
}));

jest.mock('expo-crypto', () => ({
  digestStringAsync: jest.fn((algo, str) => Promise.resolve(`hash_${str.substring(0, 10)}`)),
  getRandomBytesAsync: jest.fn((len) => Promise.resolve(new Uint8Array(len).fill(42))),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
}));

// Import after mocks
import { useAuthStore } from '../src/store/auth';
import * as SecureStore from 'expo-secure-store';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      isUnlocked: false,
      isSetup: false,
      biometricAvailable: false,
      biometricEnabled: false,
      lastActivity: Date.now(),
      encryptionKey: null,
      failedAttempts: 0,
      lockoutUntil: null,
    });
    
    // Clear mocks
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should detect when passphrase is not set up', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      
      await useAuthStore.getState().initialize();
      
      expect(useAuthStore.getState().isSetup).toBe(false);
    });

    it('should detect when passphrase is set up', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('some_hash');
      
      await useAuthStore.getState().initialize();
      
      expect(useAuthStore.getState().isSetup).toBe(true);
    });
  });

  describe('setupPassphrase', () => {
    it('should set up passphrase and unlock', async () => {
      const result = await useAuthStore.getState().setupPassphrase('testpassphrase123');
      
      expect(result).toBe(true);
      expect(useAuthStore.getState().isSetup).toBe(true);
      expect(useAuthStore.getState().isUnlocked).toBe(true);
      expect(useAuthStore.getState().encryptionKey).toBeTruthy();
    });

    it('should store hash and salt in SecureStore', async () => {
      await useAuthStore.getState().setupPassphrase('testpassphrase123');
      
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'openclaw_passphrase_salt',
        expect.any(String)
      );
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'openclaw_passphrase_hash',
        expect.any(String)
      );
    });
  });

  describe('verifyPassphrase', () => {
    beforeEach(async () => {
      // Set up a passphrase first
      (SecureStore.getItemAsync as jest.Mock)
        .mockImplementation((key) => {
          if (key === 'openclaw_passphrase_salt') return Promise.resolve('test_salt');
          if (key === 'openclaw_passphrase_hash') return Promise.resolve('hash_testpassp');
          return Promise.resolve(null);
        });
    });

    it('should unlock with correct passphrase', async () => {
      const result = await useAuthStore.getState().verifyPassphrase('testpassphrase123');
      
      expect(result.success).toBe(true);
      expect(useAuthStore.getState().isUnlocked).toBe(true);
    });

    it('should fail with incorrect passphrase', async () => {
      const result = await useAuthStore.getState().verifyPassphrase('wrongpassword');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('attempt');
      expect(useAuthStore.getState().isUnlocked).toBe(false);
    });

    it('should track failed attempts', async () => {
      await useAuthStore.getState().verifyPassphrase('wrong1');
      expect(useAuthStore.getState().failedAttempts).toBe(1);
      
      await useAuthStore.getState().verifyPassphrase('wrong2');
      expect(useAuthStore.getState().failedAttempts).toBe(2);
    });

    it('should lockout after 5 failed attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await useAuthStore.getState().verifyPassphrase('wrong');
      }
      
      expect(useAuthStore.getState().lockoutUntil).toBeTruthy();
      
      const result = await useAuthStore.getState().verifyPassphrase('testpassphrase123');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many failed attempts');
    });

    it('should reset failed attempts on successful login', async () => {
      await useAuthStore.getState().verifyPassphrase('wrong1');
      await useAuthStore.getState().verifyPassphrase('wrong2');
      expect(useAuthStore.getState().failedAttempts).toBe(2);
      
      await useAuthStore.getState().verifyPassphrase('testpassphrase123');
      expect(useAuthStore.getState().failedAttempts).toBe(0);
    });
  });

  describe('lock', () => {
    it('should lock the app and clear encryption key', async () => {
      // Setup and unlock first
      await useAuthStore.getState().setupPassphrase('test');
      expect(useAuthStore.getState().isUnlocked).toBe(true);
      
      // Lock
      useAuthStore.getState().lock();
      
      expect(useAuthStore.getState().isUnlocked).toBe(false);
      expect(useAuthStore.getState().encryptionKey).toBeNull();
    });
  });

  describe('autoLock', () => {
    it('should auto-lock after inactivity period', () => {
      useAuthStore.setState({
        isUnlocked: true,
        lastActivity: Date.now() - (6 * 60 * 1000), // 6 minutes ago
      });
      
      useAuthStore.getState().checkAutoLock();
      
      expect(useAuthStore.getState().isUnlocked).toBe(false);
    });

    it('should not auto-lock if recently active', () => {
      useAuthStore.setState({
        isUnlocked: true,
        lastActivity: Date.now() - (2 * 60 * 1000), // 2 minutes ago
      });
      
      useAuthStore.getState().checkAutoLock();
      
      expect(useAuthStore.getState().isUnlocked).toBe(true);
    });
  });
});
