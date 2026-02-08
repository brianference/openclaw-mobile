# Build Commands

## Install Dependencies
```bash
npm init -y
npm install --save @noble/ciphers @noble/hashes
npm install --save-dev jest @types/jest eslint
```

## Dev Server (if needed)
```bash
npm run dev
```

## Build (if needed)
```bash
npm run build
```

---

# Test Commands (Backpressure)

## Run All Tests
```bash
npm test
```

## Run Tests with Coverage
```bash
npm test -- --coverage
```

## Lint Check
```bash
npm run lint
```

## Security Audit
```bash
npm audit
```

---

# Test Requirements

**Minimum pass criteria:**
- All unit tests pass
- Code coverage >80%
- No ESLint errors
- No security vulnerabilities

**DO NOT mark task complete unless:**
1. `npm test` exits with code 0
2. `npm run lint` exits with code 0
3. All security tests pass

---

# Operational Learnings

## 2026-02-08 23:00 - Initial Setup
- Starting vault encryption implementation
- Using @noble/ciphers for crypto (audited, pure JS)
- React Native compatible

## 2026-02-08 - Implementation Complete
- @noble/ciphers `gcm(key, nonce).encrypt(plaintext)` appends the 16-byte auth tag to the ciphertext automatically — no need to handle it separately
- @noble/hashes `pbkdf2Async` is preferred over sync `pbkdf2` to avoid blocking — use `{ c: iterations, dkLen: 32 }` for options
- Import paths: `@noble/ciphers/aes` for gcm, `@noble/ciphers/webcrypto` for randomBytes, `@noble/hashes/pbkdf2` for pbkdf2Async, `@noble/hashes/sha2` for sha256
- ESLint flat config: use `caughtErrorsIgnorePattern: '^_'` in `no-unused-vars` to allow `_err` in catch blocks
- TextEncoder/TextDecoder need to be added to ESLint globals for Node.js test files
- Password verification on import: decrypt first stored entry — if it fails, the password is wrong
- Key zeroing: `key.fill(0)` before setting to null on lock to clear sensitive data from memory
