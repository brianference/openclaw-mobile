# MobileClaw Cloud Setup Wizard — Design Specification

**Version:** 1.0  
**Created:** February 20, 2026  
**Task:** US-025  
**Designer:** Cole (AI Agent)

---

## Executive Summary

A **6-step guided wizard** that walks non-technical users through setting up cloud storage (AWS S3 or Google Cloud Storage) for MobileClaw vault backup. Mobile-first design with clear progress indicators, validation, and helpful error messages.

---

## Design Principles

1. **Non-Technical First** — Assume zero cloud knowledge
2. **Show, Don't Tell** — Screenshots, icons, visual cues over walls of text
3. **Fail Gracefully** — Clear error messages with fixes, not error codes
4. **One Thing Per Step** — Never ask for 5 inputs on one screen
5. **Mobile Optimized** — Large touch targets, vertical scrolling, thumb-friendly

---

## Wizard Flow (6 Steps)

```
┌─────────────────────────────────────────────────────┐
│ Step 1: Choose Cloud Provider                      │
│ ├─ AWS (recommended)                                │
│ └─ Google Cloud                                     │
└─────────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────┐
│ Step 2: Create Account (if needed)                 │
│ ├─ Link to AWS/GCP signup                          │
│ ├─ "Already have account" skip button              │
│ └─ Video walkthrough embedded                      │
└─────────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────┐
│ Step 3: Get Credentials                            │
│ ├─ AWS: Access Key ID + Secret Access Key          │
│ ├─ GCP: Service Account JSON key                   │
│ └─ Step-by-step screenshots for each               │
└─────────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────┐
│ Step 4: Configure Bucket/Storage                   │
│ ├─ Auto-create bucket (recommended)                │
│ ├─ Or use existing bucket                          │
│ └─ Bucket naming rules explained                   │
└─────────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────┐
│ Step 5: Test Connection                            │
│ ├─ Upload test file                                │
│ ├─ Download test file                              │
│ └─ Show success/error with troubleshooting         │
└─────────────────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────────────────┐
│ Step 6: Enable Auto-Backup                         │
│ ├─ Choose backup schedule (daily/weekly)           │
│ ├─ Enable/disable WiFi-only uploads                │
│ └─ Done! Show summary + next steps                 │
└─────────────────────────────────────────────────────┘
```

---

## Step-by-Step Mockups

### Step 1: Choose Cloud Provider

**Layout:**
```
┌──────────────────────────────────────────┐
│  Cloud Storage Setup                     │
│  ═══════════════════════                 │
│                                           │
│  Step 1 of 6: Choose Your Cloud Provider │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ 🪣 AWS S3                            │ │
│  │ ✅ Recommended                       │ │
│  │ Free tier: 5GB storage               │ │
│  │ $0.023/GB after free tier            │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ ☁️ Google Cloud Storage              │ │
│  │ Free tier: 5GB storage               │ │
│  │ $0.020/GB after free tier            │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  💡 Why cloud backup?                    │
│  • Access your vault from any device     │
│  • Automatic sync across phones/tablets  │
│  • Never lose data (even if phone lost)  │
│                                           │
│  [Next]                                   │
│                                           │
│  Progress: ●○○○○○                        │
└──────────────────────────────────────────┘
```

**Touch Targets:**
- Each provider card: 320px wide × 120px tall (easy tap)
- Next button: 100% width, 56px tall
- Cards highlight on tap (blue border)

**Interactions:**
- Tap provider card → check mark appears → Next button enables
- Next → advances to Step 2

---

### Step 2: Create Account

