# OpenClaw Chat - Built-in AI Assistant

**Date:** 2026-02-07 18:40 MST  
**Priority:** CRITICAL - MVP1 MUST-HAVE  
**Status:** Specification complete, ready to build  

---

## 🎯 The Requirement

**Brian:** "One of the key must have MVP features of the mobileclaw app is built in with the openclaw AI personal assistant, so in the chat in the mobile app, you can communicate. You don't have to use a third party like telegram, but has all the features, attachments, over, you know, large attachments."

**Translation:** Mobileclaw needs **built-in chat with OpenClaw AI (Cole)** - no Telegram/Signal needed.

---

## 💬 What This Is

**Built-in AI assistant chat directly in the Mobileclaw app.**

**Key points:**
- ❌ No external apps needed (not Telegram/Signal/WhatsApp)
- ✅ Direct communication with OpenClaw AI (Cole)
- ✅ Full features (attachments, large files, all capabilities)
- ✅ Primary interaction method

---

## 📋 Feature Requirements

### 1. Chat Interface ✅
- Message thread (scrollable history)
- Text input with send button
- Message bubbles (user vs AI)
- Timestamps
- Typing indicator ("Cole is typing...")
- Read receipts

### 2. Attachments ✅
- **Images:** Camera + gallery
- **Videos:** Record + gallery
- **Documents:** File picker
- **Large files:** Up to 50MB
- **Preview:** Thumbnails before sending
- **Progress:** Upload progress bar

### 3. OpenClaw Integration ✅
- **WebSocket:** Real-time connection to OpenClaw Gateway
- **Authentication:** Secure token-based
- **Session:** Maintain chat session
- **Reconnection:** Auto-reconnect on network loss

### 4. Message Features ✅
- Text formatting (bold, italic, code)
- Clickable links
- Copy/share messages
- Emoji reactions
- Message search

### 5. Storage ✅
- **Local:** SQLite for message history
- **Sync:** Optional cloud sync
- **Search:** Find by keyword
- **Export:** Conversation as text/JSON
- **Clear:** Delete all messages option

### 6. Notifications ✅
- Push notifications (new messages)
- Badge count (unread)
- Custom sounds
- Haptic feedback

---

## 🏗️ Technical Architecture

### Connection Flow
```
Mobileclaw App
    ↓ WebSocket
OpenClaw Gateway (wss://gateway-url)
    ↓
OpenClaw Session (Cole AI)
```

### WebSocket Messages
```typescript
// User sends message
{
  type: 'message',
  content: 'Hello Cole',
  attachments: [
    { type: 'image', url: 'file://...', size: 1024000 }
  ]
}

// Cole responds
{
  type: 'message',
  from: 'cole',
  content: 'Hello! How can I help?',
  timestamp: '2026-02-07T18:40:00Z'
}

// Typing indicator
{
  type: 'typing',
  isTyping: true
}
```

### Local Storage
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  from TEXT, -- 'user' or 'cole'
  content TEXT,
  attachments TEXT, -- JSON array
  timestamp INTEGER,
  read BOOLEAN
);
```

### Security
- **TLS/SSL:** All connections encrypted
- **Auth:** JWT or API key in headers
- **File encryption:** Attachments encrypted at rest
- **Secure storage:** Keychain for tokens

---

## 🎨 UI Design

**Chat Screen:**
```
┌─────────────────────────────────────┐
│  < Back    Cole AI           •••    │
├─────────────────────────────────────┤
│                                     │
│  [Cole] Hey! How can I help?        │
│  [Cole] 💡 I have 3 ideas for you   │
│                                     │
│        [User] Add to task board •   │
│                                     │
│  [Cole] ✅ Added 3 tasks to board   │
│                                     │
├─────────────────────────────────────┤
│  📎 [text input field...] [Send]    │
└─────────────────────────────────────┘
```

**Design Specs:**
- Message bubbles: 16px padding, rounded corners
- User bubbles: Right-aligned, blue (#4A90E2)
- Cole bubbles: Left-aligned, gray (#E5E5EA)
- Input bar: Fixed bottom, 48px height
- Send button: Blue when active, disabled when empty
- Attachments: Preview cards with thumbnails

---

## 🔗 Integration with Other Features

**Task Board:**
```
Cole: "Should I add this to task board?"
      [Add to Board] [Not Now]
      ↓
      Task created in Backlog
