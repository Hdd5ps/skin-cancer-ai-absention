# App Store Assets Guide

## Android Play Store Assets

### Required Graphics

#### App Icon
- **Size**: 512 x 512 pixels
- **Format**: PNG (no transparency)
- **Current**: You have `icon-512.png` in project root
- **Location**: Use this for Play Store listing

#### Feature Graphic
- **Size**: 1024 x 500 pixels
- **Format**: PNG or JPG
- **Purpose**: Promotional banner in Play Store
- **Recommendation**: Create with app branding and "AI Skin Lesion Screening" text

#### Screenshots
**Phone Screenshots** (at least 2, maximum 8):
- **Minimum**: 320dp width
- **Recommended**: 1080 x 1920 pixels (1080p phones)
- **Formats**: PNG or JPG
- **Required orientations**: Portrait

**Tablet Screenshots** (optional but recommended):
- **Size**: 1200 x 1920 pixels (7" tablets)
- **Size**: 1600 x 2560 pixels (10" tablets)

### Current App Screenshots to Capture

#### Screen 1: Home/Landing
- **Show**: App introduction and "Scan Lesion" button
- **Purpose**: Show app's main purpose
- **Text**: "AI-Powered Skin Lesion Screening"

#### Screen 2: Camera Interface
- **Show**: Camera viewfinder with targeting overlay
- **Purpose**: Demonstrate camera functionality
- **Text**: "Position lesion within frame"

#### Screen 3: Results Display
- **Show**: Analysis results with confidence metrics
- **Purpose**: Show AI analysis output
- **Text**: "Analysis Complete"

#### Screen 4: Scan History
- **Show**: List of previous scans with dates
- **Purpose**: Show tracking capability
- **Text**: "Track Lesions Over Time"

#### Screen 5: Comparison View
- **Show**: Side-by-side lesion comparison
- **Purpose**: Show evolution tracking
- **Text**: "Monitor Changes"

### Text Content

#### Short Description (80 characters max)
```
AI-powered skin lesion screening with dual-gated analysis pipeline.
```

#### Full Description (4000 characters max)
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

## iOS App Store Assets

### Required Graphics

#### App Icon
- **Size**: 1024 x 1024 pixels
- **Format**: PNG (no transparency)
- **Corner radius**: None (Apple will apply rounding)
- **Current**: You have `icon-512.png` - need to upscale to 1024x1024

#### Screenshots
**iPhone Screenshots** (required):
- **iPhone 6.7" Display**: 1290 x 2796 pixels
- **iPhone 6.5" Display**: 1242 x 2688 pixels
- **iPhone 5.5" Display**: 1242 x 2208 pixels

**iPad Screenshots** (recommended):
- **iPad Pro 12.9" Display**: 2048 x 2732 pixels
- **iPad Pro 11" Display**: 1668 x 2388 pixels

### iOS Text Content

#### Subtitle (30 characters max)
```
AI Skin Lesion Screening
```

#### Description (4000 characters max)
```
DermaScan AI helps you monitor skin health with advanced artificial intelligence. Our dual-gated analysis pipeline provides reliable skin lesion assessments for educational and monitoring purposes.

Features:
• AI-powered skin lesion analysis
• Automatic image quality validation
• Confidence-based predictions
• Scan history and tracking
• Body location mapping
• Lesion evolution comparison
• Privacy-focused local processing

Important: This is a screening tool only, not a diagnostic device. Always consult healthcare professionals for medical evaluation.
```

#### Keywords (100 characters max)
```
skin cancer, dermatology, lesion screening, health monitoring, AI medical
```

## Asset Creation Tools

### Recommended Tools
- **Canva**: Free design tool with app store templates
- **Figma**: Professional design tool (free tier available)
- **Sketch**: Mac-only design tool
- **Adobe XD**: Free design tool from Adobe

### Screenshot Capture Tools
- **Android**: Android Studio Emulator or device screenshots
- **iOS**: Xcode Simulator or device screenshots
- **Third-party**: CleanShot X, Snagit

## Asset Specifications Summary

### Android Play Store
| Asset | Size | Format | Required |
|-------|------|--------|----------|
| App Icon | 512x512 | PNG | Yes |
| Feature Graphic | 1024x500 | PNG/JPG | Recommended |
| Screenshots | 1080x1920 | PNG/JPG | Min 2, Max 8 |
| Short Description | 80 chars | Text | Yes |
| Full Description | 4000 chars | Text | Yes |

### iOS App Store
| Asset | Size | Format | Required |
|-------|------|--------|----------|
| App Icon | 1024x1024 | PNG | Yes |
| Screenshots | Various | PNG | Yes |
| Subtitle | 30 chars | Text | Yes |
| Description | 4000 chars | Text | Yes |
| Keywords | 100 chars | Text | Yes |

## Asset Creation Checklist

### Before Starting
- [ ] Install design tool (Canva/Figma)
- [ ] Set up Android emulator or use device
- [ ] Set up iOS simulator or use device
- [ ] Prepare brand guidelines (colors, fonts)

### Android Assets
- [ ] Create 512x512 app icon from existing icon-512.png
- [ ] Create 1024x500 feature graphic
- [ ] Capture 2-8 app screenshots (1080x1920)
- [ ] Write short description (80 chars)
- [ ] Write full description (4000 chars)

### iOS Assets
- [ ] Create 1024x1024 app icon from existing icon-512.png
- [ ] Capture iPhone screenshots (various sizes)
- [ ] Capture iPad screenshots (optional)
- [ ] Write subtitle (30 chars)
- [ ] Write description (4000 chars)
- [ ] Write keywords (100 chars)

## Medical Compliance Assets

### Required Disclaimers
- **Medical Disclaimer**: Prominent in app description
- **Privacy Policy**: Link to privacy policy
- **Terms of Service**: Link to terms
- **Data Handling**: Explain data collection and usage

### Privacy Policy Requirements
- **Data Collection**: What data you collect
- **Data Usage**: How you use the data
- **Data Sharing**: Who you share with (if anyone)
- **User Rights**: How users can control their data
- **Contact**: How to reach you

## Asset Storage

### Recommended Structure
```
/app-store-assets/
  /android/
    /icons/
      icon-512.png
    /screenshots/
      screenshot-1.png
      screenshot-2.png
    /graphics/
      feature-graphic.png
  /ios/
    /icons/
      icon-1024.png
    /screenshots/
      iphone-6.7.png
      iphone-6.5.png
      ipad-pro.png
  /text/
    android-description.txt
    ios-description.txt
    privacy-policy.txt
    terms-of-service.txt
```

## Next Steps

1. **Create Icons**: Scale existing icons to required sizes
2. **Capture Screenshots**: Take screenshots of all major screens
3. **Create Feature Graphic**: Design promotional banner for Android
4. **Write Descriptions**: Finalize app descriptions for both stores
5. **Legal Documents**: Create privacy policy and terms of service
6. **Review**: Check all assets against store guidelines
7. **Upload**: Submit assets to respective app stores