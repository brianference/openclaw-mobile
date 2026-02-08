'use strict';

const {
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
} = require('../src/crypto');

describe('crypto', () => {
  describe('generateRandomBytes', () => {
    it('generates bytes of requested length', () => {
      const bytes = generateRandomBytes(32);
      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBe(32);
    });

    it('generates different bytes each call', () => {
      const a = generateRandomBytes(16);
      const b = generateRandomBytes(16);
      expect(Buffer.from(a).equals(Buffer.from(b))).toBe(false);
    });

    it('throws on invalid length', () => {
      expect(() => generateRandomBytes(0)).toThrow();
      expect(() => generateRandomBytes(-1)).toThrow();
      expect(() => generateRandomBytes(1.5)).toThrow();
    });
  });

  describe('generateSalt', () => {
    it('generates 16-byte salt', () => {
      const salt = generateSalt();
      expect(salt.length).toBe(SALT_LENGTH);
    });
  });

  describe('generateIV', () => {
    it('generates 12-byte IV', () => {
      const iv = generateIV();
      expect(iv.length).toBe(IV_LENGTH);
    });

    it('generates unique IVs', () => {
      const ivs = new Set();
      for (let i = 0; i < 100; i++) {
        ivs.add(toBase64(generateIV()));
      }
      expect(ivs.size).toBe(100);
    });
  });

  describe('deriveKey', () => {
    it('derives a 32-byte key', async () => {
      const salt = generateSalt();
      const key = await deriveKey('password', salt);
      expect(key).toBeInstanceOf(Uint8Array);
      expect(key.length).toBe(KEY_LENGTH);
    });

    it('same password + salt → same key', async () => {
      const salt = generateSalt();
      const key1 = await deriveKey('password', salt);
      const key2 = await deriveKey('password', salt);
      expect(Buffer.from(key1).equals(Buffer.from(key2))).toBe(true);
    });

    it('different passwords → different keys', async () => {
      const salt = generateSalt();
      const key1 = await deriveKey('password1', salt);
      const key2 = await deriveKey('password2', salt);
      expect(Buffer.from(key1).equals(Buffer.from(key2))).toBe(false);
    });

    it('different salts → different keys', async () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      const key1 = await deriveKey('password', salt1);
      const key2 = await deriveKey('password', salt2);
      expect(Buffer.from(key1).equals(Buffer.from(key2))).toBe(false);
    });

    it('rejects empty password', async () => {
      const salt = generateSalt();
      await expect(deriveKey('', salt)).rejects.toThrow();
    });

    it('rejects insufficient salt', async () => {
      await expect(deriveKey('pass', new Uint8Array(8))).rejects.toThrow();
    });

    it('rejects iterations below minimum', async () => {
      const salt = generateSalt();
      await expect(deriveKey('pass', salt, 1000)).rejects.toThrow();
    });

    it('uses at least 100,000 iterations', () => {
      expect(PBKDF2_ITERATIONS).toBeGreaterThanOrEqual(100_000);
    });
  });

  describe('encrypt / decrypt', () => {
    let key;

    beforeEach(async () => {
      const salt = generateSalt();
      key = await deriveKey('testpassword', salt);
    });

    it('round-trips plaintext correctly', () => {
      const plaintext = new TextEncoder().encode('hello world');
      const { iv, ciphertext } = encrypt(key, plaintext);
      const decrypted = decrypt(key, iv, ciphertext);
      expect(new TextDecoder().decode(decrypted)).toBe('hello world');
    });

    it('produces different ciphertexts for same plaintext (IV uniqueness)', () => {
      const plaintext = new TextEncoder().encode('same data');
      const result1 = encrypt(key, plaintext);
      const result2 = encrypt(key, plaintext);
      expect(toBase64(result1.ciphertext)).not.toBe(toBase64(result2.ciphertext));
      expect(toBase64(result1.iv)).not.toBe(toBase64(result2.iv));
    });

    it('fails to decrypt with tampered ciphertext', () => {
      const plaintext = new TextEncoder().encode('secret');
      const { iv, ciphertext } = encrypt(key, plaintext);
      // Flip a bit in the ciphertext
      const tampered = new Uint8Array(ciphertext);
      tampered[0] ^= 0xff;
      expect(() => decrypt(key, iv, tampered)).toThrow('authentication tag verification failed');
    });

    it('fails to decrypt with tampered auth tag', () => {
      const plaintext = new TextEncoder().encode('secret');
      const { iv, ciphertext } = encrypt(key, plaintext);
      // Auth tag is the last 16 bytes
      const tampered = new Uint8Array(ciphertext);
      tampered[tampered.length - 1] ^= 0xff;
      expect(() => decrypt(key, iv, tampered)).toThrow('authentication tag verification failed');
    });

    it('fails to decrypt with wrong key', async () => {
      const plaintext = new TextEncoder().encode('secret');
      const { iv, ciphertext } = encrypt(key, plaintext);
      const wrongSalt = generateSalt();
      const wrongKey = await deriveKey('wrongpass', wrongSalt);
      expect(() => decrypt(wrongKey, iv, ciphertext)).toThrow();
    });

    it('rejects invalid key size', () => {
      const plaintext = new TextEncoder().encode('test');
      expect(() => encrypt(new Uint8Array(16), plaintext)).toThrow();
    });

    it('rejects invalid IV size', () => {
      const ciphertext = new Uint8Array(32);
      expect(() => decrypt(key, new Uint8Array(8), ciphertext)).toThrow();
    });

    it('handles empty plaintext', () => {
      const plaintext = new Uint8Array(0);
      const { iv, ciphertext } = encrypt(key, plaintext);
      const decrypted = decrypt(key, iv, ciphertext);
      expect(decrypted.length).toBe(0);
    });

    it('handles large plaintext', () => {
      const plaintext = new Uint8Array(100_000).fill(42);
      const { iv, ciphertext } = encrypt(key, plaintext);
      const decrypted = decrypt(key, iv, ciphertext);
      expect(Buffer.from(decrypted).equals(Buffer.from(plaintext))).toBe(true);
    });
  });

  describe('base64 encoding', () => {
    it('round-trips bytes correctly', () => {
      const original = generateRandomBytes(32);
      const encoded = toBase64(original);
      const decoded = fromBase64(encoded);
      expect(Buffer.from(decoded).equals(Buffer.from(original))).toBe(true);
    });

    it('produces valid base64 string', () => {
      const bytes = new Uint8Array([0, 127, 255]);
      const b64 = toBase64(bytes);
      expect(typeof b64).toBe('string');
      expect(b64).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });
  });
});
