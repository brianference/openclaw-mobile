# Mobileclaw Second Brain Feature Specification

## Overview
The Second Brain feature provides a quick capture system for ideas, thoughts, and notes that can be transformed into actionable tasks. It serves as an inbox for creative thinking that integrates with the task management system.

## User Story
As a mobile user, I want to quickly capture ideas in any format (text, voice, image) and later convert them into organized tasks, so that I don't lose creative thoughts while maintaining an actionable workflow.

## Core Capabilities

### 1. Quick Capture (Multi-Modal)
- **Text Input:** Type ideas quickly with minimal friction
- **Voice Input:** Speak ideas using device microphone (speech-to-text)
- **Image Capture:** Take photos or select from gallery to save visual ideas
- **Speed Requirement:** Capture process must complete in <10 seconds
- **Offline Support:** Capture works without internet, syncs when online

### 2. Ideas Inbox Management
- **Inbox View:** List of all captured ideas in chronological order
- **Status Indicators:** New, In Progress, Converted, Archived
- **Quick Actions:** Swipe to delete, edit, or convert
- **Search:** Full-text search across all ideas
- **Filtering:** By date, type (text/voice/image), status, tags
- **Sorting:** Chronological, alphabetical, by relevance

### 3. Convert to Task Workflow
- **One-Tap Conversion:** Tap "Convert to Task" button
- **Smart Parsing:** Extract title, description, due date from idea text
- **Category Selection:** Choose task category/project
- **Priority Assignment:** Set priority level (critical/high/medium/low)
- **Task Board Integration:** Automatically adds to task board
- **Bidirectional Link:** Task links back to original idea

### 4. Task Board Integration
- **Seamless Flow:** Converted ideas appear on task board immediately
- **Metadata Preservation:** Original capture time, format, location
- **Source Indicator:** Tasks show "From Second Brain" badge
- **Quick Navigation:** Tap badge to view original idea

### 5. Categories and Tags
- **Predefined Categories:** Work, Personal, Creative, Learning, Health
- **Custom Tags:** User-defined tags for flexible organization
- **Tag Autocomplete:** Suggest existing tags while typing
- **Multi-Tag Support:** Apply multiple tags per idea
- **Tag-Based Filtering:** View ideas by tag

### 6. Search and Filtering
- **Full-Text Search:** Search across titles, descriptions, voice transcripts
- **Advanced Filters:**
  - Date range (today, this week, this month, custom)
  - Type (text, voice, image)
  - Status (inbox, converted, archived)
  - Tags (any, all, none)
- **Search Results:** Highlight matching terms
- **Saved Searches:** Save common filter combinations

### 7. Offline Functionality
- **Offline Capture:** All capture modes work without internet
- **Local Storage:** Ideas stored in SQLite database
- **Background Sync:** Auto-sync when connection available
- **Conflict Resolution:** Last-write-wins strategy
- **Sync Status Indicator:** Show sync progress/errors

### 8. Performance Requirements
- **Large Dataset Handling:** Smooth performance with 1000+ ideas
- **Lazy Loading:** Load ideas in batches of 50
- **Image Optimization:** Compress images to <500KB
- **Voice Transcription:** Process in <5 seconds
- **Search Speed:** Return results in <1 second

## User Interface

### Capture Screen
```
┌─────────────────────────┐
│ Second Brain           ⚙│
├─────────────────────────┤
│                         │
│  What's on your mind?   │
│                         │
│ ┌─────────────────────┐ │
│ │                     │ │
│ │  [Tap to type...]   │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│  [🎤 Voice] [📷 Photo]  │
│                         │
│  Tags: #work #idea      │
│                         │
│        [Capture]        │
│                         │
└─────────────────────────┘
```

### Inbox Screen
```
┌─────────────────────────┐
│ Ideas Inbox       🔍 ⋮  │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ 💡 New product idea │ │
│ │ 2 hours ago         │ │
│ │ #work #creative     │ │
│ │         [Convert →] │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 🎤 "Remember to..."  │ │
│ │ Yesterday           │ │
│ │ #personal           │ │
│ │         [Convert →] │ │
│ └─────────────────────┘ │
│                         │
│       [+ New Idea]      │
└─────────────────────────┘
```

### Convert to Task Screen
```
┌─────────────────────────┐
│ Convert to Task    ✕    │
├─────────────────────────┤
│ Title:                  │
│ ┌─────────────────────┐ │
│ │ New product idea    │ │
│ └─────────────────────┘ │
│                         │
│ Description:            │
│ ┌─────────────────────┐ │
│ │ Build an app that...│ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ Priority: [High ▼]      │
│ Category: [Work ▼]      │
│ Due Date: [Feb 25 ▼]    │
│                         │
│  [Cancel]  [Create Task]│
└─────────────────────────┘
```

