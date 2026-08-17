# Contributing to DermaScan AI

Thank you for your interest in contributing to DermaScan AI! This is a personal project focused on learning and development in AI-powered medical applications.

## 🤝 How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, please include:

- **Description**: A clear and concise description of what the bug is
- **Reproduction Steps**: Steps to reproduce the behavior
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Screenshots**: If applicable, add screenshots to help explain the problem
- **Environment**: 
  - OS: [e.g. Windows, macOS, Linux]
  - Browser: [e.g. Chrome, Firefox, Safari]
  - Device: [e.g. iPhone 12, Samsung Galaxy S21]
  - App Version: [e.g. 1.0.0]

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:

- **Description**: A clear and concise description of the enhancement
- **Motivation**: Why would this enhancement be useful?
- **Alternatives**: What are the alternatives or features you considered?
- **Additional Context**: Any other context or screenshots about the feature request

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/skin-cancer-ai-absention.git
   cd skin-cancer-ai-absention
   ```

2. **Install dependencies**
   ```bash
   # Frontend dependencies
   npm install
   
   # Backend dependencies
   cd backend
   pip install -r requirements.txt
   pip install -r requirements.opencv.txt
   cd ..
   ```

3. **Start development servers**
   ```bash
   # Terminal 1: Start backend
   cd backend
   python -m uvicorn app:app --host 0.0.0.0 --port 8000
   
   # Terminal 2: Start frontend
   npm run dev
   ```

## 📝 Coding Standards

### Frontend (React + TypeScript)
- Use TypeScript for all new files
- Follow existing code style and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused
- Use proper error handling

### Backend (Python + FastAPI)
- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Add docstrings for functions and classes
- Handle errors gracefully
- Keep functions focused and modular

### General Guidelines
- Write clean, readable code
- Add tests for new features
- Update documentation as needed
- Follow the existing project structure
- Use meaningful commit messages

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
npm test

# Backend tests
cd backend
pytest

# E2E tests
npm run test:e2e

# Performance tests
npm run test:performance

# Security tests
npm run test:security
```

### Test Coverage
- Aim for >80% code coverage for new features
- Test both happy paths and error cases
- Include tests for edge cases
- Ensure all tests pass before submitting PR

## 📦 Pull Request Process

1. **Update your branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow coding standards
   - Add tests for new features
   - Update documentation
   - Ensure all tests pass

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: Brief description of your changes"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Provide a clear description of your changes
   - Reference any related issues

### Pull Request Guidelines
- **Title**: Use a clear, descriptive title (e.g., "Fix: Camera permission handling on Android")
- **Description**: Explain what you changed and why
- **Related Issues**: Reference any related issues with `#issue-number`
- **Screenshots**: Include screenshots for UI changes
- **Testing**: Describe how you tested your changes

## 🎯 Project Structure

```
skin-cancer-ai-absention/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── screens/           # Screen components
│   ├── lib/               # Utility libraries
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── backend/               # Backend source code
│   ├── models/            # ML models
│   ├── tests/             # Backend tests
│   └── requirements.txt   # Python dependencies
├── android/               # Android native code
├── ios/                   # iOS native code
├── e2e/                   # E2E tests
├── scripts/               # Build and deployment scripts
└── docs/                  # Documentation
```

## 📖 Documentation

### Updating Documentation
- Keep documentation up to date with code changes
- Use clear, concise language
- Include code examples where helpful
- Update README.md for user-facing changes
- Update technical docs for developer-facing changes

### Documentation Files
- `README.md` - Main project documentation
- `AGENTS.md` - Development setup and architecture
- `TESTING_GUIDE.md` - Testing procedures
- `LAUNCH_GUIDE.md` - Launch procedures
- `MOBILE_DEPLOYMENT.md` - Mobile deployment strategy
- `CLOUD_DEPLOYMENT.md` - Cloud deployment options

## 🌟 Recognition

Contributors will be recognized in the project's contributors list. All contributions are valuable and appreciated!

## 📜 License

By contributing to DermaScan AI, you agree that your contributions will be licensed under the MIT License.

## 💬 Getting Help

If you need help with contributing:
- Open an issue with the "question" label
- Check existing documentation
- Review existing issues and PRs for context
- Reach out through GitHub Discussions

## 🎉 Thank You

Thank you for taking the time to contribute to DermaScan AI! Your contributions help make this project better for everyone.

---

**Note**: This is a personal learning project. While contributions are welcome, please understand that the maintainer may have limited time to review and merge contributions.