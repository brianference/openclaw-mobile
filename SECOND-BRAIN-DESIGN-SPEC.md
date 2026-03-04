# Second Brain UI Design Specification
**Project:** Mobileclaw  
**Feature:** Second Brain - Ideas to Tasks Flow  
**Version:** 1.0  
**Date:** March 3, 2026  
**Designer:** PM Orchestrator

---

## 1. Complexity Classification

**Complexity:** **COMPLEX**

**Justification:**
- Multiple capture methods (voice, text, image) with different processing pipelines
- Offline-first architecture with bidirectional sync and conflict resolution
- Real-time voice transcription (on-device + cloud fallback)
- OCR text extraction from images
- Encryption at rest (AES-256-GCM) and in transit (TLS 1.3)
- Search indexing (SQLite FTS5) for 1000+ items
- Bi-directional linking between ideas and tasks
- Cross-platform support (iOS/Android) with platform-specific optimizations

**Estimated Implementation Time:** 40-60 hours (2-3 weeks for experienced mobile developer)

---

## 2. Prerequisites Check

**Backend APIs:**

**Existing APIs (assumed):**
- ✅ **OpenClaw Gateway Sync API** - for cloud sync (WebSocket + REST)
- ✅ **Task Management API** - to create tasks from ideas (POST /tasks)
- ❓ **User Authentication API** - for multi-device sync (OAuth/JWT)

**New APIs Needed:**
- ❌ **Voice Transcription API** (cloud fallback) - if on-device transcription fails
  - **Alternatives:** Google Cloud Speech-to-Text, AWS Transcribe, Azure Speech Service
  - **Recommendation:** Use expo-speech-to-text (on-device) as primary, cloud as fallback
- ❌ **OCR API** (optional enhancement) - for image text extraction
  - **Alternatives:** Google Cloud Vision API, AWS Textract, Tesseract.js (on-device)
  - **Recommendation:** Start with on-device OCR (expo-ocr or react-native-mlkit), add cloud as premium feature

**Data Sources:**

**Local Storage:**
- SQLite database (expo-sqlite) - stores ideas, tags, categories, attachments
- File system (expo-file-system) - stores encrypted image attachments

**Cloud Storage:**
- OpenClaw Gateway - syncs ideas across devices
- Cloud storage (optional) - for image attachments (S3, CloudFlare R2, or similar)

**Dependencies:**

**Required Expo/React Native Packages:**
- `expo-sqlite` - local database
- `expo-speech-to-text` - voice transcription (on-device)
- `expo-image-picker` - camera/photo library access
- `expo-file-system` - file storage
- `react-native-reanimated` - animations
- `@react-native-community/netinfo` - offline detection
- `expo-crypto` - encryption (AES-256-GCM)

**Optional Enhancements:**
- `react-native-mlkit` or `expo-ocr` - OCR (on-device)
- `expo-notifications` - push notifications for sync status
- `expo-haptics` - haptic feedback

**Platform Capabilities:**

**iOS Requirements:**
- Microphone permission (NSMicrophoneUsageDescription)
- Camera permission (NSCameraUsageDescription)
- Photo library permission (NSPhotoLibraryUsageDescription)
- Speech recognition permission (NSSpeechRecognitionUsageDescription)

**Android Requirements:**
- RECORD_AUDIO permission
- CAMERA permission
- READ_EXTERNAL_STORAGE / WRITE_EXTERNAL_STORAGE permissions
- INTERNET permission (for sync)

**Alternatives Considered:**

**Alternative 1: Server-Side Processing**
- **Pros:** Consistent experience, offload device processing
- **Cons:** Requires network, slower, privacy concerns
- **Decision:** Rejected - conflicts with offline-first + privacy goals

**Alternative 2: Simple Text-Only Capture**
- **Pros:** Faster implementation, fewer dependencies
- **Cons:** Less versatile, misses voice/image use cases
- **Decision:** Rejected - voice capture is a key differentiator

