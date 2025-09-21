import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../hooks/useAccessibility';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'section';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error reporting service
      console.error('Production error:', error);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback 
        error={this.state.error} 
        errorInfo={this.state.errorInfo}
        level={this.props.level}
        onRetry={this.handleRetry}
        onReload={() => window.location.reload()}
        retryCount={this.state.retryCount}
      />;
    }

    return this.props.children;
  }
}

// Enhanced Error Fallback Component
interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  level?: 'page' | 'component' | 'section';
  onRetry: () => void;
  onReload: () => void;
  retryCount: number;
}

function ErrorFallback({ 
  error, 
  errorInfo, 
  level = 'page', 
  onRetry, 
  onReload, 
  retryCount 
}: ErrorFallbackProps) {
  const { t } = useTranslation();
  const { announce, getAriaAttributes } = useAccessibility({
    announceChanges: true,
    announceErrors: true,
  });

  React.useEffect(() => {
    announce(t('accessibility.error'), 'assertive');
  }, [announce, t]);

  const getContainerClasses = () => {
    const baseClasses = 'flex items-center justify-center';
    
    switch (level) {
      case 'page':
        return `${baseClasses} min-h-screen bg-gray-50`;
      case 'component':
        return `${baseClasses} p-8 bg-red-50 border border-red-200 rounded-lg`;
      case 'section':
        return `${baseClasses} p-4 bg-yellow-50 border border-yellow-200 rounded-md`;
      default:
        return baseClasses;
    }
  };

  const getTitle = () => {
    switch (level) {
      case 'page':
        return t('errors.pageError.title');
      case 'component':
        return t('errors.componentError.title');
      case 'section':
        return t('errors.sectionError.title');
      default:
        return t('errors.genericError');
    }
  };

  const getDescription = () => {
    switch (level) {
      case 'page':
        return t('errors.pageError.description');
      case 'component':
        return t('errors.componentError.description');
      case 'section':
        return t('errors.sectionError.description');
      default:
        return t('errors.genericError');
    }
  };

  const getIcon = () => {
    const iconClass = level === 'page' ? 'h-12 w-12' : level === 'component' ? 'h-8 w-8' : 'h-6 w-6';
    const colorClass = level === 'page' ? 'text-red-500' : level === 'component' ? 'text-red-500' : 'text-yellow-500';
    
    return (
      <svg className={`${iconClass} ${colorClass}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div 
      className={getContainerClasses()}
      role="alert"
      aria-live="assertive"
      {...getAriaAttributes({
        label: getTitle(),
        description: getDescription(),
        live: 'assertive',
        atomic: true
      })}
    >
      <div className={`${level === 'page' ? 'max-w-md' : level === 'component' ? 'max-w-sm' : 'max-w-xs'} w-full bg-white shadow-lg rounded-lg p-6`}>
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3">
            <h3 className={`${level === 'page' ? 'text-lg' : level === 'component' ? 'text-base' : 'text-sm'} font-medium text-gray-900`}>
              {getTitle()}
            </h3>
          </div>
        </div>
        
        <div className={`${level === 'page' ? 'text-sm' : 'text-xs'} text-gray-500 mb-4`}>
          {getDescription()}
        </div>

        {retryCount > 0 && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            {t('errors.retryAttempt', { count: retryCount })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            aria-label={t('errors.retryButton')}
          >
            {t('errors.retryButton')}
          </button>
          
          {level === 'page' && (
            <button
              onClick={onReload}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
              aria-label={t('errors.reloadButton')}
            >
              {t('errors.reloadButton')}
            </button>
          )}
        </div>

        {/* Error reporting */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              // TODO: Implement error reporting
              console.log('Report error clicked');
            }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
            aria-label={t('errors.reportError')}
          >
            {t('errors.reportError')}
          </button>
        </div>

        {/* Development error details */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
              {t('errors.errorDetails')}
            </summary>
            <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded overflow-auto max-h-40">
              <pre className="whitespace-pre-wrap">
                {error.toString()}
                {errorInfo?.componentStack}
              </pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

// Hook for error boundary functionality
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
}

// Higher-order component for error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
