import createClient from 'openapi-fetch';
import type { paths } from '@/types/generated/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost/';

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
    
    console.log('Request:', request);
    return request;
  },
  
  onResponse({ response }) {
    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        // Clear token and redirect to login
        clearAuthToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
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
