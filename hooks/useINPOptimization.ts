'use client';

import { useEffect } from 'react';

// Global INP monitoring and optimization
export function useINPMonitoring() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Monitor long tasks that could affect INP
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Long task threshold
          console.warn(`⚠️ Long task detected: ${entry.duration}ms`, entry);
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });

    return () => observer.disconnect();
  }, []);
}

// Type declarations
declare global {
  interface Window {
    scheduler?: {
      postTask: (callback: () => void, options?: { priority: string }) => void;
    };
  }
}