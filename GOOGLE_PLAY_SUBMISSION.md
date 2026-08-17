# Google Play Store Submission Guide

Complete guide for submitting the Skin Cancer AI app to the Google Play Store.

## Prerequisites

- ✅ Google Play Developer Account ($25 one-time fee)
- ✅ App signing keystore configured
- ✅ Release build (AAB file) generated
- ✅ Store listing assets prepared
- ✅ Privacy policy published
- ✅ Testing completed

## Pre-Submission Checklist

### Technical Requirements
- [ ] App signing keystore created and secured
- [ ] Release AAB build generated
- [ ] App tested on multiple Android devices
- [ ] Camera functionality verified
- [ ] API integration tested
- [ ] Performance tested
- [ ] Security tested
- [ ] Crash reporting configured

### Store Listing Requirements
- [ ] App name: "DermaScan AI" or "Skin Cancer AI"
- [ ] Short description (80 characters max)
- [ ] Full description (4000 characters max)
- [ ] Screenshots (at least 2, phone required)
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Privacy policy URL
- [ ] Contact email
- [ ] Website URL

### Content Rating
- [ ] Content rating questionnaire completed
- [ ] Medical content properly disclosed
- [ ] Age rating appropriate (Teen or higher)

## Step-by-Step Submission Process

### 1. Create Google Play Console App

