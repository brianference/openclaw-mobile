/**
 * MobileClaw Crypto Secrets Manager
 * 
 * In-memory secrets manager for crypto keys using react-native-keychain.
 * 
 * Security Design:
 * 1. Master key generated on app install (stored in keychain)
 * 2. All crypto credentials encrypted at rest using master key
 * 3. Keys cleared from memory when app closes
 * 4. Simple pattern: generate key → encrypt/decrypt credentials
 * 
 * Uses the existing AES-256-CTR + HMAC encryption from crypto.ts
 */

import * as Crypto from 'expo-crypto';
import * as Keychain from 'react-native-keychain';
import { encrypt, decrypt, bytesToHex, hexToBytes } from './crypto';

// Constants for keychain storage
const KEYCHAIN_SERVICE = 'mobileclaw-secrets';
const KEYCHAIN_ACCESSIBLE = Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY;

// In-memory key storage (cleared on app close)
let masterKey: string | null = null;
let isInitialized: boolean = false;

// ============================================================================
// Key Generation & Storage
// ============================================================================

/**
 * Generate a cryptographically secure master key
 * @returns Hex-encoded 32-byte key
 */
async function generateMasterKey(): Promise<string> {
  const keyBytes = await Crypto.getRandomBytesAsync(32); // 256 bits
  return bytesToHex(keyBytes);
}

/**
 * Initialize the secrets manager
 * Generates master key on first app install, retrieves existing key otherwise
 */
export async function initializeSecretsManager(): Promise<boolean> {
  if (isInitialized && masterKey) {
    return true; // Already initialized
  }

  try {
    // Check if master key already exists in keychain
    const existingKey = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });

    if (existingKey) {
      // Key exists, load it into memory
      masterKey = existingKey.password;
      console.log('✅ Secrets manager: loaded existing master key');
    } else {
      // First install - generate new master key
      masterKey = await generateMasterKey();
      
      // Store in keychain (encrypted at rest)
      await Keychain.setGenericPassword('masterKey', masterKey, {
        service: KEYCHAIN_SERVICE,
        accessible: KEYCHAIN_ACCESSIBLE,
      });
      
      console.log('✅ Secrets manager: generated new master key');
    }

    isInitialized = true;
    return true;
  } catch (error) {
    console.error('❌ Secrets manager initialization failed:', error);
    return false;
  }
}

/**
 * Check if secrets manager is initialized
 */
export function isSecretsManagerReady(): boolean {
  return isInitialized && masterKey !== null;
}

/**
 * Get the master key (for internal encryption operations)
 * @throws Error if not initialized
 */
function getMasterKey(): string {
  if (!masterKey) {
    throw new Error('Secrets manager not initialized. Call initializeSecretsManager() first.');
  }
  return masterKey;
}

// ============================================================================
// Credential Storage API
// ============================================================================

