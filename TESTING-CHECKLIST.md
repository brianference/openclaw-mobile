# MobileClaw QA Testing Checklist

**Version:** 1.0  
**Date:** 2026-02-15  
**Status:** Ready for QA Execution  
**Total Test Cases:** 47

---

## Test Environment

| Attribute | Value |
|-----------|-------|
| Platform | iOS 13+ / Android 10+ |
| Expo SDK | 54 |
| Test Devices | iPhone SE (375px), iPhone 14 Pro Max (430px), iPad (768px) |
| Build | Development Build |
| Environment | Development |

---

## 1. Onboarding Flow (3 Screens)

### 1.1 Welcome Screen
- [ ] Welcome message displays correctly with app icon
- [ ] Stepper shows 1/3 active
- [ ] "Skip" button navigates to Setup screen
- [ ] "Next" button navigates to Features screen
- [ ] Swipe left gesture transitions to next screen
- [ ] Animation: Staggered fade-in on mount

### 1.2 Features Screen  
- [ ] All 5 feature cards display (Tasks, Brain, Vault, Places, Scanner)
- [ ] Feature icons render correctly
- [ ] Stepper shows 2/3 active
- [ ] "Back" button navigates to Welcome
- [ ] "Next" button navigates to Setup
- [ ] Features fade in sequentially (100ms stagger)

### 1.3 Setup Screen
- [ ] PIN/Password input field displays
- [ ] Confirm PIN field displays
- [ ] Password strength meter updates in real-time
- [ ] Biometric unlock checkbox displays (when supported)
- [ ] Validation: Minimum 8 characters, 1 number, 1 special
- [ ] Error: "Passwords don't match" on mismatch
- [ ] "Get Started" button enables only when valid
- [ ] Loading state shows spinner on button
- [ ] Success: Transitions to app main screen
- [ ] Password securely hashed with PBKDF2 (100k iterations)

---

## 2. Task Board (5 Screens)

### 2.1 Task List Screen
- [ ] Header displays "Tasks" title
- [ ] Search bar renders with placeholder
- [ ] Filter chips display (All, Active, Done)
- [ ] Task cards render with checkbox, title, due date, category
- [ ] Empty state displays when no tasks
- [ ] Skeleton loaders show during loading
- [ ] Pull-to-refresh triggers refresh
- [ ] FAB (+) opens Add Task screen
- [ ] Tap checkbox toggles completion (optimistic UI)
- [ ] Tap card navigates to Task Detail
- [ ] Swipe left reveals delete action (red)
- [ ] Swipe right reveals complete action (green)
- [ ] Long press enters multi-select mode

### 2.2 Task Detail Screen
- [ ] Task title displays and is tappable for inline edit
- [ ] Due date field displays current date
- [ ] Category badge displays
- [ ] Reminder field displays
- [ ] Notes section displays
- [ ] "Save Changes" button anchors at bottom
- [ ] Changes persist on save
- [ ] Date picker bottom sheet opens on tap
- [ ] Category picker opens on tap

### 2.3 Add/Edit Task Screen
- [ ] Title input autofocuses
- [ ] Due date picker works
- [ ] Category selector works
- [ ] Reminder selector works
- [ ] Notes textarea auto-expands
- [ ] Validation: Title required, 1-200 chars
- [ ] "Create Task" button disabled when invalid
- [ ] Success: Toast "Task created", navigates back

### 2.4 Task Filters Screen
- [ ] Bottom sheet slides up
- [ ] Status radio group works (All, Active, Completed)
- [ ] Category checkboxes work
- [ ] Due date filter works
- [ ] "Clear" resets all filters
- [ ] "Apply" applies filters and dismisses
- [ ] Swipe down dismisses sheet

### 2.5 Completed Tasks Archive
- [ ] Header displays "Completed"
- [ ] Completed tasks list with timestamps
- [ ] "Clear All Completed" button works
- [ ] Confirmation dialog before clear
- [ ] Empty state when no completed tasks

---

## 3. Second Brain (4 Screens)

### 3.1 Knowledge Base Home
- [ ] Search bar renders
- [ ] Filter tabs display (All, Skills, Ideas, Notes, Memories)
- [ ] Note cards render with icon, title, timestamp
- [ ] Empty state displays
- [ ] FAB (+) adds new note
- [ ] Tap card opens note detail

### 3.2 Skill Browser
- [ ] Category cards display (Design, Development, etc.)
- [ ] Subtopics render under categories
- [ ] Tap navigates to filtered knowledge base

