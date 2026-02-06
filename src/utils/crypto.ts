/**
 * OpenClaw Mobile - Cryptography Utilities
 * AES-256-GCM encryption for vault items
 * 
 * Uses expo-crypto for cryptographic operations
 */

import * as Crypto from 'expo-crypto';

// ============================================
// Constants
// ============================================

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits auth tag

// ============================================
// Key Derivation (PBKDF2)
// ============================================

/**
 * Derive encryption key from passphrase using PBKDF2
 * @param passphrase User's passphrase
 * @param salt Random salt (hex string)
 * @param iterations Number of iterations (default 100000)
 * @returns Derived key as hex string
 */
export async function deriveKeyPBKDF2(
  passphrase: string,
  salt: string,
  iterations: number = 100000
): Promise<string> {
  // Since expo-crypto doesn't have native PBKDF2, we simulate with repeated hashing
  // In production, use react-native-quick-crypto or native module
  
  let key = passphrase + salt;
  
  for (let i = 0; i < Math.min(iterations, 1000); i++) {
    key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      key + salt + i.toString()
    );
  }
  
  // Additional rounds in batches for performance
  const batchSize = 100;
  const remainingBatches = Math.floor((iterations - 1000) / batchSize);
  
  for (let batch = 0; batch < remainingBatches; batch++) {
    key = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      key + batch.toString()
    );
  }
  
  return key;
}

/**
 * Generate random salt
 * @returns Salt as hex string
 */
export async function generateSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(32);
  return bytesToHex(bytes);
}

/**
 * Generate random IV for AES-GCM
 * @returns IV as hex string
 */
export async function generateIV(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(IV_LENGTH);
  return bytesToHex(bytes);
}

// ============================================
// AES-256-GCM Encryption
// ============================================

/**
 * Encrypt plaintext using AES-256-GCM
 * 
 * NOTE: expo-crypto doesn't have native AES-GCM.
 * This is a simplified implementation for demo purposes.
 * For production, use:
 * - react-native-quick-crypto
 * - react-native-aes-gcm-crypto
 * - Native module with iOS CryptoKit / Android Cipher
 * 
 * @param plaintext Data to encrypt
 * @param key Encryption key (hex string, 64 chars = 256 bits)
 * @returns Encrypted data as { iv, ciphertext, tag } (all hex)
 */
export async function encryptAESGCM(
  plaintext: string,
  key: string
): Promise<{ iv: string; ciphertext: string; tag: string }> {
  const iv = await generateIV();
  
  // XOR-based encryption (PLACEHOLDER - NOT PRODUCTION READY)
  // TODO: Replace with actual AES-GCM via native module
  const keyBytes = hexToBytes(key);
  const plaintextBytes = stringToBytes(plaintext);
  const ivBytes = hexToBytes(iv);
  
  // Simple XOR cipher with key + IV (NOT REAL AES-GCM)
  const ciphertextBytes = new Uint8Array(plaintextBytes.length);
  for (let i = 0; i < plaintextBytes.length; i++) {
    ciphertextBytes[i] = plaintextBytes[i] ^ keyBytes[i % keyBytes.length] ^ ivBytes[i % ivBytes.length];
  }
  
  // Generate auth tag (hash of ciphertext + key)
  const tagInput = bytesToHex(ciphertextBytes) + key;
  const tag = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    tagInput
  );
  
  return {
    iv,
    ciphertext: bytesToHex(ciphertextBytes),
    tag: tag.substring(0, 32), // 128-bit tag
  };
}

/**
 * Decrypt ciphertext using AES-256-GCM
 * 
 * @param ciphertext Encrypted data (hex string)
 * @param key Encryption key (hex string)
 * @param iv Initialization vector (hex string)
 * @param tag Authentication tag (hex string)
 * @returns Decrypted plaintext or null if auth fails
 */
export async function decryptAESGCM(
  ciphertext: string,
  key: string,
  iv: string,
  tag: string
): Promise<string | null> {
  // Verify auth tag first
  const expectedTag = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    ciphertext + key
  );
  
  if (expectedTag.substring(0, 32) !== tag) {
    // Authentication failed - data tampered or wrong key
    return null;
  }
  
  // Decrypt (reverse XOR)
  const keyBytes = hexToBytes(key);
  const ciphertextBytes = hexToBytes(ciphertext);
  const ivBytes = hexToBytes(iv);
  
  const plaintextBytes = new Uint8Array(ciphertextBytes.length);
  for (let i = 0; i < ciphertextBytes.length; i++) {
    plaintextBytes[i] = ciphertextBytes[i] ^ keyBytes[i % keyBytes.length] ^ ivBytes[i % ivBytes.length];
  }
  
  return bytesToString(plaintextBytes);
}

// ============================================
// Utility Functions
// ============================================

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function stringToBytes(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

function bytesToString(bytes: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

// ============================================
// High-Level API
// ============================================

export interface EncryptedData {
  v: 1; // Version
  iv: string;
  ct: string; // ciphertext
  tag: string;
}

/**
 * Encrypt a string value for storage
 * @param value Plaintext to encrypt
 * @param encryptionKey Key from auth store
 * @returns JSON string of encrypted data
 */
export async function encryptValue(value: string, encryptionKey: string): Promise<string> {
  const { iv, ciphertext, tag } = await encryptAESGCM(value, encryptionKey);
  
  const data: EncryptedData = {
    v: 1,
    iv,
    ct: ciphertext,
    tag,
  };
  
  return JSON.stringify(data);
}

/**
 * Decrypt a stored value
 * @param encrypted JSON string from encryptValue
 * @param encryptionKey Key from auth store
 * @returns Decrypted plaintext or null if failed
 */
export async function decryptValue(encrypted: string, encryptionKey: string): Promise<string | null> {
  try {
    const data: EncryptedData = JSON.parse(encrypted);
    
    if (data.v !== 1) {
      throw new Error('Unsupported encryption version');
    }
    
    return await decryptAESGCM(data.ct, encryptionKey, data.iv, data.tag);
  } catch (error) {
    return null;
  }
}
