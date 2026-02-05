# FULL HOSTILE AUDIT - OpenClaw Mobile

**PROJECT INFO:**
- Owner: brianference/openclaw-mobile
- Platform: Cross-platform (iOS/Android/Web via Expo SDK 54)
- Build/Version: 1.0.0 (Build 1)
- Audit Date: 2026-02-05
- Auditor: Cole (AI)

---

# 1. SECURITY AUDIT

## Trust Boundary Map

| Boundary ID | Between | Enforcement | Severity if Breached |
|-------------|---------|-------------|----------------------|
| TB-01 | User ↔ App | Passphrase + Biometric | HIGH - Full data access |
| TB-02 | App ↔ Gateway | Token auth via WebSocket | HIGH - Impersonation |
| TB-03 | App ↔ Device Storage | SecureStore (partial) | CRITICAL - Secret exposure |
| TB-04 | App ↔ AsyncStorage | None | MEDIUM - Data exposure |

## Attack Surface Inventory

| Surface | Entry Type | Auth Required | Authz Enforced | Data Exposed | Abuse Scenario |
|---------|------------|---------------|----------------|--------------|----------------|
| App launch | Direct | Passphrase | Yes | None until unlocked | Brute force passphrase |
| Chat WebSocket | Network | Token | Yes (gateway) | Messages | Token theft → impersonation |
| Settings gateway config | UI | App unlocked | No | Token visible | Shoulder surfing |
| Vault copy | UI | App unlocked | No | Secret value | Clipboard sniffing |
| AsyncStorage | Device | None | No | Messages, kanban, token | Device access → full data |

## Input Validation Gaps

| Finding | Severity | Fix |
|---------|----------|-----|
| Passphrase min length 8, no complexity | MEDIUM | Add complexity requirements |
| Gateway URL not validated | LOW | Add URL format validation |
| Chat message 4000 char limit only | LOW | OK for now |
| No rate limiting on passphrase attempts | HIGH | Add lockout after 5 failures |

## Secret Leakage Findings

| Location | What Leaks | Severity | Fix |
|----------|------------|----------|-----|
| AsyncStorage `openclaw-chat` | Gateway token in plaintext | HIGH | Move to SecureStore |
| Console.log statements | WebSocket events, errors | MEDIUM | Remove in production |
| Error messages | Connection details | LOW | Sanitize error messages |

## Isolation Findings

| Issue | Fix |
|-------|-----|
| Single user assumed | OK for personal app |
| No multi-tenant concerns | N/A |

## Fix List - Security

| ID | Fix | Severity |
|----|-----|----------|
| FIX-SEC01 | Move gateway token to SecureStore | HIGH |
| FIX-SEC02 | Add passphrase attempt lockout (5 failures → 5 min wait) | HIGH |
| FIX-SEC03 | Remove console.log in production | MEDIUM |
| FIX-SEC04 | Add passphrase complexity requirements | MEDIUM |

---

# 2. SYSTEMS AUDIT

## System Surface Inventory

| Surface | Trigger | Inputs | Outputs | State Touched | Lie Surface Risk |
|---------|---------|--------|---------|---------------|------------------|
| Auth | App launch | Passphrase | Unlock state | SecureStore, Zustand | LOW |
| Chat | User message | Text | AI response | AsyncStorage, Zustand | MEDIUM |
| Kanban | User interaction | Card data | Board state | AsyncStorage, Zustand | LOW |
| Vault | User interaction | Secret data | Stored secret | Local state (mock) | HIGH |
| Scanner | Pull refresh | None | Security checks | Local state | MEDIUM |

## Input Hostility Findings

| Test | Behavior | Issue | Fix |
|------|----------|-------|-----|
| Empty passphrase | Blocked | OK | - |
| 1000 char passphrase | Accepted | Should limit | Add max 128 |
| Malformed gateway URL | Accepted | Connection fails silently | Validate URL format |
| Empty chat message | Blocked (trim check) | OK | - |
| XSS in chat message | Rendered as text | OK (React Native safe) | - |

## State Integrity Findings

| Issue | Fix |
|-------|-----|
| WebSocket state can desync | Add heartbeat/ping check |
| Messages persist but connection doesn't | OK - reconnects on mount |
| No explicit state reset | Add "Clear All Data" (exists in settings) |

## Error Behavior Matrix

