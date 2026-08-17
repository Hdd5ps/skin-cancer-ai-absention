# DermaScan AI

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2.8-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-blue)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-green)](https://www.python.org/)

AI-powered skin lesion screening application with dual-gated analysis pipeline.

## 🎯 Project Overview

DermaScan AI is a personal project focused on learning and development in AI-powered medical applications. It uses advanced machine learning techniques to assist in the early detection of potential skin cancer through image analysis of skin lesions.

### ⚠️ Important Medical Disclaimer
**This application is a screening tool only and is not intended as a diagnostic device.** The results provided are for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

## 📋 Project Status

**Current Status**: Development / Personal Project

**Latest Version**: 1.0.0

**Platform Support**:
- ✅ Web Application (React + Vite)
- ✅ Android (Capacitor)
- ✅ iOS (Capacitor)

**Key Features Implemented**:
- ✅ AI-powered skin lesion analysis
- ✅ Dual-gated analysis pipeline (blur detection + ML inference)
- ✅ Scan history and tracking
- ✅ Body location mapping
- ✅ Confidence-based results
- ✅ Mobile-responsive design
- 🔄 Cloud deployment (in progress)
- 🔄 App store submission (planned)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.8+
- Basic knowledge of terminal commands

### Development Setup

1. **Install Frontend Dependencies**
   ```bash
   pnpm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   pip install -r requirements.opencv.txt
   cd ..
   ```

3. **Start Backend Server** (Terminal 1)
   ```bash
   cd backend
   python -m uvicorn app:app --host 0.0.0.0 --port 8000
   ```

4. **Start Frontend Development Server** (Terminal 2)
   ```bash
   pnpm dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:8443
   - Backend API: http://localhost:8000
   - Health check: http://localhost:8000/health

## 🏗️ Architecture

### Frontend (React + Vite)
- **Tech Stack**: React 19, Vite 8, Tailwind CSS v4, TypeScript 7.0.2
- **Screens**:
  - Home Screen - Landing page with app introduction
  - Camera Screen - Image capture with blur detection
  - Results Screen - AI analysis results with confidence metrics
  - Blur Error Screen - Feedback for poor quality images
  - Uncertainty Screen - Low confidence result handling
  - Scan History Screen - Track lesions over time

### Backend (FastAPI + PyTorch)
- **Tech Stack**: FastAPI, Uvicorn, PyTorch, OpenCV
- **Features**:
  - Dual-gated analysis pipeline
  - Gate 1: Blur detection using Laplacian variance
  - Gate 2: Calibrated MobileNetV2 model inference
  - Confidence thresholding for reliable predictions
  - CORS support for mobile/web clients

### AI Model
- **Architecture**: MobileNetV2 with temperature scaling
- **Classes**: Benign Nevus vs Melanoma
- **Validation AUC**: 0.8884
- **Calibration ECE**: 0.0730

## 📱 Features

### Core Functionality
- ✅ AI-powered skin lesion analysis
- ✅ Image quality validation (blur detection)
- ✅ Confidence-based result filtering
- ✅ ABCDE feature analysis
- ✅ Model validation metrics display
- ✅ Medical disclaimers and safety gates

### New Features (Recently Added)
- ✅ **Scan History** - Track lesions over time
- ✅ **Body Location Mapping** - Record where lesions are located
- ✅ **Side-by-side Comparison** - Monitor lesion evolution
- ✅ **Local Storage** - Persistent scan records
- ✅ **Detailed Analytics** - Confidence trends and changes

## 🔧 Configuration

### Environment Variables
Create `.env.development` for local development:
```env
API_URL=http://localhost:8000/predict
VITE_ENABLE_HISTORY=true
VITE_ENABLE_BODY_MAPPING=true
```

### API Configuration
- Development: `http://localhost:8000/predict`
- Production: Set via `API_URL` environment variable

## 🧪 Testing

### Frontend Tests
```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Run performance tests
pnpm test:performance

# Run security tests
pnpm test:security
```

### Backend Tests
```bash
cd backend
pytest
```

### Manual Testing
1. Navigate to http://localhost:8443
2. Click "Scan Lesion"
3. Upload a skin lesion image
4. View results and check scan history

## 📦 Deployment

### Frontend Build
```bash
pnpm build
```

### Backend Production
```bash
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

## 🚀 Mobile App Deployment

### 📱 Getting the Installable APK

The easiest way to get an installable APK for your Android phone is through our automated GitHub Actions build:

1. **Automatic APK Building**: GitHub Actions automatically builds APK files when code is pushed to the main branch
2. **Download from GitHub Actions**: 
   - Go to [GitHub Actions](https://github.com/Hdd5ps/skin-cancer-ai-absention/actions)
   - Click on the latest "Build Android APK" workflow
   - Download the `dermascan-debug-apk` artifact
   - Extract and install the `app-debug.apk` on your phone

3. **Manual Build Trigger**: You can also manually trigger a build from the Actions tab

For detailed instructions, see [docs/APK_BUILD_GUIDE.md](./docs/APK_BUILD_GUIDE.md).

### Manual Mobile Setup (Capacitor)
For development purposes, you can also build locally:
```bash
# Install Capacitor
pnpm add @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
pnpm exec cap init

# Add platforms
pnpm exec cap add android
pnpm exec cap add ios

# Build and sync
pnpm build
pnpm exec cap sync
```

For detailed mobile deployment strategy, see [MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md).

## 🔒 Security & Compliance

### Medical Disclaimer
This application is a screening tool only and is not intended as a diagnostic device. Always consult a qualified dermatologist for clinical evaluation.

### Data Privacy
- Images are processed locally when possible
- Scan history stored in local storage
- No personal health information collected
- HIPAA considerations for cloud deployment

## 📊 Performance Metrics

- App startup time: < 3 seconds
- Camera capture: < 2 seconds
- API response time: < 5 seconds
- Model inference: < 1 second (CPU)

## 🛠️ Troubleshooting

### Backend Issues
- **Model not loading**: Check `backend/models/` directory exists
- **OpenCV errors**: Install with `pip install -r requirements.opencv.txt`
- **Port conflicts**: Change port in uvicorn command

### Frontend Issues
- **API connection errors**: Verify backend is running on port 8000
- **Build failures**: Clear cache with `rm -rf node_modules .vite` and reinstall with `pnpm install`
- **Styling issues**: Ensure Tailwind CSS v4 is properly configured

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! This is a personal project focused on learning and development in AI-powered medical applications.

For detailed contribution guidelines, please see [CONTRIBUTING.md](./CONTRIBUTING.md).

### Quick Start
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues and questions:
- **GitHub Issues**: [Report bugs or request features](https://github.com/Hdd5ps/skin-cancer-ai-absention/issues)
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Email**: For direct communication regarding the project

## 🙏 Acknowledgments

- **MobileNetV2** architecture by Google Research
- **React** and **Vite** for the frontend framework
- **FastAPI** for the backend API framework
- **Capacitor** for mobile app deployment
- **Medical device regulations** guidance from FDA and other regulatory bodies
- **AI ethics and safety principles** from the AI research community
- **Open source community** for various tools and libraries used in this project

## 📚 Additional Resources

- [AGENTS.md](./AGENTS.md) - Development setup and architecture
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing procedures and guidelines
- [LAUNCH_GUIDE.md](./LAUNCH_GUIDE.md) - Launch procedures and checklist
- [MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md) - Mobile deployment strategy
- [CLOUD_DEPLOYMENT.md](./CLOUD_DEPLOYMENT.md) - Backend cloud deployment options
- [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) - Privacy policy for the application
- [TERMS_OF_SERVICE.md](./TERMS_OF_SERVICE.md) - Terms of service
- [MEDICAL_COMPLIANCE.md](./MEDICAL_COMPLIANCE.md) - Medical compliance information

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] AI-powered skin lesion analysis
- [x] Dual-gated analysis pipeline
- [x] Web application interface
- [x] Mobile-responsive design
- [x] Scan history and tracking

### Phase 2: Mobile Deployment 🔄
- [x] Capacitor integration
- [x] Android/iOS configuration
- [x] Camera plugin integration
- [ ] Native camera optimization
- [ ] App store submission preparation

### Phase 3: Cloud Deployment 🔄
- [x] Backend API development
- [x] Cloud deployment guides
- [ ] Production cloud deployment
- [ ] API rate limiting and security
- [ ] Monitoring and analytics

### Phase 4: Advanced Features 📋
- [ ] Multi-language support
- [ ] Advanced image enhancement
- [ ] Integration with healthcare providers
- [ ] User authentication (if needed)
- [ ] Cloud sync for scan history

## 👨‍💻 Author

**DermaScan AI** is developed as a personal learning project to explore AI applications in healthcare.

- **Project Type**: Personal Development / Educational
- **Primary Focus**: Learning AI/ML in medical applications
- **Technology Stack**: React, Python, PyTorch, FastAPI, Capacitor
- **License**: MIT License

## 🌟 Star History

If you find this project helpful or interesting, please consider giving it a star! ⭐

---

**⚠️ Medical Disclaimer**: This AI screening tool is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
