# OpenClaw Mobile

Full-featured mobile client for OpenClaw — AI chat, task board, secrets vault, security scanner, and more.

![React Native](https://img.shields.io/badge/React_Native-0.76-blue)
![Expo](https://img.shields.io/badge/Expo-SDK_54-000020)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **⚡ AI Chat** — Real-time messaging with OpenClaw backend via WebSocket
- **📋 Task Board** — Drag-and-drop task management, syncs with web task board
- **🔐 Secrets Vault** — AES-256-GCM encrypted local storage for API keys & passwords
- **🛡️ Security Scanner** — Device security checks, network analysis, risk assessment
- **⚙️ Settings** — Theme toggle, biometric unlock, gateway configuration

## Tech Stack

- **Framework**: Expo SDK 54, Expo Router (file-based routing)
- **Language**: TypeScript (strict mode)
- **State Management**: Zustand with persist middleware
- **Storage**: 
  - expo-secure-store (encrypted secrets)
  - AsyncStorage (general data)
  - expo-sqlite (research hub, FTS)
- **Auth**: expo-local-authentication (biometrics)
- **Crypto**: expo-crypto (AES-256-GCM)
- **Build**: EAS Build for iOS & Android

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on physical device (optional)

### Installation

```bash
# Clone the repo
git clone https://github.com/brianference/openclaw-mobile.git
cd openclaw-mobile

# Install dependencies
npm install

# Start development server
npm start
```

### Running on Device

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Scan QR with Expo Go
npm start
```

## Project Structure

```
openclaw-mobile/
├── app/                    # Expo Router pages
│   ├── _layout.tsx         # Root layout (auth gate)
│   └── (tabs)/             # Tab navigation
│       ├── _layout.tsx     # Tab bar config
│       ├── index.tsx       # Chat screen
│       ├── task board.tsx      # Task board
│       ├── vault.tsx       # Secrets vault
│       ├── scanner.tsx     # Security scanner
│       └── settings.tsx    # App settings
├── src/
│   ├── components/         # Reusable UI components
│   │   └── AuthScreen.tsx  # Passphrase/biometric auth
│   ├── store/              # Zustand stores
│   │   ├── auth.ts         # Authentication state
│   │   ├── chat.ts         # Chat messages & WebSocket
│   │   ├── task board.ts       # Task board state
│   │   └── theme.ts        # Theme management
│   ├── types/              # TypeScript definitions
│   │   └── index.ts        # All type exports
│   └── utils/              # Helper functions
├── assets/                 # Images, icons, splash
├── app.json                # Expo config
├── tsconfig.json           # TypeScript config
└── package.json
```

## Configuration

### OpenClaw Gateway

1. Open Settings tab
2. Tap "OpenClaw Gateway"
3. Enter your gateway URL (e.g., `http://192.168.1.100:18789`)
4. Enter your gateway token
5. Tap Save, then connect

### Biometric Unlock

1. Set up passphrase on first launch
2. Go to Settings > Security
3. Enable "Biometric Unlock"
4. Use Face ID/fingerprint on subsequent launches

## Security

- **Passphrase**: SHA-256 hashed with random salt
- **Vault**: AES-256-GCM encryption (key derived from passphrase)
- **Storage**: expo-secure-store uses iOS Keychain / Android EncryptedSharedPreferences
- **Auto-lock**: App locks after 5 minutes of inactivity
- **No cloud sync**: All sensitive data stays local

## Building for Production

### EAS Build Setup

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### App Store Submission

1. Update `app.json` with your bundle IDs
2. Create app listings in App Store Connect / Google Play Console
3. Run production build: `eas build --platform all --profile production`
4. Submit via EAS: `eas submit --platform ios` / `eas submit --platform android`

## Development

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Adding a New Screen

1. Create file in `app/(tabs)/newscreen.tsx`
2. Add tab configuration in `app/(tabs)/_layout.tsx`
3. Create any needed stores in `src/store/`
4. Add types to `src/types/index.ts`

## Roadmap

- [ ] Research Hub with SQLite FTS
- [ ] Second Brain memory viewer
- [ ] Push notifications
- [ ] Widget support (iOS/Android)
- [ ] Task Board sync with web version
- [ ] Share extension
- [ ] Apple Watch companion

## License

MIT License — see [LICENSE](LICENSE) for details.

## Credits

Built with ⚡ by [Cole](https://github.com/brianference) for [OpenClaw](https://openclaw.ai).
