# MobileClaw Production Readiness Plan

**Date:** 2026-02-12 20:57 MST
**Agent:** Coder (Subagent)
**Session:** Production + Mission Control Parity
**Status:** 🚀 In Progress

---

## Executive Summary

**Goal:** Production-ready MobileClaw with ALL Mission Control features

**Current Status:** 88% complete (22/25 screens, 16/16 stores connected)
**Target:** 100% complete with encryption, Mission Control parity, Supabase backend

---

## Phase 1: Vault Encryption (6-12 minutes) 🔐

### Objective
Implement production-grade encryption for vault secrets

### Tasks
- [x] Assess current vault store implementation
- [ ] Implement PBKDF2 password hashing (100k iterations)
- [ ] Implement AES-256-GCM encryption for vault secrets
- [ ] Update vault store with encryption methods
- [ ] Test encryption/decryption flow
- [ ] Update unlock/lock methods to use encrypted storage

### Files to Modify
- `/src/store/vault.ts` - Add encryption utilities
- `/src/lib/crypto.ts` - Create new crypto utilities

### Technical Approach
1. Use `expo-crypto` for PBKDF2 password derivation
2. Use `crypto-js` for AES-256-GCM encryption
3. Store encrypted data in SecureStore
4. Derive encryption key from password using PBKDF2
5. Each secret encrypted individually with unique IV

### Success Criteria
- ✅ Passwords hashed with PBKDF2 (100k iterations)
- ✅ Secrets encrypted with AES-256-GCM
- ✅ Encryption key derived from password (not stored)
- ✅ Test encryption/decryption cycle
- ✅ No plain-text secrets in storage

---

## Phase 2: Mission Control Feature Parity (2-3 hours) 🎯

### Features to Add

#### 2.1 Cost Tracking Dashboard
**Status:** New feature
**Screen:** `/app/(tabs)/costs.tsx`

**Components:**
- Summary cards (week total, month total, sessions, requests)
- 30-day spending trend (line chart)
- Cost by provider (pie chart)
- Cost by model (bar chart)
- Cost by task type (bar chart)
- Optimization recommendations

**Data Source:**
- Mock data initially
- Supabase integration in Phase 3

**Store:**
- Create `/src/store/cost.ts`
- Methods: `fetchUsageData()`, `getSummary()`, `getOptimizationTips()`

**UI Components:**
- `/src/components/charts/LineChart.tsx`
- `/src/components/charts/PieChart.tsx`
- `/src/components/charts/BarChart.tsx`
- Use `react-native-chart-kit` or `victory-native`

**Estimated Time:** 45-60 minutes

---

#### 2.2 Calendar Integration
**Status:** New feature
**Screen:** `/app/(tabs)/calendar.tsx`

**Components:**
- Month view calendar grid
- Event list (upcoming)
- Add event modal
- Event detail view

**Data Model:**
```typescript
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO
  endTime?: string;
  allDay: boolean;
  tags: string[];
  reminder?: number; // minutes before
  createdAt: string;
  updatedAt: string;
}
```

**Store:**
- Create `/src/store/calendar.ts`
- Methods: `fetchEvents()`, `addEvent()`, `updateEvent()`, `deleteEvent()`, `getEventsForMonth()`, `getUpcomingEvents()`

**UI Components:**
- `/src/components/calendar/MonthView.tsx`
- `/src/components/calendar/EventCard.tsx`
- Use `react-native-calendars`

**Estimated Time:** 30-45 minutes

---

#### 2.3 Ideas Capture
**Status:** New feature
**Screen:** `/app/(tabs)/ideas.tsx`

**Components:**
- Ideas grid (masonry or 2-column)
- Add idea modal
- Idea detail view
- Status badges (new, in-progress, done)

**Data Model:**
```typescript
interface Idea {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'in-progress' | 'done';
  tags: string[];
  priority?: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}
```

**Store:**
- Create `/src/store/ideas.ts`
- Methods: `fetchIdeas()`, `addIdea()`, `updateIdea()`, `deleteIdea()`, `getIdeasByStatus()`

**UI Components:**
- `/src/components/ideas/IdeaCard.tsx`
- `/src/components/ideas/AddIdeaModal.tsx`

**Estimated Time:** 20-30 minutes

---

#### 2.4 Content Management
**Status:** New feature
**Screen:** `/app/(tabs)/content.tsx`

**Components:**
- Stats row (drafts, scheduled, published, reach)
- Content list (drafts, scheduled, published)
- Add draft modal
- Content editor

**Data Model:**
```typescript
interface ContentItem {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  status: 'draft' | 'scheduled' | 'published';
  platform: 'twitter' | 'blog' | 'linkedin' | 'other';
  scheduledFor?: string; // ISO
  publishedAt?: string; // ISO
  stats?: {
    views: number;
    comments: number;
    likes: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
```

