'use strict';

class VaultLockedError extends Error {
  constructor(message = 'Vault is locked') {
    super(message);
    this.name = 'VaultLockedError';
  }
}

class DecryptionError extends Error {
  constructor(message = 'Decryption failed') {
    super(message);
    this.name = 'DecryptionError';
  }
}

class InvalidPasswordError extends Error {
  constructor(message = 'Invalid password') {
    super(message);
    this.name = 'InvalidPasswordError';
  }
}

module.exports = { VaultLockedError, DecryptionError, InvalidPasswordError };
