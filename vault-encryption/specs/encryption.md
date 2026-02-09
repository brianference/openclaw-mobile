# Vault Encryption Specification

## Security Requirements

### Encryption Algorithm
- **Algorithm:** AES-256-GCM
- **Why:** Authenticated encryption (prevents tampering)
- **Key Size:** 256 bits
- **IV Size:** 96 bits (12 bytes) - recommended for GCM
- **Tag Size:** 128 bits (16 bytes)

### Key Derivation
- **Algorithm:** PBKDF2-SHA256
- **Iterations:** 100,000 minimum (OWASP recommendation 2024)
- **Salt:** 16 bytes random, unique per vault
- **Output:** 32 bytes (256 bits for AES-256)

### Randomness
- Use `crypto.getRandomValues()` (Web Crypto API)
- Or `expo-crypto.getRandomBytesAsync()` for React Native
- Never use Math.random()
- Never reuse IVs

## Data Format

### Encrypted Blob Structure
```
[salt 16 bytes][iv 12 bytes][ciphertext N bytes][tag 16 bytes]
```

### Storage Format (JSON)
```json
{
  "version": 1,
  "salt": "<base64>",
  "data": {
    "key1": {
      "iv": "<base64>",
      "ciphertext": "<base64>",
      "tag": "<base64>"
    }
  }
}
```

## API Specification

### Vault.create(password)
- Generate random salt
- Derive key from password + salt
- Create empty vault
- Return locked vault instance

### vault.set(key, value)
- Requires unlocked vault
- Generate random IV
- Encrypt value with AES-256-GCM
- Store encrypted blob
- Return success

### vault.get(key)
- Requires unlocked vault
- Retrieve encrypted blob
- Decrypt with stored IV
- Verify authentication tag
- Return plaintext value

### vault.lock()
- Clear derived key from memory
- Set locked state
- Prevent get/set operations

### vault.unlock(password)
- Derive key from password + stored salt
- Set unlocked state
- Allow get/set operations

### vault.export()
- Return encrypted vault JSON
- Safe to store/transmit
- Contains no plaintext

### Vault.import(json, password)
- Parse encrypted vault
- Derive key
- Return unlocked vault instance

## Security Tests Required

1. **Encryption Uniqueness**
   - Encrypt same plaintext twice → different ciphertexts

2. **Tampering Detection**
   - Modify ciphertext → decryption fails
   - Modify tag → decryption fails

3. **Password Validation**
   - Wrong password → unlock fails
   - Right password → unlock succeeds

4. **Key Isolation**
   - Lock vault → get/set fail
   - Unlock → get/set work

5. **IV Uniqueness**
   - Multiple encryptions → unique IVs

6. **No Key Leakage**
   - Vault.export() contains no keys
   - toString() contains no keys

## Performance Targets

- Create vault: <100ms
- Encrypt value: <10ms
- Decrypt value: <10ms
- Unlock vault: <100ms (PBKDF2 is slow by design)

## Error Handling

All methods throw specific errors:
- `VaultLockedError` - attempted get/set while locked
- `DecryptionError` - tampered data or wrong key
- `InvalidPasswordError` - wrong password on unlock

## Dependencies

Choose ONE:

**Option A: expo-crypto (Recommended for React Native)**
```javascript
import * as Crypto from 'expo-crypto';
const salt = await Crypto.getRandomBytesAsync(16);
```

**Option B: @noble/ciphers (Pure JS, audited)**
```javascript
import { gcm } from '@noble/ciphers/aes';
import { pbkdf2 } from '@noble/hashes/pbkdf2';
```

**Option C: Web Crypto API (if available)**
```javascript
const salt = crypto.getRandomValues(new Uint8Array(16));
```

## Implementation Checklist

- [ ] Install dependencies
- [ ] Implement crypto.js (low-level)
- [ ] Implement vault.js (high-level API)
- [ ] Implement storage.js (persistence)
- [ ] Write comprehensive tests
- [ ] Test tampering detection
- [ ] Test password validation
- [ ] Test IV uniqueness
- [ ] Verify no key leakage
- [ ] JSDoc all public methods
- [ ] README with examples
- [ ] Security audit checklist
