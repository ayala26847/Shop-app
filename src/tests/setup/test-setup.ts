// Test setup and configuration

import { configure } from '@testing-library/react';
import { vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock fetch
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_API_URL: 'http://localhost:3000/api',
  VITE_APP_NAME: 'Shop App',
  VITE_APP_VERSION: '1.0.0',
  VITE_APP_ENVIRONMENT: 'test',
}));

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (options) {
        return key.replace(/\{\{(\w+)\}\}/g, (match, placeholder) => {
          return options[placeholder] || match;
        });
      }
      return key;
    },
    i18n: {
      changeLanguage: vi.fn(),
      language: 'en',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  NavLink: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  Outlet: () => <div data-testid="outlet" />,
  useOutletContext: () => ({}),
}));

// Mock Redux store
vi.mock('../../app/store', () => ({
  store: {
    dispatch: vi.fn(),
    getState: vi.fn(() => ({})),
    subscribe: vi.fn(),
  },
}));

// Mock service container
vi.mock('../../shared/services/service-container', () => ({
  serviceContainer: {
    get: vi.fn(),
    register: vi.fn(),
    has: vi.fn(() => false),
    remove: vi.fn(),
    clear: vi.fn(),
  },
}));

// Test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  isEmailVerified: true,
  isPhoneVerified: false,
  isActive: true,
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
  quantity: 1,
  price: 29.99,
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

// Performance testing utilities
export const measurePerformance = (fn: () => void | Promise<void>) => {
  const start = performance.now();
  const result = fn();
  
  if (result instanceof Promise) {
    return result.then(() => {
      const end = performance.now();
      return end - start;
    });
  }
  
  const end = performance.now();
  return end - start;
};

// Accessibility testing utilities
export const getAccessibilityViolations = async (container: HTMLElement) => {
  // This would integrate with axe-core for accessibility testing
  // For now, return empty array
  return [];
};

// Visual regression testing utilities
export const captureScreenshot = (element: HTMLElement) => {
  // This would integrate with visual regression testing tools
  // For now, return a mock screenshot
  return 'data:image/png;base64,mock-screenshot';
};
