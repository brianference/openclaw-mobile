#!/bin/bash
# Automated beta deployment for Mobileclaw
# Builds iOS + Android and prepares for Test Flight / Play Console upload

set -e

PROJECT_DIR="/root/.openclaw/workspace/projects/mobileclaw"
cd "$PROJECT_DIR"

echo "🚀 Mobileclaw Beta Deployment"
echo "=============================="
echo ""

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

# Check if logged in to Expo
if ! eas whoami &> /dev/null; then
    echo "❌ Not logged into Expo. Please run: eas login"
    exit 1
fi

echo "✅ EAS CLI ready"
echo ""

# Increment version (optional - comment out if managing manually)
echo "📦 Incrementing version..."
npm version patch --no-git-tag-version
VERSION=$(node -p "require('./package.json').version")
echo "   New version: $VERSION"
echo ""

# Build iOS
echo "📱 Building iOS (Test Flight)..."
echo "   This will take 10-15 minutes..."
eas build --platform ios --profile beta --non-interactive

if [ $? -eq 0 ]; then
    echo "✅ iOS build complete"
else
    echo "❌ iOS build failed"
    exit 1
fi
echo ""

# Build Android  
echo "🤖 Building Android (Internal Testing)..."
echo "   This will take 10-15 minutes..."
eas build --platform android --profile beta --non-interactive

if [ $? -eq 0 ]; then
    echo "✅ Android build complete"
else
    echo "❌ Android build failed"
    exit 1
fi
echo ""

# Optional: Auto-submit to Test Flight (requires Apple credentials configured)
# Uncomment if you have eas submit configured
# echo "📤 Submitting to Test Flight..."
# eas submit --platform ios --latest --non-interactive

echo "✅ ============================================"
echo "✅  BETA BUILDS COMPLETE"
echo "✅ ============================================"
echo ""
echo "📋 Next Steps:"
echo "   1. Check Expo dashboard: https://expo.dev/accounts/[your-account]/projects/openclaw-mobile/builds"
echo "   2. Download builds and test locally"
echo "   3. Upload to Test Flight: eas submit --platform ios --latest"
echo "   4. Upload to Play Console: https://play.google.com/console"
echo "   5. Send update email to beta testers"
echo ""
echo "📝 Build Info:"
echo "   Version: $VERSION"
echo "   Profile: beta"
echo "   Platforms: iOS + Android"
echo ""
