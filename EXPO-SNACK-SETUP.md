# Expo Snack Setup Instructions

## Option 1: Tonight (Recommended)
When on desktop, easiest is just run Expo Go:
```bash
cd openclaw-mobile
npm install
npm start
# Scan QR with Expo Go app
```

## Option 2: Create Snack Now (Manual)

1. Go to: https://snack.expo.dev
2. Click "New Snack"
3. Create these files by copying from the repo:

### Files to Create in Snack

**App.js** (Snack entry point):
```javascript
import { registerRootComponent } from 'expo';
import App from './app/_layout';
registerRootComponent(App);
```

**Note:** Snack has limitations:
- No file-based routing (expo-router)
- Limited native modules
- Can't use SecureStore

For full testing, use Expo Go on device.

## Option 3: EAS Build (APK)
```bash
# Install EAS CLI
npm install -g eas-cli
eas login

# Build preview APK
eas build --platform android --profile preview

# Download and install APK on phone
```

## Recommendation

**Tonight:** Use Expo Go (5 min setup)
**For sharing/demo:** Create simplified Snack version
**For real testing:** EAS Build preview APK