**Layout (if user needs account):**
```
┌──────────────────────────────────────────┐
│  Cloud Storage Setup                     │
│  ═══════════════════════                 │
│                                           │
│  Step 2 of 6: Create AWS Account         │
│                                           │
│  📺 Watch this 2-minute video:           │
│  ┌─────────────────────────────────────┐ │
│  │                                      │ │
│  │   [▶️ Play Video]                    │ │
│  │   "How to sign up for AWS"          │ │
│  │                                      │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  📋 Quick Steps:                         │
│  1. Go to aws.amazon.com                 │
│  2. Click "Create Free Account"          │
│  3. Enter email + password               │
│  4. Verify email                         │
│  5. Add payment method (for ID only)     │
│                                           │
│  ✅ Already have an AWS account?         │
│  [Skip to Next Step]                     │
│                                           │
│  [Open AWS Signup Page]  [Next]          │
│                                           │
│  Progress: ●●○○○○                        │
└──────────────────────────────────────────┘
```

**Interactions:**
- "Skip to Next Step" button → jump to Step 3
- "Open AWS Signup Page" → opens aws.amazon.com in browser
- Next → advances to Step 3

---

### Step 3: Get Credentials (AWS)

**Layout:**
```
┌──────────────────────────────────────────┐
│  Cloud Storage Setup                     │
│  ═══════════════════════                 │
│                                           │
│  Step 3 of 6: Get AWS Credentials        │
│                                           │
│  Follow these steps in your AWS console: │
│                                           │
│  1️⃣ Open IAM → Users → Create User      │
│  ┌─────────────────────────────────────┐ │
│  │ [Screenshot: IAM Users page]         │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  2️⃣ Attach "AmazonS3FullAccess" policy  │
│  ┌─────────────────────────────────────┐ │
│  │ [Screenshot: Attach policy screen]   │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  3️⃣ Create Access Key                   │
│  ┌─────────────────────────────────────┐ │
│  │ [Screenshot: Access key created]     │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  4️⃣ Copy your keys and paste below:     │
│                                           │
│  Access Key ID:                          │
│  ┌─────────────────────────────────────┐ │
│  │ AKIA...                              │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  Secret Access Key:                      │
│  ┌─────────────────────────────────────┐ │
│  │ ••••••••••••••••                     │ │
│  │ [👁️ Show]                            │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  🔒 Your keys are encrypted locally      │
│  and never sent to MobileClaw servers.   │
│                                           │
│  [Back]  [Next]                          │
│                                           │
│  Progress: ●●●○○○                        │
└──────────────────────────────────────────┘
```

**Validation:**
- Access Key ID: Must start with "AKIA" (20 chars)
- Secret Access Key: 40 characters
- Show eye icon to toggle secret visibility
- "Next" disabled until both fields valid

---

### Step 4: Configure Bucket

**Layout:**
```
┌──────────────────────────────────────────┐
│  Cloud Storage Setup                     │
│  ═══════════════════════                 │
│                                           │
│  Step 4 of 6: Create Storage Bucket      │
│                                           │
│  Choose how to set up your S3 bucket:    │
│                                           │
│  ○ Auto-create bucket (Recommended)      │
│    We'll create a bucket for you         │
│    Name: mobileclaw-backup-abc123        │
│                                           │
│  ○ Use existing bucket                   │
│    Choose from your S3 buckets:          │
│    ┌─────────────────────────────────────┐ │
│    │ [Dropdown: Select bucket...]        │ │
│    └─────────────────────────────────────┘ │
│                                           │
│  Region (for auto-create):               │
│  ┌─────────────────────────────────────┐ │
│  │ US East (N. Virginia) - us-east-1    │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  💡 Bucket Naming Rules:                 │
│  • 3-63 characters                       │
│  • Lowercase letters, numbers, hyphens   │
│  • Must be globally unique               │
│                                           │
│  [Back]  [Next]                          │
│                                           │
│  Progress: ●●●●○○                        │
└──────────────────────────────────────────┘
```

**Smart Defaults:**
- Auto-create is pre-selected
- Bucket name: `mobileclaw-backup-{random-6-chars}`
- Region: nearest to user's location (via IP geolocation)

**Interactions:**
- If "Use existing" selected → fetch buckets via AWS API
- Next → creates bucket (if auto-create) or validates existing

---

### Step 5: Test Connection

