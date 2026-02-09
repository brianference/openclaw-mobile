# Mobileclaw Mobile App — Complete Redesign

## Feature Request

Complete UI/UX redesign of Mobileclaw mobile app (Expo SDK 54, React Native) with modern design patterns, accessibility, and production-ready polish.

## Current State

**Location:** `/root/.openclaw/workspace/projects/openclaw-mobile/`  
**Stack:** Expo SDK 54, React Native, TypeScript, Expo Router  
**Status:** MVP complete, needs full redesign for production

**Current Features (11 total):**
1. ✅ Task Board — Task management
2. 🧠 Second Brain — Skills, ideas, memory
3. 🔐 Encrypted Vault — AES-256-GCM, PBKDF2
4. 🗺️ Places — Trip planning & navigation
5. 📷 Scanner/OCR — Document capture
6. 🛡️ Security Dashboard — Vault settings, network monitor, privacy
7. ☁️ Cloud Wizard — AWS + Google Cloud setup
8. 💰 AdMob Integration — Banner/interstitial/rewarded ads, GDPR
9. 💎 Paid Version — $4.99 one-time, no ads
10. ⚙️ Settings — Themes, preferences
11. **💬 OpenClaw Chat (Built-in)** — Direct chat with Cole in-app

## Goals

### 1. Modern Design System

