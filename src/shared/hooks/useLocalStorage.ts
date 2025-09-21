// Local storage operations hook

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { useAccessibility } from './useAccessibility';

export interface UseLocalStorageOptions {
  enableToast?: boolean;
  enableAnnouncements?: boolean;
  enableSync?: boolean;
  syncKey?: string;
}

export function useLocalStorage<T = any>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
) {
  const {
    enableToast = false,
    enableAnnouncements = false,
    enableSync = false,
    syncKey = key,
  } = options;

  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const { announce } = useAccessibility({ announceChanges: enableAnnouncements });

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));

      if (enableToast) {
        showSuccess(t('accessibility.dataSaved'));
      }
      if (enableAnnouncements) {
        announce(t('accessibility.dataSaved'), 'polite');
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
      
      if (enableToast) {
        showError(t('accessibility.dataSaveFailed'));
      }
      if (enableAnnouncements) {
        announce(t('accessibility.dataSaveFailed'), 'assertive');
      }
    }
  }, [key, storedValue, enableToast, showSuccess, showError, enableAnnouncements, announce, t]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);

      if (enableToast) {
        showSuccess(t('accessibility.dataRemoved'));
      }
      if (enableAnnouncements) {
        announce(t('accessibility.dataRemoved'), 'polite');
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      
      if (enableToast) {
        showError(t('accessibility.dataRemoveFailed'));
      }
      if (enableAnnouncements) {
        announce(t('accessibility.dataRemoveFailed'), 'assertive');
      }
    }
  }, [key, initialValue, enableToast, showSuccess, showError, enableAnnouncements, announce, t]);

  const clearAll = useCallback(() => {
    try {
      window.localStorage.clear();
      setStoredValue(initialValue);

      if (enableToast) {
        showSuccess(t('accessibility.allDataCleared'));
      }
      if (enableAnnouncements) {
        announce(t('accessibility.allDataCleared'), 'polite');
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      
      if (enableToast) {
        showError(t('accessibility.dataClearFailed'));
      }
      if (enableAnnouncements) {
        announce(t('accessibility.dataClearFailed'), 'assertive');
      }
    }
  }, [initialValue, enableToast, showSuccess, showError, enableAnnouncements, announce, t]);

  const getValue = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const hasValue = useCallback(() => {
    return window.localStorage.getItem(key) !== null;
  }, [key]);

  const getSize = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? new Blob([item]).size : 0;
    } catch (error) {
      console.warn(`Error calculating localStorage size for key "${key}":`, error);
      return 0;
    }
  }, [key]);

  const getAllKeys = useCallback(() => {
    try {
      return Object.keys(window.localStorage);
    } catch (error) {
      console.warn('Error getting localStorage keys:', error);
      return [];
    }
  }, []);

  const getTotalSize = useCallback(() => {
    try {
      let total = 0;
      for (let key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
          total += new Blob([window.localStorage[key]]).size;
        }
      }
      return total;
    } catch (error) {
      console.warn('Error calculating total localStorage size:', error);
      return 0;
    }
  }, []);

  // Sync with other tabs
  useEffect(() => {
    if (enableSync) {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === syncKey && e.newValue !== null) {
          try {
            const newValue = JSON.parse(e.newValue);
            setStoredValue(newValue);
          } catch (error) {
            console.warn(`Error parsing synced localStorage value for key "${syncKey}":`, error);
          }
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [enableSync, syncKey]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    clearAll,
    getValue,
    hasValue,
    getSize,
    getAllKeys,
    getTotalSize,
  };
}

// Specialized localStorage hooks
export function useLocalStorageString(key: string, initialValue: string = '') {
  return useLocalStorage(key, initialValue);
}

export function useLocalStorageNumber(key: string, initialValue: number = 0) {
  return useLocalStorage(key, initialValue);
}

export function useLocalStorageBoolean(key: string, initialValue: boolean = false) {
  return useLocalStorage(key, initialValue);
}

export function useLocalStorageArray<T>(key: string, initialValue: T[] = []) {
  return useLocalStorage(key, initialValue);
}

export function useLocalStorageObject<T extends Record<string, any>>(
  key: string,
  initialValue: T
) {
  return useLocalStorage(key, initialValue);
}

// Utility functions
export const localStorageUtils = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  },

  clear: (): void => {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  has: (key: string): boolean => {
    return window.localStorage.getItem(key) !== null;
  },

  keys: (): string[] => {
    try {
      return Object.keys(window.localStorage);
    } catch (error) {
      console.warn('Error getting localStorage keys:', error);
      return [];
    }
  },

  size: (key: string): number => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? new Blob([item]).size : 0;
    } catch (error) {
      console.warn(`Error calculating localStorage size for key "${key}":`, error);
      return 0;
    }
  },

  totalSize: (): number => {
    try {
      let total = 0;
      for (let key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
          total += new Blob([window.localStorage[key]]).size;
        }
      }
      return total;
    } catch (error) {
      console.warn('Error calculating total localStorage size:', error);
      return 0;
    }
  },
};
