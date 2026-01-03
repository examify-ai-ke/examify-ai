import { posthog } from './posthog';

/**
 * Analytics utility functions for tracking user events
 */

export const analytics = {
  /**
   * Identify a user with their properties
   */
  identify: (userId: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.identify(userId, properties);
    }
  },

  /**
   * Reset user identity (on logout)
   */
  reset: () => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.reset();
    }
  },

  /**
   * Track a custom event
   */
  track: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture(eventName, properties);
    }
  },

  /**
   * Set user properties
   */
  setUserProperties: (properties: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.people.set(properties);
    }
  },

  /**
   * Track page view (handled automatically by PostHogProvider)
   */
  pageView: (url?: string) => {
    if (typeof window !== 'undefined' && posthog) {
      posthog.capture('$pageview', {
        $current_url: url || window.location.href,
      });
    }
  },
};

/**
 * Predefined event tracking functions
 */

// Authentication Events
export const trackAuthEvent = {
  login: (method: 'email' | 'google' | 'github') => {
    analytics.track('user_login', { method });
  },
  
  logout: () => {
    analytics.track('user_logout');
  },
  
  signup: (method: 'email' | 'google' | 'github') => {
    analytics.track('user_signup', { method });
  },
  
  passwordReset: () => {
    analytics.track('password_reset_requested');
  },
};

// Exam Paper Events
export const trackExamPaperEvent = {
  view: (paperId: string, paperTitle: string) => {
    analytics.track('exam_paper_viewed', {
      paper_id: paperId,
      paper_title: paperTitle,
    });
  },
  
  download: (paperId: string, paperTitle: string, format: string) => {
    analytics.track('exam_paper_downloaded', {
      paper_id: paperId,
      paper_title: paperTitle,
      format,
    });
  },
  
  search: (query: string, resultsCount: number) => {
    analytics.track('exam_paper_searched', {
      search_query: query,
      results_count: resultsCount,
    });
  },
  
  filter: (filters: Record<string, any>) => {
    analytics.track('exam_paper_filtered', filters);
  },
};

// Admin Events
export const trackAdminEvent = {
  createPaper: (paperId: string) => {
    analytics.track('admin_paper_created', { paper_id: paperId });
  },
  
  updatePaper: (paperId: string) => {
    analytics.track('admin_paper_updated', { paper_id: paperId });
  },
  
  deletePaper: (paperId: string) => {
    analytics.track('admin_paper_deleted', { paper_id: paperId });
  },
  
  createInstitution: (institutionId: string) => {
    analytics.track('admin_institution_created', { institution_id: institutionId });
  },
  
  updateInstitution: (institutionId: string) => {
    analytics.track('admin_institution_updated', { institution_id: institutionId });
  },
};

// User Profile Events
export const trackProfileEvent = {
  update: (fields: string[]) => {
    analytics.track('profile_updated', { updated_fields: fields });
  },
  
  avatarUpload: () => {
    analytics.track('profile_avatar_uploaded');
  },
  
  view: (userId: string) => {
    analytics.track('profile_viewed', { user_id: userId });
  },
};

// Navigation Events
export const trackNavigationEvent = {
  sidebarToggle: (isOpen: boolean) => {
    analytics.track('sidebar_toggled', { is_open: isOpen });
  },
  
  menuClick: (menuItem: string) => {
    analytics.track('menu_item_clicked', { menu_item: menuItem });
  },
};

// Error Events
export const trackErrorEvent = {
  apiError: (endpoint: string, statusCode: number, errorMessage: string) => {
    analytics.track('api_error', {
      endpoint,
      status_code: statusCode,
      error_message: errorMessage,
    });
  },
  
  formError: (formName: string, errors: Record<string, any>) => {
    analytics.track('form_error', {
      form_name: formName,
      errors,
    });
  },
};

// Feature Usage Events
export const trackFeatureEvent = {
  use: (featureName: string, metadata?: Record<string, any>) => {
    analytics.track('feature_used', {
      feature_name: featureName,
      ...metadata,
    });
  },
};
