import createClient from 'openapi-fetch';
import type { paths } from '@/types/generated/api';

// Base URL should NOT include /api/v1 since OpenAPI schema paths already include it
const RAW_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost';
const API_BASE_URL = RAW_BASE_URL;
const AUTO_REDIRECT_ON_401 = process.env.NEXT_PUBLIC_AUTH_AUTO_REDIRECT_ON_401 !== 'false'; // Default to true

// Log API configuration for debugging
// console.log('API Configuration:', {
//   RAW_BASE_URL,
//   API_BASE_URL,
//   AUTO_REDIRECT_ON_401,
//   NODE_ENV: process.env.NODE_ENV
// });

// Create the main API client
export const api = createClient<paths>({
  baseUrl: API_BASE_URL,
});

// Request interceptor to add auth token
api.use({
  onRequest({ request }) {
    // Get token from localStorage or cookies
    const token = getAuthToken();

    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }

    // Set common headers for all requests
    request.headers.set('accept', 'application/json');
    request.headers.set('Content-Type', 'application/json');

    // console.log('Request:', request);
    return request;
  },

  onResponse({ response }) {
    if (!response.ok) {
      // Handle 401 Unauthorized - token expired
      if (response.status === 401) {
        console.warn('API 401 Unauthorized - Token expired:', response.url);

        // Clear expired tokens
        clearAuthToken();

        // Clear auth store if available
        if (typeof window !== 'undefined') {
          // Clear localStorage auth storage
          localStorage.removeItem('auth-storage');

          // Note: Auth store invalidation will be handled by the auth hook
          // when it detects 401 responses

          // Redirect to login with current path if it's not a login request
          if (!response.url.includes('/login') && !response.url.includes('/register')) {
            const currentPath = window.location.pathname;
            const loginUrl = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;

            if (AUTO_REDIRECT_ON_401) {
              window.location.href = loginUrl;
            }
          }
        }
      }

      // Log error for debugging
      console.log('API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
    }

    return response;
  },
});

// Helper function to set auth token (both localStorage and cookie)
export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    // Store in localStorage for client-side access
    localStorage.setItem('auth-token', token);

    // Store in cookie for server-side middleware access
    document.cookie = `auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;
  }
};

// Helper function to clear auth token
export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-token');

    // Clear cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};

// Helper function to get current auth token
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Try localStorage first
    const localToken = localStorage.getItem('auth-token');
    if (localToken) {
      return localToken;
    }

    // Fallback to cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth-token') {
        return value;
      }
    }
  }
  return null;
};

export default api;

/**
 * Utility function to extract error message from API error response
 * Handles various error response formats from the backend
 */
export const getErrorMessage = (error: any): string => {
  // Try various error message sources
  if (error?.error?.detail) {
    return error.error.detail;
  }
  if (error?.detail) {
    return error.detail;
  }
  if (error?.message && error.message !== 'Failed to fetch') {
    return error.message;
  }
  if (error?.error && typeof error.error === 'string') {
    return error.error;
  }
  if (typeof error === 'string') {
    return error;
  }
  
  // Last resort - return generic message
  return 'An error occurred. Please try again.';
};
