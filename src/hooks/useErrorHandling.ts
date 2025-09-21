import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { useAccessibility } from './useAccessibility';

export interface ErrorInfo {
  id: string;
  message: string;
  code?: string;
  status?: number;
  timestamp: Date;
  context?: Record<string, any>;
  stack?: string;
  retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'validation' | 'authentication' | 'authorization' | 'notFound' | 'server' | 'client' | 'unknown';
}

export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number) => void;
  onMaxRetriesReached?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  retryCount: number;
  lastRetry: Date | null;
}

export function useErrorHandling() {
  const { t } = useTranslation();
  const { showError, showWarning, showInfo } = useToast();
  const { announce } = useAccessibility({ announceErrors: true });

  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [retryAttempts, setRetryAttempts] = useState<Record<string, number>>({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRetrying, setIsRetrying] = useState<Record<string, boolean>>({});

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      announce(t('accessibility.connectionRestored'));
      showInfo(t('accessibility.connectionRestored'));
    };

    const handleOffline = () => {
      setIsOnline(false);
      announce(t('accessibility.connectionLost'));
      showWarning(t('accessibility.connectionLost'));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [announce, showInfo, showWarning, t]);

  // Categorize error
  const categorizeError = useCallback((error: any): ErrorInfo['category'] => {
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('network')) {
      return 'network';
    }
    if (error?.status === 401 || error?.message?.includes('unauthorized')) {
      return 'authentication';
    }
    if (error?.status === 403 || error?.message?.includes('forbidden')) {
      return 'authorization';
    }
    if (error?.status === 404 || error?.message?.includes('not found')) {
      return 'notFound';
    }
    if (error?.status >= 500 || error?.message?.includes('server')) {
      return 'server';
    }
    if (error?.status >= 400 || error?.message?.includes('validation')) {
      return 'validation';
    }
    if (error?.message?.includes('client')) {
      return 'client';
    }
    return 'unknown';
  }, []);

  // Determine error severity
  const determineSeverity = useCallback((error: any, category: ErrorInfo['category']): ErrorInfo['severity'] => {
    if (error?.status >= 500) return 'critical';
    if (error?.status === 404) return 'medium';
    if (error?.status === 401 || error?.status === 403) return 'high';
    if (category === 'network' && !isOnline) return 'high';
    if (category === 'network' && isOnline) return 'medium';
    if (category === 'validation') return 'low';
    return 'medium';
  }, [isOnline]);

  // Check if error is retryable
  const isRetryable = useCallback((error: any, category: ErrorInfo['category']): boolean => {
    if (category === 'network' && isOnline) return true;
    if (category === 'server' && error?.status >= 500) return true;
    if (category === 'authentication' && error?.status === 401) return false;
    if (category === 'authorization' && error?.status === 403) return false;
    if (category === 'notFound' && error?.status === 404) return false;
    if (category === 'validation') return false;
    return false;
  }, [isOnline]);

  // Create error info
  const createErrorInfo = useCallback((error: any, context?: Record<string, any>): ErrorInfo => {
    const category = categorizeError(error);
    const severity = determineSeverity(error, category);
    const retryable = isRetryable(error, category);

    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: error?.message || error?.toString() || t('accessibility.unknownError'),
      code: error?.code,
      status: error?.status,
      timestamp: new Date(),
      context,
      stack: error?.stack,
      retryable,
      severity,
      category,
    };
  }, [categorizeError, determineSeverity, isRetryable, t]);

  // Handle error
  const handleError = useCallback((error: any, context?: Record<string, any>) => {
    const errorInfo = createErrorInfo(error, context);
    
    setErrors(prev => [...prev, errorInfo]);

    // Announce error to screen readers
    announce(t('accessibility.errorOccurred'));

    // Show appropriate toast
    switch (errorInfo.severity) {
      case 'critical':
        showError(errorInfo.message, t('accessibility.criticalError'));
        break;
      case 'high':
        showError(errorInfo.message, t('accessibility.highSeverityError'));
        break;
      case 'medium':
        showWarning(errorInfo.message, t('accessibility.mediumSeverityError'));
        break;
      case 'low':
        showInfo(errorInfo.message, t('accessibility.lowSeverityError'));
        break;
    }

    return errorInfo;
  }, [createErrorInfo, announce, showError, showWarning, showInfo, t]);

  // Retry error
  const retryError = useCallback(async (
    errorId: string,
    retryFn: () => Promise<any>,
    options: RetryOptions = {}
  ) => {
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = 'exponential',
      onRetry,
      onMaxRetriesReached,
    } = options;

    const currentAttempts = retryAttempts[errorId] || 0;
    
    if (currentAttempts >= maxAttempts) {
      onMaxRetriesReached?.();
      return false;
    }

    setIsRetrying(prev => ({ ...prev, [errorId]: true }));

    try {
      onRetry?.(currentAttempts + 1);
      
      // Calculate delay with backoff
      const retryDelay = backoff === 'exponential' 
        ? delay * Math.pow(2, currentAttempts)
        : delay * (currentAttempts + 1);

      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      const result = await retryFn();
      
      // Success - remove error and reset retry count
      setErrors(prev => prev.filter(e => e.id !== errorId));
      setRetryAttempts(prev => {
        const newAttempts = { ...prev };
        delete newAttempts[errorId];
        return newAttempts;
      });
      setIsRetrying(prev => {
        const newRetrying = { ...prev };
        delete newRetrying[errorId];
        return newRetrying;
      });

      announce(t('accessibility.retrySuccessful'));
      showInfo(t('accessibility.retrySuccessful'));

      return result;
    } catch (retryError) {
      const newAttempts = currentAttempts + 1;
      setRetryAttempts(prev => ({ ...prev, [errorId]: newAttempts }));
      
      if (newAttempts >= maxAttempts) {
        onMaxRetriesReached?.();
        announce(t('accessibility.maxRetriesReached'));
        showError(t('accessibility.maxRetriesReached'));
      } else {
        announce(t('accessibility.retryFailed'));
        showWarning(t('accessibility.retryFailed'));
      }
      
      setIsRetrying(prev => ({ ...prev, [errorId]: false }));
      return false;
    }
  }, [retryAttempts, announce, showInfo, showError, showWarning, t]);

  // Clear error
  const clearError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
    setRetryAttempts(prev => {
      const newAttempts = { ...prev };
      delete newAttempts[errorId];
      return newAttempts;
    });
    setIsRetrying(prev => {
      const newRetrying = { ...prev };
      delete newRetrying[errorId];
      return newRetrying;
    });
  }, []);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setErrors([]);
    setRetryAttempts({});
    setIsRetrying({});
  }, []);

  // Get errors by category
  const getErrorsByCategory = useCallback((category: ErrorInfo['category']) => {
    return errors.filter(e => e.category === category);
  }, [errors]);

  // Get errors by severity
  const getErrorsBySeverity = useCallback((severity: ErrorInfo['severity']) => {
    return errors.filter(e => e.severity === severity);
  }, [errors]);

  // Get retryable errors
  const getRetryableErrors = useCallback(() => {
    return errors.filter(e => e.retryable && !isRetrying[e.id]);
  }, [errors, isRetrying]);

  // Get critical errors
  const getCriticalErrors = useCallback(() => {
    return errors.filter(e => e.severity === 'critical');
  }, [errors]);

  // Check if there are any errors
  const hasErrors = errors.length > 0;
  const hasCriticalErrors = getCriticalErrors().length > 0;
  const hasRetryableErrors = getRetryableErrors().length > 0;

  return {
    errors,
    isOnline,
    isRetrying,
    retryAttempts,
    hasErrors,
    hasCriticalErrors,
    hasRetryableErrors,
    handleError,
    retryError,
    clearError,
    clearAllErrors,
    getErrorsByCategory,
    getErrorsBySeverity,
    getRetryableErrors,
    getCriticalErrors,
  };
}

