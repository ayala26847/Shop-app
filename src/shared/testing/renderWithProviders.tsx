// Enhanced render with providers for testing

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from 'styled-components';
import { configureStore } from '@reduxjs/toolkit';
import i18n from '../../i18n';
import { ToastProvider } from '../../contexts/ToastContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { store } from '../../app/store';

// Mock store for testing
const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      // Add your reducers here
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });
};

// Mock providers
const MockProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={store}>
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={{}}>
          <ToastProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </I18nextProvider>
    </BrowserRouter>
  </Provider>
);

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    preloadedState?: any;
    store?: any;
  }
) => {
  const { preloadedState, store: customStore, ...renderOptions } = options || {};
  
  const testStore = customStore || createMockStore(preloadedState);
  
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Provider store={testStore}>
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={{}}>
            <ToastProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </I18nextProvider>
      </BrowserRouter>
    </Provider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Specialized render functions
export const renderWithRouter = (
  ui: ReactElement,
  { route = '/' } = {}
) => {
  window.history.pushState({}, 'Test page', route);
  return customRender(ui);
};

export const renderWithRedux = (
  ui: ReactElement,
  { preloadedState = {}, store = createMockStore() } = {}
) => {
  return customRender(ui, { preloadedState, store });
};

export const renderWithAuth = (
  ui: ReactElement,
  { user = null, isAuthenticated = false } = {}
) => {
  const authState = {
    user,
    isAuthenticated,
    isLoading: false,
    error: null,
  };
  
  return customRender(ui, {
    preloadedState: { auth: authState },
  });
};

export const renderWithTheme = (
  ui: ReactElement,
  { theme = {} } = {}
) => {
  const ThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
  
  return render(ui, { wrapper: ThemeWrapper });
};

export const renderWithI18n = (
  ui: ReactElement,
  { language = 'en' } = {}
) => {
  i18n.changeLanguage(language);
  
  const I18nWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
  
  return render(ui, { wrapper: I18nWrapper });
};

// Utility functions for testing
export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  isEmailVerified: true,
  isPhoneVerified: false,
  isActive: true,
  roles: ['user'],
  permissions: ['read:profile', 'write:profile'],
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockProduct = (overrides = {}) => ({
  id: 'product-1',
  name: 'Test Product',
  description: 'Test product description',
  sku: 'TEST-001',
  price: 29.99,
  images: [
    {
      id: 'img-1',
      url: 'https://example.com/image.jpg',
      alt: 'Test product image',
      isPrimary: true,
      order: 0,
    },
  ],
  categoryId: 'category-1',
  status: 'active',
  isFeatured: false,
  isNew: true,
  isOnSale: false,
  averageRating: 4.5,
  reviewCount: 10,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockCartItem = (overrides = {}) => ({
  id: 'cart-item-1',
  productId: 'product-1',
  name: 'Test Product',
  price: 29.99,
  quantity: 1,
  image: 'https://example.com/image.jpg',
  variant: 'default',
  maxQuantity: 10,
  addedAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createMockOrder = (overrides = {}) => ({
  id: 'order-1',
  userId: 'user-1',
  status: 'pending',
  total: 29.99,
  items: [createMockCartItem()],
  shippingAddress: {
    firstName: 'Test',
    lastName: 'User',
    address: '123 Test St',
    city: 'Test City',
    state: 'TS',
    postalCode: '12345',
    country: 'US',
  },
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

// Mock API responses
export const mockApiResponse = <T>(data: T, success = true) => ({
  data,
  success,
  message: success ? 'Success' : 'Error',
  errors: success ? [] : ['Something went wrong'],
});

export const mockPaginatedResponse = <T>(data: T[], page = 1, limit = 20) => ({
  data,
  pagination: {
    page,
    limit,
    total: data.length,
    totalPages: Math.ceil(data.length / limit),
    hasNext: page * limit < data.length,
    hasPrev: page > 1,
  },
});

// Test data factories
export const testDataFactories = {
  user: createMockUser,
  product: createMockProduct,
  cartItem: createMockCartItem,
  order: createMockOrder,
  apiResponse: mockApiResponse,
  paginatedResponse: mockPaginatedResponse,
};
