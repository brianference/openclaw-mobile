# MobileClaw Implementation Task

**Priority:** P0 CRITICAL (20h idle, all specs ready)  
**Designer:** Morpheus (Designer Agent) - COMPLETE  
**Implementer:** Coder/Architect  
**Date:** 2026-02-08 17:29 MST

---

## Task

Implement the complete MobileClaw redesign from Designer Agent specs (210KB documentation):
- 25 screens designed
- 25 components specified
- Electric Blue + Emerald Green 2-color system
- WCAG 2.2 AA accessibility
- Mobile-first responsive (375px → 430px)

---

## Required Reading (MANDATORY)

**Read these files BEFORE writing any code:**

1. `/workspace/projects/mobileclaw/design-spec.md` (2,702 lines - complete design system)
2. `/workspace/projects/mobileclaw/component-library.md` (component specifications)
3. `/workspace/projects/mobileclaw/handoff.md` (implementation guide)
4. `/workspace/projects/mobileclaw/test-cases.md` (25 UX test cases)

**DO NOT skip reading these files.** They contain critical specifications.

---

## Implementation Scope

**Phase 1 (MVP - 4 weeks estimated):**

All 11 features:
1. Task Board - Kanban with drag-drop
2. Second Brain - Skills, ideas, memory
3. Encrypted Vault - AES-256-GCM + PBKDF2
4. Places - Trip planning framework
5. Scanner/OCR - Document capture
6. Security Dashboard - Vault settings, network monitor
7. Cloud Wizard - AWS + Google Cloud setup
8. AdMob Integration - Ads (banner, interstitial, rewarded)
9. Paid Version - $4.99 one-time purchase
10. Settings - Themes, preferences
11. **OpenClaw Chat** - Built-in chat with Cole (WebSocket to Gateway)

---

## Tech Stack

- **Framework:** Expo SDK 54, React Native
- **Language:** TypeScript
- **Routing:** Expo Router (file-based)
- **State:** React Context + AsyncStorage
- **Encryption:** expo-crypto (AES-256-GCM)
- **Auth:** expo-local-authentication (biometric)
- **Storage:** AsyncStorage (local), AWS S3/DynamoDB (cloud)

---

## Files to Create/Modify

**Base structure:**
```
/workspace/projects/openclaw-mobile/
├── app/
│   ├── (tabs)/
│   │   ├── task-board.tsx
│   │   ├── second-brain.tsx
│   │   ├── vault.tsx
│   │   ├── places.tsx
│   │   ├── settings.tsx
│   └── _layout.tsx
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   └── ... (25 components from component-library.md)
├── styles/
│   └── theme.ts (color tokens, typography, spacing)
└── utils/
    ├── crypto.ts (vault encryption)
    └── storage.ts (AsyncStorage wrapper)
```

---

## Implementation Checklist

From handoff.md, implement in this order:

### Phase 1: Design System Tokens
- [ ] Create theme.ts with color tokens from design-spec.md
- [ ] Verify max 3 colors (COMMANDMENT #5)
- [ ] Typography scale (Inter font family)
- [ ] Spacing system (4px base unit)

### Phase 2: Core Components
- [ ] Button (4 variants from component-library.md)
- [ ] Input (with validation states)
- [ ] Card (container component)
- [ ] BottomSheet (modals)

### Phase 3: Features (Priority Order)
1. [ ] Task Board (Kanban drag-drop)
2. [ ] Vault (AES-256-GCM encryption)
3. [ ] Second Brain
4. [ ] Settings
5. [ ] OpenClaw Chat (WebSocket integration)
6. [ ] Places (trip planning)
7. [ ] Scanner/OCR
8. [ ] Security Dashboard
9. [ ] Cloud Wizard
10. [ ] AdMob integration
11. [ ] Paid version flow

### Phase 4: Testing
- [ ] Run all 25 test cases from test-cases.md
- [ ] Must achieve ≥85% pass rate (22/25 minimum)
- [ ] Screenshot proof on Android, iPhone

---

## Success Criteria

- ✅ All 25 screens implemented per design-spec.md
- ✅ All 25 components built per component-library.md
- ✅ ≥85% test pass rate (22/25)
- ✅ COMMANDMENT #5 compliant (max 3 colors)
- ✅ WCAG 2.2 AA compliant
- ✅ Screenshot proof delivered to Telegram
- ✅ Working on Expo Go (iOS + Android)

---

## Timeline

**Estimated:** 4 weeks (20 working days)

**Week 1:** Design tokens + core components + Task Board + Vault  
**Week 2:** Second Brain + Settings + OpenClaw Chat  
**Week 3:** Places + Scanner + Security Dashboard  
**Week 4:** Cloud Wizard + AdMob + Paid version + testing

---

## Constraints

- **COMMANDMENT #5:** Maximum 3 colors (2 UI + neutrals)
- **COMMANDMENT #6:** Screenshot proof mandatory before "deployed" claim
- **COMMANDMENT #11:** Coder/Architect via Claude Code in tmux
- **Mobile-first:** Design from 375px up
- **No removing features:** Implement all 11 features

---

## Launch

Run via Claude Code in tmux with pre-approved permissions.

---

**Authority:** Brian directive (message 2596) - "Launch them"  
**Designer:** Morpheus completed specs (210KB)  
**Status:** Ready to start implementation NOW
