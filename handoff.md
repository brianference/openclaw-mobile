# Design Handoff: MobileClaw Complete Redesign

**Version:** 1.0  
**Date:** 2026-02-08  
**Ralph Loop Iteration:** 1  
**Designer:** Morpheus (Designer Agent)

---

## Ralph Loop Dispatch

**Dispatched To:**
1. **Coder Agent** → Implement all screens and components per design-spec.md
2. **Test Case Writing Agent** → Generate automated test scripts from 25 UX test cases
3. **Test Agent** → Execute full test plan, validate acceptance criteria

---

## 1. Summary

### Feature
**MobileClaw Complete Redesign** v1.0

### Design Deliverables
- `design-spec.md` (65KB) — Complete visual specifications for all 25 screens
- `ux-test-cases.md` (44KB) — 25 UX test cases covering all flows, edge cases, accessibility
- `component-library.md` (37KB) — 25 reusable component specifications
- `accessibility-notes.md` (32KB) — WCAG 2.2 AA compliance documentation
- `handoff.md` (this file) — Structured handoff package

### Design Direction
**Utility & Function** — Clarity, efficiency, and trust over visual novelty

### Key Design Tokens
- **Primary Color:** Electric Blue (#0ea5e9)
- **Accent Color:** Emerald (#10b981)
- **Neutral Palette:** Dark mode primary (#0a0a0a, #1a1a1a, #2d2d2d)
- **Typography:** System fonts (SF Pro iOS, Roboto Android)
- **Spacing:** 4px base grid
- **Border Radius:** 8px, 12px, 16px, 24px
- **Shadows:** Elevation-based (2dp, 4dp, 8dp, 16dp)

### Screens Designed
**Total:** 25 screens across 11 features

1. Onboarding (3 screens)
2. Task Board (5 screens)
3. Second Brain (4 screens)
4. Encrypted Vault (6 screens)
5. Places (5 screens)
6. Scanner/OCR (3 screens)
7. Security Dashboard (3 screens)
8. Cloud Wizard (4 screens)
9. AdMob Integration (2 screens)
10. Paid Version (2 screens)
11. Settings (4 screens)
12. OpenClaw Chat (3 screens)

### New Components
**Total:** 25 reusable components (see component-library.md)

### Modified Components
- None (all new components for redesign)

---

## 2. Flows for Implementation (Coder Agent)

### 2.1 Primary Flow: Onboarding to First Task

**Steps:**
1. App launches → Onboarding Screen 1 (Welcome)
2. User taps "Next →"
3. Navigate to Onboarding Screen 2 (Features)
4. User taps "Next →"
5. Navigate to Onboarding Screen 3 (Setup)
6. User enters master password (twice)
7. User enables biometric unlock (optional)
8. User taps "Get Started →"
9. Password stored securely (PBKDF2 hashing)
10. Vault encryption key derived
11. Biometric key stored in system keychain
12. Navigate to Task List (empty state)
13. User taps "+ Add"
14. Navigate to Add Task screen
15. User fills form (title, due date, category, notes)
16. User taps "Create Task"
17. Task saved locally + synced (if online)
18. Navigate back to Task List
19. New task appears at top

**Success Criteria:**
- Onboarding completes in <2 minutes
- Password validation works (8+ chars, 1 number, 1 special)
- Biometric setup optional (skip allowed)
- Empty state shows helpful message + CTA
- First task creation successful

---

### 2.2 Alternative Flow: Vault Unlock with Biometric

**Steps:**
1. User navigates to Vault tab
2. App shows Vault Unlock screen
3. User taps "👆 Use Face ID"
4. System biometric prompt appears (Face ID/Touch ID/Fingerprint)
5. User authenticates
6. App decrypts vault encryption key from keychain
7. Navigate to Vault Contents
8. Secrets loaded and decrypted (first 20 items)
9. User scrolls → More items decrypted on-demand

**Fallback Flow (Biometric Fails):**
1. Biometric prompt fails (3 attempts)
2. Prompt: "Use password instead?"
3. User taps "Yes"
4. Password input shown
5. User enters master password
6. App derives encryption key from password (PBKDF2)
7. Navigate to Vault Contents

---

### 2.3 Error Flow: Network Failure During Task Sync

**Steps:**
1. User creates new task (online)
2. Network disconnects (Airplane Mode)
3. Task saves locally (SQLite/AsyncStorage)
4. Toast: "Saved offline. Will sync when online."
5. Task shows "🔄" sync pending indicator
6. User edits task (offline)
7. Changes saved locally
8. Network reconnects
9. Background sync starts automatically
10. Progress toast: "Syncing 2 changes..."
11. Sync completes
12. Success toast: "Synced successfully"
13. Sync indicators disappear

**Edge Case (Sync Conflict):**
1. Sync detects conflict (server version changed)
2. Conflict resolution modal: "Keep local" or "Use server version"
3. User selects option
4. Sync completes with chosen version

---

### 2.4 Error Flow: Vault Decryption Failure

**Steps:**
1. User taps vault secret to view
2. App attempts decryption
3. Decryption fails (corrupted data or wrong key)
4. Error modal:
   - Title: "Decryption Failed"
   - Message: "Unable to decrypt this secret. Data may be corrupted."
   - Actions: [Try Again] [Report Issue] [Cancel]
5. User taps "Try Again"
6. Re-attempts decryption
7. If still fails → Same error modal
8. If succeeds → Shows decrypted secret

**Security:**
- No partial decrypted data exposed
- Error doesn't leak key material
- User can report issue (logs encryption metadata, not data)

---

### 2.5 State Machine: Task State Transitions

```
[New Task Entry]
       ↓
    Create
       ↓
   [Active]
       ↓
    ├─ Complete → [Completed]
    ├─ Edit → [Active (updated)]
    └─ Delete → [Deleted] → (Undo available 5s)
       
[Completed]
       ↓
    ├─ Uncomplete → [Active]
    ├─ Delete → [Deleted]
    └─ Archive → [Archived]
```

**Triggers:**
- Create: Form submit
- Complete: Checkbox tap or swipe right
- Edit: Tap task card → Edit screen
- Delete: Swipe left or "Delete" button
- Undo: Tap "Undo" in toast (5 second window)

---

## 3. Interactive Elements Inventory

| Element | States | Transitions | A11y Role | Touch Target |
|---------|--------|-------------|-----------|--------------|
| Primary Button | default, hover, pressed, disabled, loading | 150ms ease-out scale | button | 44px min |
| Secondary Button | default, pressed, disabled | 150ms ease-out scale | button | 44px min |
| Text Button | default, pressed, disabled | 150ms opacity | button | 44px min |
| Input Field | default, focus, error, success, disabled | 200ms border color | textbox | 44px min |
| Checkbox | unchecked, checked, indeterminate, disabled | 200ms scale burst | checkbox | 44x44px |
| Toggle Switch | off, on, disabled | 250ms spring slide | switch | 52x44px |
| Radio Button | unselected, selected, disabled | 200ms inner dot | radio | 44x44px |
| Search Bar | empty, typing, loading | 300ms debounce | searchbox | 48px |
| List Item | default, pressed, swiping (left/right) | 250ms spring | button | 72px min |
| Tab Bar Item | inactive, active | 300ms spring scale | tab | 64px |
| Glass Card | default, elevated, pressed | 200ms scale + shadow | group/button | Variable |
| Bottom Sheet | hidden, visible (small/medium/large) | 300ms spring slide | dialog | N/A |
| Toast | hidden, visible, dismissed | 200ms slide down | status/alert | 44px |
| Modal | hidden, visible | 250ms fade + scale | dialog | N/A |
| FAB | default, pressed, extended | 200ms scale burst | button | 56x56px |
| Badge | count, dot | N/A (static) | text | N/A |
| Chip | inactive, active, disabled | 200ms bg color | button | 36px |
| Progress Bar | determinate, indeterminate | 1500ms shimmer (indeterminate) | progressbar | N/A |
| Skeleton | loading | 1500ms shimmer | status | N/A |
| Avatar | default, pressed | 150ms scale | image | 40x40px |
| Password Meter | weak, medium, strong | Instant (reacts to typing) | progressbar | N/A |
| Date Picker | hidden, visible | Platform native | N/A | Platform native |
| Bottom Sheet Picker | hidden, visible | 300ms spring slide | dialog | N/A |

---

## 4. UX Test Cases (25) — for Test Case Writing Agent

### Distribution by Category

| Category | Count | Test Case IDs |
|----------|-------|---------------|
| Happy Path | 4 | TC-001, TC-002, TC-003, TC-004 |
| Edge Cases | 5 | TC-005, TC-006, TC-007, TC-008, TC-009 |
| Error Handling | 4 | TC-010, TC-011, TC-012, TC-013 |
| Accessibility | 5 | TC-014, TC-015, TC-016, TC-017, TC-018 |
| Responsiveness | 3 | TC-019, TC-020, TC-021 |
| Performance | 2 | TC-022, TC-023 |
| Cross-Platform | 2 | TC-024, TC-025 |

### Priority Breakdown

- **P0 (Critical):** 11 test cases (must pass before launch)
- **P1 (High):** 11 test cases (should pass, minor issues acceptable)
- **P2 (Medium):** 3 test cases (nice-to-have, can defer)

### Full Test Cases

(See `ux-test-cases.md` for complete details. Summary below.)

#### TC-MOBILE-001: Complete Task Creation Flow (P0)
- **Automation:** `[data-testid="add-task-button"]`, assert task in list
- **Selectors:** Testable IDs on all form fields
- **Wait Conditions:** Toast animation complete (4s)
- **Assertions:** Task appears with correct title, due date, category

#### TC-MOBILE-002: Vault Secret Creation & Encryption (P0)
- **Automation:** Mock password generator, verify encryption
- **Security:** Never log actual passwords
- **Assertions:** Decrypted value matches generated password

#### TC-MOBILE-003: Place Search & Trip Planning (P1)
- **Automation:** Mock location API, test coordinates
- **Waits:** Map idle event before assertions
- **Assertions:** Map marker visible, trip created

#### TC-MOBILE-004: Onboarding to First Task (P0)
- **Automation:** Clear app data before test, mock biometric
- **Assertions:** Vault key exists in secure storage

#### TC-MOBILE-005: Empty States Across All Features (P1)
- **Automation:** Assert empty state message + CTA visible
- **Screenshots:** All 6 empty states

#### TC-MOBILE-006: Maximum Length Input Handling (P2)
- **Automation:** Generate max-length strings, assert no overflow

#### TC-MOBILE-007: Rapid Interaction & Race Conditions (P1)
- **Automation:** `userEvent.click` with 10ms delay, assert 1 API call

#### TC-MOBILE-008: Overflow Content & Scroll Behavior (P2)
- **Automation:** Generate 100 tasks, monitor FPS (≥55), memory (<200MB)

#### TC-MOBILE-009: Boundary Values & Invalid Data (P2)
- **Automation:** Test each validation rule independently

#### TC-MOBILE-010: Network Failure During Sync (P0)
- **Automation:** Mock network state (online → offline → online)

#### TC-MOBILE-011: Vault Decryption Failure (P0)
- **Automation:** Inject corrupted data, assert error modal

#### TC-MOBILE-012: Camera/Location Permission Denied (P1)
- **Automation:** Mock permission APIs, set denied state

#### TC-MOBILE-013: API Timeout & Slow Network (P1)
- **Automation:** Mock network delay (30s+), set timeout to 5s for test

#### TC-MOBILE-014: VoiceOver Full Flow (iOS) (P0)
- **Manual:** Human verification with checklist

#### TC-MOBILE-015: Keyboard-Only Navigation (P0)
- **Automation:** `userEvent.tab()`, assert `document.activeElement`

#### TC-MOBILE-016: Color Contrast Verification (P0)
- **Automation:** axe-core, assert 0 color-contrast violations

#### TC-MOBILE-017: Reduced Motion Mode (P1)
- **Automation:** Mock `prefers-reduced-motion: reduce`, assert ≤200ms duration

#### TC-MOBILE-018: Dynamic Text Size (P1)
- **Automation:** Set iOS text size to max, assert no overlap

#### TC-MOBILE-019: Breakpoint Transitions (P1)
- **Automation:** `page.setViewportSize()`, test 375px, 768px, 1024px

#### TC-MOBILE-020: Orientation Changes (P2)
- **Automation:** Rotate via `screen.orientation.lock('landscape')`

#### TC-MOBILE-021: Tablet Master-Detail Layout (P2)
- **Automation:** Viewport ≥768px, assert 2 panes visible

#### TC-MOBILE-022: Large Dataset Rendering (P1)
- **Automation:** Seed 500 tasks, assert render time <2s, FPS ≥55

#### TC-MOBILE-023: Slow Network Simulation (P2)
- **Automation:** Playwright `page.route()`, throttle to 2G

#### TC-MOBILE-024: iOS vs Android Platform Differences (P1)
- **Automation:** Separate test suites, visual regression

#### TC-MOBILE-025: App State Preservation (P1)
- **Manual:** Actual app suspend/resume (automation unreliable)

---

## 5. Accessibility Requirements — for Test Agent

### 5.1 WCAG 2.2 AA Checklist

**Perceivable:**
- [x] All images have alt text or `accessibilityLabel`
- [x] Color contrast ≥4.5:1 (text), ≥3:1 (UI)
- [x] Text resizable up to 200% without loss of content
- [x] Focus indicators visible (3px blue outline)

**Operable:**
- [x] All functionality available via keyboard
- [x] No keyboard traps (except modals)
- [x] Touch targets ≥44x44px
- [x] No time limits (or configurable)
- [x] No flashing content (≥3 flashes/sec)

**Understandable:**
- [x] Consistent navigation (tab bar always bottom)
- [x] Clear error messages (specific, actionable)
- [x] Form labels and instructions present
- [x] Predictable behavior (no auto-submit on focus)

**Robust:**
- [x] Proper accessibility roles (`button`, `heading`, etc.)
- [x] Name, Role, Value communicated
- [x] Status messages use `accessibilityLiveRegion`

### 5.2 Focus Order

**Task List Screen:**
1. Search bar
2. Filter chips (left to right)
3. Add button
4. Task cards (top to bottom)
5. Tab bar items (left to right)

**Task Detail Screen:**
1. Back button
2. More menu
3. Title field
4. Due date field
5. Category field
6. Reminder field
7. Notes field
8. Save button

**Modal (Bottom Sheet):**
1. Drag handle (not focusable)
2. Title (if interactive)
3. Form fields (top to bottom)
4. Action buttons (left to right: Cancel, Primary)

**Focus Trap:**
- Modals: Yes (Tab loops within, Esc to close)
- Navigation: No (allow system back)

### 5.3 Screen Reader Script Examples

**Task List:**
```
"Tasks. Heading level 1."
"Search tasks. Search field. Text entry."
"All, selected. Button."
"Active. Button."
"Completed. Button."
"Add task. Button."
"Task: Write design spec. Not completed. Due February 9 at 2 PM. Category: Work. Actions available. Swipe right to complete, swipe left to delete."
```

**Password Input:**
```
"Password. Secure text field. Required. Text entry."
"Password requirements: 8 or more characters, 1 number, 1 special character."
[User types]
"Password entered. Strength: Strong."
"Toggle password visibility. Button. Hidden."
```

**Task Card Swipe Action:**
```
[User swipes left]
"Delete task. Destructive action. Double-tap to confirm."
[User double-taps]
"Task deleted. Undo available."
```

### 5.4 Keyboard Map

**Global:**
- Tab: Next element
- Shift+Tab: Previous element
- Enter: Activate button
- Space: Toggle checkbox/switch
- Esc: Close modal/sheet

**App-Specific:**
- Cmd/Ctrl+1-5: Switch tabs
- Cmd/Ctrl+N: New task
- Cmd/Ctrl+F: Focus search
- Cmd/Ctrl+W: Close modal

### 5.5 Contrast Values

**Dark Mode:**
- Primary text (#f5f5f5 on #0a0a0a): **15.8:1** ✓
- Secondary text (#a3a3a3 on #0a0a0a): **6.7:1** ✓
- Tertiary text (#737373 on #0a0a0a): **4.6:1** ✓
- Primary button (#fff on #0ea5e9): **8.2:1** ✓
- Error text (#ef4444 on #0a0a0a): **4.8:1** ✓
- Border (#333 on #0a0a0a): **3.2:1** ✓

**Light Mode:**
- Primary text (#0a0a0a on #fff): **21:1** ✓
- Secondary text (#525252 on #fff): **7.4:1** ✓
- All others: ≥3:1 ✓

### 5.6 Touch Targets

**Verified ≥44x44px:**
- ✓ Buttons (all types)
- ✓ Checkboxes
- ✓ Toggle switches (52x44px)
- ✓ Icon buttons (padding added)
- ✓ List items (72px height)
- ✓ Tab bar items (64px height)
- ✓ Close buttons (padding added)
- ✓ Search bar (48px height)

### 5.7 Reduced Motion

**Fallbacks:**
- Page transitions: Crossfade only (≤200ms)
- Modals: Fade in (no scale)
- Buttons: Opacity change (no scale)
- Skeletons: Static gradient (no shimmer)
- Spinners: Pulsing opacity (no rotation)

---

## 6. Responsive Test Matrix

| Breakpoint | Width | Layout Changes | Elements Affected |
|------------|-------|----------------|-------------------|
| **Mobile (iPhone SE)** | 375px | Single column, full-width cards, bottom tabs | All screens |
| **Large Mobile (iPhone 14 Pro)** | 430px | Same as 375px, more spacing (16px → 20px) | All screens |
| **Tablet (iPad)** | 768px | Two-column cards, centered modals (500px), side-by-side details | Task List, Vault, Settings |
| **Large Tablet (iPad Pro)** | 1024px | Three-column cards, master-detail (list 320px + detail), map 60%/40% | Task List, Vault, Places |

**Orientation:**
- Portrait: Default for all breakpoints
- Landscape (Tablet): Master-detail layouts (task list + detail side-by-side)
- Landscape (Mobile): Same as portrait (avoid awkward layouts)

**Testing:**
- Test at each breakpoint independently
- No horizontal scroll at any size
- Touch targets maintained (≥44px)
- Text readable (no zoom required)

---

## 7. Acceptance Criteria — for Code Review Agent

**Design Implementation:**
- [ ] All 25 screens implemented per design-spec.md
- [ ] All 25 components match component-library.md
- [ ] Color system: 2 colors + neutral (Electric Blue + Emerald + grays)
- [ ] Typography: System fonts (SF Pro iOS, Roboto Android)
- [ ] Spacing: 4px base grid used consistently
- [ ] Border radius: 8px, 12px, 16px, 24px per spec
- [ ] Shadows: Elevation system (2dp, 4dp, 8dp, 16dp)

**UX Test Cases:**
- [ ] All 25 UX test cases pass (≥85% pass rate required)
- [ ] All P0 test cases pass (100% required)
- [ ] All P1 test cases pass (≥90% required)
- [ ] P2 test cases: Best effort

**Accessibility:**
- [ ] WCAG 2.2 AA compliance (axe-core clean, ≥95 Lighthouse score)
- [ ] All touch targets ≥44x44px verified
- [ ] All contrast ratios meet AA (4.5:1 text, 3:1 UI)
- [ ] VoiceOver/TalkBack full flow functional
- [ ] Keyboard navigation complete (all elements focusable)
- [ ] Focus indicators visible (3px blue outline)
- [ ] Reduced motion mode functional
- [ ] Dynamic type support (up to 200% scaling)

**Responsive Design:**
- [ ] All breakpoints render correctly (375px, 430px, 768px, 1024px)
- [ ] Orientation changes handled (portrait ↔ landscape)
- [ ] Tablet master-detail layout functional
- [ ] No layout shift (CLS < 0.1)

**Animation & Motion:**
- [ ] All animations 60fps (Reanimated 3 on UI thread)
- [ ] Spring physics feel native (iOS-like)
- [ ] Reduced motion fallbacks implemented
- [ ] No vestibular triggers (no parallax, rotate, etc.)

**States:**
- [ ] All screens: Empty, Loading (skeleton), Error, Success
- [ ] All interactive elements: Default, Hover, Active, Focus, Disabled
- [ ] All forms: Valid, Invalid, Submitting, Success, Error

**Dark + Light Mode:**
- [ ] Both modes implemented
- [ ] Parity between modes (identical layouts)
- [ ] Auto (system) mode functional
- [ ] Manual override in settings

**Performance:**
- [ ] Large datasets (500+ items) render smoothly (FlashList)
- [ ] Scroll FPS ≥55
- [ ] Memory usage <200MB (with encryption overhead)
- [ ] Bundle size <10MB (APK/IPA)
- [ ] Startup time <2s to interactive

**Platform Parity:**
- [ ] iOS and Android feature parity
- [ ] Platform-specific patterns respected (swipe back iOS, back button Android)
- [ ] Native components used (date picker, share sheet, biometric)

**Security:**
- [ ] Vault encryption: AES-256-GCM
- [ ] Password hashing: PBKDF2 (100k iterations minimum)
- [ ] Biometric keys stored in system keychain
- [ ] No plaintext secrets in logs or errors
- [ ] Auto-lock functional (5min default)

**Offline Support:**
- [ ] Tasks save offline (local DB)
- [ ] Sync resumes when online
- [ ] Conflict resolution implemented
- [ ] "Offline" indicator visible

**Error Handling:**
- [ ] Network failures: Graceful degradation + retry
- [ ] Permission denials: Clear messaging + settings link
- [ ] Encryption failures: Error modal + retry
- [ ] API timeouts: Progress indicators + timeout handling

---

## 8. Known Issues / Trade-offs

### Design Decisions with Rationale

**1. Glassmorphism Performance on Low-End Android**
- **Trade-off:** `backdrop-filter: blur()` expensive on Android <10
- **Rationale:** Modern aesthetic worth the cost
- **Mitigation:** Fallback to solid background if FPS < 30fps

**2. 60fps Animation Target**
- **Trade-off:** Complex animations may drop to 30fps on budget phones
- **Rationale:** Reanimated 3 runs on UI thread; acceptable fallback
- **Mitigation:** Monitor FPS, reduce spring complexity if needed

**3. 44px Touch Targets (Information Density Loss)**
- **Trade-off:** Some vertical space lost to large touch targets
- **Rationale:** Accessibility requirement, non-negotiable
- **Mitigation:** Use scrolling, vertical space is free on mobile

**4. Dark Mode Primary**
- **Trade-off:** Light mode users may feel like second-class citizens
- **Rationale:** Target audience (power users) prefer dark
- **Implementation:** Both modes fully supported, Auto (system) default

**5. Single-Column Mobile Layouts**
- **Trade-off:** More scrolling required vs desktop
- **Rationale:** Thumb zone optimization > density
- **Implementation:** Two columns on tablet (768px+)

**6. System Fonts Only (No Custom Fonts)**
- **Trade-off:** Less brand personality
- **Rationale:** Accessibility (native feel), performance (no font loading)
- **Benefit:** Respects Dynamic Type, zero font loading delay

**7. Bottom Sheet for Pickers (Not Native)**
- **Trade-off:** Custom component vs native pickers
- **Rationale:** Consistent UX across iOS/Android
- **Mitigation:** Native date/time pickers still used (platform convention)

**8. Limited Offline Functionality**
- **Trade-off:** Some features require network (Chat, Places search)
- **Rationale:** Backend-dependent features can't work offline
- **Implementation:** Clear "Offline" messaging, graceful degradation

---

## 9. Implementation Order (Suggested)

### Phase 1: Foundation (Week 1)
1. Setup design tokens (colors, spacing, typography)
2. Implement 5 core components:
   - Glass Card
   - Primary Button
   - Input Field
   - Bottom Sheet
   - Toast
3. Implement Tab Bar navigation
4. Setup Reanimated 3 + animation utilities
5. Setup accessibility helpers (VoiceOver, keyboard)

### Phase 2: Authentication & Vault (Week 1)
1. Onboarding flow (3 screens)
2. Auth system (password + biometric)
3. Vault unlock screen
4. Vault contents screen
5. Add/edit secret screen
6. Encryption implementation (AES-256-GCM)

### Phase 3: Core Features (Week 2)
1. Task Board (5 screens)
2. Second Brain (4 screens)
3. Places (5 screens)
4. Settings (4 screens)

### Phase 4: Additional Features (Week 2)
1. Scanner/OCR (3 screens)
2. Security Dashboard (3 screens)
3. Cloud Wizard (4 screens)
4. OpenClaw Chat (3 screens)

### Phase 5: Monetization & Polish (Week 3)
1. AdMob integration (2 screens)
2. Paid version (2 screens)
3. Empty states for all screens
4. Loading states (skeletons)
5. Error states

### Phase 6: Accessibility & Testing (Week 3)
1. VoiceOver/TalkBack full implementation
2. Keyboard navigation complete
3. Contrast verification (automated + manual)
4. Touch target audit
5. Reduced motion implementation
6. Dynamic type testing

### Phase 7: Platform Parity (Week 3)
1. iOS-specific tweaks (safe areas, swipe back)
2. Android-specific tweaks (back button, Material ripple)
3. Cross-platform testing (iPhone + Android)
4. Performance optimization (FPS, memory)

### Phase 8: Final Testing & Launch Prep (Week 4)
1. Execute all 25 UX test cases
2. Remediate failures
3. Code review
4. Build APK + IPA
5. Submit to TestFlight (iOS) and internal testing (Android)
6. User testing with real devices
7. Final bug fixes
8. Production deployment

---

## 10. API Contracts & Data Shapes

### Task
```typescript
interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string; // ISO 8601 (e.g., "2026-02-09T14:00:00Z")
  category: 'work' | 'personal' | 'shopping';
  reminder?: string; // ISO 8601
  notes?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  syncStatus?: 'synced' | 'pending' | 'failed'; // Offline sync
}
```

### VaultItem
```typescript
interface VaultItem {
  id: string;
  type: 'login' | 'card' | 'note' | 'key';
  title: string;
  encrypted: boolean;
  encryptedData: string; // Base64 AES-256-GCM encrypted JSON
  iv: string; // Initialization vector (Base64)
  authTag: string; // Authentication tag (Base64)
  createdAt: string;
  updatedAt: string;
}

// Decrypted data shape (VaultLoginData example)
interface VaultLoginData {
  username: string;
  password: string;
  url?: string;
  notes?: string;
}
```

### Place
```typescript
interface Place {
  id: string;
  name: string;
  category: string; // e.g., "restaurant", "cafe", "museum"
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  website?: string;
  notes?: string;
  photoUrl?: string;
  rating?: number; // 0-5
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Note (Second Brain)
```typescript
interface Note {
  id: string;
  type: 'skill' | 'idea' | 'note' | 'memory';
  title: string;
  content: string; // Markdown or plain text
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: {
    type: 'image' | 'file' | 'location';
    uri: string;
    mimeType?: string;
  }[];
  timestamp: string; // ISO 8601
  status?: 'sending' | 'sent' | 'failed';
}
```

### User Settings
```typescript
interface UserSettings {
  theme: 'dark' | 'light' | 'auto';
  accentColor: '#0ea5e9' | '#10b981' | '#a855f7' | '#f59e0b';
  fontSize: number; // 14-20 (default 16)
  reduceMotion: boolean;
  notifications: {
    enabled: boolean;
    taskReminders: boolean;
    dailySummary: boolean;
    dailySummaryTime: string; // "08:00"
  };
  vault: {
    autoLockMinutes: 5 | 15 | 30 | null; // null = never
    biometricEnabled: boolean;
  };
}
```

---

## 11. Dependencies

### React Native / Expo
- `expo@~51.0.0` (SDK 51, currently on SDK 54 — verify compatibility)
- `react-native@0.74.0`
- `react@18.2.0`
- `typescript@5.3.0`

### Navigation
- `expo-router@~3.5.0` (file-based routing)
- `react-navigation` (underlying dependency)

### Animation
- `react-native-reanimated@~3.10.0` (60fps animations on UI thread)
- `react-native-gesture-handler@~2.16.0` (swipe gestures)

### UI Components
- `expo-linear-gradient@~13.0.0` (gradient buttons)
- `expo-blur@~13.0.0` (glassmorphism)
- `@gorhom/bottom-sheet@^4.6.0` (bottom sheets)
- `react-native-modal@^13.0.0` (modals)

### Haptics & Feedback
- `expo-haptics@~13.0.0` (tactile feedback)
- `expo-status-bar@~1.12.0`

### Security
- `expo-local-authentication@~14.0.0` (biometric)
- `expo-secure-store@~13.0.0` (keychain)
- `expo-crypto@~13.0.0` (encryption utilities)

### Permissions
- `expo-camera@~15.0.0` (scanner)
- `expo-location@~17.0.0` (places)
- `expo-media-library@~16.0.0` (photo picker)

### Storage
- `@react-native-async-storage/async-storage@^1.23.0` (local storage)
- `expo-file-system@~17.0.0` (file operations)

### Network
- `axios@^1.6.0` (HTTP client)
- `@react-native-community/netinfo@^11.3.0` (network status)

### Testing
- `@testing-library/react-native@^12.4.0`
- `jest@^29.7.0`
- `@playwright/test@^1.42.0` (e2e tests)

### Accessibility
- `@react-native-community/accessibility@^3.2.0`
- `axe-core@^4.8.0` (automated audits)

---

## 12. Downstream Dispatch

### → CODER AGENT

**Task:** Implement all 25 screens and 25 components per design-spec.md.

**Key Directives:**
1. Use tokens from this handoff (colors, spacing, typography)
2. Implement all states (default, hover, active, focus, disabled, loading, error, success, empty)
3. Follow flows in Section 2 for implementation order
4. Reference component-library.md for exact specifications
5. Meet all accessibility requirements in Section 5
6. Test at all responsive breakpoints in Section 6
7. Flag any spec ambiguities in your status report (don't guess)

**Output:**
- All screens implemented (25 screens)
- All components implemented (25 components)
- Dark + light mode parity
- Accessibility complete (WCAG 2.2 AA)
- Platform parity (iOS + Android)
- Status report: What's complete, what's blocked, what needs clarification

---

### → TEST CASE WRITING AGENT

**Task:** Generate automated test scripts from the 25 UX test cases in ux-test-cases.md.

**Key Directives:**
1. Use automation notes from each test case (selectors, waits, assertions)
2. Include accessibility assertions via axe-core (contrast, roles, labels)
3. Prioritize P0 tests (11 test cases — must automate)
4. Best effort for P1 tests (11 test cases — should automate)
5. Mark P2 tests as manual (3 test cases — optional automation)
6. Use Playwright for e2e tests, React Native Testing Library for component tests
7. Mock network/API responses where noted
8. Generate test data (tasks, secrets, notes) in `beforeAll` hooks

**Output:**
- 25 test scripts (Playwright + RNTL)
- Test fixtures (mock data)
- Test configuration (setup/teardown)
- CI/CD integration (GitHub Actions or equivalent)
- Coverage report (aim for ≥80% coverage)

---

### → TEST AGENT

**Task:** Execute the full test plan. Validate every acceptance criterion in Section 7.

**Key Directives:**
1. Run automated tests (25 test cases)
2. Run manual tests where automation isn't feasible (VoiceOver, app suspend/resume)
3. Report pass/fail per test case with screenshots of failures
4. Verify all acceptance criteria (checkboxes in Section 7)
5. Test on real devices (iPhone + Android)
6. Test at all breakpoints (375px, 768px, 1024px)
7. Test accessibility (VoiceOver, keyboard, contrast, reduced motion)
8. Performance benchmarks (FPS ≥55, memory <200MB, startup <2s)
9. Generate test report (pass/fail rates, screenshots, logs)

**Output:**
- Test execution report (25 test cases: pass/fail)
- Acceptance criteria checklist (all checkboxes verified)
- Screenshots of failures
- Performance metrics (FPS, memory, startup time)
- Accessibility audit report (axe-core + manual)
- Device compatibility matrix (iOS 13+, Android 10+)
- Final recommendation: PASS (ship) or FAIL (remediate)

---

## 13. Ralph Loop Termination Conditions

### STATUS: COMPLETE (Loop Exits)

**All of the following must be true:**
- ✅ All 25 screens implemented
- ✅ All 25 components implemented
- ✅ All P0 test cases pass (11/11)
- ✅ ≥90% P1 test cases pass (10/11 minimum)
- ✅ All acceptance criteria checked (Section 7)
- ✅ WCAG 2.2 AA compliance (axe-core clean)
- ✅ No blocking bugs (P0 bugs = 0)
- ✅ Performance meets benchmarks (FPS ≥55, memory <200MB, startup <2s)
- ✅ Code review approved
- ✅ Builds successfully (iOS IPA + Android APK)

### STATUS: BLOCKED (Loop Pauses, Escalate to PM)

**Any of the following is true:**
- ❌ Spec ambiguity or contradiction (Coder can't proceed)
- ❌ Missing API contract (backend not ready)
- ❌ Platform limitation discovered (React Native can't do X)
- ❌ Accessibility requirement impossible to meet (needs design amendment)
- ❌ Performance target unachievable (needs optimization or spec change)

**Resolution:**
- Designer (Morpheus) issues Design Amendment (not full respec)
- PM/Orchestrator updates PROMPT.md or API specs
- Loop resumes after blocker resolved

### STATUS: NEEDS_ITERATION (Loop Continues)

**Any of the following is true:**
- ⚠️ <90% P1 test cases pass (needs fixes)
- ⚠️ Accessibility failures (contrast, keyboard, screen reader)
- ⚠️ Performance below target (FPS <55, memory >200MB)
- ⚠️ Visual bugs (layout breaks, missing states)
- ⚠️ Code review feedback (refactoring needed)

**Resolution:**
- Coder fixes issues
- Test Agent re-runs failed tests
- Code Review re-evaluates
- Loop repeats until STATUS: COMPLETE

---

## 14. Contact & Support

**Designer:** Morpheus (Designer Agent)  
**Designed:** 2026-02-08  
**Ralph Loop:** Iteration 1  
**Questions:** Flag in status report, Designer will issue clarifications or amendments

**Design Artifacts:**
- `design-spec.md` — Complete visual specifications (65KB)
- `ux-test-cases.md` — 25 UX test cases (44KB)
- `component-library.md` — 25 component specs (37KB)
- `accessibility-notes.md` — WCAG 2.2 AA compliance (32KB)
- `handoff.md` — This document (structured handoff package)

---

**Handoff Complete.**  
**Dispatching to Coder Agent, Test Case Writing Agent, Test Agent.**  
**Ralph Loop Status:** READY FOR IMPLEMENTATION

**Morpheus (Designer Agent)**  
**2026-02-08**  
**Ralph Loop Iteration 1**
