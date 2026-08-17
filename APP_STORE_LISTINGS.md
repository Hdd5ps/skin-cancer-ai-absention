# App Store Listings and Metadata

## Google Play Store Listing

### App Information
- **App Name**: DermaScan AI
- **Short Description**: AI-powered skin lesion screening with dual-gated analysis pipeline
- **Full Description**: See APP_STORE_ASSETS.md for full description
- **Category**: Medical
- **Content Rating**: Teen (medical content, guidance for professional consultation)

### Store Listing Details

#### Contact Information
- **Website**: [your-website.com]
- **Email**: [your-email@example.com]
- **Privacy Policy URL**: [your-website.com/privacy]
- **Terms of Service URL**: [your-website.com/terms]

#### Pricing and Distribution
- **Price**: Free
- **Distribution**: All countries (select specific if needed)
- **Content Guidelines**: Medical apps - requires proper disclaimers

#### App Accessibility
- **Accessibility**: Describe accessibility features
- **Supported Languages**: English (add more as needed)

### Play Store Metadata Files

#### play_store_listing.txt
```
App Name: DermaScan AI
Short Description: AI-powered skin lesion screening with dual-gated analysis pipeline
Category: Medical
Content Rating: Teen
Price: Free
Website: [your-website.com]
Email: [your-email@example.com]
Privacy Policy: [your-website.com/privacy]
```

#### play_store_keywords.txt
```
skin cancer, dermatology, lesion screening, health monitoring, AI medical, skin health, mole analysis, dermatologist assistant, skin examination, medical AI
```

#### play_store_short_description.txt
```
AI-powered skin lesion screening with dual-gated analysis pipeline.
```

#### play_store_full_description.txt
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

## Apple App Store Listing

### App Information
- **App Name**: DermaScan AI
- **Subtitle**: AI Skin Lesion Screening
- **Bundle ID**: com.dermascan.app
- **Category**: Medical
- **Age Rating**: 12+ (medical content)

### Store Listing Details

#### Contact Information
- **Support URL**: [your-website.com/support]
- **Marketing URL**: [your-website.com]
- **Privacy Policy URL**: [your-website.com/privacy]

#### App Information
- **Copyright**: [Your Company Name] © 2026
- **Version**: 1.0.0
- **Release Date**: [Release Date]

### App Store Metadata Files

#### app_store_subtitle.txt
```
AI Skin Lesion Screening
```

#### app_store_description.txt
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

#### app_store_keywords.txt
```
skin cancer, dermatology, lesion screening, health monitoring, AI medical
```

#### app_store_whats_new.txt
```
Version 1.0.0

Initial Release:
• AI-powered skin lesion screening
• Dual-gated analysis pipeline
• Scan history and tracking
• Body location mapping
• Lesion evolution comparison
• Privacy-focused local processing
• Medical disclaimers and professional guidance
```

## App Store Screenshots Requirements

### Android Play Store Screenshots

#### Phone Screenshots (Required)
- **Screen 1 - Home**: App landing with "Scan Lesion" button
- **Screen 2 - Camera**: Camera interface with targeting overlay
- **Screen 3 - Results**: Analysis results with confidence metrics
- **Screen 4 - History**: Scan history list
- **Screen 5 - Comparison**: Side-by-side lesion comparison

#### Tablet Screenshots (Recommended)
- Same screens but optimized for tablet layout

### iOS App Store Screenshots

#### iPhone Screenshots (Required)
- **iPhone 6.7"**: 1290 x 2796 pixels
- **iPhone 6.5"**: 1242 x 2688 pixels
- **iPhone 5.5"**: 1242 x 2208 pixels

#### iPad Screenshots (Recommended)
- **iPad Pro 12.9"**: 2048 x 2732 pixels
- **iPad Pro 11"**: 1668 x 2388 pixels

## App Store Optimization (ASO)

### Keywords Strategy

#### Primary Keywords
- skin cancer
- dermatology
- lesion screening
- health monitoring
- AI medical

#### Secondary Keywords
- skin health
- mole analysis
- dermatologist assistant
- skin examination
- medical AI

### Title and Description Optimization

#### Play Store
- **Title**: DermaScan AI (includes brand + function)
- **Short Description**: AI-powered skin lesion screening with dual-gated analysis pipeline
- **Full Description**: Comprehensive with keywords naturally integrated

#### App Store
- **Title**: DermaScan AI
- **Subtitle**: AI Skin Lesion Screening
- **Description**: Comprehensive with keywords naturally integrated

## Metadata Files for Submission

### Android Play Store

#### android_metadata.json
```json
{
  "app_name": "DermaScan AI",
  "short_description": "AI-powered skin lesion screening with dual-gated analysis pipeline",
  "full_description": "DermaScan AI is an advanced skin lesion screening application...",
  "category": "Medical",
  "content_rating": "Teen",
  "price": "Free",
  "website": "[your-website.com]",
  "email": "[your-email@example.com]",
  "privacy_policy": "[your-website.com/privacy]",
  "keywords": ["skin cancer", "dermatology", "lesion screening", "health monitoring", "AI medical"]
}
```

### iOS App Store