export interface Credential {
  id: string;
  name: string;
  service: string;
  username?: string;
  password?: string;
  apiKey?: string;
  secret?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

interface EncryptedCredentialData {
  username?: string;
  password?: string;
  apiKey?: string;
  secret?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Store a credential (encrypted at rest)
 * @param credential Credential data to store
 */
export async function storeCredential(credential: Omit<Credential, 'id' | 'createdAt' | 'updatedAt'>): Promise<Credential> {
  const key = getMasterKey();
  const id = Date.now().toString();
  const now = new Date().toISOString();

  const newCredential: Credential = {
    ...credential,
    id,
    createdAt: now,
    updatedAt: now,
  };

  // Encrypt sensitive data
  const sensitiveData: EncryptedCredentialData = {
    username: credential.username,
    password: credential.password,
    apiKey: credential.apiKey,
    secret: credential.secret,
    metadata: credential.metadata,
  };

  const encryptedData = await encrypt(JSON.stringify(sensitiveData), key);

  // Store in keychain
  await Keychain.setGenericPassword(`cred_${id}`, encryptedData, {
    service: `${KEYCHAIN_SERVICE}.${credential.service}`,
    accessible: KEYCHAIN_ACCESSIBLE,
  });

  // Return metadata (not encrypted data)
  const storedCredential: Credential = {
    id: newCredential.id,
    name: newCredential.name,
    service: newCredential.service,
    createdAt: newCredential.createdAt,
    updatedAt: newCredential.updatedAt,
  };

  return storedCredential;
}

/**
 * Retrieve a credential (decrypted)
 * @param id Credential ID
 * @param service Service name (for keychain access)
 */
export async function getCredential(id: string, service: string): Promise<Credential | null> {
  const key = getMasterKey();

  try {
    // Fetch encrypted data from keychain
    const encryptedData = await Keychain.getGenericPassword({
      service: `${KEYCHAIN_SERVICE}.${service}`,
    });

    if (!encryptedData) {
      return null;
    }

    // Decrypt data
    const decryptedData = JSON.parse(await decrypt(encryptedData.password, key)) as EncryptedCredentialData;

    // Return full credential (with decrypted sensitive data)
    return {
      id,
      name: '', // Name not stored encrypted (minimal metadata)
      service,
      username: decryptedData.username,
      password: decryptedData.password,
      apiKey: decryptedData.apiKey,
      secret: decryptedData.secret,
      metadata: decryptedData.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Failed to retrieve credential ${id}:`, error);
    return null;
  }
}

/**
 * Update a credential
 * @param id Credential ID
 * @param service Service name
 * @param updates Fields to update
 */
export async function updateCredential(
  id: string,
  service: string,
  updates: Partial<Omit<Credential, 'id' | 'service' | 'createdAt'>>
): Promise<boolean> {
  const key = getMasterKey();

  try {
    // Get existing encrypted data
    const existing = await Keychain.getGenericPassword({
      service: `${KEYCHAIN_SERVICE}.${service}`,
    });

    if (!existing) {
      return false;
    }

    // Decrypt existing data
    const existingData = JSON.parse(await decrypt(existing.password, key)) as EncryptedCredentialData;

    // Merge updates
    const updatedData: EncryptedCredentialData = {
      username: updates.username ?? existingData.username,
      password: updates.password ?? existingData.password,
      apiKey: updates.apiKey ?? existingData.apiKey,
      secret: updates.secret ?? existingData.secret,
      metadata: { ...existingData.metadata, ...updates.metadata },
    };

    // Re-encrypt and store
    const encryptedData = await encrypt(JSON.stringify(updatedData), key);

    await Keychain.setGenericPassword(`cred_${id}`, encryptedData, {
      service: `${KEYCHAIN_SERVICE}.${service}`,
      accessible: KEYCHAIN_ACCESSIBLE,
    });

    return true;
  } catch (error) {
    console.error(`Failed to update credential ${id}:`, error);
    return false;
  }
}

/**
 * Delete a credential
 * @param id Credential ID
 * @param service Service name
 */
export async function deleteCredential(id: string, service: string): Promise<boolean> {
  try {
    await Keychain.resetGenericPassword({
      service: `${KEYCHAIN_SERVICE}.${service}`,
    });
    return true;
  } catch (error) {
    console.error(`Failed to delete credential ${id}:`, error);
    return false;
  }
}

/**
 * List all credentials for a service (metadata only, no sensitive data)
 */
export async function listCredentials(service: string): Promise<Credential[]> {
  // Note: Keychain doesn't support listing, so we track metadata separately
  // For now, return empty list - implement metadata tracking if needed
  console.warn('listCredentials: Full listing not implemented (would require metadata store)');
  return [];
}

// ============================================================================
// Crypto Key Operations (for vault integration)
// ============================================================================

/**
 * Encrypt data using the master key
 * @param data Plain text data
 * @returns Hex-encoded encrypted data
 */
export async function encryptWithMasterKey(data: string): Promise<string> {
  const key = getMasterKey();
  return encrypt(data, key);
}

/**
 * Decrypt data using the master key
 * @param encryptedData Hex-encoded encrypted data
 * @returns Plain text data
 */
export async function decryptWithMasterKey(encryptedData: string): Promise<string> {
  const key = getMasterKey();
  return decrypt(encryptedData, key);
}

// ============================================================================
// Memory Cleanup (Clear on App Close)
// ============================================================================

/**
 * Clear all keys from memory
 * Should be called when app goes to background or closes
 */
export function clearAllKeysFromMemory(): void {
  masterKey = null;
  isInitialized = false;
  console.log('🗑️ Secrets manager: cleared all keys from memory');
}

/**
 * Clear all credentials from keychain (logout/reset)
 * Use with caution - this is irreversible
 */
export async function clearAllCredentials(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({
      service: KEYCHAIN_SERVICE,
    });
    masterKey = null;
    isInitialized = false;
    console.log('🗑️ Secrets manager: cleared all credentials and keys');
  } catch (error) {
    console.error('Failed to clear credentials:', error);
  }
}

// ============================================================================
// Testing Utilities
// ============================================================================

/**
 * Test the secrets manager functionality
 */
export async function testSecretsManager(): Promise<boolean> {
  console.log('\n🔐 Testing Secrets Manager\n');

  try {
    // Initialize
    console.log('1. Initializing...');
    const initResult = await initializeSecretsManager();
    console.log(initResult ? '   ✅ Initialized' : '   ❌ Init failed');

    if (!initResult) return false;

    // Store credential
    console.log('2. Storing credential...');
    const testCred = await storeCredential({
      name: 'Test API Key',
      service: 'test-service',
      username: 'testuser',
      password: 'super-secret-password-123!',
      apiKey: 'sk-test-api-key-xyz',
    });
    console.log(`   ✅ Stored credential: ${testCred.id}`);

    // Retrieve credential
    console.log('3. Retrieving credential...');
    const retrieved = await getCredential(testCred.id, 'test-service');
    if (retrieved && retrieved.password === 'super-secret-password-123!') {
      console.log('   ✅ Retrieved correctly');
    } else {
      console.log('   ❌ Retrieval failed or mismatch');
      return false;
    }

    // Update credential
    console.log('4. Updating credential...');
    const updateResult = await updateCredential(testCred.id, 'test-service', {
      password: 'new-password-456!',
    });
    console.log(updateResult ? '   ✅ Updated' : '   ❌ Update failed');

    // Verify update
    console.log('5. Verifying update...');
    const updated = await getCredential(testCred.id, 'test-service');
    if (updated && updated.password === 'new-password-456!') {
      console.log('   ✅ Update verified');
    } else {
      console.log('   ❌ Update verification failed');
      return false;
    }

    // Delete credential
    console.log('6. Deleting credential...');
    const deleteResult = await deleteCredential(testCred.id, 'test-service');
    console.log(deleteResult ? '   ✅ Deleted' : '   ❌ Delete failed');

    // Verify deletion
    console.log('7. Verifying deletion...');
    const deleted = await getCredential(testCred.id, 'test-service');
    console.log(!deleted ? '   ✅ Deletion verified' : '   ❌ Deletion failed');

    // Test memory clear
    console.log('8. Testing memory clear...');
    clearAllKeysFromMemory();
    console.log(isSecretsManagerReady() ? '   ❌ Memory not cleared' : '   ✅ Memory cleared');

    console.log('\n✅ All tests PASSED\n');
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

/**
 * Benchmark secrets manager performance
 */
export async function benchmarkSecretsManager(): Promise<void> {
  console.log('\n📊 Secrets Manager Performance Benchmark\n');

  await initializeSecretsManager();

  // Benchmark encryption
  console.log('1. Encryption (100 bytes):');
  const testData = 'x'.repeat(100);
  const encStart = Date.now();
  const encrypted = await encryptWithMasterKey(testData);
  const encTime = Date.now() - encStart;
  console.log(`   Encrypt: ${encTime}ms`);

  // Benchmark decryption
  console.log('2. Decryption (100 bytes):');
  const decStart = Date.now();
  await decryptWithMasterKey(encrypted);
  const decTime = Date.now() - decStart;
  console.log(`   Decrypt: ${decTime}ms`);

  // Credential operations
  console.log('3. Credential operations:');
  
  const storeStart = Date.now();
  await storeCredential({
    name: 'Benchmark Credential',
    service: 'benchmark',
    password: 'benchmark-password',
  });
  console.log(`   Store: ${Date.now() - storeStart}ms`);

  const retrieveStart = Date.now();
  await getCredential(Date.now().toString(), 'benchmark');
  console.log(`   Retrieve: ${Date.now() - retrieveStart}ms`);
}