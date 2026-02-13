/**
 * Test fixtures for Encrypted Vault
 */

export const mockVaultItem = {
  id: 'vault-001',
  type: 'login',
  title: 'GitHub',
  encrypted: true,
  encryptedData: 'U2FsdGVkX1/R+WzJbv...', // Mock encrypted data
  iv: 'abc123def456',
  authTag: 'xyz789',
  createdAt: '2026-02-08T10:00:00Z',
  updatedAt: '2026-02-08T10:00:00Z',
};

export const mockDecryptedLoginData = {
  username: 'brianference',
  password: 'Test123!@#Strong',
  url: 'github.com',
  notes: 'Main account',
};

export const mockVaultItems = [
  mockVaultItem,
  {
    id: 'vault-002',
    type: 'card',
    title: 'Chase Visa',
    encrypted: true,
    encryptedData: 'U2FsdGVkX1/ABC...',
    iv: 'def123',
    authTag: 'ghi456',
    createdAt: '2026-02-07T10:00:00Z',
    updatedAt: '2026-02-07T10:00:00Z',
  },
];

export const createMockVaultItems = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `vault-${String(i).padStart(3, '0')}`,
    type: ['login', 'card', 'note', 'key'][i % 4],
    title: `Secret ${i + 1}`,
    encrypted: true,
    encryptedData: `encrypted-data-${i}`,
    iv: `iv-${i}`,
    authTag: `tag-${i}`,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - i * 3600000).toISOString(),
  }));
};

export const mockPasswordGenerator = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  generatedPassword: 'Xt9#mK2$pL4@qR7',
  strength: 'Strong',
};