**Store:**
- Create `/src/store/content.ts`
- Methods: `fetchContent()`, `addDraft()`, `updateContent()`, `deleteContent()`, `scheduleContent()`, `publishContent()`, `getStats()`

**UI Components:**
- `/src/components/content/ContentCard.tsx`
- `/src/components/content/ContentEditor.tsx`

**Estimated Time:** 30-45 minutes

---

#### 2.5 Docs Browser
**Status:** New feature
**Screen:** `/app/(tabs)/docs.tsx`

**Components:**
- Doc sections grid (projects, skills, agents, config)
- Recent updates list
- Doc viewer
- Search

**Data Model:**
```typescript
interface Doc {
  id: string;
  title: string;
  path: string;
  section: 'projects' | 'skills' | 'agents' | 'config';
  content: string; // Markdown
  updatedAt: string;
  createdAt: string;
}
```

**Store:**
- Create `/src/store/docs.ts`
- Methods: `fetchDocs()`, `getDocsBySection()`, `searchDocs()`, `getRecentDocs()`

**UI Components:**
- `/src/components/docs/DocSection.tsx`
- `/src/components/docs/DocViewer.tsx`
- Use `react-native-markdown-display`

**Estimated Time:** 30-45 minutes

---

### Phase 2 Summary
- **Total new screens:** 5
- **Total new stores:** 5
- **Total new components:** ~15
- **Estimated time:** 2-3 hours

---

## ~~Phase 3: Supabase Backend Integration~~ REMOVED ❌

**Brian's Directive:** "You said that Supabase was not recommended so we're not using Supabase."

**Decision:** Local-first architecture with AsyncStorage persistence only.
- All stores remain as-is (no backend changes needed)
- Data persisted locally via Zustand middleware
- No server dependencies
- Simpler, faster, more reliable

**This phase is SKIPPED - moving directly to Phase 4 (Testing) after Phase 2 completion.**

---

## ~~Phase 3: Supabase Backend Integration (2-3 hours)~~ REMOVED

### 3.1 Database Schema

**Tables to create:**
- `tasks` - Already exists (update schema if needed)
- `vault_secrets` - Encrypted secrets storage
- `brain_notes` - Already exists
- `settings` - User settings
- `cost_data` - Usage and cost tracking
- `calendar_events` - Calendar events
- `ideas` - Ideas capture
- `content_items` - Content management
- `docs` - Documentation

