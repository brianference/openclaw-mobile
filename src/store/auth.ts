/**
 * OpenClaw Mobile - Auth Store
 * Manages passphrase and biometric authentication
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import logger from '../utils/logger';

// ============================================
// Constants
// ============================================

const PASSPHRASE_HASH_KEY = 'openclaw_passphrase_hash';
const PASSPHRASE_SALT_KEY = 'openclaw_passphrase_salt';
const BIOMETRIC_ENABLED_KEY = 'openclaw_biometric_enabled';
const ENCRYPTION_KEY_KEY = 'openclaw_encryption_key';

// Auto-lock after 5 minutes of inactivity
const AUTO_LOCK_MS = 5 * 60 * 1000;

// Brute force protection
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// ============================================
// Crypto Utilities
// ============================================

/**
 * Generate a random salt for passphrase hashing
 */
async function generateSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash passphrase with salt using SHA-256
 * In production, use PBKDF2 or Argon2 for better security
 */
async function hashPassphrase(passphrase: string, salt: string): Promise<string> {
  const combined = passphrase + salt;
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined
  );
}

/**
 * Derive encryption key from passphrase
 * Used for encrypting vault items
 */
async function deriveEncryptionKey(passphrase: string, salt: string): Promise<string> {
  // Double hash for separate key derivation
  const firstHash = await hashPassphrase(passphrase, salt);
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    firstHash + 'encryption'
  );
}

// ============================================
// Auth Store
// ============================================

interface AuthState {
  isUnlocked: boolean;
  isSetup: boolean;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  lastActivity: number;
  encryptionKey: string | null;
  
  // Brute force protection
  failedAttempts: number;
  lockoutUntil: number | null;
  
  // Actions
  initialize: () => Promise<void>;
  setupPassphrase: (passphrase: string) => Promise<boolean>;
  verifyPassphrase: (passphrase: string) => Promise<{ success: boolean; error?: string }>;
  unlockWithBiometric: () => Promise<boolean>;
  enableBiometric: (enable: boolean) => Promise<void>;
  lock: () => void;
  updateActivity: () => void;
  checkAutoLock: () => void;
  getEncryptionKey: () => string | null;
  isLockedOut: () => boolean;
  getRemainingLockoutTime: () => number;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  isUnlocked: false,
  isSetup: false,
  biometricAvailable: false,
  biometricEnabled: false,
  lastActivity: Date.now(),
  encryptionKey: null,
  failedAttempts: 0,
  lockoutUntil: null,
  
  /**
   * Initialize auth state - check if passphrase is set up
   */
  initialize: async () => {
    try {
      // Check if passphrase hash exists
      const hash = await SecureStore.getItemAsync(PASSPHRASE_HASH_KEY);
      const isSetup = !!hash;
      
      // Check biometric availability
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const biometricAvailable = hasHardware && isEnrolled;
      
      // Check if biometric is enabled
      const biometricEnabledStr = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      const biometricEnabled = biometricEnabledStr === 'true' && biometricAvailable;
      
      set({ 
        isSetup, 
        biometricAvailable, 
        biometricEnabled,
      });
    } catch (error) {
      logger.error('Auth initialization error:', error);
    }
  },
  
  /**
   * Set up initial passphrase
   */
  setupPassphrase: async (passphrase) => {
    try {
      const salt = await generateSalt();
      const hash = await hashPassphrase(passphrase, salt);
      const encryptionKey = await deriveEncryptionKey(passphrase, salt);
      
      await SecureStore.setItemAsync(PASSPHRASE_SALT_KEY, salt);
      await SecureStore.setItemAsync(PASSPHRASE_HASH_KEY, hash);
      await SecureStore.setItemAsync(ENCRYPTION_KEY_KEY, encryptionKey);
      
      set({ 
        isSetup: true, 
        isUnlocked: true, 
        encryptionKey,
        lastActivity: Date.now(),
      });
      
      return true;
    } catch (error) {
      logger.error('Passphrase setup error:', error);
      return false;
    }
  },
  
