/**
 * Crypto Utilities for MobileClaw - AES-256-GCM Implementation
 * 
 * ✅ SECURITY COMPLIANT: Implements proper AES-256-GCM authenticated encryption
 * 
 * This file implements US-084 acceptance criteria:
 * - ✅ AES-256-GCM encryption (authenticated encryption with 16-byte auth tag)
 * - ✅ PBKDF2-SHA256 key derivation (100,000+ iterations)
 * - ✅ Random salt (16 bytes) and IV (12 bytes) per encryption
 * - ✅ No plaintext stored on device
 * - ✅ All encryption/decryption in memory only
 * 
 * Dependencies Required:
 * ```bash
 * npm install @noble/ciphers@^2.1.0 @noble/hashes@^2.0.0
 * ```
 * 
 * Security Design:
 * 1. Password → PBKDF2 (100k iterations, SHA-256) → 256-bit key
 * 2. Each secret encrypted with unique 96-bit IV (GCM recommended size)
 * 3. GCM provides both encryption AND authentication (no separate HMAC needed)
 * 4. Format: IV (12 bytes) + Ciphertext (N bytes) + Auth Tag (16 bytes)
 * 
 * @see US-084 acceptance criteria
 * @see vault-encryption/specs/encryption.md
 */

import { gcm } from '@noble/ciphers/aes';
import { randomBytes } from '@noble/ciphers/webcrypto';
import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha2';
import * as SecureStore from 'expo-secure-store';

// Constants matching OWASP recommendations 2024
const PBKDF2_ITERATIONS = 100000; // OWASP minimum
const SALT_LENGTH = 16; // 128 bits
const IV_LENGTH = 12;   // 96 bits (GCM recommended)
const KEY_LENGTH = 32;  // 256 bits
const TAG_LENGTH = 16;  // 128 bits (GCM auth tag)

/**
 * Generate cryptographically secure random bytes
 * Uses Web Crypto API (@noble/ciphers/webcrypto)
 * 
 * @param length Number of bytes to generate
 * @returns Uint8Array of random bytes
 */
export function generateRandomBytes(length: number): Uint8Array {
  if (!Number.isInteger(length) || length < 1) {
    throw new Error('Length must be a positive integer');
  }
  return randomBytes(length);
}

/**
 * Generate random salt for PBKDF2 key derivation
 * 
 * @returns 16-byte random salt as hex string
 */
export async function generateSalt(): Promise<string> {
  const saltBytes = generateRandomBytes(SALT_LENGTH);
  return bytesToHex(saltBytes);
}

/**
 * Derive AES-256 encryption key from password using PBKDF2-SHA256
 * 
 * ⏱️ Performance: ~100-200ms on mobile (intentionally slow for security)
 * 
 * @param password User password (any length)
 * @param salt Hex-encoded salt (32 chars = 16 bytes)
 * @returns Hex-encoded 256-bit key (64 chars = 32 bytes)
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: string
): Promise<string> {
  if (!password || password.length === 0) {
    throw new Error('Password cannot be empty');
  }
  if (!salt || salt.length !== SALT_LENGTH * 2) {
    throw new Error(`Salt must be ${SALT_LENGTH * 2} hex chars`);
  }

  const passwordBytes = stringToBytes(password);
  const saltBytes = hexToBytes(salt);
  
  // PBKDF2-HMAC-SHA256 with 100,000 iterations
  const keyBytes = pbkdf2(sha256, passwordBytes, saltBytes, {
    c: PBKDF2_ITERATIONS,
    dkLen: KEY_LENGTH,
  });
  
  return bytesToHex(keyBytes);
}

/**
 * Encrypt data using AES-256-GCM (authenticated encryption)
 * 
 * ✅ Provides BOTH confidentiality AND authentication
 * ✅ Each encryption uses a unique random IV
 * ✅ Returns format: IV (12 bytes) + Ciphertext (N bytes) + Auth Tag (16 bytes)
 * 
 * @param plaintext Plain text data to encrypt
 * @param key Hex-encoded 256-bit key (64 chars)
 * @returns Hex-encoded encrypted blob (IV + ciphertext + tag)
 */
