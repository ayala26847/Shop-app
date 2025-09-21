import React, { forwardRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormInteractions } from '../../hooks/useMicroInteractions';
import { useAccessibility } from '../../hooks/useAccessibility';
import { useRealTimeValidation } from '../../hooks/useFormValidation';

export interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  required?: boolean;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
  realTimeValidation?: boolean;
  microInteractions?: boolean;
  hapticFeedback?: boolean;
  soundFeedback?: boolean;
  showCharacterCount?: boolean;
  showPasswordToggle?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
}

export const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({
    label,
    description,
    error,
    success,
    icon,
    iconPosition = 'left',
    variant = 'default',
    size = 'md',
    fullWidth = false,
    required = false,
    validation,
    realTimeValidation = false,
    microInteractions = true,
    hapticFeedback = true,
    soundFeedback = false,
    showCharacterCount = false,
    showPasswordToggle = false,
    className = '',
    type = 'text',
    value,
    onChange,
    onFocus,
    onBlur,
    ...props
  }, ref) => {
    const { t } = useTranslation();
    const { announce, getAriaAttributes } = useAccessibility({
      announceChanges: true,
    });

    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [inputValue, setInputValue] = useState(value || '');

    // Real-time validation
    const { error: validationError, isValidating, isValid } = useRealTimeValidation(
      'input',
      inputValue,
      validation || {},
      {
        debounceMs: 300,
        announceErrors: true,
      }
    );

    // Form interactions
    const {
      fieldStates,
      handleFieldFocus,
      handleFieldBlur,
      handleFieldChange,
    } = useFormInteractions({
      announceChanges: true,
      hapticFeedback,
      soundFeedback,
    });

    // Handle focus
    const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      handleFieldFocus('input');
      onFocus?.(event);
    }, [handleFieldFocus, onFocus]);

    // Handle blur
    const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      handleFieldBlur('input');
      onBlur?.(event);
    }, [handleFieldBlur, onBlur]);

    // Handle change
    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInputValue(newValue);
      
      if (realTimeValidation) {
        handleFieldChange('input', isValid);
      }
      
      onChange?.(event);
    }, [onChange, realTimeValidation, handleFieldChange, isValid]);

    // Toggle password visibility
    const togglePasswordVisibility = useCallback(() => {
      setShowPassword(!showPassword);
    }, [showPassword]);

    // Get variant classes
    const getVariantClasses = () => {
      const baseClasses = 'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';
      
      switch (variant) {
        case 'filled':
          return `${baseClasses} bg-gray-100 border-0 focus:bg-white focus:ring-blue-500`;
        case 'outlined':
          return `${baseClasses} bg-transparent border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
        default:
          return `${baseClasses} bg-white border border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
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

    // Get state classes
    const getStateClasses = () => {
      const hasError = error || validationError;
      const hasSuccess = success && !hasError;
      
      if (hasError) {
        return 'border-red-500 focus:border-red-500 focus:ring-red-500';
      } else if (hasSuccess) {
        return 'border-green-500 focus:border-green-500 focus:ring-green-500';
      } else if (isFocused) {
        return 'border-blue-500 focus:border-blue-500 focus:ring-blue-500';
      }
      return '';
    };

    // Get input type
    const getInputType = () => {
      if (type === 'password' && showPassword) {
        return 'text';
      }
      return type;
    };

    // Get character count
    const getCharacterCount = () => {
      if (!showCharacterCount) return null;
      
      const currentLength = inputValue.length;
      const maxLength = props.maxLength;
      
      return (
        <div className="text-xs text-gray-500 mt-1">
          {currentLength}{maxLength ? `/${maxLength}` : ''}
        </div>
      );
    };

    // Get validation message
    const getValidationMessage = () => {
      if (error) return error;
      if (validationError) return validationError;
      if (success) return success;
      return null;
    };

    const validationMessage = getValidationMessage();
    const hasError = !!error || !!validationError;
    const hasSuccess = !!success && !hasError;

    const inputClasses = `
      ${getVariantClasses()}
      ${getSizeClasses()}
      ${getStateClasses()}
      ${fullWidth ? 'w-full' : ''}
      ${icon && iconPosition === 'left' ? 'pl-10' : ''}
      ${icon && iconPosition === 'right' ? 'pr-10' : ''}
      ${showPasswordToggle && type === 'password' ? 'pr-10' : ''}
      rounded-lg
      ${className}
    `.trim();

    return (
      <div className={`space-y-1 ${fullWidth ? 'w-full' : ''}`}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400">
                {icon}
              </div>
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={getInputType()}
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={inputClasses}
            aria-invalid={hasError}
            aria-describedby={
              validationMessage ? 'input-error' : 
              description ? 'input-description' : 
              undefined
            }
            {...getAriaAttributes({
              label: label,
              description: description,
              invalid: hasError,
              required: required,
            })}
            {...props}
          />

          {/* Right icon or password toggle */}
          {(icon && iconPosition === 'right') || (showPasswordToggle && type === 'password') ? (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {showPasswordToggle && type === 'password' ? (
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              ) : (
                <div className="text-gray-400">
                  {icon}
                </div>
              )}
            </div>
          ) : null}

          {/* Loading indicator */}
          {isValidating && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
            </div>
          )}
        </div>

        {/* Validation message */}
        {validationMessage && (
          <div
            id="input-error"
            className={`text-sm ${
              hasError ? 'text-red-600' : hasSuccess ? 'text-green-600' : 'text-gray-500'
            }`}
            role="alert"
            aria-live="polite"
          >
            {validationMessage}
          </div>
        )}

        {/* Character count */}
        {getCharacterCount()}
      </div>
    );
  }
);

