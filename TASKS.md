# OpenClaw Mobile — Task List

## 🚨 URGENT — Security (Tonight)

### Token Rotation (Brian + Cole)
- [ ] Rotate GitHub token (exposed in chat)
- [ ] Rotate Netlify token (exposed in chat)
- [ ] Update `/root/.openclaw/secrets/keys.env` with new tokens
- [ ] Test new tokens work

### Config Security (Tonight)
- [ ] Move Telegram bot token to env var
- [ ] Move Brave Search API key to env var
- [ ] Move Gateway token to env var

## Tonight (Browser Relay Setup)
- [ ] Install Claude Code CLI
- [ ] Auth with Max plan OAuth token
- [ ] Enable Agent Teams experimental flag
- [ ] Test multi-agent workflow
- [ ] Set up Browser Relay on desktop Chrome
- [ ] Connect X (@swordtruth) session
- [ ] Connect TikTok (@realswordtruth) session
- [ ] Connect Grok Imagine
- [ ] Test Proton Mail access
- [ ] Test OpenArt.ai access
- [ ] Test Suno.com access

## App — Critical (Block Release)
- [ ] Implement AES-256-GCM vault encryption
- [ ] Upgrade password hashing to PBKDF2 (100K+ iterations)

## App — High (Before Beta)
- [ ] Implement kanban sync OR remove sync UI
- [ ] Add passphrase setup rollback (try/catch)

## App — Medium (Before Production)
- [ ] Add app switcher blur
- [ ] Implement encrypted data export
- [ ] Add storage quota warning
- [ ] Add WebSocket heartbeat/ping

## App — Low (Nice to Have)
- [ ] Add retry button to failed messages
- [ ] Show card created/updated dates
- [ ] Validate gateway URL format
- [ ] Add message pagination
- [ ] Card virtualization for large boards
- [ ] Long-press hint for kanban cards

## Infrastructure
- [ ] Create non-root user for OpenClaw
- [ ] Set up workspace backup (automated, encrypted)
- [ ] Add pre-commit secret scanning hook

## Completed ✓
- [x] Create GitHub repo
- [x] Expo init with TypeScript
- [x] Tab navigation shell
- [x] Theme system (dark/light)
- [x] Basic auth gate (passphrase)
- [x] Biometric authentication
- [x] WebSocket connection manager
- [x] Chat UI with timestamps
- [x] Kanban board UI
- [x] Vault UI with warning banner
- [x] Device checks (renamed from Scanner)
- [x] Settings with masked token
- [x] Brute force protection
- [x] Production logger
- [x] Move gateway token to SecureStore
- [x] Full hostile audit (all 6 types)
- [x] Self-audit of Cole/OpenClaw
- [x] Delete stale Signal QR
