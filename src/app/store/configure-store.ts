// Enhanced store configuration with RTK Query and normalized cache

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { userApi } from '../../entities/user/api/user-api';
import { productApi } from '../../entities/product/api/product-api';
import { cartApi } from '../../entities/cart/api/cart-api';
import { orderApi } from '../../entities/order/api/order-api';
import { authSlice } from '../slices/auth-slice';
import { uiSlice } from '../slices/ui-slice';
import { errorMiddleware } from './middleware/error-middleware';
import { cacheMiddleware } from './middleware/cache-middleware';
import { loggerMiddleware } from './middleware/logger-middleware';

export const store = configureStore({
  reducer: {
    // API slices
    [userApi.reducerPath]: userApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    
    // Feature slices
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // Ignore these action types
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
      immutableCheck: {
        ignoredPaths: ['items.dates'],
      },
    })
      .concat(userApi.middleware)
      .concat(productApi.middleware)
      .concat(cartApi.middleware)
      .concat(orderApi.middleware)
      .concat(errorMiddleware)
      .concat(cacheMiddleware)
      .concat(loggerMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Setup listeners for RTK Query
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Enhanced store with additional features
export const enhancedStore = {
  ...store,
  
  // Cache management
  cache: {
    invalidate: (tags: string[]) => {
      store.dispatch(userApi.util.invalidateTags(tags));
      store.dispatch(productApi.util.invalidateTags(tags));
      store.dispatch(cartApi.util.invalidateTags(tags));
      store.dispatch(orderApi.util.invalidateTags(tags));
    },
    
    reset: () => {
      store.dispatch(userApi.util.resetApiState());
      store.dispatch(productApi.util.resetApiState());
      store.dispatch(cartApi.util.resetApiState());
      store.dispatch(orderApi.util.resetApiState());
    },
    
    getCacheSize: () => {
      const state = store.getState();
      return {
        user: Object.keys(state[userApi.reducerPath]?.queries || {}).length,
        product: Object.keys(state[productApi.reducerPath]?.queries || {}).length,
        cart: Object.keys(state[cartApi.reducerPath]?.queries || {}).length,
        order: Object.keys(state[orderApi.reducerPath]?.queries || {}).length,
      };
    },
  },
  
  // Performance monitoring
  performance: {
    getMetrics: () => {
      const state = store.getState();
      const metrics = {
        apiCalls: 0,
        cacheHits: 0,
        cacheMisses: 0,
        errors: 0,
        loadingStates: 0,
      };
      
      // Count API calls and cache hits/misses
      Object.values(state).forEach((slice: any) => {
        if (slice.queries) {
          Object.values(slice.queries).forEach((query: any) => {
            metrics.apiCalls++;
            if (query.status === 'fulfilled') metrics.cacheHits++;
            if (query.status === 'rejected') metrics.errors++;
            if (query.status === 'pending') metrics.loadingStates++;
          });
        }
      });
      
      return metrics;
    },
    
    optimize: () => {
      // Remove stale queries
      const state = store.getState();
      const staleTime = 5 * 60 * 1000; // 5 minutes
      const now = Date.now();
      
      Object.values(state).forEach((slice: any) => {
        if (slice.queries) {
          Object.entries(slice.queries).forEach(([key, query]: [string, any]) => {
            if (query.fulfilledTimeStamp && now - query.fulfilledTimeStamp > staleTime) {
              store.dispatch(userApi.util.invalidateTags([key]));
            }
          });
        }
      });
    },
  },
  
  // Error handling
  errors: {
    getErrors: () => {
      const state = store.getState();
      const errors: any[] = [];
      
      Object.values(state).forEach((slice: any) => {
        if (slice.queries) {
          Object.values(slice.queries).forEach((query: any) => {
            if (query.status === 'rejected' && query.error) {
              errors.push({
                type: 'api',
                error: query.error,
                endpoint: query.endpointName,
                timestamp: new Date().toISOString(),
              });
            }
          });
        }
      });
      
      return errors;
    },
    
    clearErrors: () => {
      store.dispatch(userApi.util.resetApiState());
      store.dispatch(productApi.util.resetApiState());
      store.dispatch(cartApi.util.resetApiState());
      store.dispatch(orderApi.util.resetApiState());
    },
  },
  
  // State persistence
  persistence: {
    save: () => {
      const state = store.getState();
      const serializableState = {
        auth: state.auth,
        ui: state.ui,
        // Don't persist API cache
      };
      
      localStorage.setItem('redux-state', JSON.stringify(serializableState));
    },
    
    load: () => {
      const savedState = localStorage.getItem('redux-state');
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          // Restore non-API state
          if (parsedState.auth) {
            store.dispatch(authSlice.actions.restore(parsedState.auth));
          }
          if (parsedState.ui) {
            store.dispatch(uiSlice.actions.restore(parsedState.ui));
          }
        } catch (error) {
          console.error('Failed to restore state:', error);
        }
      }
    },
  },
};

// Auto-save state on changes
let saveTimeout: NodeJS.Timeout;
store.subscribe(() => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    enhancedStore.persistence.save();
  }, 1000);
});

// Load state on initialization
enhancedStore.persistence.load();

export default store;