**Visual Identity:**
- Glassmorphism UI (frosted glass effects, depth, layers)
- Gradient accents (primary: #FF6B6B → #FFE66D, secondary: cool blues/purples)
- Smooth animations (spring physics, 60fps)
- Dark mode primary, light mode secondary
- Color constraint: **MAXIMUM 3 COLORS** (primarily 2 with shades)

**Components:**
- 44px minimum touch targets (Apple HIG standard)
- Consistent spacing scale (4px base grid)
- Typography hierarchy (clear heading/body/caption styles)
- Icon system (Expo Vector Icons, consistent style)

**References:**
- `/workspace/skills/modern-design/` — Modern design patterns
- Interface Design Skill — Component library

### 2. Accessibility (WCAG 2.2 AA)

- Screen reader support (VoiceOver, TalkBack)
- Keyboard navigation (Bluetooth keyboard support)
- Focus indicators (visible, high contrast)
- Color contrast ≥4.5:1 (text), ≥3:1 (UI components)
- Dynamic type support (respects OS text size)
- Reduced motion support (prefers-reduced-motion)

### 3. Performance

- 60fps animations (use Reanimated 3)
- Fast startup (<2s to interactive)
- Optimized images (WebP, lazy loading)
- Efficient re-renders (React.memo, useMemo)
- Small bundle size (<10 MB APK/IPA)

### 4. Production Polish

- Onboarding flow (3-screen tutorial)
- Error boundaries (graceful degradation)
- Loading states (skeletons, not spinners)
- Empty states (helpful, actionable)
- Haptic feedback (tactile confirmation)
- Offline support (basic functionality works offline)

## Success Criteria

### Design Quality
1. ✅ All screens have complete design specs (Figma-equivalent in markdown)
2. ✅ 20 UX test cases from Designer Agent
3. ✅ Color constraint enforced (max 3 colors)
4. ✅ Dark mode + light mode both designed
5. ✅ All states designed (loading, error, empty, success)

### Implementation Quality
6. ✅ WCAG 2.2 AA compliance (axe-core clean)
7. ✅ 60fps animations (no jank)
8. ✅ Works in Expo Go (no native modules that break it)
9. ✅ All 11 features redesigned and working
10. ✅ 20+ Playwright tests passing

### Production Readiness
11. ✅ App builds successfully (Android APK + iOS IPA)
12. ✅ No console errors or warnings
13. ✅ TypeScript strict mode clean
14. ✅ ESLint clean (zero warnings)
15. ✅ Tested on real devices (iPhone + Android)

## Technical Scope

### Screens to Redesign (11 features = ~25 screens)

**1. Task Board (5 screens)**
- Task list
- Task detail
- Add/edit task
- Filter/sort
- Completed tasks archive

**2. Second Brain (4 screens)**
- Knowledge base home
- Skill browser
- Memory timeline
- Search

**3. Encrypted Vault (6 screens)**
- Vault unlock (biometric + password)
- Vault contents
- Add/edit secret
- Settings
- Key rotation
- Security audit

**4. Places (5 screens)**
- Map view
- Place detail
- Trip planner
- Navigation
- Saved places

**5. Scanner/OCR (3 screens)**
- Camera view
- Preview/edit
- Document library

**6. Security Dashboard (3 screens)**
- Security overview
- Network monitor
- Privacy settings

**7. Cloud Wizard (4 screens)**
- Provider selection (AWS, Google Cloud)
- Credentials setup
- Service configuration
- Connection test

**8. AdMob Integration (2 screens)**
- Ad preferences
- GDPR consent

**9. Paid Version (2 screens)**
- Upgrade prompt
- Purchase confirmation

**10. Settings (4 screens)**
- General settings
- Appearance (theme, colors)
- Notifications
- About

**11. OpenClaw Chat (3 screens)**
- Chat interface
- Attachment picker
- Settings

### Components to Design

**Navigation:**
- Tab bar (5 main tabs)
- Header (with context actions)
- Drawer menu (settings, profile)

**Content:**
- Cards (task, skill, secret, place)
- Lists (scrollable, performant)
- Forms (inputs, pickers, switches)
- Modals (full-screen, sheet, alert)

**Feedback:**
- Toasts (success, error, info)
- Loading (skeleton, progress)
- Empty states
- Error boundaries

**Media:**
- Image viewers
- File pickers
- Camera interface
- Map component

## Design Constraints

1. **Mobile-first:** Design for 375px width (iPhone SE) minimum
2. **Touch-optimized:** 44px minimum touch targets
3. **Performance-conscious:** Avoid expensive effects on scroll
4. **Battery-friendly:** Minimize animation CPU usage
5. **Offline-capable:** Core features work without network
6. **Accessible:** Screen reader compatible, keyboard navigable
7. **Cross-platform:** Works on iOS + Android identically

## Ralph Loop Flow

```
PM creates PROMPT.md
    ↓
Designer (Morpheus) designs all 25 screens
    ↓
Designer produces:
    - design-spec.md (complete visual specs)
    - ux-test-cases.md (20 UX test cases)
    - component-library.md (reusable components)
    - accessibility-notes.md (WCAG compliance)
    ↓
Coder implements redesign
    ↓
Test Case Writer creates 20+ Playwright tests
    ↓
Test Agent executes tests
    ↓
Code Review validates quality
    ↓
Ralph Loop STATUS: COMPLETE
```

## Dependencies

- Expo SDK 54
- React Native
- TypeScript
- Expo Router (file-based routing)
- Reanimated 3 (animations)
- Expo Vector Icons
- Modern design skill
- Interface Design Skill

## Timeline

- **Phase 1:** Design all screens (Morpheus) — 3-5 days
- **Phase 2:** Implement redesign (Coder) — 5-7 days
- **Phase 3:** Testing (Test Writer + Agent) — 2-3 days
- **Phase 4:** Code review + polish — 1-2 days

**Total:** 11-17 days for complete redesign

## Priority

**P0** — Blockers for production launch:
- Onboarding flow
- Error boundaries
- Loading states
- WCAG 2.2 AA compliance

**P1** — Nice-to-haves:
- Haptic feedback
- Advanced animations
- Offline mode

## Notes

- This is a **full redesign** — not incremental changes
- Every screen gets the Morpheus treatment
- Maintain all 11 existing features
- No feature removal (fix bugs, don't delete)
- Focus on production polish and user delight

---

**Created:** 2026-02-08  
**Priority:** P0 (production readiness)  
**Status:** Ready for Ralph Loop launch  
**Next:** Launch Designer (Morpheus)
