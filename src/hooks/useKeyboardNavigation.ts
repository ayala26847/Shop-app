import { useEffect, useState } from 'react';

export interface KeyboardNavigationOptions {
  items: unknown[];
  onSelect?: (item: unknown, index: number) => void;
  loop?: boolean;
  autoFocus?: boolean;
}

export const useKeyboardNavigation = ({
  items,
  onSelect,
  loop = true,
  autoFocus = false
}: KeyboardNavigationOptions) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    if (autoFocus && items.length > 0) {
      setFocusedIndex(0);
    }
  }, [autoFocus, items.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (items.length === 0) return;

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight': {
          event.preventDefault();
          const nextIndex = loop
            ? (focusedIndex + 1) % items.length
            : Math.min(focusedIndex + 1, items.length - 1);
          setFocusedIndex(nextIndex);
          break;
        }

        case 'ArrowUp':
        case 'ArrowLeft': {
          event.preventDefault();
          const prevIndex = loop
            ? (focusedIndex - 1 + items.length) % items.length
            : Math.max(focusedIndex - 1, 0);
          setFocusedIndex(prevIndex);
          break;
        }

        case 'Enter':
        case ' ': {
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < items.length && onSelect) {
            onSelect(items[focusedIndex], focusedIndex);
          }
          break;
        }

        case 'Home': {
          event.preventDefault();
          setFocusedIndex(0);
          break;
        }

        case 'End': {
          event.preventDefault();
          setFocusedIndex(items.length - 1);
          break;
        }

        case 'Escape': {
          event.preventDefault();
          setFocusedIndex(-1);
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, focusedIndex, onSelect, loop]);

  const setFocus = (index: number) => {
    if (index >= 0 && index < items.length) {
      setFocusedIndex(index);
    }
  };

  const clearFocus = () => {
    setFocusedIndex(-1);
  };

  return {
    focusedIndex,
    setFocus,
    clearFocus,
    isFocused: focusedIndex >= 0
  };
};
