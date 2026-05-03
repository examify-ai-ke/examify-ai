import { useEffect } from 'react';
import { analytics } from '@/lib/analytics';
import { useAuthStore } from '@/stores/auth';

/**
 * Hook to automatically identify users when they log in
 */
export function useAnalyticsIdentify() {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      analytics.identify(user.id, {
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.createdAt,
      });
    } else {
      // Reset analytics on logout
      analytics.reset();
    }
  }, [isAuthenticated, user]);
}

/**
 * Hook to track component mount/unmount
 */
export function useAnalyticsPageView(pageName: string, metadata?: Record<string, any>) {
  useEffect(() => {
    analytics.track('page_viewed', {
      page_name: pageName,
      ...metadata,
    });
  }, [pageName, metadata]);
}

/**
 * Hook to track feature usage
 */
export function useAnalyticsFeature(featureName: string) {
  useEffect(() => {
    analytics.track('feature_mounted', {
      feature_name: featureName,
    });
  }, [featureName]);

  return {
    trackFeatureUse: (action: string, metadata?: Record<string, any>) => {
      analytics.track('feature_action', {
        feature_name: featureName,
        action,
        ...metadata,
      });
    },
  };
}
