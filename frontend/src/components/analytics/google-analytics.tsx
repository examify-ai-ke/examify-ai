'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

interface GoogleAnalyticsProps {
  measurementId: string;
}

/**
 * Google Analytics Component for Next.js App Router
 * 
 * This component handles:
 * - Loading the Google Analytics script
 * - Tracking page views on route changes
 * - Providing gtag function for custom events
 * 
 * @param measurementId - Your Google Analytics Measurement ID (G-XXXXXXXXXX)
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route change
  useEffect(() => {
    if (!measurementId) return;

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    
    // Send pageview with custom URL
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', measurementId, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, measurementId]);

  // Don't render in development unless explicitly enabled
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_GA_DEBUG !== 'true') {
    return null;
  }

  // Don't render if no measurement ID
  if (!measurementId) {
    console.warn('Google Analytics: No measurement ID provided');
    return null;
  }

  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `,
        }}
      />
    </>
  );
}

/**
 * Helper function to send custom events to Google Analytics
 * 
 * @example
 * // Track a button click
 * trackEvent('button_click', {
 *   button_name: 'signup',
 *   page: '/home'
 * });
 * 
 * @example
 * // Track a form submission
 * trackEvent('form_submit', {
 *   form_name: 'contact',
 *   success: true
 * });
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

/**
 * Helper function to track page views manually
 * Usually not needed as the component handles this automatically
 */
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
    });
  }
};

/**
 * Helper function to set user properties
 * 
 * @example
 * setUserProperties({
 *   user_id: '123',
 *   user_role: 'admin'
 * });
 */
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}
