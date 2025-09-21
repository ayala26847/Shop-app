// Base loading spinner component with accessibility and customization

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  label?: string;
  description?: string;
  inline?: boolean;
  className?: string;
  showText?: boolean;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  label,
  description,
  inline = false,
  className = '',
  showText = false,
  text,
}) => {
  const { t } = useTranslation();
  const { getAriaAttributes } = useAccessibility();

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-500',
  };

  const spinnerLabel = label || t('accessibility.loading');
  const spinnerText = text || t('accessibility.loading');

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div
            className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}
          />
        );

      case 'bars':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-1 ${colorClasses[color]} animate-pulse`}
                style={{
                  height: `${12 + i * 4}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        );

      case 'ring':
        return (
          <div
            className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-current border-t-transparent rounded-full animate-spin`}
          />
        );

      default: // spinner
        return (
          <div
            className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-current border-t-transparent rounded-full animate-spin`}
          />
        );
    }
  };

  const containerClasses = inline
    ? 'inline-flex items-center'
    : 'flex items-center justify-center';

  return (
    <div
      className={`${containerClasses} ${className}`}
      role="status"
      aria-live="polite"
      {...getAriaAttributes({
        label: spinnerLabel,
        description: description || t('accessibility.loadingDescription'),
      })}
    >
      {renderSpinner()}
      {showText && (
        <span className="ml-2 text-sm text-gray-600">
          {spinnerText}
        </span>
      )}
      <span className="sr-only">{spinnerLabel}</span>
    </div>
  );
};
