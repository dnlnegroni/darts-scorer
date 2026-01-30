import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dartscorer.mobile',
  appName: 'Darts Scorer',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    hostname: 'localhost',
    iosScheme: 'http',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a1a',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      spinnerColor: '#4CAF50'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a1a'
    }
  }
};

export default config;

// Made with Bob
