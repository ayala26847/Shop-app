// Error retry mechanism component

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../hooks/useAccessibility';
import { LoadingButton } from '../Loading/LoadingButton';
import { motion, AnimatePresence } from 'framer-motion';

export interface ErrorRetryProps {
  error: string | Error;
  onRetry: () => Promise<void> | void;
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  className?: string;
  showRetryButton?: boolean;
  retryButtonText?: string;
  showRetryCount?: boolean;
  onMaxRetriesReached?: () => void;
  onRetrySuccess?: () => void;
  onRetryError?: (error: Error) => void;
}

export const ErrorRetry: React.FC<ErrorRetryProps> = ({
  error,
  onRetry,
  maxRetries = 3,
  retryDelay = 1000,
  backoffMultiplier = 2,
  className = '',
  showRetryButton = true,
  retryButtonText,
  showRetryCount = true,
  onMaxRetriesReached,
  onRetrySuccess,
  onRetryError,
}) => {
  const { t } = useTranslation();
  const { announce } = useAccessibility({ announceChanges: true });
  
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      onMaxRetriesReached?.();
      return;
    }

    setIsRetrying(true);
    setRetryError(null);

    try {
      // Calculate delay with exponential backoff
      const delay = retryDelay * Math.pow(backoffMultiplier, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      await onRetry();
      
      setRetryCount(0);
      setIsRetrying(false);
      onRetrySuccess?.();
      announce(t('accessibility.retrySuccessful'), 'polite');
    } catch (err) {
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      setIsRetrying(false);
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      setRetryError(errorMessage);
      
      onRetryError?.(err instanceof Error ? err : new Error(errorMessage));
      
      if (newRetryCount >= maxRetries) {
        onMaxRetriesReached?.();
        announce(t('accessibility.maxRetriesReached'), 'assertive');
      } else {
        announce(t('accessibility.retryFailed'), 'assertive');
      }
    }
  }, [retryCount, maxRetries, retryDelay, backoffMultiplier, onRetry, onRetrySuccess, onRetryError, onMaxRetriesReached, announce, t]);

  const canRetry = retryCount < maxRetries;
  const isMaxRetriesReached = retryCount >= maxRetries;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm text-red-600">
        {typeof error === 'string' ? error : error.message}
      </div>

      {retryError && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="text-sm text-red-500"
        >
          {t('accessibility.retryError')}: {retryError}
        </motion.div>
      )}

      {showRetryCount && retryCount > 0 && (
        <div className="text-sm text-gray-600">
          {t('accessibility.retryAttempt', { count: retryCount, max: maxRetries })}
        </div>
      )}

      {showRetryButton && (
        <div className="flex items-center space-x-2">
          <LoadingButton
            onClick={handleRetry}
            isLoading={isRetrying}
            loadingText={t('accessibility.retrying')}
            disabled={!canRetry || isRetrying}
            variant="outline"
            size="sm"
          >
            {retryButtonText || t('accessibility.retry')}
          </LoadingButton>

          {isMaxRetriesReached && (
            <span className="text-sm text-gray-500">
              {t('accessibility.maxRetriesReached')}
            </span>
          )}
        </div>
      )}

      {isMaxRetriesReached && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600"
        >
          {t('accessibility.contactSupport')}
        </motion.div>
      )}
    </div>
  );
};

// Specialized retry components
export const NetworkErrorRetry: React.FC<{
  error: string | Error;
  onRetry: () => Promise<void> | void;
  className?: string;
}> = ({ error, onRetry, className = '' }) => (
  <ErrorRetry
    error={error}
    onRetry={onRetry}
    maxRetries={5}
    retryDelay={2000}
    backoffMultiplier={1.5}
    className={className}
  />
);

export const ApiErrorRetry: React.FC<{
  error: string | Error;
  onRetry: () => Promise<void> | void;
  className?: string;
}> = ({ error, onRetry, className = '' }) => (
  <ErrorRetry
    error={error}
    onRetry={onRetry}
    maxRetries={3}
    retryDelay={1000}
    backoffMultiplier={2}
    className={className}
  />
);

export const FileUploadRetry: React.FC<{
  error: string | Error;
  onRetry: () => Promise<void> | void;
  className?: string;
}> = ({ error, onRetry, className = '' }) => (
  <ErrorRetry
    error={error}
    onRetry={onRetry}
    maxRetries={2}
    retryDelay={5000}
    backoffMultiplier={1}
    className={className}
  />
);