**Layout (Testing):**
```
┌──────────────────────────────────────────┐
│  Cloud Storage Setup                     │
│  ═══════════════════════                 │
│                                           │
│  Step 5 of 6: Testing Connection         │
│                                           │
│  Please wait while we verify setup...    │
│                                           │
│  ✅ Connect to AWS                       │
│  ⏳ Upload test file (1KB)               │
│  ⏳ Download test file                   │
│  ⏳ Verify encryption                    │
│  ⏳ Check permissions                    │
│                                           │
│  [Animated spinner]                      │
│                                           │
│  Progress: ●●●●●○                        │
└──────────────────────────────────────────┘
```

**Layout (Success):**
```
┌──────────────────────────────────────────┐
│  Cloud Storage Setup                     │
│  ═══════════════════════                 │
│                                           │
│  Step 5 of 6: Connection Successful! ✅  │
│                                           │
│  All tests passed:                       │
│                                           │
│  ✅ Connected to AWS                     │
│  ✅ Uploaded test file (1KB)             │
│  ✅ Downloaded test file                 │
│  ✅ Encryption verified (AES-256)        │
│  ✅ Permissions correct (read/write)     │
│                                           │
│  🎉 Your cloud storage is ready!         │
│                                           │
│  [Back]  [Next]                          │
│                                           │
│  Progress: ●●●●●○                        │
└──────────────────────────────────────────┘
```

**Layout (Error):**
```
┌──────────────────────────────────────────┐
│  Cloud Storage Setup                     │
│  ═══════════════════════                 │
│                                           │
│  Step 5 of 6: Connection Failed ❌       │
│                                           │
│  ✅ Connect to AWS                       │
│  ✅ Upload test file (1KB)               │
│  ❌ Download test file                   │
│     Error: AccessDenied                  │
│                                           │
│  🔧 How to fix:                          │
│  1. Go to AWS IAM console                │
│  2. Find your user (mobileclaw-user)     │
│  3. Check attached policies              │
│  4. Ensure "AmazonS3FullAccess" is there │
│                                           │
│  [Copy Error Details]                    │
│  [Watch Fix Tutorial Video]              │
│  [Try Again]  [Back]                     │
│                                           │
│  Progress: ●●●●●○                        │
└──────────────────────────────────────────┘
```

**Error Handling:**
- Show exact error + plain-English fix
- "Copy Error Details" → clipboard (for support)
- "Try Again" → re-runs tests
- Common errors mapped to fixes (e.g., InvalidAccessKeyId → "Check if you copied the full key")

---

### Step 6: Enable Auto-Backup

**Layout:**
```
┌──────────────────────────────────────────┐
│  Cloud Storage Setup                     │
│  ═══════════════════════                 │
│                                           │
│  Step 6 of 6: Enable Auto-Backup         │
│                                           │
│  Your cloud storage is connected! ✅     │
│  Now configure automatic backups:        │
│                                           │
│  Backup Schedule:                        │
│  ┌─────────────────────────────────────┐ │
│  │ ○ Daily (at 2:00 AM)                 │ │
│  │ ● Weekly (every Sunday at 2:00 AM)   │ │
│  │ ○ Manual only (no auto-backup)       │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  Upload Settings:                        │
│  ☑️ WiFi only (save mobile data)         │
│  ☑️ Encrypt before upload (AES-256)      │
│  ☐ Delete local backup after upload     │
│                                           │
│  Estimated Storage:                      │
│  Current vault size: 24 MB               │
│  Monthly growth: ~5 MB                   │
│  1 year storage: ~84 MB (~$0.002/month)  │
│                                           │
│  [Finish Setup]                          │
│                                           │
│  Progress: ●●●●●●                        │
└──────────────────────────────────────────┘
```

