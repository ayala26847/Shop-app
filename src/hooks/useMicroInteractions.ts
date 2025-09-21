import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from './useAccessibility';

export interface MicroInteractionOptions {
  duration?: number;
  easing?: string;
  announceChanges?: boolean;
  hapticFeedback?: boolean;
  soundFeedback?: boolean;
}

export interface AnimationState {
  isAnimating: boolean;
  progress: number;
  direction: 'in' | 'out';
}

export interface HoverState {
  isHovered: boolean;
  isFocused: boolean;
  isPressed: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  progress: number;
  message?: string;
}

// Hook for managing micro-interactions
export function useMicroInteractions(options: MicroInteractionOptions = {}) {
  const { t } = useTranslation();
  const { announce } = useAccessibility({
    announceChanges: options.announceChanges,
  });

  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    progress: 0,
    direction: 'in',
  });

  const [hoverState, setHoverState] = useState<HoverState>({
    isHovered: false,
    isFocused: false,
    isPressed: false,
  });

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
  });

  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Animate element with progress tracking
  const animate = useCallback((
    direction: 'in' | 'out' = 'in',
    duration: number = options.duration || 300
  ) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setAnimationState({
      isAnimating: true,
      progress: direction === 'in' ? 0 : 1,
      direction,
    });

    startTimeRef.current = performance.now();

    const animateFrame = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current!;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = direction === 'in' 
        ? easeInOutCubic(progress)
        : 1 - easeInOutCubic(progress);

      setAnimationState(prev => ({
        ...prev,
        progress: easedProgress,
      }));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateFrame);
      } else {
        setAnimationState(prev => ({
          ...prev,
          isAnimating: false,
        }));
      }
    };

    animationRef.current = requestAnimationFrame(animateFrame);
  }, [options.duration]);

  // Hover interactions
  const handleMouseEnter = useCallback(() => {
    setHoverState(prev => ({ ...prev, isHovered: true }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverState(prev => ({ ...prev, isHovered: false }));
  }, []);

  const handleFocus = useCallback(() => {
    setHoverState(prev => ({ ...prev, isFocused: true }));
  }, []);

  const handleBlur = useCallback(() => {
    setHoverState(prev => ({ ...prev, isFocused: false }));
  }, []);

  const handleMouseDown = useCallback(() => {
    setHoverState(prev => ({ ...prev, isPressed: true }));
  }, []);

  const handleMouseUp = useCallback(() => {
    setHoverState(prev => ({ ...prev, isPressed: false }));
  }, []);

  // Loading interactions
  const startLoading = useCallback((message?: string) => {
    setLoadingState({
      isLoading: true,
      progress: 0,
      message,
    });

    if (message && options.announceChanges) {
      announce(message);
    }
  }, [announce, options.announceChanges]);

  const updateProgress = useCallback((progress: number) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(Math.max(progress, 0), 100),
    }));
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState({
      isLoading: false,
      progress: 0,
    });
  }, []);

  // Haptic feedback
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!options.hapticFeedback || !navigator.vibrate) return;

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30, 10, 30],
    };

    navigator.vibrate(patterns[type]);
  }, [options.hapticFeedback]);

  // Sound feedback
  const triggerSound = useCallback((type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    if (!options.soundFeedback) return;

    // Create audio context for sound feedback
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const frequencies = {
      success: 800,
      error: 200,
      warning: 400,
      info: 600,
    };

    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }, [options.soundFeedback]);

  // Combined interaction handlers
  const handleInteraction = useCallback((
    type: 'click' | 'hover' | 'focus' | 'success' | 'error',
    callback?: () => void
  ) => {
    switch (type) {
      case 'click':
        triggerHaptic('medium');
        triggerSound('info');
        break;
      case 'success':
        triggerHaptic('light');
        triggerSound('success');
        break;
      case 'error':
        triggerHaptic('heavy');
        triggerSound('error');
        break;
    }

    callback?.();
  }, [triggerHaptic, triggerSound]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    animationState,
    hoverState,
    loadingState,
    animate,
    handleMouseEnter,
    handleMouseLeave,
    handleFocus,
    handleBlur,
    handleMouseDown,
    handleMouseUp,
    startLoading,
    updateProgress,
    stopLoading,
    handleInteraction,
    triggerHaptic,
    triggerSound,
  };
}

// Easing functions
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

// Hook for button micro-interactions
export function useButtonInteractions(options: MicroInteractionOptions = {}) {
  const interactions = useMicroInteractions(options);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleClick = useCallback((callback?: () => void) => {
    if (isDisabled) return;

    interactions.handleInteraction('click', callback);
  }, [isDisabled, interactions]);

  const handleSuccess = useCallback((callback?: () => void) => {
    if (isDisabled) return;

    interactions.handleInteraction('success', callback);
  }, [isDisabled, interactions]);

  const handleError = useCallback((callback?: () => void) => {
    if (isDisabled) return;

    interactions.handleInteraction('error', callback);
  }, [isDisabled, interactions]);

  const disable = useCallback(() => {
    setIsDisabled(true);
  }, []);

  const enable = useCallback(() => {
    setIsDisabled(false);
  }, []);

  return {
    ...interactions,
    isDisabled,
    handleClick,
    handleSuccess,
    handleError,
    disable,
    enable,
  };
}

// Hook for form micro-interactions
export function useFormInteractions(options: MicroInteractionOptions = {}) {
  const interactions = useMicroInteractions(options);
  const [fieldStates, setFieldStates] = useState<Record<string, {
    isValid: boolean;
    isDirty: boolean;
    isFocused: boolean;
  }>>({});

  const updateFieldState = useCallback((fieldName: string, updates: Partial<{
    isValid: boolean;
    isDirty: boolean;
    isFocused: boolean;
  }>) => {
    setFieldStates(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        ...updates,
      },
    }));
  }, []);

  const handleFieldFocus = useCallback((fieldName: string) => {
    updateFieldState(fieldName, { isFocused: true });
    interactions.handleInteraction('focus');
  }, [updateFieldState, interactions]);

  const handleFieldBlur = useCallback((fieldName: string) => {
    updateFieldState(fieldName, { isFocused: false });
  }, [updateFieldState]);

  const handleFieldChange = useCallback((fieldName: string, isValid: boolean) => {
    updateFieldState(fieldName, { isDirty: true, isValid });
    
    if (isValid) {
      interactions.handleInteraction('success');
    } else {
      interactions.handleInteraction('error');
    }
  }, [updateFieldState, interactions]);

  return {
    ...interactions,
    fieldStates,
    updateFieldState,
    handleFieldFocus,
    handleFieldBlur,
    handleFieldChange,
  };
}

// Hook for page transitions
export function usePageTransitions(options: MicroInteractionOptions = {}) {
  const interactions = useMicroInteractions(options);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startTransition = useCallback((direction: 'in' | 'out' = 'in') => {
    setIsTransitioning(true);
    interactions.animate(direction);
  }, [interactions]);

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  return {
    ...interactions,
    isTransitioning,
    startTransition,
    endTransition,
  };
}
