# Mobileclaw - New Features Roadmap

**Date:** 2026-02-07 17:33 MST  
**Status:** Feature specifications  

---

## 🆕 New Features to Add

### 1. Control Tower (AI Agent Monitor) 🎛️
**Priority:** HIGH  
**Complexity:** Medium  
**ETA:** 2 weeks  

**What it is:**
Mobile version of the Control Tower dashboard (https://swordtruth-control-tower.netlify.app)

**Features:**
- **Session Monitor:** Track active AI agent sessions
  - Session count
  - Active/idle status
  - Session duration
  - Token usage per session
  
- **Message Stream:** Real-time activity feed
  - Agent messages
  - Tool calls
  - Errors/warnings
  - Timestamps
  
- **Token Usage:** Monitor API consumption
  - Total tokens used
  - Cost estimates
  - Usage by session
  - Daily/weekly graphs
  
- **Agent Status:** Health monitoring
  - Active agents
  - Response times
  - Error rates
  - Uptime tracking

**Mobile UI:**
```
┌────────────────────────────────────┐
│  🎛️ Control Tower            ⚙️   │
├────────────────────────────────────┤
│  Status: ● Active               📊 │
│  Sessions: 3 • Tokens: 45.2K       │
├────────────────────────────────────┤
│  Quick Stats:                      │
│  ┌────────┐ ┌────────┐ ┌────────┐│
│  │ 3      │ │ 12     │ │ 98.5%  ││
│  │Sessions│ │Messages│ │Uptime  ││
│  └────────┘ └────────┘ └────────┘│
├────────────────────────────────────┤
│  Recent Activity:                  │
│  • 17:32 - Agent completed task    │
│  • 17:31 - API call: Places        │
│  • 17:30 - Session started         │
│  • 17:29 - Token usage: 1.2K       │
└────────────────────────────────────┘
```

**Tech:**
- WebSocket connection to OpenClaw Gateway
- Real-time updates
- Local caching for offline viewing
- Push notifications for errors

---

### 2. Security & Privacy Dashboard 🔒
**Priority:** HIGH  
**Complexity:** Medium  
**ETA:** 1 week  

**What it is:**
Security settings and privacy controls

**Features:**
- **Vault Security:**
  - Auto-lock timeout (1/5/15/30 min)
  - Biometric toggle (FaceID/TouchID)
  - Password strength meter
  - Change master password
  
- **Network Security:**
  - HTTPS only toggle
  - Certificate pinning
  - VPN detection
  - Proxy settings
  
- **Data Privacy:**
  - Clear cache
  - Export all data
  - Delete all data
  - Activity log
  
- **Session Security:**
  - Active sessions list
  - Force logout all
  - Session timeout
  - Device trust list

**Mobile UI:**
```
┌────────────────────────────────────┐
│  🔒 Security & Privacy        ✕    │
├────────────────────────────────────┤
│  Vault Settings:                   │
│  Auto-lock: [5 minutes ▼]         │
│  Biometric unlock: [● On]          │
│  Password strength: ████████░░ 8/10│
│  [Change Password]                 │
├────────────────────────────────────┤
│  Network Security:                 │
│  HTTPS only: [● On]                │
│  Certificate pinning: [● On]       │
├────────────────────────────────────┤
│  Privacy:                          │
│  [Clear Cache] [Export Data]       │
│  [Delete All Data]                 │
├────────────────────────────────────┤
│  Active Sessions: 2                │
│  • iPhone 14 Pro (this device)     │
│  • iPad Air (last active 2h ago)   │
│  [Force Logout All Devices]        │
└────────────────────────────────────┘
```

---

### 3. OpenClaw Setup Wizard 🚀
**Priority:** MEDIUM  
**Complexity:** High  
**ETA:** 3 weeks  

**What it is:**
Guided setup for connecting Mobileclaw to cloud providers

**Providers:**
1. **AWS (Amazon Web Services)**
   - S3 bucket for backups
   - DynamoDB for sync
   - Lambda for serverless functions
   - API Gateway for endpoints
   
2. **Google Cloud Platform**
   - Cloud Storage for backups
   - Firestore for sync
   - Cloud Functions
   - Cloud Run containers

**Setup Flow:**
```
Step 1: Choose Provider
┌────────────────────────────────────┐
│  Setup Cloud Sync                  │
│                                    │
│  Choose your cloud provider:       │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  ☁️ AWS                      │ │
│  │  Reliable, scalable          │ │
│  │  [Select]                    │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  ☁️ Google Cloud             │ │
│  │  Fast, integrated            │ │
│  │  [Select]                    │ │
│  └──────────────────────────────┘ │
│                                    │
│  [Skip Setup] [Continue]           │
└────────────────────────────────────┘

Step 2: Enter Credentials
┌────────────────────────────────────┐
│  AWS Credentials                   │
│                                    │
│  Access Key ID:                    │
│  [AKIA...]                         │
│                                    │
│  Secret Access Key:                │
│  [••••••••••••]                    │
│                                    │
│  Region: [us-east-1 ▼]            │
│                                    │
│  [Test Connection]                 │
│  [Back] [Continue]                 │
└────────────────────────────────────┘

Step 3: Configure Services
┌────────────────────────────────────┐
│  Select Services to Enable         │
│                                    │
│  [✓] Automatic backups             │
│      Daily at 3:00 AM              │
│                                    │
│  [✓] Cross-device sync             │
│      Real-time sync via WebSocket  │
│                                    │
│  [✓] Cloud storage                 │
│      Store encrypted vault in S3   │
│                                    │
│  [ ] Serverless functions          │
│      Run background tasks          │
│                                    │
│  [Back] [Finish Setup]             │
└────────────────────────────────────┘
```

**Features:**
- Step-by-step wizard
- Credential validation
- Service selection
- Test connection
- Rollback on failure
- Save config to vault (encrypted)

---

### 4. Google AdMob Integration 💰
**Priority:** MEDIUM  
**Complexity:** Low  
**ETA:** 1 week  

**What it is:**
Monetization via Google AdMob ads

**Ad Types:**
1. **Banner Ads** (bottom of screen)
   - Non-intrusive
   - Always visible
   - Auto-refresh every 60s
   
2. **Interstitial Ads** (full-screen)
   - Between screens
   - Max 1 per 5 minutes
   - Skippable after 5s
   
3. **Rewarded Ads** (optional)
   - User watches for benefits
   - Unlock premium features temporarily
   - Extra cloud storage

**Implementation:**
```typescript
// React Native
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

// Banner ad component
<BannerAd
  unitId={__DEV__ ? TestIds.BANNER : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'}
  size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
  requestOptions={{
    requestNonPersonalizedAdsOnly: true,  // GDPR compliant
  }}
/>
```

**User Experience:**
- **Free version:** Shows ads
- **Paid version:** No ads ($4.99 one-time)
- **Frequency cap:** Max 1 interstitial per 5 min
- **Respect user:** No ads during critical actions (vault unlock, trip navigation)

**Revenue Projections:**
- 1,000 DAU × $0.50 CPM × 10 impressions/day = $5/day = $150/month
- 10,000 DAU = $1,500/month
- Paid users: 5% conversion × 10,000 users × $4.99 = $2,495

---

### 5. Paid App (iOS & Android) 💎
**Priority:** MEDIUM  
**Complexity:** Low  
**ETA:** 3 days  

**What it is:**
Premium paid version without ads

**Pricing Strategy:**
```
Free Version (Ad-supported):
- All core features
- Banner ads (bottom)
- Interstitial ads (between screens)
- Limited cloud storage (100MB)

Paid Version ($4.99 one-time):
- No ads
- Unlimited cloud storage
- Priority support
- Early access to features
- Lifetime updates
```

**In-App Purchase (Alternative):**
```
Free app with IAP:
- Download free
- Use with ads
- Upgrade to Pro via IAP ($4.99)
- Unlock: ad-free, unlimited storage, premium features
```

**Implementation:**
```typescript
// React Native IAP
import * as IAP from 'react-native-iap';

const products = ['mobileclaw_pro_lifetime'];

// Purchase flow
const purchase = await IAP.requestPurchase({
  sku: 'mobileclaw_pro_lifetime',
  andDangerouslyFinishTransactionAutomaticallyIOS: false,
});

// Verify purchase on backend
const verified = await verifyPurchase(purchase);
if (verified) {
  unlockProFeatures();
}
```

**App Store Strategy:**
- **iOS:** Submit to App Store Connect
- **Android:** Submit to Google Play Console
- Both: Screenshots, description, privacy policy
- Categories: Productivity, Travel, Utilities
- Keywords: AI assistant, trip planner, task board, vault

---

## 📋 Updated Feature List

### Core Features (Phase 1)
1. ✅ **Task Board** - Task management
2. 🔨 **Brain** - Skills + ideas + memory (building)
3. 🔨 **Places** - Trip planning (building)
4. 🔨 **Vault** - Encrypted storage (needs security fixes)
5. ✅ **Scanner** - OCR (built)
6. ✅ **Settings** - Preferences (built)

### New Features (Phase 2)
7. 🆕 **Control Tower** - AI agent monitoring
8. 🆕 **Security Dashboard** - Privacy controls
9. 🆕 **Cloud Setup Wizard** - AWS/GCP integration
10. 🆕 **AdMob** - Monetization
11. 🆕 **Paid Version** - Premium offering

---

## 🗓️ Implementation Timeline

### Month 1 (Feb 2026)
- Week 1: Finish security fixes (Vault)
- Week 2: Build Brain features
- Week 3: Build Places (port from web)
- Week 4: Start using (dogfooding begins)

### Month 2 (Mar 2026)
- Week 1: Control Tower integration
- Week 2: Security Dashboard
- Week 3: AdMob integration
- Week 4: Polish for beta

### Month 3 (Apr 2026)
- Week 1-2: Cloud Setup Wizard (AWS + GCP)
- Week 3: Paid version setup
- Week 4: App Store submission prep

### Month 4 (May 2026)
- TestFlight (iOS) + Internal Testing (Android)
- Public beta
- **Japan trip = dogfooding test** 🎉

---

## 💰 Monetization Strategy

### Free Tier (Ad-supported)
- All core features
- Banner + interstitial ads
- 100MB cloud storage
- Target: 90% of users

### Paid Version ($4.99)
- No ads
- Unlimited cloud storage
- Priority support
- Early features
- Target: 10% of users

### Revenue Model
```
10,000 users:
- 9,000 free (ads): $1,500/month
- 1,000 paid ($4.99): $4,990 one-time = $500/month amortized

Total: ~$2,000/month after user base established
```

---

## 🔐 Privacy & Security

**Data Collection (minimal):**
- Anonymous usage stats (opt-in)
- Crash reports (opt-in)
- No PII without consent

**GDPR/CCPA Compliant:**
- User can export all data
- User can delete all data
- Clear privacy policy
- Cookie consent (web)

**Ad Privacy:**
- Non-personalized ads by default
- User can opt into personalized (higher revenue)
- Clear ad choices in settings

---

## 📱 App Store Listing

### iOS (App Store)
**Title:** Mobileclaw - AI Assistant  
**Subtitle:** Task Board, Places, Secure Vault  
**Description:**
```
Your personal AI assistant in your pocket.

Features:
• Task board for task management
• Places: Trip planning with maps
• Brain: Skills repository and ideas
• Vault: Encrypted storage for API keys
• Scanner: OCR for receipts and documents
• Control Tower: Monitor AI agents

Built for privacy. Your data stays yours.

Free with ads, or upgrade to Pro for $4.99.
```

**Keywords:** AI assistant, task board, trip planner, vault, productivity, travel, maps, OCR, secure

**Category:** Productivity  
**Price:** Free (with IAP) or $4.99  

### Android (Google Play)
Same listing, adjust for Google Play formatting.

---

## 🎯 Success Metrics

**Phase 1 (Beta):**
- 100 TestFlight users
- 50 active daily users
- <5% crash rate
- ≥4.5 stars in reviews

**Phase 2 (Launch):**
- 1,000 downloads (month 1)
- 10,000 downloads (month 3)
- 5-10% paid conversion
- $500/month revenue (month 3)

**Phase 3 (Growth):**
- 50,000 users (year 1)
- $2,000/month revenue
- 4.7+ star rating
- Featured in App Store (goal)

---

**Created:** 2026-02-07 17:33 MST  
**Status:** Specification complete  
**Next:** Add to task board, prioritize implementation
