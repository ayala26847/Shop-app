import React, { Component, ReactNode, ErrorInfo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useErrorHandling } from '../../hooks/useErrorHandling';
import { EnhancedButton } from './EnhancedButton';
import { LoadingSpinner } from './LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'section';
  enableRetry?: boolean;
  enableReporting?: boolean;
  enableOfflineHandling?: boolean;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  lastRetry: Date | null;
  isRetrying: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      lastRetry: null,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Call error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      lastRetry: new Date(),
      isRetrying: true,
    }));

    // Simulate retry delay
    this.retryTimeoutId = setTimeout(() => {
      this.setState({ isRetrying: false });
    }, 1000);
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReport = () => {
    // In a real app, this would send the error to a reporting service
    console.log('Reporting error:', this.state.error, this.state.errorInfo);
    
    // For now, just show a success message
    alert('Error reported successfully');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          retryCount={this.state.retryCount}
          lastRetry={this.state.lastRetry}
          isRetrying={this.state.isRetrying}
          level={this.props.level || 'component'}
          enableRetry={this.props.enableRetry !== false}
          enableReporting={this.props.enableReporting !== false}
          enableOfflineHandling={this.props.enableOfflineHandling !== false}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          onReport={this.handleReport}
          className={this.props.className}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  lastRetry: Date | null;
  isRetrying: boolean;
  level: 'page' | 'component' | 'section';
  enableRetry: boolean;
  enableReporting: boolean;
  enableOfflineHandling: boolean;
  onRetry: () => void;
  onReload: () => void;
  onReport: () => void;
  className?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  retryCount,
  lastRetry,
  isRetrying,
  level,
  enableRetry,
  enableReporting,
  enableOfflineHandling,
  onRetry,
  onReload,
  onReport,
  className = '',
}) => {
  const { t } = useTranslation();
  const { announce } = useAccessibility({ announceErrors: true });
  const { isOnline } = useErrorHandling();

  // Announce error to screen readers
  React.useEffect(() => {
    announce(t('accessibility.errorOccurred'));
  }, [announce, t]);

  const getErrorTitle = () => {
    switch (level) {
      case 'page':
        return t('accessibility.pageError');
      case 'component':
        return t('accessibility.componentError');
      case 'section':
        return t('accessibility.sectionError');
      default:
        return t('accessibility.errorOccurred');
    }
  };

  const getErrorDescription = () => {
    if (error?.message) {
      return error.message;
    }
    
    switch (level) {
      case 'page':
        return t('accessibility.pageErrorDescription');
      case 'component':
        return t('accessibility.componentErrorDescription');
      case 'section':
        return t('accessibility.sectionErrorDescription');
      default:
        return t('accessibility.errorDescription');
    }
  };

  const getErrorIcon = () => {
    switch (level) {
      case 'page':
        return (
          <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'component':
        return (
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'section':
        return (
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getContainerClasses = () => {
    const baseClasses = 'flex flex-col items-center justify-center p-6 text-center';
    
    switch (level) {
      case 'page':
        return `${baseClasses} min-h-screen bg-gray-50`;
      case 'component':
        return `${baseClasses} min-h-[200px] bg-white border border-gray-200 rounded-lg shadow-sm`;
      case 'section':
        return `${baseClasses} min-h-[150px] bg-gray-50 border border-gray-200 rounded-md`;
      default:
        return baseClasses;
    }
  };

  const getTitleClasses = () => {
    switch (level) {
      case 'page':
        return 'text-2xl font-bold text-gray-900 mb-2';
      case 'component':
        return 'text-xl font-semibold text-gray-900 mb-2';
      case 'section':
        return 'text-lg font-medium text-gray-900 mb-2';
      default:
        return 'text-lg font-medium text-gray-900 mb-2';
    }
  };

  const getDescriptionClasses = () => {
    switch (level) {
      case 'page':
        return 'text-lg text-gray-600 mb-6 max-w-md';
      case 'component':
        return 'text-base text-gray-600 mb-4 max-w-sm';
      case 'section':
        return 'text-sm text-gray-600 mb-3 max-w-xs';
      default:
        return 'text-base text-gray-600 mb-4 max-w-sm';
    }
  };

  const getButtonClasses = () => {
    switch (level) {
      case 'page':
        return 'flex flex-col sm:flex-row gap-3';
      case 'component':
        return 'flex flex-col gap-2';
      case 'section':
        return 'flex flex-col gap-2';
      default:
        return 'flex flex-col gap-2';
    }
  };

  return (
    <motion.div
      className={`${getContainerClasses()} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      role="alert"
      aria-live="assertive"
    >
      <AnimatePresence>
        {isRetrying && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <LoadingSpinner size="md" />
            <p className="mt-2 text-sm text-gray-600">{t('accessibility.retrying')}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {!isRetrying && (
        <>
          {getErrorIcon()}
          
          <h2 className={getTitleClasses()}>
            {getErrorTitle()}
          </h2>
          
          <p className={getDescriptionClasses()}>
            {getErrorDescription()}
          </p>

          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mb-4">
              {t('accessibility.retryAttempt', { count: retryCount })}
              {lastRetry && (
                <span className="block">
                  {t('accessibility.lastRetry', { time: lastRetry.toLocaleTimeString() })}
                </span>
              )}
            </p>
          )}

          {!isOnline && enableOfflineHandling && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                {t('accessibility.offlineMode')}
              </p>
            </div>
          )}

          <div className={getButtonClasses()}>
            {enableRetry && (
              <EnhancedButton
                variant="primary"
                onClick={onRetry}
                disabled={isRetrying}
                ariaLabel={t('accessibility.retry')}
              >
                {t('accessibility.retry')}
              </EnhancedButton>
            )}

            {level === 'page' && (
              <EnhancedButton
                variant="secondary"
                onClick={onReload}
                ariaLabel={t('accessibility.reloadPage')}
              >
                {t('accessibility.reloadPage')}
              </EnhancedButton>
            )}

            {enableReporting && (
              <EnhancedButton
                variant="outline"
                onClick={onReport}
                ariaLabel={t('accessibility.reportError')}
              >
                {t('accessibility.reportError')}
              </EnhancedButton>
            )}
          </div>

          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-6 text-left max-w-2xl">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                {t('accessibility.developmentDetails')}
              </summary>
              <div className="bg-gray-100 p-4 rounded-md text-xs font-mono text-gray-800 overflow-auto">
                <div className="mb-2">
                  <strong>Error:</strong> {error.message}
                </div>
                {error.stack && (
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                )}
                {errorInfo && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </>
      )}
    </motion.div>
  );
};

export default ErrorBoundary;