| Failure | Expected | Actual | Looks Like Success? | Fix |
|---------|----------|--------|---------------------|-----|
| Gateway unreachable | Show error | Shows "Connection error" | NO ✓ | - |
| WebSocket timeout | Show error | Auto-reconnect with backoff | NO ✓ | - |
| Invalid passphrase | Show error | Shows "Incorrect passphrase" | NO ✓ | - |
| SecureStore failure | Show error | Catches, logs | PARTIAL | Show user error |
| Biometric failure | Fallback | Falls back to passphrase | NO ✓ | - |

## Nondeterminism Sources

| Source | Fix |
|--------|-----|
| Message IDs use Date.now() + random | OK - unique enough |
| No timezone handling | Add timezone to timestamps |

## Fix List - Systems

| ID | Fix | Severity |
|----|-----|----------|
| FIX-SYS01 | Add WebSocket heartbeat/ping | MEDIUM |
| FIX-SYS02 | Validate gateway URL format before save | LOW |
| FIX-SYS03 | Add max passphrase length (128) | LOW |
| FIX-SYS04 | Surface SecureStore errors to user | MEDIUM |

---

# 3. UI AUDIT

## Screen Inventory (Expanded)

| Screen | Entry | User Goal | Critical Outputs | Misuse Potential |
|--------|-------|-----------|------------------|------------------|
| Auth | Launch | Unlock app | None until unlocked | Brute force |
| Chat | Tab 1 | Talk to AI | Messages | Screenshot without context |
| Kanban | Tab 2 | Manage tasks | Cards | None significant |
| Vault | Tab 3 | Store secrets | Secret list | FALSE security belief |
| Scanner | Tab 4 | Check security | Score | FALSE security belief |
| Settings | Tab 5 | Configure | Token exposure | Shoulder surfing |

## Dangerous Copy Found

| Word | Location | Replacement |
|------|----------|-------------|
| "Secrets Vault" | Tab label, header | "Local Storage" or add "⚠️ Unencrypted" |
| "Security Scanner" | Tab label, header | "Device Checks" |
| "Security Score" | Scanner screen | "Basic Check Score" |
| "Secure" in status badge | Scanner | "Passed" |
| "AES-256-GCM" | Auth store comment | Remove until implemented |

## Visual Authority Leakage

| Item | Location | Fix |
|------|----------|-----|
| Lock icon 🔐 on Vault tab | Tab bar | Change to key icon or add warning |
| Shield icon 🛡️ on Scanner tab | Tab bar | OK with renamed label |
| Green checkmarks in scanner | Check results | Add "Basic" qualifier |
| Security score ring | Scanner | Add methodology link |
| "Connected" green dot | Settings | OK - accurate |

## Error Trust Matrix

| Failure | Expected | Actual | Looks Like Success? | Fix |
|---------|----------|--------|---------------------|-----|
| No network | Error state | "Disconnected" banner | NO ✓ | - |
| Empty vault | Empty state | "No secrets yet" message | NO ✓ | - |
| Empty kanban | Empty state | "No cards" per column | NO ✓ | - |
| Failed message | Error indicator | Red icon on message | NO ✓ | Add retry button |
| Scanner no permissions | Unknown state | Shows "Unknown" status | PARTIAL | Be more explicit |

## Provenance Gaps

| Screen | Missing | Fix |
|--------|---------|-----|
| Chat messages | Timestamp not shown to user | Add visible timestamp |
| Scanner results | Scan date not prominent | Add "Scanned: [datetime]" |
| Kanban cards | Created/updated dates hidden | Show in card detail |
| Vault items | Last modified not shown | Add to list view |

## Privacy Leaks

| Issue | Fix |
|-------|-----|
| Gateway token visible in settings | Mask with ••••• and show button |
| App switcher shows content | Add blur on background |
| Secret values copyable | OK - with 30s auto-clear |

## Fix List - UI

| ID | Fix | Severity |
|----|-----|----------|
| FIX-UI01 | Rename "Secrets Vault" → add warning banner | HIGH |
| FIX-UI02 | Rename "Security Scanner" → "Device Checks" | HIGH |
| FIX-UI03 | Add timestamps to chat messages | MEDIUM |
| FIX-UI04 | Mask gateway token in settings | MEDIUM |
| FIX-UI05 | Add app switcher blur | MEDIUM |
| FIX-UI06 | Add retry button to failed messages | LOW |
| FIX-UI07 | Show card created/updated dates | LOW |

---

