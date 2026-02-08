# @mobileclaw/vault-encryption

Secure encrypted vault for Mobileclaw using **AES-256-GCM** authenticated encryption with **PBKDF2-SHA256** key derivation.

Built on audited, pure-JS crypto libraries (`@noble/ciphers`, `@noble/hashes`) — compatible with React Native, Expo, and Node.js.

## Installation

```bash
npm install
```

## Quick Start

```javascript
const { Vault } = require('./src/vault');

// Create a vault with a master password
const vault = await Vault.create('my-strong-password');

// Store encrypted values
vault.set('api_key', 'sk-abc123');
vault.set('token', 'tok_secret');

// Retrieve decrypted values
const key = vault.get('api_key'); // 'sk-abc123'

// Lock the vault (clears key from memory)
vault.lock();

// Unlock with password
await vault.unlock('my-strong-password');

// Export for storage (encrypted JSON, safe to persist)
const json = vault.export();

// Import from exported JSON
const restored = await Vault.import(json, 'my-strong-password');
```

## API Reference

### `Vault.create(password)` → `Promise<Vault>`

Create a new vault. Generates a random 16-byte salt and derives an AES-256 key via PBKDF2-SHA256 (100,000 iterations).

### `Vault.import(json, password)` → `Promise<Vault>`

Import an encrypted vault from JSON. Verifies the password by attempting to decrypt the first entry.

### `vault.set(key, value)`

Encrypt and store a string value. Each value gets a unique 12-byte IV.

### `vault.get(key)` → `string | undefined`

Decrypt and return a stored value. Returns `undefined` if key doesn't exist.

### `vault.has(key)` → `boolean`

Check if a key exists.

### `vault.delete(key)` → `boolean`

Remove a key. Returns `true` if the key existed.

### `vault.keys()` → `string[]`

List all stored key names.

### `vault.lock()`

Lock the vault. Zeroes out the derived key in memory. All get/set operations will throw `VaultLockedError`.

### `vault.unlock(password)` → `Promise<void>`

Unlock the vault by re-deriving the key. Throws `InvalidPasswordError` if the password is wrong.

### `vault.export()` → `string`

Export the vault as encrypted JSON. Contains no plaintext values or keys.

### `vault.isLocked` → `boolean`

Check if the vault is currently locked.

## EncryptedStorage

Higher-level interface that wraps `Vault` with a persistence backend:

```javascript
const { EncryptedStorage } = require('./src/storage');

// Backend must implement get(key), set(key, value), remove(key)
const backend = {
  store: {},
  get: async (k) => this.store[k],
  set: async (k, v) => { this.store[k] = v; },
  remove: async (k) => { delete this.store[k]; },
};

const storage = new EncryptedStorage(backend);
await storage.initialize('password');
await storage.set('secret', 'value');
const val = await storage.get('secret');
```

## Error Types

| Error | When |
|---|---|
| `VaultLockedError` | Attempting get/set/has/delete/keys while locked |
| `InvalidPasswordError` | Wrong password on unlock or import |
| `DecryptionError` | Tampered ciphertext or corrupted data |

## Security Properties

- **AES-256-GCM**: Authenticated encryption prevents tampering
- **PBKDF2-SHA256**: 100,000 iterations for key derivation (OWASP 2024)
- **Unique IV**: Every encryption uses a random 12-byte IV
- **Unique salt**: Every vault gets a random 16-byte salt
- **Key zeroing**: `lock()` overwrites the key buffer with zeros
- **No leakage**: `toString()`, `toJSON()`, and `export()` never reveal keys or plaintext
- **Auth tag verification**: Tampered data is detected and rejected

## Security Audit Checklist

- [x] AES-256-GCM (no other algorithms)
- [x] PBKDF2 with 100,000+ iterations
- [x] Random 16-byte salt per vault
- [x] Random 12-byte IV per encryption
- [x] Keys never logged or exposed
- [x] No hardcoded secrets
- [x] Auth tag verification on every decrypt
- [x] Key zeroed on lock
- [x] Tamper detection verified in tests
- [x] Wrong password detection verified in tests
- [x] IV uniqueness verified in tests
- [x] No plaintext in exported data

## Testing

```bash
npm test              # Run all tests
npm test -- --coverage  # With coverage report
npm run lint          # ESLint check
npm audit             # Security audit
```

## Dependencies

| Package | Purpose | Audited |
|---|---|---|
| `@noble/ciphers` | AES-256-GCM encryption | Yes |
| `@noble/hashes` | PBKDF2-SHA256 key derivation | Yes |
