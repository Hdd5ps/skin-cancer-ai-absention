#!/bin/bash

# Script to prepare app for Google Play Store submission
# This script validates requirements and creates necessary assets

echo "=== Google Play Store Preparation Script ==="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed"
    exit 1
fi

# Check if Android SDK is available
if [ ! -d "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME not set. Android build may fail."
fi

echo "✅ Prerequisites check complete"
echo ""

# Build the app
echo "Building app for production..."
pnpm build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build complete"
echo ""

# Sync with Capacitor
echo "Syncing with Capacitor..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed"
    exit 1
fi

echo "✅ Capacitor sync complete"
echo ""

# Check for keystore
echo "Checking for signing keystore..."
if [ ! -f "android/app/release.keystore" ]; then
    echo "⚠️  Release keystore not found"
    echo "Run: ./android/generate_keystore.sh"
    echo "Then configure android/gradle.properties"
else
    echo "✅ Keystore found"
fi

echo ""

# Check for gradle.properties
if [ ! -f "android/gradle.properties" ]; then
    echo "⚠️  gradle.properties not found"
    echo "Copy android/gradle.properties.example to android/gradle.properties"
    echo "Fill in your keystore credentials"
else
    echo "✅ gradle.properties found"
fi

echo ""

# Check for required assets
echo "Checking for required assets..."

required_assets=(
    "icon-512.png"
    "icon-180.png"
)

missing_assets=()

for asset in "${required_assets[@]}"; do
    if [ ! -f "$asset" ]; then
        missing_assets+=("$asset")
    fi
done

if [ ${#missing_assets[@]} -gt 0 ]; then
    echo "⚠️  Missing required assets:"
    for asset in "${missing_assets[@]}"; do
        echo "  - $asset"
    done
else
    echo "✅ All required assets found"
fi

echo ""

# Build options
echo "Build options:"
echo "1. Build debug APK (for testing)"
echo "2. Build release APK (for direct distribution)"
echo "3. Build release AAB (for Play Store)"
echo ""

read -p "Select build option (1-3): " build_option

case $build_option in
    1)
        echo "Building debug APK..."
        cd android
        ./gradlew assembleDebug
        echo "Debug APK: android/app/build/outputs/apk/debug/app-debug.apk"
        ;;
    2)
        echo "Building release APK..."
        cd android
        ./gradlew assembleRelease
        echo "Release APK: android/app/build/outputs/apk/release/app-release.apk"
        ;;
    3)
        echo "Building release AAB..."
        cd android
        ./gradlew bundleRelease
        echo "Release AAB: android/app/build/outputs/bundle/release/app-release.aab"
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "=== Preparation Complete ==="
echo ""
echo "Next steps:"
echo "1. Test the build on actual devices"
echo "2. Prepare store listing assets (screenshots, descriptions)"
echo "3. Set up privacy policy URL"
echo "4. Complete Google Play Console submission"
echo ""
echo "See GOOGLE_PLAY_SUBMISSION.md for detailed instructions"
