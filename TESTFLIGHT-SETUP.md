# Mobileclaw Test Flight Beta Program

**Created:** 2026-02-27  
**Goal:** Get 5-10 beta testers for real-world dogfooding before public launch  
**Platforms:** iOS (Test Flight) + Android (Google Play Internal Testing)

---

## iOS Test Flight Setup

### Prerequisites
- [ ] Apple Developer Account ($99/year) - brianference@protonmail.com
- [ ] Xcode installed (if building locally)
- [ ] EAS CLI: `npm install -g eas-cli`
- [ ] Logged into Expo: `eas login`

### Step 1: Configure EAS Build

```bash
cd /root/.openclaw/workspace/projects/mobileclaw

# Initialize EAS
eas build:configure

# Create eas.json if it doesn't exist
```

**eas.json configuration:**
```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "distribution": "store",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    },
    "beta": {
      "distribution": "internal",
      "ios": {
        "buildConfiguration": "Release"
      },
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Step 2: Build for Test Flight

```bash
# Build iOS beta
eas build --platform ios --profile beta

# This will:
# - Create IPA file
# - Upload to Expo servers
# - Provide download link
```

### Step 3: Upload to App Store Connect

**Option A: Automated (Recommended)**
```bash
eas submit --platform ios --latest
```

**Option B: Manual**
1. Download IPA from Expo build page
2. Open Transporter app (Mac)
3. Drag IPA file
4. Upload to App Store Connect

### Step 4: Configure Test Flight

1. Go to https://appstoreconnect.apple.com
2. Navigate to **My Apps** → **OpenClaw Mobile** → **TestFlight**
3. Select the uploaded build
4. Fill in:
   - **What to Test:** "Beta version - testing vault security, messaging, and cloud sync"
   - **Test Information:** Bug reporting instructions
5. Add Internal Testers:
   - Click **Internal Testing** → **+** → Add email addresses
   - **Suggested testers:**
     - brianference@protonmail.com (Brian)
     - lena.ference@example.com (Lena - if she wants to test)
     - Add 3-5 more trusted users
6. Submit for Beta Review (usually 24-48 hours)

### Step 5: Invite External Testers (After Internal Testing)

1. Go to **External Testing** tab
2. Create test group: "Early Adopters"
3. Add up to 10,000 testers
4. Invite via email or public link
5. External testers will receive Test Flight invitation

---

## Android Google Play Internal Testing

### Step 1: Create Google Play Developer Account
- Cost: $25 one-time fee
- Account: brianference@protonmail.com
- Link: https://play.google.com/console

### Step 2: Build Android APK/AAB

```bash
# Build Android beta (AAB for Play Store)
eas build --platform android --profile beta

# Or build APK for direct distribution
eas build --platform android --profile beta --non-interactive
```

### Step 3: Create App in Play Console

1. Go to https://play.google.com/console
2. Click **Create app**
3. Fill in:
   - **App name:** OpenClaw Mobile
   - **Default language:** English (US)
   - **App or game:** App
   - **Free or paid:** Free (with in-app purchases for premium)
4. Complete Store Listing:
   - Short description
   - Full description
   - Screenshots (use expo-screenshots or manual)
   - Feature graphic
   - Icon

### Step 4: Set Up Internal Testing

1. Navigate to **Testing** → **Internal testing**
2. Click **Create new release**
3. Upload AAB file from EAS build
4. Fill in:
   - **Release name:** v1.0.0-beta.1
   - **Release notes:** "Initial beta - testing vault, messaging, cloud sync"
5. Add testers:
   - Create email list (CSV or manual)
   - Add Brian + 5-10 testers
6. **Save** → **Review release** → **Start rollout to Internal testing**

### Step 5: Distribute to Testers

**Option A: Email List**
- Upload CSV with tester emails
- Google sends invitation automatically
- Testers install via Play Store (Internal testing track)

**Option B: Share Link**
- Get internal testing link from Play Console
- Share directly with testers
- They join testing program and install

---

## Beta Testing Documentation

### For Testers: Installation Guide

**iOS (Test Flight):**
1. Install Test Flight app from App Store
2. Check email for Test Flight invitation
3. Tap "View in TestFlight"
4. Install OpenClaw Mobile
5. Launch and start testing

**Android (Internal Testing):**
1. Open invitation email
2. Tap "Become a tester"
3. Go to Play Store
4. Download OpenClaw Mobile (Internal test version)
5. Launch and start testing

### Feedback Collection

**In-App Feedback:**
- Add feedback button in app (Settings → Send Feedback)
- Use Expo's crash reporting: `expo install expo-error-recovery`

**External Channels:**
- Create private Telegram group: "Mobileclaw Beta Testers"
- Google Form for structured feedback
- GitHub Issues (private repo for beta feedback)

**What to Test:**
1. **Vault Security:**
   - Create vault, set password
   - Add secrets (API keys, notes)
   - Lock/unlock with Face ID/Touch ID
   - Verify encryption works

2. **Messaging:**
   - Send message to OpenClaw
   - Receive response
   - Test file attachments
   - Voice messages (if implemented)

3. **Cloud Sync:**
   - Enable cloud backup
   - Verify sync to S3/DynamoDB
   - Test restore on new device
   - Check conflict resolution

4. **Performance:**
   - App launch time
   - Smooth scrolling
   - Battery usage
   - Network reliability

5. **UX Issues:**
   - Confusing flows
   - Missing features
   - Design inconsistencies
   - Accessibility problems

---

## Beta Release Checklist

### Before First Beta:
- [ ] All core features working
- [ ] No critical bugs
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] Crash reporting configured
- [ ] Analytics set up (optional, privacy-respecting)
- [ ] Build tested on both iOS and Android
- [ ] Beta tester instructions written

### Each Beta Release:
- [ ] Version number incremented
- [ ] Changelog written
- [ ] Build uploaded (iOS + Android)
- [ ] Release notes sent to testers
- [ ] Monitor crash reports
- [ ] Respond to feedback within 48 hours

### Before Public Launch:
- [ ] At least 20 hours of beta testing
- [ ] All critical bugs fixed
- [ ] 90%+ positive feedback
- [ ] Privacy audit completed
- [ ] App Store assets finalized
- [ ] Marketing plan ready

---

## Automation Scripts

### Auto-Build and Upload

**`beta-deploy.sh`:**
```bash
#!/bin/bash
# Automated beta deployment for iOS and Android

