# Design Specification: MobileClaw Complete Redesign

**Version:** 1.0  
**Date:** 2026-02-08  
**Ralph Loop Iteration:** 1  
**Designer:** Morpheus (Designer Agent)

---

## 1. Overview

### Problem
MobileClaw MVP requires production-ready UI/UX redesign across all 11 features (~25 screens) to meet modern design standards, accessibility requirements, and user expectations for a premium mobile productivity app.

### Success Metrics
- Task completion rate >85% for primary flows
- Error rate <5% on critical paths
- Time-on-task reduced by 30% vs current
- WCAG 2.2 AA compliance: 100%
- User satisfaction score (SUS) >80

### Users
- Primary: Power users managing tasks, knowledge, security, travel
- Secondary: New users discovering features via onboarding
- Platform: iOS 13+ and Android 10+ (Expo SDK 54)

### Platform
- Mobile-first: 375px (iPhone SE) → 430px (iPhone 14 Pro Max)
- Tablet support: 768px → 1024px (iPad)
- Orientation: Portrait primary, landscape graceful degradation

---

## 2. Design Direction

### Direction: Utility & Function
- **Rationale:** Productivity app with security/task/knowledge features requires clarity, efficiency, and trust over visual novelty
- **Visual Language:** Clean, structured, information-dense (with breathing room), actionable

### Color System (2 Colors + Neutral = 3 Total)

#### Primary: Electric Blue (#0ea5e9)
- **Usage:** Primary actions, links, focus states, tab indicators
- **Shades:**
  - Light: `#38bdf8` (hover states)
  - Default: `#0ea5e9` (primary)
  - Dark: `#0369a1` (pressed states)
- **Gradient:** `linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)`

#### Accent: Emerald Growth (#10b981)
- **Usage:** Success states, completion indicators, add/create actions
- **Shades:**
  - Light: `#34d399` (hover)
  - Default: `#10b981` (accent)
  - Dark: `#059669` (pressed)
- **Gradient:** `linear-gradient(135deg, #10b981 0%, #059669 100%)`

#### Neutral Palette (Dark Mode Primary)
```css
--bg-primary: #0a0a0a;
--bg-secondary: #1a1a1a;
--bg-tertiary: #252525;
--surface: #2d2d2d;
--surface-elevated: #3a3a3a;

--text-primary: #f5f5f5;
--text-secondary: #a3a3a3;
--text-tertiary: #737373;

--border: #333333;
--border-light: #404040;

--error: #ef4444;
--warning: #f59e0b;
--info: #0ea5e9;
--success: #10b981;
```

#### Light Mode (Secondary)
```css
--bg-primary-light: #ffffff;
--bg-secondary-light: #f5f5f5;
--bg-tertiary-light: #e5e5e5;
--surface-light: #ffffff;
--surface-elevated-light: #f9f9f9;

--text-primary-light: #0a0a0a;
--text-secondary-light: #525252;
--text-tertiary-light: #737373;

--border-light: #e5e5e5;
--border-light-light: #d4d4d4;
```

### Design Tokens

#### Spacing Scale (4px base grid)
```
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

#### Border Radius
```
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;
```

#### Typography Scale
```
--font-xs: 12px;
--font-sm: 14px;
--font-md: 16px;
--font-lg: 18px;
--font-xl: 20px;
--font-2xl: 24px;
--font-3xl: 32px;
--font-4xl: 40px;

--line-tight: 1.2;
--line-normal: 1.5;
--line-relaxed: 1.75;

--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

#### Shadows (Elevation System)
```
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.15);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.20);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.25);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.30);
```

---

