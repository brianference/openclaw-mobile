# Mobileclaw MVP - Core Features Only

**Date:** 2026-02-07 17:38 MST  
**Philosophy:** Powerful core features, not many mediocre features  
**Strategy:** Dogfood everything we build  

---

## 🎯 MVP Core Features (Must Have)

### 1. Task Board ✅ (DONE)
**Power Feature:** Visual task management  
**Status:** Built, works  
**Improve:** Make drag/drop smoother, add quick-add shortcuts  

### 2. Vault 🔐 (IN PROGRESS)
**Power Feature:** AES-256-GCM encrypted storage for API keys  
**Critical Missing:**
- ✅ AES-256-GCM encryption (fix #1)
- ✅ PBKDF2 password hashing (fix #2)
- ✅ Biometric unlock (FaceID/TouchID)
- ✅ Auto-lock after 5 min

**Improve, Don't Expand:**
- Make unlock FAST (<1 second)
- Make add/edit keys smooth
- Copy-to-clipboard with auto-clear

**Skip for MVP:**
- Multiple vaults
- Shared vaults
- Vault categories/folders
- Vault backup/restore (use cloud sync instead)

### 3. Places 🗺️ (BUILDING WEB VERSION FIRST)
**Power Feature:** Trip planning with Google Maps + Places API  
**Core Functions:**
- Create trip with name + dates
- Add locations (search via Places API)
- View on map with markers
- Get directions (Google Maps)
- Find food nearby (Places API)

**Improve, Don't Expand:**
- Make location search FAST
- Make map smooth and responsive
- One-tap directions

**Skip for MVP:**
- Offline maps
- Multi-city trips
- Trip templates
- Trip sharing
- Route optimization (use Google's)
- Train schedules (complex, regional)

### 4. Brain 🧠 (TO BUILD)
**Power Feature:** Quick capture + reference skills  
**Core Functions:**
- **Skills Repository:** Search/view 70+ installed skills
- **Quick Capture:** Voice note → text, photo → text
- **Search:** Find skills/notes fast

**Improve, Don't Expand:**
- Make capture INSTANT (<2 seconds)
- Make search FAST (local indexing)
- Make skills readable (good formatting)

**Skip for MVP:**
- Ideas organization/categorization
- Memory timeline
- Skill ratings/favorites
- Skill sharing
- Notebooks/folders

### 5. Scanner 📷 (DONE)
**Power Feature:** OCR for receipts/documents  
**Status:** Built, works  
**Improve:** Make OCR more accurate  
**Skip:** Receipt categorization, expense tracking

### 6. Settings ⚙️ (DONE)
**Power Feature:** Dark/light mode, basic preferences  
**Status:** Built, works  
**Skip:** Advanced customization, themes, fonts

---

## ❌ NOT IN MVP (Later Phases)

### Control Tower 🎛️ → Phase 2
**Why skip MVP:** Nice to have, not essential  
**When to add:** After core features are POWERFUL  
**Justification:** Can monitor via web dashboard for now

### Security Dashboard 🔒 → Phase 2
**Why skip MVP:** Core security is in Vault  
**When to add:** After vault is perfect  
**Justification:** Basic security settings in Settings screen

### Cloud Setup Wizard ☁️ → Phase 2
**Why skip MVP:** Complex, not essential for day 1  
**When to add:** After MVP is stable  
**Justification:** Manual setup for early users is fine

### AdMob 💰 → Phase 3
**Why skip MVP:** Focus on product first, revenue later  
**When to add:** After 1,000+ users  

### Paid Version 💎 → Phase 3
**Why skip MVP:** Need product-market fit first  
**When to add:** After consistent 4.5+ stars  

---

## 🔄 Dogfooding Assessment Framework

**For every feature we build, ask:**

### 1. Can this be in Mobileclaw?
- Trip Map v3 → **YES** → Places feature
- Task Board web → **YES** → Task Board mobile (sync)
- Control Tower → **YES** → But Phase 2
- Security audit → **YES** → Security Dashboard (Phase 2)

### 2. Is it core or nice-to-have?
- **Core:** Essential for primary use case
- **Nice:** Improves UX but not required
- **Edge:** Handles rare scenarios

**Example:**
- Find food nearby → **CORE** (primary travel use case)
- Train schedules → **NICE** (helpful but Google Maps works)
- Offline maps → **EDGE** (most have internet)

### 3. Make it powerful or skip it
- If we include it → make it EXCELLENT
- If it's mediocre → skip for MVP

**Example:**
- Voice capture → Include if it's FAST (<2 sec)
- Voice capture → Skip if it's slow/clunky

---

## 📝 Second Brain → Task Board Workflow

**Constant Assessment Process:**

### Step 1: Capture Ideas
When we build/discuss anything, ask:
- "Could this be in Mobileclaw?"
- "Is this core functionality?"
- "Would we use this daily?"

### Step 2: Document in Second Brain
File: `/root/.openclaw/workspace/projects/mobileclaw/IDEAS.md`

Format:
```markdown
## [Feature Name]
**Date:** YYYY-MM-DD
**Source:** [What we were building that inspired this]
**Core or Nice:** [Core/Nice/Edge]
**Justification:** [Why this would be powerful]
**Skip if:** [What would make this not worth it]
```

### Step 3: Weekly Review
Every Monday:
1. Review `IDEAS.md`
2. Promote 2-3 CORE ideas to `BACKLOG.md`
3. Add BACKLOG items to task board
4. Archive nice-to-haves

### Step 4: Build in Priority Order
1. Fix security (Vault)
2. Build core Brain features
3. Build core Places features
4. Polish all three until excellent
5. THEN consider Phase 2 features

---

## 🎯 MVP Success Criteria

**MVP is ready when:**

### Technical
- ✅ No crashes for 1 week
- ✅ All core features work offline
- ✅ Vault security audit passed
- ✅ Biometric unlock <1 second
- ✅ App loads <2 seconds

### Functional
- ✅ Can add API key to vault (secure)
- ✅ Can create trip with 10+ locations
- ✅ Can find food nearby in 5 seconds
- ✅ Can search skills in <1 second
- ✅ Can capture voice note in <2 seconds

### User Experience
- ✅ Brian uses it daily (primary device)
- ✅ Brian recommends it to 1 friend
- ✅ Friend actually uses it
- ✅ No major complaints for 1 week

**If any core feature is clunky → FIX IT before adding more**

---

## 🚫 What We're NOT Building (Yet)

### Phase 2 (After MVP Perfect)
- Control Tower monitoring
- Security Dashboard
- Advanced vault features
- Trip sharing
- Cloud sync wizard

### Phase 3 (After 1,000 Users)
- Monetization (AdMob, paid version)
- Social features
- Team collaboration
- Advanced analytics

### Never (Out of Scope)
- Social media posting (use other apps)
- Email client (use native)
- Calendar (use native)
- Notes app (Brain is for reference, not writing)

---

## 📊 Current Status

### Completed (2/6)
1. ✅ **Task Board** - Works, needs polish
2. ✅ **Scanner** - Works, needs polish
3. ✅ **Settings** - Works, sufficient

### In Progress (2/6)
4. 🔨 **Vault** - 14 security fixes remaining
5. 🔨 **Places** - Web version building (Trip Map v3)

### To Build (1/6)
6. ⏳ **Brain** - Not started

---

## 🗓️ Revised Timeline (MVP-Focused)

### Week 1-2 (Feb 8-21)
- ✅ Finish Vault security fixes (AES-256-GCM, PBKDF2)
- ✅ Test vault daily (dogfood)
- ✅ Make vault unlock FAST

### Week 3-4 (Feb 22 - Mar 7)
- ✅ Build Brain (skills search + quick capture only)
- ✅ Test Brain daily (capture 10+ ideas)
- ✅ Make Brain search FAST

### Week 5-6 (Mar 8-21)
- ✅ Port Places from web (Trip Map v3 complete by then)
- ✅ Simplify (remove train schedules, offline maps)
- ✅ Make location search FAST

### Week 7-8 (Mar 22 - Apr 4)
- ✅ Polish all 6 core features
- ✅ Fix every clunky interaction
- ✅ Daily dogfooding, fix complaints
- ✅ Beta to 10 TestFlight users

### Week 9-12 (Apr 5 - May 2)
- ✅ Beta feedback → fixes
- ✅ App Store submission
- ✅ More beta users (50-100)

### May 7-18
- 🎉 **Japan trip = ultimate dogfooding test**
- 🎉 **Real-world validation of Places feature**

---

## 💡 Dogfooding Examples

### Today's Work → Mobile Features

**Trip Map v3 (building now):**
- Google Maps integration → **Places core**
- Find food nearby → **Places core**
- List/map toggle → **Places core**
- Train schedules → **Phase 2** (complex, edge)
- Timeline filtering → **Nice to have** (skip MVP)

**Security audit (done earlier):**
- Password protection → **Vault core**
- Token rotation → **Security Dashboard** (Phase 2)
- Hostile audits → **Process, not feature**

**Task board:**
- Task management → **Task Board core**
- Bug tracking → **Nice to have** (skip MVP)
- Recurring tasks → **Nice to have** (skip MVP)

---

## 🎯 The Rule

**If it's not core, it's not in MVP.**

**If it's core, make it POWERFUL.**

**Core = Used daily by primary users**

---

**Updated:** 2026-02-07 17:38 MST  
**Next Review:** 2026-02-14 (1 week)  
**Status:** Framework established, apply to all future work
