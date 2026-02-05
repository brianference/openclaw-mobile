# HOSTILE MOBILE APP AUDIT - OpenClaw Mobile

**PROJECT INFO:**
- Owner: brianference/openclaw-mobile
- Platform: Cross-platform (iOS/Android via Expo)
- Build/Version: 1.0.0 (Build 1)
- Audit Date: 2026-02-05

---

## Ground Truth

**What system ACTUALLY does:**
- Displays chat interface with WebSocket connection to OpenClaw gateway
- Stores messages locally in AsyncStorage (unencrypted)
- Stores passphrase hash in expo-secure-store (hardware-backed)
- Stores gateway token in AsyncStorage (PROBLEM)
- Shows kanban board with local persistence
- Shows vault UI with mock data (encryption NOT implemented)
- Runs basic device security checks via expo-local-authentication
- Auto-locks after 5 minutes of inactivity

**What system DOES NOT do:**
- Does NOT encrypt vault items (only UI exists, crypto not wired)
- Does NOT actually sync with web kanban (stub implementation)
- Does NOT monitor anything in background
- Does NOT provide security beyond device-level checks
- Does NOT implement proper AES-256-GCM (using placeholder)
- Does NOT use PBKDF2/Argon2 for key derivation (uses SHA-256)

---

## NON-NEGOTIABLE INVARIANTS

### 0.1 Authority Control
- [FAIL] App implies "Secrets Vault" with encryption but encryption NOT implemented
- [FAIL] "Security Scanner" implies comprehensive security but only checks biometrics + device level
- [PASS] App does not imply background monitoring
- [PASS] App does not imply automation

### 0.2 Deterministic Visibility
- [FAIL] No "last refreshed" timestamp on security scanner results
- [FAIL] Chat messages show no timestamps to user
- [PASS] Connection status displayed (Connected/Disconnected)

### 0.3 Fail-Closed States
- [PASS] Unknown connection state shows "Disconnected"
- [FAIL] Empty vault shows "No secrets yet" - should clarify encryption status
- [FAIL] Security scanner shows score without confidence/methodology

### 0.4 Scope Binding
- [FAIL] Chat messages have no visible timestamp
- [FAIL] Security checks show no "last checked" to user
- [PASS] Kanban cards bound to single board

### 0.5 Auditability
- [FAIL] Screenshots of chat lack timestamp context
- [FAIL] Security score screenshot could be misrepresented (no date/device ID)

---

## Claim Gaps

| Gap ID | UI Implies | Reality | Severity | Fix Type |
|--------|-----------|---------|----------|----------|
| CG-01 | Vault is encrypted (🔐 icon, "Secrets Vault") | Encryption NOT implemented | CRITICAL | Implement or rename |
| CG-02 | "Security Scanner" provides security assessment | Only checks 6 basic items | HIGH | Rename to "Device Checks" |
| CG-03 | Security score is meaningful | Score based on pass/warn/fail counts only | MEDIUM | Add methodology disclosure |
| CG-04 | Kanban syncs with web | Sync is stubbed, doesn't work | HIGH | Implement or remove claim |
| CG-05 | "AES-256-GCM" encryption | Code has XOR placeholder | CRITICAL | Implement real crypto |
| CG-06 | Gateway token is secure | Stored in AsyncStorage (not encrypted) | HIGH | Move to SecureStore |

---

## Screen Inventory

| Screen ID | Entry Points | Purpose | Critical Outputs | Screenshot Risk | Misuse Risk |
|-----------|--------------|---------|------------------|-----------------|-------------|
| S-01 Auth | App launch | Unlock app | Passphrase entry | LOW | LOW |
| S-02 Chat | Tab 1 | AI conversation | Messages, connection status | MEDIUM | MEDIUM |
| S-03 Kanban | Tab 2 | Task management | Cards, priorities | LOW | LOW |
| S-04 Vault | Tab 3 | Store secrets | Secret names, categories | HIGH | HIGH |
| S-05 Scanner | Tab 4 | Security checks | Score, check results | MEDIUM | HIGH |
| S-06 Settings | Tab 5 | Configuration | Gateway URL, token | HIGH | MEDIUM |

