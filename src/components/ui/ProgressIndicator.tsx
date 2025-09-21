import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../hooks/useAccessibility';

export interface ProgressIndicatorProps {
  progress: number;
  total?: number;
  label?: string;
  showPercentage?: boolean;
  showSteps?: boolean;
  steps?: Array<{
    id: string;
    label: string;
    completed: boolean;
    current: boolean;
  }>;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'linear' | 'circular' | 'steps';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  animated?: boolean;
  className?: string;
}

export function ProgressIndicator({
  progress,
  total = 100,
  label,
  showPercentage = true,
  showSteps = false,
  steps = [],
  size = 'md',
  variant = 'linear',
  color = 'blue',
  animated = true,
  className = '',
}: ProgressIndicatorProps) {
  const { t } = useTranslation();
  const { announce, getAriaAttributes } = useAccessibility({
    announceChanges: true,
  });

  const [displayProgress, setDisplayProgress] = useState(0);
  const percentage = Math.min(Math.max((progress / total) * 100, 0), 100);

  // Animate progress changes
  useEffect(() => {
    if (animated) {
      const duration = 300;
      const startTime = performance.now();
      const startProgress = displayProgress;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progressRatio);
        
        const newProgress = startProgress + (percentage - startProgress) * easedProgress;
        setDisplayProgress(newProgress);

        if (progressRatio < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    } else {
      setDisplayProgress(percentage);
    }
  }, [percentage, animated]);

  // Announce progress changes
  useEffect(() => {
    if (percentage > 0 && percentage < 100) {
      announce(`${t('accessibility.progress')}: ${Math.round(percentage)}%`);
    } else if (percentage === 100) {
      announce(t('accessibility.success'));
    }
  }, [percentage, announce, t]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return variant === 'circular' ? 'w-8 h-8' : 'h-2';
      case 'md':
        return variant === 'circular' ? 'w-12 h-12' : 'h-3';
      case 'lg':
        return variant === 'circular' ? 'w-16 h-16' : 'h-4';
      default:
        return variant === 'circular' ? 'w-12 h-12' : 'h-3';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      case 'purple':
        return 'bg-purple-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'md':
        return 'text-sm';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  if (variant === 'circular') {
    return (
      <div className={`relative ${getSizeClasses()} ${className}`}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 36 36"
          role="progressbar"
          aria-valuenow={Math.round(displayProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || t('accessibility.progress')}
          {...getAriaAttributes({
            label: label || t('accessibility.progress'),
            live: 'polite',
          })}
        >
          {/* Background circle */}
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${displayProgress * 0.999}, 100`}
            className={`${getColorClasses()} transition-all duration-300`}
          />
        </svg>
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-medium text-current ${getTextSizeClasses()}`}>
              {Math.round(displayProgress)}%
            </span>
          </div>
        )}
        <span className="sr-only">
          {label || t('accessibility.progress')}: {Math.round(displayProgress)}%
        </span>
      </div>
    );
  }

  if (variant === 'steps') {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex items-center space-x-3"
            role="listitem"
            aria-current={step.current ? 'step' : undefined}
            {...getAriaAttributes({
              label: step.label,
              live: step.current ? 'polite' : 'off',
            })}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                step.completed
                  ? `${getColorClasses()} text-white`
                  : step.current
                  ? `border-2 ${getColorClasses().replace('bg-', 'border-')} text-current`
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {step.completed ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span className={`${getTextSizeClasses()} ${
              step.completed ? 'text-gray-900' : step.current ? 'text-current' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Linear progress bar
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className={`font-medium text-gray-700 ${getTextSizeClasses()}`}>
            {label}
          </span>
          {showPercentage && (
            <span className={`text-gray-500 ${getTextSizeClasses()}`}>
              {Math.round(displayProgress)}%
            </span>
          )}
        </div>
      )}
      
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${getSizeClasses()}`}
        role="progressbar"
        aria-valuenow={Math.round(displayProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || t('accessibility.progress')}
        {...getAriaAttributes({
          label: label || t('accessibility.progress'),
          live: 'polite',
        })}
      >
        <div
          className={`h-full ${getColorClasses()} transition-all duration-300 ease-out ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${displayProgress}%` }}
        />
      </div>
      
      <span className="sr-only">
        {label || t('accessibility.progress')}: {Math.round(displayProgress)}%
      </span>
    </div>
  );
}

// Multi-step progress indicator
export interface MultiStepProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export function MultiStepProgress({
  currentStep,
  totalSteps,
  steps,
  onStepClick,
  className = '',
}: MultiStepProgressProps) {
  const { t } = useTranslation();
  const { announce, getAriaAttributes } = useAccessibility({
    announceChanges: true,
  });

  useEffect(() => {
    announce(`${t('accessibility.step')} ${currentStep + 1} ${t('accessibility.of')} ${totalSteps}`);
  }, [currentStep, totalSteps, announce, t]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress bar */}
      <ProgressIndicator
        progress={currentStep + 1}
        total={totalSteps}
        variant="linear"
        size="sm"
        showPercentage={false}
        className="mb-6"
      />

      {/* Steps */}
      <div className="space-y-3" role="list" aria-label={t('accessibility.step')}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div
              key={step.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                isCurrent
                  ? 'bg-blue-50 border border-blue-200'
                  : isCompleted
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
              role="listitem"
              aria-current={isCurrent ? 'step' : undefined}
              onClick={() => onStepClick?.(index)}
              style={{ cursor: onStepClick ? 'pointer' : 'default' }}
              {...getAriaAttributes({
                label: step.label,
                description: step.description,
                live: isCurrent ? 'polite' : 'off',
              })}
            >
              {/* Step number/icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>

              {/* Step content */}
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${
                  isCurrent ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-600'
                }`}>
                  {step.label}
                </h4>
                {step.description && (
                  <p className={`text-xs mt-1 ${
                    isCurrent ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                )}
              </div>

              {/* Status indicator */}
              {isCurrent && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium">{t('accessibility.active')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Easing function
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