### 3.3 Memory Timeline
- [ ] Sections display (Today, Yesterday, This Week, Older)
- [ ] Memory cards show timestamp
- [ ] Tap opens memory detail

### 3.4 Knowledge Search
- [ ] Search input auto-focuses
- [ ] Live results filter as typing
- [ ] Recent searches display
- [ ] Suggested searches display
- [ ] No results state displays

---

## 4. Encrypted Vault (6 Screens)

### 4.1 Vault Unlock Screen
- [ ] Lock icon displays (64px)
- [ ] Password input displays
- [ ] "Use Face ID" button shows (when supported)
- [ ] Biometric prompt opens on tap
- [ ] Error: Shake animation + "Incorrect password"
- [ ] Success: Transitions to Vault Contents
- [ ] Auto-lock after 5 minutes inactivity

### 4.2 Vault Contents Screen
- [ ] Search bar renders
- [ ] Type filters display (All, Login, Card, Note, Key)
- [ ] Secret cards render with icon, title, hidden value
- [ ] Eye icon reveals password (10 second timeout)
- [ ] Copy button copies to clipboard
- [ ] Swipe left deletes (confirmation required)

### 4.3 Add/Edit Secret Screen
- [ ] Type selector (Login, Card, Note, Key)
- [ ] Title input works
- [ ] Username input works
- [ ] Password field with reveal toggle
- [ ] Password generator opens
- [ ] URL input works
- [ ] Validation: Required fields

### 4.4 Vault Settings Screen
- [ ] Auto-lock dropdown works
- [ ] Biometric toggle works
- [ ] "Change master password" navigates
- [ ] "Rotate encryption key" navigates

### 4.5 Key Rotation Screen
- [ ] Warning displays
- [ ] Current password input
- [ ] Progress bar during rotation
- [ ] Success animation on completion

### 4.6 Security Audit Screen
- [ ] Vault Health status displays
- [ ] Weak passwords list
- [ ] Reused passwords list
- [ ] Recommendations display

---

## 5. Scanner/OCR (3 Screens) ✅ NEW

### 5.1 Camera View Screen
- [ ] Full-screen camera feed renders
- [ ] Document placement overlay displays (corners)
- [ ] "Position document within frame" guide text
- [ ] Capture button (center) responds to tap
- [ ] Shutter animation on capture
- [ ] "Extracting text..." processing overlay
- [ ] Success: Transition to preview
- [ ] Error: "OCR failed. Try again."
- [ ] Gallery button opens image picker
- [ ] Flash toggle works (off/on/auto)
- [ ] Camera flip button works
- [ ] Close button dismisses

### 5.2 Preview/Edit Screen
- [ ] Document image displays
- [ ] Extracted text renders in editable textarea
- [ ] Text can be edited
- [ ] Character counter displays (10000 limit)
- [ ] "Copy Text" button copies to clipboard
- [ ] "Save to Brain" button saves as note
- [ ] "Save" button saves document
- [ ] Cancel button discards and returns
- [ ] Toast notifications work

### 5.3 Document Library Screen
- [ ] Header displays "Documents"
- [ ] "Scan" button navigates to camera
- [ ] Empty state when no documents
- [ ] Document cards render with thumbnail, title, preview, date
- [ ] Eye icon opens document detail
- [ ] Trash icon deletes (confirmation required)
- [ ] "Saved" badge when saved to Brain
- [ ] FAB opens camera
- [ ] Pull-to-refresh works

---

## 6. Settings (4 Screens)

### 6.1 Settings Home
- [ ] All settings categories display
- [ ] Navigation to sub-settings works

### 6.2 Appearance Settings
- [ ] Dark/Light mode toggle works
- [ ] Theme saves to store
- [ ] Preview updates immediately

### 6.3 Notification Settings
- [ ] Task reminders toggle works
- [ ] Brain updates toggle works
- [ ] Vault alerts toggle works
- [ ] Settings save correctly

### 6.4 About Screen
- [ ] Version number displays
- [ ] Build number displays
- [ ] Links work (Privacy Policy, Terms)

---

## 7. OpenClaw Chat (1 Screen)

### 7.1 Chat Screen
- [ ] Chat interface renders
- [ ] Messages display correctly
- [ ] Input field works
- [ ] Send button functions
- [ ] Empty state displays

---

## 8. Navigation Tests

### 8.1 Tab Navigation
- [ ] Tab bar displays at bottom
- [ ] All 6 tabs render (Tasks, Brain, Vault, Chat, Scanner, Settings)
- [ ] Active tab highlights (Electric Blue)
- [ ] Tab tap switches screen
- [ ] Tab badge displays (Tasks count, etc.)
- [ ] Tab bar accessible (VoiceOver/TalkBack)

