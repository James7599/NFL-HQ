'use client';

import { useEffect } from 'react';
import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log vitals to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(metric);
    }

    // You can send to analytics service in production
    // Example: sendToAnalytics(metric);

    // Track important metrics
    const { name, value, rating, id } = metric;

    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        event_label: id,
        rating,
        non_interaction: true,
      });
    }
  });

  return null;
}
