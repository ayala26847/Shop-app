import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from './useAccessibility';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface FieldValidation {
  isValid: boolean;
  error: string | null;
  isDirty: boolean;
  isTouched: boolean;
}

export interface FormValidationState {
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
  fields: Record<string, FieldValidation>;
}

export interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  announceErrors?: boolean;
  announceSuccess?: boolean;
  debounceMs?: number;
}

export function useFormValidation(
  initialValues: Record<string, any>,
  validationRules: Record<string, ValidationRule>,
  options: UseFormValidationOptions = {}
) {
  const { t } = useTranslation();
  const { announce, getAriaAttributes } = useAccessibility({
    announceChanges: true,
    announceErrors: options.announceErrors,
    announceSuccess: options.announceSuccess,
  });

  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    debounceMs = 300,
  } = options;

  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationState, setValidationState] = useState<FormValidationState>({
    isValid: true,
    isDirty: false,
    isSubmitting: false,
    errors: {},
    fields: {},
  });

  // Debounced validation
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  const validateField = useCallback((fieldName: string, value: any): string | null => {
    const rule = validationRules[fieldName];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return rule.message || t('validation.required', { field: fieldName });
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // Min length validation
    if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
      return rule.message || t('validation.minLength', { 
        field: fieldName, 
        min: rule.minLength 
      });
    }

    // Max length validation
    if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
      return rule.message || t('validation.maxLength', { 
        field: fieldName, 
        max: rule.maxLength 
      });
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || t('validation.pattern', { field: fieldName });
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [validationRules, t]);

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    const fields: Record<string, FieldValidation> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      const isDirty = values[fieldName] !== initialValues[fieldName];
      const isTouched = touched[fieldName] || false;

      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }

      fields[fieldName] = {
        isValid: !error,
        error,
        isDirty,
        isTouched,
      };
    });

    const isDirty = Object.values(fields).some(field => field.isDirty);

    setValidationState({
      isValid,
      isDirty,
      isSubmitting,
      errors,
      fields,
    });

    return isValid;
  }, [values, touched, initialValues, isSubmitting, validateField, validationRules]);

  // Debounced validation
  const debouncedValidate = useCallback(() => {
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    const timeout = setTimeout(() => {
      validateForm();
    }, debounceMs);

    setValidationTimeout(timeout);
  }, [validateForm, debounceMs, validationTimeout]);

  // Validate on change
  useEffect(() => {
    if (validateOnChange) {
      debouncedValidate();
    }
  }, [values, validateOnChange, debouncedValidate]);

  // Validate on blur
  const handleBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    if (validateOnBlur) {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        announce(`${t('accessibility.error')}: ${error}`, 'assertive');
      }
    }
  }, [validateOnBlur, validateField, values, announce, t]);

  // Handle field change
  const handleChange = useCallback((fieldName: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear timeout for this field
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }
  }, [validationTimeout]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit: (values: any) => Promise<void> | void) => {
    setIsSubmitting(true);
    
    if (validateOnSubmit) {
      const isValid = validateForm();
      if (!isValid) {
        setIsSubmitting(false);
        announce(t('accessibility.formError'), 'assertive');
        return;
      }
    }

    try {
      await onSubmit(values);
      announce(t('accessibility.formSubmitted'), 'polite');
    } catch (error) {
      announce(t('accessibility.formError'), 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  }, [validateOnSubmit, validateForm, announce, t, values]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setValidationState({
      isValid: true,
      isDirty: false,
      isSubmitting: false,
      errors: {},
      fields: {},
    });
  }, [initialValues]);

  // Get field props for form inputs
  const getFieldProps = useCallback((fieldName: string) => {
    const field = validationState.fields[fieldName];
    const error = field?.error;
    const isValid = field?.isValid ?? true;

    return {
      value: values[fieldName] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        handleChange(fieldName, e.target.value);
      },
      onBlur: () => handleBlur(fieldName),
      'aria-invalid': !isValid,
      'aria-describedby': error ? `${fieldName}-error` : undefined,
      ...getAriaAttributes({
        label: t(`fields.${fieldName}`),
        invalid: !isValid,
        required: validationRules[fieldName]?.required,
      }),
    };
  }, [values, validationState.fields, handleChange, handleBlur, getAriaAttributes, t, validationRules]);

  // Get error message for field
  const getFieldError = useCallback((fieldName: string) => {
    return validationState.fields[fieldName]?.error || null;
  }, [validationState.fields]);

  // Check if field is valid
  const isFieldValid = useCallback((fieldName: string) => {
    return validationState.fields[fieldName]?.isValid ?? true;
  }, [validationState.fields]);

  // Check if field is dirty
  const isFieldDirty = useCallback((fieldName: string) => {
    return validationState.fields[fieldName]?.isDirty ?? false;
  }, [validationState.fields]);

  // Check if field is touched
  const isFieldTouched = useCallback((fieldName: string) => {
    return validationState.fields[fieldName]?.isTouched ?? false;
  }, [validationState.fields]);

  // Get field classes for styling
  const getFieldClasses = useCallback((fieldName: string, baseClasses: string = '') => {
    const field = validationState.fields[fieldName];
    const hasError = field?.error && field?.isTouched;
    const isValid = field?.isValid && field?.isTouched;

    let classes = baseClasses;

    if (hasError) {
      classes += ' border-red-500 focus:border-red-500 focus:ring-red-500';
    } else if (isValid) {
      classes += ' border-green-500 focus:border-green-500 focus:ring-green-500';
    }

    return classes;
  }, [validationState.fields]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

  return {
    values,
    validationState,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    getFieldProps,
    getFieldError,
    isFieldValid,
    isFieldDirty,
    isFieldTouched,
    getFieldClasses,
    validateForm,
  };
}

// Hook for real-time validation with visual feedback
export function useRealTimeValidation(
  fieldName: string,
  value: any,
  rules: ValidationRule,
  options: { debounceMs?: number; announceErrors?: boolean } = {}
) {
  const { t } = useTranslation();
  const { announce } = useAccessibility({
    announceChanges: true,
    announceErrors: options.announceErrors,
  });

  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    setIsValidating(true);

    const newTimeoutId = setTimeout(() => {
      const validationError = validateField(fieldName, value, rules, t);
      setError(validationError);
      setIsValidating(false);

      if (validationError && options.announceErrors) {
        announce(`${t('accessibility.error')}: ${validationError}`, 'assertive');
      }
    }, options.debounceMs || 300);

    setTimeoutId(newTimeoutId);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [value, fieldName, rules, t, announce, options.announceErrors, options.debounceMs]);

  return {
    error,
    isValidating,
    isValid: !error,
  };
}

// Helper function to validate a single field
function validateField(
  fieldName: string,
  value: any,
  rule: ValidationRule,
  t: (key: string, options?: any) => string
): string | null {
  // Required validation
  if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return rule.message || t('validation.required', { field: fieldName });
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null;
  }

  // Min length validation
  if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
    return rule.message || t('validation.minLength', { 
      field: fieldName, 
      min: rule.minLength 
    });
  }

  // Max length validation
  if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
    return rule.message || t('validation.maxLength', { 
      field: fieldName, 
      max: rule.maxLength 
    });
  }

  // Pattern validation
  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return rule.message || t('validation.pattern', { field: fieldName });
  }

  // Custom validation
  if (rule.custom) {
    return rule.custom(value);
  }

  return null;
}
