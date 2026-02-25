# Premium Version Setup Guide

Complete guide for setting up the $4.99 one-time premium purchase for Mobileclaw.

## Overview

- **Price:** $4.99 USD (one-time payment, no subscription)
- **Free Trial:** 7 days
- **Premium Features:**
  - Ad-free experience
  - Unlimited cloud storage
  - Advanced vault features
  - Priority support
  - All future premium features

## Current Status

✅ **COMPLETE (MVP):**
- Premium purchase manager (mock implementation)
- Premium upgrade UI screen
- Settings integration
- Feature gating hooks
- Trial system (7 days)
- Purchase/restore flows

🔨 **TODO (Production):**
- Replace mock purchase with real IAP SDK
- Configure App Store Connect products
- Configure Google Play Console products
- Implement server-side receipt validation
- Add analytics tracking

---

## Architecture

### Files Created

1. **`src/lib/purchaseManager.ts`** (5.7 KB)
   - Core purchase logic
   - Premium status checking
   - Trial management
   - Purchase/restore functions
   - **Currently uses mock implementation for testing**

2. **`app/settings/premium.tsx`** (17 KB)
   - Premium upgrade screen UI
   - Feature comparison table
   - Purchase/trial buttons
   - Restore purchases button
   - Already-premium confirmation

3. **`src/lib/usePremium.ts`** (1.6 KB)
   - React hook for premium status
   - Feature gating helpers
   - Ad visibility logic

### Files Modified

1. **`app/settings/index.tsx`**
   - Added "Upgrade to Premium" option at top of settings

---

## Testing (Current Mock Implementation)

### Test Premium Purchase

```javascript
// In any component
import { purchasePremium } from '../src/lib/purchaseManager';

// Simulate purchase (instant success)
const success = await purchasePremium();
console.log('Purchase successful:', success); // true
```

### Test Premium Status

```javascript
import { checkPremiumStatus } from '../src/lib/purchaseManager';

const status = await checkPremiumStatus();
console.log(status);
// {
//   isPremium: true/false,
//   isTrialActive: true/false,
//   trialDaysRemaining: 0-7,
//   purchaseDate: '2026-02-24T...',
// }
```

### Test Free Trial

```javascript
import { startFreeTrial } from '../src/lib/purchaseManager';

await startFreeTrial();
// Trial starts for 7 days
```

### Clear Test Data

```javascript
import { clearPurchaseData } from '../src/lib/purchaseManager';

await clearPurchaseData();
// Resets to free tier
```

---

## Production Setup (Real IAP)

### 1. Install IAP Library

```bash
# Option A: Expo In-App Purchases (recommended for Expo)
npx expo install expo-in-app-purchases

# Option B: react-native-iap (more features, native modules)
npm install react-native-iap
npx pod-install  # iOS only
```

### 2. Configure App Store Connect (iOS)

1. **Create In-App Purchase Product:**
   - Go to App Store Connect → Your App → In-App Purchases
   - Click "+" to create new product
   - Type: **Non-Consumable** (one-time purchase)
   - Product ID: `com.openclaw.mobile.premium`
   - Price: $4.99 USD (Tier 5)
   - Name: "Premium Upgrade"
   - Description: "Unlock all premium features"

2. **Add Screenshots/Review Info:**
   - Upload promo images (optional)
   - Submit for review

3. **Test with Sandbox:**
   - Go to Users and Access → Sandbox Testers
   - Create test account
   - Sign in on device with test account
   - Test purchase flow

### 3. Configure Google Play Console (Android)

1. **Create In-App Product:**
   - Go to Google Play Console → Your App → In-App Products
   - Click "Create product"
   - Product ID: `com.openclaw.mobile.premium`
   - Type: **Managed product** (non-consumable)
   - Name: "Premium Upgrade"
   - Description: "Unlock all premium features"
   - Price: $4.99 USD

2. **Add Promo Assets:**
   - Upload icon (512x512 PNG)
   - Add promo text

3. **Activate Product:**
   - Save and activate

4. **Test with License Testers:**
   - Go to Settings → License Testing
   - Add test accounts
   - Test purchase flow

### 4. Replace Mock Implementation

Update `src/lib/purchaseManager.ts`:

