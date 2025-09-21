import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from './useAccessibility';

export interface MobileState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  orientation: 'portrait' | 'landscape';
  touchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  viewportHeight: number;
  keyboardVisible: boolean;
  connectionType: string;
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface TouchState {
  isTouching: boolean;
  touchStartX: number;
  touchStartY: number;
  touchCurrentX: number;
  touchCurrentY: number;
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
  swipeDistance: number;
  swipeVelocity: number;
}

export interface SwipeOptions {
  threshold?: number;
  velocity?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void;
}

export function useMobileOptimization() {
  const { t } = useTranslation();
  const { announce } = useAccessibility({
    announceChanges: true,
  });

  const [mobileState, setMobileState] = useState<MobileState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    orientation: 'portrait',
    touchDevice: false,
    screenWidth: 0,
    screenHeight: 0,
    viewportHeight: 0,
    keyboardVisible: false,
    connectionType: 'unknown',
    reducedMotion: false,
    highContrast: false,
  });

  const [touchState, setTouchState] = useState<TouchState>({
    isTouching: false,
    touchStartX: 0,
    touchStartY: 0,
    touchCurrentX: 0,
    touchCurrentY: 0,
    swipeDirection: null,
    swipeDistance: 0,
    swipeVelocity: 0,
  });

  const touchStartTime = useRef<number>(0);
  const initialViewportHeight = useRef<number>(0);

  // Detect device type and capabilities
  useEffect(() => {
    const updateMobileState = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      const orientation = height > width ? 'portrait' : 'landscape';
      const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const connectionType = (navigator as any).connection?.effectiveType || 'unknown';
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches;

      setMobileState({
        isMobile,
        isTablet,
        isDesktop,
        orientation,
        touchDevice,
        screenWidth: width,
        screenHeight: height,
        viewportHeight: height,
        keyboardVisible: false,
        connectionType,
        reducedMotion,
        highContrast,
      });
    };

    updateMobileState();

    const handleResize = () => {
      updateMobileState();
    };

    const handleOrientationChange = () => {
      setTimeout(updateMobileState, 100);
    };

    // Detect keyboard visibility
    const handleViewportChange = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight.current - currentHeight;
      const keyboardVisible = heightDifference > 150; // Threshold for keyboard detection

      setMobileState(prev => ({
        ...prev,
        keyboardVisible,
        viewportHeight: currentHeight,
      }));
    };

    // Store initial viewport height
    initialViewportHeight.current = window.innerHeight;

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleViewportChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  // Touch handling
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartTime.current = Date.now();

    setTouchState(prev => ({
      ...prev,
      isTouching: true,
      touchStartX: touch.clientX,
      touchStartY: touch.clientY,
      touchCurrentX: touch.clientX,
      touchCurrentY: touch.clientY,
      swipeDirection: null,
      swipeDistance: 0,
      swipeVelocity: 0,
    }));
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchState.isTouching) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.touchStartX;
    const deltaY = touch.clientY - touchState.touchStartY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const time = Date.now() - touchStartTime.current;
    const velocity = distance / time;

    let direction: 'left' | 'right' | 'up' | 'down' | null = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    setTouchState(prev => ({
      ...prev,
      touchCurrentX: touch.clientX,
      touchCurrentY: touch.clientY,
      swipeDirection: direction,
      swipeDistance: distance,
      swipeVelocity: velocity,
    }));
  }, [touchState.isTouching, touchState.touchStartX, touchState.touchStartY]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    setTouchState(prev => ({
      ...prev,
      isTouching: false,
    }));
  }, []);

  // Swipe detection
  const useSwipe = useCallback((options: SwipeOptions = {}) => {
    const {
      threshold = 50,
      velocity = 0.3,
      onSwipeLeft,
      onSwipeRight,
      onSwipeUp,
      onSwipeDown,
      onSwipe,
    } = options;

    useEffect(() => {
      if (!touchState.isTouching || touchState.swipeDistance < threshold || touchState.swipeVelocity < velocity) {
        return;
      }

      const direction = touchState.swipeDirection;
      if (!direction) return;

      switch (direction) {
        case 'left':
          onSwipeLeft?.();
          break;
        case 'right':
          onSwipeRight?.();
          break;
        case 'up':
          onSwipeUp?.();
          break;
        case 'down':
          onSwipeDown?.();
          break;
      }

      onSwipe?.(direction);

      // Announce swipe action
      announce(t(`accessibility.swipe${direction.charAt(0).toUpperCase() + direction.slice(1)}`));
    }, [touchState, threshold, velocity, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipe, announce, t]);
  }, [touchState, announce, t]);

  // Pull to refresh
  const usePullToRefresh = useCallback((onRefresh: () => void, threshold: number = 100) => {
    useEffect(() => {
      if (touchState.swipeDirection === 'down' && touchState.swipeDistance > threshold) {
        onRefresh();
        announce(t('accessibility.contentUpdated'));
      }
    }, [touchState, threshold, onRefresh, announce, t]);
  }, [touchState, announce, t]);

  // Touch event listeners
  useEffect(() => {
    if (!mobileState.touchDevice) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [mobileState.touchDevice, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Get responsive classes
  const getResponsiveClasses = useCallback((classes: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
    base?: string;
  }) => {
    const { mobile, tablet, desktop, base } = classes;
    let responsiveClasses = base || '';

    if (mobileState.isMobile && mobile) {
      responsiveClasses += ` ${mobile}`;
    } else if (mobileState.isTablet && tablet) {
      responsiveClasses += ` ${tablet}`;
    } else if (mobileState.isDesktop && desktop) {
      responsiveClasses += ` ${desktop}`;
    }

    return responsiveClasses.trim();
  }, [mobileState]);

  // Get touch target size
  const getTouchTargetSize = useCallback((size: 'small' | 'medium' | 'large' = 'medium') => {
    const sizes = {
      small: 'min-h-[32px] min-w-[32px]',
      medium: 'min-h-[44px] min-w-[44px]',
      large: 'min-h-[48px] min-w-[48px]',
    };

    return mobileState.touchDevice ? sizes[size] : '';
  }, [mobileState.touchDevice]);

  // Optimize for mobile
  const optimizeForMobile = useCallback(() => {
    if (!mobileState.isMobile) return {};

    return {
      // Prevent zoom on input focus
      inputProps: {
        style: { fontSize: '16px' },
      },
      // Optimize touch targets
      buttonProps: {
        className: getTouchTargetSize('medium'),
      },
      // Reduce motion if preferred
      animationProps: {
        className: mobileState.reducedMotion ? 'motion-reduce' : '',
      },
    };
  }, [mobileState, getTouchTargetSize]);

  return {
    mobileState,
    touchState,
    useSwipe,
    usePullToRefresh,
    getResponsiveClasses,
    getTouchTargetSize,
    optimizeForMobile,
  };
}

// Hook for mobile-specific features
export function useMobileFeatures() {
  const { mobileState, useSwipe, usePullToRefresh } = useMobileOptimization();
  const [features, setFeatures] = useState({
    enableSwipeNavigation: true,
    enablePullToRefresh: true,
    enableHapticFeedback: true,
    enableSoundFeedback: false,
    enableGestures: true,
  });

  useEffect(() => {
    if (mobileState.isMobile) {
      setFeatures({
        enableSwipeNavigation: true,
        enablePullToRefresh: true,
        enableHapticFeedback: true,
        enableSoundFeedback: false,
        enableGestures: true,
      });
    } else {
      setFeatures({
        enableSwipeNavigation: false,
        enablePullToRefresh: false,
        enableHapticFeedback: false,
        enableSoundFeedback: false,
        enableGestures: false,
      });
    }
  }, [mobileState.isMobile]);

  return {
    ...features,
    useSwipe,
    usePullToRefresh,
  };
}

// Hook for keyboard handling
export function useKeyboardHandling() {
  const { mobileState } = useMobileOptimization();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (!mobileState.isMobile) return;

    const handleResize = () => {
      const heightDifference = window.screen.height - window.innerHeight;
      const isKeyboardVisible = heightDifference > 150;
      setKeyboardVisible(isKeyboardVisible);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileState.isMobile]);

  return {
    keyboardVisible,
    adjustForKeyboard: keyboardVisible ? { paddingBottom: '200px' } : {},
  };
}
