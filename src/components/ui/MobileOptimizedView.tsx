import React, { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileOptimization, useMobileFeatures, useKeyboardHandling } from '../../hooks/useMobileOptimization';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../hooks/useAccessibility';
import { LoadingSpinner } from './LoadingSpinner';

interface MobileOptimizedViewProps {
  children: ReactNode;
  enableSwipeNavigation?: boolean;
  enablePullToRefresh?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onRefresh?: () => void;
  className?: string;
  showLoadingOnRefresh?: boolean;
  refreshThreshold?: number;
  swipeThreshold?: number;
  enableHapticFeedback?: boolean;
  enableSoundFeedback?: boolean;
  enableGestures?: boolean;
  adjustForKeyboard?: boolean;
  fullHeight?: boolean;
  safeArea?: boolean;
}

export const MobileOptimizedView: React.FC<MobileOptimizedViewProps> = ({
  children,
  enableSwipeNavigation = true,
  enablePullToRefresh = true,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onRefresh,
  className = '',
  showLoadingOnRefresh = true,
  refreshThreshold = 100,
  swipeThreshold = 50,
  enableHapticFeedback = true,
  enableSoundFeedback = false,
  enableGestures = true,
  adjustForKeyboard = true,
  fullHeight = true,
  safeArea = true,
}) => {
  const { t } = useTranslation();
  const { announce } = useAccessibility({ announceChanges: true });
  const { mobileState, useSwipe, usePullToRefresh, getResponsiveClasses, getTouchTargetSize } = useMobileOptimization();
  const { useSwipe: useSwipeFeature, usePullToRefresh: usePullToRefreshFeature } = useMobileFeatures();
  const { keyboardVisible, adjustForKeyboard } = useKeyboardHandling();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [showRefreshIndicator, setShowRefreshIndicator] = useState(false);

  // Haptic feedback
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!enableHapticFeedback || !mobileState.touchDevice) return;

    try {
      if ('vibrate' in navigator) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30],
        };
        navigator.vibrate(patterns[type]);
      }
    } catch (error) {
      console.warn('Haptic feedback not supported:', error);
    }
  };

  // Sound feedback
  const triggerSound = (type: 'success' | 'error' | 'info' = 'info') => {
    if (!enableSoundFeedback) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const frequencies = {
        success: 800,
        error: 400,
        info: 600,
      };

      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Sound feedback not supported:', error);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;

    setIsRefreshing(true);
    setShowRefreshIndicator(true);
    triggerHaptic('medium');
    triggerSound('info');

    try {
      await onRefresh();
      triggerHaptic('light');
      triggerSound('success');
      announce(t('accessibility.contentUpdated'));
    } catch (error) {
      triggerHaptic('heavy');
      triggerSound('error');
      announce(t('accessibility.errorOccurred'));
    } finally {
      setIsRefreshing(false);
      setShowRefreshIndicator(false);
    }
  };

  // Swipe navigation
  useSwipe({
    threshold: swipeThreshold,
    onSwipeLeft: () => {
      if (enableSwipeNavigation && onSwipeLeft) {
        onSwipeLeft();
        triggerHaptic('light');
        announce(t('accessibility.navigatedLeft'));
      }
    },
    onSwipeRight: () => {
      if (enableSwipeNavigation && onSwipeRight) {
        onSwipeRight();
        triggerHaptic('light');
        announce(t('accessibility.navigatedRight'));
      }
    },
    onSwipeUp: () => {
      if (enableSwipeNavigation && onSwipeUp) {
        onSwipeUp();
        triggerHaptic('light');
        announce(t('accessibility.navigatedUp'));
      }
    },
    onSwipeDown: () => {
      if (enableSwipeNavigation && onSwipeDown) {
        onSwipeDown();
        triggerHaptic('light');
        announce(t('accessibility.navigatedDown'));
      }
    },
  });

  // Pull to refresh
  usePullToRefresh(handleRefresh, refreshThreshold);

  // Handle pull to refresh visual feedback
  useEffect(() => {
    if (!enablePullToRefresh || !mobileState.touchDevice) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        setPullDistance(0);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (window.scrollY === 0 && e.touches[0].clientY > 0) {
        const distance = e.touches[0].clientY;
        setPullDistance(distance);
        setShowRefreshIndicator(distance > refreshThreshold);
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > refreshThreshold) {
        handleRefresh();
      }
      setPullDistance(0);
      setShowRefreshIndicator(false);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enablePullToRefresh, mobileState.touchDevice, refreshThreshold, pullDistance, handleRefresh]);

  // Get responsive classes
  const responsiveClasses = getResponsiveClasses({
    mobile: 'px-4 py-2',
    tablet: 'px-6 py-4',
    desktop: 'px-8 py-6',
  });

  // Get touch target classes
  const touchTargetClasses = getTouchTargetSize('medium');

  // Get keyboard adjustment
  const keyboardAdjustment = adjustForKeyboard && keyboardVisible ? adjustForKeyboard : {};

  // Get safe area classes
  const safeAreaClasses = safeArea ? 'safe-area-inset' : '';

  // Get full height classes
  const heightClasses = fullHeight ? 'min-h-screen' : '';

  const containerClasses = `
    ${responsiveClasses}
    ${touchTargetClasses}
    ${safeAreaClasses}
    ${heightClasses}
    ${className}
  `.trim();

  return (
    <div
      className={containerClasses}
      style={{
        ...keyboardAdjustment,
        paddingTop: pullDistance > 0 ? `${Math.min(pullDistance, refreshThreshold)}px` : undefined,
      }}
    >
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {showRefreshIndicator && (
          <motion.div
            className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white rounded-full shadow-lg p-2">
              <LoadingSpinner size="sm" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refresh loading overlay */}
      <AnimatePresence>
        {isRefreshing && showLoadingOnRefresh && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-lg p-4 shadow-lg">
              <LoadingSpinner size="md" />
              <p className="mt-2 text-sm text-gray-600">{t('common.refreshing')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Mobile-optimized input component
interface MobileOptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  showSuccess?: boolean;
  enableAutoComplete?: boolean;
  enableSmartDefaults?: boolean;
  enableContextualHelp?: boolean;
  contextualHelp?: string;
  onValueChange?: (value: string) => void;
}

export const MobileOptimizedInput: React.FC<MobileOptimizedInputProps> = ({
  label,
  error,
  helpText,
  showSuccess = false,
  enableAutoComplete = true,
  enableSmartDefaults = true,
  enableContextualHelp = true,
  contextualHelp,
  onValueChange,
  className = '',
  ...props
}) => {
  const { t } = useTranslation();
  const { mobileState, getTouchTargetSize, optimizeForMobile } = useMobileOptimization();
  const { announce } = useAccessibility({ announceChanges: true });

  const [isFocused, setIsFocused] = useState(false);
  const [showContextualHelp, setShowContextualHelp] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    if (enableContextualHelp && contextualHelp) {
      setShowContextualHelp(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setShowContextualHelp(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange?.(e.target.value);
    props.onChange?.(e);
  };

  // Get mobile optimizations
  const mobileOptimizations = optimizeForMobile();

  // Get touch target classes
  const touchTargetClasses = getTouchTargetSize('medium');

  // Get input classes
  const inputClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm
    focus:outline-none focus:ring-2
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}
    ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    ${touchTargetClasses}
    ${className}
  `;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
          {enableContextualHelp && contextualHelp && (
            <span
              className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold cursor-help"
              onMouseEnter={() => setShowContextualHelp(true)}
              onMouseLeave={() => setShowContextualHelp(false)}
              onFocus={() => setShowContextualHelp(true)}
              onBlur={() => setShowContextualHelp(false)}
              tabIndex={0}
            >
              ?
            </span>
          )}
        </label>
      )}

      <input
        {...props}
        {...mobileOptimizations.inputProps}
        className={inputClasses}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'error' : helpText ? 'help' : undefined}
      />

      {error && (
        <p id="error" className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {helpText && !error && (
        <p id="help" className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}

      {showSuccess && !error && !isFocused && props.value && (
        <div className="mt-1 flex items-center text-sm text-green-600">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {t('accessibility.success')}
        </div>
      )}

      <AnimatePresence>
        {showContextualHelp && contextualHelp && (
          <motion.div
            className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            role="tooltip"
          >
            {contextualHelp}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
