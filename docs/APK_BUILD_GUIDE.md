# APK Build Guide

This guide explains how to use GitHub Actions to automatically build Android APK files for the DermaScan AI app.

## 🚀 Automated APK Building

The project uses GitHub Actions to automatically build Android APK files whenever you push to the `main` or `develop` branches.

### How It Works

1. **Automatic Triggers**: The workflow runs automatically when you:
   - Push code to `main` or `develop` branches
   - Create a pull request to these branches
   - Manually trigger the workflow from GitHub Actions tab

2. **Build Process**: The workflow:
   - Builds the React frontend
   - Syncs with Capacitor for Android
   - Compiles the Android project
   - Generates APK and AAB files
   - Uploads the files as GitHub artifacts

3. **Output Files**: The workflow generates:
   - **Debug APK**: `app-debug.apk` (for testing)
   - **Release APK**: `app-release.apk` (main branch only)
   - **Release AAB**: `app-release.aab` (main branch only, for Play Store)

## 📥 Downloading the APK

### Option 1: From GitHub Actions (Recommended)

1. Go to the [GitHub Actions page](https://github.com/Hdd5ps/skin-cancer-ai-absention/actions)
2. Click on the latest "Build Android APK" workflow run
3. Scroll down to the "Artifacts" section
4. Download the desired artifact:
   - `dermascan-debug-apk` - Contains the debug APK
   - `dermascan-release-apk` - Contains the release APK (main branch only)
   - `dermascan-release-aab` - Contains the Play Store bundle (main branch only)

### Option 2: Manual Trigger

You can also manually trigger a build:

1. Go to the [GitHub Actions page](https://github.com/Hdd5ps/skin-cancer-ai-absention/actions)
2. Select "Build Android APK" workflow
3. Click "Run workflow"
4. Select the branch and click "Run workflow"
5. Wait for the build to complete (~5-10 minutes)
6. Download the artifacts from the completed run

## 📱 Installing the APK on Your Phone

### For Debug APK

1. **Enable Unknown Sources** on your Android phone:
   - Go to Settings > Security > Unknown Sources (enable it)
   - Or Settings > Apps & notifications > Special app access > Install unknown apps

2. **Download the APK**:
   - Download from GitHub Actions artifacts
   - Extract the ZIP file if needed
   - Transfer the `app-debug.apk` to your phone

3. **Install the APK**:
   - Open the file on your phone
   - Tap "Install"
   - Grant permissions when prompted (Camera, Storage)

### For Release APK

The release APK is signed with a release keystore and is ready for distribution. The installation process is the same as for the debug APK.

## 🔧 Manual Building (Advanced)

If you need to build the APK locally:

### Prerequisites
- Node.js 18+ and npm
- Java 17
- Android SDK
- Android Studio (optional but recommended)

### Build Steps

```bash
# 1. Clone the repository
git clone https://github.com/Hdd5ps/skin-cancer-ai-absention.git
cd skin-cancer-ai-absention

# 2. Install dependencies
npm install

# 3. Build the frontend
npm run build

# 4. Sync with Capacitor
npx cap sync android

# 5. Build the APK
cd android
./gradlew assembleDebug  # For debug APK
./gradlew assembleRelease  # For release APK

# 6. Find the APK
# Debug: android/app/build/outputs/apk/debug/app-debug.apk
# Release: android/app/build/outputs/apk/release/app-release.apk
```

## 📋 Build Information

- **Package Name**: `com.dermascan.app`
- **App Name**: DermaScan AI
- **Version**: 1.0.0
- **Minimum SDK**: API 21 (Android 5.0)
- **Target SDK**: API 34 (Android 14)

## 🔐 Signing Configuration

### Debug Build
- Uses Android debug keystore
- Suitable for testing and development
- Not recommended for production distribution

### Release Build
- Requires proper signing configuration
- For production use, configure signing in `android/signing.gradle`
- See [MOBILE_DEPLOYMENT.md](../MOBILE_DEPLOYMENT.md) for signing setup

## 🐛 Troubleshooting

### Build Failures

If the GitHub Actions build fails:

1. Check the build logs in the Actions tab
2. Common issues:
   - Dependency conflicts (check package.json)
   - Capacitor sync issues (try running `npx cap sync android` locally)
   - Android SDK configuration issues

### Installation Issues

If you can't install the APK:

1. **"Install Blocked" error**:
   - Enable "Unknown Sources" in phone settings
   - Check if your phone has security apps blocking installation

2. **"App not installed" error**:
   - Uninstall any previous version
   - Check if you have enough storage space
   - Try rebooting your phone

3. **Permission issues**:
   - Make sure to grant Camera and Storage permissions when prompted
   - Check phone settings > Apps > DermaScan AI > Permissions

## 📊 Build Status

You can check the current build status at:
[GitHub Actions - Build Android APK](https://github.com/Hdd5ps/skin-cancer-ai-absention/actions/workflows/android-build.yml)

## 🆘 Support

If you encounter issues with the build process:

1. Check the [GitHub Issues](https://github.com/Hdd5ps/skin-cancer-ai-absention/issues) for similar problems
2. Create a new issue with:
   - Build logs (from GitHub Actions)
   - Steps to reproduce
   - Your environment details (OS, phone model, etc.)

## 📚 Additional Resources

- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
- [Android Studio Build Guide](https://developer.android.com/studio/build)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [MOBILE_DEPLOYMENT.md](../MOBILE_DEPLOYMENT.md) - Mobile deployment strategy