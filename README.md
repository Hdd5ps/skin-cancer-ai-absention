# DermaScan AI

AI-powered skin lesion screening application with dual-gated analysis pipeline.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Basic knowledge of terminal commands

### Development Setup

1. **Install Frontend Dependencies**
   ```bash
   npm install
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
   npm run dev
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
npm test

# Run E2E tests
npm run test:e2e

# Run performance tests
npm run test:performance

# Run security tests
npm run test:security
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
npm run build
```

### Backend Production
```bash
cd backend
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

## 🚀 Mobile App Deployment

For detailed mobile deployment strategy, see [MOBILE_DEPLOYMENT.md](./MOBILE_DEPLOYMENT.md).

### Quick Mobile Setup (Capacitor)
```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init

# Add platforms
npx cap add android
npx cap add ios

# Build and sync
npm run build
npx cap sync
```

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
- **Build failures**: Clear cache with `rm -rf node_modules .vite` and reinstall with `npm install`
- **Styling issues**: Ensure Tailwind CSS v4 is properly configured

## 📝 License

[Your License Here]

## 🤝 Contributing

[Your Contribution Guidelines]

## 📞 Support

For issues and questions:
- GitHub Issues: [Your Repository]
- Email: [Your Support Email]

## 🙏 Acknowledgments

- MobileNetV2 architecture by Google
- Medical device regulations guidance
- AI ethics and safety principles

---

**⚠️ Medical Disclaimer**: This AI screening tool is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
