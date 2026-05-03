import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { api, setAuthToken, clearAuthToken } from '@/lib/api';
import type { components } from '@/types/generated/api';

type LoginRequest = components['schemas']['LoginRequest'];
type UserCreateRequest = components['schemas']['Body_create_user_api_v1_user_post'];
type UserRead = components['schemas']['IUserRead'];
type TokenResponse = components['schemas']['Token'];
type LoginResponse = components['schemas']['IPostResponseBase_Token_'];

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, login, logout, setError, clearError, invalidateSession } = useAuthStore();
  const { addNotification } = useUIStore();

  const handleLogin = async (credentials: { email: string; password: string; provider?: 'email' | 'google' | 'github' | 'facebook' | 'twitter' }) => {
    setIsLoading(true);
    clearError();

    // Ensure provider field is included for backend API compatibility
    const loginData: LoginRequest = {
      email: credentials.email,
      password: credentials.password,
      provider: credentials.provider || 'email' // Default to email provider
    };

    // console.log('Login attempt with:', { email: loginData.email, provider: loginData.provider });

    try {
      const { data, error } = await api.POST('/login', {
        body: loginData,
      });


      if (error) {
        // Enhanced error logging for debugging
        console.log('Login API Error:', {
          error,
          status: error.status || 'unknown',
          detail: error.detail,
          message: error.message
        });

        // Handle specific error cases
        let errorMessage = 'Login failed. Please check your credentials.';

        if (typeof error.detail === 'string') {
          errorMessage = error.detail;
        } else if (Array.isArray(error.detail)) {
          errorMessage = error.detail.map(e => e.msg).join(', ');
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Handle token expiration specifically
        if (errorMessage.toLowerCase().includes('token') && errorMessage.toLowerCase().includes('expired')) {
          invalidateSession();
          errorMessage = 'Your session has expired. Please login again.';
        }

        setError(errorMessage);
        addNotification({
          type: 'error',
          title: 'Login Failed',
          message: errorMessage,
        });
        return { success: false, error: errorMessage };
      }

      if (data?.data) {
        const tokenData = data.data as TokenResponse;
        const user = tokenData.user as UserRead;

        console.log('Login successful:', {
          userId: user.id,
          email: user.email,
          hasToken: !!tokenData.access_token
        });

        // Store token and user data
        setAuthToken(tokenData.access_token);
        login(user, tokenData.access_token);

        addNotification({
          type: 'success',
          title: 'Welcome back!',
          message: `Hello ${user.first_name}!`,
        });

        return { success: true, user, token: tokenData.access_token };
      } else {
        console.log('Login response missing data:', data);
        const errorMessage = 'Login response was invalid. Please try again.';
        setError(errorMessage);
        addNotification({
          type: 'error',
          title: 'Login Failed',
          message: errorMessage,
        });
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Login Error',
        message: errorMessage,
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }

    return { success: false, error: 'Unknown error occurred' };
  };

  const handleRegister = async (userData: UserCreateRequest) => {
    setIsLoading(true);
    clearError();

    try {
      const { data, error } = await api.POST('/user', {
        body: userData,
      });

      if (error) {
        const errorMessage = typeof error.detail === 'string'
          ? error.detail
          : Array.isArray(error.detail)
            ? error.detail.map(e => e.msg).join(', ')
            : 'Registration failed. Please try again.';
        setError(errorMessage);
        addNotification({
          type: 'error',
          title: 'Registration Failed',
          message: errorMessage,
        });
        return { success: false, error: errorMessage };
      }

      if (data?.data) {
        const user = data.data as UserRead;

        addNotification({
          type: 'success',
          title: 'Registration Successful',
          message: 'Your account has been created successfully!',
        });

        return { success: true, user };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Registration Error',
        message: errorMessage,
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }

    return { success: false, error: 'Unknown error occurred' };
  };

  const handleLogout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await api.POST('/logout');
    } catch (err) {
      // Continue with logout even if server call fails
      console.warn('Server logout failed:', err);
    } finally {
      // Clear local storage and state
      clearAuthToken();
      logout();

      addNotification({
        type: 'success',
        title: 'Logged out',
        message: 'You have been successfully logged out.',
      });
    }
  };

  const getCurrentUser = async () => {
    try {
      const { data, error } = await api.GET('/user/me');

      if (error) {
        console.log('Failed to get current user:', error);
        return null;
      }

      if (data?.data) {
        return data.data as UserRead;
      }
    } catch (err) {
      console.log('Error getting current user:', err);
      return null;
    }

    return null;
  };

  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    clearError();

    try {
      const { data, error } = await api.POST('/login/password-reset', {
        body: { email },
      });

      if (error) {
        const errorMessage = typeof error.detail === 'string'
          ? error.detail
          : Array.isArray(error.detail)
            ? error.detail.map(e => e.msg).join(', ')
            : 'Failed to send password reset email.';
        setError(errorMessage);
        addNotification({
          type: 'error',
          title: 'Password Reset Failed',
          message: errorMessage,
        });
        return { success: false, error: errorMessage };
      }

      if (data) {
        addNotification({
          type: 'success',
          title: 'Password Reset Email Sent',
          message: 'Please check your email for password reset instructions.',
        });
        return { success: true };
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred.';
      setError(errorMessage);
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }

    return { success: false, error: 'Unknown error occurred' };
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    getCurrentUser,
    requestPasswordReset,
    invalidateSession,
  };
};
