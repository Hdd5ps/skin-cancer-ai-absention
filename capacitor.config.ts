import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dermascan.app',
  appName: 'DermaScan AI',
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
