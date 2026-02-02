// lib/mobile-utils.ts

/**
 * Safe mobile initializer
 * Used by mobile-init.tsx
 * Works for web + capacitor builds
 */

export function initializeMobileApp() {
  // Only run in browser
  if (typeof window === 'undefined') return

  try {
    // Detect Capacitor (mobile build)
    const isCapacitor = (window as any)?.Capacitor

    if (isCapacitor) {
      console.log('📱 Running inside mobile app (Capacitor)')
    } else {
      console.log('🌐 Running in browser')
    }
  } catch (err) {
    console.warn('Mobile init skipped:', err)
  }
}
