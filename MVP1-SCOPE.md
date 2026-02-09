# Mobileclaw MVP1 - Confirmed Scope

**Date:** 2026-02-07  
**Status:** Scope expanded from 6 → 10 features  

---

## 11 MVP1 Features (Updated 2026-02-07 18:40 MST)

### Core App Features (5)
1. ✅ **Task Board Board** - Task management (already built)
2. 🧠 **Second Brain** - **DEEPLY INTEGRATED with task board** - Cole proposes ideas, ideas flow into tasks, two-way sync
3. 🔐 **Encrypted Vault** - AES-256-GCM, PBKDF2, biometric unlock
4. 🗺️ **Places** - Trip planning, Google Maps, Places API, generic framework
5. 📷 **Scanner/OCR** - Document capture (already built)

### Business Features (4) - REQUIRED FOR MVP1
6. 🛡️ **Security Dashboard** - Vault settings, network monitor, privacy controls, security audit
7. ☁️ **Cloud Setup Wizard** - One-tap AWS + Google Cloud backend deployment
8. 💰 **AdMob Integration** - Banner/interstitial/rewarded ads (free tier monetization)
9. 💎 **Paid Version** - $4.99 one-time purchase, no ads, premium features

### System (1)
10. ⚙️ **Settings** - Themes, notifications, account

---

## Security Dashboard Details

**Vault Security:**
- Auto-lock timer settings (1/5/15/30 min)
- Biometric unlock toggle (FaceID/TouchID)
- Master password change
- Emergency vault wipe

**Network Security:**
- VPN status indicator
- HTTPS-only mode
- Certificate pinning status
- Network activity monitor

**Data Privacy:**
- App permissions review
- Data collection settings
- Analytics opt-in/out
- Export/delete all data

**Security Audit:**
- Last vault access time
- Failed unlock attempts
- Security score (0-100)
- Recommendations

---

## Cloud Setup Wizard Details

**OpenClaw Backend Deployment:**
- Step-by-step wizard for cloud infrastructure
- Support for AWS + Google Cloud

**AWS Components:**
- S3 bucket (encrypted storage for files)
- DynamoDB tables (session data, tasks, memory, skills)
- Lambda functions (API endpoints, webhooks)
- IAM roles and policies (least privilege)
- CloudWatch logging (monitoring)

**Google Cloud Components:**
- Cloud Storage buckets (encrypted file storage)
- Firestore databases (NoSQL data)
- Cloud Functions (serverless APIs)
- Service account setup (authentication)
- Cloud Logging (monitoring)

**Wizard Flow:**
1. User selects provider (AWS or Google Cloud or Both)
2. User provides credentials (API keys, access tokens)
3. Wizard creates infrastructure automatically
4. Tests connectivity and validates encryption
5. Returns API endpoint URL
6. User saves endpoint in vault

---

## AdMob Integration Details

**Free Tier Ad Strategy:**
- Banner ads (non-intrusive, bottom of screen)
- Interstitial ads (between major actions, not annoying)
- Rewarded ads (unlock premium features temporarily)

**Ad Placement:**
- Bottom banner on Task Board/Second Brain screens
- Interstitial after completing 5 tasks (not every task)
- Rewarded ad to unlock Places offline mode for 24 hours
- NO ads on Vault screen (security/privacy)

**GDPR Compliance:**
- Consent management (first launch)
- Ad personalization toggle
- Privacy policy link
- User control over ad experience
- EU users: explicit consent required

**Revenue Projections:**
- 1,000 DAU × $0.05 CPM = ~$50/month
- Goal: Cover hosting costs, not primary revenue

---

## Paid Version Details

**Pricing:**
- One-time purchase: **$4.99**
- No subscriptions, no recurring fees
- Lifetime access to all features

**What You Get:**
- ✅ No ads (ever)
- ✅ Unlimited cloud storage
- ✅ Premium themes (10+ additional themes)
- ✅ Priority support (email + Discord)
- ✅ Early access to new features
- ✅ Offline mode for all features (not just Places)
- ✅ Advanced security features (hardware key support)

**In-App Purchase Flow:**
- Free users see "Upgrade to Premium" in Settings
- Tap → Apple/Google payment screen
- Purchase → unlock immediately
- Restore purchase on new device

**App Store Optimization:**
- Compelling screenshots (before/after, features)
- Demo video (60 seconds, feature walkthrough)
- Feature highlights (security, privacy, no ads)
- User testimonials (from beta testers)
- Search keywords: personal AI, task manager, encrypted vault

