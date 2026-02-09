# Mobileclaw - Ideas & Features (Second Brain)

**Purpose:** Capture ideas from everything we build  
**Process:** Assess → Document → Review weekly → Promote to Task Board  
**Rule:** Core features only, make them powerful  

---

## 💡 Active Ideas (To Review)

### Trip Map v3 → Places Mobile
**Date:** 2026-02-07  
**Source:** Building enhanced trip itinerary web app  
**Core or Nice:** CORE  
**Justification:** 
- Primary travel use case
- Google Maps + Places API integration proven
- Find food nearby is essential
- Used daily during trips

**Include in MVP:**
- ✅ Create trip with dates
- ✅ Add locations via Places search
- ✅ View map with markers
- ✅ Find food nearby
- ✅ Get directions (one-tap Google Maps)

**Skip for MVP:**
- ❌ Train schedules (complex, regional-specific)
- ❌ Offline maps (most have internet)
- ❌ Timeline filtering (nice but not essential)
- ❌ Route optimization (Google handles this)
- ❌ Weather integration (check weather app)

---

### Security Audit → Vault Improvements
**Date:** 2026-02-07  
**Source:** Security audit of trip app  
**Core or Nice:** CORE (for Vault)  
**Justification:**
- Password protection essential for vault
- Token rotation = good practice
- Biometric unlock = must-have for mobile

**Include in MVP:**
- ✅ AES-256-GCM encryption
- ✅ PBKDF2 password hashing
- ✅ Biometric unlock (FaceID/TouchID)
- ✅ Auto-lock after 5 min
- ✅ Password strength meter

**Skip for MVP:**
- ❌ Security dashboard (too much surface area)
- ❌ Session management (single device for MVP)
- ❌ Network security settings (HTTPS by default)

---

### Task Board Web → Task Board Mobile Sync
**Date:** 2026-02-07  
**Source:** Using task board daily  
**Core or Nice:** NICE (sync), CORE (mobile task board itself)  
**Justification:**
- Mobile task board is core (task management on-the-go)
- Sync is nice but not essential for MVP
- Can manually add tasks to mobile for now

**Include in MVP:**
- ✅ Task board (already built)
- ✅ Add/edit/complete tasks
- ✅ Drag and drop

**Skip for MVP:**
- ❌ Web sync (manual is fine for MVP)
- ❌ Recurring tasks
- ❌ Bug tracking
- ❌ Burndown charts

---

## 🗄️ Archived Ideas (Nice-to-Have)

### Control Tower Mobile
**Date:** 2026-02-07  
**Archived:** Phase 2  
**Why:** Nice monitoring feature, but web dashboard works for now. Not essential for day 1.

### Cloud Setup Wizard
**Date:** 2026-02-07  
**Archived:** Phase 2  
**Why:** Complex, not essential. Manual cloud setup is fine for early users.

### Train Schedule Integration
**Date:** 2026-02-07  
**Archived:** Phase 2  
**Why:** Regional complexity (Tokyo Metro vs NYC Subway). Google Maps transit mode sufficient for MVP.

---

## 📋 Promoted to Backlog (Ready for Task Board)

### Vault Security Fixes
**Promoted:** 2026-02-07  
**Status:** IN PROGRESS  
**Task Board:** Active  
**Priority:** CRITICAL  

### Brain - Skills Search
**Promoted:** 2026-02-07  
**Status:** TO BUILD  
**Task Board:** Next Up  
**Priority:** HIGH  

### Brain - Quick Capture
**Promoted:** 2026-02-07  
**Status:** TO BUILD  
**Task Board:** Next Up  
**Priority:** HIGH  

### Places - Core Features
**Promoted:** 2026-02-07  
**Status:** Building web version first  
**Task Board:** Next Up  
**Priority:** HIGH  

---

## 🎯 Assessment Template (Use This)

When building anything, capture ideas here:

```markdown
### [Feature Name]
**Date:** YYYY-MM-DD
**Source:** [What we were building]
**Core or Nice:** [CORE / NICE / EDGE]
**Justification:** 
- Why this would be powerful
- Primary use case
- Would we use it daily?

**Include in MVP:**
- ✅ [Essential piece 1]
- ✅ [Essential piece 2]

**Skip for MVP:**
- ❌ [Nice-to-have 1]
- ❌ [Edge case 2]
```

---

## 📅 Weekly Review Schedule

**Every Monday 9:00 AM MST:**

1. **Review Ideas section** (10 min)
   - Is this still relevant?
   - Is this core or nice?
   - Should we build it?

2. **Promote 2-3 CORE ideas to Backlog** (5 min)
   - Only if they're essential
   - Only if we'll use daily
   - Strip away nice-to-haves

3. **Archive nice-to-haves** (5 min)
   - Move to Archived section
   - Note why (for later phases)

4. **Update Task board** (5 min)
   - Add promoted items
   - Prioritize ruthlessly

**Total:** 25 minutes weekly

---

## 🚫 What NOT to Capture

**Don't document:**
- Features we'll never build
- Hypothetical edge cases
- "Wouldn't it be cool if..." ideas
- Features copying other apps without clear use case

**Do document:**
- Features we'd use daily
- Pain points we experience while dogfooding
- Essential missing pieces
- Integration opportunities

---

## 💬 Recent Conversations → Ideas

### 2026-02-07: Trip Map v3 Discussion
**Captured:**
- Places feature for mobile (CORE)
- Train schedules (NICE - Phase 2)

**Decision:**
- Build Places with core features only
- Skip train schedules for MVP
- Focus on making location search FAST

---

### 2026-02-07: Security Discussion
**Captured:**
- Vault encryption improvements (CORE)
- Security dashboard (NICE - Phase 2)

**Decision:**
- Fix vault security NOW (critical)
- Security dashboard can wait
- Focus on making vault FAST and secure

---

### 2026-02-07: Monetization Discussion
**Captured:**
- AdMob integration (Phase 3)
- Paid version (Phase 3)

**Decision:**
- Skip for MVP entirely
- Focus on product-market fit first
- Revenue after we have happy users

---

**Last Updated:** 2026-02-07 17:40 MST  
**Next Review:** 2026-02-14 09:00 MST  
**Status:** Active capture, weekly review process established