#### ios_metadata.json
```json
{
  "app_name": "DermaScan AI",
  "subtitle": "AI Skin Lesion Screening",
  "bundle_id": "com.dermascan.app",
  "category": "Medical",
  "age_rating": "12+",
  "description": "DermaScan AI helps you monitor skin health with advanced artificial intelligence...",
  "keywords": ["skin cancer", "dermatology", "lesion screening", "health monitoring", "AI medical"],
  "support_url": "[your-website.com/support]",
  "marketing_url": "[your-website.com]",
  "privacy_policy": "[your-website.com/privacy]",
  "version": "1.0.0",
  "copyright": "[Your Company Name] © 2026"
}
```

## Pre-Submission Checklist

### Android Play Store
- [ ] App name and description finalized
- [ ] Screenshots captured and optimized
- [ ] App icon (512x512) created
- [ ] Feature graphic (1024x500) created
- [ ] Privacy policy URL set
- [ ] Terms of service URL set
- [ ] Contact information updated
- [ ] Content rating completed
- [ ] Category selected (Medical)
- [ ] Pricing set (Free)
- [ ] Distribution configured
- [ ] Medical disclaimers included
- [ ] Age rating appropriate

### iOS App Store
- [ ] App name and subtitle finalized
- [ ] Description and keywords finalized
- [ ] Screenshots captured and optimized
- [ ] App icon (1024x1024) created
- [ ] Bundle ID configured
- [ ] Category selected (Medical)
- [ ] Age rating completed (12+)
- [ ] Privacy policy URL set
- [ ] Support URL set
- [ ] Version information set
- [ ] Medical disclaimers included
- [ ] App privacy details completed

## Submission Process

### Android Play Store Submission
1. **Create Developer Account**: $25 one-time fee
2. **Create App**: Fill in app information
3. **Upload APK/AAB**: Use generated release build
4. **Add Store Listing**: Fill in all required information
5. **Set Pricing**: Set price and distribution
6. **Content Rating**: Complete content rating questionnaire
7. **Submit for Review**: Wait for Google review (1-3 days)

### iOS App Store Submission
1. **Create Developer Account**: $99/year fee
2. **Create App Record**: Fill in app information
3. **Upload Build**: Upload from Xcode Organizer
4. **Add Store Listing**: Fill in all required information
5. **Set Pricing**: Set price and availability
6. **Submit for Review**: Wait for Apple review (1-2 weeks)

## Post-Submission

### Monitor Review Process
- **Play Store**: Check Google Play Console for review status
- **App Store**: Check App Store Connect for review status
- **Respond to Feedback**: Address any reviewer feedback promptly

### Prepare for Launch
- **Marketing Materials**: Prepare launch marketing
- **Support Documentation**: Prepare user support documentation
- **Monitoring**: Set up crash reporting and analytics
- **User Feedback**: Prepare to collect user feedback

## Analytics and Monitoring

### Required Analytics
- **Crash Reporting**: Firebase Crashlytics
- **Performance Monitoring**: Firebase Performance Monitoring
- **User Analytics**: Google Analytics/Firebase Analytics
- **Usage Metrics**: In-app usage tracking

### Privacy Compliance
- **App Privacy**: Complete app privacy details
- **Data Collection**: Disclose data collection practices
- **Third-party SDKs**: List any third-party SDKs
- **User Rights**: Explain user data rights

## Maintenance and Updates

### Regular Updates
- **Bug Fixes**: Address user-reported bugs
- **Feature Updates**: Add new features based on user feedback
- **Model Updates**: Update AI model with new data
- **Security Updates**: Maintain security standards

### Store Optimization
- **Monitor Performance**: Track app store performance
- **Update Metadata**: Optimize descriptions and keywords
- **A/B Testing**: Test different screenshots and descriptions
- **User Reviews**: Respond to user reviews and feedback

## Legal Considerations

### Medical App Regulations
- **FDA Compliance**: Consider FDA requirements for medical apps
- **CE Mark**: Consider CE mark requirements for European market
- **Local Regulations**: Comply with local medical device regulations
- **Disclaimer Requirements**: Maintain proper medical disclaimers

### Liability Protection
- **Terms of Service**: Comprehensive terms of service
- **Privacy Policy**: Comprehensive privacy policy
- **Disclaimers**: Strong medical disclaimers
- **Insurance**: Consider appropriate insurance coverage

## Next Steps

1. **Finalize Metadata**: Complete all metadata files
2. **Create Screenshots**: Capture and optimize app screenshots
3. **Create Icons**: Create app icons for both stores
4. **Set Up URLs**: Set up privacy policy and support URLs
5. **Test Build**: Test release builds on actual devices
6. **Submit**: Submit to both app stores
7. **Monitor**: Monitor review process and respond to feedback

## Support Resources

### Android Developer Resources
- **Google Play Console**: https://play.google.com/console
- **Android Developers**: https://developer.android.com
- **Play Store Guidelines**: https://play.google.com/about/developer-content-policy

### iOS Developer Resources
- **App Store Connect**: https://appstoreconnect.apple.com
- **Apple Developer**: https://developer.apple.com
- **App Store Guidelines**: https://developer.apple.com/app-store/review/guidelines

### Medical App Resources
- **FDA Digital Health**: https://www.fda.gov/medical-devices/digital-health
- **CE Mark Requirements**: https://ec.europa.eu/growth/sectors/medical-devices
- **Medical App Guidelines**: Follow app store medical app guidelines