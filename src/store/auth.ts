/**
 * OpenClaw Mobile - Auth Store
 * Manages passphrase and biometric authentication
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';

// ============================================
// Constants
// ============================================

const PASSPHRASE_HASH_KEY = 'openclaw_passphrase_hash';
const PASSPHRASE_SALT_KEY = 'openclaw_passphrase_salt';
const BIOMETRIC_ENABLED_KEY = 'openclaw_biometric_enabled';
const ENCRYPTION_KEY_KEY = 'openclaw_encryption_key';

// Auto-lock after 5 minutes of inactivity
const AUTO_LOCK_MS = 5 * 60 * 1000;

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
  
  // Actions
  initialize: () => Promise<void>;
  setupPassphrase: (passphrase: string) => Promise<boolean>;
  verifyPassphrase: (passphrase: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  enableBiometric: (enable: boolean) => Promise<void>;
  lock: () => void;
  updateActivity: () => void;
  checkAutoLock: () => void;
  getEncryptionKey: () => string | null;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  isUnlocked: false,
  isSetup: false,
  biometricAvailable: false,
  biometricEnabled: false,
  lastActivity: Date.now(),
  encryptionKey: null,
  
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
      console.error('Auth initialization error:', error);
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
      console.error('Passphrase setup error:', error);
      return false;
    }
  },
  
  /**
   * Verify passphrase and unlock
   */
  verifyPassphrase: async (passphrase) => {
    try {
      const salt = await SecureStore.getItemAsync(PASSPHRASE_SALT_KEY);
      const storedHash = await SecureStore.getItemAsync(PASSPHRASE_HASH_KEY);
      
      if (!salt || !storedHash) {
        return false;
      }
      
      const hash = await hashPassphrase(passphrase, salt);
      
      if (hash === storedHash) {
        const encryptionKey = await deriveEncryptionKey(passphrase, salt);
        set({ 
          isUnlocked: true, 
          encryptionKey,
          lastActivity: Date.now(),
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Passphrase verification error:', error);
      return false;
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
      console.error('Biometric auth error:', error);
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
