'use strict';

const { Vault } = require('./vault');

/**
 * Encrypted storage interface that wraps a Vault with a persistence backend.
 * In React Native, the backend would be AsyncStorage or SecureStore.
 * For portability, this accepts any backend with get/set/remove methods.
 */
class EncryptedStorage {
  /**
   * Create an EncryptedStorage instance.
   * @param {object} backend - Storage backend with get(key), set(key, value), remove(key) methods
   * @param {string} [storageKey='encrypted_vault'] - Key used to store the vault in the backend
   */
  constructor(backend, storageKey = 'encrypted_vault') {
    if (!backend || typeof backend.get !== 'function' || typeof backend.set !== 'function') {
      throw new Error('Backend must implement get(key) and set(key, value) methods');
    }
    this._backend = backend;
    this._storageKey = storageKey;
    this._vault = null;
  }

  /**
   * Initialize a new encrypted vault and persist it.
   * @param {string} password - Master password
   * @returns {Promise<void>}
   */
  async initialize(password) {
    this._vault = await Vault.create(password);
    await this._persist();
  }

  /**
   * Load an existing vault from the backend and unlock it.
   * @param {string} password - Master password
   * @returns {Promise<void>}
   * @throws {Error} If no vault is found in the backend
   */
  async load(password) {
    const json = await this._backend.get(this._storageKey);
    if (!json) {
      throw new Error('No vault found in storage');
    }
    this._vault = await Vault.import(json, password);
  }

  /**
   * Store an encrypted value.
   * @param {string} key - Storage key
   * @param {string} value - Plaintext value to encrypt
   * @returns {Promise<void>}
   */
  async set(key, value) {
    this._requireVault();
    this._vault.set(key, value);
    await this._persist();
  }

  /**
   * Retrieve and decrypt a value.
   * @param {string} key - Storage key
   * @returns {Promise<string|undefined>} Decrypted value
   */
  async get(key) {
    this._requireVault();
    return this._vault.get(key);
  }

  /**
   * Check if a key exists.
   * @param {string} key - Storage key
   * @returns {Promise<boolean>}
   */
  async has(key) {
    this._requireVault();
    return this._vault.has(key);
  }

  /**
   * Delete a key and persist the change.
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} True if key was deleted
   */
  async delete(key) {
    this._requireVault();
    const deleted = this._vault.delete(key);
    if (deleted) {
      await this._persist();
    }
    return deleted;
  }

  /**
   * List all keys.
   * @returns {string[]}
   */
  keys() {
    this._requireVault();
    return this._vault.keys();
  }

  /**
   * Lock the vault (clears key from memory).
   */
  lock() {
    if (this._vault) {
      this._vault.lock();
    }
  }

  /**
   * Unlock the vault with the master password.
   * @param {string} password - Master password
   * @returns {Promise<void>}
   */
  async unlock(password) {
    this._requireVault();
    await this._vault.unlock(password);
  }

  /**
   * Check if the vault is locked.
   * @returns {boolean}
   */
  get isLocked() {
    return !this._vault || this._vault.isLocked;
  }

  /**
   * Destroy the vault from the backend.
   * @returns {Promise<void>}
   */
  async destroy() {
    if (this._vault) {
      this._vault.lock();
      this._vault = null;
    }
    if (typeof this._backend.remove === 'function') {
      await this._backend.remove(this._storageKey);
    }
  }

  /** @private */
  async _persist() {
    const json = this._vault.export();
    await this._backend.set(this._storageKey, json);
  }

  /** @private */
  _requireVault() {
    if (!this._vault) {
      throw new Error('Vault not initialized. Call initialize() or load() first.');
    }
  }
}

module.exports = { EncryptedStorage };
