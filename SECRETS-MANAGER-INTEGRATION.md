# MobileClaw Secrets Manager Integration Guide

## Overview

The MobileClaw Crypto Secrets Manager provides secure, in-memory storage for crypto keys using `react-native-keychain`. Keys are encrypted at rest and cleared from memory when the app closes.

## Quick Start

### 1. Initialize on App Start

```typescript
// In your root app component (app/_layout.tsx or similar)
import { initializeSecretsManager } from '../lib/secrets-manager';
import { useEffect } from 'react';
import { AppState } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    // Initialize secrets manager on app start
    initializeSecretsManager();

    // Handle app state changes (clear keys on background/close)
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'background' || state === 'inactive') {
        clearAllKeysFromMemory();
      }
    });

    return () => {
      subscription.remove();
      clearAllKeysFromMemory();
    };
  }, []);

  return <RootNavigation />;
}
```

### 2. Store Credentials

```typescript
import { storeCredential } from '../lib/secrets-manager';

async function saveApiKey() {
  const credential = await storeCredential({
    name: 'OpenAI API Key',
    service: 'openai',
    apiKey: 'sk-proj-xxxxxxxx',
    metadata: { tier: 'pro' }
  });
  
  console.log('Saved:', credential.id);
}
```

### 3. Retrieve Credentials

```typescript
import { getCredential } from '../lib/secrets-manager';

async function loadApiKey() {
  const credential = await getCredential('123456789', 'openai');
  
  if (credential) {
    console.log('API Key:', credential.apiKey);
    // Use the API key...
  }
}
```

### 4. Update/Delete Credentials

```typescript
import { updateCredential, deleteCredential } from '../lib/secrets-manager';

// Update password
await updateCredential('123456789', 'openai', {
  apiKey: 'sk-proj-new-key'
});

// Delete credential
await deleteCredential('123456789', 'openai');
```

## API Reference

### Functions

| Function | Description |
|----------|-------------|
| `initializeSecretsManager()` | Initialize keychain and load/generate master key |
| `storeCredential(data)` | Store encrypted credential |
| `getCredential(id, service)` | Retrieve and decrypt credential |
| `updateCredential(id, service, updates)` | Update existing credential |
| `deleteCredential(id, service)` | Delete credential from keychain |
| `encryptWithMasterKey(data)` | Encrypt data using master key |
| `decryptWithMasterKey(encrypted)` | Decrypt data using master key |
| `clearAllKeysFromMemory()` | Clear in-memory keys (call on app close) |
| `clearAllCredentials()` | Clear all credentials and reset (logout) |

### Credential Interface

```typescript
interface Credential {
  id: string;
  name: string;
  service: string;
  username?: string;
  password?: string;
  apiKey?: string;
  secret?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
```

## Security Properties

1. **Encrypted at Rest**: All credentials stored in react-native-keychain with `ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY`
2. **Clear on App Close**: `clearAllKeysFromMemory()` removes master key from memory
3. **Individual Encryption**: Each credential encrypted separately with AES-256-CTR + HMAC
4. **Key Derivation**: Master key generated with cryptographically secure random bytes

## Testing

Run the test suite:

```bash
cd /root/.openclaw/workspace/projects/mobileclaw
npx ts-node test-secrets-manager.ts
```

Expected output:
```
🔐 Testing Secrets Manager

1. Initializing...
   ✅ Initialized
2. Storing credential...
   ✅ Stored credential: 123456789
3. Retrieving credential...
   ✅ Retrieved correctly
4. Updating credential...
   ✅ Updated
5. Verifying update...
   ✅ Update verified
6. Deleting credential...
   ✅ Deleted
7. Verifying deletion...
   ✅ Deletion verified
8. Testing memory clear...
   ✅ Memory cleared

✅ All tests PASSED
```

## Files

| File | Purpose |
|------|---------|
| `src/lib/secrets-manager.ts` | Main implementation |
| `src/types/keychain.d.ts` | TypeScript declarations for react-native-keychain |
| `test-secrets-manager.ts` | Test suite |
| `SECRETS-MANAGER-INTEGRATION.md` | This guide |

## Dependencies

- `react-native-keychain: ^8.2.0`
- `expo-crypto` (existing dependency)
- `aes-js` (existing dependency)