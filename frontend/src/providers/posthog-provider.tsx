'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog, posthog } from '@/lib/posthog';
import { useAnalyticsIdentify } from '@/hooks/use-analytics';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Automatically identify users when they log in
  useAnalyticsIdentify();

  useEffect(() => {
    // Initialize PostHog
    initPostHog();
  }, []);

  useEffect(() => {
    // Track pageviews
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