// Hook for offline handling
export function useOfflineHandling() {
  const { t } = useTranslation();
  const { showWarning, showInfo } = useToast();
  const { announce } = useAccessibility({ announceChanges: true });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineActions, setOfflineActions] = useState<Array<() => Promise<any>>>([]);
  const [isProcessingOfflineActions, setIsProcessingOfflineActions] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      announce(t('accessibility.connectionRestored'));
      showInfo(t('accessibility.connectionRestored'));
      
      // Process queued offline actions
      if (offlineActions.length > 0) {
        processOfflineActions();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      announce(t('accessibility.connectionLost'));
      showWarning(t('accessibility.connectionLost'));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [announce, showInfo, showWarning, t, offlineActions]);

  const queueOfflineAction = useCallback((action: () => Promise<any>) => {
    setOfflineActions(prev => [...prev, action]);
  }, []);

  const processOfflineActions = useCallback(async () => {
    if (isProcessingOfflineActions || offlineActions.length === 0) return;

    setIsProcessingOfflineActions(true);
    
    try {
      const actions = [...offlineActions];
      setOfflineActions([]);

      for (const action of actions) {
        try {
          await action();
        } catch (error) {
          console.error('Failed to process offline action:', error);
        }
      }

      announce(t('accessibility.offlineActionsProcessed'));
      showInfo(t('accessibility.offlineActionsProcessed'));
    } finally {
      setIsProcessingOfflineActions(false);
    }
  }, [isProcessingOfflineActions, offlineActions, announce, showInfo, t]);

  return {
    isOnline,
    offlineActions,
    isProcessingOfflineActions,
    queueOfflineAction,
    processOfflineActions,
  };
}

// Hook for empty state handling
export function useEmptyStateHandling() {
  const { t } = useTranslation();
  const { announce } = useAccessibility({ announceChanges: true });

  const [emptyStates, setEmptyStates] = useState<Record<string, boolean>>({});

  const setEmptyState = useCallback((key: string, isEmpty: boolean) => {
    setEmptyStates(prev => ({ ...prev, [key]: isEmpty }));
    
    if (isEmpty) {
      announce(t('accessibility.emptyState', { key }));
    }
  }, [announce, t]);

  const isEmpty = useCallback((key: string) => {
    return emptyStates[key] || false;
  }, [emptyStates]);

  const getEmptyStateMessage = useCallback((key: string, customMessage?: string) => {
    if (customMessage) return customMessage;
    
    const messages: Record<string, string> = {
      products: t('accessibility.noProducts'),
      orders: t('accessibility.noOrders'),
      cart: t('accessibility.cartEmpty'),
      search: t('accessibility.noSearchResults'),
      favorites: t('accessibility.noFavorites'),
      reviews: t('accessibility.noReviews'),
      notifications: t('accessibility.noNotifications'),
    };

    return messages[key] || t('accessibility.emptyState', { key });
  }, [t]);

  return {
    emptyStates,
    setEmptyState,
    isEmpty,
    getEmptyStateMessage,
  };
}