---

## Gesture & Affordance Map

| Element ID | Screen | Label/Icon | Actual Behavior | User Interpretation | Risk | Fix |
|------------|--------|------------|-----------------|---------------------|------|-----|
| G-01 | Vault | 🔐 Lock icon | Opens unencrypted vault | "My secrets are encrypted" | CRITICAL | Add warning banner until crypto implemented |
| G-02 | Scanner | "Security Score" | Simple weighted average | "This is a real security rating" | HIGH | Add "Basic Check" label |
| G-03 | Scanner | Green checkmark | Pass status | "This aspect is secure" | MEDIUM | Keep but add tooltip/context |
| G-04 | Settings | "Save" gateway | Saves to AsyncStorage | "Token is securely stored" | HIGH | Move token to SecureStore |
| G-05 | Chat | Send button | Sends via WebSocket | Working correctly | LOW | None |
| G-06 | Kanban | Long-press card | Opens move menu | May not be discoverable | LOW | Add hint text |

---

## Lifecycle Deception

| Transition | Expected Fail-Closed | Actual Behavior | Status |
|------------|---------------------|-----------------|--------|
| Cold start | Show auth gate | Shows auth gate | PASS |
| Background → foreground | Check auto-lock | Checks auto-lock (5min) | PASS |
| OS kill → reopen | Require re-auth | Requires re-auth (state reset) | PASS |
| App switch | No action | No action | PASS |
| Device lock/unlock | No action | No action | PASS |
| Network drop | Show disconnected | Shows disconnected banner | PASS |
| Network resume | Auto-reconnect with backoff | Auto-reconnects | PASS |

---

## Background & Automation Inference

| Element | Location | Implies | Reality | Fix |
|---------|----------|---------|---------|-----|
| "Connected" badge | Settings | Live connection | WebSocket connected (true) | OK |
| Typing indicator | Chat | Assistant is typing | Server sent typing event | OK |
| No "monitoring" claims | N/A | N/A | N/A | OK - No false claims |

**Assessment: PASS** - App does not imply background monitoring or automation it doesn't have.

---

## Notification Audit

| Notification Type | Implemented | Consent Required | Risk |
|-------------------|-------------|------------------|------|
| Push notifications | NO (scaffolded only) | N/A | LOW |
| Local notifications | NO | N/A | LOW |

**Assessment: PASS** - No notifications implemented yet, so no consent issues.

---

## Privacy & Device Leak

| Risk | Location | Severity | Fix |
|------|----------|----------|-----|
| Gateway token in AsyncStorage | chat.ts persist | HIGH | Move to SecureStore |
| Encryption key stored in SecureStore | auth.ts | OK | Hardware-backed |
| Messages stored unencrypted | chat.ts persist | MEDIUM | Consider encryption |
| Vault items mock data visible | vault.tsx | LOW | Replace with real encrypted store |
| App switcher snapshot | All screens | MEDIUM | Add blur on background |
| Lock screen previews | N/A | N/A | Not implemented |
| Clipboard auto-clear | Vault copy | PASS | 30-second clear implemented |

---

## Fix List

### CRITICAL (Must fix before release)

**FIX-M01: Implement real vault encryption**
- Location: `src/store/vault.ts` (to be created)
- Issue: Vault UI implies encryption but uses XOR placeholder
- Fix: Implement AES-256-GCM using expo-crypto or react-native-aes-crypto
- Severity: CRITICAL

**FIX-M02: Upgrade password hashing**
- Location: `src/store/auth.ts` lines 37-43
- Issue: Uses SHA-256 for password hashing instead of PBKDF2/Argon2
- Fix: Use PBKDF2 with 100,000+ iterations or implement Argon2
- Severity: CRITICAL

### HIGH (Fix before beta)

