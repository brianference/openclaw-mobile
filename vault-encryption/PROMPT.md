# Goal
Build secure vault encryption module for Mobileclaw with AES-256-GCM and PBKDF2 key derivation

# Context
Read specs/encryption.md for security requirements
Read IMPLEMENTATION_PLAN.md for current progress
Read AGENTS.md for test commands

This is a React Native module that will handle encrypted storage for sensitive user data (passwords, keys, tokens).

# Mode
BUILDING (implement + test + commit)

# Tasks
1. Pick most important incomplete task from IMPLEMENTATION_PLAN.md
2. Investigate current codebase structure
3. Implement the task
4. Run backpressure tests from AGENTS.md
5. Update IMPLEMENTATION_PLAN.md with progress
6. Update AGENTS.md with learnings
7. Commit with clear message: "feat(vault): <what you did>"
8. Repeat until all tasks done

# Completion
When all tasks complete and tests pass, add to IMPLEMENTATION_PLAN.md:
```
STATUS: COMPLETE
```

# Backpressure (MANDATORY)
Before marking any task done:
1. Run: npm test
2. Run: npm run lint
3. All tests MUST pass
4. If tests fail, FIX before continuing

# Security Requirements
- AES-256-GCM encryption (no other algorithms)
- PBKDF2 with 100,000 iterations minimum
- Random salt per vault (16 bytes minimum)
- Random IV per encryption operation
- Never log keys, passwords, or plaintext
- Zero hardcoded secrets

# File Structure
```
src/
  vault.js        - Main encryption API
  crypto.js       - Low-level crypto operations
  storage.js      - Encrypted storage interface
__tests__/
  vault.test.js   - Comprehensive test suite
README.md         - API documentation
package.json      - Dependencies
```

# Example API
```javascript
import { Vault } from './vault';

// Create vault
const vault = await Vault.create(password);

// Store encrypted
await vault.set('api_key', 'secret123');

// Retrieve decrypted
const value = await vault.get('api_key');

// Lock/unlock
await vault.lock();
await vault.unlock(password);
```

# Dependencies Available
- React Native: crypto.getRandomValues()
- Or: expo-crypto for native crypto operations
- Or: @noble/ciphers (pure JS, audited)

Choose the most secure + reliable option.

# Code Quality
- JSDoc comments on all public methods
- Error handling for all crypto operations
- Input validation
- No console.log in production code
- ESLint clean
