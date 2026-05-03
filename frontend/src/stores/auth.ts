import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { components } from '@/types/generated/api';

export type User = components['schemas']['IUserRead'];

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  clearError: () => void;
  invalidateSession: (showError?: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user }),
      
      setToken: (token) => set({ token }),
      
      setError: (error) => set({ error }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        error: null,
      }),
      
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      }),
      
      clearError: () => set({ error: null }),

      invalidateSession: (showError = true) => {
        // Clear tokens from both localStorage and cookies
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        // Reset auth state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: showError ? 'Your session has expired. Please login again.' : null,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