## Technical Requirements

### Data Model
```typescript
interface Idea {
  id: string;
  type: 'text' | 'voice' | 'image';
  content: string; // text or transcription
  imageUrl?: string; // for image ideas
  audioUrl?: string; // for voice ideas
  tags: string[];
  status: 'inbox' | 'converted' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  convertedTaskId?: string; // link to task
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  dueDate?: Date;
  sourceIdeaId?: string; // link back to idea
  createdFrom: 'manual' | 'second-brain';
}
```

### Storage
- **SQLite Database:** Local storage for ideas
- **Image Storage:** Device file system with compression
- **Audio Storage:** Device file system in AAC format
- **Sync Queue:** Pending changes for cloud sync

### APIs
- **Speech-to-Text:** Device native API (iOS/Android)
- **Image Compression:** Native image processing
- **Cloud Sync:** RESTful API to OpenClaw backend
- **Search:** SQLite FTS5 full-text search

### Security
- **Encryption at Rest:** AES-256 encryption for local database
- **Secure Transmission:** TLS 1.3 for cloud sync
- **Biometric Lock:** Optional Face ID/Touch ID protection
- **Auto-Lock:** Lock after 5 minutes of inactivity

## Acceptance Criteria

### Functional Requirements
- [ ] Text capture works in <3 taps
- [ ] Voice capture transcribes accurately (>95% accuracy)
- [ ] Image capture compresses without quality loss
- [ ] Capture completes in <10 seconds
- [ ] Offline capture works without internet
- [ ] Ideas sync automatically when online
- [ ] Search returns results in <1 second
- [ ] Convert to task workflow is intuitive
- [ ] Task board shows converted ideas
- [ ] Performance smooth with 1000+ ideas

### Non-Functional Requirements
- [ ] App launches in <2 seconds
- [ ] Capture screen appears in <500ms
- [ ] Battery usage <5% per hour of active use
- [ ] Storage: <50MB for 1000 ideas
- [ ] Memory usage <100MB
- [ ] No crashes during normal use

### Accessibility
- [ ] VoiceOver/TalkBack support
- [ ] Minimum touch target size: 44x44px
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Keyboard navigation (external keyboard)
- [ ] Font scaling support (up to 200%)

## Success Metrics

### Usage Metrics
- Average ideas captured per day: >5
- Conversion rate (ideas → tasks): >40%
- Time to capture: <10 seconds (avg)
- User retention (30-day): >70%

### Performance Metrics
- Capture success rate: >99%
- Voice transcription accuracy: >95%
- Sync success rate: >99%
- App crash rate: <0.1%
- Search accuracy: >90% relevance

### Quality Metrics
- User satisfaction: >4.5/5 stars
- Feature usage: >80% use capture weekly
- Bug reports: <5 per 1000 users
- Support tickets: <2% of users

## Edge Cases

1. **No Internet Connection:** Capture works, syncs later
2. **Device Storage Full:** Prompt to clear old ideas
3. **Microphone Permission Denied:** Disable voice capture, show message
4. **Camera Permission Denied:** Disable image capture, show message
5. **Very Long Text Input:** Truncate at 5000 characters
6. **Duplicate Ideas:** Allow duplicates, show warning
7. **Corrupted Database:** Attempt repair, fallback to cloud backup
8. **Large Image (>10MB):** Compress to <500KB or reject
9. **Background Recording:** Stop voice capture when app backgrounded
10. **Low Battery (<10%):** Disable background sync

## Future Enhancements

### Phase 2 (Future)
- **AI-Powered Suggestions:** Auto-suggest tags, categories, priority
- **Smart Reminders:** "You captured this idea 1 week ago, convert to task?"
- **Voice Commands:** "Create idea: [your text]"
- **Collaborative Ideas:** Share ideas with team members
- **Idea Templates:** Pre-filled templates for common types
- **Rich Text Formatting:** Bold, italic, lists in ideas
- **Attachments:** Multiple images per idea
- **Integration:** Export to Notion, Obsidian, Evernote

### Phase 3 (Future)
- **AI Clustering:** Automatically group related ideas
- **Sentiment Analysis:** Track mood/emotion in ideas
- **Idea Relationships:** Link related ideas together
- **Version History:** Track edits to ideas
- **Analytics Dashboard:** Visualize capture patterns
- **Gamification:** Streaks, badges for capturing ideas

---

**Version:** 1.0  
**Created:** 2026-02-21  
**Last Updated:** 2026-02-21  
**Status:** Specification Complete
