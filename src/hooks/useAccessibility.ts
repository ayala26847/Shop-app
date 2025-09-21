import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface AccessibilityOptions {
  announceChanges?: boolean;
  announceLoading?: boolean;
  announceErrors?: boolean;
  announceSuccess?: boolean;
  liveRegion?: 'polite' | 'assertive' | 'off';
  focusManagement?: boolean;
  keyboardNavigation?: boolean;
}

export interface AccessibilityState {
  isScreenReaderActive: boolean;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  isLargeText: boolean;
  currentFocus: HTMLElement | null;
  lastAnnouncement: string;
}

export function useAccessibility(options: AccessibilityOptions = {}) {
  const { t } = useTranslation();
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<AccessibilityState>({
    isScreenReaderActive: false,
    isHighContrast: false,
    isReducedMotion: false,
    isLargeText: false,
    currentFocus: null,
    lastAnnouncement: '',
  });

  // Initialize live region for announcements
  useEffect(() => {
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', options.liveRegion || 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = 'accessibility-live-region';
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return () => {
      if (liveRegionRef.current && document.body.contains(liveRegionRef.current)) {
        document.body.removeChild(liveRegionRef.current);
      }
    };
  }, [options.liveRegion]);

  // Detect screen reader and accessibility preferences
  useEffect(() => {
    const detectAccessibilityFeatures = () => {
      // Detect screen reader (basic detection)
      const isScreenReaderActive = 
        window.speechSynthesis?.speaking ||
        document.querySelector('[aria-live]')?.textContent?.length > 0 ||
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('VoiceOver');

      // Detect high contrast mode
      const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

      // Detect reduced motion preference
      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Detect large text preference
      const isLargeText = window.matchMedia('(prefers-reduced-motion: no-preference)').matches &&
        document.documentElement.style.fontSize > '16px';

      setState(prev => ({
        ...prev,
        isScreenReaderActive,
        isHighContrast,
        isReducedMotion,
        isLargeText,
      }));
    };

    detectAccessibilityFeatures();

    // Listen for changes in accessibility preferences
    const mediaQueries = [
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
    ];

    const handleChange = () => detectAccessibilityFeatures();
    mediaQueries.forEach(mq => mq.addEventListener('change', handleChange));

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', handleChange));
    };
  }, []);

  // Announce messages to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!options.announceChanges) return;

    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;
      setState(prev => ({ ...prev, lastAnnouncement: message }));

      // Clear after announcement
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  }, [options.announceChanges]);

  // Focus management
  const setFocus = useCallback((element: HTMLElement | string) => {
    if (!options.focusManagement) return;

    const targetElement = typeof element === 'string' 
      ? document.querySelector(element) as HTMLElement
      : element;

    if (targetElement) {
      targetElement.focus();
      setState(prev => ({ ...prev, currentFocus: targetElement }));
    }
  }, [options.focusManagement]);

  // Trap focus within a container
  const trapFocus = useCallback((container: HTMLElement) => {
    if (!options.focusManagement) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [options.focusManagement]);

  // Restore focus to previous element
  const restoreFocus = useCallback(() => {
    if (state.currentFocus && options.focusManagement) {
      state.currentFocus.focus();
    }
  }, [state.currentFocus, options.focusManagement]);

  // Announce loading states
  const announceLoading = useCallback((message?: string) => {
    if (options.announceLoading) {
      const loadingMessage = message || t('accessibility.loading');
      announce(loadingMessage);
    }
  }, [options.announceLoading, announce, t]);

  // Announce errors
  const announceError = useCallback((message: string) => {
    if (options.announceErrors) {
      announce(`${t('accessibility.error')}: ${message}`, 'assertive');
    }
  }, [options.announceErrors, announce, t]);

  // Announce success
  const announceSuccess = useCallback((message: string) => {
    if (options.announceSuccess) {
      announce(`${t('accessibility.success')}: ${message}`, 'polite');
    }
  }, [options.announceSuccess, announce, t]);

  // Get ARIA attributes for interactive elements
  const getAriaAttributes = useCallback((options: {
    label?: string;
    description?: string;
    expanded?: boolean;
    selected?: boolean;
    disabled?: boolean;
    required?: boolean;
    invalid?: boolean;
    live?: 'polite' | 'assertive' | 'off';
    atomic?: boolean;
  }) => {
    const attributes: Record<string, string | boolean> = {};

    if (options.label) attributes['aria-label'] = options.label;
    if (options.description) attributes['aria-describedby'] = options.description;
    if (options.expanded !== undefined) attributes['aria-expanded'] = options.expanded;
    if (options.selected !== undefined) attributes['aria-selected'] = options.selected;
    if (options.disabled !== undefined) attributes['aria-disabled'] = options.disabled;
    if (options.required !== undefined) attributes['aria-required'] = options.required;
    if (options.invalid !== undefined) attributes['aria-invalid'] = options.invalid;
    if (options.live) attributes['aria-live'] = options.live;
    if (options.atomic !== undefined) attributes['aria-atomic'] = options.atomic;

    return attributes;
  }, []);

  // Get accessible role attributes
  const getRoleAttributes = useCallback((role: string, options: {
    label?: string;
    expanded?: boolean;
    selected?: boolean;
    disabled?: boolean;
    current?: boolean | number;
  }) => {
    const attributes: Record<string, string | boolean> = {
      role,
    };

    if (options.label) attributes['aria-label'] = options.label;
    if (options.expanded !== undefined) attributes['aria-expanded'] = options.expanded;
    if (options.selected !== undefined) attributes['aria-selected'] = options.selected;
    if (options.disabled !== undefined) attributes['aria-disabled'] = options.disabled;
    if (options.current !== undefined) attributes['aria-current'] = options.current;

    return attributes;
  }, []);

  // Keyboard navigation helpers
  const handleKeyboardNavigation = useCallback((
    event: KeyboardEvent,
    onEnter?: () => void,
    onEscape?: () => void,
    onArrowUp?: () => void,
    onArrowDown?: () => void,
    onArrowLeft?: () => void,
    onArrowRight?: () => void
  ) => {
    if (!options.keyboardNavigation) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowDown?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onArrowLeft?.();
        break;
      case 'ArrowRight':
        event.preventDefault();
        onArrowRight?.();
        break;
    }
  }, [options.keyboardNavigation]);

  return {
    state,
    announce,
    setFocus,
    trapFocus,
    restoreFocus,
    announceLoading,
    announceError,
    announceSuccess,
    getAriaAttributes,
    getRoleAttributes,
    handleKeyboardNavigation,
  };
}

// Hook for managing focus within modals and dropdowns
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Trap focus within the container
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    containerRef.current.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      containerRef.current?.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the previously focused element
      previousFocusRef.current?.focus();
    };
  }, [isActive]);

  return containerRef;
}

// Hook for managing ARIA live regions
export function useAriaLiveRegion() {
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = 'aria-live-region';
      document.body.appendChild(liveRegion);
      liveRegionRef.current = liveRegion;
    }

    return () => {
      if (liveRegionRef.current && document.body.contains(liveRegionRef.current)) {
        document.body.removeChild(liveRegionRef.current);
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', priority);
      liveRegionRef.current.textContent = message;

      // Clear after a short delay to allow for re-announcement of the same message
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return { announce };
}
