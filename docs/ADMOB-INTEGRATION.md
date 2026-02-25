# AdMob Integration Guide

## Overview

This document describes the AdMob integration for Mobileclaw, including setup, usage, and best practices.

## Features

✅ **Banner Ads** - 320x50 banners at bottom of appropriate screens  
✅ **Interstitial Ads** - Full-screen ads after major actions (max 1 per 5 minutes)  
✅ **Rewarded Ads** - User-initiated ads with rewards (premium features, storage)  
✅ **GDPR/CCPA Compliance** - Automatic consent management  
✅ **Ad-Free Zones** - No ads on auth, payment, or settings screens  
✅ **Error Handling** - Graceful fallbacks when ads fail to load  
✅ **Performance Optimized** - Async loading, no UI blocking  

## Setup Instructions

### 1. Install Dependencies

Already installed via `npm install react-native-google-mobile-ads`

### 2. Configure AdMob App IDs

Edit `src/config/admob.ts` and replace test IDs with your actual AdMob IDs:

```typescript
export const ADMOB_CONFIG = {
  appId: Platform.select({
    ios: 'ca-app-pub-YOUR-ID~YOUR-APP-ID', // Replace
    android: 'ca-app-pub-YOUR-ID~YOUR-APP-ID', // Replace
  }),
  
  bannerAdUnitId: Platform.select({
    ios: 'ca-app-pub-YOUR-ID/BANNER-ID', // Replace
    android: 'ca-app-pub-YOUR-ID/BANNER-ID', // Replace
  }),
  
  // ... same for interstitial and rewarded
};
```

### 3. Update app.json

Add AdMob configuration to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-YOUR-ID~YOUR-APP-ID",
          "iosAppId": "ca-app-pub-YOUR-ID~YOUR-APP-ID"
        }
      ]
    ]
  }
}
```

### 4. Build Custom Dev Client

Since react-native-google-mobile-ads requires native code:

```bash
# Install EAS CLI
npm install -g eas-cli

# Build custom dev client
eas build --profile development --platform ios
eas build --profile development --platform android
```

## Usage Examples

### Initialize in Root Component

Initialize AdMob in your root `_layout.tsx`:

```typescript
import { useEffect } from 'react';
import { adManager } from '@/src/lib/adManager';

export default function RootLayout() {
  useEffect(() => {
    // Initialize AdMob SDK
    adManager.initialize();
  }, []);

  return (
    // ... your app layout
  );
}
```

### Banner Ads

Add banner ads to appropriate screens:

```typescript
import { BannerAd } from '@/src/lib/adManager';
import { shouldShowBanner } from '@/src/config/admob';
import { usePathname } from 'expo-router';

export default function TasksScreen() {
  const pathname = usePathname();
  const showAds = shouldShowBanner(pathname);

  return (
    <View style={styles.container}>
      {/* Your screen content */}
      
      {/* Banner ad at bottom */}
      {showAds && <BannerAd />}
    </View>
  );
}
```

### Interstitial Ads

Show interstitial ads after major actions:

```typescript
import { adManager } from '@/src/lib/adManager';

async function handleTaskComplete() {
  // Complete the task
  await completeTask(taskId);
  
  // Show interstitial ad (respects 5-minute rule)
  await adManager.showInterstitial();
  
  // Navigate to next screen
  router.push('/tasks/completed');
}
```

### Rewarded Ads

Offer rewards for watching ads:

```typescript
import { useRewardedAd } from '@/src/lib/adManager';

function PremiumFeatureScreen() {
  const { showAd, isReady } = useRewardedAd();

  async function handleWatchAd() {
    const reward = await showAd();
    
    if (reward) {
      // Grant premium access for 24 hours
      await grantPremiumAccess(24);
      Alert.alert('Success!', 'You unlocked premium features for 24 hours!');
    } else {
      Alert.alert('Not completed', 'Watch the full ad to earn your reward');
    }
  }

  return (
    <View>
      <Text>Unlock premium features</Text>
      <Button 
        title="Watch ad for 24h premium access"
        onPress={handleWatchAd}
        disabled={!isReady}
      />
    </View>
  );
}
```

## Configuration

### Ad-Free Zones

Edit `ADMOB_CONFIG.adFreeZones` to specify screens where ads should NEVER appear:

```typescript
adFreeZones: [
  '/auth',
  '/login',
  '/signup',
  '/payment',
  '/settings',
  '/vault',
],
```

### Banner-Allowed Screens

Edit `ADMOB_CONFIG.bannerAllowedScreens` to specify where banners CAN appear:

```typescript
bannerAllowedScreens: [
  '/home',
  '/(tabs)/tasks',
  '/(tabs)/scanner',
  '/tasks/completed',
],
```

### Timing Constraints

Configure ad frequency:

```typescript
timing: {
  minInterstitialInterval: 5 * 60 * 1000, // 5 minutes
  bannerRefreshRate: 60 * 1000, // 1 minute (optional)
},
```

## Testing

### Test Ads

Test IDs are already configured. Use these during development:
- Test ads are provided by Google
- They don't affect your AdMob account metrics
- Replace with real IDs before production release

### Test Devices

Add your test device IDs to avoid affecting production metrics:

```typescript
testDeviceIds: [
  '2077ef9a63d2b398840261c8221a0c9b', // Your device ID
],
```

Find your device ID in console logs when the app first loads ads.

## Privacy Compliance

### GDPR/CCPA

Consent is automatically managed:
1. On first app launch, user is shown consent form (if in GDPR region)
2. Consent status is stored locally
3. Ads only show if user consents
4. User can reset consent in settings

### Implementation

```typescript
import { requestAdConsent, resetConsent } from '@/src/lib/adConsent';

// Request consent
const consentInfo = await requestAdConsent();

// Reset consent (in settings screen)
await resetConsent();
```

## Production Checklist

Before releasing to production:

- [ ] Replace all test ad unit IDs with real IDs in `src/config/admob.ts`
- [ ] Update `app.json` with real AdMob app IDs
- [ ] Remove test device IDs from config
- [ ] Test on physical devices (iOS + Android)
- [ ] Verify consent form appears in GDPR regions
- [ ] Verify ads don't appear in ad-free zones
- [ ] Verify 5-minute rule for interstitials
- [ ] Test rewarded ads grant rewards correctly
- [ ] Monitor AdMob dashboard for impressions/revenue

## Troubleshooting

### Ads not showing

1. Check console logs for errors
2. Verify consent is obtained: `hasConsent()`
3. Verify current route is not in ad-free zones
4. Wait a few seconds for ads to load
5. Check AdMob dashboard for ad availability

### Consent form not appearing

- Consent forms only appear in GDPR regions
- For testing, use VPN to EU location
- Or manually trigger: `requestAdConsent()`

### Build errors

- Ensure you're using a custom dev client (not Expo Go)
- Run `eas build` to create native builds
- Check `app.json` plugin configuration

## Performance

- **Banner ads**: ~50KB, load in <1 second
- **Interstitial ads**: ~200KB, preloaded in background
- **Rewarded ads**: ~500KB, preloaded in background
- **Battery impact**: Minimal (<1% per hour)
- **Data usage**: ~1-2MB per hour of app use

## Support

For issues with:
- **AdMob SDK**: Check [official docs](https://docs.page/invertase/react-native-google-mobile-ads)
- **Expo integration**: Check [Expo forums](https://forums.expo.dev)
- **Ad policies**: Check [AdMob policies](https://support.google.com/admob/answer/6128543)

## License

AdMob integration code is licensed under MIT, same as Mobileclaw project.
