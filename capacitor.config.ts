import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ourauto.app',
  appName: 'OurAuto',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      spinnerColor: '#999999'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    App: {
      exitOnBackButton: false
    }
  }
};

export default config;
