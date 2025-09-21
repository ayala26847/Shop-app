import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAccessibility } from '../../hooks/useAccessibility';
import { EnhancedInput } from './EnhancedInput';
import { EnhancedButton } from './EnhancedButton';
import { ProgressIndicator } from './ProgressIndicator';

export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
  options?: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  autoComplete?: string;
  showCharacterCount?: boolean;
  showPasswordToggle?: boolean;
}

export interface EnhancedFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => Promise<void> | void;
  submitText?: string;
  resetText?: string;
  showProgress?: boolean;
  showSteps?: boolean;
  steps?: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
  currentStep?: number;
  onStepChange?: (step: number) => void;
  autoSave?: boolean;
  autoSaveInterval?: number;
  showFieldSuccess?: boolean;
  showFieldErrors?: boolean;
  realTimeValidation?: boolean;
  microInteractions?: boolean;
  className?: string;
}

export const EnhancedForm = forwardRef<HTMLFormElement, EnhancedFormProps>(
  ({
    fields,
    onSubmit,
    submitText,
    resetText,
    showProgress = false,
    showSteps = false,
    steps = [],
    currentStep = 0,
    onStepChange,
    autoSave = false,
    autoSaveInterval = 30000,
    showFieldSuccess = true,
    showFieldErrors = true,
    realTimeValidation = true,
    microInteractions = true,
    className = '',
    ...props
  }, ref) => {
    const { t } = useTranslation();
    const { announce, getAriaAttributes } = useAccessibility({
      announceChanges: true,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

    // Create initial values and validation rules
    const initialValues = fields.reduce((acc, field) => {
      acc[field.name] = field.type === 'checkbox' ? false : '';
      return acc;
    }, {} as Record<string, any>);

    const validationRules = fields.reduce((acc, field) => {
      if (field.validation) {
        acc[field.name] = field.validation;
      }
      return acc;
    }, {} as Record<string, any>);

    // Use form validation hook
    const {
      values,
      validationState,
      handleChange,
      handleBlur,
      handleSubmit: handleFormSubmit,
      resetForm,
      getFieldProps,
      getFieldError,
      isFieldValid,
      isFieldDirty,
      getFieldClasses,
    } = useFormValidation(initialValues, validationRules, {
      validateOnChange: realTimeValidation,
      validateOnBlur: true,
      validateOnSubmit: true,
      announceErrors: showFieldErrors,
      announceSuccess: showFieldSuccess,
    });

    // Auto-save functionality
    useEffect(() => {
      if (!autoSave || !validationState.isDirty) return;

      const timeout = setTimeout(() => {
        // Save form data to localStorage
        localStorage.setItem('form_autosave', JSON.stringify({
          values,
          timestamp: Date.now(),
        }));
        
        setLastSaved(new Date());
        announce(t('accessibility.contentUpdated'));
      }, autoSaveInterval);

      setAutoSaveTimeout(timeout);

      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }, [values, autoSave, autoSaveInterval, validationState.isDirty, announce, t]);

    // Load auto-saved data
    useEffect(() => {
      const savedData = localStorage.getItem('form_autosave');
      if (savedData) {
        try {
          const { values: savedValues, timestamp } = JSON.parse(savedData);
          const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000; // 24 hours
          
          if (isRecent) {
            // Restore saved values
            Object.entries(savedValues).forEach(([key, value]) => {
              handleChange(key, value);
            });
            
            announce(t('accessibility.contentUpdated'));
          }
        } catch (error) {
          console.warn('Failed to load auto-saved form data:', error);
        }
      }
    }, [handleChange, announce, t]);

    // Handle form submission
    const handleFormSubmission = useCallback(async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        await handleFormSubmit(async (formData) => {
          await onSubmit(formData);
          
          // Clear auto-saved data on successful submission
          localStorage.removeItem('form_autosave');
          setLastSaved(null);
          
          announce(t('accessibility.formSubmitted'));
        });
      } catch (error) {
        announce(t('accessibility.formError'));
      } finally {
        setIsSubmitting(false);
      }
    }, [handleFormSubmit, onSubmit, announce, t]);

    // Handle reset
    const handleReset = useCallback(() => {
      resetForm();
      localStorage.removeItem('form_autosave');
      setLastSaved(null);
      announce(t('accessibility.contentUpdated'));
    }, [resetForm, announce, t]);

    // Render form field
    const renderField = useCallback((field: FormField) => {
      const fieldProps = getFieldProps(field.name);
      const error = getFieldError(field.name);
      const isValid = isFieldValid(field.name);
      const isDirty = isFieldDirty(field.name);

      const commonProps = {
        ...fieldProps,
        label: field.label,
        description: field.description,
        placeholder: field.placeholder,
        required: field.required,
        error: showFieldErrors ? error : undefined,
        success: showFieldSuccess && isValid && isDirty ? t('accessibility.success') : undefined,
        showCharacterCount: field.showCharacterCount,
        showPasswordToggle: field.showPasswordToggle,
        autoComplete: field.autoComplete,
        className: getFieldClasses(field.name, 'w-full'),
      };

      switch (field.type) {
        case 'textarea':
          return (
            <EnhancedTextarea
              key={field.name}
              {...commonProps}
              rows={4}
            />
          );

        case 'select':
          return (
            <div key={field.name} className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <select
                {...fieldProps}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${getFieldClasses(field.name)}`}
                aria-invalid={!isValid}
                aria-describedby={error ? `${field.name}-error` : undefined}
              >
                <option value="">{field.placeholder || t('common.select')}</option>
                {field.options?.map(option => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              {error && (
                <div id={`${field.name}-error`} className="text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
          );

        case 'checkbox':
          return (
            <div key={field.name} className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...fieldProps}
                className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${getFieldClasses(field.name)}`}
                aria-invalid={!isValid}
                aria-describedby={error ? `${field.name}-error` : undefined}
              />
              <label className="text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {error && (
                <div id={`${field.name}-error`} className="text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>
          );

        case 'radio':
          return (
            <div key={field.name} className="space-y-2">
              <fieldset>
                <legend className="text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </legend>
                <div className="space-y-2">
                  {field.options?.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={field.name}
                        value={option.value}
                        {...fieldProps}
                        className={`w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 ${getFieldClasses(field.name)}`}
                        aria-invalid={!isValid}
                        aria-describedby={error ? `${field.name}-error` : undefined}
                      />
                      <label className="text-sm text-gray-700">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                {error && (
                  <div id={`${field.name}-error`} className="text-sm text-red-600">
                    {error}
                  </div>
                )}
              </fieldset>
            </div>
          );

        default:
          return (
            <EnhancedInput
              key={field.name}
              type={field.type}
              {...commonProps}
            />
          );
      }
    }, [getFieldProps, getFieldError, isFieldValid, isFieldDirty, getFieldClasses, showFieldErrors, showFieldSuccess, t]);

    return (
      <form
        ref={ref}
        onSubmit={handleFormSubmission}
        className={`space-y-6 ${className}`}
        {...getAriaAttributes({
          label: t('accessibility.form'),
          live: 'polite',
        })}
        {...props}
      >
        {/* Progress indicator */}
        {showProgress && (
          <ProgressIndicator
            progress={validationState.isValid ? 100 : 50}
            label={t('accessibility.progress')}
            size="sm"
          />
        )}

        {/* Steps indicator */}
        {showSteps && steps.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {t('accessibility.step')} {currentStep + 1} {t('accessibility.of')} {steps.length}
              </h3>
              <span className="text-sm text-gray-500">
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="flex space-x-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStepChange?.(index)}
                  className={`flex-1 p-3 text-sm font-medium rounded-lg transition-colors ${
                    index === currentStep
                      ? 'bg-blue-100 text-blue-900'
                      : index < currentStep
                      ? 'bg-green-100 text-green-900'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                  disabled={index > currentStep}
                >
                  {step.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form fields */}
        <div className="space-y-4">
          {fields.map(renderField)}
        </div>

        {/* Auto-save indicator */}
        {autoSave && lastSaved && (
          <div className="text-xs text-gray-500 flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>
              {t('accessibility.contentUpdated')}: {lastSaved.toLocaleTimeString()}
            </span>
          </div>
        )}

        {/* Form actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <EnhancedButton
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              {resetText || t('common.reset')}
            </EnhancedButton>
          </div>

          <div className="flex space-x-3">
            <EnhancedButton
              type="submit"
              variant="primary"
              loading={isSubmitting}
              loadingText={t('common.processing')}
              disabled={!validationState.isValid}
            >
              {submitText || t('common.submit')}
            </EnhancedButton>
          </div>
        </div>

        {/* Form status */}
        {validationState.isDirty && (
          <div className="text-sm text-gray-500">
            {t('accessibility.formStatus')}: {validationState.isValid ? t('accessibility.valid') : t('accessibility.invalid')}
          </div>
        )}
      </form>
    );
  }
);

EnhancedForm.displayName = 'EnhancedForm';

// Enhanced Textarea component (imported from EnhancedInput)
import { EnhancedTextarea } from './EnhancedInput';
