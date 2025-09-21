// Controlled form field component with validation

import React, { forwardRef, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldError } from 'react-hook-form';
import { useAccessibility } from '../../hooks/useAccessibility';
import { FormError } from './FormError';
import { motion, AnimatePresence } from 'framer-motion';

export interface FormFieldProps {
  label?: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string | number;
  onChange?: (value: string | number) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: FieldError;
  helpText?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  showSuccess?: boolean;
  showError?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({
    label,
    name,
    type = 'text',
    placeholder,
    value,
    onChange,
    onBlur,
    onFocus,
    error,
    helpText,
    required = false,
    disabled = false,
    readonly = false,
    autoComplete,
    maxLength,
    minLength,
    pattern,
    className = '',
    labelClassName = '',
    inputClassName = '',
    icon,
    iconPosition = 'left',
    showSuccess = false,
    showError = true,
    size = 'md',
    variant = 'default',
  }, ref) => {
    const { t } = useTranslation();
    const { getAriaAttributes } = useAccessibility();
    const inputId = useId();
    const errorId = useId();
    const helpTextId = useId();

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    };

    const variantClasses = {
      default: 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      filled: 'bg-gray-100 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500',
      outlined: 'border-2 border-gray-300 focus:border-blue-500 focus:ring-0',
    };

    const baseInputClasses = `
      block w-full rounded-md shadow-sm transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:bg-gray-100 disabled:cursor-not-allowed
      readonly:bg-gray-50 readonly:cursor-default
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
      ${showSuccess && !error ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''}
      ${icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''}
      ${inputClassName}
    `;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
      onChange?.(newValue);
    };

    const hasError = !!error && showError;
    const hasSuccess = showSuccess && !error && value;

    return (
      <div className={`space-y-1 ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium text-gray-700 ${labelClassName}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            required={required}
            disabled={disabled}
            readOnly={readonly}
            autoComplete={autoComplete}
            maxLength={maxLength}
            minLength={minLength}
            pattern={pattern}
            className={baseInputClasses}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? errorId : helpText ? helpTextId : undefined}
            {...getAriaAttributes({
              label: label || placeholder || name,
              description: helpText,
              invalid: hasError,
            })}
          />

          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}

          {hasSuccess && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <AnimatePresence>
          {hasError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <FormError id={errorId} error={error} />
            </motion.div>
          )}
        </AnimatePresence>

        {helpText && !hasError && (
          <p id={helpTextId} className="text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
