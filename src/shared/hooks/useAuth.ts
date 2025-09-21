// Authentication logic hook

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { useAccessibility } from './useAccessibility';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  roles: string[];
  permissions: string[];
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
}

export interface UseAuthOptions {
  enableLocalStorage?: boolean;
  storageKey?: string;
  enableToast?: boolean;
  enableAnnouncements?: boolean;
  tokenRefreshThreshold?: number; // minutes
}

export function useAuth(options: UseAuthOptions = {}) {
  const {
    enableLocalStorage = true,
    storageKey = 'auth',
    enableToast = true,
    enableAnnouncements = true,
    tokenRefreshThreshold = 5,
  } = options;

  const { t } = useTranslation();
  const { showSuccess, showError, showInfo } = useToast();
  const { announce } = useAccessibility({ announceChanges: enableAnnouncements });

  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    token: null,
    refreshToken: null,
    expiresAt: null,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    if (enableLocalStorage) {
      const savedAuth = localStorage.getItem(storageKey);
      if (savedAuth) {
        try {
          const authData = JSON.parse(savedAuth);
          setState(prev => ({
            ...prev,
            ...authData,
            isAuthenticated: !!authData.user && !!authData.token,
          }));
        } catch (error) {
          console.warn('Failed to load auth from localStorage:', error);
        }
      }
    }
  }, [enableLocalStorage, storageKey]);

  // Save auth state to localStorage when it changes
  useEffect(() => {
    if (enableLocalStorage) {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, enableLocalStorage, storageKey]);

  // Check token expiration and refresh if needed
  useEffect(() => {
    if (state.token && state.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(state.expiresAt);
      const timeUntilExpiry = expiresAt.getTime() - now.getTime();
      const thresholdMs = tokenRefreshThreshold * 60 * 1000;

      if (timeUntilExpiry < thresholdMs && timeUntilExpiry > 0) {
        refreshToken();
      } else if (timeUntilExpiry <= 0) {
        logout();
      }
    }
  }, [state.token, state.expiresAt, tokenRefreshThreshold]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      const { user, token, refreshToken, expiresIn } = data;
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        token,
        refreshToken,
        expiresAt,
      });

      if (enableToast) {
        showSuccess(t('accessibility.loginSuccessful'));
      }
      if (enableAnnouncements) {
        announce(t('accessibility.loginSuccessful'), 'polite');
      }

      return { user, token };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      if (enableToast) {
        showError(errorMessage);
      }
      if (enableAnnouncements) {
        announce(t('accessibility.loginFailed'), 'assertive');
      }

      throw error;
    }
  }, [enableToast, showSuccess, showError, enableAnnouncements, announce, t]);

  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const result = await response.json();
      const { user, token, refreshToken, expiresIn } = result;
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        token,
        refreshToken,
        expiresAt,
      });

      if (enableToast) {
        showSuccess(t('accessibility.registrationSuccessful'));
      }
      if (enableAnnouncements) {
        announce(t('accessibility.registrationSuccessful'), 'polite');
      }

      return { user, token };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      if (enableToast) {
        showError(errorMessage);
      }
      if (enableAnnouncements) {
        announce(t('accessibility.registrationFailed'), 'assertive');
      }

      throw error;
    }
  }, [enableToast, showSuccess, showError, enableAnnouncements, announce, t]);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Simulate API call
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${state.token}` },
      });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        token: null,
        refreshToken: null,
        expiresAt: null,
      });

      if (enableToast) {
        showInfo(t('accessibility.logoutSuccessful'));
      }
      if (enableAnnouncements) {
        announce(t('accessibility.logoutSuccessful'), 'polite');
      }
    }
  }, [state.token, enableToast, showInfo, enableAnnouncements, announce, t]);

  const refreshToken = useCallback(async () => {
    if (!state.refreshToken) return false;

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: state.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const { token, refreshToken, expiresIn } = data;
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      setState(prev => ({
        ...prev,
        token,
        refreshToken,
        expiresAt,
      }));

      return true;
    } catch (error) {
      console.warn('Token refresh failed:', error);
      logout();
      return false;
    }
  }, [state.refreshToken, logout]);

  const updateUser = useCallback((userData: Partial<User>) => {
    setState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null,
    }));

    if (enableToast) {
      showSuccess(t('accessibility.profileUpdated'));
    }
    if (enableAnnouncements) {
      announce(t('accessibility.profileUpdated'), 'polite');
    }
  }, [enableToast, showSuccess, enableAnnouncements, announce, t]);

  const hasPermission = useCallback((permission: string) => {
    return state.user?.permissions.includes(permission) || false;
  }, [state.user]);

  const hasRole = useCallback((role: string) => {
    return state.user?.roles.includes(role) || false;
  }, [state.user]);

  const isTokenExpired = useCallback(() => {
    if (!state.expiresAt) return true;
    return new Date() >= new Date(state.expiresAt);
  }, [state.expiresAt]);

  const getTokenExpiryTime = useCallback(() => {
    if (!state.expiresAt) return null;
    return new Date(state.expiresAt);
  }, [state.expiresAt]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    hasPermission,
    hasRole,
    isTokenExpired,
    getTokenExpiryTime,
    clearError,
  };
}