**Alternative 3: Use Native Note Apps (Apple Notes, Google Keep)**
- **Pros:** Zero implementation effort
- **Cons:** No integration with task board, not unified experience
- **Decision:** Rejected - defeats purpose of Second Brain integration

---

## 3. Security Checklist

**Input Validation:**
- ✅ **Idea Title/Body:** Sanitize all user input (strip HTML, limit length to 10,000 chars)
- ✅ **Tags:** Validate format (#tagname, lowercase, no spaces, max 50 chars)
- ✅ **Attachments:** Validate file types (images only: jpg, png, heif, max 10MB)
- ✅ **Voice Transcription:** Validate transcription output (max 5,000 chars)
- ✅ **OCR Text:** Validate extracted text (max 10,000 chars)

**XSS Protection:**
- ✅ **Markdown Rendering:** Use sanitized markdown library (react-native-markdown-display with XSS protection)
- ✅ **URL Detection:** Sanitize detected URLs before making them tappable
- ✅ **User-Generated Content:** Escape all user input before rendering in UI
- ❌ **N/A:** No web views or HTML rendering in this feature (native only)

**Authentication/Authorization:**
- ✅ **Local Data:** Encrypted at rest (AES-256-GCM), device unlock required
- ✅ **Cloud Sync:** Require authentication (JWT/OAuth) before syncing
- ✅ **Multi-Device:** Validate device token on every sync request
- ✅ **Session Management:** Auto-logout after 30 days of inactivity
- ✅ **Biometric Lock:** Support Face ID/Touch ID for app unlock (optional, user preference)

**Data Exposure:**
- ✅ **Local-First:** Ideas never leave device unless user explicitly enables sync
- ✅ **Encryption at Rest:** All ideas encrypted in SQLite database (AES-256-GCM)
- ✅ **Encryption in Transit:** TLS 1.3 for all network requests
- ✅ **Attachments:** Images encrypted before storage, decrypted only when viewed
- ✅ **No Telemetry:** No usage tracking without explicit user consent
- ✅ **GDPR Compliance:** User can export all data (JSON), delete account (wipes all data)
- ❌ **Avoid:** Storing unencrypted voice recordings or images in file system
- ❌ **Avoid:** Logging user-generated content in crash reports or analytics

**API Security:**
- ✅ **Rate Limiting:** Sync API limited to 60 requests/minute per user
- ✅ **Payload Validation:** Reject oversized payloads (max 5MB per sync request)
- ✅ **CSRF Protection:** Not applicable (native app, no cookies)
- ✅ **SQL Injection:** Use parameterized queries (SQLite prepared statements)
- ❌ **Avoid:** Constructing SQL queries with string concatenation

**Third-Party Services:**
- ⚠️ **Voice Transcription (Cloud Fallback):** Use HTTPS, send minimal data, delete after processing
- ⚠️ **OCR API (if used):** Use HTTPS, avoid sending sensitive images (warn user first)
- ✅ **No Analytics SDKs:** Avoid third-party analytics that track user behavior

**Permissions & Privacy Manifest:**
- ✅ **Microphone:** Only requested when user initiates voice capture
- ✅ **Camera:** Only requested when user initiates photo capture
- ✅ **Photo Library:** Only requested when user selects "Choose from library"
- ✅ **Privacy Manifest (iOS):** Declare all permissions with clear usage descriptions
- ❌ **Avoid:** Requesting permissions on app launch (request only when needed)

---

## Overview

The Second Brain feature enables users to quickly capture ideas (voice, text, image) and seamlessly convert them into actionable tasks. Optimized for mobile-first, offline-first, and speed (<10 seconds from thought to captured idea).

---

## Core User Flow

```
Capture Idea → Ideas Inbox → Review & Edit → Convert to Task → Task Board
```

**Speed Target:** Idea captured in <10 seconds (from app open to save)

---

## 4. Quick Capture Interface

### 1.1 Entry Points
- **Floating Action Button (FAB):** Bottom-right corner, always visible on Ideas screen
- **Quick Capture Widget:** Home screen widget (iOS/Android)
- **Voice Command:** "Hey Mobileclaw, capture idea: [idea]"
- **Share Extension:** Capture from other apps (Safari, Notes, Photos)

### 1.2 Capture Methods

#### Voice Capture
- **UI:** Large microphone button, waveform visualization
- **Interaction:** Tap to start, tap again to stop
- **Features:**
  - Real-time transcription (on-device, offline)
  - Automatic punctuation
  - Auto-save after 3 seconds of silence
  - Language detection (EN/ES/FR/DE/JA)
- **Gestures:** Long-press FAB → instant voice capture

#### Text Capture
- **UI:** Minimalist text input, auto-expanding
- **Features:**
  - Markdown support (optional)
  - Auto-complete from previous ideas
  - Hashtag detection for tags
  - @mentions for people
- **Gestures:** Swipe down to dismiss without saving

#### Image Capture
- **UI:** Camera preview with minimal UI
- **Features:**
  - Take photo or select from library
  - OCR text extraction (automatic)
  - Quick annotation (draw, text, arrows)
  - Compress for offline storage
- **Gestures:** Pinch to zoom, double-tap for full-screen

### 1.3 Capture Screen Layout
```
┌─────────────────────────────────┐
│ ← Cancel          Capture   Save│
├─────────────────────────────────┤
│                                 │
│  [Large capture area]           │
│   • Voice: 🎤 waveform          │
│   • Text: Auto-expanding input  │
│   • Image: Camera preview       │
│                                 │
│ ─────────────────────────────── │
│ Quick Tags: #work #personal #… │
│ Category: 💡 Idea ▼             │
└─────────────────────────────────┘
```

---

## 5. Ideas Inbox View

### 2.1 List Layout
- **Default View:** Reverse chronological (newest first)
- **Card Design:**
  ```
  ┌───────────────────────────────┐
  │ 💡 Idea Title (truncated 50ch)│
  │ Brief preview (first 100 chars)│
  │ #tag #tag  • 2h ago           │
  └───────────────────────────────┘
  ```

### 2.2 Filters & Sorting
- **Filter Pills:** All • Unprocessed • With Images • Tagged
- **Sort Options:**
  - Recent (default)
  - Oldest
  - Most Tagged
  - Alphabetical
- **Search Bar:** Full-text search, searches title + body + tags

### 2.3 Gestures
- **Tap:** Open idea detail
- **Swipe Left:** Quick convert to task → shows task preview modal
- **Swipe Right:** Archive idea (removed from inbox, saved to archive)
- **Long Press:** Multi-select mode (bulk actions: archive, delete, tag)
- **Pull to Refresh:** Sync with cloud (if online)

### 2.4 Empty State
```
┌─────────────────────────────────┐
│         🧠                      │
│    Your Second Brain            │
│                                 │
│  Capture ideas instantly        │
│  [+ New Idea]                   │
└─────────────────────────────────┘
```

---

## 6. Idea Detail/Edit Screen

### 3.1 Layout
```
┌─────────────────────────────────┐
│ ← Back                  ⋯ More  │
├─────────────────────────────────┤
│ Title: [Editable input]         │
│ ─────────────────────────────── │
│ Body:                           │
│ [Multi-line editable text]      │
│ • Supports markdown             │
│ • Auto-save on blur             │
│                                 │
│ ─────────────────────────────── │
│ 📎 Attachments: [image1.jpg]   │
│ #tags: #work #idea              │
│ 📅 Created: Mar 3, 2026 2:56 PM │
│                                 │
│ ─────────────────────────────── │
│ [Convert to Task]               │
│ [Archive]  [Delete]             │
└─────────────────────────────────┘
```

### 3.2 Features
- **Auto-Save:** Every 2 seconds, debounced
- **Version History:** Undo/redo (last 10 edits)
- **Attachments:** Max 5 images per idea, 10MB total
- **Tags:** Auto-suggest from existing tags, create new inline
- **Links:** Auto-detect URLs, make them tappable

### 3.3 More Menu (⋯)
- Edit
- Duplicate
- Share (as text, PDF, or markdown)
- Move to Archive
- Delete

---

## 7. Convert to Task Workflow

### 4.1 One-Tap Conversion
**From Idea Detail:**
- Tap **[Convert to Task]** button
- Modal appears with pre-filled task:
  - **Title:** Idea title → task title
  - **Description:** Idea body → task description
  - **Tags:** Idea tags → task tags
  - **Status:** Defaults to "Backlog"
  - **Priority:** Defaults to "Medium"

### 4.2 Conversion Modal
```
┌─────────────────────────────────┐
│ Create Task from Idea           │
├─────────────────────────────────┤
│ Title: [Pre-filled from idea]   │
│ Status: Backlog ▼               │
│ Priority: Medium ▼              │
│ Tags: #work #idea               │
│ ─────────────────────────────── │
│ 📝 Keep idea in inbox? [✓]     │
│ (Uncheck to archive after)      │
│ ─────────────────────────────── │
│ [Cancel]           [Create Task]│
└─────────────────────────────────┘
```

### 4.3 Swipe-to-Convert (from Inbox)
- **Swipe Left:** Reveals "Convert" button
- **Tap Convert:** Opens conversion modal
- **Quick Option:** Double-swipe left → instant convert with defaults

---

## 8. Task Board Integration

### 5.1 Task Display
- Tasks created from ideas show **🧠 Second Brain** badge
- Clicking badge opens original idea (if not archived)
- Task detail includes "View Original Idea" link

### 5.2 Bi-Directional Linking
- Idea → Task: Link persists even after idea archived
- Task → Idea: Task completion suggests archiving linked idea

### 5.3 Sync Behavior
- **Offline:** All operations queue locally
- **Online:** Background sync every 5 minutes
- **Conflict Resolution:** Last-write-wins (with timestamp)

---

## 9. Categories and Tags

### 6.1 Categories (Pre-Defined)
- 💡 Idea (default)
- 📝 Note
- 🎯 Goal
- 🔍 Research
- 💬 Conversation

**Visual:** Icon + color badge on each idea card

### 6.2 Tags (User-Defined)
- **Format:** #tagname (lowercase, no spaces)
- **Auto-Suggest:** Shows top 10 most-used tags
- **Create Inline:** Type # in text → auto-creates tag
- **Tag Cloud:** View all tags, tap to filter

### 6.3 Tag Management
- Rename tag (updates all ideas)
- Delete tag (removes from all ideas)
- Merge tags (combine similar tags)

---

## 10. Search and Filtering

### 7.1 Search Capabilities
- **Full-Text Search:** Title, body, tags, attachments (OCR)
- **Search Syntax:**
  - `tag:work` → ideas with #work tag
  - `category:note` → notes only
  - `date:today` → ideas from today
  - `has:image` → ideas with images
- **Search History:** Last 10 searches saved

### 7.2 Filters
- **Status:** All • Unprocessed • Converted • Archived
- **Date Range:** Today • This Week • This Month • Custom
- **Category:** All • Idea • Note • Goal • Research • Conversation
- **Tags:** Select multiple tags (AND/OR logic toggle)

### 7.3 Saved Filters
- Save frequently-used filter combinations
- Quick access from filter bar
- Example: "Work Ideas This Week" → `tag:work date:week status:unprocessed`

---

## 11. Performance & Optimization

### 8.1 Speed Targets
- **Capture Idea:** <10 seconds (target: 5 seconds)
- **Load Inbox:** <1 second (1000 ideas)
- **Search:** <500ms (1000 ideas)
- **Convert to Task:** <2 seconds

### 8.2 Offline-First Architecture
- **Local Storage:** SQLite database
- **Sync Queue:** All operations queued when offline
- **Background Sync:** When network available
- **Conflict Resolution:** Last-write-wins (with merge UI for major conflicts)

### 8.3 Handling Large Volumes (1000+ Ideas)
- **Pagination:** Load 50 ideas at a time, infinite scroll
- **Virtual Scrolling:** Render only visible cards (React Native FlatList)
- **Image Compression:** Max 800px width, 80% JPEG quality
- **Search Indexing:** SQLite FTS5 (Full-Text Search)
- **Archive Auto-Archive:** Ideas >90 days old → suggest archiving

---

## 12. Accessibility

### 9.1 WCAG 2.1 AA Compliance
- **Color Contrast:** 4.5:1 minimum for text
- **Touch Targets:** 44x44px minimum (WCAG 2.5.5)
- **Screen Reader:** All elements labeled, logical order
- **Voice Control:** "Tap [button name]" commands work

### 9.2 VoiceOver/TalkBack Support
- Announce idea count: "Ideas inbox, 23 unprocessed"
- Swipe gestures: Double-tap to activate
- Conversion: "Convert idea to task, button"

---

## 13. Design System Integration

### 10.1 Colors (Existing Mobileclaw Theme)
- **Primary:** Blue (#007AFF iOS, #3B82F6 Android)
- **Accent:** Green (#34C759 for success states)
- **Warning:** Orange (#FF9500 for unprocessed ideas)
- **Surface:** White (light mode), #1C1C1E (dark mode)

### 10.2 Typography
- **Idea Title:** SF Pro / Roboto, 17pt, Semi-Bold
- **Body Text:** SF Pro / Roboto, 15pt, Regular
- **Tags:** SF Pro / Roboto, 13pt, Medium
- **Timestamps:** SF Pro / Roboto, 12pt, Regular, 60% opacity

### 10.3 Spacing
- **Card Padding:** 16px
- **Between Cards:** 12px
- **Section Spacing:** 24px
- **FAB Margin:** 16px from bottom-right corner

---

## 14. Animation & Transitions

### 11.1 Micro-Interactions
- **FAB Tap:** Scale 1.0 → 0.95 → 1.0 (150ms)
- **Swipe Gestures:** Elastic bounce when overscroll
- **Card Tap:** Subtle lift (elevation +4dp, 200ms)
- **Voice Recording:** Pulsing microphone icon (600ms cycle)

### 11.2 Screen Transitions
- **Capture → Inbox:** Slide from bottom (300ms, ease-out)
- **Inbox → Detail:** Push from right (250ms, ease-in-out)
- **Convert Modal:** Fade + scale from center (200ms)

---

## 15. Error Handling

### 12.1 Voice Capture Errors
- **Microphone Permission Denied:** Show settings prompt
- **Transcription Failed:** Allow manual text entry
- **Network Error (cloud transcription):** Fallback to on-device

### 12.2 Storage Errors
- **Database Full:** Prompt to archive old ideas
- **Sync Failure:** Show retry button, queue for later
- **Attachment Too Large:** Compress or prompt user

### 12.3 User Feedback
- **Success:** Green checkmark toast (2 seconds)
- **Error:** Red banner with retry action
- **Info:** Blue banner (dismissible)

---

## 16. Security & Privacy

### 16.1 Data Encryption
- **At Rest:** All ideas encrypted (AES-256-GCM)
- **In Transit:** TLS 1.3 for sync
- **Attachments:** Encrypted before storage

### 16.2 Privacy Features
- **Local-First:** Ideas never leave device unless user enables sync
- **Opt-In Sync:** Sync disabled by default
- **No Analytics:** No usage tracking without explicit consent

---

## 17. Future Enhancements (Out of Scope for v1)

- AI-powered idea categorization
- Voice-to-task conversion (skip idea step)
- Collaboration (share ideas with team)
- Idea templates (recurring capture patterns)
- Integration with external services (Notion, Obsidian, Evernote)

---

# 20 UX Test Cases

## Test Case 1: Quick Voice Capture
**Given:** User is on Ideas Inbox screen  
**When:** User long-presses FAB  
**Then:** Voice capture starts immediately (<500ms)  
**And:** Waveform visualization appears  
**And:** Recording stops after 3 seconds of silence  
**And:** Idea is saved to inbox with transcription

---

## Test Case 2: Text Capture with Hashtags
**Given:** User opens capture screen  
**When:** User types "Remember to #work on the #project proposal"  
**Then:** "#work" and "#project" are detected as tags  
**And:** Tags appear in the quick tags section  
**And:** Idea is saved with both tags attached

---

## Test Case 3: Image Capture with OCR
**Given:** User selects image capture  
**When:** User takes photo of handwritten note  
**Then:** OCR extracts text from image  
**And:** Extracted text populates idea body  
**And:** Original image is attached  
**And:** User can edit OCR text before saving

---

## Test Case 4: Swipe Left to Convert (Inbox)
**Given:** User is viewing ideas inbox with 10 ideas  
**When:** User swipes left on first idea  
**Then:** "Convert" button slides in from right  
**And:** Tapping "Convert" opens conversion modal  
**And:** Task title/description pre-filled from idea  
**And:** Creating task shows success message

---

## Test Case 5: Swipe Right to Archive
**Given:** User is viewing ideas inbox  
**When:** User swipes right on an idea  
**Then:** Idea slides out to the right  
**And:** Idea is removed from inbox  
**And:** Idea is moved to archive  
**And:** Undo toast appears for 5 seconds

---

## Test Case 6: Long Press Multi-Select
**Given:** User is viewing ideas inbox with 20 ideas  
**When:** User long-presses on first idea  
**Then:** Multi-select mode activates  
**And:** Checkboxes appear on all cards  
**And:** User can select multiple ideas  
**And:** Bulk actions bar appears at bottom (Archive, Delete, Tag)

---

## Test Case 7: Offline Voice Capture
**Given:** Device is offline (airplane mode)  
**When:** User captures voice idea  
**Then:** On-device transcription works  
**And:** Idea is saved locally  
**And:** Sync icon shows "queued" status  
**And:** When online, idea syncs automatically

---

## Test Case 8: Search with Syntax
**Given:** User has 100 ideas with various tags  
**When:** User searches "tag:work date:week"  
**Then:** Results show only ideas with #work tag from this week  
**And:** Results load in <500ms  
**And:** Search syntax is highlighted in search bar

---

## Test Case 9: Filter by Category
**Given:** User has ideas in 5 different categories  
**When:** User taps category filter "📝 Note"  
**Then:** Inbox shows only Note-category ideas  
**And:** Filter pill shows active state (blue background)  
**And:** Count badge updates to show filtered count

---

## Test Case 10: Convert to Task with Custom Fields
**Given:** User is viewing idea detail  
**When:** User taps "Convert to Task"  
**Then:** Conversion modal opens  
**And:** User can edit task title, status, priority  
**And:** User can toggle "Keep idea in inbox"  
**And:** Creating task navigates to task board  
**And:** New task appears with 🧠 badge

---

## Test Case 11: Tag Auto-Suggest
**Given:** User is creating a new idea  
**When:** User types "#" in text field  
**Then:** Dropdown shows top 10 most-used tags  
**And:** User can tap to select  
**And:** Tag is inserted into text  
**And:** User can create new tag by typing

---

## Test Case 12: Pull to Refresh (Online)
**Given:** User is viewing ideas inbox (online)  
**When:** User pulls down from top  
**Then:** Refresh spinner appears  
**And:** New ideas sync from cloud  
**And:** Inbox updates with new ideas at top  
**And:** Success message: "Synced 3 new ideas"

---

## Test Case 13: Empty State
**Given:** User has 0 ideas in inbox  
**When:** Inbox screen loads  
**Then:** Empty state illustration appears  
**And:** "Your Second Brain" message displays  
**And:** "[+ New Idea]" button is prominent  
**And:** Tapping button opens capture screen

---

## Test Case 14: Idea Detail Auto-Save
**Given:** User is editing idea detail  
**When:** User types text and pauses for 2 seconds  
**Then:** Auto-save triggers  
**And:** Subtle "Saved" indicator appears (1 second)  
**And:** Changes persist if user navigates away

---

## Test Case 15: Attachment Management
**Given:** User has idea with 3 attached images  
**When:** User views idea detail  
**Then:** Attachments section shows thumbnails  
**And:** Tapping thumbnail opens full-screen view  
**And:** User can delete attachment (confirmation required)  
**And:** User can add more attachments (max 5 total)

---

## Test Case 16: Voice Command Capture
**Given:** User enables voice command feature  
**When:** User says "Hey Mobileclaw, capture idea: Buy groceries tomorrow"  
**Then:** App opens to capture screen (even if locked)  
**And:** Transcription shows "Buy groceries tomorrow"  
**And:** User confirms or edits before saving  
**And:** Idea is saved to inbox

---

## Test Case 17: Share Extension (Safari)
**Given:** User is browsing a website in Safari  
**When:** User taps Share → Mobileclaw  
**Then:** Capture screen opens with URL pre-filled  
**And:** Page title becomes idea title  
**And:** URL is included in idea body  
**And:** User can add notes before saving

---

## Test Case 18: Saved Filter Quick Access
**Given:** User has saved filter "Work Ideas This Week"  
**When:** User taps saved filter from filter bar  
**Then:** Inbox applies filter instantly (<200ms)  
**And:** Filter pill shows active state  
**And:** User can clear filter with one tap  
**And:** Filter persists until manually cleared

---

## Test Case 19: Handling Large Volume (1000 Ideas)
**Given:** User has 1000 ideas in inbox  
**When:** Inbox screen loads  
**Then:** First 50 ideas load in <1 second  
**And:** Infinite scroll loads next 50 as user scrolls  
**And:** Search still completes in <500ms  
**And:** No lag or frame drops during scrolling

---

## Test Case 20: Dark Mode Consistency
**Given:** User enables dark mode in system settings  
**When:** User opens Second Brain feature  
**Then:** All screens use dark theme colors  
**And:** Text contrast meets WCAG AA (4.5:1)  
**And:** FAB and buttons have appropriate dark mode colors  
**And:** Images/attachments render correctly on dark background

---

# Design Deliverables

1. **This Document:** SECOND-BRAIN-DESIGN-SPEC.md
2. **UI Mockups:** (To be created by designer/frontend agent)
   - Capture screen (voice, text, image)
   - Ideas inbox (list view)
   - Idea detail screen
   - Conversion modal
   - Filter/search UI
   - Empty states
   - Dark mode variants
3. **Prototype:** Interactive Figma/Sketch prototype (recommended)
4. **Design Tokens:** Colors, typography, spacing (integrate with Mobileclaw design system)

---

# Implementation Notes

- **Platform:** React Native (Expo)
- **Database:** SQLite (expo-sqlite)
- **Voice:** expo-speech-to-text (on-device) + cloud API fallback
- **Images:** expo-image-picker, expo-image-manipulator
- **Sync:** WebSocket to OpenClaw gateway (optional)
- **Offline:** Expo SQLite + NetInfo for offline detection
- **Animations:** react-native-reanimated

---

# Success Metrics

- **Capture Speed:** 95% of ideas captured in <10 seconds
- **Conversion Rate:** 60% of ideas converted to tasks within 7 days
- **Daily Active Users:** 70% of Mobileclaw users engage with Second Brain
- **Retention:** 80% of users return after first use
- **Error Rate:** <1% of voice captures fail

---

**End of Design Specification**
