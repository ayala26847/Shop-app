// Standardized error display component

import React from 'react';
import { FieldError } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../hooks/useAccessibility';
import { motion } from 'framer-motion';

export interface FormErrorProps {
  error?: FieldError;
  id?: string;
  className?: string;
  showIcon?: boolean;
  variant?: 'default' | 'inline' | 'tooltip';
}

export const FormError: React.FC<FormErrorProps> = ({
  error,
  id,
  className = '',
  showIcon = true,
  variant = 'default',
}) => {
  const { t } = useTranslation();
  const { getAriaAttributes } = useAccessibility();

  if (!error) return null;

  const errorMessage = error.message || t('validation.required');

  const variantClasses = {
    default: 'text-red-600 text-sm mt-1',
    inline: 'text-red-600 text-sm ml-2',
    tooltip: 'text-red-600 text-xs bg-red-50 px-2 py-1 rounded border border-red-200',
  };

  const iconClasses = {
    default: 'mr-1',
    inline: 'mr-1',
    tooltip: 'mr-1',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.2 }}
      className={`${variantClasses[variant]} ${className}`}
      role="alert"
      aria-live="assertive"
      id={id}
      {...getAriaAttributes({
        label: 'Error',
        description: errorMessage,
      })}
    >
      {showIcon && (
        <svg
          className={`inline w-4 h-4 ${iconClasses[variant]}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {errorMessage}
    </motion.div>
  );
};

// Specialized error components
export const InlineError: React.FC<Omit<FormErrorProps, 'variant'>> = (props) => (
  <FormError variant="inline" {...props} />
);

export const TooltipError: React.FC<Omit<FormErrorProps, 'variant'>> = (props) => (
  <FormError variant="tooltip" {...props} />
);

// Error list component for multiple errors
export interface FormErrorListProps {
  errors: FieldError[];
  className?: string;
  showIcon?: boolean;
}

export const FormErrorList: React.FC<FormErrorListProps> = ({
  errors,
  className = '',
  showIcon = true,
}) => {
  if (errors.length === 0) return null;

  return (
    <div className={`space-y-1 ${className}`} role="alert" aria-live="assertive">
      {errors.map((error, index) => (
        <FormError
          key={index}
          error={error}
          showIcon={showIcon}
        />
      ))}
    </div>
  );
};