**Schema Creation:**
```sql
-- vault_secrets
CREATE TABLE vault_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL, -- login, card, key, note
  name TEXT NOT NULL,
  encrypted_data JSONB NOT NULL, -- AES-256-GCM encrypted
  tags TEXT[],
  favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_accessed TIMESTAMPTZ
);

-- cost_data
CREATE TABLE cost_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  cost DECIMAL(10,2),
  tokens BIGINT,
  requests INTEGER,
  provider TEXT,
  model TEXT,
  task_type TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- calendar_events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT false,
  tags TEXT[],
  reminder INTEGER, -- minutes before
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ideas
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- new, in-progress, done
  tags TEXT[],
  priority TEXT, -- low, medium, high
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- content_items
CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, scheduled, published
  platform TEXT, -- twitter, blog, linkedin, other
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  stats JSONB,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- docs
CREATE TABLE docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  path TEXT NOT NULL,
  section TEXT NOT NULL, -- projects, skills, agents, config
  content TEXT NOT NULL, -- Markdown
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.2 Store Updates

**Update all stores to:**
1. Connect to Supabase client
2. Replace mock data with API calls
3. Implement real-time subscriptions
4. Add conflict resolution (optimistic updates)
5. Add offline support with sync queue

**Files to modify:**
- `/src/store/task.ts` - Connect to Supabase
- `/src/store/vault.ts` - Connect to Supabase (encrypted)
- `/src/store/brain.ts` - Already connected
- `/src/store/settings.ts` - Connect to Supabase
- `/src/store/cost.ts` - Connect to Supabase
- `/src/store/calendar.ts` - Connect to Supabase
- `/src/store/ideas.ts` - Connect to Supabase
- `/src/store/content.ts` - Connect to Supabase
- `/src/store/docs.ts` - Connect to Supabase

### 3.3 Real-time Subscriptions

**Implement subscriptions for:**
- Tasks (add, update, delete)
- Vault secrets (add, update, delete)
- Brain notes (add, update, delete)
- Calendar events (add, update, delete)

### 3.4 Conflict Resolution

**Strategy:**
- Optimistic updates (update UI immediately)
- Server reconciliation on sync
- Last-write-wins for simple conflicts
- User prompt for complex conflicts (rare)

**Estimated Time:** 2-3 hours

---

## Phase 4: Testing & QA (5-7 hours) 🧪

### 4.1 Manual Testing (2-3 hours)

**Test all screens:**
- [x] Tasks (4 screens) - Already tested
- [x] Vault (6 screens) - Already tested
- [x] Brain (4 screens) - Already tested
- [x] Settings (4 screens) - Already tested
- [ ] Costs (1 screen) - New
- [ ] Calendar (1 screen) - New
- [ ] Ideas (1 screen) - New
- [ ] Content (1 screen) - New
- [ ] Docs (1 screen) - New

**Test flows:**
- User onboarding
- Task creation → completion → deletion
- Vault unlock → add secret → edit → delete
- Brain note creation → edit → search → delete
- Settings changes (theme, notifications, etc.)
- Cost tracking (view charts, optimization tips)
- Calendar (add event, view month, upcoming)
- Ideas (add, update status, delete)
- Content (draft → schedule → publish)
- Docs (browse sections, search, view)

### 4.2 P0 Test Cases (2-3 hours)

**From ux-test-cases.md:**
- TC-MOBILE-001: Complete task creation flow
- TC-MOBILE-002: Vault secret creation & encryption
- TC-MOBILE-003: Search across all content
- TC-MOBILE-004: Offline mode (create task offline → sync when online)
- TC-MOBILE-005: Settings persistence
- TC-MOBILE-006: Theme switching
- TC-MOBILE-007: Biometric authentication
- TC-MOBILE-008: Calendar event creation
- TC-MOBILE-009: Idea capture
- TC-MOBILE-010: Content scheduling

### 4.3 Accessibility Testing (1 hour)

**VoiceOver (iOS):**
- All buttons labeled
- All form fields labeled
- Focus order logical
- Gestures work correctly

**TalkBack (Android):**
- All buttons labeled
- All form fields labeled
- Focus order logical
- Gestures work correctly

**Keyboard Navigation:**
- Tab order correct
- Enter/Space activate buttons
- Escape closes modals

**Color Contrast:**
- All text meets WCAG AA (4.5:1 for normal, 3:1 for large)
- Buttons/interactive elements meet 3:1

### 4.4 Performance Testing (1 hour)

**Large Datasets:**
- 500+ tasks (scroll performance)
- 100+ vault secrets (search performance)
- 200+ brain notes (filter performance)
- 50+ calendar events (month view performance)

**Memory Profiling:**
- Monitor memory usage over time
- Check for leaks (especially in modals)
- Profile image loading

**App Startup:**
- Measure cold start time (target: <3s)
- Measure warm start time (target: <1s)
- Optimize initial data loading

### 4.5 Error Handling (30 minutes)

**Network Errors:**
- Offline → create task → go online → sync
- Slow network → show loading states
- Network timeout → show retry button
- API error → show error message

**Validation Errors:**
- Empty required fields
- Invalid email/URL formats
- Date/time validation
- Password strength requirements

**Edge Cases:**
- Empty states (no tasks, no secrets, etc.)
- Maximum lengths (task title, note content)
- Special characters in input
- Very long text (overflow handling)

---

## Deliverables Checklist

- [ ] Working vault encryption with PBKDF2 + AES-256-GCM
- [ ] All 5 Mission Control features integrated into MobileClaw
- [ ] Supabase backend fully connected (9 stores)
- [ ] Testing report with P0 test results
- [ ] CODER-REPORT.md with completion summary
- [ ] Git commits for all changes
- [ ] Screenshot proof of completion
- [ ] Deployment plan for production

---

## Timeline (AI-Speed Estimates)

| Phase | Tasks | Estimated Time | Status |
|-------|-------|----------------|--------|
| Phase 1 | Vault Encryption | 6-12 minutes | ✅ COMPLETE |
| Phase 2 | Mission Control Features | 2-3 hours | 🔄 IN PROGRESS (40%) |
| ~~Phase 3~~ | ~~Supabase Backend~~ | ~~2-3 hours~~ | ❌ REMOVED |
| Phase 4 | Testing & QA | 3-4 hours | ⏳ PENDING |
| **TOTAL** | | **5-7 hours** | |

**Target Completion:** 2026-02-13 03:00 MST (6 hours from now)

---

## Notes

- AI-speed projection based on actual performance:
  - Designer agents: 94-96% faster than estimates
  - Mission Control: Built in <1 day (estimated 5-7 days)
  - Second Brain: Built in ~2 hours (estimated 8-12 hours)

- Brain category fix completed 40 min ago
- All 16 screens already connected to stores
- Focus on production hardening + feature parity

---

*Plan created: 2026-02-12 20:57 MST*
*Next update: After Phase 1 completion*
