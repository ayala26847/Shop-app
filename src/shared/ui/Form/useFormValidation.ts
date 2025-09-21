// Enhanced form validation hook

import { useForm, FieldValues, UseFormProps, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { useAccessibility } from '../../hooks/useAccessibility';

interface UseFormValidationOptions<TFieldValues extends FieldValues> extends UseFormProps<TFieldValues> {
  schema: ZodSchema<TFieldValues>;
  onSubmit: (data: TFieldValues) => void | Promise<void>;
  onSuccess?: (data: TFieldValues) => void;
  onError?: (errors: FieldErrors<TFieldValues>) => void;
  enableToastNotifications?: boolean;
  successMessage?: string;
  errorMessage?: string;
  autoFocusOnError?: boolean;
  saveProgress?: boolean;
  storageKey?: string;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export function useFormValidation<TFieldValues extends FieldValues>({
  schema,
  onSubmit,
  onSuccess,
  onError,
  enableToastNotifications = true,
  successMessage,
  errorMessage,
  autoFocusOnError = true,
  saveProgress = false,
  storageKey,
  validateOnChange = true,
  validateOnBlur = true,
  debounceMs = 300,
  ...formProps
}: UseFormValidationOptions<TFieldValues>) {
  const { t } = useTranslation();
  const { showError, showSuccess } = useToast();
  const { announce } = useAccessibility({ announceErrors: true, announceSuccess: true });

  const form = useForm<TFieldValues>({
    resolver: zodResolver(schema),
    mode: validateOnChange ? 'onChange' : validateOnBlur ? 'onBlur' : 'onSubmit',
    reValidateMode: 'onChange',
    ...formProps,
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful, isValid, isDirty },
    reset,
    watch,
    getValues,
    setError,
    clearErrors,
    trigger,
  } = form;

  // Auto-save progress
  useEffect(() => {
    if (saveProgress && storageKey) {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          form.reset(parsedData);
        } catch (error) {
          console.warn('Failed to restore form data:', error);
        }
      }

      const subscription = watch((value) => {
        localStorage.setItem(storageKey, JSON.stringify(value));
      });
      return () => subscription.unsubscribe();
    }
  }, [saveProgress, storageKey, watch, form]);

  // Handle form submission
  const enhancedHandleSubmit = useCallback(async (data: TFieldValues) => {
    try {
      await onSubmit(data);
      
      if (enableToastNotifications) {
        showSuccess(successMessage || t('accessibility.formSubmitted'));
      }
      announce(successMessage || t('accessibility.formSubmitted'), 'polite');
      
      onSuccess?.(data);
      
      if (saveProgress && storageKey) {
        localStorage.removeItem(storageKey);
      }
    } catch (err: any) {
      console.error('Form submission error:', err);
      const msg = errorMessage || err.message || t('accessibility.formError');
      
      if (enableToastNotifications) {
        showError(msg);
      }
      announce(msg, 'assertive');
      
      onError?.(errors);
    }
  }, [onSubmit, onSuccess, onError, enableToastNotifications, showSuccess, showError, announce, successMessage, errorMessage, t, errors, saveProgress, storageKey]);

  // Focus on first error field
  useEffect(() => {
    if (autoFocusOnError && Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0];
      form.setFocus(firstErrorField as any);
      announce(t('accessibility.formError'), 'assertive');
    }
  }, [errors, autoFocusOnError, form, announce, t]);

  // Debounced validation
  const debouncedTrigger = useCallback(
    debounce((fieldName?: string) => {
      if (fieldName) {
        trigger(fieldName);
      } else {
        trigger();
      }
    }, debounceMs),
    [trigger, debounceMs]
  );

  // Translate Zod errors
  const getTranslatedError = useCallback((error: any) => {
    if (!error) return null;
    if (typeof error === 'string') return error;

    const { message, type, path, minimum, maximum, exact, options } = error;

    switch (message) {
      case 'Required':
        return t('validation.required', { field: path?.[0] || 'field' });
      case 'Too small':
        if (type === 'string') return t('validation.minLength', { field: path?.[0] || 'field', min: minimum });
        if (type === 'number') return t('validation.min', { field: path?.[0] || 'field', min: minimum });
        break;
      case 'Too large':
        if (type === 'string') return t('validation.maxLength', { field: path?.[0] || 'field', max: maximum });
        if (type === 'number') return t('validation.max', { field: path?.[0] || 'field', max: maximum });
        break;
      case 'Invalid email':
        return t('validation.email');
      case 'Invalid url':
        return t('validation.url');
      case 'Invalid number':
        return t('validation.number');
      case 'Invalid date':
        return t('validation.date');
      case 'Invalid string':
        if (options?.includes('email')) return t('validation.email');
        if (options?.includes('url')) return t('validation.url');
        return t('validation.pattern', { field: path?.[0] || 'field' });
      case 'Invalid enum value':
        return t('validation.oneOf', { field: path?.[0] || 'field', values: options?.join(', ') });
      case 'Passwords do not match':
        return t('validation.confirmPassword');
      default:
        if (message.includes('at least 8 characters') && message.includes('uppercase') && message.includes('lowercase') && message.includes('number') && message.includes('special character')) {
          return t('validation.password');
        }
        if (message.includes('phone number')) {
          return t('validation.phone');
        }
        return t('validation.custom', { field: path?.[0] || 'field' });
    }
    return message;
  }, [t]);

  // Validation helpers
  const validateField = useCallback(async (fieldName: keyof TFieldValues) => {
    return await trigger(fieldName);
  }, [trigger]);

  const validateAll = useCallback(async () => {
    return await trigger();
  }, [trigger]);

  const clearFieldError = useCallback((fieldName: keyof TFieldValues) => {
    clearErrors(fieldName);
  }, [clearErrors]);

  const clearAllErrors = useCallback(() => {
    clearErrors();
  }, [clearErrors]);

  const setFieldError = useCallback((fieldName: keyof TFieldValues, error: string) => {
    setError(fieldName, { type: 'manual', message: error });
  }, [setError]);

  // Form state helpers
  const hasErrors = Object.keys(errors).length > 0;
  const hasFieldError = useCallback((fieldName: keyof TFieldValues) => {
    return !!errors[fieldName];
  }, [errors]);

  const getFieldError = useCallback((fieldName: keyof TFieldValues) => {
    return errors[fieldName];
  }, [errors]);

  const isFieldDirty = useCallback((fieldName: keyof TFieldValues) => {
    return form.formState.dirtyFields[fieldName];
  }, [form.formState.dirtyFields]);

  const isFieldTouched = useCallback((fieldName: keyof TFieldValues) => {
    return form.formState.touchedFields[fieldName];
  }, [form.formState.touchedFields]);

  return {
    ...form,
    handleSubmit: handleSubmit(enhancedHandleSubmit),
    isSubmitting,
    isSubmitSuccessful,
    isValid,
    isDirty,
    hasErrors,
    errors,
    getTranslatedError,
    validateField,
    validateAll,
    clearFieldError,
    clearAllErrors,
    setFieldError,
    hasFieldError,
    getFieldError,
    isFieldDirty,
    isFieldTouched,
    debouncedTrigger,
  };
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}