**FIX-M03: Move gateway token to SecureStore**
- Location: `src/store/chat.ts` line 234
- Issue: Gateway token persisted in AsyncStorage (not encrypted)
- Fix: Store in expo-secure-store alongside passphrase hash
- Severity: HIGH

**FIX-M04: Rename "Security Scanner" to "Device Checks"**
- Location: `app/(tabs)/scanner.tsx`, tab config
- Issue: "Security Scanner" implies comprehensive security assessment
- Fix: Rename to "Device Checks" or add methodology disclosure
- Severity: HIGH

**FIX-M05: Implement or remove kanban sync**
- Location: `src/store/kanban.ts` lines 105-138
- Issue: Sync functions are stubs that claim success
- Fix: Either implement real sync or remove sync UI
- Severity: HIGH

**FIX-M06: Add warning banner to vault**
- Location: `app/(tabs)/vault.tsx`
- Issue: Vault appears functional but encryption not implemented
- Fix: Add prominent "⚠️ Demo Mode - Encryption Coming Soon" banner
- Severity: HIGH

### MEDIUM (Fix before production)

**FIX-M07: Add timestamps to chat messages**
- Location: `app/(tabs)/index.tsx` MessageBubble component
- Issue: Messages show no timestamp to user
- Fix: Display formatted timestamp below each message
- Severity: MEDIUM

**FIX-M08: Add "last scan" timestamp to scanner UI**
- Location: `app/(tabs)/scanner.tsx`
- Issue: `lastScan` state exists but only shows time, not date
- Fix: Show full date/time: "Last scan: Feb 5, 2026 3:45 PM"
- Severity: MEDIUM

**FIX-M09: Add app switcher blur**
- Location: `app/_layout.tsx`
- Issue: Sensitive screens visible in app switcher
- Fix: Use `expo-blur` or set `UIApplicationExitsOnSuspend` 
- Severity: MEDIUM

**FIX-M10: Add security score methodology**
- Location: `app/(tabs)/scanner.tsx` ScoreRing component
- Issue: Score shown without explanation of calculation
- Fix: Add info button with methodology disclosure
- Severity: MEDIUM

### LOW (Nice to have)

**FIX-M11: Add long-press hint to kanban cards**
- Location: `app/(tabs)/kanban.tsx`
- Fix: Add subtle hint text "Long-press to move"

**FIX-M12: Add message retry button**
- Location: `app/(tabs)/index.tsx`
- Fix: Allow retry of failed messages

---

## Worst Misinterpretation

> "A user could believe their API keys and passwords in the Vault are encrypted and secure because the screen shows a lock icon and is called 'Secrets Vault', when in reality the encryption is not implemented and secrets are stored in plain text."

---

## Re-Test Plan

| Test | Expected Behavior | Evidence Artifact |
|------|-------------------|-------------------|
| Vault encryption | Secrets encrypted at rest | Dump AsyncStorage, verify ciphertext |
| Token storage | Gateway token in SecureStore | Check Keychain/EncryptedPrefs |
| Password hashing | PBKDF2 with 100K+ iterations | Unit test with timing measurement |
| Auto-lock | Locks after 5 min inactivity | Manual test with timer |
| Network failure | Shows disconnected, retries | Kill network, observe UI |
| Cold start auth | Requires passphrase | Kill app, reopen |

---

## Summary

**Overall Risk: HIGH**

The app has solid foundations (proper auth gate, SecureStore for passphrase, auto-lock) but has critical gaps in the vault encryption implementation. The "Secrets Vault" feature is essentially demo UI without real encryption, which could mislead users into storing sensitive data insecurely.

**Immediate Actions Required:**
1. Add prominent "Demo Mode" warning to Vault until encryption implemented
2. Move gateway token from AsyncStorage to SecureStore
3. Rename "Security Scanner" to avoid implying comprehensive security

**Before Production:**
1. Implement real AES-256-GCM encryption for vault
2. Upgrade to PBKDF2 or Argon2 for key derivation
3. Implement or remove kanban sync claims
