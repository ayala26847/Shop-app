// Error processing hook

import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface ErrorInfo {
  id: string;
  message: string;
  code?: string;
  stack?: string;
  timestamp: Date;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'validation' | 'authentication' | 'authorization' | 'notFound' | 'server' | 'client' | 'unknown';
  retryable: boolean;
  retryCount: number;
  maxRetries: number;
}

export interface UseErrorHandlerOptions {
  enableToastNotifications?: boolean;
  enableErrorReporting?: boolean;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  onError?: (error: ErrorInfo) => void;
  onRetry?: (error: ErrorInfo) => void;
  onMaxRetriesReached?: (error: ErrorInfo) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    enableToastNotifications = true,
    enableErrorReporting = false,
    enableRetry = true,
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
    onError,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const { t } = useTranslation();
  const { showError, showWarning, showInfo } = useToast();
  const { announce } = useAccessibility({ announceErrors: true });
  
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [isRetrying, setIsRetrying] = useState<Record<string, boolean>>({});
  const retryTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const categorizeError = useCallback((error: Error): ErrorInfo['category'] => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('unauthorized') || message.includes('401')) return 'authentication';
    if (message.includes('forbidden') || message.includes('403')) return 'authorization';
    if (message.includes('not found') || message.includes('404')) return 'notFound';
    if (message.includes('server') || message.includes('500')) return 'server';
    if (message.includes('validation') || message.includes('invalid')) return 'validation';
    if (message.includes('client')) return 'client';
    
    return 'unknown';
  }, []);

  const determineSeverity = useCallback((error: Error, category: ErrorInfo['category']): ErrorInfo['severity'] => {
    if (error.message.includes('critical') || error.message.includes('fatal')) return 'critical';
    if (category === 'server' || category === 'network') return 'high';
    if (category === 'authentication' || category === 'authorization') return 'medium';
    if (category === 'validation') return 'low';
    
    return 'medium';
  }, []);

  const isRetryable = useCallback((error: Error, category: ErrorInfo['category']): boolean => {
    if (!enableRetry) return false;
    if (category === 'authentication' || category === 'authorization') return false;
    if (category === 'notFound') return false;
    if (category === 'validation') return false;
    if (category === 'network' || category === 'server') return true;
    
    return false;
  }, [enableRetry]);

  const createErrorInfo = useCallback((error: Error, context?: Record<string, any>): ErrorInfo => {
    const category = categorizeError(error);
    const severity = determineSeverity(error, category);
    const retryable = isRetryable(error, category);

    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      code: (error as any).code,
      stack: error.stack,
      timestamp: new Date(),
      context,
      severity,
      category,
      retryable,
      retryCount: 0,
      maxRetries,
    };
  }, [categorizeError, determineSeverity, isRetryable, maxRetries]);

  const handleError = useCallback((error: Error, context?: Record<string, any>) => {
    const errorInfo = createErrorInfo(error, context);
    
    setErrors(prev => [...prev, errorInfo]);

    // Show toast notification
    if (enableToastNotifications) {
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
    }

    // Announce to screen readers
    announce(t('accessibility.errorOccurred'), 'assertive');

    // Call error callback
    onError?.(errorInfo);

    // Report error if enabled
    if (enableErrorReporting) {
      // This would typically send to an error reporting service
      console.error('Error reported:', errorInfo);
    }

    return errorInfo;
  }, [createErrorInfo, enableToastNotifications, showError, showWarning, showInfo, announce, t, onError, enableErrorReporting]);

  const retryError = useCallback(async (errorId: string, retryFn: () => Promise<void>) => {
    const error = errors.find(e => e.id === errorId);
    if (!error || !error.retryable || error.retryCount >= error.maxRetries) {
      return false;
    }

    setIsRetrying(prev => ({ ...prev, [errorId]: true }));

    try {
      // Calculate delay with exponential backoff
      const delay = retryDelay * Math.pow(backoffMultiplier, error.retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      await retryFn();
      
      // Success - remove error
      setErrors(prev => prev.filter(e => e.id !== errorId));
      setIsRetrying(prev => {
        const newRetrying = { ...prev };
        delete newRetrying[errorId];
        return newRetrying;
      });

      announce(t('accessibility.retrySuccessful'), 'polite');
      return true;
    } catch (retryError) {
      const newRetryCount = error.retryCount + 1;
      
      setErrors(prev => prev.map(e => 
        e.id === errorId 
          ? { ...e, retryCount: newRetryCount }
          : e
      ));

      if (newRetryCount >= error.maxRetries) {
        onMaxRetriesReached?.(error);
        announce(t('accessibility.maxRetriesReached'), 'assertive');
      } else {
        announce(t('accessibility.retryFailed'), 'assertive');
      }
      
      setIsRetrying(prev => ({ ...prev, [errorId]: false }));
      return false;
    }
  }, [errors, retryDelay, backoffMultiplier, announce, t, onMaxRetriesReached]);

  const clearError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
    setIsRetrying(prev => {
      const newRetrying = { ...prev };
      delete newRetrying[errorId];
      return newRetrying;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
    setIsRetrying({});
  }, []);

  const getErrorsByCategory = useCallback((category: ErrorInfo['category']) => {
    return errors.filter(e => e.category === category);
  }, [errors]);

  const getErrorsBySeverity = useCallback((severity: ErrorInfo['severity']) => {
    return errors.filter(e => e.severity === severity);
  }, [errors]);

  const getRetryableErrors = useCallback(() => {
    return errors.filter(e => e.retryable && e.retryCount < e.maxRetries);
  }, [errors]);

  const getCriticalErrors = useCallback(() => {
    return errors.filter(e => e.severity === 'critical');
  }, [errors]);

  const hasErrors = errors.length > 0;
  const hasCriticalErrors = getCriticalErrors().length > 0;
  const hasRetryableErrors = getRetryableErrors().length > 0;

  return {
    errors,
    isRetrying,
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
