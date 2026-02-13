import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  hashPassword,
  verifyPassword,
  deriveKeyFromPassword,
  getUserSalt,
  encrypt,
  decrypt,
} from '../lib/crypto';

export type SecretType = 'login' | 'card' | 'key' | 'note';

export interface VaultSecret {
  id: string;
  type: SecretType;
  name: string;
  // Login
  username?: string;
  password?: string;
  url?: string;
  // Card
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  // Key
  apiKey?: string;
  // Note
  note?: string;
  // Common
  tags?: string[];
  favorite?: boolean;
  createdAt: string;
  updatedAt: string;
  lastAccessed?: string;
}

export interface VaultSettings {
  autoLockTimeout: number; // minutes (0 = never, 1, 5, 15, 30)
  biometricEnabled: boolean;
  requirePassword: boolean;
}

interface VaultState {
  secrets: VaultSecret[];
  isUnlocked: boolean;
  isLoading: boolean;
  settings: VaultSettings;
  failedAttempts: number;
  lockoutUntil: number | null; // timestamp
  encryptionKey: string | null; // Derived from password, not persisted
  
  // Authentication
  unlock: (password: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  lock: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  
  // CRUD operations
  fetchSecrets: () => Promise<void>;
  addSecret: (secret: Omit<VaultSecret, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSecret: (secretId: string, updates: Partial<VaultSecret>) => Promise<void>;
  deleteSecret: (secretId: string) => Promise<void>;
  
  // Security
  updateSettings: (settings: Partial<VaultSettings>) => void;
  recordAccess: (secretId: string) => void;
  rotateEncryption: () => Promise<void>;
  
  // Audit
  getWeakPasswords: () => VaultSecret[];
  getReusedPasswords: () => VaultSecret[];
  getSecurityScore: () => number;
  
  // Search & filter
  searchSecrets: (query: string) => VaultSecret[];
  getSecretsByType: (type: SecretType | 'all') => VaultSecret[];
}

const DEFAULT_SETTINGS: VaultSettings = {
  autoLockTimeout: 5,
  biometricEnabled: false,
  requirePassword: true,
};

export const useVaultStore = create<VaultState>()(
  persist(
    (set, get) => ({
      secrets: [],
      isUnlocked: false,
      isLoading: false,
      settings: DEFAULT_SETTINGS,
      failedAttempts: 0,
      lockoutUntil: null,
      encryptionKey: null,

      unlock: async (password) => {
        const { lockoutUntil, failedAttempts } = get();
        
        // Check lockout
        if (lockoutUntil && Date.now() < lockoutUntil) {
          return false;
        }

        // Verify password using PBKDF2 hashing
        try {
          const storedPasswordHash = await SecureStore.getItemAsync('vault_password_hash');
          
          if (!storedPasswordHash) {
            // First time setup - hash and store password
            const hash = await hashPassword(password);
            await SecureStore.setItemAsync('vault_password_hash', hash);
            
            // Derive encryption key
            const salt = await getUserSalt();
            const encryptionKey = await deriveKeyFromPassword(password, salt);
            
            set({ 
              isUnlocked: true, 
              failedAttempts: 0, 
              lockoutUntil: null,
              encryptionKey,
            });
            return true;
          }

          // Verify password
          const isValid = await verifyPassword(password, storedPasswordHash);
          
          if (isValid) {
            // Derive encryption key
            const salt = await getUserSalt();
            const encryptionKey = await deriveKeyFromPassword(password, salt);
            
            set({ 
              isUnlocked: true, 
              failedAttempts: 0, 
              lockoutUntil: null,
              encryptionKey,
            });
            return true;
          } else {
            const newAttempts = failedAttempts + 1;
            if (newAttempts >= 5) {
              // Lock for 5 minutes
              set({
                failedAttempts: newAttempts,
                lockoutUntil: Date.now() + 5 * 60 * 1000,
              });
            } else {
              set({ failedAttempts: newAttempts });
            }
            return false;
          }
        } catch (error) {
          console.error('Unlock error:', error);
          return false;
        }
      },

      unlockWithBiometric: async () => {
        const { settings } = get();
        if (!settings.biometricEnabled) return false;

        try {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Unlock Vault',
            fallbackLabel: 'Use Password',
          });

          if (result.success) {
            // Retrieve stored password hash and derive key
            // Note: In production, store encrypted password separately for biometric unlock
            const storedPasswordHash = await SecureStore.getItemAsync('vault_password_hash');
            if (!storedPasswordHash) return false;
            
            // For now, we'll require password entry first to derive key
            // TODO: Store encrypted key separately for biometric unlock
            set({ isUnlocked: true, failedAttempts: 0, lockoutUntil: null });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Biometric unlock error:', error);
          return false;
        }
      },

      lock: () => {
        set({ isUnlocked: false, encryptionKey: null });
      },

      changePassword: async (oldPassword, newPassword) => {
        try {
          // Verify old password
          const storedPasswordHash = await SecureStore.getItemAsync('vault_password_hash');
          if (!storedPasswordHash) return false;
          
          const isValid = await verifyPassword(oldPassword, storedPasswordHash);
          if (!isValid) return false;

          // Hash new password
          const newHash = await hashPassword(newPassword);
          await SecureStore.setItemAsync('vault_password_hash', newHash);
          
          // Re-encrypt all secrets with new key
          const oldSalt = await getUserSalt();
          const oldKey = await deriveKeyFromPassword(oldPassword, oldSalt);
          const newKey = await deriveKeyFromPassword(newPassword, oldSalt);
          
          const { secrets } = get();
          const reencryptedSecrets = await Promise.all(
            secrets.map(async (secret) => {
              // Decrypt with old key
              const encryptedData = await SecureStore.getItemAsync(`vault_secret_${secret.id}`);
              if (!encryptedData) return secret;
              
              const decryptedData = await decrypt(encryptedData, oldKey);
              
              // Re-encrypt with new key
              const reencryptedData = await encrypt(decryptedData, newKey);
              await SecureStore.setItemAsync(`vault_secret_${secret.id}`, reencryptedData);
              
              return secret;
            })
          );
          
          set({ encryptionKey: newKey });
          return true;
        } catch (error) {
          console.error('Change password error:', error);
          return false;
        }
      },

      fetchSecrets: async () => {
        set({ isLoading: true });
        // In production, fetch encrypted secrets from Supabase
        // For now, secrets are persisted via middleware
        set({ isLoading: false });
      },

      addSecret: async (secretData) => {
        const { encryptionKey } = get();
        if (!encryptionKey) throw new Error('Vault is locked');
        
        const newSecret: VaultSecret = {
          ...secretData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Encrypt sensitive fields
        const sensitiveData = JSON.stringify({
          username: secretData.username,
          password: secretData.password,
          url: secretData.url,
          cardNumber: secretData.cardNumber,
          cardHolder: secretData.cardHolder,
          expiryDate: secretData.expiryDate,
          cvv: secretData.cvv,
          apiKey: secretData.apiKey,
          note: secretData.note,
        });
        
        const encryptedData = await encrypt(sensitiveData, encryptionKey);
        await SecureStore.setItemAsync(`vault_secret_${newSecret.id}`, encryptedData);

        // Store non-sensitive metadata in state
        const metadataSecret: VaultSecret = {
          id: newSecret.id,
          type: newSecret.type,
          name: newSecret.name,
          tags: newSecret.tags,
          favorite: newSecret.favorite,
          createdAt: newSecret.createdAt,
          updatedAt: newSecret.updatedAt,
          lastAccessed: newSecret.lastAccessed,
        };

        set((state) => ({
          secrets: [...state.secrets, metadataSecret],
        }));
      },

      updateSecret: async (secretId, updates) => {
        const { encryptionKey } = get();
        if (!encryptionKey) throw new Error('Vault is locked');
        
        // If updating sensitive fields, re-encrypt
        const hasSensitiveUpdates = 
          updates.username !== undefined ||
          updates.password !== undefined ||
          updates.url !== undefined ||
          updates.cardNumber !== undefined ||
          updates.cardHolder !== undefined ||
          updates.expiryDate !== undefined ||
          updates.cvv !== undefined ||
          updates.apiKey !== undefined ||
          updates.note !== undefined;
          
        if (hasSensitiveUpdates) {
          // Load existing encrypted data
          const existingEncrypted = await SecureStore.getItemAsync(`vault_secret_${secretId}`);
          if (existingEncrypted) {
            const existingData = JSON.parse(await decrypt(existingEncrypted, encryptionKey));
            
            // Merge with updates
            const updatedData = JSON.stringify({
              ...existingData,
              username: updates.username ?? existingData.username,
              password: updates.password ?? existingData.password,
              url: updates.url ?? existingData.url,
              cardNumber: updates.cardNumber ?? existingData.cardNumber,
              cardHolder: updates.cardHolder ?? existingData.cardHolder,
              expiryDate: updates.expiryDate ?? existingData.expiryDate,
              cvv: updates.cvv ?? existingData.cvv,
              apiKey: updates.apiKey ?? existingData.apiKey,
              note: updates.note ?? existingData.note,
            });
            
            // Re-encrypt
            const reencrypted = await encrypt(updatedData, encryptionKey);
            await SecureStore.setItemAsync(`vault_secret_${secretId}`, reencrypted);
          }
        }
        
        // Update metadata
        set((state) => ({
          secrets: state.secrets.map((secret) =>
            secret.id === secretId
              ? { 
                  ...secret, 
                  name: updates.name ?? secret.name,
                  tags: updates.tags ?? secret.tags,
                  favorite: updates.favorite ?? secret.favorite,
                  updatedAt: new Date().toISOString(),
                }
              : secret
          ),
        }));
      },

      deleteSecret: async (secretId) => {
        // Delete encrypted data from SecureStore
        await SecureStore.deleteItemAsync(`vault_secret_${secretId}`);
        
        // Remove from state
        set((state) => ({
          secrets: state.secrets.filter((secret) => secret.id !== secretId),
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      recordAccess: (secretId) => {
        set((state) => ({
          secrets: state.secrets.map((secret) =>
            secret.id === secretId
              ? { ...secret, lastAccessed: new Date().toISOString() }
              : secret
          ),
        }));
      },
      
      // Helper method to decrypt and retrieve full secret (not exported in interface)
      getDecryptedSecret: async (secretId: string): Promise<VaultSecret | null> => {
        const { encryptionKey, secrets } = get();
        if (!encryptionKey) throw new Error('Vault is locked');
        
        const metadata = secrets.find(s => s.id === secretId);
        if (!metadata) return null;
        
        try {
          const encryptedData = await SecureStore.getItemAsync(`vault_secret_${secretId}`);
          if (!encryptedData) return metadata;
          
          const decryptedData = JSON.parse(await decrypt(encryptedData, encryptionKey));
          
          return {
            ...metadata,
            ...decryptedData,
          };
        } catch (error) {
          console.error('Failed to decrypt secret:', error);
          return null;
        }
      },

      rotateEncryption: async () => {
        const { encryptionKey } = get();
        if (!encryptionKey) throw new Error('Vault is locked');
        
        // Generate new salt
        const newSalt = await getUserSalt();
        
        // Get current password (would need to be re-entered in production)
        const storedPasswordHash = await SecureStore.getItemAsync('vault_password_hash');
        if (!storedPasswordHash) throw new Error('No password found');
        
        // For now, we'll just log that rotation would happen
        // In production, user would need to re-enter password to derive new key
        console.log('Key rotation initiated - would re-encrypt all secrets with new salt');
      },

      getWeakPasswords: () => {
        const { secrets } = get();
        return secrets.filter((secret) => {
          if (secret.type === 'login' && secret.password) {
            return secret.password.length < 12; // Simple weak password check
          }
          return false;
        });
      },

      getReusedPasswords: () => {
        const { secrets } = get();
        const passwords = new Map<string, number>();
        
        secrets.forEach((secret) => {
          if (secret.type === 'login' && secret.password) {
            passwords.set(secret.password, (passwords.get(secret.password) || 0) + 1);
          }
        });

        return secrets.filter((secret) => {
          if (secret.type === 'login' && secret.password) {
            return (passwords.get(secret.password) || 0) > 1;
          }
          return false;
        });
      },

      getSecurityScore: () => {
        const { secrets } = get();
        if (secrets.length === 0) return 100;

        const weakPasswords = get().getWeakPasswords();
        const reusedPasswords = get().getReusedPasswords();
        
        const weakPenalty = (weakPasswords.length / secrets.length) * 30;
        const reusedPenalty = (reusedPasswords.length / secrets.length) * 30;
        
        return Math.max(0, Math.round(100 - weakPenalty - reusedPenalty));
      },

      searchSecrets: (query) => {
        const { secrets } = get();
        const lowerQuery = query.toLowerCase();
        return secrets.filter(
          (secret) =>
            secret.name.toLowerCase().includes(lowerQuery) ||
            secret.username?.toLowerCase().includes(lowerQuery) ||
            secret.url?.toLowerCase().includes(lowerQuery) ||
            secret.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      },

      getSecretsByType: (type) => {
        const { secrets } = get();
        if (type === 'all') return secrets;
        return secrets.filter((secret) => secret.type === type);
      },
    }),
    {
      name: 'vault-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Don't persist isUnlocked or encryptionKey for security
        // Secrets are stored as metadata only (encrypted data in SecureStore)
        secrets: state.secrets,
        settings: state.settings,
        failedAttempts: state.failedAttempts,
        lockoutUntil: state.lockoutUntil,
      }),
    }
  )
);
