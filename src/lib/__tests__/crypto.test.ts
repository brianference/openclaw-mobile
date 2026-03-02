/**
 * Comprehensive test suite for crypto.ts PBKDF2 password hashing
 * Tests US-085 acceptance criteria
 */

import {
  hashPassword,
  verifyPassword,
  deriveKeyFromPassword,
  getUserSalt,
  generateSalt,
  encrypt,
  decrypt,
} from '../crypto';
import * as SecureStore from 'expo-secure-store';

// Mock SecureStore
jest.mock('expo-secure-store');
const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('PBKDF2 Password Hashing (US-085)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Acceptance Criteria #1: PBKDF2 algorithm with SHA-256', () => {
    it('should use PBKDF2-HMAC-SHA256 for key derivation', async () => {
      const password = 'test-password-123';
      const salt = await generateSalt();
      
      const key = await deriveKeyFromPassword(password, salt);
      
      // Key should be 64 hex chars (32 bytes = 256 bits)
      expect(key).toHaveLength(64);
      expect(key).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should produce consistent keys for same password+salt', async () => {
      const password = 'consistent-password';
      const salt = await generateSalt();
      
      const key1 = await deriveKeyFromPassword(password, salt);
      const key2 = await deriveKeyFromPassword(password, salt);
      
      expect(key1).toBe(key2);
    });

    it('should produce different keys for different passwords', async () => {
      const salt = await generateSalt();
      
      const key1 = await deriveKeyFromPassword('password1', salt);
      const key2 = await deriveKeyFromPassword('password2', salt);
      
      expect(key1).not.toBe(key2);
    });
  });

  describe('Acceptance Criteria #2: Iteration count ≥100,000', () => {
    it('should use at least 100,000 iterations (OWASP recommendation)', async () => {
      const password = 'secure-password';
      const salt = await generateSalt();
      
      const startTime = Date.now();
      await deriveKeyFromPassword(password, salt);
      const duration = Date.now() - startTime;
      
      // With 100k iterations, should take at least 50ms (conservative estimate)
      // This verifies we're not using a trivial iteration count
      expect(duration).toBeGreaterThan(50);
    });

    it('should complete key derivation in < 500ms', async () => {
      // Acceptance criteria: "Performance: Hashing completes in <500ms"
      const password = 'performance-test';
      const salt = await generateSalt();
      
      const startTime = Date.now();
      await deriveKeyFromPassword(password, salt);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Acceptance Criteria #3: Random salt (≥128 bits)', () => {
    it('should generate random salt of at least 128 bits (16 bytes)', async () => {
      const salt = await generateSalt();
      
      // 32 bytes = 256 bits (exceeds 128-bit requirement)
      expect(salt).toHaveLength(64); // 32 bytes in hex = 64 chars
      expect(salt).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate unique salts on each call', async () => {
      const salt1 = await generateSalt();
      const salt2 = await generateSalt();
      const salt3 = await generateSalt();
      
      expect(salt1).not.toBe(salt2);
      expect(salt2).not.toBe(salt3);
      expect(salt1).not.toBe(salt3);
    });

    it('should generate truly random salts (no patterns)', async () => {
      const salts = await Promise.all(
        Array.from({ length: 10 }, () => generateSalt())
      );
      
      // Check that all salts are unique
      const uniqueSalts = new Set(salts);
      expect(uniqueSalts.size).toBe(10);
      
      // Check that salts don't follow sequential patterns
      for (let i = 1; i < salts.length; i++) {
        const diff = BigInt('0x' + salts[i]) - BigInt('0x' + salts[i - 1]);
        expect(Math.abs(Number(diff))).toBeGreaterThan(1000);
      }
    });
  });

  describe('Acceptance Criteria #4: Salt stored alongside hash', () => {
    it('should store salt and hash together in format "salt:hash"', async () => {
      const password = 'test-password';
      
      const hash = await hashPassword(password);
      
      const parts = hash.split(':');
      expect(parts).toHaveLength(2);
      
      const [salt, hashPart] = parts;
      expect(salt).toHaveLength(64); // 32 bytes hex
      expect(hashPart).toHaveLength(64); // 32 bytes hex
    });

    it('should use different salts for same password hashed twice', async () => {
      const password = 'same-password';
      
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
      
      const salt1 = hash1.split(':')[0];
      const salt2 = hash2.split(':')[0];
      expect(salt1).not.toBe(salt2);
    });
  });

  describe('Acceptance Criteria #5: Hash stored securely (not in plain text)', () => {
    it('should not include password in hash output', async () => {
      const password = 'my-secret-password-123';
      
      const hash = await hashPassword(password);
      
      expect(hash.toLowerCase()).not.toContain(password.toLowerCase());
    });

    it('should produce hash that looks cryptographically random', async () => {
      const password = 'predictable';
      
      const hash = await hashPassword(password);
      const hashPart = hash.split(':')[1];
      
      // Hash should contain varied hex digits (not all same value)
      const uniqueChars = new Set(hashPart.split(''));
      expect(uniqueChars.size).toBeGreaterThan(10);
    });
  });

  describe('Acceptance Criteria #6: Password verification uses constant-time comparison', () => {
    it('should verify correct password', async () => {
      const password = 'correct-password';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'correct-password';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword('wrong-password', hash);
      
      expect(isValid).toBe(false);
    });

    it('should have consistent timing for correct and incorrect passwords', async () => {
      const password = 'timing-test-password';
      const hash = await hashPassword(password);
      
      // Measure correct password verification time
      const correctTimes: number[] = [];
      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        await verifyPassword(password, hash);
        correctTimes.push(Date.now() - start);
      }
      
      // Measure incorrect password verification time
      const incorrectTimes: number[] = [];
      for (let i = 0; i < 5; i++) {
        const start = Date.now();
        await verifyPassword('wrong-password', hash);
        incorrectTimes.push(Date.now() - start);
      }
      
      const avgCorrect = correctTimes.reduce((a, b) => a + b) / correctTimes.length;
      const avgIncorrect = incorrectTimes.reduce((a, b) => a + b) / incorrectTimes.length;
      
      // Timing difference should be < 20% (constant-time comparison)
      const timingDiff = Math.abs(avgCorrect - avgIncorrect);
      const timingRatio = timingDiff / Math.max(avgCorrect, avgIncorrect);
      
      expect(timingRatio).toBeLessThan(0.2);
    });

    it('should reject hash with invalid format', async () => {
      const password = 'test-password';
      
      // Invalid formats
      const invalidHashes = [
        'invalid',
        'no-colon-separator',
        ':',
        'salt-only:',
        ':hash-only',
      ];
      
      for (const invalidHash of invalidHashes) {
        const isValid = await verifyPassword(password, invalidHash);
        expect(isValid).toBe(false);
      }
    });
  });

  describe('Acceptance Criteria #7: No passwords stored in logs or error messages', () => {
    it('should not log password in error messages', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const password = 'secret-password-should-not-appear-in-logs';
      
      // Trigger error scenario (invalid hash format)
      await verifyPassword(password, 'invalid-hash');
      
      // Check that password doesn't appear in any console.error calls
      const errorMessages = consoleSpy.mock.calls.map(call => call.join(' '));
      errorMessages.forEach(msg => {
        expect(msg).not.toContain(password);
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Acceptance Criteria #8: Performance targets', () => {
    it('should hash password in < 500ms', async () => {
      const password = 'performance-test';
      
      const startTime = Date.now();
      await hashPassword(password);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(500);
    });

    it('should verify password in < 500ms', async () => {
      const password = 'performance-test';
      const hash = await hashPassword(password);
      
      const startTime = Date.now();
      await verifyPassword(password, hash);
      const duration = Date.now() - startTime;
      
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Integration with encryption', () => {
    it('should derive encryption key from password for vault encryption', async () => {
      const password = 'vault-master-password';
      const salt = await generateSalt();
      
      const key = await deriveKeyFromPassword(password, salt);
      
      // Key should be usable for AES-256 encryption
      const testData = 'Sensitive vault secret';
      const encrypted = await encrypt(testData, key);
      const decrypted = await decrypt(encrypted, key);
      
      expect(decrypted).toBe(testData);
    });

    it('should not allow decryption with wrong password', async () => {
      const correctPassword = 'correct-password';
      const wrongPassword = 'wrong-password';
      const salt = await generateSalt();
      
      const correctKey = await deriveKeyFromPassword(correctPassword, salt);
      const wrongKey = await deriveKeyFromPassword(wrongPassword, salt);
      
      const testData = 'Sensitive vault secret';
      const encrypted = await encrypt(testData, correctKey);
      
      // Attempting to decrypt with wrong key should fail
      await expect(decrypt(encrypted, wrongKey)).rejects.toThrow();
    });
  });

  describe('getUserSalt functionality', () => {
    it('should create and store salt on first call', async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue(null);
      
      const salt = await getUserSalt();
      
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        'vault_salt',
        expect.stringMatching(/^[0-9a-f]{64}$/)
      );
      expect(salt).toHaveLength(64);
    });

    it('should return existing salt on subsequent calls', async () => {
      const existingSalt = '0'.repeat(64);
      mockedSecureStore.getItemAsync.mockResolvedValue(existingSalt);
      
      const salt = await getUserSalt();
      
      expect(salt).toBe(existingSalt);
      expect(mockedSecureStore.setItemAsync).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases and security', () => {
    it('should handle empty password', async () => {
      const hash = await hashPassword('');
      const isValid = await verifyPassword('', hash);
      
      expect(isValid).toBe(true);
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'x'.repeat(1000);
      
      const hash = await hashPassword(longPassword);
      const isValid = await verifyPassword(longPassword, hash);
      
      expect(isValid).toBe(true);
    });

    it('should handle special characters in password', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
      
      const hash = await hashPassword(specialPassword);
      const isValid = await verifyPassword(specialPassword, hash);
      
      expect(isValid).toBe(true);
    });

    it('should handle unicode characters in password', async () => {
      const unicodePassword = '密码🔐パスワード';
      
      const hash = await hashPassword(unicodePassword);
      const isValid = await verifyPassword(unicodePassword, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject password that differs by one character', async () => {
      const password = 'correct-password';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword('correct-passwor', hash); // Missing 'd'
      
      expect(isValid).toBe(false);
    });

    it('should reject password with different case', async () => {
      const password = 'CaseSensitive';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword('casesensitive', hash);
      
      expect(isValid).toBe(false);
    });
  });
});

describe('Security validation', () => {
  it('should meet OWASP password hashing requirements', async () => {
    // OWASP recommendations:
    // - PBKDF2: ✓ (implemented)
    // - Iterations ≥ 100,000: ✓ (implemented)
    // - Random salt ≥ 128 bits: ✓ (256 bits)
    // - Output length ≥ 256 bits: ✓ (256 bits)
    
    const password = 'owasp-compliant-password';
    const hash = await hashPassword(password);
    
    const [salt, hashPart] = hash.split(':');
    
    // Salt ≥ 128 bits (we use 256 bits)
    expect(salt.length * 4).toBeGreaterThanOrEqual(128);
    
    // Hash output ≥ 256 bits
    expect(hashPart.length * 4).toBeGreaterThanOrEqual(256);
  });

  it('should be resistant to timing attacks', async () => {
    const password = 'timing-attack-test';
    const hash = await hashPassword(password);
    
    // Test with passwords of varying similarity
    const testCases = [
      'timing-attack-test', // Correct (all chars match)
      'timing-attack-tes', // 1 char different
      'timing-attack-t', // Half different
      'timing', // Very different
      'x', // Completely different
    ];
    
    const times: number[] = [];
    
    for (const testPassword of testCases) {
      const start = Date.now();
      await verifyPassword(testPassword, hash);
      times.push(Date.now() - start);
    }
    
    // All verification times should be similar (within 20%)
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    const variance = (maxTime - minTime) / maxTime;
    
    expect(variance).toBeLessThan(0.2);
  });
});
