/**
 * Crypto Test Runner
 * Run with: npx ts-node test-crypto.ts
 */

import {
  testEncryption,
  testPasswordHashing,
  benchmarkCrypto,
} from './src/lib/crypto.js';

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         MobileClaw Vault Encryption Test Suite            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  let allPassed = true;

  // Test 1: Encryption/Decryption
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Test 1: AES-256-CTR Encryption with HMAC Authentication');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const encryptionPassed = await testEncryption();
  allPassed = allPassed && encryptionPassed;

  // Test 2: Password Hashing
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Test 2: PBKDF2 Password Hashing (100k iterations)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const hashingPassed = await testPasswordHashing();
  allPassed = allPassed && hashingPassed;

  // Benchmark
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Performance Benchmark');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  await benchmarkCrypto();

  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  if (allPassed) {
    console.log('║                    ✅ ALL TESTS PASSED                     ║');
    console.log('║                                                            ║');
    console.log('║  Vault encryption is production-ready:                    ║');
    console.log('║  • PBKDF2 password hashing (100k iterations)              ║');
    console.log('║  • AES-256-CTR encryption                                 ║');
    console.log('║  • HMAC-SHA256 authentication                             ║');
    console.log('║  • Tamper detection                                       ║');
    console.log('║  • Constant-time comparison (timing attack protection)    ║');
  } else {
    console.log('║                    ❌ TESTS FAILED                         ║');
  }
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  process.exit(allPassed ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
