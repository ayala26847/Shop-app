// Form submit button with loading states

import React, { ReactNode } from 'react';
import { LoadingButton } from '../Loading/LoadingButton';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface FormSubmitProps {
  children: ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  type?: 'submit' | 'button';
  onClick?: () => void;
  showSuccess?: boolean;
  successText?: string;
  successIcon?: ReactNode;
}

export const FormSubmit: React.FC<FormSubmitProps> = ({
  children,
  isLoading = false,
  loadingText,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  type = 'submit',
  onClick,
  showSuccess = false,
  successText,
  successIcon,
}) => {
  const { t } = useTranslation();
  const { getAriaAttributes } = useAccessibility();

  const isDisabled = disabled || isLoading;
  const displayText = isLoading && loadingText ? loadingText : children;
  const showIcon = icon && !isLoading && !showSuccess;
  const showSuccessIcon = showSuccess && successIcon && !isLoading;

  return (
    <LoadingButton
      type={type}
      isLoading={isLoading}
      loadingText={loadingText}
      disabled={isDisabled}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      icon={showIcon ? icon : showSuccessIcon ? successIcon : undefined}
      iconPosition={iconPosition}
      className={className}
      onClick={onClick}
      {...getAriaAttributes({
        label: typeof children === 'string' ? children : undefined,
        live: isLoading ? 'polite' : undefined,
        atomic: isLoading ? true : undefined,
      })}
    >
      {showSuccess && successText ? successText : displayText}
    </LoadingButton>
  );
};

// Specialized submit buttons
export const SaveButton: React.FC<{
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({ isLoading = false, disabled = false, className = '' }) => (
  <FormSubmit
    variant="primary"
    size="md"
    isLoading={isLoading}
    loadingText="Saving..."
    disabled={disabled}
    className={className}
  >
    Save
  </FormSubmit>
);

export const SubmitButton: React.FC<{
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({ isLoading = false, disabled = false, className = '' }) => (
  <FormSubmit
    variant="primary"
    size="md"
    isLoading={isLoading}
    loadingText="Submitting..."
    disabled={disabled}
    className={className}
  >
    Submit
  </FormSubmit>
);

export const ContinueButton: React.FC<{
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({ isLoading = false, disabled = false, className = '' }) => (
  <FormSubmit
    variant="primary"
    size="md"
    isLoading={isLoading}
    loadingText="Processing..."
    disabled={disabled}
    className={className}
  >
    Continue
  </FormSubmit>
);

export const CreateButton: React.FC<{
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({ isLoading = false, disabled = false, className = '' }) => (
  <FormSubmit
    variant="success"
    size="md"
    isLoading={isLoading}
    loadingText="Creating..."
    disabled={disabled}
    className={className}
  >
    Create
  </FormSubmit>
);

export const UpdateButton: React.FC<{
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({ isLoading = false, disabled = false, className = '' }) => (
  <FormSubmit
    variant="primary"
    size="md"
    isLoading={isLoading}
    loadingText="Updating..."
    disabled={disabled}
    className={className}
  >
    Update
  </FormSubmit>
);

export const DeleteButton: React.FC<{
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}> = ({ isLoading = false, disabled = false, className = '' }) => (
  <FormSubmit
    variant="danger"
    size="md"
    isLoading={isLoading}
    loadingText="Deleting..."
    disabled={disabled}
    className={className}
  >
    Delete
  </FormSubmit>
);
