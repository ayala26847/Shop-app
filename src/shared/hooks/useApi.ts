// Standardized API calls hook

import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { useAccessibility } from './useAccessibility';

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  enableToast?: boolean;
  enableRetry?: boolean;
}

export interface ApiState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retryCount: number;
  lastFetch: Date | null;
}

export function useApi<T = any>(baseUrl: string = '') {
  const { t } = useTranslation();
  const { showError, showSuccess } = useToast();
  const { announce } = useAccessibility({ announceChanges: true });
  
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    retryCount: 0,
    lastFetch: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const makeRequest = useCallback(async (
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> => {
    const {
      method = 'GET',
      headers = {},
      timeout = 10000,
      retries = 3,
      retryDelay = 1000,
      onSuccess,
      onError,
      enableToast = true,
      enableRetry = true,
    } = options;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const url = baseUrl + endpoint;
        const requestOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          signal,
        };

        // Add body for non-GET requests
        if (method !== 'GET' && options.body) {
          requestOptions.body = JSON.stringify(options.body);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        setState(prev => ({
          ...prev,
          data,
          loading: false,
          error: null,
          retryCount: 0,
          lastFetch: new Date(),
        }));

        if (enableToast) {
          showSuccess(t('accessibility.apiSuccess'));
        }
        announce(t('accessibility.apiSuccess'), 'polite');

        onSuccess?.(data);
        return data;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries && enableRetry) {
          setState(prev => ({
            ...prev,
            retryCount: attempt + 1,
          }));

          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          continue;
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: lastError.message,
        }));

        if (enableToast) {
          showError(lastError.message);
        }
        announce(t('accessibility.apiError'), 'assertive');

        onError?.(lastError);
        throw lastError;
      }
    }

    throw lastError;
  }, [baseUrl, showError, showSuccess, announce, t]);

  const get = useCallback((endpoint: string, options: Omit<ApiOptions, 'method'> = {}) => {
    return makeRequest(endpoint, { ...options, method: 'GET' });
  }, [makeRequest]);

  const post = useCallback((endpoint: string, body: any, options: Omit<ApiOptions, 'method' | 'body'> = {}) => {
    return makeRequest(endpoint, { ...options, method: 'POST', body });
  }, [makeRequest]);

  const put = useCallback((endpoint: string, body: any, options: Omit<ApiOptions, 'method' | 'body'> = {}) => {
    return makeRequest(endpoint, { ...options, method: 'PUT', body });
  }, [makeRequest]);

  const patch = useCallback((endpoint: string, body: any, options: Omit<ApiOptions, 'method' | 'body'> = {}) => {
    return makeRequest(endpoint, { ...options, method: 'PATCH', body });
  }, [makeRequest]);

  const del = useCallback((endpoint: string, options: Omit<ApiOptions, 'method'> = {}) => {
    return makeRequest(endpoint, { ...options, method: 'DELETE' });
  }, [makeRequest]);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      retryCount: 0,
      lastFetch: null,
    });
  }, []);

  return {
    ...state,
    get,
    post,
    put,
    patch,
    delete: del,
    cancel,
    reset,
    makeRequest,
  };
}

// Specialized API hooks
export function useGet<T = any>(endpoint: string, options: ApiOptions = {}) {
  const api = useApi<T>();
  
  const fetchData = useCallback(() => {
    return api.get(endpoint, options);
  }, [api, endpoint, options]);

  return {
    ...api,
    fetchData,
  };
}

export function usePost<T = any>(endpoint: string, options: ApiOptions = {}) {
  const api = useApi<T>();
  
  const submitData = useCallback((body: any) => {
    return api.post(endpoint, body, options);
  }, [api, endpoint, options]);

  return {
    ...api,
    submitData,
  };
}

export function usePut<T = any>(endpoint: string, options: ApiOptions = {}) {
  const api = useApi<T>();
  
  const updateData = useCallback((body: any) => {
    return api.put(endpoint, body, options);
  }, [api, endpoint, options]);

  return {
    ...api,
    updateData,
  };
}

export function useDelete<T = any>(endpoint: string, options: ApiOptions = {}) {
  const api = useApi<T>();
  
  const deleteData = useCallback(() => {
    return api.delete(endpoint, options);
  }, [api, endpoint, options]);

  return {
    ...api,
    deleteData,
  };
}
