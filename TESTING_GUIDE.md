# Testing Guide

Comprehensive testing procedures and guidelines for the Skin Cancer AI application.

## Overview

This testing infrastructure covers:
- **Device Testing**: Android/iOS compatibility testing
- **Performance Testing**: Application performance and resource usage
- **Security Testing**: Vulnerability scanning and security best practices
- **Camera Compatibility**: Cross-device camera functionality testing

## Prerequisites

```bash
# Install dependencies
pnpm install

# For Playwright browsers (first time only)
npx playwright install
```

## Testing Commands

### Unit Tests (Vitest)

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

### End-to-End Tests (Playwright)

```bash
# Run all E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run E2E tests on specific browser
pnpm test:e2e -- --project=chromium
```

### Performance Tests

```bash
# Run Lighthouse performance test
pnpm test:performance
```

### Security Tests

```bash
# Run security audit
pnpm test:security
```

### Capacitor Device Testing

```bash
# Build and sync for Android
pnpm cap:build

# Run Android tests
pnpm cap:test:android

# Run iOS tests
pnpm cap:test:ios
```

## Test Structure

```
src/test/
├── setup.ts                          # Test configuration
├── App.test.tsx                      # App component tests
├── CameraScreen.test.tsx             # Camera screen tests
├── performance.spec.ts               # Performance benchmarks
├── security.spec.ts                  # Security validations
└── camera-compatibility.spec.ts      # Camera compatibility tests

e2e/
└── camera.spec.ts                    # E2E camera flow tests
```

## Device Testing

### Android Testing

1. **Setup Emulator/Device**
   ```bash
   # Ensure Android device/emulator is connected
   adb devices
   ```

2. **Build and Sync**
   ```bash
   pnpm cap:build
   npx cap sync android
   ```

3. **Run Tests**
   ```bash
   pnpm cap:test:android
   ```

4. **Manual Testing Checklist**
   - [ ] Camera permission flow
   - [ ] Photo capture functionality
   - [ ] Gallery upload
   - [ ] Camera switching (front/back)
   - [ ] Flash functionality
   - [ ] API integration
   - [ ] Screen navigation
   - [ ] Performance on target device

### iOS Testing

1. **Setup Simulator/Device**
   ```bash
   # List available simulators
   xcrun simctl list devices
   ```

2. **Build and Sync**
   ```bash
   pnpm cap:build
   npx cap sync ios
   ```

3. **Run Tests**
   ```bash
   pnpm cap:test:ios
   ```

4. **Manual Testing Checklist**
   - [ ] Camera permission flow
   - [ ] Photo capture functionality
   - [ ] Gallery upload
   - [ ] Camera switching (front/back)
   - [ ] Flash functionality
   - [ ] API integration
   - [ ] Screen navigation
   - [ ] Performance on target device

## Performance Testing

### Lighthouse Audits

Performance tests use Lighthouse to measure:
- Performance score (target: 90+)
- First Contentful Paint
- Largest Contentful Paint
- Time to Interactive
- Total Blocking Time
- Cumulative Layout Shift

### Running Performance Tests

```bash
# Ensure dev server is running
pnpm dev

# In another terminal, run performance test
pnpm test:performance
```

### Performance Benchmarks

- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.8s
- **Total Blocking Time**: < 200ms
- **Cumulative Layout Shift**: < 0.1

### Unit Performance Tests

```bash
# Run performance-specific unit tests
pnpm test performance.spec.ts
```

## Security Testing

### Dependency Vulnerability Scanning

```bash
# Run npm audit
npm audit

# Run Snyk security scan
snyk test
```

### Security Test Coverage

Security tests validate:
- API key handling
- Input sanitization
- File upload validation
- Error message safety
- CORS configuration
- Rate limiting concepts

### Running Security Tests

```bash
# Run security unit tests
pnpm test security.spec.ts

# Run full security audit
pnpm test:security
```

## Camera Compatibility Testing

### Test Scenarios

Camera compatibility tests cover:
- Multiple camera devices
- Different resolutions (720p, 1080p, 4K)
- Permission states (granted, denied, prompt)
- Flash capability variations
- Front/back camera switching
- Stream disconnection handling
- Different video formats
- Low-light conditions

### Running Camera Tests

```bash
# Run camera compatibility unit tests
pnpm test camera-compatibility.spec.ts

# Run E2E camera tests
pnpm test:e2e camera.spec.ts
```

### Manual Camera Testing

1. **Test on Real Devices**
   - iPhone (various models)
   - Android (various manufacturers)
   - Tablets

2. **Test Different Conditions**
   - Good lighting
   - Low lighting
   - Mixed lighting
   - Indoor/outdoor

3. **Test Edge Cases**
   - Camera permissions denied
   - No camera available
   - Camera in use by another app
   - Device storage full

## Continuous Integration

### GitHub Actions Example

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:e2e
      - run: pnpm test:security
```

## Test Data Management

### Mock Data

Test files use mock data to simulate:
- API responses
- Camera streams
- Device capabilities
- User permissions

### Environment Variables

Test environment uses:
- `VITE_API_URL`: Mock API endpoint
- `VITE_API_KEY`: Test API key

## Troubleshooting

### Common Issues

**Tests fail with "Camera access denied"**
- Ensure camera permissions are granted in test environment
- Check browser camera permissions

**Performance tests timeout**
- Ensure dev server is running on port 8443
- Check network connectivity

**Security tests fail**
- Update Snyk token: `snyk auth`
- Check npm audit configuration

**E2E tests fail**
- Ensure browsers are installed: `npx playwright install`
- Check dev server is running

## Best Practices

1. **Write Isolated Tests**: Each test should be independent
2. **Use Mock Data**: Avoid dependencies on external services
3. **Test Edge Cases**: Include error scenarios
4. **Maintain Test Coverage**: Aim for >80% coverage
5. **Run Tests Frequently**: Integrate into development workflow
6. **Keep Tests Fast**: Optimize slow tests
7. **Use Descriptive Names**: Clear test names improve debugging

## Coverage Goals

- **Unit Tests**: >80% code coverage
- **E2E Tests**: Critical user paths
- **Performance**: All Lighthouse categories >90
- **Security**: Zero high/critical vulnerabilities

## Reporting

### Test Reports

- **Coverage Reports**: `coverage/` directory
- **Lighthouse Reports**: `performance-report-*.json`
- **Playwright Reports**: `playwright-report/` directory

### CI/CD Integration

Integrate test reports into your CI/CD pipeline for:
- Automated testing on PRs
- Performance regression detection
- Security vulnerability monitoring
- Test coverage tracking

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Lighthouse Documentation](https://github.com/GoogleChrome/lighthouse)
- [Capacitor Testing](https://capacitorjs.com/docs/guides/testing)
