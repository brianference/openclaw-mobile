'use strict';

const { EncryptedStorage } = require('../src/storage');
const { VaultLockedError } = require('../src/errors');

/** Simple in-memory backend for testing */
function createMemoryBackend() {
  const store = new Map();
  return {
    get: async (key) => store.get(key) || null,
    set: async (key, value) => store.set(key, value),
    remove: async (key) => store.delete(key),
    _store: store,
  };
}

describe('EncryptedStorage', () => {
  const PASSWORD = 'storage-test-password!';

  it('requires a valid backend', () => {
    expect(() => new EncryptedStorage(null)).toThrow();
    expect(() => new EncryptedStorage({})).toThrow();
  });

  describe('initialize + basic operations', () => {
    let storage;
    let backend;

    beforeEach(async () => {
      backend = createMemoryBackend();
      storage = new EncryptedStorage(backend);
      await storage.initialize(PASSWORD);
    });

    it('initializes an unlocked storage', () => {
      expect(storage.isLocked).toBe(false);
    });

    it('stores and retrieves a value', async () => {
      await storage.set('key', 'value');
      const result = await storage.get('key');
      expect(result).toBe('value');
    });

    it('persists to backend on set', async () => {
      await storage.set('key', 'value');
      expect(backend._store.has('encrypted_vault')).toBe(true);
    });

    it('checks key existence', async () => {
      await storage.set('key', 'value');
      expect(await storage.has('key')).toBe(true);
      expect(await storage.has('missing')).toBe(false);
    });

    it('deletes a key', async () => {
      await storage.set('key', 'value');
      expect(await storage.delete('key')).toBe(true);
      expect(await storage.has('key')).toBe(false);
    });

    it('lists keys', async () => {
      await storage.set('a', '1');
      await storage.set('b', '2');
      expect(storage.keys().sort()).toEqual(['a', 'b']);
    });
  });

  describe('lock / unlock', () => {
    let storage;
    let backend;

    beforeEach(async () => {
      backend = createMemoryBackend();
      storage = new EncryptedStorage(backend);
      await storage.initialize(PASSWORD);
      await storage.set('secret', 'data');
    });

    it('lock prevents access', () => {
      storage.lock();
      expect(storage.isLocked).toBe(true);
      expect(() => storage.keys()).toThrow(VaultLockedError);
    });

    it('unlock restores access', async () => {
      storage.lock();
      await storage.unlock(PASSWORD);
      expect(storage.isLocked).toBe(false);
      expect(await storage.get('secret')).toBe('data');
    });
  });

  describe('load from backend', () => {
    it('loads and decrypts from persisted data', async () => {
      const backend = createMemoryBackend();
      const storage1 = new EncryptedStorage(backend);
      await storage1.initialize(PASSWORD);
      await storage1.set('key', 'value');

      const storage2 = new EncryptedStorage(backend);
      await storage2.load(PASSWORD);
      expect(await storage2.get('key')).toBe('value');
    });

    it('throws when no vault in storage', async () => {
      const backend = createMemoryBackend();
      const storage = new EncryptedStorage(backend);
      await expect(storage.load(PASSWORD)).rejects.toThrow('No vault found');
    });
  });

  describe('destroy', () => {
    it('removes vault from backend', async () => {
      const backend = createMemoryBackend();
      const storage = new EncryptedStorage(backend);
      await storage.initialize(PASSWORD);
      await storage.set('key', 'value');
      await storage.destroy();
      expect(storage.isLocked).toBe(true);
      expect(backend._store.has('encrypted_vault')).toBe(false);
    });
  });

  describe('operations before initialization', () => {
    it('throws on get before init', async () => {
      const backend = createMemoryBackend();
      const storage = new EncryptedStorage(backend);
      await expect(storage.get('key')).rejects.toThrow('not initialized');
    });

    it('throws on set before init', async () => {
      const backend = createMemoryBackend();
      const storage = new EncryptedStorage(backend);
      await expect(storage.set('key', 'val')).rejects.toThrow('not initialized');
    });
  });

  describe('custom storage key', () => {
    it('uses custom key for backend storage', async () => {
      const backend = createMemoryBackend();
      const storage = new EncryptedStorage(backend, 'my_custom_vault');
      await storage.initialize(PASSWORD);
      await storage.set('k', 'v');
      expect(backend._store.has('my_custom_vault')).toBe(true);
      expect(backend._store.has('encrypted_vault')).toBe(false);
    });
  });
});
