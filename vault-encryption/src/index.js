'use strict';

const { Vault } = require('./vault');
const { EncryptedStorage } = require('./storage');
const { VaultLockedError, DecryptionError, InvalidPasswordError } = require('./errors');

module.exports = {
  Vault,
  EncryptedStorage,
  VaultLockedError,
  DecryptionError,
  InvalidPasswordError,
};