set -e

echo "🚀 Starting beta deployment..."

# Increment version
npm version patch --no-git-tag-version

# Build iOS
echo "📱 Building iOS..."
eas build --platform ios --profile beta --non-interactive

# Build Android
echo "🤖 Building Android..."
eas build --platform android --profile beta --non-interactive

# Submit to Test Flight (if configured)
# eas submit --platform ios --latest --non-interactive

echo "✅ Beta builds complete!"
echo "📋 Next steps:"
echo "  1. Check Expo dashboard for build status"
echo "  2. Download and test locally"
echo "  3. Upload to Test Flight / Play Console"
echo "  4. Send update to beta testers"
```

### Tester Invitation Template

**`beta-invite-email.md`:**
```markdown
Subject: You're invited to test OpenClaw Mobile (Beta)

Hi [Name],

You've been selected to beta test OpenClaw Mobile before it launches publicly!

**What is OpenClaw Mobile?**
Your secure AI assistant on iOS and Android. Features include:
- Encrypted vault for API keys and secrets
- Direct messaging with your OpenClaw agent
- Cloud sync across devices
- [Premium features for paid version]

**How to join:**

iOS (iPhone/iPad):
1. Install TestFlight from the App Store
2. Tap this link: [TestFlight Invitation Link]
3. Install OpenClaw Mobile
4. Start testing!

Android:
1. Tap this link: [Play Store Internal Testing Link]
2. Accept invitation
3. Install from Play Store
4. Start testing!

**We need your feedback on:**
- Security and vault features
- App performance
- UX and design
- Any bugs or issues

**Join our beta testers group:**
Telegram: [Private Beta Group Link]

**Questions?**
Reply to this email or message in the Telegram group.

Thanks for helping make OpenClaw Mobile better!

Brian & the OpenClaw team
```

---

## Timeline

**Week 1 (Setup):**
- Day 1-2: Configure EAS, create accounts
- Day 3-4: First builds (iOS + Android)
- Day 5: Test locally, fix critical bugs
- Day 6-7: Upload to Test Flight / Play Console

**Week 2 (Internal Testing):**
- Day 1: Invite 2-3 internal testers (Brian, Lena, close contacts)
- Day 2-7: Collect feedback, fix bugs, iterate

**Week 3-4 (External Beta):**
- Day 1: Expand to 10 external testers
- Day 2-14: Monitor usage, gather feedback, ship updates

**Week 5 (Pre-Launch):**
- Final bug fixes
- Polish UI/UX
- Prepare marketing assets
- Submit for App Store/Play Store review

**Week 6 (Launch):**
- Public release 🚀

---

## Beta Tester Roster

| Name | Email | Platform | Role | Invited | Installed | Active |
|------|-------|----------|------|---------|-----------|--------|
| Brian | brianference@protonmail.com | iOS + Android | Owner | - | - | - |
| Lena | lena.ference@example.com | iOS | Family | - | - | - |
| TBD | - | iOS | Early Adopter | - | - | - |
| TBD | - | Android | Early Adopter | - | - | - |
| TBD | - | iOS | Early Adopter | - | - | - |

---

## Success Metrics

**Target Goals:**
- 5-10 active beta testers
- 20+ hours of cumulative testing
- 10+ pieces of actionable feedback
- <5 critical bugs found
- 85%+ positive sentiment

**Red Flags:**
- Multiple testers reporting same crash
- Security vulnerability discovered
- Poor performance on common devices
- Negative sentiment from majority

---

## Next Steps

1. **Set up Apple Developer Account** (if not done)
2. **Set up Google Play Developer Account** ($25)
3. **Run first EAS build:** `eas build --platform all --profile beta`
4. **Create beta-deploy.sh** script
5. **Invite first 3 internal testers**
6. **Monitor feedback for 1 week**
7. **Iterate and expand to 10 testers**

**Quick Start:**
```bash
cd /root/.openclaw/workspace/projects/mobileclaw
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile beta
eas build --platform android --profile beta
```

---

**Status:** ⏸️ Ready to start (pending account setup)  
**Owner:** Brian  
**Updated:** 2026-02-27