  /**
   * Check if currently locked out
   */
  isLockedOut: () => {
    const { lockoutUntil } = get();
    if (!lockoutUntil) return false;
    if (Date.now() >= lockoutUntil) {
      // Lockout expired, reset
      set({ lockoutUntil: null, failedAttempts: 0 });
      return false;
    }
    return true;
  },
  
  /**
   * Get remaining lockout time in seconds
   */
  getRemainingLockoutTime: () => {
    const { lockoutUntil } = get();
    if (!lockoutUntil) return 0;
    const remaining = Math.max(0, lockoutUntil - Date.now());
    return Math.ceil(remaining / 1000);
  },
  
  /**
   * Verify passphrase and unlock
   * Includes brute force protection with lockout
   */
  verifyPassphrase: async (passphrase) => {
    // Check lockout
    if (get().isLockedOut()) {
      const remaining = get().getRemainingLockoutTime();
      const minutes = Math.ceil(remaining / 60);
      return { 
        success: false, 
        error: `Too many failed attempts. Try again in ${minutes} minute${minutes > 1 ? 's' : ''}.` 
      };
    }
    
    try {
      const salt = await SecureStore.getItemAsync(PASSPHRASE_SALT_KEY);
      const storedHash = await SecureStore.getItemAsync(PASSPHRASE_HASH_KEY);
      
      if (!salt || !storedHash) {
        return { success: false, error: 'Passphrase not set up' };
      }
      
      const hash = await hashPassphrase(passphrase, salt);
      
      if (hash === storedHash) {
        const encryptionKey = await deriveEncryptionKey(passphrase, salt);
        set({ 
          isUnlocked: true, 
          encryptionKey,
          lastActivity: Date.now(),
          failedAttempts: 0,
          lockoutUntil: null,
        });
        return { success: true };
      }
      
      // Failed attempt - increment counter
      const { failedAttempts } = get();
      const newAttempts = failedAttempts + 1;
      
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        // Trigger lockout
        set({ 
          failedAttempts: newAttempts, 
          lockoutUntil: Date.now() + LOCKOUT_DURATION_MS 
        });
        return { 
          success: false, 
          error: `Too many failed attempts. Locked out for 5 minutes.` 
        };
      }
      
      set({ failedAttempts: newAttempts });
      const remaining = MAX_FAILED_ATTEMPTS - newAttempts;
      return { 
        success: false, 
        error: `Incorrect passphrase. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.` 
      };
    } catch (error) {
      return { success: false, error: 'Verification failed' };
    }
  },
  
  /**
   * Unlock using biometric authentication
   */
  unlockWithBiometric: async () => {
    const { biometricEnabled, biometricAvailable } = get();
    
    if (!biometricEnabled || !biometricAvailable) {
      return false;
    }
    
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock OpenClaw',
        cancelLabel: 'Use Passphrase',
        disableDeviceFallback: true,
      });
      
      if (result.success) {
        // Retrieve stored encryption key
        const encryptionKey = await SecureStore.getItemAsync(ENCRYPTION_KEY_KEY);
        set({ 
          isUnlocked: true, 
          encryptionKey,
          lastActivity: Date.now(),
        });
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Biometric auth error:', error);
      return false;
    }
  },
  
  /**
   * Enable/disable biometric authentication
   */
  enableBiometric: async (enable) => {
    const { biometricAvailable } = get();
    
    if (!biometricAvailable && enable) {
      return;
    }
    
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enable ? 'true' : 'false');
    set({ biometricEnabled: enable });
  },
  
  /**
   * Lock the app
   */
  lock: () => {
    set({ 
      isUnlocked: false, 
      encryptionKey: null,
    });
  },
  
  /**
   * Update last activity timestamp
   */
  updateActivity: () => {
    set({ lastActivity: Date.now() });
  },
  
  /**
   * Check if should auto-lock based on inactivity
   */
  checkAutoLock: () => {
    const { lastActivity, isUnlocked } = get();
    
    if (isUnlocked && Date.now() - lastActivity > AUTO_LOCK_MS) {
      get().lock();
    }
  },
  
  /**
   * Get current encryption key (for vault operations)
   */
  getEncryptionKey: () => {
    return get().encryptionKey;
  },
}));