EnhancedInput.displayName = 'EnhancedInput';

// Textarea component
export interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  required?: boolean;
  showCharacterCount?: boolean;
  autoResize?: boolean;
}

export const EnhancedTextarea = forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({
    label,
    description,
    error,
    success,
    variant = 'default',
    size = 'md',
    fullWidth = false,
    required = false,
    showCharacterCount = false,
    autoResize = false,
    className = '',
    value,
    onChange,
    ...props
  }, ref) => {
    const { t } = useTranslation();
    const { getAriaAttributes } = useAccessibility();

    const [textareaValue, setTextareaValue] = useState(value || '');

    // Handle change
    const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      setTextareaValue(newValue);
      onChange?.(event);
    }, [onChange]);

    // Auto-resize
    const handleInput = useCallback((event: React.FormEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        const target = event.target as HTMLTextAreaElement;
        target.style.height = 'auto';
        target.style.height = `${target.scrollHeight}px`;
      }
    }, [autoResize]);

    // Get variant classes
    const getVariantClasses = () => {
      const baseClasses = 'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';
      
      switch (variant) {
        case 'filled':
          return `${baseClasses} bg-gray-100 border-0 focus:bg-white focus:ring-blue-500`;
        case 'outlined':
          return `${baseClasses} bg-transparent border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
        default:
          return `${baseClasses} bg-white border border-gray-300 focus:border-blue-500 focus:ring-blue-500`;
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

    // Get state classes
    const getStateClasses = () => {
      if (error) {
        return 'border-red-500 focus:border-red-500 focus:ring-red-500';
      } else if (success) {
        return 'border-green-500 focus:border-green-500 focus:ring-green-500';
      }
      return '';
    };

    const textareaClasses = `
      ${getVariantClasses()}
      ${getSizeClasses()}
      ${getStateClasses()}
      ${fullWidth ? 'w-full' : ''}
      rounded-lg
      resize-none
      ${className}
    `.trim();

    return (
      <div className={`space-y-1 ${fullWidth ? 'w-full' : ''}`}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          value={textareaValue}
          onChange={handleChange}
          onInput={handleInput}
          className={textareaClasses}
          aria-invalid={!!error}
          aria-describedby={
            error ? 'textarea-error' : 
            description ? 'textarea-description' : 
            undefined
          }
          {...getAriaAttributes({
            label: label,
            description: description,
            invalid: !!error,
            required: required,
          })}
          {...props}
        />

        {/* Validation message */}
        {error && (
          <div
            id="textarea-error"
            className="text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        {/* Character count */}
        {showCharacterCount && (
          <div className="text-xs text-gray-500">
            {textareaValue.length}{props.maxLength ? `/${props.maxLength}` : ''}
          </div>
        )}
      </div>
    );
  }
);

EnhancedTextarea.displayName = 'EnhancedTextarea';