export async function encrypt(
  plaintext: string,
  key: string
): Promise<string> {
  if (!plaintext) {
    throw new Error('Plaintext cannot be empty');
  }
  if (!key || key.length !== KEY_LENGTH * 2) {
    throw new Error(`Key must be ${KEY_LENGTH * 2} hex chars`);
  }

  // Generate random 96-bit IV (GCM recommended size)
  const iv = generateRandomBytes(IV_LENGTH);
  
  // Convert inputs to bytes
  const keyBytes = hexToBytes(key);
  const plaintextBytes = stringToBytes(plaintext);
  
  // AES-256-GCM encryption
  // GCM returns: ciphertext + 16-byte authentication tag (appended)
  const cipher = gcm(keyBytes, iv);
  const ciphertextWithTag = cipher.encrypt(plaintextBytes);
  
  // Combine: IV + (Ciphertext + Auth Tag)
  const combined = new Uint8Array(IV_LENGTH + ciphertextWithTag.length);
  combined.set(iv, 0);
  combined.set(ciphertextWithTag, IV_LENGTH);
  
  return bytesToHex(combined);
}

/**
 * Decrypt data using AES-256-GCM with authentication verification
 * 
 * ⚠️ Throws error if:
 * - Authentication tag verification fails (tampered data detected)
 * - Wrong decryption key used
 * - IV or ciphertext corrupted
 * 
 * @param encryptedData Hex-encoded encrypted blob (IV + ciphertext + tag)
 * @param key Hex-encoded 256-bit key (64 chars)
 * @returns Decrypted plaintext
 * @throws Error if authentication fails or decryption error
 */
