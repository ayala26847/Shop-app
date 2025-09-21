// Standardized error message component

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../hooks/useAccessibility';
import { motion, AnimatePresence } from 'framer-motion';

export interface ErrorMessageProps {
  error?: string | Error | null;
  title?: string;
  description?: string;
  variant?: 'default' | 'inline' | 'banner' | 'modal' | 'toast';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  showIcon?: boolean;
  showRetry?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  title,
  description,
  variant = 'default',
  severity = 'medium',
  showIcon = true,
  showRetry = false,
  onRetry,
  onDismiss,
  className = '',
  children,
}) => {
  const { t } = useTranslation();
  const { getAriaAttributes } = useAccessibility();

  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorTitle = title || t('accessibility.errorOccurred');
  const errorDescription = description || errorMessage;

  const severityClasses = {
    low: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    medium: 'bg-orange-50 border-orange-200 text-orange-800',
    high: 'bg-red-50 border-red-200 text-red-800',
    critical: 'bg-red-100 border-red-300 text-red-900',
  };

  const variantClasses = {
    default: 'p-4 rounded-md border',
    inline: 'text-sm',
    banner: 'p-4 rounded-md border mb-4',
    modal: 'p-6 rounded-lg border shadow-lg',
    toast: 'p-3 rounded-md border shadow-sm',
  };

  const iconClasses = {
    low: 'text-yellow-600',
    medium: 'text-orange-600',
    high: 'text-red-600',
    critical: 'text-red-700',
  };

  const getIcon = () => {
    switch (severity) {
      case 'low':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'high':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'critical':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`${variantClasses[variant]} ${severityClasses[severity]} ${className}`}
        role="alert"
        aria-live="assertive"
        {...getAriaAttributes({
          label: errorTitle,
          description: errorDescription,
        })}
      >
        <div className="flex items-start">
          {showIcon && (
            <div className={`flex-shrink-0 mr-3 ${iconClasses[severity]}`}>
              {getIcon()}
            </div>
          )}
          
          <div className="flex-1">
            {title && (
              <h3 className="text-sm font-medium mb-1">
                {errorTitle}
              </h3>
            )}
            
            <p className="text-sm">
              {errorDescription}
            </p>
            
            {children && (
              <div className="mt-2">
                {children}
              </div>
            )}
            
            {(showRetry || onDismiss) && (
              <div className="mt-3 flex space-x-2">
                {showRetry && onRetry && (
                  <button
                    onClick={onRetry}
                    className="text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
                  >
                    {t('accessibility.retry')}
                  </button>
                )}
                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
                  >
                    {t('accessibility.dismiss')}
                  </button>
                )}
              </div>
            )}
          </div>
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 ml-3 text-current hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
              aria-label={t('accessibility.dismiss')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Specialized error message components
export const InlineError: React.FC<Omit<ErrorMessageProps, 'variant'>> = (props) => (
  <ErrorMessage variant="inline" {...props} />
);

export const BannerError: React.FC<Omit<ErrorMessageProps, 'variant'>> = (props) => (
  <ErrorMessage variant="banner" {...props} />
);

export const ModalError: React.FC<Omit<ErrorMessageProps, 'variant'>> = (props) => (
  <ErrorMessage variant="modal" {...props} />
);

export const ToastError: React.FC<Omit<ErrorMessageProps, 'variant'>> = (props) => (
  <ErrorMessage variant="toast" {...props} />
);

// Error message with retry
export const RetryableError: React.FC<{
  error: string | Error;
  onRetry: () => void;
  className?: string;
}> = ({ error, onRetry, className = '' }) => (
  <ErrorMessage
    error={error}
    showRetry
    onRetry={onRetry}
    className={className}
  />
);

// Critical error message
export const CriticalError: React.FC<{
  error: string | Error;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}> = ({ error, onRetry, onDismiss, className = '' }) => (
  <ErrorMessage
    error={error}
    severity="critical"
    showRetry={!!onRetry}
    onRetry={onRetry}
    onDismiss={onDismiss}
    className={className}
  />
);
