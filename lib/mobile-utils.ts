// lib/mobile-utils.ts
// Utilities for mobile-specific features using Capacitor

import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { PushNotifications } from '@capacitor/push-notifications';

/**
 * Initialize mobile app features
 * Call this on app startup
 */
export async function initializeMobileApp() {
  try {
    // Hide splash screen after app loads
    await SplashScreen.hide();
    
    // Setup app lifecycle listeners
    setupAppLifecycle();
    
    // Initialize push notifications if on native platform
    if (isPlatform('android') || isPlatform('ios')) {
      await initializePushNotifications();
    }
  } catch (error) {
    console.error('Error initializing mobile app:', error);
  }
}

/**
 * Check if running on specific platform
 */
export function isPlatform(platform: 'android' | 'ios' | 'web'): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  
  switch (platform) {
    case 'android':
      return userAgent.includes('android');
    case 'ios':
      return /iphone|ipad|ipod/.test(userAgent);
    case 'web':
      return !userAgent.includes('android') && !/iphone|ipad|ipod/.test(userAgent);
    default:
      return false;
  }
}

/**
 * Setup app lifecycle event listeners
 */
function setupAppLifecycle() {
  App.addListener('appStateChange', ({ isActive }) => {
    console.log('App is active:', isActive);
    // Handle app pause/resume
    if (!isActive) {
      // App paused
      handleAppPause();
    } else {
      // App resumed
      handleAppResume();
    }
  });

  App.addListener('backButton', () => {
    console.log('Back button pressed');
    // Handle back button
    // Note: This only works on Android
  });
}

/**
 * Handle app pause
 */
function handleAppPause() {
  // Save user state, pause audio, etc.
}

/**
 * Handle app resume
 */
function handleAppResume() {
  // Refresh data, resume audio, etc.
}

/**
 * Initialize push notifications
 */
async function initializePushNotifications() {
  try {
    // Register for push notifications
    let permStatus = await PushNotifications.checkPermissions();
    
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('Push notification permissions not granted');
      return;
    }

    // Register with push service
    await PushNotifications.register();

    // Setup listeners
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration token:', token.value);
      // Send token to your backend
      savePushToken(token.value);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received:', notification);
      handlePushNotification(notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push action performed:', notification);
      handlePushNotificationAction(notification);
    });
  } catch (error) {
    console.error('Error initializing push notifications:', error);
  }
}

/**
 * Save push token to backend
 */
function savePushToken(token: string) {
  // TODO: Send to your Supabase backend
  localStorage.setItem('push_token', token);
}

/**
 * Handle incoming push notification
 */
function handlePushNotification(notification: any) {
  console.log('Handling push notification:', notification);
  // Show custom UI, play sound, etc.
}

/**
 * Handle push notification action
 */
function handlePushNotificationAction(notification: any) {
  console.log('Handling push action:', notification);
  // Navigate to specific page based on notification
}

/**
 * Get device platform
 */
export async function getDeviceInfo() {
  try {
    const info = await App.getInfo();
    return {
      version: info.version,
      build: info.build,
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    return null;
  }
}

/**
 * Exit app (Android/iOS only)
 */
export async function exitApp() {
  try {
    await App.exitApp();
  } catch (error) {
    console.error('Error exiting app:', error);
  }
}

/**
 * Check if running on native platform
 */
export function isNativePlatform(): boolean {
  return isPlatform('android') || isPlatform('ios');
}

/**
 * Show splash screen
 */
export async function showSplashScreen(duration: number = 2000) {
  try {
    await SplashScreen.show({
      showDuration: duration,
      autoHide: true,
    });
  } catch (error) {
    console.error('Error showing splash screen:', error);
  }
}

/**
 * Hide splash screen
 */
export async function hideSplashScreen() {
  try {
    await SplashScreen.hide();
  } catch (error) {
    console.error('Error hiding splash screen:', error);
  }
}
