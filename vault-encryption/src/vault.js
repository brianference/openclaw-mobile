'use strict';

const {
  generateSalt,
  deriveKey,
  encrypt,
  decrypt,
  toBase64,
  fromBase64,
} = require('./crypto');
const { VaultLockedError, DecryptionError, InvalidPasswordError } = require('./errors');

const VAULT_VERSION = 1;

class Vault {
  /**
   * @private Use Vault.create() or Vault.import() instead.
   */
  constructor() {
    this._key = null;
    this._salt = null;
    this._data = {};
    this._locked = true;
  }

  /**
   * Create a new encrypted vault with a password.
   * Generates a random salt and derives an encryption key via PBKDF2-SHA256.
   * @param {string} password - Master password for the vault
   * @returns {Promise<Vault>} Unlocked vault instance
   */
  static async create(password) {
    if (typeof password !== 'string' || password.length === 0) {
      throw new Error('Password must be a non-empty string');
    }
    const vault = new Vault();
    vault._salt = generateSalt();
    vault._key = await deriveKey(password, vault._salt);
    vault._data = {};
    vault._locked = false;
    return vault;
  }

  /**
   * Import an encrypted vault from JSON and unlock it with a password.
   * @param {string} json - Encrypted vault JSON (from vault.export())
   * @param {string} password - Master password
   * @returns {Promise<Vault>} Unlocked vault instance
   * @throws {InvalidPasswordError} If the password is wrong
   */
  static async import(json, password) {
    if (typeof json !== 'string') {
      throw new Error('JSON must be a string');
    }
    if (typeof password !== 'string' || password.length === 0) {
      throw new Error('Password must be a non-empty string');
    }

    const parsed = JSON.parse(json);
    if (parsed.version !== VAULT_VERSION) {
      throw new Error(`Unsupported vault version: ${parsed.version}`);
    }

    const vault = new Vault();
    vault._salt = fromBase64(parsed.salt);
    vault._data = parsed.data || {};
    vault._key = await deriveKey(password, vault._salt);
    vault._locked = false;

    // Verify password by attempting to decrypt the first entry
    const keys = Object.keys(vault._data);
    if (keys.length > 0) {
      try {
        const entry = vault._data[keys[0]];
        const iv = fromBase64(entry.iv);
        const ciphertext = fromBase64(entry.ciphertext);
        decrypt(vault._key, iv, ciphertext);
      } catch (_err) {
        vault._key = null;
        vault._locked = true;
        throw new InvalidPasswordError();
      }
    }

    return vault;
  }

  /**
   * Store an encrypted key-value pair in the vault.
   * Each value is encrypted with a unique IV.
   * @param {string} key - Storage key
   * @param {string} value - Plaintext value to encrypt
   * @throws {VaultLockedError} If the vault is locked
   */
  set(key, value) {
    this._requireUnlocked();
    if (typeof key !== 'string' || key.length === 0) {
      throw new Error('Key must be a non-empty string');
    }
    if (typeof value !== 'string') {
      throw new Error('Value must be a string');
    }

    const plaintext = new TextEncoder().encode(value);
    const { iv, ciphertext } = encrypt(this._key, plaintext);
    this._data[key] = {
      iv: toBase64(iv),
      ciphertext: toBase64(ciphertext),
    };
  }

  /**
   * Retrieve and decrypt a value from the vault.
   * @param {string} key - Storage key
   * @returns {string|undefined} Decrypted value, or undefined if key doesn't exist
   * @throws {VaultLockedError} If the vault is locked
   * @throws {DecryptionError} If decryption fails
   */
  get(key) {
    this._requireUnlocked();
    if (typeof key !== 'string' || key.length === 0) {
      throw new Error('Key must be a non-empty string');
    }

    const entry = this._data[key];
    if (!entry) {
      return undefined;
    }

    try {
      const iv = fromBase64(entry.iv);
      const ciphertext = fromBase64(entry.ciphertext);
      const plaintext = decrypt(this._key, iv, ciphertext);
      return new TextDecoder().decode(plaintext);
    } catch (_err) {
      throw new DecryptionError('Failed to decrypt value');
    }
  }

  /**
   * Check if a key exists in the vault.
   * @param {string} key - Storage key
   * @returns {boolean} True if the key exists
   * @throws {VaultLockedError} If the vault is locked
   */
  has(key) {
    this._requireUnlocked();
    return key in this._data;
  }

  /**
   * Delete a key from the vault.
   * @param {string} key - Storage key
   * @returns {boolean} True if the key was deleted
   * @throws {VaultLockedError} If the vault is locked
   */
  delete(key) {
    this._requireUnlocked();
    if (key in this._data) {
      delete this._data[key];
      return true;
    }
    return false;
  }

  /**
   * List all keys in the vault.
   * @returns {string[]} Array of key names
   * @throws {VaultLockedError} If the vault is locked
   */
  keys() {
    this._requireUnlocked();
    return Object.keys(this._data);
  }

  /**
   * Lock the vault, clearing the derived key from memory.
   * After locking, get/set operations will throw VaultLockedError.
   */
  lock() {
    if (this._key) {
      this._key.fill(0);
    }
    this._key = null;
    this._locked = true;
  }

  /**
   * Unlock the vault by re-deriving the encryption key.
   * @param {string} password - Master password
   * @throws {InvalidPasswordError} If the password is wrong
   */
  async unlock(password) {
    if (typeof password !== 'string' || password.length === 0) {
      throw new Error('Password must be a non-empty string');
    }

    const key = await deriveKey(password, this._salt);

    // Verify password by attempting to decrypt first entry
    const dataKeys = Object.keys(this._data);
    if (dataKeys.length > 0) {
      try {
        const entry = this._data[dataKeys[0]];
        const iv = fromBase64(entry.iv);
        const ciphertext = fromBase64(entry.ciphertext);
        decrypt(key, iv, ciphertext);
      } catch (_err) {
        key.fill(0);
        throw new InvalidPasswordError();
      }
    }

    this._key = key;
    this._locked = false;
  }

  /**
   * Check if the vault is currently locked.
   * @returns {boolean} True if locked
   */
  get isLocked() {
    return this._locked;
  }

  /**
   * Export the vault as encrypted JSON. Safe to store or transmit.
   * Contains no plaintext values or encryption keys.
   * @returns {string} JSON string of the encrypted vault
   */
  export() {
    return JSON.stringify({
      version: VAULT_VERSION,
      salt: toBase64(this._salt),
      data: this._data,
    });
  }

  /**
   * @private Throw VaultLockedError if vault is locked.
   */
  _requireUnlocked() {
    if (this._locked) {
      throw new VaultLockedError();
    }
  }

  /**
   * Custom toString that never reveals keys or plaintext.
   * @returns {string}
   */
  toString() {
    return `[Vault locked=${this._locked} entries=${Object.keys(this._data).length}]`;
  }

  /**
   * Custom inspect for Node.js that never reveals keys or plaintext.
   * @returns {string}
   */
  [Symbol.for('nodejs.util.inspect.custom')]() {
    return this.toString();
  }

  /**
   * Prevent JSON.stringify from leaking internal state.
   * @returns {object}
   */
  toJSON() {
    return { type: 'Vault', locked: this._locked, entries: Object.keys(this._data).length };
  }
}

module.exports = { Vault };
