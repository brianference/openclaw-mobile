# Expo Go Error - Top 5 Fixes

## Issue
`java.io.IOException: Failed to download remote update` - Fatal Error

## Root Causes (Top 5)

### 1. **Missing expo-updates dependency** (CRITICAL)
App.json doesn't include expo-updates configuration, but Expo Go expects it.

**Fix:**
```bash
npm install expo-updates
```

Add to app.json:
```json
"updates": {
  "enabled": false,
  "fallbackToCacheTimeout": 0
}
```

### 2. **Metro bundler cache corruption**
Cached files can cause download failures.

**Fix:**
```bash
rm -rf .expo node_modules/.cache
npx expo start --clear
```

### 3. **Network/WSL2 connectivity issues**
WSL2 networking can block Expo Go from reaching Metro bundler.

**Fix:**
- Use `--lan` instead of `--tunnel`
- Ensure phone and PC on same WiFi
- Check Windows Firewall allows port 8081

### 4. **Missing or corrupt assets**
app.json references assets that don't exist.

**Fix:** Verify all referenced assets exist:
- `./assets/icon.png`
- `./assets/splash-icon.png`
- `./assets/adaptive-icon.png`
- `./assets/favicon.png`

### 5. **EAS projectId misconfigured**
app.json has placeholder `"your-project-id"` which breaks updates.

**Fix:** Either remove EAS config or set proper project ID.
