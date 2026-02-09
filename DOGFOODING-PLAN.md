# Mobileclaw Dogfooding Plan - Build It By Using It

**Date:** 2026-02-07 17:25 MST  
**Philosophy:** Like Scholarship Hunt Pro - we use it to improve it  

---

## 🎯 The Vision

**Personal AI Assistant Mobile App**
- Works on Expo Go (React Native/Expo)
- Deploys to iOS + Android app stores
- Beautiful, intuitive interface (modern-design skill)
- **We USE it daily to make it better**

---

## 📱 MVP1 Features (10 Total)

### Core Features (1-5)
1. **Task Board** ✅ - Task management
2. **Second Brain** 🧠 - Skills, ideas, memory
3. **Encrypted Vault** 🔐 - Secure API key storage
4. **Places** 🗺️ - Trip planning & navigation
5. **Scanner/OCR** 📷 - Document capture

### Business Features (6-9) - NEW
6. **Security Dashboard** 🛡️ - Vault, network, privacy controls
7. **Cloud Wizard** ☁️ - AWS + Google Cloud setup
8. **AdMob Integration** 💰 - Free tier monetization
9. **Paid Version** 💎 - $4.99 one-time, no ads

### System (10)
10. **Settings** ⚙️ - Themes, preferences, account

---

### 1. Task Board ✅ (Already built)
**What it does:**
- Task management like web task board
- Columns: Backlog, Next Up, Active, Done
- Quick add, drag/drop, priorities
- Sync with web version (optional)

**Dogfooding:**
- Cole tracks tasks in mobile task board
- Brian uses it for daily task management
- We find what's missing, add it

---

### 2. Second Brain 🧠 (Build this next) - **DEEPLY INTEGRATED WITH TASK BOARD**
**What it does:**
- **Active Intelligence System** - NOT passive storage
- Cole actively proposes ideas during conversations
- Ideas flow directly into task board tasks
- Two-way sync: ideas ↔ tasks

**Core Components:**

1. **Ideas Tracker** (Primary Feature)
   - **Cole proposes ideas:** "This would make a good project..."
   - Quick capture of ideas:
     - Voice notes → transcribed to text
     - Photo → OCR to text
     - Quick text entry
     - Tag and categorize
   - **"Promote to Task" button** → sends to task board Backlog
   - Track idea status: Captured → Promoted → Implemented
   
2. **Task Board Integration** (Critical)
   - Ideas tab in task board
   - Swipe right on idea → promote to task
   - Task completion → update idea status
   - Filter task board by source (ideas vs manual)
   - Ideas counter in task board header
   
3. **Skills Repository**
   - All ClawHub skills we've installed/created
   - SKILL.md content viewable
   - Usage examples
   - Memory on how to properly use each skill
   - Search skills by name/tag
   - "Use this skill" → creates task in task board
   
4. **Memory System** (Like MEMORY.md but mobile)
   - Key decisions
   - Lessons learned
   - How-to guides
   - Search and reference
   - Auto-link to related tasks

**Cole's Active Role:**
- "I noticed you mentioned X - should I capture this as an idea?"
- "This conversation sparked 3 ideas - want to review them?"
- "You have 5 ideas waiting - should I promote any to tasks?"
- "Based on your Japan trip, I'm proposing: [3 related ideas]"

**Dogfooding:**
- Cole actively proposes ideas in real-time
- Brian swipes to promote ideas → task board tasks
- Track conversion rate (ideas → tasks → done)
- Refine Cole's proposal patterns based on what Brian accepts
- Ideas become fuel for task board workflow

---

### 3. Encrypted Vault 🔐 (Critical security)
**What it does:**
- Separate encrypted file for secrets
- AES-256-GCM encryption
- PBKDF2 password hashing
- User enters:
  - API keys (Google, OpenAI, etc.)
  - Tokens (GitHub, Netlify, etc.)
  - Passwords
  - Sensitive notes
- Auto-lock after 5 minutes
- Biometric unlock (FaceID/TouchID)

