// Storage constants

export const STORAGE_KEYS = {
  // Authentication
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  AUTH_STATE: 'auth_state',
  
  // User preferences
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  CURRENCY: 'currency',
  TIMEZONE: 'timezone',
  
  // Shopping
  CART: 'cart',
  WISHLIST: 'wishlist',
  RECENT_PRODUCTS: 'recent_products',
  SEARCH_HISTORY: 'search_history',
  
  // Forms
  FORM_DATA: 'form_data',
  CHECKOUT_DATA: 'checkout_data',
  CONTACT_FORM: 'contact_form',
  NEWSLETTER_FORM: 'newsletter_form',
  
  // UI State
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  DARK_MODE: 'dark_mode',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  SOUND_ENABLED: 'sound_enabled',
  
  // Analytics
  ANALYTICS_ID: 'analytics_id',
  SESSION_ID: 'session_id',
  USER_ID: 'user_id',
  
  // Cache
  API_CACHE: 'api_cache',
  PRODUCT_CACHE: 'product_cache',
  CATEGORY_CACHE: 'category_cache',
  
  // Settings
  APP_SETTINGS: 'app_settings',
  PRIVACY_SETTINGS: 'privacy_settings',
  NOTIFICATION_SETTINGS: 'notification_settings',
} as const;

export const STORAGE_TYPES = {
  LOCAL: 'localStorage',
  SESSION: 'sessionStorage',
  MEMORY: 'memory',
} as const;

export const STORAGE_OPTIONS = {
  // Default options
  DEFAULT: {
    enableToast: false,
    enableAnnouncements: false,
    enableSync: false,
  },
  
  // Authentication options
  AUTH: {
    enableToast: true,
    enableAnnouncements: true,
    enableSync: true,
  },
  
  // Shopping options
  SHOPPING: {
    enableToast: true,
    enableAnnouncements: true,
    enableSync: true,
  },
  
  // Form options
  FORM: {
    enableToast: false,
    enableAnnouncements: false,
    enableSync: false,
  },
  
  // UI options
  UI: {
    enableToast: false,
    enableAnnouncements: false,
    enableSync: true,
  },
} as const;

export const STORAGE_LIMITS = {
  LOCAL_STORAGE: 5 * 1024 * 1024, // 5MB
  SESSION_STORAGE: 5 * 1024 * 1024, // 5MB
  MEMORY_STORAGE: 50 * 1024 * 1024, // 50MB
} as const;

export const STORAGE_EXPIRY = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 30 * 60 * 1000,    // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
  VERY_LONG: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

export const STORAGE_PREFIXES = {
  CACHE: 'cache_',
  TEMP: 'temp_',
  USER: 'user_',
  SESSION: 'session_',
} as const;

export const STORAGE_ENCRYPTION = {
  ENABLED: true,
  ALGORITHM: 'AES-GCM',
  KEY_LENGTH: 256,
} as const;

export const STORAGE_COMPRESSION = {
  ENABLED: true,
  THRESHOLD: 1024, // 1KB
  ALGORITHM: 'gzip',
} as const;

export const STORAGE_SYNC = {
  ENABLED: true,
  INTERVAL: 1000, // 1 second
  BATCH_SIZE: 10,
} as const;
