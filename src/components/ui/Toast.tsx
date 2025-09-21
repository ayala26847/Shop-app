import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

export function Toast({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose, 
  persistent = false,
  actions = []
}: ToastProps) {
  const { t } = useTranslation();
  const { announce, getAriaAttributes } = useAccessibility({
    announceChanges: true,
    announceErrors: type === 'error',
    announceSuccess: type === 'success',
  });
  
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(duration);

  useEffect(() => {
    // Animate in
    setIsVisible(true);
    
    // Announce the toast
    const announcement = message ? `${title}. ${message}` : title;
    announce(announcement, type === 'error' ? 'assertive' : 'polite');

    // Auto-dismiss (unless persistent)
    if (!persistent) {
      const timer = setInterval(() => {
        if (!isPaused) {
          setTimeRemaining(prev => {
            if (prev <= 100) {
              handleClose();
              return 0;
            }
            return prev - 100;
          });
        }
      }, 100);

      return () => clearInterval(timer);
    }
  }, [duration, persistent, isPaused, announce, title, message, type]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(id);
    }, 300); // Wait for animation to complete
  }, [id, onClose]);

  const handlePause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const handleResume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const getIcon = () => {
    const iconClass = "w-6 h-6";
    const iconProps = {
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
      strokeWidth: 2
    };

    switch (type) {
      case 'success':
        return (
          <svg className={`${iconClass} text-green-600`} {...iconProps}>
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className={`${iconClass} text-red-600`} {...iconProps}>
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={`${iconClass} text-yellow-600`} {...iconProps}>
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'info':
        return (
          <svg className={`${iconClass} text-blue-600`} {...iconProps}>
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getToastClasses = () => {
    const baseClasses = `relative transform transition-all duration-300 ease-in-out ${
      isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
    }`;

    const typeClasses = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };

    return `${baseClasses} ${typeClasses[type]} border rounded-lg shadow-lg p-4 max-w-sm w-full`;
  };

  const progressPercentage = persistent ? 0 : ((duration - timeRemaining) / duration) * 100;

  return (
    <div
      className={getToastClasses()}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      onFocus={handlePause}
      onBlur={handleResume}
      {...getAriaAttributes({
        label: `${t(`accessibility.${type}`)}: ${title}`,
        description: message,
        live: type === 'error' ? 'assertive' : 'polite',
        atomic: true
      })}
    >
      {/* Progress bar */}
      {!persistent && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-current opacity-20 rounded-t-lg">
          <div 
            className="h-full bg-current transition-all duration-100 ease-linear rounded-t-lg"
            style={{ width: `${100 - progressPercentage}%` }}
          />
        </div>
      )}

      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-semibold">
            {title}
          </h4>
          {message && (
            <p className="mt-1 text-sm opacity-90">
              {message}
            </p>
          )}
          
          {/* Action buttons */}
          {actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  type="button"
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    action.variant === 'primary'
                      ? 'bg-current text-white hover:opacity-80'
                      : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                  }`}
                  onClick={action.action}
                  aria-label={action.label}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="ml-4 flex-shrink-0">
          <button
            type="button"
            className="inline-flex items-center justify-center w-6 h-6 text-current hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-current focus:ring-opacity-50 transition-all duration-200 rounded-md"
            onClick={handleClose}
            aria-label={t('common.close')}
            {...getAriaAttributes({
              label: t('accessibility.closeModal')
            })}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast Container Component
export interface ToastContainerProps {
  toasts: ToastProps[];
  onRemoveToast: (id: string) => void;
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-4 max-w-sm w-full"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onRemoveToast}
        />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToasts() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...toast, id, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    addToast({ type: 'error', title, message });
  };

  const showWarning = (title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  };

  const showInfo = (title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  };

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}