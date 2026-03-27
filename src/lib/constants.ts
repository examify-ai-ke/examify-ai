// Application Constants
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Exampapel',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Exam Papers Resource Platform',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  version: '0.1.0',
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://fastapi.localhost/api/v1',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
} as const;

// Authentication Constants
export const AUTH_CONFIG = {
  tokenKey: 'exampapel_auth_token',
  refreshTokenKey: 'exampapel_refresh_token',
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Route Protection
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/profile',
  '/settings',
] as const;

export const ADMIN_ROUTES = [
  '/admin',
  '/admin/users',
  '/admin/settings',
  '/admin/analytics',
] as const;

export const MANAGER_ROUTES = [
  '/admin/papers',
  '/admin/institutions',
] as const;

// Pagination
export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 20, 50, 100],
  maxPageSize: 100,
} as const;

// File Upload
export const FILE_UPLOAD_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  maxFiles: 5,
} as const;

// Search Configuration
export const SEARCH_CONFIG = {
  minQueryLength: 2,
  maxResults: 50,
  debounceDelay: 300, // milliseconds
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  defaultTheme: 'system' as const,
  themes: ['light', 'dark', 'system'] as const,
} as const;

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  defaultDuration: 5000, // 5 seconds
  maxNotifications: 5,
} as const;

// Form Validation
export const VALIDATION_CONFIG = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  email: {
    maxLength: 254,
  },
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection.',
  unauthorized: 'You are not authorized to access this resource.',
  forbidden: 'Access denied. You do not have permission.',
  notFound: 'The requested resource was not found.',
  serverError: 'Server error. Please try again later.',
  validation: 'Please check your input and try again.',
  unknown: 'An unexpected error occurred.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  login: 'Successfully logged in.',
  logout: 'Successfully logged out.',
  register: 'Account created successfully.',
  passwordReset: 'Password reset email sent.',
  profileUpdate: 'Profile updated successfully.',
  paperCreated: 'Exam paper created successfully.',
  paperUpdated: 'Exam paper updated successfully.',
  paperDeleted: 'Exam paper deleted successfully.',
} as const;

// Loading States
export const LOADING_STATES = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  error: 'error',
} as const;

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  theme: 'exampapel_theme',
  sidebarCollapsed: 'exampapel_sidebar_collapsed',
  searchHistory: 'exampapel_search_history',
  userPreferences: 'exampapel_user_preferences',
} as const; 