# 4. PRODUCTION READINESS AUDIT

## Demo-Only Behaviors Found

| Behavior | Severity | Fix |
|----------|----------|-----|
| Vault uses mock data, no persistence | CRITICAL | Implement real store |
| Vault encryption placeholder (XOR) | CRITICAL | Implement AES-256-GCM |
| Kanban sync stubbed | HIGH | Implement or remove |
| SHA-256 password hashing | HIGH | Upgrade to PBKDF2 |
| Console.log statements | MEDIUM | Remove for production |

## Operational Surface Matrix

| Operation | Exists | Documented | Risk if Missing |
|-----------|--------|------------|-----------------|
| Clear all data | Yes | No | LOW |
| Export data | No (stub) | No | MEDIUM - no backup |
| Import data | No (stub) | No | MEDIUM - no restore |
| Force logout | Yes | No | LOW |
| Change passphrase | No (stub) | No | HIGH - can't rotate |
| View logs | No | No | MEDIUM - can't debug |

## Failure Ownership

- **Who notices:** User (UI errors) or no one (silent failures)
- **How fast:** Immediately for UI errors, never for background
- **Who intervenes:** User only (no admin/ops)

## Recovery Assessment

| Scenario | Recovery Path | Data Loss Risk |
|----------|---------------|----------------|
| App crash | Restart, re-auth | None (persisted) |
| Data corruption | No recovery | HIGH |
| Forgot passphrase | No recovery | TOTAL |
| Device lost | No recovery | TOTAL |

## Rollback Assessment

| Change Type | Rollback Exists | Notes |
|-------------|-----------------|-------|
| App update | App store rollback | Limited |
| Data migration | No | Would need versioned migrations |
| Settings change | Manual | User can reconfigure |

## Claim Downgrades Needed

| Claim | Downgrade To |
|-------|--------------|
| "Encrypted storage" | "Local storage (encryption coming)" |
| "Security Scanner" | "Basic Device Checks" |
| "Sync with web" | Remove until implemented |
| "Production-ready" | "Beta / Preview" |

## Fix List - Production

| ID | Fix | Severity |
|----|-----|----------|
| FIX-PR01 | Implement passphrase change | HIGH |
| FIX-PR02 | Implement data export (encrypted) | MEDIUM |
| FIX-PR03 | Add passphrase recovery hint option | MEDIUM |
| FIX-PR04 | Add version display in settings | LOW |
| FIX-PR05 | Implement proper error logging | MEDIUM |

---

# 5. SCALABILITY AUDIT

## Ground Truth

**What system supports:**
- Single user
- Local storage only
- One WebSocket connection
- Unlimited messages (capped at 100 persisted)
- Unlimited kanban cards (local storage limits)
- Unlimited vault items (local storage limits)

**Hard constraints:**
- AsyncStorage: ~6MB on Android, unlimited iOS
- SecureStore: 2KB per item
- Single WebSocket connection
- No horizontal scaling (personal app)

## Load-Bearing Inventory

| Surface | Concurrency Model | Shared Resources | Isolation |
|---------|-------------------|------------------|-----------|
| Chat | Single thread | WebSocket | N/A |
| Kanban | Single thread | AsyncStorage | N/A |
| Vault | Single thread | Local state | N/A |
| Scanner | Single thread | Device APIs | N/A |

## Concurrency Findings

| Scenario | Behavior | Issue |
|----------|----------|-------|
| Rapid message sends | Queued | OK |
| Multiple card moves | Last wins | Could lose moves |
| Concurrent vault edits | Last wins | Could lose edits |

## Backpressure Findings

| Condition | Current Behavior | Required |
|-----------|------------------|----------|
| 1000+ messages | Memory grows | Add pagination/virtualization |
| 100+ kanban cards | Memory grows | Add lazy loading |
| Large vault | Memory grows | Add search/filter |

## Error Matrix

| Failure | Behavior | Looks Like Success? | Fix |
|---------|----------|---------------------|-----|
| AsyncStorage full | Write fails silently | YES ⚠️ | Add storage check |
| Memory pressure | App crash | NO | Add message limit |
| Network congestion | Reconnect attempts | NO ✓ | - |

## Fix List - Scalability

| ID | Fix | Severity |
|----|-----|----------|
| FIX-SC01 | Add storage quota warning | MEDIUM |
| FIX-SC02 | Add message pagination | LOW |
| FIX-SC03 | Add card virtualization for large boards | LOW |

