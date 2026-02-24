/**
 * Test script for MobileClaw Secrets Manager
 * 
 * Run with: npx ts-node test-secrets-manager.ts
 * 
 * Note: This is a Node.js test. For full testing, run in React Native environment.
 */

import { 
  initializeSecretsManager,
  storeCredential,
  getCredential,
  updateCredential,
  deleteCredential,
  encryptWithMasterKey,
  decryptWithMasterKey,
  clearAllKeysFromMemory,
  testSecretsManager,
  benchmarkSecretsManager
} from './src/lib/secrets-manager';

// Mock expo-crypto for Node.js testing
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(),
  digestStringAsync: jest.fn(),
  CryptoDigestAlgorithm: { SHA256: 'SHA256' },
}));

async function main() {
  console.log('='.repeat(60));
  console.log('MobileClaw Secrets Manager Test Suite');
  console.log('='.repeat(60) + '\n');

  // Run tests
  const result = await testSecretsManager();
  
  if (result) {
    console.log('\n📊 Running performance benchmark...\n');
    await benchmarkSecretsManager();
  }

  console.log('\n' + '='.repeat(60));
  console.log(result ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED');
  console.log('='.repeat(60));

  process.exit(result ? 0 : 1);
}

main().catch(console.error);