1. Go to [Google Play Console](https://play.google.com/console)
2. Click "Create app"
3. Fill in app details:
   - **App name**: DermaScan AI
   - **Default language**: English
   - **Free or Paid**: Free
   - **Contains ads**: No

### 2. Complete Store Listing

#### App Details
```
App name: DermaScan AI
Short description: AI-powered skin lesion screening with dual-gated analysis pipeline
Full description: [Use full description from APP_STORE_LISTINGS.md]
```

#### Store Listing Assets
- **App icon**: 512x512 PNG (transparent background, no rounded corners)
- **Feature graphic**: 1024x500 PNG (hero image for store listing)
- **Screenshots**: At least 2 phone screenshots
  - Phone: Minimum 320px, Recommended 1080x1920
  - Tablet: Minimum 320px, Recommended 2028x2732

#### Contact Information
```
Email: [your-email@example.com]
Website: [your-website.com]
Privacy Policy: [your-website.com/privacy]
```

### 3. Content Rating

1. Navigate to "Content rating" section
2. Complete the questionnaire:
   - **Medical content**: Yes
   - **User generated content**: No
   - **Violence**: None
   - **Sexual content**: None
   - **Profanity**: None
3. Review and submit rating

### 4. Pricing and Distribution

1. **Pricing**: Free
2. **Distribution**: 
   - All countries (or select specific regions)
   - All devices (phones and tablets)
3. **Content guidelines**: Medical apps category

### 5. Upload Release Build

1. Navigate to "Release" section
2. Create new release:
   - **Release type**: Production
   - **Release name**: "1.0.0 - Initial Release"
3. Build the frontend first:
   ```bash
   npm run build
   ```
4. Upload AAB file:
   ```bash
   npm run android:build:bundle
   # Output: android/app/build/outputs/bundle/release/app-release.aab
   ```
5. Add release notes:
   ```
   Initial release of DermaScan AI:
   - AI-powered skin lesion screening
   - Dual-gated analysis pipeline
   - Scan history and tracking
   - Body location mapping
   - Privacy-focused local processing
   ```

### 6. App Signing

1. Choose app signing method:
   - **App signing by Google Play** (Recommended)
   - **Export and upload key** (if you have existing keystore)

2. If using your keystore:
   - Upload your keystore file
   - Enter keystore credentials
   - Verify signing configuration

### 7. Review and Submit

1. Review all information
2. Check for warnings or errors
3. Submit for review

## Store Listing Content

### Short Description (80 chars max)
```
AI-powered skin lesion screening with dual-gated analysis pipeline
```

### Full Description
```
DermaScan AI is an advanced skin lesion screening application that uses artificial intelligence to help you monitor skin health. Our dual-gated analysis pipeline combines blur detection with calibrated MobileNetV2 model inference to provide reliable assessments.

KEY FEATURES:
• AI-Powered Analysis: Advanced machine learning for skin lesion assessment
• Blur Detection: Automatic image quality validation
• Confidence Metrics: Calibrated predictions with confidence scores
• Scan History: Track lesions over time with detailed records
• Body Location Mapping: Record where lesions are located
• Side-by-Side Comparison: Monitor lesion evolution over time
• Medical Disclaimers: Clear guidance for professional consultation

HOW IT WORKS:
1. Capture a photo of a skin lesion using your device camera
2. Our AI analyzes the image through our dual-gated pipeline
3. Receive confidence-based results with medical context
4. Track your scans over time to monitor changes
5. Share results with healthcare professionals

IMPORTANT MEDICAL DISCLAIMER:
This application is a screening tool only and is not intended as a diagnostic device. The results provided are for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

TECHNICAL DETAILS:
• Model: MobileNetV2 with temperature scaling
• Validation AUC: 0.8884
• Calibration ECE: 0.0730
• Privacy: Images processed locally when possible
• Storage: Encrypted local storage for scan history

PRIVACY & SECURITY:
• No personal health information collected
• Images processed locally when possible
• Encrypted storage for scan history
• No data sharing without consent

For educational and monitoring purposes only. Not a replacement for professional medical evaluation.
```

### Keywords
```
skin cancer, dermatology, lesion screening, health monitoring, AI medical, skin health, mole analysis, dermatologist assistant, skin examination, medical AI
```

## Asset Specifications

### App Icon
- **Size**: 512x512 pixels
- **Format**: PNG with transparency
- **Safe zone**: Center 66% of the icon
- **No rounded corners** (Google adds them)
- **No shadows or gradients** (Google adds them)

### Feature Graphic
- **Size**: 1024x500 pixels
- **Format**: PNG or JPG
- **Content**: App branding and key features
- **Text**: Minimal, readable at small sizes

### Screenshots
- **Phone**: 
  - Minimum: 320px width
  - Recommended: 1080x1920 (9:16 aspect ratio)
  - Maximum: 3840px width
- **Tablet**:
  - Minimum: 320px width
  - Recommended: 2028x2732 (3:4 aspect ratio)
  - Maximum: 3840px width

## Build Commands

### Build Frontend First
```bash
npm run build
```

### Generate Release AAB
```bash
npm run android:build:bundle
```

### Generate Release APK
```bash
npm run android:build:release
```

### Generate Debug APK
```bash
npm run android:build:debug
```

### Install Debug APK
```bash
npm run android:install:debug
```

## Troubleshooting

### Build Errors
- **Keystore not found**: Check `gradle.properties` configuration
- **Password incorrect**: Verify keystore credentials
- **Signing config errors**: Check `signing.gradle` configuration

### Store Listing Errors
- **Image size incorrect**: Verify asset dimensions
- **Description too long**: Stay within character limits
- **Missing assets**: Ensure all required assets are uploaded

### Review Rejections
- **Medical content**: Ensure proper disclaimers
- **Privacy policy**: Must be accessible and comprehensive
- **Camera permissions**: Justify camera usage in description

## Post-Submission

### Monitor Review Status
- Check Google Play Console for review updates
- Review process typically takes 1-3 days
- Respond to reviewer feedback promptly

### Prepare for Launch
- Prepare marketing materials
- Set up user support channels
- Monitor crash reports and analytics
- Prepare for user feedback

### Update Strategy
- Plan regular updates
- Monitor user reviews
- Address bugs quickly
- Add features based on feedback

## Resources

- [Google Play Console](https://play.google.com/console)
- [Android Developers](https://developer.android.com)
- [Play Store Guidelines](https://play.google.com/about/developer-content-policy)
- [Play Console Help](https://support.google.com/googleplay/android-developer)

## Timeline

### Day 1: Preparation
- Build frontend: `npm run build`
- Generate release build: `npm run android:build:bundle`
- Prepare store listing assets
- Complete content rating

### Day 2: Submission
- Create app in Play Console
- Upload release build
- Complete store listing
- Submit for review

### Day 3-5: Review
- Monitor review status
- Respond to any feedback
- Prepare for launch

### Day 6+: Launch
- App goes live
- Monitor performance
- Address any issues
- Marketing and promotion

## Important Notes

- **Medical Disclaimer**: Ensure all medical disclaimers are prominent
- **Privacy Policy**: Must be comprehensive and accessible
- **Camera Permissions**: Clearly explain camera usage
- **User Safety**: Emphasize this is a screening tool, not diagnostic
- **Regular Updates**: Plan for ongoing maintenance and updates
