// Button component with integrated loading state

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  loadingSpinnerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loadingSpinnerVariant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring';
  loadingSpinnerColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  className?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  isLoading = false,
  loadingText,
  loadingSpinnerSize = 'sm',
  loadingSpinnerVariant = 'spinner',
  loadingSpinnerColor = 'primary',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  disabled = false,
  className = '',
  ...props
}) => {
  const { getAriaAttributes } = useAccessibility();

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 disabled:border-gray-200',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-400',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
  };

  const isDisabled = disabled || isLoading;
  const displayText = isLoading && loadingText ? loadingText : children;
  const showIcon = icon && !isLoading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      {...getAriaAttributes({
        label: typeof children === 'string' ? children : undefined,
        live: isLoading ? 'polite' : undefined,
        atomic: isLoading ? true : undefined,
      })}
      {...props}
    >
      {isLoading && (
        <LoadingSpinner
          size={loadingSpinnerSize}
          variant={loadingSpinnerVariant}
          color={loadingSpinnerColor}
          className="mr-2"
        />
      )}
      {showIcon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      {displayText}
      {showIcon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};
