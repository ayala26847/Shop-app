import { useEffect, useRef } from 'react';

export function useFocusManagement() {
  const focusRef = useRef<HTMLElement | null>(null);

  const setFocusRef = (element: HTMLElement | null) => {
    focusRef.current = element;
  };

  const restoreFocus = () => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  };

  return {
    setFocusRef,
    restoreFocus,
    trapFocus,
  };
}

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

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
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
  };

  return { announce };
}

export function useKeyboardNavigation(items: string[], onSelect: (item: string) => void) {
  const currentIndexRef = useRef(0);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        currentIndexRef.current = (currentIndexRef.current + 1) % items.length;
        break;
      case 'ArrowUp':
        e.preventDefault();
        currentIndexRef.current = currentIndexRef.current === 0 ? items.length - 1 : currentIndexRef.current - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(items[currentIndexRef.current]);
        break;
      case 'Home':
        e.preventDefault();
        currentIndexRef.current = 0;
        break;
      case 'End':
        e.preventDefault();
        currentIndexRef.current = items.length - 1;
        break;
    }
  };

  return {
    currentIndex: currentIndexRef.current,
    handleKeyDown,
    setCurrentIndex: (index: number) => {
      currentIndexRef.current = index;
    },
  };
}