```typescript
// BEFORE (mock):
export async function purchasePremium(): Promise<boolean> {
  // Simulate purchase
  await new Promise(resolve => setTimeout(resolve, 1000));
  await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, 'true');
  return true;
}

// AFTER (real IAP with expo-in-app-purchases):
import * as InAppPurchases from 'expo-in-app-purchases';

export async function purchasePremium(): Promise<boolean> {
  try {
    // Connect to store
    await InAppPurchases.connectAsync();

    // Get products
    const { results } = await InAppPurchases.getProductsAsync([PRODUCT_IDS.PREMIUM]);
    if (results.length === 0) {
      throw new Error('Product not found');
    }

    // Purchase
    const purchase = await InAppPurchases.purchaseItemAsync(PRODUCT_IDS.PREMIUM);

    // Validate receipt server-side (IMPORTANT!)
    const validated = await validateReceipt(purchase.transactionReceipt);
    if (!validated) {
      throw new Error('Receipt validation failed');
    }

    // Save premium status
    await AsyncStorage.setItem(STORAGE_KEYS.PREMIUM_STATUS, 'true');
    await AsyncStorage.setItem(
      STORAGE_KEYS.PURCHASE_RECEIPT,
      purchase.transactionReceipt
    );

    // Disconnect
    await InAppPurchases.disconnectAsync();

    return true;
  } catch (error) {
    console.error('[PurchaseManager] Purchase failed:', error);
    await InAppPurchases.disconnectAsync();
    return false;
  }
}
```

### 5. Implement Receipt Validation

**CRITICAL:** Always validate receipts server-side to prevent piracy.

```typescript
// Server-side validation endpoint
async function validateReceipt(receipt: string): Promise<boolean> {
  try {
    const response = await fetch('https://your-api.com/validate-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receipt, platform: Platform.OS }),
    });

    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error('[PurchaseManager] Validation error:', error);
    return false;
  }
}
```

**Server implementation (Node.js example):**

```javascript
// For iOS: Validate with Apple
const appleResponse = await fetch(
  'https://buy.itunes.apple.com/verifyReceipt',  // Production
  // 'https://sandbox.itunes.apple.com/verifyReceipt',  // Sandbox
  {
    method: 'POST',
    body: JSON.stringify({
      'receipt-data': receipt,
      'password': process.env.APPLE_SHARED_SECRET,
    }),
  }
);

// For Android: Validate with Google Play
// Use @googleapis/androidpublisher package
```

### 6. Update app.json

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.openclaw.mobile",
      "config": {
        "usesNonExemptEncryption": false
      },
      "infoPlist": {
        "NSFaceIDUsageDescription": "Use Face ID to unlock your vault"
      }
    },
    "android": {
      "package": "com.openclaw.mobile",
      "permissions": ["USE_BIOMETRIC", "USE_FINGERPRINT", "BILLING"]
    }
  }
}
```

---

## Feature Gating

### Check Premium in Components

```typescript
import { usePremium } from '../src/lib/usePremium';

function MyComponent() {
  const { hasPremiumAccess, hasFeature, shouldShowAds } = usePremium();

  if (shouldShowAds) {
    return <BannerAd />;
  }

  if (!hasFeature('unlimited_cloud_storage')) {
    return <UpgradePrompt feature="Unlimited Cloud Storage" />;
  }

  return <PremiumContent />;
}
```

### Premium Features List

```typescript
// Basic (free tier)
- chat
- tasks
- vault_basic
- scanner

// Premium only
- unlimited_cloud_storage
- advanced_vault
- priority_support
- custom_themes
- export_data
```

---

## Integration with AdMob (US-033)

AdMob was implemented in US-033. Update ad configuration to respect premium status:

```typescript
// src/lib/adManager.ts (already exists from US-033)
import { usePremium } from './usePremium';

export function useAdManager() {
  const { shouldShowAds } = usePremium();

  // Only show ads if user doesn't have premium
  const showBanner = shouldShowAds;
  const showInterstitial = shouldShowAds;
  const showRewarded = true; // Rewarded ads always available

  return {
    showBanner,
    showInterstitial,
    showRewarded,
  };
}
```

---

## Analytics Tracking (Recommended)

Track purchase funnel for optimization:

```typescript
// Example with Segment/Mixpanel/Firebase
analytics.track('Premium Screen Viewed');
analytics.track('Trial Started', { daysRemaining: 7 });
analytics.track('Purchase Initiated', { price: '$4.99' });
analytics.track('Purchase Completed', { revenue: 4.99, currency: 'USD' });
analytics.track('Purchase Failed', { error: 'User cancelled' });
analytics.track('Purchases Restored');
```

---

## User Flow

```
Settings → Upgrade to Premium
  ↓