### 8.2 Stack Navigation
- [ ] Back button navigates up
- [ ] Deep linking works
- [ ] Modal presentations work (fullScreenModal for camera)

---

## 9. Store Integration Tests

### 9.1 Task Store
- [ ] Tasks persist to AsyncStorage
- [ ] CRUD operations work
- [ ] Filtering works
- [ ] Search works
- [ ] Supabase sync works (when enabled)

### 9.2 Vault Store
- [ ] Secrets persist encrypted
- [ ] Authentication works
- [ ] Biometric auth works
- [ ] Auto-lock works

### 9.3 Brain Store
- [ ] Notes persist
- [ ] Categories filter correctly
- [ ] Search works
- [ ] Pin/unpin works

### 9.4 Scanner Store
- [ ] Documents persist
- [ ] Current scan state works
- [ ] Document CRUD works
- [ ] Save to Brain works

### 9.5 Settings Store
- [ ] Appearance settings persist
- [ ] Notification settings persist
- [ ] Export/import works

---

## 10. Accessibility Tests

### 10.1 Screen Reader
- [ ] All screens have unique titles
- [ ] All interactive elements labeled
- [ ] All images have descriptions
- [ ] Focus order logical
- [ ] Live regions for dynamic content

### 10.2 Touch Targets
- [ ] All touch targets ≥44px
- [ ] Spacing between targets adequate

### 10.3 Color Contrast
- [ ] Dark mode: Text ≥4.5:1, UI ≥3:1
- [ ] Light mode: Text ≥4.5:1, UI ≥3:1

### 10.4 Keyboard Navigation
- [ ] Tab navigation works
- [ ] Enter activates elements
- [ ] Escape dismisses modals

---

## 11. Performance Tests

### 11.1 Startup Time
- [ ] Cold start < 2 seconds
- [ ] Warm start < 1 second

### 11.2 Memory
- [ ] Memory usage < 200MB typical
- [ ] No memory leaks

### 11.3 Animation
- [ ] All animations 60fps
- [ ] No dropped frames
- [ ] Reduced motion respects preference

---

## 12. Security Tests

### 12.1 Encryption
- [ ] Vault encryption AES-256-CTR + HMAC
- [ ] Password hashing PBKDF2 (100k iterations)
- [ ] Salt stored separately
- [ ] No plaintext passwords

### 12.2 Authentication
- [ ] Biometric auth works
- [ ] Auto-lock after inactivity
- [ ] Failed attempt lockout (5 attempts = 1 min)

### 12.3 Data Protection
- [ ] Sensitive data not in logs
- [ ] Clipboard clears after 30s
- [ ] Screenshots disabled in Vault (iOS)

---

## Test Execution Summary

| Category | P0 (Critical) | P1 (High) | P2 (Medium) | Total |
|----------|---------------|-----------|-------------|-------|
| Onboarding | 3 | 2 | 0 | 5 |
| Task Board | 5 | 3 | 2 | 10 |
| Second Brain | 2 | 2 | 0 | 4 |
| Vault | 4 | 4 | 2 | 10 |
| Scanner | 5 | 3 | 1 | 9 |
| Settings | 2 | 2 | 0 | 4 |
| Chat | 1 | 0 | 0 | 1 |
| Navigation | 2 | 1 | 0 | 3 |
| Store Integration | 3 | 2 | 0 | 5 |
| Accessibility | 3 | 2 | 1 | 6 |
| Performance | 1 | 2 | 0 | 3 |
| Security | 3 | 2 | 0 | 5 |
| **Total** | **34** | **25** | **6** | **65** |

### Pass Criteria
- **P0 Tests:** 100% must pass
- **P1 Tests:** ≥90% must pass
- **P2 Tests:** ≥75% must pass

---

## Known Issues

| Issue | Severity | Status | Workaround |
|-------|----------|--------|------------|
| Places screens not implemented | P2 | Open | Skip Places tests |
| Cloud Wizard not implemented | P2 | Open | Skip Cloud Wizard tests |
| AdMob not implemented | P2 | Open | Skip AdMob tests |
| Security Dashboard partial | P2 | Open | Test only implemented screens |

---

## Test Tools Required

1. **Playwright** - E2E web testing
2. **React Native Testing Library** - Component unit tests
3. **axe-core** - Accessibility testing
4. **Detox** - E2E mobile testing
5. ** Xcode / Android Studio** - Native build testing

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Product Owner | | | |
| Tech Lead | | | |

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-15 00:15 MST  
**Next Review:** After build 1.0.0 release