export async function decrypt(
  encryptedData: string,
  key: string
): Promise<string> {
  if (!encryptedData) {
    throw new Error('Encrypted data cannot be empty');
  }
  if (!key || key.length !== KEY_LENGTH * 2) {
    throw new Error(`Key must be ${KEY_LENGTH * 2} hex chars`);
  }

  const combined = hexToBytes(encryptedData);
  
  // Parse components
  if (combined.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = combined.slice(0, IV_LENGTH);
  const ciphertextWithTag = combined.slice(IV_LENGTH); // Includes 16-byte auth tag
  
  // Convert key
  const keyBytes = hexToBytes(key);
  
  try {
    // AES-256-GCM decryption with auth tag verification
    // Will throw if tag verification fails (tampered data)
    const cipher = gcm(keyBytes, iv);
    const plaintextBytes = cipher.decrypt(ciphertextWithTag);
    
    return bytesToString(plaintextBytes);
  } catch (error) {
    // GCM throws on authentication failure
    throw new Error('Decryption failed: Authentication tag verification failed (data may have been tampered with)');
  }
}

/**
 * Hash password for storage and verification
 * 
 * Format: "salt:hash" where both are hex-encoded
 * 
 * @param password Plain text password
 * @returns "salt:hash" string for storage
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await generateSalt();
  const hash = await deriveKeyFromPassword(password, salt);
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored hash
 * 
 * Uses constant-time comparison to prevent timing attacks
 * 
 * @param password Password to verify
 * @param storedHash "salt:hash" from hashPassword()
 * @returns true if password matches
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;
    
    const [salt, expectedHash] = parts;
    const actualHash = await deriveKeyFromPassword(password, salt);
    
    // Constant-time comparison (prevent timing attacks)
    if (actualHash.length !== expectedHash.length) return false;
    
    let mismatch = 0;
    for (let i = 0; i < actualHash.length; i++) {
      mismatch |= actualHash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
    }
    
    return mismatch === 0;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Get or create salt for current user
 * 
 * Salt is stored in SecureStore (platform-secure storage)
 * 
 * @returns Hex-encoded salt (32 chars)
 */
export async function getUserSalt(): Promise<string> {
  try {
    let salt = await SecureStore.getItemAsync('vault_salt');
    if (!salt) {
      salt = await generateSalt();
      await SecureStore.setItemAsync('vault_salt', salt);
    }
    return salt;
  } catch (error) {
    console.error('Failed to get/create salt:', error);
    throw new Error('Failed to initialize encryption');
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string (odd length)');
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// ============================================================================
// Testing & Validation
// ============================================================================

/**
 * Test AES-256-GCM encryption/decryption cycle
 * 
 * ✅ Validates:
 * - Encryption produces unique ciphertexts (random IV)
 * - Decryption recovers original plaintext
 * - Tampered data is detected (auth tag verification)
 * - Wrong key causes decryption failure
 * 
 * @returns true if all tests pass
 */
export async function testEncryption(): Promise<boolean> {
  try {
    const testData = 'Hello, World! 🔐 Testing AES-256-GCM encryption.';
    const password = 'super-secret-password-123!';
    
    console.log('🔐 Testing AES-256-GCM encryption...');
    console.log('Original:', testData);
    
    // Generate salt
    const salt = await generateSalt();
    console.log('✓ Salt generated:', salt.substring(0, 20) + '...');
    
    // Derive key (PBKDF2 with 100k iterations)
    console.log('⏳ Deriving key (100k iterations, PBKDF2-SHA256)...');
    const startTime = Date.now();
    const key = await deriveKeyFromPassword(password, salt);
    const keyTime = Date.now() - startTime;
    console.log(`✓ Key derived in ${keyTime}ms:`, key.substring(0, 20) + '...');
    
    // Test 1: Encrypt and decrypt
    const encrypted1 = await encrypt(testData, key);
    console.log('✓ Encrypted (1):', encrypted1.substring(0, 40) + '...');
    
    const decrypted = await decrypt(encrypted1, key);
    console.log('✓ Decrypted:', decrypted);
    
    if (decrypted !== testData) {
      console.log('❌ Decryption failed - plaintext mismatch');
      return false;
    }
    
    // Test 2: Encryption produces unique ciphertexts
    const encrypted2 = await encrypt(testData, key);
    if (encrypted1 === encrypted2) {
      console.log('❌ IV reuse detected - same ciphertext twice!');
      return false;
    }
    console.log('✓ IV uniqueness verified (different ciphertexts)');
    
    // Test 3: Tampered data detection
    console.log('\n🔒 Testing tamper detection...');
    const tampered = encrypted1.substring(0, encrypted1.length - 4) + 'DEAD';
    try {
      await decrypt(tampered, key);
      console.log('❌ Tamper detection FAILED - should have thrown error');
      return false;
    } catch (error: any) {
      if (error.message.includes('Authentication')) {
        console.log('✓ Tamper detection PASSED');
      } else {
        console.log('❌ Unexpected error:', error.message);
        return false;
      }
    }
    
    // Test 4: Wrong key detection
    const wrongKey = await deriveKeyFromPassword('wrong-password', salt);
    try {
      await decrypt(encrypted1, wrongKey);
      console.log('❌ Wrong key accepted - should have failed');
      return false;
    } catch (error: any) {
      console.log('✓ Wrong key rejected');
    }
    
    console.log('\n✅ All encryption tests PASSED');
    return true;
  } catch (error) {
    console.error('❌ Test FAILED:', error);
    return false;
  }
}

/**
 * Performance benchmark for crypto operations
 */
export async function benchmarkCrypto(): Promise<void> {
  console.log('\n📊 AES-256-GCM Performance Benchmark\n');
  
  const password = 'benchmark-password';
  const salt = await generateSalt();
  
  // Benchmark key derivation (expensive by design)
  console.log('1. Key Derivation (PBKDF2, 100k iterations):');
  const keyStart = Date.now();
  const key = await deriveKeyFromPassword(password, salt);
  const keyTime = Date.now() - keyStart;
  console.log(`   ${keyTime}ms (intentionally slow for security)\n`);
  
  // Benchmark encryption at various sizes
  const sizes = [100, 1000, 10000];
  for (const size of sizes) {
    const testData = 'x'.repeat(size);
    
    const encStart = Date.now();
    const encrypted = await encrypt(testData, key);
    const encTime = Date.now() - encStart;
    
    const decStart = Date.now();
    await decrypt(encrypted, key);
    const decTime = Date.now() - decStart;
    
    console.log(`2. AES-256-GCM (${size} bytes):`);
    console.log(`   Encrypt: ${encTime}ms`);
    console.log(`   Decrypt: ${decTime}ms`);
    console.log(`   Total: ${encTime + decTime}ms\n`);
  }
}

/**
 * Validate security configuration
 * 
 * Checks that all security parameters meet OWASP recommendations
 */
export function validateSecurityConfig(): boolean {
  const checks = [
    { name: 'PBKDF2 iterations ≥100k', pass: PBKDF2_ITERATIONS >= 100000 },
    { name: 'Salt length ≥128 bits', pass: SALT_LENGTH >= 16 },
    { name: 'IV length = 96 bits (GCM)', pass: IV_LENGTH === 12 },
    { name: 'Key length = 256 bits', pass: KEY_LENGTH === 32 },
    { name: 'Auth tag = 128 bits', pass: TAG_LENGTH === 16 },
  ];
  
  console.log('🔒 Security Configuration Validation:\n');
  let allPass = true;
  
  for (const check of checks) {
    const status = check.pass ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
    if (!check.pass) allPass = false;
  }
  
  console.log(allPass ? '\n✅ All security checks PASSED' : '\n❌ Security checks FAILED');
  return allPass;
}
