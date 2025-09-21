// Cart operations hook

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../contexts/ToastContext';
import { useAccessibility } from './useAccessibility';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
  maxQuantity?: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isEmpty: boolean;
  isUpdating: boolean;
}

export interface UseCartOptions {
  enableLocalStorage?: boolean;
  storageKey?: string;
  enableToast?: boolean;
  enableAnnouncements?: boolean;
}

export function useCart(options: UseCartOptions = {}) {
  const {
    enableLocalStorage = true,
    storageKey = 'cart',
    enableToast = true,
    enableAnnouncements = true,
  } = options;

  const { t } = useTranslation();
  const { showSuccess, showInfo } = useToast();
  const { announce } = useAccessibility({ announceChanges: enableAnnouncements });

  const [state, setState] = useState<CartState>({
    items: [],
    total: 0,
    itemCount: 0,
    isEmpty: true,
    isUpdating: false,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    if (enableLocalStorage) {
      const savedCart = localStorage.getItem(storageKey);
      if (savedCart) {
        try {
          const cartData = JSON.parse(savedCart);
          setState(cartData);
        } catch (error) {
          console.warn('Failed to load cart from localStorage:', error);
        }
      }
    }
  }, [enableLocalStorage, storageKey]);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (enableLocalStorage) {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }
  }, [state, enableLocalStorage, storageKey]);

  const calculateTotals = useCallback((items: CartItem[]) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const isEmpty = items.length === 0;

    return { total, itemCount, isEmpty };
  }, []);

  const addItem = useCallback((item: Omit<CartItem, 'id'>) => {
    setState(prev => {
      const existingItem = prev.items.find(i => 
        i.productId === item.productId && i.variant === item.variant
      );

      let newItems: CartItem[];
      if (existingItem) {
        newItems = prev.items.map(i =>
          i.id === existingItem.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        const newItem: CartItem = {
          ...item,
          id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        newItems = [...prev.items, newItem];
      }

      const { total, itemCount, isEmpty } = calculateTotals(newItems);
      return {
        items: newItems,
        total,
        itemCount,
        isEmpty,
        isUpdating: false,
      };
    });

    if (enableToast) {
      showSuccess(t('accessibility.itemAddedToCart'));
    }
    if (enableAnnouncements) {
      announce(t('accessibility.itemAddedToCart'), 'polite');
    }
  }, [calculateTotals, enableToast, showSuccess, enableAnnouncements, announce, t]);

  const removeItem = useCallback((itemId: string) => {
    setState(prev => {
      const newItems = prev.items.filter(item => item.id !== itemId);
      const { total, itemCount, isEmpty } = calculateTotals(newItems);
      return {
        items: newItems,
        total,
        itemCount,
        isEmpty,
        isUpdating: false,
      };
    });

    if (enableToast) {
      showInfo(t('accessibility.itemRemovedFromCart'));
    }
    if (enableAnnouncements) {
      announce(t('accessibility.itemRemovedFromCart'), 'polite');
    }
  }, [calculateTotals, enableToast, showInfo, enableAnnouncements, announce, t]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setState(prev => {
      const newItems = prev.items.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.min(quantity, item.maxQuantity || 999) }
          : item
      );
      const { total, itemCount, isEmpty } = calculateTotals(newItems);
      return {
        items: newItems,
        total,
        itemCount,
        isEmpty,
        isUpdating: false,
      };
    });

    if (enableAnnouncements) {
      announce(t('accessibility.quantityUpdated'), 'polite');
    }
  }, [removeItem, calculateTotals, enableAnnouncements, announce, t]);

  const clearCart = useCallback(() => {
    setState({
      items: [],
      total: 0,
      itemCount: 0,
      isEmpty: true,
      isUpdating: false,
    });

    if (enableToast) {
      showInfo(t('accessibility.cartCleared'));
    }
    if (enableAnnouncements) {
      announce(t('accessibility.cartCleared'), 'polite');
    }
  }, [enableToast, showInfo, enableAnnouncements, announce, t]);

  const getItem = useCallback((itemId: string) => {
    return state.items.find(item => item.id === itemId);
  }, [state.items]);

  const getItemByProduct = useCallback((productId: string, variant?: string) => {
    return state.items.find(item => 
      item.productId === productId && item.variant === variant
    );
  }, [state.items]);

  const isItemInCart = useCallback((productId: string, variant?: string) => {
    return state.items.some(item => 
      item.productId === productId && item.variant === variant
    );
  }, [state.items]);

  const getItemQuantity = useCallback((productId: string, variant?: string) => {
    const item = getItemByProduct(productId, variant);
    return item ? item.quantity : 0;
  }, [getItemByProduct]);

  const canAddItem = useCallback((productId: string, quantity: number, variant?: string) => {
    const existingItem = getItemByProduct(productId, variant);
    if (!existingItem) return true;
    
    const newQuantity = existingItem.quantity + quantity;
    return newQuantity <= (existingItem.maxQuantity || 999);
  }, [getItemByProduct]);

  const getTotalSavings = useCallback(() => {
    return state.items.reduce((savings, item) => {
      const originalPrice = (item as any).originalPrice || item.price;
      return savings + ((originalPrice - item.price) * item.quantity);
    }, 0);
  }, [state.items]);

  const getShippingEstimate = useCallback((shippingThreshold: number = 50) => {
    if (state.total >= shippingThreshold) return 0;
    return Math.max(0, shippingThreshold - state.total);
  }, [state.total]);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isUpdating: loading }));
  }, []);

  return {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItem,
    getItemByProduct,
    isItemInCart,
    getItemQuantity,
    canAddItem,
    getTotalSavings,
    getShippingEstimate,
    setLoading,
  };
}
