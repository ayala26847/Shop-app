// Full page loading component

import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface LoadingPageProps {
  title?: string;
  description?: string;
  showProgress?: boolean;
  progress?: number;
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
  children?: React.ReactNode;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({
  title,
  description,
  showProgress = false,
  progress = 0,
  variant = 'spinner',
  size = 'lg',
  color = 'primary',
  className = '',
  children,
}) => {
  const { t } = useTranslation();
  const { getAriaAttributes } = useAccessibility();

  const pageTitle = title || t('accessibility.loadingPage');
  const pageDescription = description || t('accessibility.loadingPageDescription');

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}
      role="status"
      aria-live="polite"
      {...getAriaAttributes({
        label: pageTitle,
        description: pageDescription,
      })}
    >
      <div className="text-center max-w-md mx-auto px-4">
        <LoadingSpinner
          size={size}
          variant={variant}
          color={color}
          className="mb-6"
        />
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {pageTitle}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {pageDescription}
        </p>

        {showProgress && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{t('accessibility.progress')}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t('accessibility.progress')}
              />
            </div>
          </div>
        )}

        {children && (
          <div className="text-sm text-gray-500">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

// Specialized loading pages
export const InitialLoadingPage: React.FC<{ className?: string }> = ({ className = '' }) => (
  <LoadingPage
    title="Initializing Application"
    description="Setting up your experience..."
    variant="spinner"
    size="lg"
    className={className}
  />
);

export const DataLoadingPage: React.FC<{ className?: string }> = ({ className = '' }) => (
  <LoadingPage
    title="Loading Data"
    description="Fetching the latest information..."
    variant="dots"
    size="md"
    className={className}
  />
);

export const ProcessingPage: React.FC<{ 
  progress?: number; 
  className?: string 
}> = ({ progress = 0, className = '' }) => (
  <LoadingPage
    title="Processing Request"
    description="Please wait while we process your request..."
    showProgress
    progress={progress}
    variant="bars"
    size="md"
    className={className}
  />
);

export const MaintenancePage: React.FC<{ className?: string }> = ({ className = '' }) => (
  <LoadingPage
    title="System Maintenance"
    description="We're performing scheduled maintenance. We'll be back shortly."
    variant="pulse"
    size="lg"
    color="warning"
    className={className}
  >
    <p className="text-sm text-gray-500 mt-4">
      Expected completion: 30 minutes
    </p>
  </LoadingPage>
);