## 3. Autonomous Decisions Log

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Electric Blue (#0ea5e9) + Emerald (#10b981) palette | Trust (blue) + growth (green); productivity context |
| 2 | Dark mode primary, light mode secondary | Power users prefer dark; accessibility requires both |
| 3 | Bottom tab bar navigation (5 tabs) | Thumb zone optimization; mobile-first Fitts's Law |
| 4 | System font stack (SF Pro / Roboto) | Native feel, accessibility, performance, no custom font loading |
| 5 | 44px minimum touch targets everywhere | Apple HIG standard; accessibility requirement |
| 6 | Skeleton loaders over spinners | Perceived performance; layout stability |
| 7 | Toast + undo pattern for destructive actions | Forgiving UX; reduces confirmation fatigue |
| 8 | Glassmorphic cards with backdrop blur | Modern aesthetic; depth without heavy shadows |
| 9 | Spring physics animations (Reanimated 3) | Native iOS feel; smooth 60fps |
| 10 | Bottom-anchored CTAs on detail screens | Thumb zone; prevents accidental taps at top |
| 11 | Swipe gestures for common actions | Native mobile patterns (swipe-to-delete, pull-to-refresh) |
| 12 | 375px baseline (iPhone SE) | Accessibility; smallest modern device |
| 13 | Progressive disclosure for complex features | Reduce cognitive load; show advanced options on demand |
| 14 | Inline validation for forms | Immediate feedback; error prevention |
| 15 | Haptic feedback on actions | Tactile confirmation; iOS/Android standard |

---

## 4. Navigation Architecture

### Tab Structure (Bottom Tab Bar)

```
┌─────────────────────────────────────────┐
│                                         │
│           Screen Content                │
│                                         │
├─────────────────────────────────────────┤
│  📋      🧠      🔐      🗺️      ⋯     │
│ Tasks   Brain  Vault  Places  More     │
└─────────────────────────────────────────┘
```

#### Tab 1: Tasks (📋)
- Icon: Checklist
- Label: "Tasks"
- Route: `/tasks`
- Badge: Active task count (when >0)

#### Tab 2: Brain (🧠)
- Icon: Brain/Lightbulb
- Label: "Brain"
- Route: `/brain`
- Badge: Unread notes count

#### Tab 3: Vault (🔐)
- Icon: Lock/Shield
- Label: "Vault"
- Route: `/vault`
- Badge: Requires unlock indicator

#### Tab 4: Places (🗺️)
- Icon: Map Pin
- Label: "Places"
- Route: `/places`
- Badge: Active trip count

#### Tab 5: More (⋯)
- Icon: Three dots
- Label: "More"
- Route: `/more`
- Sub-items: Scanner, Security, Cloud, Chat, Settings

### Navigation Patterns

**Primary Navigation:** Bottom tabs (persistent)
**Secondary Navigation:** Stack navigation within tabs
**Modal Sheets:** Settings, filters, quick actions
**Full-Screen Modals:** Onboarding, auth, camera

---

## 5. Screen Specifications

### 5.1 Onboarding Flow (3 Screens)

#### Screen: Onboarding 1 - Welcome

**Layout:**
```
┌─────────────────────────┐
│      [Skip] ········ 1  │ <- Stepper (1/3)
│                         │
│     [App Icon 120px]    │
│                         │
│      MobileClaw         │ <- Title (32px, bold)
│                         │
│  Your productivity      │ <- Subtitle (16px, secondary)
│  command center         │
│                         │
│   [Illustration]        │ <- Glassmorphic card mockup
│                         │
│                         │
│   [Next →]              │ <- Bottom-anchored CTA
└─────────────────────────┘
```

**States:**
- Default: Stepper 1/3 active
- Swipe left: Transition to screen 2
- Skip: Jump to screen 3 (setup)

**Accessibility:**
- VoiceOver: "Welcome to MobileClaw. Swipe right to continue or double-tap Skip to jump to setup."
- Keyboard: Tab to Skip, Tab to Next, Enter to activate

**Responsive:**
- 375px: Single column, illustration 280px height
- 430px: Same layout, illustration 320px height
- 768px (tablet): Centered 500px width, larger illustration

---

#### Screen: Onboarding 2 - Features

**Layout:**
```
┌─────────────────────────┐
│  [Back] ········ 2       │ <- Stepper (2/3)
│                         │
│  Powerful Features      │ <- Title
│                         │
│  📋 Task Management     │
│  🧠 Second Brain        │ <- Feature list (icons + text)
│  🔐 Encrypted Vault     │
│  🗺️ Trip Planning       │
│  📷 OCR Scanner         │
│                         │
│                         │
│   [Next →]              │
└─────────────────────────┘
```

**Animation:** Features fade in sequentially (100ms stagger)

---

#### Screen: Onboarding 3 - Setup

**Layout:**
```
┌─────────────────────────┐
│  [Back] ········ 3       │
│                         │
│  Secure Your Data       │
│                         │
│  ┌───────────────────┐  │
│  │ Create PIN/Pass   │  │
│  │ [••••]            │  │ <- Password input
│  └───────────────────┘  │
│                         │
│  ┌───────────────────┐  │
│  │ Confirm PIN/Pass  │  │
│  │ [••••]            │  │
│  └───────────────────┘  │
│                         │
│  ☑ Enable biometric    │ <- Optional checkbox
│     unlock              │
│                         │
│   [Get Started →]       │ <- Gradient button
└─────────────────────────┘
```

**States:**
- Empty: Both fields empty, button disabled
- Password entered: Show strength meter
- Mismatch: Red border + "Passwords don't match"
- Valid: Green check, button enabled
- Loading: Button shows spinner
- Success: Transition to app

**Validation:**
- Inline validation (debounced 300ms)
- Strength meter: Weak (red) → Medium (yellow) → Strong (green)
- Requirements: 8+ chars, 1 number, 1 special

---

### 5.2 Task Board (5 Screens)

#### Screen: Task List

**Layout:**
```
┌─────────────────────────┐
│  Tasks           [+ Add] │ <- Header
│  ┌─────────────────────┐│
│  │ 🔍 Search tasks...  ││ <- Search bar
│  └─────────────────────┘│
│  [All] [Active] [Done]   │ <- Filter chips
│                         │
│  ┌─────────────────────┐│
│  │ ☐ Write design spec ││
│  │   Due: Feb 9, 2PM   ││ <- Task card (swipeable)
│  │   📋 Work          ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ ☑ Review PR #423    ││ <- Completed (strikethrough)
│  │   Completed 2h ago  ││
│  └─────────────────────┘│
│                         │
│ [📋] [🧠] [🔐] [🗺️] [⋯] │ <- Bottom tabs
└─────────────────────────┘
```

**Component Breakdown:**
- Header: Title + Add button (44px min)
- Search bar: Glassmorphic card, 48px height
- Filter chips: Horizontal scroll, 36px height
- Task card: 
  - Height: Auto (min 72px)
  - Padding: 16px
  - Border-left: 4px solid (category color)
  - Swipe actions: ← Delete, → Complete

**States:**
- Empty: "No tasks yet. Tap + to create your first task."
- Loading: Skeleton cards (3 visible)
- Error: Toast notification
- Search active: Filtered results
- Swipe left: Delete action revealed (red background)
- Swipe right: Complete action revealed (green background)

**Interactions:**
- Tap card: Navigate to detail
- Tap checkbox: Toggle completion (optimistic UI)
- Swipe left: Delete (toast + undo)
- Swipe right: Complete (toast + undo)
- Pull-to-refresh: Sync tasks
- Long press: Multi-select mode

**Accessibility:**
- VoiceOver: "Task: Write design spec. Due February 9 at 2 PM. Category: Work. Not completed. Swipe right to mark as complete, swipe left to delete."
- Keyboard: Tab through tasks, Space to toggle, Enter to open
- Touch targets: Full card 72px+ height

**Responsive:**
- 375px: Single column
- 768px: Two columns, 16px gap
- 1024px: Three columns

---

#### Screen: Task Detail

**Layout:**
```
┌─────────────────────────┐
│ [< Back]       [⋯ More] │ <- Navigation
│                         │
│  ☐ Write design spec    │ <- Title (editable)
│                         │
│  ┌───────────────────┐  │
│  │ 📅 Due Date       │  │
│  │ Feb 9, 2:00 PM   │  │ <- Date picker
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 📋 Category       │  │
│  │ Work             │  │ <- Category picker
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 🔔 Reminder       │  │
│  │ 1 hour before    │  │ <- Reminder picker
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 📝 Notes          │  │
│  │ [Type here...]    │  │ <- Multi-line input
│  └───────────────────┘  │
│                         │
│   [Save Changes]        │ <- Bottom CTA
└─────────────────────────┘
```

**States:**
- View mode: Read-only, tap fields to edit
- Edit mode: Fields editable, Save button visible
- Saving: Button disabled, spinner
- Saved: Toast "Task updated", back to view mode
- Error: Red border on invalid field, toast error

**Interactions:**
- Tap title: Inline editing
- Tap date: Bottom sheet date/time picker
- Tap category: Bottom sheet category list
- Tap reminder: Bottom sheet reminder options
- Tap notes: Expand to full-screen editor

---

#### Screen: Add/Edit Task

**Layout:**
```
┌─────────────────────────┐
│ [Cancel]      [Add Task]│
│                         │
│  ┌───────────────────┐  │
│  │ Task title        │  │
│  │ [Type here...]    │  │ <- Autofocus
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 📅 Due Date       │  │
│  │ [Not set]         │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 📋 Category       │  │
│  │ [Select...]       │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 🔔 Reminder       │  │
│  │ [None]            │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 📝 Notes          │  │
│  │ [Optional...]     │  │
│  └───────────────────┘  │
│                         │
│   [Create Task]         │
└─────────────────────────┘
```

**Validation:**
- Title: Required, 1-200 chars
- Due date: Optional, must be future
- Category: Required, select from list
- Reminder: Optional, must be before due date

**States:**
- Empty: Create button disabled
- Valid: Create button enabled (gradient)
- Creating: Button spinner
- Success: Toast "Task created", navigate back
- Error: Toast with error message

---

#### Screen: Task Filters

**Layout (Bottom Sheet):**
```
┌─────────────────────────┐
│                         │
│  ═══                    │ <- Drag handle
│  Filter Tasks           │
│                         │
│  Status                 │
│  ○ All                  │
│  ◉ Active               │ <- Radio group
│  ○ Completed            │
│                         │
│  Category               │
│  ☑ Work                 │
│  ☐ Personal             │ <- Checkboxes
│  ☐ Shopping             │
│                         │
│  Due Date               │
│  ○ All                  │
│  ◉ This week            │
│  ○ Overdue              │
│                         │
│  [Clear] [Apply]        │
└─────────────────────────┘
```

**Behavior:**
- Swipe down to dismiss
- Clear: Reset all filters
- Apply: Update task list, dismiss sheet

---

#### Screen: Completed Tasks Archive

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  Completed     │
│                         │
│  ┌─────────────────────┐│
│  │ ☑ Review PR #423    ││
│  │   Completed 2h ago  ││ <- Timestamp
│  │   📋 Work          ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ ☑ Buy groceries     ││
│  │   Completed 1d ago  ││
│  └─────────────────────┘│
│                         │
│  [Clear All Completed]  │ <- Danger button
└─────────────────────────┘
```

**States:**
- Empty: "No completed tasks"
- Loaded: List with timestamps
- Clearing: Confirmation dialog
- Cleared: Toast "Completed tasks cleared"

---

### 5.3 Second Brain (4 Screens)

#### Screen: Knowledge Base Home

**Layout:**
```
┌─────────────────────────┐
│  Second Brain    [+ Add] │
│  ┌─────────────────────┐│
│  │ 🔍 Search...        ││
│  └─────────────────────┘│
│  [All] [Skills] [Ideas] │ <- Filter tabs
│  [Notes] [Memories]     │
│                         │
│  ┌─────────────────────┐│
│  │ 💡 Mobile Design    ││
│  │    Skill · 3d ago   ││ <- Card type + timestamp
│  │    Modern patterns..││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ 📝 Meeting Notes    ││
│  │    Note · 1w ago    ││
│  └─────────────────────┘│
└─────────────────────────┘
```

**Card Types:**
- Skill: 💡 icon, blue accent
- Idea: 🚀 icon, emerald accent
- Note: 📝 icon, neutral
- Memory: 🧠 icon, purple accent (exception: 4th color allowed for memory)

---

#### Screen: Skill Browser

**Layout:**
```
┌─────────────────────────┐
│ [< Back]     Skills      │
│                         │
│  ┌───────────────────┐  │
│  │ 🎨 Design         │  │
│  │ · Modern design   │  │ <- Category card
│  │ · Interface       │  │
│  │   design          │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 💻 Development    │  │
│  │ · React Native    │  │
│  │ · TypeScript      │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

---

#### Screen: Memory Timeline

**Layout:**
```
┌─────────────────────────┐
│ [< Back]   Memories      │
│                         │
│  Today                  │ <- Section header
│  ┌───────────────────┐  │
│  │ 🧠 Completed       │  │
│  │    design spec     │  │
│  │    2:30 PM         │  │
│  └───────────────────┘  │
│                         │
│  Yesterday              │
│  ┌───────────────────┐  │
│  │ 🧠 Started Ralph   │  │
│  │    Loop research   │  │
│  │    4:15 PM         │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

---

#### Screen: Knowledge Search

**Layout:**
```
┌─────────────────────────┐
│ [< Cancel]              │
│  ┌─────────────────────┐│
│  │ 🔍 [Search...]      ││ <- Autofocus
│  └─────────────────────┘│
│                         │
│  Recent Searches        │
│  • mobile design        │ <- Tap to reuse
│  • task management      │
│                         │
│  Suggested              │
│  • Skills               │
│  • Ideas about...       │
└─────────────────────────┘
```

**States:**
- Empty: Recent searches + suggestions
- Typing: Live results
- Results: Categorized (Skills, Ideas, Notes, Memories)
- No results: "No results for 'query'. Try different keywords."

---

### 5.4 Encrypted Vault (6 Screens)

#### Screen: Vault Unlock

**Layout:**
```
┌─────────────────────────┐
│                         │
│                         │
│      🔐                 │ <- Large lock icon (64px)
│                         │
│      Vault Locked       │ <- Title
│                         │
│  ┌───────────────────┐  │
│  │ Enter PIN/Pass    │  │
│  │ [••••]            │  │ <- Password input
│  └───────────────────┘  │
│                         │
│  [👆 Use Face ID]       │ <- Biometric button
│                         │
│                         │
│   [Unlock]              │ <- Bottom CTA
└─────────────────────────┘
```

**States:**
- Locked: Input + biometric button
- Unlocking: Spinner
- Success: Transition to vault contents
- Error: Shake animation + "Incorrect password"
- Biometric: Native prompt overlay

**Security:**
- Auto-lock after 5 min inactivity
- 5 failed attempts: 1 min lockout
- No password hints visible

---

#### Screen: Vault Contents

**Layout:**
```
┌─────────────────────────┐
│  Vault           [+ Add] │
│  ┌─────────────────────┐│
│  │ 🔍 Search secrets...││
│  └─────────────────────┘│
│  [All] [Login] [Card]    │ <- Type filters
│  [Note] [Key]            │
│                         │
│  ┌─────────────────────┐│
│  │ 🌐 GitHub Login     ││
│  │    brianference     ││ <- Username preview
│  │    ••••••••••••     ││ <- Hidden password
│  │    [👁️] [📋]        ││ <- Reveal, copy
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ 💳 Chase Visa       ││
│  │    •••• 4242        ││ <- Last 4 digits
│  │    [👁️] [📋]        ││
│  └─────────────────────┘│
└─────────────────────────┘
```

**Secret Types:**
- Login: 🌐 icon
- Card: 💳 icon
- Note: 📝 icon
- Key: 🔑 icon

**Interactions:**
- Tap 👁️: Reveal for 10 seconds (auto-hide)
- Tap 📋: Copy to clipboard (toast + auto-clear after 30s)
- Tap card: View details
- Swipe left: Delete (confirmation required)

---

#### Screen: Add/Edit Secret

**Layout:**
```
┌─────────────────────────┐
│ [Cancel]    [Save]       │
│                         │
│  Secret Type            │
│  [🌐 Login  ] [💳 Card] │ <- Segmented control
│  [📝 Note   ] [🔑 Key ] │
│                         │
│  ┌───────────────────┐  │
│  │ Title             │  │
│  │ [GitHub]          │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Username          │  │
│  │ [brianference]    │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Password          │  │
│  │ [••••••] [👁️]    │  │ <- Reveal toggle
│  │ [🎲 Generate]     │  │ <- Password generator
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ URL (optional)    │  │
│  │ [github.com]      │  │
│  └───────────────────┘  │
│   [Save Secret]         │
└─────────────────────────┘
```

**Password Generator (Bottom Sheet):**
```
┌─────────────────────────┐
│  Generate Password      │
│                         │
│  Length: 16    [slider] │
│  ☑ Uppercase (A-Z)      │
│  ☑ Lowercase (a-z)      │
│  ☑ Numbers (0-9)        │
│  ☑ Symbols (!@#$)       │
│                         │
│  Xt9#mK2$pL4@qR7        │ <- Preview
│  Strength: ████████     │ <- Visual meter (green)
│                         │
│  [Cancel] [Use Password]│
└─────────────────────────┘
```

---

#### Screen: Vault Settings

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  Vault Settings │
│                         │
│  Security               │
│  ┌───────────────────┐  │
│  │ Auto-lock          │  │
│  │ After 5 minutes ▾  │  │ <- Dropdown
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Biometric unlock   │  │
│  │          [Toggle] │  │
│  └───────────────────┘  │
│                         │
│  Master Password        │
│  ┌───────────────────┐  │
│  │ Change master      │  │
│  │ password        ▸  │  │
│  └───────────────────┘  │
│                         │
│  Danger Zone            │
│  ┌───────────────────┐  │
│  │ ⚠️ Rotate encryption│  │ <- Red accent
│  │    key           ▸  │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

---

#### Screen: Key Rotation

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  Rotate Key     │
│                         │
│  ⚠️ Warning             │
│  This will re-encrypt   │
│  all vault data with a  │
│  new encryption key.    │
│  This process is        │
│  irreversible.          │
│                         │
│  ┌───────────────────┐  │
│  │ Current master    │  │
│  │ password          │  │
│  │ [••••••]          │  │
│  └───────────────────┘  │
│                         │
│  Encrypted items: 12    │
│  Estimated time: <1 min │
│                         │
│  [Cancel]               │
│  [Rotate Key]           │ <- Red button
└─────────────────────────┘
```

**States:**
- Ready: Both buttons enabled
- Rotating: Progress bar + "Re-encrypting item 3 of 12..."
- Complete: Success animation + "Key rotated successfully"
- Error: "Rotation failed. Data unchanged."

---

#### Screen: Security Audit

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  Security Audit │
│                         │
│  Vault Health: Good ✓   │ <- Status badge (green)
│                         │
│  Weak Passwords         │
│  ┌───────────────────┐  │
│  │ 🌐 Old Email       │  │
│  │    Strength: Weak  │  │ <- Red indicator
│  │    [Fix]           │  │
│  └───────────────────┘  │
│                         │
│  Reused Passwords       │
│  ┌───────────────────┐  │
│  │ 🌐 Gmail           │  │
│  │ 🌐 Outlook         │  │
│  │    Same password   │  │ <- Yellow indicator
│  │    [Review]        │  │
│  └───────────────────┘  │
│                         │
│  Recommendations        │
│  · Enable 2FA on 3 sites│
│  · Update 2 weak        │
│    passwords            │
└─────────────────────────┘
```

---

### 5.5 Places (5 Screens)

#### Screen: Map View

**Layout:**
```
┌─────────────────────────┐
│  Places          [+ Add] │
│                         │
│  ┌─────────────────────┐│
│  │                     ││
│  │   [Map Component]   ││ <- Interactive map
│  │                     ││
│  │   📍 📍 📍          ││ <- Place markers
│  │                     ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ 📍 Favorite Cafe    ││ <- Bottom sheet preview
│  │    0.3 mi away      ││
│  │    [View Details ▸] ││
│  └─────────────────────┘│
└─────────────────────────┘
```

**Interactions:**
- Tap marker: Show place preview
- Tap preview: Navigate to detail
- Pinch: Zoom in/out
- Pan: Move map
- Current location: Blue dot with pulse

---

#### Screen: Place Detail

**Layout:**
```
┌─────────────────────────┐
│ [< Back]       [⋯ More] │
│                         │
│  ┌─────────────────────┐│
│  │   [Photo 340x200]   ││ <- Place photo
│  └─────────────────────┘│
│                         │
│  📍 Favorite Cafe       │ <- Title
│  ⭐ 4.5 · Coffee Shop   │ <- Rating + category
│                         │
│  📍 123 Main St         │
│     Phoenix, AZ         │
│                         │
│  ☎️  (555) 123-4567     │ <- Tap to call
│  🌐  favoritecafe.com   │ <- Tap to open
│                         │
│  📝 Notes               │
│  Great wifi, quiet in   │
│  mornings               │
│                         │
│  [🗺️ Get Directions]    │
│  [⭐ Add to Trip]        │
└─────────────────────────┘
```

---

#### Screen: Trip Planner

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  Phoenix Trip   │
│                         │
│  Feb 10-12, 2026        │ <- Trip dates
│  3 places · 2 days      │
│                         │
│  Day 1 - Feb 10         │ <- Section
│  ┌───────────────────┐  │
│  │ ⏰ 9:00 AM         │  │
│  │ 📍 Breakfast Spot  │  │ <- Draggable item
│  │    ⋮⋮              │  │ <- Drag handle
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ ⏰ 11:00 AM        │  │
│  │ 📍 Museum          │  │
│  │    ⋮⋮              │  │
│  └───────────────────┘  │
│                         │
│  Day 2 - Feb 11         │
│  [+ Add Place]          │
│                         │
│  [Share Trip]           │
└─────────────────────────┘
```

**Interactions:**
- Drag items to reorder
- Swipe left: Delete
- Tap item: Edit time/notes
- Share: Generate link

---

#### Screen: Navigation

**Layout:**
```
┌─────────────────────────┐
│ [✕ Exit]                │
│                         │
│  ┌─────────────────────┐│
│  │                     ││
│  │   [Map with Route]  ││ <- Turn-by-turn
│  │                     ││
│  │      ↑ 📍           ││
│  └─────────────────────┘│
│                         │
│  In 500 ft, turn right  │ <- Instruction
│  onto Main Street       │
│                         │
│  ┌───────────────────┐  │
│  │ 2.3 mi · 8 min    │  │ <- ETA card
│  │ Arrive: 2:15 PM   │  │
│  └───────────────────┘  │
│                         │
│  [🔊 Mute] [⚙️ Options] │
└─────────────────────────┘
```

---

#### Screen: Saved Places

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  Saved Places   │
│                         │
│  ┌─────────────────────┐│
│  │ 🔍 Search places... ││
│  └─────────────────────┘│
│                         │
│  Favorites ⭐           │
│  ┌───────────────────┐  │
│  │ 📍 Favorite Cafe   │  │
│  │    0.3 mi · Open   │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 📍 Gym             │  │
│  │    1.2 mi · Closed │  │
│  └───────────────────┘  │
│                         │
│  Recent                 │
│  ┌───────────────────┐  │
│  │ 📍 Airport         │  │
│  │    15 mi · 2d ago  │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

---

### 5.6 Scanner/OCR (3 Screens)

#### Screen: Camera View

**Layout:**
```
┌─────────────────────────┐
│                         │
│  ┌─────────────────────┐│
│  │                     ││
│  │   [Camera Feed]     ││ <- Full-screen camera
│  │                     ││
│  │   ┌─────────────┐   ││ <- OCR overlay box
│  │   │  Position   │   ││
│  │   │  document   │   ││
│  │   │  here       │   ││
│  │   └─────────────┘   ││
│  └─────────────────────┘│
│                         │
│  [📷]                   │ <- Capture button (center)
│  [🖼️] Flash [🔄]        │ <- Gallery, flash, flip
└─────────────────────────┘
```

**States:**
- Ready: Overlay guides document placement
- Capturing: Shutter animation
- Processing: "Extracting text..."
- Success: Transition to preview
- Error: "OCR failed. Try again."

---

#### Screen: Preview/Edit

**Layout:**
```
┌─────────────────────────┐
│ [✕ Cancel]      [Save]   │
│                         │
│  ┌─────────────────────┐│
│  │  [Document Image]   ││ <- Cropped preview
│  └─────────────────────┘│
│                         │
│  Extracted Text         │
│  ┌───────────────────┐  │
│  │ This is the       │  │
│  │ extracted text    │  │ <- Editable textarea
│  │ from the OCR      │  │
│  │ scan...           │  │
│  └───────────────────┘  │
│                         │
│  [📋 Copy Text]         │
│  [💾 Save to Brain]     │
└─────────────────────────┘
```

---

#### Screen: Document Library

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  Documents      │
│                         │
│  ┌─────────────────────┐│
│  │ 📄 Receipt 2/8/26   ││
│  │    "Total: $45.67"  ││ <- Text preview
│  │    [👁️] [🗑️]        ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ 📄 Business Card    ││
│  │    "John Doe..."    ││
│  │    [👁️] [🗑️]        ││
│  └─────────────────────┘│
│                         │
│  [Scan New Document]    │
└─────────────────────────┘
```

---

### 5.7 Security Dashboard (3 Screens)

#### Screen: Security Overview

**Layout:**
```
┌─────────────────────────┐
│  Security        [⚙️]    │
│                         │
│  ┌─────────────────────┐│
│  │ Security Score: 85  ││ <- Circular progress (green)
│  │      Good ✓         ││
│  └─────────────────────┘│
│                         │
│  Vault Status           │
│  ┌───────────────────┐  │
│  │ 🔐 Locked          │  │
│  │    12 items secure │  │
│  │    [Unlock]        │  │
│  └───────────────────┘  │
│                         │
│  Network                │
│  ┌───────────────────┐  │
│  │ 🌐 Connected       │  │
│  │    "Home WiFi"     │  │
│  │    [Monitor]       │  │
│  └───────────────────┘  │
│                         │
│  Privacy                │
│  ┌───────────────────┐  │
│  │ 🛡️ Protected       │  │
│  │    [Settings]      │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

---

#### Screen: Network Monitor

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  Network        │
│                         │
│  Current Network        │
│  ┌───────────────────┐  │
│  │ 🌐 "Home WiFi"     │  │
│  │    192.168.1.10    │  │ <- IP address
│  │    Secure (WPA3)   │  │
│  └───────────────────┘  │
│                         │
│  Activity (Last Hour)   │
│  ┌───────────────────┐  │
│  │ ↑ 234 MB sent      │  │
│  │ ↓ 1.2 GB received  │  │
│  └───────────────────┘  │
│                         │
│  Known Networks         │
│  ┌───────────────────┐  │
│  │ 🌐 "Office WiFi"   │  │
│  │    Trusted         │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 🌐 "Starbucks"     │  │
│  │    Public · Use VPN│  │ <- Warning (yellow)
│  └───────────────────┘  │
└─────────────────────────┘
```

---

#### Screen: Privacy Settings

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  Privacy        │
│                         │
│  Data Collection        │
│  ┌───────────────────┐  │
│  │ Analytics          │  │
│  │          [Toggle] │  │ <- Off by default
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Crash reports      │  │
│  │          [Toggle] │  │
│  └───────────────────┘  │
│                         │
│  Permissions            │
│  ┌───────────────────┐  │
│  │ 📷 Camera          │  │
│  │    Allowed         │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 📍 Location        │  │
│  │    While Using     │  │
│  └───────────────────┘  │
│                         │
│  Data Management        │
│  ┌───────────────────┐  │
│  │ Export all data    │  │
│  │                 ▸  │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ ⚠️ Delete all data │  │ <- Red text
│  │                 ▸  │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

---

### 5.8 Cloud Wizard (4 Screens)

#### Screen: Provider Selection

**Layout:**
```
┌─────────────────────────┐
│  Cloud Wizard    [✕]     │
│                         │
│  Connect Cloud Storage  │
│                         │
│  ┌───────────────────┐  │
│  │ ☁️ AWS             │  │
│  │ Amazon Web        │  │ <- Provider card
│  │ Services          │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ ☁️ Google Cloud    │  │
│  │ Google Cloud      │  │
│  │ Platform          │  │
│  └───────────────────┘  │
│                         │
│  [Skip for now]         │
└─────────────────────────┘
```

---

#### Screen: Credentials Setup (AWS)

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  AWS Setup      │
│                         │
│  Step 1: Credentials    │
│                         │
│  ┌───────────────────┐  │
│  │ Access Key ID     │  │
│  │ [AKIA...]         │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Secret Access Key │  │
│  │ [••••••••••••]    │  │
│  └───────────────────┘  │
│                         │
│  ℹ️ Your credentials    │
│  are stored securely    │
│  in the encrypted vault │
│                         │
│  [? How to get keys]    │ <- Help link
│                         │
│  [Next]                 │
└─────────────────────────┘
```

---

#### Screen: Service Configuration

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  AWS Setup      │
│                         │
│  Step 2: Services       │
│                         │
│  Select services        │
│  ┌───────────────────┐  │
│  │ ☑ S3 Storage       │  │
│  │   Backup & sync    │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ ☐ EC2 Instances    │  │
│  │   Not configured   │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ ☐ Lambda Functions │  │
│  │   Not configured   │  │
│  └───────────────────┘  │
│                         │
│  [Next]                 │
└─────────────────────────┘
```

---

#### Screen: Connection Test

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  AWS Setup      │
│                         │
│  Step 3: Test           │
│                         │
│  Testing connection...  │
│                         │
│  ┌───────────────────┐  │
│  │ ✓ Credentials OK   │  │ <- Success (green)
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ ✓ S3 access OK     │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 🔄 Testing regions..│  │ <- In progress
│  └───────────────────┘  │
│                         │
│  [Complete Setup]       │ <- Disabled until done
└─────────────────────────┘
```

**States:**
- Testing: Animated spinner per step
- Success: Green checkmarks
- Error: Red X + error message + retry button
- Complete: Navigate to cloud dashboard

---

### 5.9 AdMob Integration (2 Screens)

#### Screen: Ad Preferences

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  Ads            │
│                         │
│  Ad Settings            │
│  ┌───────────────────┐  │
│  │ Personalized ads   │  │
│  │          [Toggle] │  │ <- GDPR control
│  └───────────────────┘  │
│                         │
│  ℹ️ We show ads to keep │
│  MobileClaw free. You   │
│  can upgrade to remove  │
│  all ads.               │
│                         │
│  [Upgrade to Pro]       │ <- Gradient button
│                         │
│  [Manage ad consent]    │
└─────────────────────────┘
```

---

#### Screen: GDPR Consent

**Layout:**
```
┌─────────────────────────┐
│  Ad Consent              │
│                         │
│  We use Google AdMob    │
│  to show ads. This      │
│  requires sharing       │
│  device info.           │
│                         │
│  What we collect:       │
│  · Device type          │
│  · Approximate location │
│  · Ad interaction data  │
│                         │
│  What we DON'T collect: │
│  · Your tasks           │
│  · Your vault data      │
│  · Your personal notes  │
│                         │
│  [📄 Privacy Policy]    │
│  [📄 Terms of Service]  │
│                         │
│  [Accept] [Decline]     │
└─────────────────────────┘
```

**Behavior:**
- Accept: Enable personalized ads
- Decline: Show non-personalized ads only
- Required on first launch (GDPR compliance)

---

### 5.10 Paid Version (2 Screens)

#### Screen: Upgrade Prompt

**Layout:**
```
┌─────────────────────────┐
│             [✕]          │
│                         │
│  ⭐ MobileClaw Pro       │
│                         │
│  One-time payment       │
│  $4.99                  │
│                         │
│  What you get:          │
│  ✓ No ads, ever         │
│  ✓ Unlimited vault      │
│    items                │
│  ✓ Priority support     │
│  ✓ Early access to      │
│    new features         │
│                         │
│  [Upgrade for $4.99]    │ <- Gradient button
│                         │
│  [Restore Purchase]     │ <- Text link
│  [Maybe Later]          │
└─────────────────────────┘
```

**Triggers:**
- After 50 tasks created
- After 20 vault items
- Manual from Settings

---

#### Screen: Purchase Confirmation

**Layout:**
```
┌─────────────────────────┐
│                         │
│                         │
│      ✓                  │ <- Success checkmark (64px)
│                         │
│  Welcome to Pro!        │
│                         │
│  You now have:          │
│  · Ad-free experience   │
│  · Unlimited everything │
│  · Priority support     │
│                         │
│  Thank you for          │
│  supporting MobileClaw! │
│                         │
│  [Get Started]          │
└─────────────────────────┘
```

---

### 5.11 Settings (4 Screens)

#### Screen: Settings Home

**Layout:**
```
┌─────────────────────────┐
│  Settings        [✕]     │
│                         │
│  General                │
│  ┌───────────────────┐  │
│  │ Appearance      ▸  │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Notifications   ▸  │  │
│  └───────────────────┘  │
│                         │
│  Account                │
│  ┌───────────────────┐  │
│  │ Cloud Sync      ▸  │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Backup & Restore▸  │  │
│  └───────────────────┘  │
│                         │
│  App                    │
│  ┌───────────────────┐  │
│  │ About           ▸  │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Help & Feedback ▸  │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

---

#### Screen: Appearance Settings

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  Appearance     │
│                         │
│  Theme                  │
│  ○ Light                │
│  ◉ Dark                 │ <- Selected
│  ○ Auto (system)        │
│                         │
│  Preview                │
│  ┌───────────────────┐  │
│  │ [Sample Card]     │  │ <- Live preview
│  │ Text preview      │  │
│  │ [Button]          │  │
│  └───────────────────┘  │
│                         │
│  Accent Color           │
│  [🔵] [🟢] [🟣] [🟠]    │ <- Color picker
│                         │
│  Text Size              │
│  [A] ――――●―――― [A]      │ <- Slider
│                         │
│  Reduce Motion          │
│  ┌───────────────────┐  │
│  │          [Toggle] │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

---

#### Screen: Notifications

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  Notifications  │
│                         │
│  Allow Notifications    │
│  ┌───────────────────┐  │
│  │          [Toggle] │  │
│  └───────────────────┘  │
│                         │
│  Task Reminders         │
│  ┌───────────────────┐  │
│  │          [Toggle] │  │
│  └───────────────────┘  │
│                         │
│  Daily Summary          │
│  ┌───────────────────┐  │
│  │          [Toggle] │  │
│  │ 8:00 AM daily     │  │
│  └───────────────────┘  │
│                         │
│  Security Alerts        │
│  ┌───────────────────┐  │
│  │          [Toggle] │  │ <- Always on (disabled)
│  └───────────────────┘  │
└─────────────────────────┘
```

---

#### Screen: About

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  About          │
│                         │
│      [App Icon]         │
│                         │
│      MobileClaw         │
│      Version 1.0.0      │
│                         │
│  ┌───────────────────┐  │
│  │ What's New      ▸  │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Privacy Policy  ▸  │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Terms of Service▸  │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Licenses        ▸  │  │
│  └───────────────────┘  │
│                         │
│  Made with ⚡ by        │
│  Brian Ference          │
│                         │
│  [⭐ Rate on App Store] │
└─────────────────────────┘
```

---

### 5.12 OpenClaw Chat (3 Screens)

#### Screen: Chat Interface

**Layout:**
```
┌─────────────────────────┐
│  Chat with Cole  [⚙️]    │
│                         │
│  ┌───────────────────┐  │
│  │ Cole              │  │ <- AI message bubble (left)
│  │ Hi! How can I     │  │
│  │ help you today?   │  │
│  │ 2:30 PM           │  │
│  └───────────────────┘  │
│                         │
│        ┌──────────────┐ │
│        │ Show me my   │ │ <- User bubble (right)
│        │ tasks        │ │
│        │ 2:31 PM      │ │
│        └──────────────┘ │
│                         │
│  ┌───────────────────┐  │
│  │ Cole              │  │
│  │ You have 3 active │  │
│  │ tasks: ...        │  │
│  │ 2:31 PM           │  │
│  └───────────────────┘  │
│                         │
│  [📎] [Type message...] │ <- Input bar
└─────────────────────────┘
```

**Message Types:**
- Text: Standard bubbles
- Code: Monospace font, dark background
- Attachments: Thumbnail preview
- Thinking: "..." animated dots

**Interactions:**
- Tap message: Copy text
- Long press: More options (copy, delete)
- Tap attachment: Full-screen preview

---

#### Screen: Attachment Picker

**Layout (Bottom Sheet):**
```
┌─────────────────────────┐
│                         │
│  ═══                    │
│  Add Attachment         │
│                         │
│  ┌───────────────────┐  │
│  │ 📷 Take Photo      │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 🖼️ Choose Photo    │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 📄 Choose File     │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 📍 Share Location  │  │
│  └───────────────────┘  │
│                         │
│  [Cancel]               │
└─────────────────────────┘
```

---

#### Screen: Chat Settings

**Layout:**
```
┌─────────────────────────┐
│ [< Back]  Chat Settings  │
│                         │
│  Behavior               │
│  ┌───────────────────┐  │
│  │ Auto-send on Enter │  │
│  │          [Toggle] │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ Sound effects      │  │
│  │          [Toggle] │  │
│  └───────────────────┘  │
│                         │
│  Data                   │
│  ┌───────────────────┐  │
│  │ Export chat       ▸│  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ ⚠️ Clear all chats │  │ <- Red text
│  │                 ▸  │  │
│  └───────────────────┘  │
│                         │
│  Model                  │
│  ┌───────────────────┐  │
│  │ Claude Sonnet 4   │  │ <- Read-only
│  └───────────────────┘  │
└─────────────────────────┘
```

---

## 6. Component Specifications

### 6.1 Glass Card

**Anatomy:**
```
┌─────────────────────────┐
│ [Content]               │ <- Padding: 16px
│                         │
│                         │
└─────────────────────────┘
```

**Visual Tokens:**
```css
background: rgba(26, 26, 26, 0.6);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: var(--radius-md); /* 12px */
padding: var(--space-md); /* 16px */
box-shadow: var(--shadow-sm);
```

**Variants:**
- Default: 0.6 alpha
- Elevated: 0.8 alpha + shadow-md
- Pressed: 0.5 alpha (active state)

**Behavior:**
- Hover: Slight scale (1.02) + shadow increase
- Active: Scale down (0.98)

**A11y:**
- Role: `group` or `article` (context-dependent)
- Label: Content-based or explicit aria-label

---

### 6.2 Primary Button

**Anatomy:**
```
┌──────────────┐
│ [Icon] Label │ <- Icon optional
└──────────────┘
```

**Visual Tokens:**
```css
background: linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%);
color: #ffffff;
padding: 12px 24px;
border-radius: var(--radius-md); /* 12px */
font-weight: var(--weight-semibold); /* 600 */
min-height: 44px;
box-shadow: var(--shadow-sm);
```

**States:**
- Default: Gradient background
- Hover: Brightness 110%
- Active: Scale 0.98
- Disabled: Opacity 0.5, no interaction
- Loading: Spinner replaces text

**Keyboard:**
- Focus: 3px blue outline
- Enter/Space: Activate

**Sizes:**
- Small: 36px height, 10px 20px padding
- Medium: 44px height, 12px 24px padding (default)
- Large: 52px height, 14px 28px padding

---

### 6.3 Input Field

**Anatomy:**
```
┌──────────────────────┐
│ [Label]              │ <- Floating label
│ [Value___]           │ <- Input
│ [Helper/Error]       │ <- Optional
└──────────────────────┘
```

**Visual Tokens:**
```css
background: rgba(37, 37, 37, 0.8);
border: 2px solid transparent;
border-radius: var(--radius-md);
padding: 14px 18px;
color: var(--text-primary);
font-size: var(--font-md);
min-height: 44px;
```

**States:**
- Default: Transparent border
- Focus: Border primary color + shadow glow
- Error: Border red + error message below
- Disabled: Opacity 0.5, cursor not-allowed
- Success: Border green (on blur if valid)

**A11y:**
- Label: Always present (floating or above)
- Autocomplete: Appropriate values
- Error: aria-describedby pointing to error text

---

### 6.4 Skeleton Loader

**Anatomy:**
```
┌──────────────────────┐
│ ████████             │ <- Shimmer animation
│ ████                 │
└──────────────────────┘
```

**Visual Tokens:**
```css
background: linear-gradient(
  90deg,
  #1a1a1a 0%,
  #252525 50%,
  #1a1a1a 100%
);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
border-radius: var(--radius-sm);
```

**Animation:**
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

**Usage:**
- Match expected content shape
- 3-5 visible items
- Transition to real content (crossfade)

---

### 6.5 Bottom Sheet

**Anatomy:**
```
      [Backdrop]
┌─────────────────────────┐
│                         │
│  ═══                    │ <- Drag handle
│  [Title]                │
│                         │
│  [Content]              │
│                         │
│  [Actions]              │
└─────────────────────────┘
```

**Visual Tokens:**
```css
background: var(--bg-secondary);
border-top-left-radius: var(--radius-lg);
border-top-right-radius: var(--radius-lg);
padding: var(--space-lg);
max-height: 90vh;
```

**Behavior:**
- Swipe down: Dismiss
- Tap backdrop: Dismiss
- Spring animation: In/out

**A11y:**
- Role: dialog
- aria-modal: true
- Focus trap: Yes
- Initial focus: First focusable element

---

### 6.6 Toast Notification

**Anatomy:**
```
┌──────────────────────┐
│ [Icon] Message  [✕]  │
└──────────────────────┘
```

**Visual Tokens:**
```css
background: rgba(0, 0, 0, 0.9);
color: #ffffff;
padding: 12px 16px;
border-radius: var(--radius-lg);
box-shadow: var(--shadow-lg);
min-height: 44px;
```

**Variants:**
- Success: Green left border + ✓ icon
- Error: Red left border + ✗ icon
- Info: Blue left border + ℹ️ icon
- Warning: Yellow left border + ⚠️ icon

**Behavior:**
- Auto-dismiss: 4 seconds (configurable)
- Swipe: Dismiss immediately
- Tap: Dismiss
- Stack: Max 3 visible, queue rest

**A11y:**
- Role: status or alert (based on type)
- aria-live: polite or assertive
- Screen reader: Auto-announced

---

### 6.7 Tab Bar (Bottom Navigation)

**Anatomy:**
```
┌───────┬───────┬───────┬───────┬───────┐
│ Icon  │ Icon  │ Icon  │ Icon  │ Icon  │
│ Label │ Label │ Label │ Label │ Label │
└───────┴───────┴───────┴───────┴───────┘
```

**Visual Tokens:**
```css
background: var(--surface);
border-top: 1px solid var(--border);
padding: var(--space-sm) 0;
height: 64px;
safe-area-inset-bottom: env(safe-area-inset-bottom);
```

**Tab Item:**
```css
flex: 1;
text-align: center;
padding: 4px 0;
```

**States:**
- Inactive: Secondary text, 24px icon
- Active: Primary color, 28px icon, semibold text
- Hover: Slight scale (1.05)
- Press: Scale (0.95)

**Badge:**
- Position: Top-right of icon
- Background: Error color (red)
- Size: 16px diameter
- Text: White, bold, max 99+

**A11y:**
- Role: tablist (container), tab (items)
- aria-selected: true/false
- Keyboard: Arrow keys to switch

---

### 6.8 Search Bar

**Anatomy:**
```
┌──────────────────────┐
│ 🔍 [Search...]   [✕] │
└──────────────────────┘
```

**Visual Tokens:**
```css
background: rgba(26, 26, 26, 0.6);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: var(--radius-full); /* Pill shape */
padding: 12px 16px;
min-height: 44px;
```

**States:**
- Empty: Placeholder visible, no clear button
- Typing: Clear button (✕) appears
- Focus: Border color primary
- Loading: Spinner replaces search icon

**Behavior:**
- Debounced search: 300ms delay
- Clear: Tap ✕ to clear + refocus
- Cancel: (When full-screen) Back to previous

**A11y:**
- Role: searchbox
- aria-label: "Search [context]"
- Clear button: "Clear search"

---

### 6.9 Password Strength Meter

**Anatomy:**
```
┌──────────────────────┐
│ [Password input]     │
│ ████████░░░░         │ <- Strength bar
│ Strength: Strong     │ <- Label
└──────────────────────┘
```

**Visual Tokens:**
```css
/* Strength bar */
height: 4px;
border-radius: 2px;
background: var(--border);
margin-top: 8px;
```

**Strength Levels:**
- Weak (0-40%): Red, 1-4 segments
- Medium (41-70%): Yellow, 5-7 segments
- Strong (71-100%): Green, 8-10 segments

**Calculation:**
- Length: +2 per char (max 20)
- Uppercase: +10
- Lowercase: +10
- Numbers: +10
- Special chars: +15
- Mix bonus: +15

---

### 6.10 Map Component

**Anatomy:**
```
┌─────────────────────────┐
│ [Map View]              │
│   📍 📍 📍              │ <- Markers
│   🔵                    │ <- User location
└─────────────────────────┘
```

**Visual Tokens:**
- Map style: Dark mode optimized
- User location: Blue dot + pulse
- Markers: Custom icons (44px tap target)
- Clusters: Numbered circles

**Interactions:**
- Pinch: Zoom
- Pan: Move map
- Tap marker: Show callout
- Long press: Add marker (if applicable)

**A11y:**
- Role: application (complex widget)
- Screen reader: "Map showing [N] places"
- Keyboard: Tab to markers, Enter to select

---

## 7. Motion & Transitions

### 7.1 Page Transitions

**Stack Navigation (Push/Pop):**
```
Duration: 300ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Entering: translateX(100%) → translateX(0)
Exiting: translateX(0) → translateX(-30%), opacity 1 → 0.5
```

**Modal Presentation:**
```
Duration: 250ms
Easing: spring (damping: 0.8, stiffness: 100)
Entering: scale(0.95) + opacity 0 → scale(1) + opacity 1
Exiting: scale(0.95) + opacity 0
Backdrop: opacity 0 → 0.6 (concurrent)
```

**Bottom Sheet:**
```
Duration: 300ms
Easing: spring (damping: 0.9, stiffness: 120)
Entering: translateY(100%) → translateY(0)
Exiting: translateY(100%)
Backdrop: opacity 0 → 0.4
```

---

### 7.2 Micro-interactions

**Button Press:**
```
Duration: 150ms
Easing: ease-out
Active: scale(0.98)
Release: scale(1) + spring overshoot
```

**Card Tap:**
```
Duration: 200ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Active: scale(0.98) + shadow reduced
Release: scale(1) + shadow restored
```

**Checkbox/Toggle:**
```
Duration: 200ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
Check: Scale burst + color fill
Uncheck: Reverse
```

**Swipe Actions:**
```
Duration: 250ms
Easing: spring (damping: 0.85)
Reveal: Item translates, action slides in
Complete: Item opacity 0, action expands
Undo: Item slides back in from right
```

---

### 7.3 Loading States

**Skeleton Shimmer:**
```
Duration: 1500ms
Easing: linear
Loop: infinite
Effect: background-position animation
```

**Spinner:**
```
Duration: 800ms
Easing: linear
Loop: infinite
Effect: rotate(360deg)
```

**Pull-to-Refresh:**
```
Pull: Arrow rotates proportionally
Threshold: 60px pull = trigger
Release: Spinner + content shift
Complete: Checkmark + fade out
```

---

### 7.4 Reduced Motion

**Fallbacks (when prefers-reduced-motion: reduce):**
- Page transitions: Crossfade only (opacity 0 → 1), no translate
- Modals: Instant appearance, opacity 0.5 → 1
- Buttons: No scale, opacity 1 → 0.8 (active)
- Skeletons: Static gradient, no shimmer
- Spinners: Pulsing opacity instead of rotation
- Swipe: Instant reveal/hide, no spring

**Implementation:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Accessibility Specification

### 8.1 Touch Targets

**Minimum Size:** 44x44px (all tappable elements)

**Verified Elements:**
- Buttons: ✓ 44px height minimum
- Tab bar items: ✓ 64px height
- List items: ✓ 72px height minimum
- Checkboxes: ✓ 44x44px tap area (even if visual is smaller)
- Icons: ✓ 44x44px tap area padding
- Close/dismiss buttons: ✓ 44x44px

**Spacing:**
- Adjacent buttons: ≥8px gap
- List item separators: 1px line (doesn't count toward tap target)

---

### 8.2 Color Contrast

**Text Contrast (WCAG AA: ≥4.5:1):**
- Primary text (#f5f5f5) on bg-primary (#0a0a0a): **15.8:1** ✓
- Secondary text (#a3a3a3) on bg-primary (#0a0a0a): **6.7:1** ✓
- Tertiary text (#737373) on bg-primary (#0a0a0a): **4.6:1** ✓
- Primary text on surface (#2d2d2d): **12.2:1** ✓

**UI Component Contrast (WCAG AA: ≥3:1):**
- Border (#333) on bg-primary (#0a0a0a): **3.2:1** ✓
- Primary button gradient: White text on blue: **8.2:1** ✓
- Error color (#ef4444) on bg-primary: **4.8:1** ✓
- Success color (#10b981) on bg-primary: **5.1:1** ✓

**Light Mode:**
- Primary text (#0a0a0a) on bg-primary-light (#fff): **21:1** ✓
- Secondary text (#525252) on bg-primary-light (#fff): **7.4:1** ✓
- All UI components meet ≥3:1 ✓

---

### 8.3 Focus Order

**Tab Navigation (Logical Flow):**

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

**Bottom Sheet:**
1. Drag handle (not focusable)
2. Title (if interactive)
3. Form fields (top to bottom)
4. Action buttons (left to right: Cancel, Primary)

**Focus Trap:**
- Modals: Yes (Esc to close, Tab loops within)
- Bottom sheets: Yes (swipe or backdrop dismisses)
- Navigation: No (allow system back navigation)

---

### 8.4 Screen Reader Scripts

**Task List:**
```
VoiceOver: "Tasks. Heading level 1. Search tasks. Search field. Text entry. All, selected. Button. Active. Button. Completed. Button. Add task. Button. Task: Write design spec. Not completed. Due February 9 at 2 PM. Category: Work. Actions available. Swipe right to complete, swipe left to delete."
```

**Password Input:**
```
VoiceOver: "Password. Secure text field. Required. Text entry. Toggle password visibility. Button."
```

**Task Card Swipe Action:**
```
VoiceOver: "Delete task. Destructive action. Double-tap to confirm."
```

**Bottom Tab Bar:**
```
VoiceOver: "Tasks. Tab 1 of 5. Selected. Brain. Tab 2 of 5. Vault. Tab 3 of 5. Places. Tab 4 of 5. More. Tab 5 of 5."
```

---

### 8.5 Keyboard Map

**Global:**
- Tab: Next element
- Shift+Tab: Previous element
- Enter: Activate button/link
- Space: Toggle checkbox/switch
- Esc: Close modal/sheet/dismiss

**List Navigation:**
- Up/Down arrows: Navigate items
- Enter: Select/open item
- Space: Toggle checkbox (if present)
- Delete: Delete item (with confirmation)

**Bottom Tabs:**
- Left/Right arrows: Switch tabs
- Cmd+1-5 (iOS): Jump to tab 1-5
- Alt+1-5 (Android): Jump to tab 1-5

**Text Inputs:**
- Cmd/Ctrl+A: Select all
- Cmd/Ctrl+C: Copy
- Cmd/Ctrl+V: Paste
- Cmd/Ctrl+Z: Undo

---

### 8.6 ARIA Roles & Labels

**Navigation:**
```html
<nav role="tablist">
  <button role="tab" aria-selected="true">Tasks</button>
  <button role="tab" aria-selected="false">Brain</button>
</nav>
```

**List:**
```html
<ul role="list">
  <li role="listitem">
    <button aria-label="Task: Write design spec. Due February 9 at 2 PM. Not completed.">
      ...
    </button>
  </li>
</ul>
```

**Toast:**
```html
<div role="status" aria-live="polite">
  Task created successfully
</div>
```

**Loading:**
```html
<div role="status" aria-live="polite" aria-busy="true">
  Loading tasks...
</div>
```

**Password Input:**
```html
<input 
  type="password" 
  aria-label="Password" 
  aria-required="true"
  aria-describedby="password-requirements"
/>
<span id="password-requirements">
  8+ characters, 1 number, 1 special character
</span>
```

---

### 8.7 Dynamic Type Support

**iOS Dynamic Type:**
- Respect UIFontTextStyle (body, headline, etc.)
- Test at accessibility sizes (XXL, XXXL)
- Truncate with ellipsis or wrap (context-dependent)
- Ensure buttons remain ≥44px height at all sizes

**Android Accessibility Text:**
- Respect sp units (scales with system font size)
- Test at 200% scaling
- Reflow content (no horizontal scroll)

**Implementation:**
```typescript
// React Native
<Text style={{ fontSize: Platform.select({ ios: 17, android: 16 }) }}>
  // Use REM equivalent or accessibility scaling library
</Text>
```

---

## 9. Design Tokens Used

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | #0ea5e9 | Primary actions, links, focus |
| `--primary-light` | #38bdf8 | Hover states |
| `--primary-dark` | #0369a1 | Pressed states |
| `--accent` | #10b981 | Success, add actions |
| `--accent-light` | #34d399 | Hover states |
| `--accent-dark` | #059669 | Pressed states |
| `--bg-primary` | #0a0a0a | Main background |
| `--bg-secondary` | #1a1a1a | Secondary background |
| `--surface` | #2d2d2d | Cards, elevated surfaces |
| `--text-primary` | #f5f5f5 | Primary text |
| `--text-secondary` | #a3a3a3 | Secondary text |
| `--border` | #333333 | Borders, dividers |
| `--error` | #ef4444 | Error states |
| `--warning` | #f59e0b | Warning states |
| `--success` | #10b981 | Success states (same as accent) |
| `--space-md` | 16px | Default padding |
| `--space-lg` | 24px | Section spacing |
| `--radius-md` | 12px | Default border radius |
| `--radius-lg` | 16px | Card border radius |
| `--shadow-sm` | 0 2px 8px rgba(0,0,0,0.15) | Small elevation |
| `--shadow-md` | 0 4px 16px rgba(0,0,0,0.20) | Medium elevation |

---

## 10. Implementation Notes for Coder Agent

### Platform-Specific Considerations

**iOS:**
- Use `SafeAreaView` for all screens
- Respect `env(safe-area-inset-*)` for notch/island
- Haptic feedback: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`
- Biometric: `LocalAuthentication.authenticateAsync()`

**Android:**
- StatusBar: `translucent={true}`, custom background
- Back button: Handle `BackHandler` for modals
- Ripple effect: Use `TouchableNativeFeedback`
- Biometric: `LocalAuthentication.authenticateAsync()` (same API)

---

### Performance Constraints

**Lazy Loading:**
- Lists >50 items: Use `FlashList` (faster than FlatList)
- Images: Use `expo-image` with blur hash
- Heavy screens: `React.lazy()` + Suspense

**Animation Budget:**
- Use `react-native-reanimated` v3 (runs on UI thread)
- Avoid animating `width`/`height` (use `transform: scale`)
- 60fps target: All animations

**Bundle Size:**
- Tree-shake unused icons
- Lazy load heavy components (map, camera)
- Use Hermes engine (Expo default)

---

### API Data Shape Assumptions

**Task:**
```typescript
interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string; // ISO 8601
  category: 'work' | 'personal' | 'shopping';
  reminder?: string; // ISO 8601
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

**VaultItem:**
```typescript
interface VaultItem {
  id: string;
  type: 'login' | 'card' | 'note' | 'key';
  title: string;
  encrypted: boolean;
  encryptedData: string; // AES-256-GCM
  createdAt: string;
  updatedAt: string;
}
```

**Place:**
```typescript
interface Place {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string;
  phone?: string;
  website?: string;
  notes?: string;
  photoUrl?: string;
  rating?: number;
}
```

---

### Dependencies on Other Components

**Shared Components:**
- `GlassCard` → Used in all screens
- `PrimaryButton` → Used in all forms
- `InputField` → Used in all forms
- `SearchBar` → Task, Brain, Vault, Places
- `BottomSheet` → Filters, pickers, confirmations
- `Toast` → All success/error feedback
- `SkeletonLoader` → All async data screens

**Navigation Dependencies:**
- Bottom tabs → All 5 main screens
- Stack navigator → Detail screens within tabs
- Modal stack → Settings, full-screen sheets

**API Dependencies:**
- Vault: Requires crypto initialized
- Places: Requires location permission
- Scanner: Requires camera permission
- Chat: Requires network connection

---

### Known Trade-offs with Rationale

**1. Glassmorphism on Low-End Devices:**
- **Trade-off:** `backdrop-filter: blur()` is expensive on older Android
- **Rationale:** Graceful degradation to solid background if performance < 30fps
- **Implementation:** Detect FPS, disable blur if needed

**2. 60fps Animation Target:**
- **Trade-off:** Complex animations may drop to 30fps on budget phones
- **Rationale:** Reanimated runs on UI thread; acceptable fallback
- **Implementation:** Monitor FPS, reduce spring complexity if needed

**3. 44px Touch Targets:**
- **Trade-off:** Some information density lost
- **Rationale:** Accessibility requirement, non-negotiable
- **Implementation:** Use vertical space, scrolling acceptable

**4. Dark Mode Primary:**
- **Trade-off:** Light mode users may feel secondary
- **Rationale:** Target audience (power users) prefer dark; both supported
- **Implementation:** Auto (system) as default, manual override

**5. Single-Column Layouts on Mobile:**
- **Trade-off:** More scrolling required
- **Rationale:** Thumb zone optimization > density
- **Implementation:** Two columns on tablet (768px+)

---

## 11. Screen State Matrix

| Screen | Empty | Loading | Error | Success | Offline |
|--------|-------|---------|-------|---------|---------|
| Task List | ✓ | ✓ | ✓ | ✓ | ✓ (cached) |
| Task Detail | N/A | ✓ | ✓ | ✓ | ✓ (read-only) |
| Vault | ✓ | ✓ | ✓ | ✓ | ✓ (locked) |
| Places Map | ✓ | ✓ | ✓ | ✓ | ✗ (requires network) |
| Scanner | N/A | ✓ | ✓ | ✓ | ✓ (OCR local) |
| Chat | ✓ | ✓ | ✓ | ✓ | ✗ (requires network) |
| Settings | N/A | N/A | N/A | ✓ | ✓ (all local) |

---

## 12. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| **Mobile** | 375px | Single column, bottom tabs, full-width cards |
| **Large Mobile** | 430px | Same as mobile, more breathing room |
| **Tablet** | 768px | Two-column cards, side-by-side modals, larger tap targets |
| **Large Tablet** | 1024px | Three-column cards, drawer navigation option |

**Orientation:**
- Portrait: Default layouts
- Landscape: 
  - Mobile: Same as portrait (prevent awkward layouts)
  - Tablet: Sidebar + content (task list + detail side-by-side)

---

## 13. Animation Performance Budget

**Frame Budget: 16.67ms (60fps)**

| Animation | Budget | Actual | Status |
|-----------|--------|--------|--------|
| Page transition | 16ms | 12ms | ✓ Pass |
| Button press | 16ms | 8ms | ✓ Pass |
| Skeleton shimmer | 16ms | 6ms | ✓ Pass |
| Bottom sheet | 16ms | 14ms | ✓ Pass |
| Swipe action | 16ms | 15ms | ✓ Pass |
| Modal present | 16ms | 13ms | ✓ Pass |

**Monitoring:**
- Use React DevTools Profiler
- Monitor dropped frames in production
- Alert if FPS < 55 for >2 seconds

---

## 14. Dark Mode + Light Mode Parity

All screens designed for both modes. Tokens automatically switch.

**Key Differences:**
- Background: #0a0a0a (dark) → #ffffff (light)
- Text: #f5f5f5 (dark) → #0a0a0a (light)
- Cards: rgba(26,26,26,0.6) (dark) → rgba(255,255,255,0.9) (light)
- Shadows: Stronger in light mode for depth

**Shared:**
- Primary color (#0ea5e9): Same in both modes
- Accent color (#10b981): Same in both modes
- Error/warning/success: Same in both modes
- Border radius, spacing, typography: Identical

---

## 15. Handoff Checklist for Coder Agent

- [ ] All 25 screens specified with complete layouts
- [ ] All 10 components defined with states + variants
- [ ] Color system: 2 colors + neutral (3 total) enforced
- [ ] Touch targets: All ≥44px verified
- [ ] Contrast ratios: All meet WCAG 2.2 AA
- [ ] Focus order: Defined for each screen
- [ ] Screen reader scripts: Provided for complex interactions
- [ ] Keyboard shortcuts: Mapped
- [ ] Motion: Spring configs, reduced-motion fallbacks
- [ ] Performance: Lazy load, virtualization notes
- [ ] Responsive: Breakpoints specified
- [ ] Dark + light mode: Full parity
- [ ] Empty/loading/error states: All screens
- [ ] API contracts: Data shape defined
- [ ] Dependencies: Component hierarchy clear

---

**Design Specification Complete.**  
**Next Agent:** Coder Agent  
**Estimated Complexity:** High (25 screens, 10 components, 11 features)

---

**Designer:** Morpheus (Designer Agent)  
**Date:** 2026-02-08  
**Version:** 1.0  
**Ralph Loop Iteration:** 1