```

**Second Brain:**
```
Cole: "💡 Idea captured: AWS cost analysis"
      [View in Second Brain]
      ↓
      Opens Second Brain with idea
```

**Places:**
```
Cole: "Here's your trip map"
      [📍 Map preview]
      ↓
      Tap to open Places feature
```

**Vault:**
```
User: *sends API key*
Cole: "Add this to vault?"
      [Add to Vault] [No]
      ↓
      Secure storage in Vault
```

**Scanner:**
```
User: *sends receipt photo*
Cole: "Expense logged: $42.50 at Starbucks"
      [View in Scanner]
```

---

## 📊 Why This Is Critical

**Without built-in chat:**
- ❌ Users stuck with Telegram/Signal (dependency)
- ❌ Poor user experience (switch apps)
- ❌ Not a standalone app
- ❌ Defeats purpose of Mobileclaw

**With built-in chat:**
- ✅ Standalone experience
- ✅ Seamless integration with features
- ✅ Privacy (data stays in app)
- ✅ Differentiator (not just another task app)
- ✅ Primary interaction method

**This is the CORE of Mobileclaw.**

---

## 📅 Timeline

**Estimate:** 3-5 days

**Day 1:** WebSocket client + basic chat UI  
**Day 2:** Attachments + file upload  
**Day 3:** Message history + local storage  
**Day 4:** Notifications + reconnection logic  
**Day 5:** Polish + testing (20 UX test cases)  

**Dependencies:**
- OpenClaw Gateway WebSocket endpoint
- Authentication system
- File upload handling (50MB limit)

---

## ✅ Tasks Created (10)

**Added to task board:**

**CRITICAL (3):**
1. Build OpenClaw Chat UI - message bubbles, input, history
2. Implement WebSocket client - connect to OpenClaw Gateway
3. Build attachment system - images, videos, documents, 50MB

**HIGH (3):**
4. Design OpenClaw Chat interface - 20 UX test cases
5. Implement local message storage - SQLite
6. Add push notifications for new messages

**MEDIUM (3):**
7. Add typing indicators and read receipts
8. Implement file upload progress indicators
9. Add message search and export features

**LOW (1):**
10. Add message reactions and formatting

---

## 🎯 Success Metrics

**Feature is complete when:**
1. ✅ User can chat with Cole without leaving app
2. ✅ Attachments work (images, videos, documents, 50MB)
3. ✅ Messages persist across app restarts
4. ✅ Push notifications work when app backgrounded
5. ✅ 20 UX test cases pass (≥85% pass rate)
6. ✅ Brian dogfoods it daily for 1 week (no major complaints)

---

## 📝 Notes

**This changes MVP1 scope:**
- **Before:** 10 features
- **After:** 11 features (OpenClaw Chat added as #11)

**This is non-negotiable:**
- Cannot ship MVP1 without it
- Primary interaction method
- Core value proposition

**Priority order:**
1. **OpenClaw Chat** (CRITICAL - must have)
2. Security fixes (CRITICAL - blockers)
3. Second Brain + Task Board integration (HIGH)
4. Other features (MEDIUM/LOW)

---

**Created:** 2026-02-07 18:40 MST  
**Updated in:** MVP1-SCOPE.md, task board (10 tasks), memory files  
**Status:** 🔴 CRITICAL - Start immediately after security fixes  
**Owner:** Mobile Agent + Designer Agent (for chat UI design)
