'use strict';

const { Vault } = require('../src/vault');
const { VaultLockedError, InvalidPasswordError } = require('../src/errors');

describe('Vault', () => {
  const PASSWORD = 'strong-test-password-123!';

  describe('Vault.create', () => {
    it('creates an unlocked vault', async () => {
      const vault = await Vault.create(PASSWORD);
      expect(vault.isLocked).toBe(false);
    });

    it('rejects empty password', async () => {
      await expect(Vault.create('')).rejects.toThrow();
    });

    it('rejects non-string password', async () => {
      await expect(Vault.create(123)).rejects.toThrow();
    });
  });

  describe('set / get', () => {
    let vault;

    beforeEach(async () => {
      vault = await Vault.create(PASSWORD);
    });

    it('stores and retrieves a value', () => {
      vault.set('api_key', 'secret123');
      expect(vault.get('api_key')).toBe('secret123');
    });

    it('stores multiple values', () => {
      vault.set('key1', 'value1');
      vault.set('key2', 'value2');
      expect(vault.get('key1')).toBe('value1');
      expect(vault.get('key2')).toBe('value2');
    });

    it('overwrites existing values', () => {
      vault.set('key', 'old');
      vault.set('key', 'new');
      expect(vault.get('key')).toBe('new');
    });

    it('returns undefined for missing keys', () => {
      expect(vault.get('nonexistent')).toBeUndefined();
    });

    it('handles special characters', () => {
      const value = '{"token":"abc","emoji":"🔐","unicode":"日本語"}';
      vault.set('special', value);
      expect(vault.get('special')).toBe(value);
    });

    it('handles empty string value', () => {
      vault.set('empty', '');
      expect(vault.get('empty')).toBe('');
    });

    it('handles long values', () => {
      const longValue = 'x'.repeat(10_000);
      vault.set('long', longValue);
      expect(vault.get('long')).toBe(longValue);
    });

    it('rejects empty key', () => {
      expect(() => vault.set('', 'value')).toThrow();
    });

    it('rejects non-string value', () => {
      expect(() => vault.set('key', 123)).toThrow();
    });
  });

  describe('has / delete / keys', () => {
    let vault;

    beforeEach(async () => {
      vault = await Vault.create(PASSWORD);
      vault.set('a', '1');
      vault.set('b', '2');
    });

    it('has returns true for existing keys', () => {
      expect(vault.has('a')).toBe(true);
    });

    it('has returns false for missing keys', () => {
      expect(vault.has('c')).toBe(false);
    });

    it('delete removes a key', () => {
      expect(vault.delete('a')).toBe(true);
      expect(vault.has('a')).toBe(false);
      expect(vault.get('a')).toBeUndefined();
    });

    it('delete returns false for missing key', () => {
      expect(vault.delete('c')).toBe(false);
    });

    it('keys returns all key names', () => {
      expect(vault.keys().sort()).toEqual(['a', 'b']);
    });
  });

  describe('lock / unlock', () => {
    let vault;

    beforeEach(async () => {
      vault = await Vault.create(PASSWORD);
      vault.set('secret', 'data');
    });

    it('lock sets isLocked to true', () => {
      vault.lock();
      expect(vault.isLocked).toBe(true);
    });

    it('locked vault throws VaultLockedError on get', () => {
      vault.lock();
      expect(() => vault.get('secret')).toThrow(VaultLockedError);
    });

    it('locked vault throws VaultLockedError on set', () => {
      vault.lock();
      expect(() => vault.set('new', 'value')).toThrow(VaultLockedError);
    });

    it('locked vault throws VaultLockedError on has', () => {
      vault.lock();
      expect(() => vault.has('secret')).toThrow(VaultLockedError);
    });

    it('locked vault throws VaultLockedError on delete', () => {
      vault.lock();
      expect(() => vault.delete('secret')).toThrow(VaultLockedError);
    });

    it('locked vault throws VaultLockedError on keys', () => {
      vault.lock();
      expect(() => vault.keys()).toThrow(VaultLockedError);
    });

    it('unlock with correct password restores access', async () => {
      vault.lock();
      await vault.unlock(PASSWORD);
      expect(vault.isLocked).toBe(false);
      expect(vault.get('secret')).toBe('data');
    });

    it('unlock with wrong password throws InvalidPasswordError', async () => {
      vault.lock();
      await expect(vault.unlock('wrong-password')).rejects.toThrow(InvalidPasswordError);
      expect(vault.isLocked).toBe(true);
    });

    it('unlock with empty password throws', async () => {
      vault.lock();
      await expect(vault.unlock('')).rejects.toThrow();
    });
  });

  describe('export / import', () => {
    it('round-trips through export/import', async () => {
      const vault = await Vault.create(PASSWORD);
      vault.set('api_key', 'secret123');
      vault.set('token', 'tok_abc');

      const exported = vault.export();
      const imported = await Vault.import(exported, PASSWORD);

      expect(imported.get('api_key')).toBe('secret123');
      expect(imported.get('token')).toBe('tok_abc');
    });

    it('exported JSON contains no plaintext values', async () => {
      const vault = await Vault.create(PASSWORD);
      vault.set('api_key', 'secret123');

      const exported = vault.export();
      expect(exported).not.toContain('secret123');
      expect(exported).not.toContain('api_key_value');
    });

    it('exported JSON contains version and salt', async () => {
      const vault = await Vault.create(PASSWORD);
      const exported = vault.export();
      const parsed = JSON.parse(exported);
      expect(parsed.version).toBe(1);
      expect(typeof parsed.salt).toBe('string');
      expect(parsed.data).toBeDefined();
    });

    it('import with wrong password throws InvalidPasswordError', async () => {
      const vault = await Vault.create(PASSWORD);
      vault.set('key', 'value');
      const exported = vault.export();

      await expect(Vault.import(exported, 'wrong-password')).rejects.toThrow(InvalidPasswordError);
    });

    it('import empty vault with any password succeeds', async () => {
      const vault = await Vault.create(PASSWORD);
      const exported = vault.export();
      // Empty vault has no entries to verify against, so any password derives a key
      const imported = await Vault.import(exported, 'different-password');
      expect(imported.isLocked).toBe(false);
    });

    it('rejects invalid JSON', async () => {
      await expect(Vault.import('not json', PASSWORD)).rejects.toThrow();
    });

    it('rejects non-string input', async () => {
      await expect(Vault.import(123, PASSWORD)).rejects.toThrow();
    });
  });

  describe('encryption uniqueness', () => {
    it('same plaintext produces different ciphertexts', async () => {
      const vault = await Vault.create(PASSWORD);
      vault.set('key1', 'same-value');
      vault.set('key2', 'same-value');

      const exported = JSON.parse(vault.export());
      expect(exported.data.key1.iv).not.toBe(exported.data.key2.iv);
      expect(exported.data.key1.ciphertext).not.toBe(exported.data.key2.ciphertext);
    });

    it('multiple IVs are all unique', async () => {
      const vault = await Vault.create(PASSWORD);
      const ivs = new Set();
      for (let i = 0; i < 50; i++) {
        vault.set(`key${i}`, 'value');
      }
      const exported = JSON.parse(vault.export());
      for (const entry of Object.values(exported.data)) {
        ivs.add(entry.iv);
      }
      expect(ivs.size).toBe(50);
    });
  });

  describe('tamper detection', () => {
    it('detects tampered ciphertext on import', async () => {
      const vault = await Vault.create(PASSWORD);
      vault.set('key', 'value');

      const exported = JSON.parse(vault.export());
      const ct = Buffer.from(exported.data.key.ciphertext, 'base64');
      ct[0] ^= 0xff;
      exported.data.key.ciphertext = ct.toString('base64');

      await expect(Vault.import(JSON.stringify(exported), PASSWORD))
        .rejects.toThrow(InvalidPasswordError);
    });

    it('detects tampered IV on import', async () => {
      const vault = await Vault.create(PASSWORD);
      vault.set('key', 'value');

      const exported = JSON.parse(vault.export());
      const iv = Buffer.from(exported.data.key.iv, 'base64');
      iv[0] ^= 0xff;
      exported.data.key.iv = iv.toString('base64');

      await expect(Vault.import(JSON.stringify(exported), PASSWORD))
        .rejects.toThrow(InvalidPasswordError);
    });
  });

  describe('no key leakage', () => {
    it('toString reveals no secrets', async () => {
      const vault = await Vault.create(PASSWORD);
      vault.set('api_key', 'secret123');
      const str = vault.toString();
      expect(str).not.toContain('secret123');
      expect(str).not.toContain(PASSWORD);
      expect(str).toContain('Vault');
    });

    it('toJSON reveals no secrets', async () => {
      const vault = await Vault.create(PASSWORD);
      vault.set('api_key', 'secret123');
      const json = JSON.stringify(vault);
      expect(json).not.toContain('secret123');
      expect(json).not.toContain(PASSWORD);
      expect(json).not.toContain('_key');
    });

    it('export contains no plaintext keys or values', async () => {
      const vault = await Vault.create(PASSWORD);
      vault.set('my_api_key', 'super_secret_value');
      const exported = vault.export();
      expect(exported).not.toContain('super_secret_value');
      expect(exported).not.toContain(PASSWORD);
    });
  });

  describe('lock clears key from memory', () => {
    it('zeroes out the key buffer on lock', async () => {
      const vault = await Vault.create(PASSWORD);
      vault.set('key', 'value');
      // Access internal key before locking
      const keyRef = vault._key;
      expect(keyRef).not.toBeNull();

      vault.lock();
      // Key should be zeroed out
      const allZeros = keyRef.every(b => b === 0);
      expect(allZeros).toBe(true);
    });
  });
});
