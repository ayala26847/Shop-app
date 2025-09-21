// Skeleton loading component for content placeholders

import React from 'react';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface LoadingSkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  lines?: number;
  className?: string;
  children?: React.ReactNode;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  lines = 1,
  className = '',
  children,
}) => {
  const { getAriaAttributes } = useAccessibility();

  const baseClasses = 'bg-gray-200 rounded';
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-wave',
    none: '',
  };

  const variantClasses = {
    text: 'h-4',
    rectangular: 'h-4',
    circular: 'rounded-full',
    rounded: 'rounded-lg',
  };

  const style = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'circular' ? '40px' : '16px'),
  };

  if (children) {
    return (
      <div
        className={`${baseClasses} ${animationClasses[animation]} ${className}`}
        style={style}
        {...getAriaAttributes({
          label: 'Loading content',
          live: 'polite',
        })}
      >
        {children}
      </div>
    );
  }

  if (lines === 1) {
    return (
      <div
        className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
        style={style}
        {...getAriaAttributes({
          label: 'Loading content',
          live: 'polite',
        })}
      />
    );
  }

  return (
    <div className={className}>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${
            index < lines - 1 ? 'mb-2' : ''
          }`}
          style={{
            ...style,
            width: index === lines - 1 ? '75%' : '100%',
          }}
          {...getAriaAttributes({
            label: 'Loading content',
            live: 'polite',
          })}
        />
      ))}
    </div>
  );
};

// Specialized skeleton components
export const TextSkeleton: React.FC<Omit<LoadingSkeletonProps, 'variant'>> = (props) => (
  <LoadingSkeleton variant="text" {...props} />
);

export const RectangularSkeleton: React.FC<Omit<LoadingSkeletonProps, 'variant'>> = (props) => (
  <LoadingSkeleton variant="rectangular" {...props} />
);

export const CircularSkeleton: React.FC<Omit<LoadingSkeletonProps, 'variant'>> = (props) => (
  <LoadingSkeleton variant="circular" {...props} />
);

export const RoundedSkeleton: React.FC<Omit<LoadingSkeletonProps, 'variant'>> = (props) => (
  <LoadingSkeleton variant="rounded" {...props} />
);

// Predefined skeleton layouts
export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-4 border rounded-lg ${className}`}>
    <RoundedSkeleton height="200px" className="mb-4" />
    <TextSkeleton lines={2} className="mb-2" />
    <TextSkeleton width="60%" className="mb-4" />
    <div className="flex justify-between items-center">
      <TextSkeleton width="80px" height="24px" />
      <RectangularSkeleton width="100px" height="32px" />
    </div>
  </div>
);

export const UserProfileSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center space-x-4 ${className}`}>
    <CircularSkeleton width="48px" height="48px" />
    <div className="flex-1">
      <TextSkeleton width="120px" className="mb-2" />
      <TextSkeleton width="80px" />
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string 
}> = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }, (_, colIndex) => (
          <TextSkeleton
            key={colIndex}
            width={colIndex === 0 ? '60%' : '100%'}
            className="flex-1"
          />
        ))}
      </div>
    ))}
  </div>
);