[Premium Screen]
  • Feature comparison table
  • "Start 7-Day Free Trial" button
  • "Purchase Premium ($4.99)" button
  • "Restore Purchases" link
  ↓
[Purchase Flow]
  1. User taps "Purchase Premium"
  2. System payment sheet appears (Apple/Google)
  3. User confirms with Touch ID/Face ID/PIN
  4. Receipt validated server-side
  5. Premium status saved locally + cloud
  6. Success message shown
  7. User returned to settings
  8. Ads removed immediately
  9. Premium features unlocked
```

---

## Testing Checklist

### Pre-Launch

- [ ] Test purchase on iOS device
- [ ] Test purchase on Android device
- [ ] Test trial flow (start → countdown → expiration)
- [ ] Test restore on new device
- [ ] Test receipt validation (valid + invalid)
- [ ] Test network failures (offline purchase)
- [ ] Test user cancellation
- [ ] Verify ads are hidden for premium users
- [ ] Verify premium features are unlocked
- [ ] Test with multiple Apple IDs / Google accounts

### Post-Launch

- [ ] Monitor purchase success rate
- [ ] Monitor trial-to-paid conversion
- [ ] Monitor restore requests
- [ ] Check for piracy (receipt tampering)
- [ ] Analyze funnel drop-off points
- [ ] A/B test pricing ($3.99 vs $4.99 vs $5.99)
- [ ] A/B test trial duration (3 days vs 7 days vs 14 days)

---

## Troubleshooting

### "Product not found"
- Verify product ID matches exactly
- Check product is active in App Store Connect / Play Console
- Wait 2-24 hours after creating product
- Clear app data and reinstall

### "Purchase failed"
- Check sandbox tester account (iOS)
- Verify billing is enabled (Android)
- Check internet connection
- Verify app has correct bundle ID / package name

### "Receipt validation failed"
- Check server endpoint is live
- Verify Apple shared secret is correct
- Check receipt format (Base64 vs raw)
- Test with sandbox receipt first

### "Restore finds nothing"
- User may be signed into different Apple ID / Google account
- Purchases only restore to same account
- Check receipt still exists in keychain/storage

---

## Revenue Estimates

**Assumptions:**
- 10,000 monthly active users
- 2% conversion rate (trial → paid)
- $4.99 per purchase
- 70% after Apple/Google fees

**Monthly Revenue:**
- 10,000 × 0.02 = 200 purchases/month
- 200 × $4.99 = $998/month gross
- $998 × 0.70 = **$698.60/month net**

**Yearly Revenue:**
- $698.60 × 12 = **$8,383.20/year**

---

## Next Steps

1. **Now (MVP):**
   - ✅ Test mock purchase flow
   - ✅ Verify UI/UX
   - ✅ Test trial system

2. **Before Production:**
   - [ ] Install IAP library
   - [ ] Configure App Store Connect
   - [ ] Configure Google Play Console
   - [ ] Implement real purchase flow
   - [ ] Build receipt validation server
   - [ ] Test on physical devices

3. **After Launch:**
   - [ ] Monitor metrics
   - [ ] Optimize conversion funnel
   - [ ] A/B test pricing
   - [ ] Add more premium features

---

## Support

**User asks:** "How do I upgrade to premium?"
→ Settings → Upgrade to Premium → Start trial or purchase

**User asks:** "I purchased on my old phone, how do I restore?"
→ Settings → Upgrade to Premium → Restore Purchases

**User asks:** "Can I get a refund?"
→ iOS: Settings → Apple ID → Subscriptions → Request Refund
→ Android: Play Store → Account → Purchase History → Request Refund

---

## License

MIT License - See LICENSE file

---

**Status:** MVP Complete ✅  
**Next:** Production IAP setup when ready for App Store/Play Store submission  
**Questions:** Contact brian@openclaw.ai
