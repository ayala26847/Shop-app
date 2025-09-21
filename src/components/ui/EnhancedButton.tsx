import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useButtonInteractions } from '../../hooks/useMicroInteractions';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  microInteractions?: boolean;
  hapticFeedback?: boolean;
  soundFeedback?: boolean;
  children: React.ReactNode;
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    microInteractions = true,
    hapticFeedback = true,
    soundFeedback = false,
    className = '',
    children,
    onClick,
    disabled,
    ...props
  }, ref) => {
    const { t } = useTranslation();
    const { announce, getAriaAttributes } = useAccessibility({
      announceChanges: true,
    });

    const {
      hoverState,
      loadingState,
      handleClick,
      handleSuccess,
      handleError,
      startLoading,
      stopLoading,
      handleMouseEnter,
      handleMouseLeave,
      handleFocus,
      handleBlur,
      handleMouseDown,
      handleMouseUp,
    } = useButtonInteractions({
      announceChanges: true,
      hapticFeedback,
      soundFeedback,
    });

    // Handle loading state
    React.useEffect(() => {
      if (loading) {
        startLoading(loadingText);
      } else {
        stopLoading();
      }
    }, [loading, loadingText, startLoading, stopLoading]);

    // Handle click with micro-interactions
    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      if (microInteractions) {
        handleClick(() => {
          onClick?.(event);
        });
      } else {
        onClick?.(event);
      }
    };

    // Get variant classes
    const getVariantClasses = () => {
      const baseClasses = 'font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
      
      switch (variant) {
        case 'primary':
          return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 ${
            hoverState.isPressed ? 'bg-blue-800' : ''
          }`;
        case 'secondary':
          return `${baseClasses} bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 ${
            hoverState.isPressed ? 'bg-gray-800' : ''
          }`;
        case 'outline':
          return `${baseClasses} border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 ${
            hoverState.isPressed ? 'bg-blue-100' : ''
          }`;
        case 'ghost':
          return `${baseClasses} text-blue-600 hover:bg-blue-50 focus:ring-blue-500 ${
            hoverState.isPressed ? 'bg-blue-100' : ''
          }`;
        case 'danger':
          return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 ${
            hoverState.isPressed ? 'bg-red-800' : ''
          }`;
        case 'success':
          return `${baseClasses} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 ${
            hoverState.isPressed ? 'bg-green-800' : ''
          }`;
        default:
          return baseClasses;
      }
    };

    // Get size classes
    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'px-3 py-1.5 text-sm';
        case 'md':
          return 'px-4 py-2 text-base';
        case 'lg':
          return 'px-6 py-3 text-lg';
        default:
          return 'px-4 py-2 text-base';
      }
    };

    // Get loading spinner
    const getLoadingSpinner = () => (
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    // Get icon with proper positioning
    const getIcon = () => {
      if (loading) {
        return getLoadingSpinner();
      }
      return icon;
    };

    // Get button content
    const getButtonContent = () => {
      const iconElement = getIcon();
      const text = loading && loadingText ? loadingText : children;

      if (!iconElement) {
        return text;
      }

      if (iconPosition === 'left') {
        return (
          <>
            {iconElement}
            {text}
          </>
        );
      } else {
        return (
          <>
            {text}
            {iconElement}
          </>
        );
      }
    };

    const buttonClasses = `
      ${getVariantClasses()}
      ${getSizeClasses()}
      ${fullWidth ? 'w-full' : ''}
      ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      ${hoverState.isHovered ? 'transform scale-105' : ''}
      ${hoverState.isFocused ? 'ring-2' : ''}
      ${hoverState.isPressed ? 'transform scale-95' : ''}
      rounded-lg
      ${className}
    `.trim();

    return (
      <button
        ref={ref}
        type="button"
        className={buttonClasses}
        disabled={disabled || loading}
        onClick={handleButtonClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        aria-label={typeof children === 'string' ? children : t('common.button')}
        aria-disabled={disabled || loading}
        {...getAriaAttributes({
          label: typeof children === 'string' ? children : t('common.button'),
          disabled: disabled || loading,
          live: loading ? 'polite' : 'off',
        })}
        {...props}
      >
        {getButtonContent()}
        {loading && (
          <span className="sr-only">
            {loadingText || t('accessibility.loading')}
          </span>
        )}
      </button>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';

// Button group component
export interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ButtonGroup({
  children,
  orientation = 'horizontal',
  spacing = 'md',
  className = '',
}: ButtonGroupProps) {
  const { t } = useTranslation();
  const { getAriaAttributes } = useAccessibility();

  const getSpacingClasses = () => {
    switch (spacing) {
      case 'sm':
        return orientation === 'horizontal' ? 'space-x-1' : 'space-y-1';
      case 'md':
        return orientation === 'horizontal' ? 'space-x-2' : 'space-y-2';
      case 'lg':
        return orientation === 'horizontal' ? 'space-x-4' : 'space-y-4';
      default:
        return orientation === 'horizontal' ? 'space-x-2' : 'space-y-2';
    }
  };

  return (
    <div
      className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} ${getSpacingClasses()} ${className}`}
      role="group"
      aria-label={t('accessibility.navigation')}
      {...getAriaAttributes({
        label: t('accessibility.navigation'),
      })}
    >
      {children}
    </div>
  );
}

// Icon button component
export interface IconButtonProps extends Omit<EnhancedButtonProps, 'children'> {
  icon: React.ReactNode;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    icon,
    label,
    size = 'md',
    className = '',
    ...props
  }, ref) => {
    const { t } = useTranslation();
    const { getAriaAttributes } = useAccessibility();

    const getSizeClasses = () => {
      switch (size) {
        case 'sm':
          return 'p-1.5';
        case 'md':
          return 'p-2';
        case 'lg':
          return 'p-3';
        default:
          return 'p-2';
      }
    };

    return (
      <EnhancedButton
        ref={ref}
        className={`${getSizeClasses()} ${className}`}
        aria-label={label}
        {...getAriaAttributes({
          label,
        })}
        {...props}
      >
        {icon}
        <span className="sr-only">{label}</span>
      </EnhancedButton>
    );
  }
);

IconButton.displayName = 'IconButton';
