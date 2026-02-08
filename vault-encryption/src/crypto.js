'use strict';

const { gcm } = require('@noble/ciphers/aes');
const { randomBytes } = require('@noble/ciphers/webcrypto');
const { pbkdf2Async } = require('@noble/hashes/pbkdf2');
const { sha256 } = require('@noble/hashes/sha2');

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100_000;

/**
 * Generate cryptographically secure random bytes.
 * @param {number} length - Number of bytes to generate
 * @returns {Uint8Array} Random bytes
 */
function generateRandomBytes(length) {
  if (!Number.isInteger(length) || length < 1) {
    throw new Error('Length must be a positive integer');
  }
  return randomBytes(length);
}

/**
 * Generate a random salt for PBKDF2 key derivation.
 * @returns {Uint8Array} 16-byte random salt
 */
function generateSalt() {
  return generateRandomBytes(SALT_LENGTH);
}

/**
 * Generate a random IV for AES-GCM encryption.
 * @returns {Uint8Array} 12-byte random IV
 */
function generateIV() {
  return generateRandomBytes(IV_LENGTH);
}

/**
 * Derive an AES-256 key from a password and salt using PBKDF2-SHA256.
 * @param {string} password - User password
 * @param {Uint8Array} salt - Random salt (16 bytes)
 * @param {number} [iterations=100000] - PBKDF2 iteration count
 * @returns {Promise<Uint8Array>} 32-byte derived key
 */
async function deriveKey(password, salt, iterations = PBKDF2_ITERATIONS) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password must be a non-empty string');
  }
  if (!(salt instanceof Uint8Array) || salt.length < SALT_LENGTH) {
    throw new Error(`Salt must be a Uint8Array of at least ${SALT_LENGTH} bytes`);
  }
  if (!Number.isInteger(iterations) || iterations < PBKDF2_ITERATIONS) {
    throw new Error(`Iterations must be at least ${PBKDF2_ITERATIONS}`);
  }
  return pbkdf2Async(sha256, password, salt, { c: iterations, dkLen: KEY_LENGTH });
}

/**
 * Encrypt plaintext using AES-256-GCM.
 * @param {Uint8Array} key - 32-byte encryption key
 * @param {Uint8Array} plaintext - Data to encrypt
 * @returns {{ iv: Uint8Array, ciphertext: Uint8Array }} IV and ciphertext (includes auth tag)
 */
function encrypt(key, plaintext) {
  if (!(key instanceof Uint8Array) || key.length !== KEY_LENGTH) {
    throw new Error(`Key must be a ${KEY_LENGTH}-byte Uint8Array`);
  }
  if (!(plaintext instanceof Uint8Array)) {
    throw new Error('Plaintext must be a Uint8Array');
  }
  const iv = generateIV();
  const cipher = gcm(key, iv);
  const ciphertext = cipher.encrypt(plaintext);
  return { iv, ciphertext };
}

/**
 * Decrypt ciphertext using AES-256-GCM with auth tag verification.
 * @param {Uint8Array} key - 32-byte encryption key
 * @param {Uint8Array} iv - 12-byte initialization vector
 * @param {Uint8Array} ciphertext - Encrypted data (includes auth tag)
 * @returns {Uint8Array} Decrypted plaintext
 * @throws {Error} If authentication tag verification fails
 */
function decrypt(key, iv, ciphertext) {
  if (!(key instanceof Uint8Array) || key.length !== KEY_LENGTH) {
    throw new Error(`Key must be a ${KEY_LENGTH}-byte Uint8Array`);
  }
  if (!(iv instanceof Uint8Array) || iv.length !== IV_LENGTH) {
    throw new Error(`IV must be a ${IV_LENGTH}-byte Uint8Array`);
  }
  if (!(ciphertext instanceof Uint8Array)) {
    throw new Error('Ciphertext must be a Uint8Array');
  }
  try {
    const cipher = gcm(key, iv);
    return cipher.decrypt(ciphertext);
  } catch (_err) {
    throw new Error('Decryption failed: authentication tag verification failed');
  }
}

/**
 * Encode a Uint8Array to a base64 string.
 * @param {Uint8Array} bytes - Bytes to encode
 * @returns {string} Base64 encoded string
 */
function toBase64(bytes) {
  return Buffer.from(bytes).toString('base64');
}

/**
 * Decode a base64 string to a Uint8Array.
 * @param {string} base64 - Base64 encoded string
 * @returns {Uint8Array} Decoded bytes
 */
function fromBase64(base64) {
  return new Uint8Array(Buffer.from(base64, 'base64'));
}

module.exports = {
  generateRandomBytes,
  generateSalt,
  generateIV,
  deriveKey,
  encrypt,
  decrypt,
  toBase64,
  fromBase64,
  SALT_LENGTH,
  IV_LENGTH,
  KEY_LENGTH,
  PBKDF2_ITERATIONS,
};