**Dogfooding:**
- Brian stores real API keys here
- Tests security (try to break it)
- Refine UX based on daily access patterns

---

### 4. Trip/Itinerary/Map Agent 🗺️ (Generic version of what we're building)
**What it does:**
- Create trips with dates/locations
- Interactive map view (Google Maps)
- List view with sorting/filtering
- Add places via:
  - Google Places search
  - Manual entry
  - Import from web trip planner
- Categories: 🍳 Meals, 🎯 Activities, 🏨 Hotels, 🚇 Transport
- "Find nearby" - restaurants, gas, ATMs
- Directions integration
- **Generic framework** (Japan trip is just Brian's data)

**Features from Trip Map v3:**
- Visual map with markers
- Places UI Kit integration
- List/Map view toggle
- Find food nearby
- Train/transit integration (configurable per region)

**Dogfooding:**
- Brian uses it for Japan trip (May 2026)
- Others can use for their own trips
- We discover missing features through actual travel planning
- Iterate: "I wish it could..." → we add it

---

### 5. Scanner/OCR 📷 (Already built)
**What it does:**
- Scan receipts, business cards, documents
- OCR to extract text
- Save to Second Brain or Vault

**Dogfooding:**
- Scan receipts during trip
- Extract contact info from business cards
- Quick capture of notes/whiteboards

---

### 6. Security & Privacy Dashboard 🛡️ (MVP1 - NEW)
**What it does:**
- **Vault Security:**
  - Auto-lock timer settings (1/5/15/30 min)
  - Biometric unlock toggle
  - Master password change
  - Emergency vault wipe
  
- **Network Security:**
  - VPN status indicator
  - HTTPS-only mode
  - Certificate pinning status
  - Network activity monitor
  
- **Data Privacy:**
  - App permissions review
  - Data collection settings
  - Analytics opt-in/out
  - Export/delete all data
  
- **Security Audit:**
  - Last vault access time
  - Failed unlock attempts
  - Security score (0-100)
  - Recommendations

**Dogfooding:**
- Brian tests security features daily
- Monitor vault access patterns
- Refine auto-lock timing
- Validate encryption strength

---

### 7. Cloud Setup Wizard ☁️ (MVP1 - NEW)
**What it does:**
- **OpenClaw Backend Setup:**
  - Step-by-step wizard for cloud deployment
  - AWS + Google Cloud support
  
- **AWS Configuration:**
  - S3 bucket creation (encrypted storage)
  - DynamoDB tables (session data, tasks, memory)
  - Lambda functions (API endpoints)
  - IAM roles and policies
  - CloudWatch logging
  
- **Google Cloud Configuration:**
  - Cloud Storage buckets
  - Firestore databases
  - Cloud Functions
  - Service account setup
  - Cloud Logging
  
- **One-tap setup:**
  - User provides credentials
  - Wizard handles infrastructure
  - Tests connectivity
  - Validates encryption
  - Returns API endpoint

**Dogfooding:**
- Brian sets up his own cloud backend
- Tests AWS vs Google Cloud performance
- Validates cost estimates
- Refine wizard UX

---

### 8. Monetization (AdMob) 💰 (MVP1 - NEW)
**What it does:**
- **Free Version:**
  - Banner ads (non-intrusive)
  - Interstitial ads (between major actions)
  - Rewarded ads (unlock premium features temporarily)
  
- **Ad Placement:**
  - Bottom banner on Task Board/Second Brain
  - Interstitial after completing 5 tasks
  - Rewarded ad to unlock Places offline mode
  
- **GDPR/Privacy:**
  - Consent management
  - Ad personalization toggle
  - Privacy policy link
  - User control over ad experience

**Dogfooding:**
- Test ad frequency (not annoying)
- Validate revenue projections
- Refine placement strategy
- Ensure GDPR compliance

---

### 9. Paid Version (iOS + Android) 💎 (MVP1 - NEW)
**What it does:**
- **One-time purchase: $4.99**
  - No ads (ever)
  - Unlimited cloud storage
  - Premium themes
  - Priority support
  - Early access to new features
  
- **In-App Purchase:**
  - Upgrade from free → paid
  - Restore purchase on new device
  - Family sharing (iOS)
  
- **App Store Optimization:**
  - Compelling screenshots
  - Demo video
  - Feature highlights
  - User testimonials

**Dogfooding:**
- Brian tests paid version purchase flow
- Validate no ads appear
- Test restore purchase
- Refine pricing strategy

---

### 10. Settings ⚙️ (Already built)
**What it does:**
- Dark/light theme
- Notification preferences
- Account/sync settings
- About/version info

---

## 🔄 Dogfooding Methodology

### Phase 1: Get It Working (Weeks 1-2)
1. **Finish security fixes** (14 remaining from audit)
   - AES-256-GCM vault encryption
   - PBKDF2 password hashing
   - Secure API key storage
   
2. **Build new MVP1 features:**
   - Security Dashboard (vault settings, network monitor, privacy controls)
   - Cloud Setup Wizard (AWS S3/DynamoDB/Lambda + Google Cloud Storage/Firestore)
   - AdMob Integration (banner, interstitial, rewarded ads)
   - Paid Version (in-app purchase, ad removal, premium features)
   
3. **Test on Expo Go** (iPhone + Android)
4. **Fix critical bugs**
5. **Deploy to TestFlight (iOS) + Internal Testing (Android)**

### Phase 2: Start Using It (Week 3)
1. **Brian:** Load real API keys into vault
2. **Brian:** Import Japan trip data into Places
3. **Brian:** Set up AWS/Google Cloud backend via wizard
4. **Brian:** Test paid version purchase flow
5. **Cole:** Track tasks in mobile task board
6. **Cole:** Monitor security dashboard daily
7. **Both:** Capture ideas in Second Brain
8. **Both:** Validate ad frequency isn't annoying
9. **Document:** What works, what doesn't

### Phase 3: Iterate Based on Usage (Ongoing)
1. **Daily use reveals gaps:**
   - "I wish it could sync with web task board"
   - "Need offline mode for trip map"
   - "Voice input for ideas is too slow"
   - "Vault timeout too short/long"

2. **We add features based on real needs:**
   - Not hypothetical "nice to have"
   - Actual pain points from daily use

3. **Weekly iteration cycle:**
   - Monday: Review usage notes
   - Tuesday: Prioritize fixes/features
   - Wed-Fri: Implement and test
   - Weekend: Deploy, dogfood, repeat

---

## 🎨 Modern Design Application

**Using modern-design skill:**
- Pick one of the 9 themes (suggest: **Indigo Night** or **Sunset Vibrant**)
- Apply consistently across all screens
- Components:
  - Cards with glassmorphism
  - Smooth animations
  - Gradient accents
  - Accessible colors (WCAG AA)
  - Touch-friendly targets (44x44px min)

**Dogfooding design:**
- Use app in different lighting (bright sun, dark room)
- Test readability while walking/moving
- Time how fast we can complete common actions
- Iterate on anything that feels clunky

---

## 🔗 Connection to Trip Map v3

**What we're building right now becomes a feature:**

```
Trip Map v3 (Web)
    ↓
  Extract core features
    ↓
Places (Mobile component)
    ↓
  Generic + reusable
    ↓
Any user's trips
```

**Features that transfer:**
1. ✅ Google Maps integration → works in mobile
2. ✅ Places UI Kit → works in mobile
3. ✅ List/Map toggle → works in mobile
4. ✅ Find food nearby → works in mobile
5. ✅ Timeline filtering → works in mobile
6. ⚠️ Train schedules → make region-agnostic (Tokyo Metro vs NYC Subway vs London Tube)

**What changes:**
- Remove Japan-specific data (that's just your trip)
- Make trip creation flow (name, dates, locations)
- Multi-trip support (create/edit/delete trips)
- Export/import trip data
- Offline map tiles (optional)

---

## 📦 Project Structure

```
mobileclaw/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home/Dashboard
│   │   ├── task board.tsx         # Task Board board ✅
│   │   ├── brain.tsx          # Second Brain 🆕
│   │   ├── trips.tsx          # Places 🆕
│   │   └── vault.tsx          # Encrypted vault ✅
│   ├── trip/
│   │   ├── [id].tsx           # Trip details (map/list)
│   │   ├── edit.tsx           # Edit trip
│   │   └── create.tsx         # Create new trip
│   └── brain/
│       ├── skills.tsx         # Skills repository
│       ├── ideas.tsx          # Ideas tracker
│       └── memory.tsx         # Memory system
├── components/
│   ├── Map.tsx                # Google Maps component
│   ├── PlaceCard.tsx          # Place details card
│   ├── VaultInput.tsx         # Encrypted input
│   └── SkillCard.tsx          # Skill display
├── lib/
│   ├── crypto.ts              # AES-256-GCM encryption
│   ├── places-api.ts          # Google Places integration
│   ├── storage.ts             # Encrypted AsyncStorage
│   └── sync.ts                # Optional cloud sync
└── constants/
    ├── trips.ts               # Trip data types
    ├── skills.ts              # Skills metadata
    └── theme.ts               # Design system
```

---

## 🚀 Implementation Priority

### Immediate (This Week)
1. **Finish security audit fixes** (14 remaining)
   - Location: `/root/.openclaw/workspace/projects/mobileclaw/AUDIT-STATUS.md`
   - Priority: AES-256-GCM, PBKDF2, secure storage
   
2. **Test on Expo Go**
   - Run: `npx expo start --tunnel`
   - Scan QR code on iPhone/Android
   - Fix any runtime errors

3. **Deploy modern design**
   - Apply Indigo Night theme
   - 6 screens (already have mockups)

### Next Week
4. **Build Second Brain features**
   - Skills repository (load from ClawHub JSON)
   - Ideas tracker (SQLite + AsyncStorage)
   - Memory system (markdown viewer)

5. **Build Places**
   - Extract from Trip Map v3 web version
   - Make generic (remove Japan specifics)
   - Trip CRUD (create, read, update, delete)
   - Google Maps mobile integration

### Ongoing
6. **Dogfood daily**
   - Brian: Use vault for real keys
   - Brian: Plan Japan trip in app
   - Cole: Track tasks in task board
   - Both: Document issues/ideas

7. **Iterate weekly**
   - Fix pain points
   - Add requested features
   - Improve UX based on usage

---

## 📊 Success Metrics

**We know it's working when:**
1. Brian checks mobile task board daily (not web)
2. Brian stores all API keys in vault (not secrets file)
3. Brian plans entire Japan trip in mobile app
4. Cole references skills from mobile (not desktop)
5. We capture 90% of ideas in mobile (not forgetting them)
6. App doesn't crash for 1 week straight
7. We recommend it to others (dogfood → product)

---

## 🎯 Key Insight

**Trip Map v3 = Prototype for Places feature**

Everything we're building right now:
- Google Maps integration
- Places UI Kit
- Find food nearby
- Train schedules
- List/Map toggle

**Becomes reusable components in mobile app.**

The Japan trip is just **example data** to validate the feature works.

Other users will:
- Create their own trips
- Use same map/list/search features
- Customize for their region (NYC subway vs Tokyo Metro)

---

## 💡 What This Means Right Now

**Trip Map v3 build (in progress):**
- Keep building with all features
- Document what works well
- Note what could be mobile-friendly
- **Web version = validation**
- **Mobile version = production**

**After Trip Map v3 completes:**
- Extract core components
- Port to React Native
- Make generic/reusable
- Add to Mobileclaw as "Places" feature

---

## 📅 Timeline

**Week 1 (Feb 8-14):**
- Finish Trip Map v3 web (validation)
- Complete Mobileclaw security fixes
- Test on Expo Go

**Week 2 (Feb 15-21):**
- Build Second Brain features
- Port Places to mobile
- Deploy modern design

**Week 3 (Feb 22-28):**
- Brian loads real data (vault, trips)
- Daily dogfooding begins
- First iteration cycle

**Month 2 (March):**
- Weekly iterations based on usage
- Add features we actually need
- Polish for app store submission

**Month 3 (April):**
- Finalize for app stores
- TestFlight (iOS) public beta
- Google Play internal testing

**May 2026:**
- Brian uses mobile app during Japan trip
- **Ultimate dogfooding test**
- Real-world validation

---

## 🔐 Security First

**Before any real data goes in:**
1. ✅ Complete AES-256-GCM vault encryption
2. ✅ PBKDF2 password hashing (anti-brute-force)
3. ✅ Secure key storage (Expo SecureStore)
4. ✅ Auto-lock after timeout
5. ✅ Biometric unlock
6. ✅ No keys in code/git
7. ✅ Hostile audit passed

**Only then:** Brian loads real API keys.

---

## 📱 Expo Go → App Stores

**Development:**
- Expo Go (instant testing on phone)
- No build process needed
- Fast iteration

**Production:**
- EAS Build (create standalone apps)
- TestFlight (iOS beta)
- Google Play Internal Testing (Android beta)
- Public app stores (when ready)

**Commands:**
```bash
# Development (Expo Go)
npx expo start --tunnel

# Production build (iOS)
eas build --platform ios

# Production build (Android)
eas build --platform android
```

---

**Status:** READY TO DOGFOOD  
**Next:** Finish security fixes, test on Expo Go, start using it  
**Timeline:** 3 weeks to daily usage, 3 months to app stores  
**Ultimate test:** Japan trip in May 2026

---

## 🆕 NEW FEATURES ADDED (2026-02-07)

### 7. Control Tower 🎛️ (NEW)
**What it does:**
- Monitor AI agent sessions in real-time
- Track token usage and costs
- View activity stream
- Health status dashboard
- WebSocket real-time updates

**Dogfooding:**
- Monitor Cole's activity from mobile
- Track token usage on-the-go
- Get push notifications for errors
- Review agent performance

### 8. Security Dashboard 🔒 (NEW)
**What it does:**
- Vault security settings (auto-lock, biometric)
- Network security (HTTPS only, cert pinning)
- Data privacy (export, delete, cache)
- Session management (active devices, force logout)

**Dogfooding:**
- Test security features daily
- Verify biometric unlock works
- Validate session management
- Test data export/delete

### 9. Cloud Setup Wizard ☁️ (NEW)
**What it does:**
- Guided setup for AWS or Google Cloud
- Automatic backups to S3/Cloud Storage
- Cross-device sync via Firestore/DynamoDB
- Serverless functions for background tasks

**Dogfooding:**
- Connect to AWS/GCP
- Test automatic backups
- Verify cross-device sync
- Monitor cloud costs

### 10. AdMob Integration 💰 (NEW)
**What it does:**
- Banner ads (bottom of screen)
- Interstitial ads (between screens, max 1 per 5 min)
- Rewarded ads (optional, unlock features)
- GDPR compliant

**Dogfooding:**
- Use free version with ads
- Test ad frequency and placement
- Verify ads don't disrupt UX
- Measure revenue

### 11. Paid Version 💎 (NEW)
**What it does:**
- $4.99 one-time purchase
- No ads
- Unlimited cloud storage
- Priority support

**Dogfooding:**
- Test In-App Purchase flow
- Verify premium features unlock
- Compare free vs paid experience

---

## Updated Timeline

### Month 1 (Feb 2026)
- Week 1-2: Finish security fixes + Brain
- Week 3: Build Places
- Week 4: Start dogfooding

### Month 2 (Mar 2026)
- Week 1: Control Tower
- Week 2: Security Dashboard
- Week 3: AdMob integration
- Week 4: Beta testing

### Month 3 (Apr 2026)
- Week 1-2: Cloud Setup Wizard
- Week 3: Paid version
- Week 4: App Store prep

### May 2026
- 🎉 **Japan trip = ultimate dogfooding test**