**Smart Defaults:**
- Weekly backup (balance frequency vs API calls)
- WiFi-only: ON (save user's data plan)
- Encryption: ON (always)
- Delete local: OFF (keep local copy for offline access)

**Interactions:**
- "Finish Setup" → saves config, shows success screen

---

### Success Screen (After Step 6)

**Layout:**
```
┌──────────────────────────────────────────┐
│  🎉 Cloud Backup Enabled!                │
│                                           │
│  Your MobileClaw vault is now backed up  │
│  to the cloud automatically.             │
│                                           │
│  ✅ Next backup: Sunday, Feb 23, 2:00 AM │
│  ✅ Encrypted with AES-256               │
│  ✅ WiFi-only uploads                    │
│                                           │
│  What's next?                            │
│  • View backup history in Settings       │
│  • Restore from backup anytime           │
│  • Change backup schedule                │
│                                           │
│  [View Settings]  [Done]                 │
└──────────────────────────────────────────┘
```

---

## Visual Design System

### Colors
```css
--primary: #0066FF       /* Buttons, progress dots */
--success: #00C853       /* Success states, checkmarks */
--error: #FF3B30         /* Error states, warnings */
--warning: #FF9500       /* Caution states */
--background: #FFFFFF    /* Card backgrounds */
--surface: #F5F5F5       /* Step backgrounds */
--text-primary: #000000  /* Headings */
--text-secondary: #666666 /* Descriptions */
--border: #E0E0E0        /* Card borders */
```

### Typography
```css
h1 (Step title): 24px, Bold, text-primary
h2 (Section): 18px, Semibold, text-primary
body: 16px, Regular, text-secondary
label: 14px, Medium, text-primary
caption: 12px, Regular, text-secondary
button: 16px, Semibold, primary (on buttons)
```

### Spacing
```css
--spacing-xs: 8px
--spacing-sm: 12px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
```

### Components

**Progress Indicator:**
```
●●●○○○   (filled = completed, empty = upcoming)
12px diameter dots, 8px spacing
```

**Input Field:**
```
┌──────────────────────────────────┐
│ Label (14px, Medium)              │
│ ┌────────────────────────────────┐ │
│ │ Input value...                 │ │
│ └────────────────────────────────┘ │
│ Helper text (12px, text-secondary)│
└──────────────────────────────────┘

Height: 56px (44px input + 12px label)
Border: 1px solid --border
Focus: 2px solid --primary
Error: 2px solid --error (with shake animation)
```

**Button (Primary):**
```
[        Next        ]

Height: 56px
Width: 100%
Border-radius: 12px
Background: --primary
Text: white, 16px Semibold
Tap feedback: darken 10%, scale 0.98
```

**Card (Provider selection):**
```
┌────────────────────────────────┐
│ 🪣 AWS S3                       │
│ ✅ Recommended                  │
│ Free tier: 5GB storage          │
│ $0.023/GB after free tier       │
└────────────────────────────────┘

Height: 120px
Border: 2px solid --border
Selected: 2px solid --primary
Border-radius: 12px
Padding: 16px
```

---

## Accessibility (WCAG 2.1 AA)

### Touch Targets
- Minimum 44×44px (WCAG 2.5.5)
- Buttons: 56px tall
- Cards: 120px tall (easy tap anywhere)

### Contrast
- Text on white: 4.5:1 minimum
- Primary button (blue bg, white text): 7:1
- Error text (#FF3B30 on white): 4.52:1 ✅

### Screen Reader
- Progress: "Step 3 of 6: Get AWS Credentials"
- Buttons: "Next button, advances to step 4"
- Input errors: "Invalid Access Key. Must start with AKIA."

### Keyboard Navigation (iPad/Bluetooth keyboard)
- Tab through inputs
- Enter to submit
- Escape to go back

---

## Technical Implementation Notes

### Data Flow
```
User inputs → Validate → Store in SecureStore (encrypted) → Test connection → Enable auto-backup cron
```

### Validation
```javascript
// Access Key ID
const isValidAccessKey = (key) => /^AKIA[0-9A-Z]{16}$/.test(key);

// Secret Access Key
const isValidSecretKey = (key) => key.length === 40;

// Bucket name
const isValidBucketName = (name) => /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(name);
```

### Error Messages (User-Friendly)
```javascript
const errorMessages = {
  InvalidAccessKeyId: "The Access Key ID you entered doesn't exist. Double-check you copied it correctly from AWS.",
  SignatureDoesNotMatch: "The Secret Access Key is incorrect. Make sure you copied the entire key (40 characters).",
  AccessDenied: "Your AWS user doesn't have permission to access S3. Attach the 'AmazonS3FullAccess' policy.",
  NoSuchBucket: "This bucket doesn't exist. Check the spelling or choose 'Auto-create bucket'.",
  NetworkError: "Can't connect to AWS. Check your internet connection and try again."
};
```

### Test Connection Steps
```javascript
async function testConnection(credentials, bucketName) {
  const results = [];
  
  // 1. Connect to AWS
  results.push(await testAWSConnection(credentials));
  
  // 2. Upload test file
  const testFile = new Blob(['MobileClaw test'], {type: 'text/plain'});
  results.push(await uploadFile(credentials, bucketName, 'test.txt', testFile));
  
  // 3. Download test file
  results.push(await downloadFile(credentials, bucketName, 'test.txt'));
  
  // 4. Verify encryption (check file metadata)
  results.push(await verifyEncryption(credentials, bucketName, 'test.txt'));
  
  // 5. Check permissions (try to list bucket)
  results.push(await checkPermissions(credentials, bucketName));
  
  // Clean up test file
  await deleteFile(credentials, bucketName, 'test.txt');
  
  return results;
}
```

---

## Edge Cases & Error Handling

### User Abandons Wizard
- Save progress in AsyncStorage
- Show "Resume Setup" button in settings
- Timeout: 7 days, then clear saved state

### User Changes Credentials Mid-Setup
- Re-run all tests from Step 5
- Don't assume prior steps still valid

### Network Lost During Test
- Show "Connection lost" error
- Retry button with exponential backoff (3 attempts)
- Offline mode: "Connect to WiFi and try again"

### Bucket Already Exists (Name Collision)
- Try mobileclaw-backup-{random} up to 5 times
- If all fail, ask user to choose custom name

### User Has No Payment Method (AWS)
- AWS requires payment method for signup
- Show warning in Step 2: "AWS requires a credit/debit card for identity verification. You won't be charged unless you exceed the free tier (5GB)."

---

## Google Cloud Variant

**Step 3 differences:**
- Instead of Access Keys, get Service Account JSON
- JSON upload field (or paste text area)
- Validation: must be valid JSON with `type: "service_account"`

**Step 4 differences:**
- "Bucket" → "Storage Bucket" (GCP terminology)
- Regions: us-central1, us-east1, etc.

**All other steps:** Same UX, just different API calls under the hood

---

## Success Metrics

After launch, measure:
- **Completion rate:** % users who finish all 6 steps
- **Drop-off points:** Which step loses most users?
- **Time to complete:** Target <5 minutes
- **Error rate:** % failed connections (Step 5)
- **Support tickets:** Common pain points

**Target:**
- Completion rate >70%
- Avg time <5 min
- Error rate <10%

---

## Next Steps (After Design Approval)

1. **Create Figma mockups** (high-fidelity)
2. **User testing** with 3-5 non-technical users
3. **Iterate based on feedback**
4. **Hand off to US-032** (implementation task)

---

## Changelog

| Version | Date | Change |
|---------|------|--------|
| 1.0 | Feb 20, 2026 | Initial design (Cole - Designer Agent) |

---

**Designer Notes:**

This wizard prioritizes **hand-holding over efficiency**. Technical users could set this up in 2 steps, but our target user (Brian's daughter Lena, age 18, non-technical) needs screenshots, videos, and "why am I doing this?" explanations at every step.

**Key insight:** Users don't care about S3 buckets or IAM policies. They care about "will my data be safe if I lose my phone?" The wizard speaks in those terms, not AWS jargon.

**Inspiration:** Stripe onboarding (clear progress, one question per screen), Dropbox first-run (test connection, celebrate success), 1Password cloud sync setup (security-first messaging).
