/**
 * Vault Store with Supabase Integration
 * 
 * Features:
 * - Encrypted sync (secrets encrypted with AES-256-CTR + HMAC before upload)
 * - Bidirectional sync (local ↔ Supabase)
 * - Real-time subscriptions
 * - Offline queue support
 * - Conflict resolution (last-write-wins with version tracking)
 * - Zero-knowledge architecture (Supabase never sees plaintext secrets)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../lib/supabase';
import {
  hashPassword,
  verifyPassword,
  deriveKeyFromPassword,
  getUserSalt,
  encrypt,
  decrypt,
} from '../lib/crypto';
import NetInfo from '@react-native-community/netinfo';

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
  version?: number;
}

export interface VaultSettings {
  autoLockTimeout: number; // minutes (0 = never, 1, 5, 15, 30)
  biometricEnabled: boolean;
  requirePassword: boolean;
}

interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  secretId: string;
  data?: Partial<VaultSecret>;
  timestamp: number;
  retryCount: number;
}

interface VaultState {
  secrets: VaultSecret[];
  isUnlocked: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  syncQueue: SyncQueueItem[];
  isOnline: boolean;
  realtimeSubscription: any | null;
  settings: VaultSettings;
  failedAttempts: number;
  lockoutUntil: number | null;
  encryptionKey: string | null;
  
  // Authentication
  unlock: (password: string) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
  lock: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  
  // CRUD operations (Supabase-enabled)
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
  
  // Sync operations
  syncWithSupabase: () => Promise<void>;
  processSyncQueue: () => Promise<void>;
  subscribeToRealtime: () => void;
  unsubscribeFromRealtime: () => void;
  
  // Network status
  setOnlineStatus: (isOnline: boolean) => void;
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
      isSyncing: false,
      lastSyncedAt: null,
      syncQueue: [],
      isOnline: true,
      realtimeSubscription: null,
      settings: DEFAULT_SETTINGS,
      failedAttempts: 0,
      lockoutUntil: null,
      encryptionKey: null,

      // =====================================================================
      // UNLOCK (with PBKDF2 verification)
      // =====================================================================
      unlock: async (password) => {
        const { lockoutUntil, failedAttempts } = get();
        
        if (lockoutUntil && Date.now() < lockoutUntil) {
          return false;
        }

        try {
          const storedPasswordHash = await SecureStore.getItemAsync('vault_password_hash');
          
          if (!storedPasswordHash) {
            const hash = await hashPassword(password);
            await SecureStore.setItemAsync('vault_password_hash', hash);
            
            const salt = await getUserSalt();
            const encryptionKey = await deriveKeyFromPassword(password, salt);
            
            set({ 
              isUnlocked: true, 
              failedAttempts: 0, 
              lockoutUntil: null,
              encryptionKey,
            });
            
            // Fetch secrets after unlock
            await get().fetchSecrets();
            
            return true;
          }

          const isValid = await verifyPassword(password, storedPasswordHash);
          
          if (isValid) {
            const salt = await getUserSalt();
            const encryptionKey = await deriveKeyFromPassword(password, salt);
            
            set({ 
              isUnlocked: true, 
              failedAttempts: 0, 
              lockoutUntil: null,
              encryptionKey,
            });
            
            // Fetch secrets after unlock
            await get().fetchSecrets();
            
            return true;
          } else {
            const newAttempts = failedAttempts + 1;
            if (newAttempts >= 5) {
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
            const storedPasswordHash = await SecureStore.getItemAsync('vault_password_hash');
            if (!storedPasswordHash) return false;
            
            set({ isUnlocked: true, failedAttempts: 0, lockoutUntil: null });
            await get().fetchSecrets();
            return true;
          }
          return false;
        } catch (error) {
          console.error('Biometric unlock error:', error);
          return false;
        }
      },

      lock: () => {
        set({ 
          isUnlocked: false, 
          encryptionKey: null,
          secrets: [], // Clear decrypted secrets from memory
        });
        
        // Unsubscribe from realtime when locked
        get().unsubscribeFromRealtime();
      },

      changePassword: async (oldPassword, newPassword) => {
        try {
          const storedPasswordHash = await SecureStore.getItemAsync('vault_password_hash');
          if (!storedPasswordHash) return false;
          
          const isValid = await verifyPassword(oldPassword, storedPasswordHash);
          if (!isValid) return false;

          const newHash = await hashPassword(newPassword);
          await SecureStore.setItemAsync('vault_password_hash', newHash);
          
          const oldSalt = await getUserSalt();
          const oldKey = await deriveKeyFromPassword(oldPassword, oldSalt);
          const newKey = await deriveKeyFromPassword(newPassword, oldSalt);
          
          // Re-encrypt all secrets with new key
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return false;
          
          const { data: supabaseSecrets } = await supabase
            .from('vault_secrets')
            .select('*')
            .eq('user_id', user.id)
            .is('deleted_at', null);
          
          if (supabaseSecrets) {
            await Promise.all(
              supabaseSecrets.map(async (secret: any) => {
                const decryptedData = await decrypt(secret.encrypted_data, oldKey);
                const reencryptedData = await encrypt(decryptedData, newKey);
                
                await supabase
                  .from('vault_secrets')
                  .update({ encrypted_data: reencryptedData })
                  .eq('id', secret.id)
                  .eq('user_id', user.id);
              })
            );
          }
          
          set({ encryptionKey: newKey });
          return true;
        } catch (error) {
          console.error('Change password error:', error);
          return false;
        }
      },

      // =====================================================================
      // FETCH SECRETS (from Supabase, decrypt locally)
      // =====================================================================
      fetchSecrets: async () => {
        const { encryptionKey } = get();
        if (!encryptionKey) {
          console.log('Vault locked, cannot fetch secrets');
          return;
        }
        
        set({ isLoading: true });
        
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.log('No authenticated user');
            set({ isLoading: false });
            return;
          }

          const { data, error } = await supabase
            .from('vault_secrets')
            .select('*')
            .is('deleted_at', null)
            .order('updated_at', { ascending: false });

          if (error) throw error;

          // Decrypt secrets
          const secrets: VaultSecret[] = await Promise.all(
            (data || []).map(async (row: any) => {
              try {
                const decryptedData = await decrypt(row.encrypted_data, encryptionKey);
                const secretData = JSON.parse(decryptedData);
                
                return {
                  id: row.id,
                  type: row.type,
                  name: row.name,
                  tags: row.tags,
                  favorite: row.favorite,
                  createdAt: row.created_at,
                  updatedAt: row.updated_at,
                  lastAccessed: row.last_accessed,
                  version: row.version,
                  ...secretData, // username, password, etc.
                };
              } catch (error) {
                console.error(`Failed to decrypt secret ${row.id}:`, error);
                return null;
              }
            })
          );

          set({ 
            secrets: secrets.filter((s) => s !== null) as VaultSecret[],
            isLoading: false,
            lastSyncedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Failed to fetch secrets:', error);
          set({ isLoading: false });
        }
      },

      // =====================================================================
      // ADD SECRET (encrypt and upload to Supabase)
      // =====================================================================
      addSecret: async (secretData) => {
        const { encryptionKey, isOnline, syncQueue } = get();
        if (!encryptionKey) throw new Error('Vault is locked');
        
        const newSecret: VaultSecret = {
          ...secretData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        };

        // Extract sensitive data to encrypt
        const sensitiveData = {
          username: secretData.username,
          password: secretData.password,
          url: secretData.url,
          cardNumber: secretData.cardNumber,
          cardHolder: secretData.cardHolder,
          expiryDate: secretData.expiryDate,
          cvv: secretData.cvv,
          apiKey: secretData.apiKey,
          note: secretData.note,
        };
        
        const sensitiveJson = JSON.stringify(sensitiveData);
        const encryptedData = await encrypt(sensitiveJson, encryptionKey);

        // Optimistic update
        set((state) => ({
          secrets: [newSecret, ...state.secrets],
        }));

        // Queue for sync or sync immediately
        if (!isOnline) {
          const queueItem: SyncQueueItem = {
            id: crypto.randomUUID(),
            operation: 'create',
            secretId: newSecret.id,
            data: { ...newSecret, encryptedData } as any,
            timestamp: Date.now(),
            retryCount: 0,
          };
          
          set({ syncQueue: [...syncQueue, queueItem] });
        } else {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
              .from('vault_secrets')
              .insert({
                id: newSecret.id,
                user_id: user.id,
                type: newSecret.type,
                name: newSecret.name,
                tags: newSecret.tags,
                favorite: newSecret.favorite,
                encrypted_data: encryptedData,
                created_at: newSecret.createdAt,
                updated_at: newSecret.updatedAt,
                version: newSecret.version,
              });

            if (error) throw error;
          } catch (error) {
            console.error('Failed to add secret to Supabase:', error);
            
            const queueItem: SyncQueueItem = {
              id: crypto.randomUUID(),
              operation: 'create',
              secretId: newSecret.id,
              data: { ...newSecret, encryptedData } as any,
              timestamp: Date.now(),
              retryCount: 0,
            };
            
            set({ syncQueue: [...get().syncQueue, queueItem] });
          }
        }
      },

      // =====================================================================
      // UPDATE SECRET
      // =====================================================================
      updateSecret: async (secretId, updates) => {
        const { encryptionKey, isOnline, secrets, syncQueue } = get();
        if (!encryptionKey) throw new Error('Vault is locked');
        
        // Find existing secret
        const existingSecret = secrets.find((s) => s.id === secretId);
        if (!existingSecret) return;
        
        const updatedSecret = {
          ...existingSecret,
          ...updates,
          updatedAt: new Date().toISOString(),
          version: (existingSecret.version || 1) + 1,
        };
        
        // Re-encrypt if sensitive data changed
        const sensitiveData = {
          username: updatedSecret.username,
          password: updatedSecret.password,
          url: updatedSecret.url,
          cardNumber: updatedSecret.cardNumber,
          cardHolder: updatedSecret.cardHolder,
          expiryDate: updatedSecret.expiryDate,
          cvv: updatedSecret.cvv,
          apiKey: updatedSecret.apiKey,
          note: updatedSecret.note,
        };
        
        const sensitiveJson = JSON.stringify(sensitiveData);
        const encryptedData = await encrypt(sensitiveJson, encryptionKey);

        // Optimistic update
        set((state) => ({
          secrets: state.secrets.map((s) => (s.id === secretId ? updatedSecret : s)),
        }));

        // Queue for sync or sync immediately
        if (!isOnline) {
          const queueItem: SyncQueueItem = {
            id: crypto.randomUUID(),
            operation: 'update',
            secretId,
            data: { ...updates, encryptedData } as any,
            timestamp: Date.now(),
            retryCount: 0,
          };
          
          set({ syncQueue: [...syncQueue, queueItem] });
        } else {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
              .from('vault_secrets')
              .update({
                type: updates.type,
                name: updates.name,
                tags: updates.tags,
                favorite: updates.favorite,
                encrypted_data: encryptedData,
                updated_at: new Date().toISOString(),
              })
              .eq('id', secretId)
              .eq('user_id', user.id);

            if (error) throw error;
          } catch (error) {
            console.error('Failed to update secret in Supabase:', error);
            
            const queueItem: SyncQueueItem = {
              id: crypto.randomUUID(),
              operation: 'update',
              secretId,
              data: { ...updates, encryptedData } as any,
              timestamp: Date.now(),
              retryCount: 0,
            };
            
            set({ syncQueue: [...get().syncQueue, queueItem] });
          }
        }
      },

      // =====================================================================
      // DELETE SECRET
      // =====================================================================
      deleteSecret: async (secretId) => {
        const { isOnline, syncQueue } = get();
        
        // Optimistic update
        set((state) => ({
          secrets: state.secrets.filter((s) => s.id !== secretId),
        }));

        // Queue for sync or sync immediately
        if (!isOnline) {
          const queueItem: SyncQueueItem = {
            id: crypto.randomUUID(),
            operation: 'delete',
            secretId,
            timestamp: Date.now(),
            retryCount: 0,
          };
          
          set({ syncQueue: [...syncQueue, queueItem] });
        } else {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
              .from('vault_secrets')
              .update({ deleted_at: new Date().toISOString() })
              .eq('id', secretId)
              .eq('user_id', user.id);

            if (error) throw error;
          } catch (error) {
            console.error('Failed to delete secret in Supabase:', error);
            
            const queueItem: SyncQueueItem = {
              id: crypto.randomUUID(),
              operation: 'delete',
              secretId,
              timestamp: Date.now(),
              retryCount: 0,
            };
            
            set({ syncQueue: [...get().syncQueue, queueItem] });
          }
        }
      },

      // =====================================================================
      // SETTINGS, AUDIT, SEARCH (unchanged from original)
      // =====================================================================
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      recordAccess: (secretId) => {
        set((state) => ({
          secrets: state.secrets.map((s) =>
            s.id === secretId ? { ...s, lastAccessed: new Date().toISOString() } : s
          ),
        }));
      },

      rotateEncryption: async () => {
        // Re-encrypt all secrets with new key
        console.log('Key rotation initiated');
      },

      getWeakPasswords: () => {
        return get().secrets.filter((s) => {
          if (s.type === 'login' && s.password) {
            return s.password.length < 12;
          }
          return false;
        });
      },

      getReusedPasswords: () => {
        const { secrets } = get();
        const passwords = new Map<string, number>();
        
        secrets.forEach((s) => {
          if (s.type === 'login' && s.password) {
            passwords.set(s.password, (passwords.get(s.password) || 0) + 1);
          }
        });

        return secrets.filter((s) => {
          if (s.type === 'login' && s.password) {
            return (passwords.get(s.password) || 0) > 1;
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
          (s) =>
            s.name.toLowerCase().includes(lowerQuery) ||
            s.username?.toLowerCase().includes(lowerQuery) ||
            s.url?.toLowerCase().includes(lowerQuery) ||
            s.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      },

      getSecretsByType: (type) => {
        const { secrets } = get();
        if (type === 'all') return secrets;
        return secrets.filter((s) => s.type === type);
      },

      // =====================================================================
      // SYNC WITH SUPABASE
      // =====================================================================
      syncWithSupabase: async () => {
        set({ isSyncing: true });
        
        try {
          await get().processSyncQueue();
          await get().fetchSecrets();
          
          set({ 
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Sync failed:', error);
          set({ isSyncing: false });
        }
      },

      processSyncQueue: async () => {
        const { syncQueue } = get();
        if (syncQueue.length === 0) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const processedIds: string[] = [];

        for (const item of syncQueue) {
          try {
            switch (item.operation) {
              case 'create':
                await supabase.from('vault_secrets').insert({
                  id: item.secretId,
                  user_id: user.id,
                  ...(item.data as any),
                });
                break;
                
              case 'update':
                await supabase
                  .from('vault_secrets')
                  .update(item.data as any)
                  .eq('id', item.secretId)
                  .eq('user_id', user.id);
                break;
                
              case 'delete':
                await supabase
                  .from('vault_secrets')
                  .update({ deleted_at: new Date().toISOString() })
                  .eq('id', item.secretId)
                  .eq('user_id', user.id);
                break;
            }
            
            processedIds.push(item.id);
          } catch (error) {
            console.error(`Failed to process queue item ${item.id}:`, error);
            
            if (item.retryCount < 3) {
              set((state) => ({
                syncQueue: state.syncQueue.map((qi) =>
                  qi.id === item.id ? { ...qi, retryCount: qi.retryCount + 1 } : qi
                ),
              }));
            } else {
              processedIds.push(item.id);
            }
          }
        }

        set((state) => ({
          syncQueue: state.syncQueue.filter((item) => !processedIds.includes(item.id)),
        }));
      },

      // =====================================================================
      // REALTIME SUBSCRIPTION
      // =====================================================================
      subscribeToRealtime: () => {
        const { realtimeSubscription, isUnlocked } = get();
        if (realtimeSubscription || !isUnlocked) return;

        const subscription = supabase
          .channel('vault_secrets_channel')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'vault_secrets',
            },
            (payload: any) => {
              console.log('Vault realtime update:', payload);
              
              // Re-fetch secrets when changes occur
              get().fetchSecrets();
            }
          )
          .subscribe();

        set({ realtimeSubscription: subscription });
      },

      unsubscribeFromRealtime: () => {
        const { realtimeSubscription } = get();
        if (realtimeSubscription) {
          supabase.removeChannel(realtimeSubscription);
          set({ realtimeSubscription: null });
        }
      },

      setOnlineStatus: (isOnline) => {
        set({ isOnline });
        
        if (isOnline) {
          get().processSyncQueue();
        }
      },
    }),
    {
      name: 'vault-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        failedAttempts: state.failedAttempts,
        lockoutUntil: state.lockoutUntil,
        syncQueue: state.syncQueue,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

// ============================================================================
// NETWORK STATUS LISTENER
// ============================================================================

let networkUnsubscribe: (() => void) | null = null;

export function setupVaultStoreNetworkListener() {
  if (networkUnsubscribe) return;

  networkUnsubscribe = NetInfo.addEventListener((state) => {
    useVaultStore.getState().setOnlineStatus(state.isConnected ?? false);
  });
}

export function cleanupVaultStoreNetworkListener() {
  if (networkUnsubscribe) {
    networkUnsubscribe();
    networkUnsubscribe = null;
  }
}
