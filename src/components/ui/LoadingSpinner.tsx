import React from 'react';
import { useTranslation } from 'react-i18next';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  description?: string;
  showText?: boolean;
  inline?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  label,
  description,
  showText = false,
  inline = true
}) => {
  const { t } = useTranslation();
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const spinnerLabel = label || t('accessibility.loading');
  const spinnerDescription = description || t('accessibility.loading');

  const spinnerElement = (
    <div
      className={`inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label={spinnerLabel}
      aria-describedby={description ? `loading-description-${Date.now()}` : undefined}
    >
      <span className="sr-only">{spinnerLabel}</span>
      {description && (
        <span id={`loading-description-${Date.now()}`} className="sr-only">
          {spinnerDescription}
        </span>
      )}
    </div>
  );

  if (!showText) {
    return spinnerElement;
  }

  return (
    <div className={`flex items-center gap-3 ${inline ? 'inline-flex' : 'flex'}`}>
      {spinnerElement}
      <span className={`text-gray-600 ${textSizeClasses[size]}`}>
        {spinnerLabel}
      </span>
    </div>
  );
};

// Enhanced loading spinner with progress indication
interface ProgressSpinnerProps {
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  showProgress?: boolean;
}

export const ProgressSpinner: React.FC<ProgressSpinnerProps> = ({
  progress = 0,
  size = 'md',
  className = '',
  label,
  showProgress = true
}) => {
  const { t } = useTranslation();
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const strokeWidth = size === 'sm' ? 2 : size === 'md' ? 3 : 4;
  const radius = size === 'sm' ? 12 : size === 'md' ? 18 : 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const spinnerLabel = label || t('accessibility.loading');

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}
        role="status"
        aria-label={spinnerLabel}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {/* Background circle */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          opacity="0.2"
        />
        {/* Progress circle */}
        <circle
          cx={radius + strokeWidth}
          cy={radius + strokeWidth}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      {showProgress && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-current">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      <span className="sr-only">
        {spinnerLabel}: {progress}% {t('accessibility.progress')}
      </span>
    </div>
  );
};

// Skeleton loading component
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  lines?: number;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  className = '',
  lines = 1,
  animated = true
}) => {
  const baseClasses = 'bg-gray-200 rounded';
  const animationClasses = animated ? 'animate-pulse' : '';
  
  if (lines === 1) {
    return (
      <div
        className={`${baseClasses} ${animationClasses} ${className}`}
        style={{ width, height }}
        role="status"
        aria-label={animated ? 'Loading content' : 'Content placeholder'}
      >
        <span className="sr-only">Loading content</span>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`} role="status" aria-label="Loading content">
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${animationClasses}`}
          style={{ 
            width: index === lines - 1 ? '75%' : width, 
            height 
          }}
        />
      ))}
      <span className="sr-only">Loading content</span>
    </div>
  );
};

// Loading states for different components
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
    <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-6 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);

export const CartItemSkeleton: React.FC = () => (
  <div className="flex items-center space-x-4 p-4 border-b animate-pulse">
    <div className="w-16 h-16 bg-gray-200 rounded" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
    <div className="h-8 bg-gray-200 rounded w-20" />
  </div>
);