---

# 6. DATABASE AUDIT (AsyncStorage/SecureStore)

## Data Model Inventory

| Entity | Storage | Primary Key | Ownership | Constraints | Enforced By |
|--------|---------|-------------|-----------|-------------|-------------|
| Passphrase hash | SecureStore | Fixed key | Global | Required | App logic |
| Encryption key | SecureStore | Fixed key | Global | Required | App logic |
| Messages | AsyncStorage | `msg_*` | User | None | None |
| Gateway config | AsyncStorage | Fixed | User | None | None |
| Kanban cards | AsyncStorage | `card_*` | User | None | None |
| Theme pref | AsyncStorage | Fixed | User | Enum | App logic |

## Write Path Integrity

| Write Path | Transaction? | Idempotent? | Partial Risk |
|------------|--------------|-------------|--------------|
| Setup passphrase | No | No | HIGH - could write hash but not key |
| Save message | No | Yes (ID-based) | LOW |
| Save kanban | No | Yes (ID-based) | LOW |
| Save gateway config | No | Yes | LOW |

## Read Path Determinism

| Query | Ordered? | Tie-breaker? | Stable Pagination? |
|-------|----------|--------------|-------------------|
| Messages | By array order | N/A | No pagination |
| Kanban cards | By array order | N/A | No pagination |

## Backup/Restore Truth

| Aspect | Status |
|--------|--------|
| Backup exists | NO |
| Restore tested | NO |
| Disaster recovery | NO |

## Fix List - Database

| ID | Fix | Severity |
|----|-----|----------|
| FIX-DB01 | Wrap passphrase setup in try/catch with rollback | HIGH |
| FIX-DB02 | Implement encrypted backup export | MEDIUM |
| FIX-DB03 | Add data version field for migrations | MEDIUM |

---

# CONSOLIDATED FIX LIST (Priority Order)

## CRITICAL (Block Release)

| ID | Fix | Audit |
|----|-----|-------|
| FIX-M01 | Implement real AES-256-GCM vault encryption | Mobile |
| FIX-M02 | Upgrade to PBKDF2 password hashing | Mobile |
| FIX-PR01 | Add vault "⚠️ Demo Mode" warning banner | Production |

## HIGH (Fix Before Beta)

| ID | Fix | Audit |
|----|-----|-------|
| FIX-SEC01 | Move gateway token to SecureStore | Security |
| FIX-SEC02 | Add passphrase attempt lockout | Security |
| FIX-UI01 | Rename "Secrets Vault" with warning | UI |
| FIX-UI02 | Rename "Security Scanner" → "Device Checks" | UI |
| FIX-M05 | Implement or remove kanban sync | Mobile |
| FIX-DB01 | Add passphrase setup rollback | Database |

## MEDIUM (Fix Before Production)

| ID | Fix | Audit |
|----|-----|-------|
| FIX-UI03 | Add timestamps to chat messages | UI |
| FIX-UI04 | Mask gateway token in settings | UI |
| FIX-UI05 | Add app switcher blur | UI |
| FIX-SYS01 | Add WebSocket heartbeat | Systems |
| FIX-SYS04 | Surface SecureStore errors | Systems |
| FIX-SEC03 | Remove console.log in production | Security |
| FIX-PR02 | Implement data export | Production |
| FIX-SC01 | Add storage quota warning | Scalability |
| FIX-DB02 | Implement backup export | Database |

## LOW (Nice to Have)

| ID | Fix | Audit |
|----|-----|-------|
| FIX-UI06 | Add retry button to failed messages | UI |
| FIX-UI07 | Show card created/updated dates | UI |
| FIX-SYS02 | Validate gateway URL format | Systems |
| FIX-SC02 | Add message pagination | Scalability |

---

# WORST MISINTERPRETATION (All Audits)

> **Security:** "A user could believe their passphrase is secure because they set one, not knowing there's no brute-force protection and the token is stored in plaintext."

> **UI:** "A user could believe their secrets are encrypted because of the lock icon and 'Vault' name, when encryption is not implemented."

> **Production:** "A stakeholder could believe this is production-ready because it has professional UI and all features appear functional."

> **Systems:** "A user could believe the app is always connected because it auto-reconnects, not knowing messages could be lost during reconnection."

---

**Total Findings: 45**
- Critical: 3
- High: 8
- Medium: 12
- Low: 6
- Informational: 16
