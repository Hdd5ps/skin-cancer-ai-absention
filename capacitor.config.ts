import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skincancerai.app',
  appName: 'Skin Cancer AI',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    buildOptions: {
      signingType: 'apksigner'
    }
  },
  icons: {
    android: 'icon-512.png',
    ios: {
      icon: 'icon-180.png',
      splash: 'icon-512.png'
    },
    web: {
      favicon: 'favicon.png'
    }
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0a1220',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#3b7de8'
    },
    Camera: {
      permissions: ['camera', 'photos']
    },
    Preferences: {
      name: 'dermascan_preferences'
    },
    Filesystem: {
      permissions: ['photos']
    },
    App: {
      allowCustomTextSelection: true
    }
  }
};

export default config;
