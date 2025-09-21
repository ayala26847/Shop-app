// Form section wrapper component

import React, { ReactNode } from 'react';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  required?: boolean;
  error?: string;
  helpText?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = '',
  titleClassName = '',
  descriptionClassName = '',
  contentClassName = '',
  collapsible = false,
  defaultExpanded = true,
  required = false,
  error,
  helpText,
}) => {
  const { getAriaAttributes } = useAccessibility();
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  const handleToggle = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <fieldset
      className={`border border-gray-200 rounded-lg p-4 ${className}`}
      {...getAriaAttributes({
        label: title,
        description: description,
        expanded: collapsible ? isExpanded : undefined,
        controls: collapsible ? 'form-section-content' : undefined,
      })}
    >
      {title && (
        <legend className="text-lg font-medium text-gray-900 mb-2">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
          {collapsible && (
            <button
              type="button"
              onClick={handleToggle}
              className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              aria-expanded={isExpanded}
              aria-controls="form-section-content"
            >
              <svg
                className={`w-5 h-5 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </legend>
      )}

      {description && (
        <p className={`text-sm text-gray-600 mb-4 ${descriptionClassName}`}>
          {description}
        </p>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {helpText && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-600">{helpText}</p>
        </div>
      )}

      <div
        id="form-section-content"
        className={`space-y-4 ${contentClassName} ${
          collapsible && !isExpanded ? 'hidden' : ''
        }`}
      >
        {children}
      </div>
    </fieldset>
  );
};

// Specialized form sections
export const PersonalInfoSection: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <FormSection
    title="Personal Information"
    description="Please provide your personal details"
    required
    className={className}
  >
    {children}
  </FormSection>
);

export const ContactInfoSection: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <FormSection
    title="Contact Information"
    description="How can we reach you?"
    required
    className={className}
  >
    {children}
  </FormSection>
);

export const AddressSection: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <FormSection
    title="Address"
    description="Where should we send your order?"
    required
    className={className}
  >
    {children}
  </FormSection>
);

export const PaymentSection: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <FormSection
    title="Payment Information"
    description="Secure payment details"
    required
    className={className}
  >
    {children}
  </FormSection>
);

export const OptionalSection: React.FC<{
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}> = ({ title, description, children, className = '' }) => (
  <FormSection
    title={title}
    description={description}
    collapsible
    defaultExpanded={false}
    className={className}
  >
    {children}
  </FormSection>
);
