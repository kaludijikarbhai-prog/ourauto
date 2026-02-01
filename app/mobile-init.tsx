// app/mobile-init.tsx
// Mobile initialization component - add to root layout

'use client';

import { useEffect } from 'react';
import { initializeMobileApp } from '@/lib/mobile-utils';

export function MobileInit() {
  useEffect(() => {
    // Initialize mobile features when app loads
    initializeMobileApp();
  }, []);

  return null;
}
