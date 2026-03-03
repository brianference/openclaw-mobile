# US-022 Places Feature - Deployment Checklist

**Feature:** Places Search & Save  
**US:** US-022  
**Status:** ✅ Ready for Testing  
**Created:** 2026-03-02

---

## 📋 Pre-Deployment Checklist

### Dependencies ✅
- [x] `expo-location@~18.0.8` installed
- [x] `expo-device@^55.0.9` updated
- [x] `react-native-maps@^1.27.1` (already installed)
- [x] `@react-native-async-storage/async-storage@^2.2.0` (already installed)

### Code Implementation ✅
- [x] Types defined (`/src/types/places.ts`)
- [x] Service layer (`/src/services/places.service.ts`)
- [x] Main screen (`/app/(tabs)/places/index.tsx`)
- [x] Detail screen (`/app/(tabs)/places/[id].tsx`)
- [x] Saved screen (`/app/(tabs)/places/saved.tsx`)
- [x] Navigation updated (`/app/(tabs)/_layout.tsx`)
- [x] Tests created (`/tests/places/places.test.ts`)

### Requirements Met ✅
- [x] Google Maps directions link on every result
- [x] Composite ranking (65% rating + 35% proximity)
- [x] Distance display in miles
- [x] Mobile-responsive (375px+)
- [x] WCAG 2.1 AA accessibility (44px touch targets, high contrast)

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Run: `npm test tests/places/places.test.ts`
- [ ] Verify distance calculation accuracy
- [ ] Verify composite scoring algorithm
- [ ] Verify WCAG compliance checks pass

### Device Testing (iOS)
- [ ] Install via Expo Go
- [ ] Grant location permission
- [ ] Search for "coffee" → verify results appear
- [ ] Tap place card → verify detail screen loads
- [ ] Tap "Get Directions" → verify Google Maps opens
- [ ] Tap "Save" → verify star toggles
- [ ] Navigate to Saved Places → verify persistence
- [ ] Remove saved place → verify deletion
- [ ] Test all 6 Quick Filters

### Device Testing (Android)
- [ ] Install via Expo Go
- [ ] Grant location permission
- [ ] Search for "coffee" → verify results appear
- [ ] Tap place card → verify detail screen loads
- [ ] Tap "Get Directions" → verify Google Maps opens
- [ ] Tap "Save" → verify star toggles
- [ ] Navigate to Saved Places → verify persistence
- [ ] Remove saved place → verify deletion
- [ ] Test all 6 Quick Filters

### Accessibility Testing
- [ ] **VoiceOver (iOS)**
  - Enable VoiceOver in Settings → Accessibility
  - Navigate Places screen with gestures
  - Verify place names are announced correctly
  - Verify "Get Directions" button is announced
  
- [ ] **TalkBack (Android)**
  - Enable TalkBack in Settings → Accessibility
  - Navigate Places screen with gestures
  - Verify place names are announced correctly
  - Verify "Get Directions" button is announced

- [ ] **Touch Targets**
  - Measure button sizes (should be ≥44px)
  - Verify no accidental taps on adjacent buttons

- [ ] **Color Contrast**
  - Run automated audit (Lighthouse or axe)
  - Verify 4.5:1 text contrast
  - Verify 3:1 UI component contrast

### Performance Testing
- [ ] **Network Conditions**
  - Test on 3G (throttle in dev tools)
  - Verify search completes in <5s
  - Test offline behavior (should show error)

- [ ] **Memory Usage**
  - Monitor memory during 10+ searches
  - Verify no memory leaks
  - Verify AsyncStorage size reasonable (<1 MB)

---

## 🔒 Security Checklist

### API Keys
- [ ] Google Places API key configured
- [ ] API key stored in `.env` or `expo-constants`
- [ ] API key NOT hardcoded in source files
- [ ] API key restricted to iOS/Android bundle IDs

### Permissions
- [ ] Location permission strings added:
  - iOS: `Info.plist` → `NSLocationWhenInUseUsageDescription`
  - Android: `AndroidManifest.xml` → `ACCESS_FINE_LOCATION`

### Data Privacy
- [ ] No personal data sent to Google Places API
- [ ] Saved places stored locally only
- [ ] No analytics tracking on searches

