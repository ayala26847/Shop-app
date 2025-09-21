// API constants

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    VERIFY_PHONE: '/auth/verify-phone',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/profile/avatar',
    ADDRESSES: '/users/addresses',
    PAYMENT_METHODS: '/users/payment-methods',
    PREFERENCES: '/users/preferences',
    ACTIVITY: '/users/activity',
    STATS: '/users/stats',
  },
  
  // Products
  PRODUCTS: {
    BASE: '/products',
    SEARCH: '/products/search',
    FEATURED: '/products/featured',
    NEW: '/products/new',
    ON_SALE: '/products/on-sale',
    BY_CATEGORY: '/products/category',
    RECOMMENDATIONS: '/products/recommendations',
    COMPARE: '/products/compare',
    REVIEWS: '/products/:id/reviews',
    RATING: '/products/:id/rating',
  },
  
  // Categories
  CATEGORIES: {
    BASE: '/categories',
    TREE: '/categories/tree',
    BY_SLUG: '/categories/slug',
  },
  
  // Cart
  CART: {
    BASE: '/cart',
    ITEMS: '/cart/items',
    ADD_ITEM: '/cart/items',
    UPDATE_ITEM: '/cart/items/:id',
    REMOVE_ITEM: '/cart/items/:id',
    CLEAR: '/cart/clear',
    MERGE: '/cart/merge',
  },
  
  // Orders
  ORDERS: {
    BASE: '/orders',
    CREATE: '/orders',
    BY_ID: '/orders/:id',
    TRACKING: '/orders/:id/tracking',
    CANCEL: '/orders/:id/cancel',
    RETURN: '/orders/:id/return',
    INVOICE: '/orders/:id/invoice',
  },
  
  // Payments
  PAYMENTS: {
    BASE: '/payments',
    PROCESS: '/payments/process',
    VERIFY: '/payments/verify',
    REFUND: '/payments/refund',
    METHODS: '/payments/methods',
  },
  
  // Shipping
  SHIPPING: {
    BASE: '/shipping',
    RATES: '/shipping/rates',
    TRACKING: '/shipping/tracking',
    ADDRESSES: '/shipping/addresses',
  },
  
  // Reviews
  REVIEWS: {
    BASE: '/reviews',
    BY_PRODUCT: '/reviews/product/:id',
    BY_USER: '/reviews/user',
    CREATE: '/reviews',
    UPDATE: '/reviews/:id',
    DELETE: '/reviews/:id',
    HELPFUL: '/reviews/:id/helpful',
  },
  
  // Wishlist
  WISHLIST: {
    BASE: '/wishlist',
    ITEMS: '/wishlist/items',
    ADD_ITEM: '/wishlist/items',
    REMOVE_ITEM: '/wishlist/items/:id',
    CLEAR: '/wishlist/clear',
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD: '/notifications/unread',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all',
    PREFERENCES: '/notifications/preferences',
  },
  
  // Analytics
  ANALYTICS: {
    BASE: '/analytics',
    DASHBOARD: '/analytics/dashboard',
    PRODUCTS: '/analytics/products',
    ORDERS: '/analytics/orders',
    USERS: '/analytics/users',
    REVENUE: '/analytics/revenue',
  },
  
  // Admin
  ADMIN: {
    BASE: '/admin',
    DASHBOARD: '/admin/dashboard',
    PRODUCTS: '/admin/products',
    ORDERS: '/admin/orders',
    USERS: '/admin/users',
    CATEGORIES: '/admin/categories',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
  },
} as const;

export const API_BASE_URL = process.env.VITE_API_URL || '/api';

export const API_TIMEOUTS = {
  DEFAULT: 10000,
  UPLOAD: 30000,
  DOWNLOAD: 60000,
  LONG_RUNNING: 300000,
} as const;

export const API_RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  BACKOFF_MULTIPLIER: 2,
} as const;

export const API_HEADERS = {
  CONTENT_TYPE: 'application/json',
  ACCEPT: 'application/json',
  USER_AGENT: 'ShopApp/1.0.0',
} as const;

export const API_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const API_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;
