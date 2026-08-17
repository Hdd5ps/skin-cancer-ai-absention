import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skincancerai.app',
  appName: 'Skin Cancer AI',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
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
  }
};

export default config;