---

## 📸 Screenshot Proof

### Required Screenshots (Minimum 3)

**1. Places Search Results**
- Search query: "coffee"
- Shows at least 3 results
- Each result displays:
  - ✅ Name + distance (miles)
  - ✅ Rating + review count
  - ✅ Open/Closed status
  - ✅ Composite score bar
  - ✅ "Get Directions" button visible

**2. Place Detail Screen**
- Shows full place information:
  - ✅ Photo (if available)
  - ✅ Rating + reviews
  - ✅ Hours + Open/Closed
  - ✅ Address
  - ✅ Phone + Website
  - ✅ Match score (0-100%)
  - ✅ "Get Directions" button (primary)

**3. Saved Places Screen**
- Shows at least 1 saved place
- Demonstrates persistence
- Remove button (✕) visible

### Screenshot Commands

```bash
# iOS Simulator
xcrun simctl io booted screenshot places-search.png

# Android Emulator  
adb exec-out screencap -p > places-search.png

# Expo Go (device)
# Use device screenshot function
# iOS: Home + Volume Up
# Android: Power + Volume Down
```

---

## 🚀 Deployment Steps

### 1. Verify Build
```bash
cd /root/.openclaw/workspace/projects/mobileclaw
npm run typecheck
npm run lint
npm test
```

### 2. Update App Config
```json
// app.json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow MobileClaw to find places near you."
        }
      ]
    ]
  }
}
```

### 3. Build for Testing
```bash
# Internal testing build
eas build --platform ios --profile development
eas build --platform android --profile development

# Or use Expo Go for faster testing
npm start
```

### 4. Submit to TestFlight / Internal Testing
```bash
eas submit --platform ios
eas submit --platform android
```

---

## 📊 Post-Deploy Monitoring

### Week 1 Metrics
- **Usage:** % of users who tap Places tab
- **Searches:** Average searches per user
- **Saves:** % of users who save at least 1 place
- **Errors:** Location permission denial rate
- **Performance:** Average search time

### Alerts
- [ ] Set up error tracking (Sentry or similar)
- [ ] Monitor API quota usage (Google Places)
- [ ] Track crash rate
- [ ] Monitor ANR (Application Not Responding) events

---

## 🐛 Known Issues

### Minor Issues (Non-Blocking)
1. **No map view** - List view only (map coming in v1.1)
2. **No offline caching** - Requires network for search
3. **No trip planner** - Save feature works, but no itinerary yet

### Workarounds
- Map view: Directions button opens Google Maps (full map experience)
- Offline: Saved places remain accessible offline
- Trip planner: Can be added in next iteration

---

## ✅ Go/No-Go Criteria

### ✅ GO if:
- All dependencies installed successfully
- Unit tests pass
- Device testing completed on iOS + Android
- Screenshot proof captured (3 screens minimum)
- Location permissions work correctly
- Google Places API calls succeed
- AsyncStorage persistence works
- No critical bugs found

### ❌ NO-GO if:
- Location permission broken
- Google Places API calls fail
- AsyncStorage not persisting
- Critical accessibility issues found (no VoiceOver support)
- Crashes on search or save
- Memory leaks detected

---

## 🎯 Success Metrics (30 Days)

### Adoption
- **Target:** 40% of active users tap Places tab
- **Target:** Average 5 searches per active user

### Engagement
- **Target:** 25% of users save at least 1 place
- **Target:** 60% of users tap "Get Directions" at least once

### Quality
- **Target:** <1% crash rate
- **Target:** <5% location permission denials
- **Target:** Average search time <3 seconds

---

## 📞 Emergency Contacts

### If Production Issues
1. **Check API status:** https://status.cloud.google.com/
2. **Rollback plan:** Disable Places tab via feature flag
3. **Escalation:** Contact Brian (@brianference)

---

## ✅ Final Sign-Off

**Developer:** ___________________ Date: ___________  
**QA Lead:** ___________________ Date: ___________  
**Product Owner:** ___________________ Date: ___________

---

**Checklist Version:** 1.0  
**Last Updated:** 2026-03-02  
**US:** US-022