**Family Sharing:**
- iOS: Enabled (one purchase → 6 family members)
- Android: Limited to individual account

---

## Timeline

### Week 1-2: Build New Features
- Security Dashboard (~2 days)
- Cloud Setup Wizard (~3 days)
- AdMob Integration (~1 day)
- Paid Version setup (~1 day)
- Finish security fixes (~2 days)

### Week 3: Testing & Refinement
- Test on Expo Go (iPhone + Android)
- Fix critical bugs
- Deploy to TestFlight + Internal Testing
- Brian dogfoods all features

### Week 4-6: Dogfooding & Iteration
- Brian uses daily (vault, Places for Japan trip, Security Dashboard)
- Cole tracks tasks in mobile task board
- Document pain points
- Weekly iteration cycle

### Month 2-3: Polish & Launch
- UI/UX refinements
- Performance optimization
- App Store screenshots/video
- Submit to App Store + Play Store
- Public launch

---

## Success Metrics

**MVP1 Complete When:**
1. ✅ All 10 features functional
2. ✅ Brian uses Mobileclaw daily for 1 week (no major complaints)
3. ✅ Security audit passes (no critical vulnerabilities)
4. ✅ Cloud wizard successfully deploys to AWS + Google Cloud
5. ✅ Paid version purchase flow works end-to-end
6. ✅ AdMob ads show (but aren't annoying)

**Post-Launch Metrics:**
- 100+ downloads in first month
- 4.5+ star rating (App Store + Play Store)
- <5% uninstall rate
- Revenue: $500+ first month (paid versions)
- Brian uses it for Japan trip (May 2026) - ultimate validation

---

## Next Steps

1. **Finish security fixes** (14 remaining) - BLOCKER
2. **Build Security Dashboard** (vault + network + privacy)
3. **Build Cloud Setup Wizard** (AWS + Google Cloud)
4. **Integrate AdMob** (free tier ads)
5. **Create paid version** (in-app purchase)
6. **Test on Expo Go** (iPhone + Android)
7. **Deploy to TestFlight** (beta testing)
8. **Dogfooding begins** (Brian uses daily)

---

**Updated:** 2026-02-07 17:50 MST  
**By:** Cole (after Brian confirmed MVP1 scope expansion)

---

## Second Brain Details (Deep Task Board Integration)

**Critical Requirement:** NOT passive storage - active intelligence layer

**Core Integration Points:**

1. **Cole Proposes Ideas (Active Intelligence)**
   - During conversations: "I'm capturing 3 ideas..."
   - Proactive: "Based on X, I suggest..."
   - Pattern-based: "You've mentioned Y 3 times - create task?"
   
2. **Ideas Tab in Task Board**
   - 💡 Ideas counter in header
   - Swipe right → promote to task
   - Filter task board by source (ideas vs manual)
   
3. **Two-Way Sync**
   - Idea promoted → task created with link
   - Task completed → idea marked "Implemented"
   - Status tracking: Captured → Promoted → Implemented
   
4. **Smart Workflows**
   - Pre-fill task details from idea
   - Auto-suggest priority based on keywords
   - Track conversion rate (ideas → tasks → done)
   - Weekly summaries: "5 captured, 3 promoted, 2 completed"

**Success Metric:** 50%+ of tasks originate from ideas

**Implementation:** See `SECOND-BRAIN-TASK BOARD-INTEGRATION.md` (9.5 KB detailed spec)

---

### System (2) - UPDATED
10. ⚙️ **Settings** - Themes, notifications, account
11. 💬 **OpenClaw Chat (Built-in)** - CRITICAL MVP1 REQUIREMENT
    - Direct chat with OpenClaw AI (Cole) in-app
    - No third-party needed (not Telegram/Signal/WhatsApp)
    - Full features: attachments, large files (50MB), all capabilities
    - Real-time messaging
    - Message history
    - Typing indicators
    - File uploads (images, videos, documents)

---

## OpenClaw Chat Details (NEW - CRITICAL)

**Purpose:** Built-in AI assistant chat - users shouldn't need external apps

**Why Critical:**
- Primary interaction method with AI
- No dependency on Telegram/Signal/WhatsApp
- Privacy: conversations stay in app
- Full feature parity with external chat
- Seamless integration with other features

**Features Required:**

### 1. Chat Interface
- Message thread (scrollable history)
- Text input with send button
- Attachment picker (camera, gallery, files)
- Typing indicator ("Cole is typing...")
- Read receipts
- Timestamps
- Message bubbles (user vs AI)

### 2. Attachments
- **Images:** Camera capture + gallery selection
- **Videos:** Record + gallery selection
- **Documents:** File picker (PDF, DOC, etc.)
- **Large files:** Up to 50MB (configured limit)
- **Preview:** Show thumbnails/icons before sending
- **Progress:** Upload progress indicator

### 3. OpenClaw Integration
- **WebSocket connection** to OpenClaw Gateway
- **Authentication:** Secure token-based auth
- **Real-time:** Instant message delivery
- **Session management:** Maintain chat session
- **Reconnection:** Auto-reconnect on network loss

### 4. Message Features
- **Text formatting:** Bold, italic, code blocks
- **Links:** Clickable URLs
- **Mentions:** @references (for multi-user future)
- **Reactions:** Emoji reactions to messages
- **Copy/share:** Long-press to copy/share

### 5. History & Storage
- **Local storage:** SQLite for message history
- **Sync:** Optional cloud sync
- **Search:** Find messages by keyword
- **Clear history:** Option to delete all messages
- **Export:** Export conversation as text/JSON

### 6. Notifications
- **Push notifications:** New messages when app backgrounded
- **Badge count:** Unread message count
- **Sounds:** Customizable notification sounds
- **Vibration:** Haptic feedback

---

## Technical Implementation

### Architecture
```
Mobileclaw App
    ↓
WebSocket Client
    ↓
OpenClaw Gateway (wss://gateway-url)
    ↓
OpenClaw Session (Cole AI)
```

### WebSocket Messages
```typescript
// Send message
{
  type: 'message',
  content: 'Hello Cole',
  attachments: [
    { type: 'image', url: 'file://...', size: 1024000 }
  ]
}

// Receive message
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

### Storage Schema
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
- **Token auth:** JWT or API key in headers
- **File encryption:** Attachments encrypted at rest
- **Secure storage:** Keychain for auth tokens

---

## UI Design Requirements

**Chat Screen Layout:**
```
┌─────────────────────────────────────┐
│  < Back    Cole AI           •••    │ Header
├─────────────────────────────────────┤
│                                     │
│  [Cole] Hey! How can I help?        │
│  [Cole] 💡 I have 3 ideas for you   │
│                                     │
│        [User] Add to task board •   │ Message bubbles
│                                     │
│  [Cole] ✅ Added 3 tasks to board   │
│                                     │
├─────────────────────────────────────┤
│  📎 [text input field...] [Send]    │ Input bar
└─────────────────────────────────────┘
```

**Design specs:**
- Message bubbles: 16px padding, rounded corners
- User bubbles: Right-aligned, blue background
- Cole bubbles: Left-aligned, gray background
- Timestamps: Small gray text below bubbles
- Attachments: Preview cards with thumbnails
- Input bar: Fixed at bottom, 48px height
- Send button: Disabled when empty, blue when active

---

## Integration with Other Features

**Task Board:**
- Cole: "Should I add this to task board?" → inline button → task created

**Second Brain:**
- Cole: "💡 Idea captured: X" → inline button → view in Second Brain

**Places:**
- Cole: "Here's your trip map" → inline map preview → tap to open Places

**Vault:**
- Cole: "Add this API key to vault?" → inline button → vault screen

**Scanner:**
- User: *sends receipt photo* → Cole: "Expense logged: $42.50"

---

## Priority

**CRITICAL - This is a MUST-HAVE for MVP1**

**Why:**
- Primary user interaction method
- Can't ship without it
- Differentiator (built-in vs external)
- Enables all other features

**Without this:**
- Users stuck with Telegram/Signal
- Poor user experience
- Not a standalone app
- Defeats purpose of mobile app

---

## Timeline

**Estimate:** 3-5 days (complex feature)

**Breakdown:**
- Day 1: WebSocket client + basic chat UI
- Day 2: Attachments + file upload
- Day 3: Message history + local storage
- Day 4: Notifications + reconnection logic
- Day 5: Polish + testing

**Dependencies:**
- OpenClaw Gateway WebSocket endpoint
- Authentication system
- File upload handling (50MB limit)

---

**Added:** 2026-02-07 18:40 MST  
**Priority:** CRITICAL - Cannot ship MVP1 without this  
**Assigned:** Mobile Agent + Designer Agent (for chat UI)
