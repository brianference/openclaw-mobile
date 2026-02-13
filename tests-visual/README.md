# MobileClaw Visual Regression Tests

Playwright + Percy visual regression testing for MobileClaw across 3 platforms.

## Quick Start

### 1. Prerequisites

Start the Expo web server:
```bash
cd /root/.openclaw/workspace/projects/mobileclaw
npm run web
```

Wait for the server to start at `http://localhost:19006`

### 2. Install Percy (Optional)

For visual diff tracking:
```bash
npm install @percy/cli
export PERCY_TOKEN=your_percy_token_here
```

### 3. Run Tests

```bash
# All platforms
npm test

# Single platform
npm run test:desktop
npm run test:iphone
npm run test:pixel

# With Percy
npm run test:percy
```

## Test Coverage

**22 Visual Regression Tests**
- 3 Onboarding screens
- 5 Task Management screens
- 4 Vault screens
- 3 Places screens
- 2 Security screens
- 3 Settings screens
- 2 Chat screens

**2 Accessibility Tests**
- Color contrast validation
- Touch target size verification

## Platforms

1. **Desktop** - 1280x900 (Chromium)
2. **iPhone 12** - 390x844 (Mobile Safari)
3. **Pixel 5** - 393x851 (Mobile Chrome)

## Output

Screenshots saved to: `test-results/*.png`

HTML report: `playwright-report/index.html`
- View with: `npm run report`

Percy dashboard (if configured): `https://percy.io/your-org/mobileclaw`

## Configuration Files

- `playwright.config.ts` - Playwright settings
- `.percyrc.yml` - Percy snapshot configuration
- `mobileclaw-screens.spec.ts` - Test suite (24 tests)

## Troubleshooting

**Tests fail with timeout:**
- Ensure Expo server is running
- Check that http://localhost:19006 is accessible
- Increase timeout in playwright.config.ts

**Screenshots not captured:**
- Check `test-results/` directory
- Verify `screenshot: 'on'` in playwright.config.ts
- Run with `--debug` flag

**Percy not working:**
- Verify PERCY_TOKEN is set
- Install @percy/cli: `npm install @percy/cli`
- Check Percy dashboard for build status

## Expected Results

**Pass Rate:** 100% (22/22 screens implemented)

**Failures Expected For:**
- Trip Detail (not yet implemented)
- Boarding Pass/Wallet (not yet implemented)  
- Loyalty Tracker (not yet implemented)

## Documentation

Full test execution report: `/root/.openclaw/workspace/projects/mobileclaw/TEST-EXECUTION-REPORT.md`
