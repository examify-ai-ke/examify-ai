/**
 * Analytics Helper Functions
 * 
 * Centralized analytics tracking functions for consistent event tracking
 * across the application. These functions wrap the Google Analytics
 * trackEvent function with predefined event structures.
 */

import { trackEvent, setUserProperties } from '@/components/analytics/google-analytics';

/**
 * User Authentication Events
 */
export const analytics = {
  // User Events
  user: {
    signUp: (method: string, role?: string) => {
      trackEvent('sign_up', {
        method,
        user_role: role,
      });
    },

    login: (method: string) => {
      trackEvent('login', {
        method,
      });
    },

    logout: () => {
      trackEvent('logout');
    },

    updateProfile: () => {
      trackEvent('profile_update');
    },

    changePassword: () => {
      trackEvent('password_change');
    },

    setProperties: (userId: string, role: string, institution?: string) => {
      setUserProperties({
        user_id: userId,
        user_role: role,
        institution: institution || 'none',
      });
    },
  },

  // Content Events
  content: {
    viewExamPaper: (paperId: string, title: string, course?: string, institution?: string) => {
      trackEvent('view_item', {
        item_id: paperId,
        item_name: title,
        item_category: course || 'uncategorized',
        institution: institution || 'unknown',
        content_type: 'exam_paper',
      });
    },

    viewQuestion: (questionId: string, examPaperId?: string) => {
      trackEvent('view_item', {
        item_id: questionId,
        exam_paper_id: examPaperId,
        content_type: 'question',
      });
    },

    viewInstitution: (institutionId: string, name: string) => {
      trackEvent('view_item', {
        item_id: institutionId,
        item_name: name,
        content_type: 'institution',
      });
    },

    downloadPaper: (paperId: string, title: string, format: string = 'pdf') => {
      trackEvent('file_download', {
        file_name: title,
        file_type: format,
        item_id: paperId,
        content_type: 'exam_paper',
      });
    },
  },

  // Search Events
  search: {
    perform: (query: string, category?: string, resultsCount?: number) => {
      trackEvent('search', {
        search_term: query,
        search_category: category || 'all',
        results_count: resultsCount,
      });
    },

    filter: (filterType: string, filterValue: string) => {
      trackEvent('filter_applied', {
        filter_type: filterType,
        filter_value: filterValue,
      });
    },

    sort: (sortBy: string, order: string) => {
      trackEvent('sort_changed', {
        sort_by: sortBy,
        sort_order: order,
      });
    },
  },

  // Engagement Events
  engagement: {
    share: (contentType: string, contentId: string, method: string) => {
      trackEvent('share', {
        content_type: contentType,
        item_id: contentId,
        method,
      });
    },

    comment: (contentType: string, contentId: string) => {
      trackEvent('comment_posted', {
        content_type: contentType,
        item_id: contentId,
      });
    },

    like: (contentType: string, contentId: string) => {
      trackEvent('like', {
        content_type: contentType,
        item_id: contentId,
      });
    },

    follow: (entityType: string, entityId: string) => {
      trackEvent('follow', {
        entity_type: entityType,
        entity_id: entityId,
      });
    },
  },

  // Form Events
  form: {
    start: (formName: string) => {
      trackEvent('form_start', {
        form_name: formName,
      });
    },

    submit: (formName: string, success: boolean) => {
      trackEvent('form_submit', {
        form_name: formName,
        success,
      });
    },

    error: (formName: string, errorType: string) => {
      trackEvent('form_error', {
        form_name: formName,
        error_type: errorType,
      });
    },
  },

  // Navigation Events
  navigation: {
    clickLink: (linkText: string, destination: string) => {
      trackEvent('click', {
        link_text: linkText,
        link_destination: destination,
        event_category: 'navigation',
      });
    },

    clickButton: (buttonName: string, location: string) => {
      trackEvent('button_click', {
        button_name: buttonName,
        button_location: location,
      });
    },
  },

  // Error Events
  error: {
    track: (errorMessage: string, errorType: string, fatal: boolean = false) => {
      trackEvent('exception', {
        description: errorMessage,
        error_type: errorType,
        fatal,
        page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      });
    },

    notFound: (path: string) => {
      trackEvent('page_not_found', {
        path,
      });
    },

    apiError: (endpoint: string, statusCode: number, errorMessage: string) => {
      trackEvent('api_error', {
        endpoint,
        status_code: statusCode,
        error_message: errorMessage,
      });
    },
  },

  /**
   * Identify a user for analytics tracking
   */
  identify: (userId: string, properties?: Record<string, any>) => {
    setUserProperties({
      user_id: userId,
      ...properties,
    });
  },

  /**
   * Reset analytics (clear user identification on logout)
   */
  reset: () => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Clear user properties by setting them to undefined
      window.gtag('set', 'user_properties', {
        user_id: undefined,
        email: undefined,
        name: undefined,
        role: undefined,
        created_at: undefined,
      });
    }
  },

  /**
   * Track a custom event
   */
  track: (eventName: string, properties?: Record<string, any>) => {
    trackEvent(eventName, properties);
  },
};

export default analytics;
