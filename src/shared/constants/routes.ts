// Route constants

export const ROUTES = {
  // Public routes
  HOME: '/',
  ABOUT: '/about',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: '/categories/:slug',
  SEARCH: '/search',
  CONTACT: '/contact',
  
  // Authentication routes
  SIGN_IN: '/auth/signin',
  SIGN_UP: '/auth/signup',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  
  // User routes
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  PROFILE_ORDERS: '/profile/orders',
  PROFILE_ADDRESSES: '/profile/addresses',
  PROFILE_PAYMENT_METHODS: '/profile/payment-methods',
  PROFILE_WISHLIST: '/profile/wishlist',
  PROFILE_SETTINGS: '/profile/settings',
  
  // Shopping routes
  CART: '/cart',
  CHECKOUT: '/checkout',
  CHECKOUT_SHIPPING: '/checkout/shipping',
  CHECKOUT_BILLING: '/checkout/billing',
  CHECKOUT_PAYMENT: '/checkout/payment',
  CHECKOUT_REVIEW: '/checkout/review',
  CHECKOUT_SUCCESS: '/checkout/success',
  CHECKOUT_CANCELLED: '/checkout/cancelled',
  
  // Order routes
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  ORDER_TRACKING: '/orders/:id/tracking',
  
  // Admin routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCT_CREATE: '/admin/products/create',
  ADMIN_PRODUCT_EDIT: '/admin/products/:id/edit',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_ORDER_DETAIL: '/admin/orders/:id',
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_DETAIL: '/admin/users/:id',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  
  // Error routes
  NOT_FOUND: '/404',
  SERVER_ERROR: '/500',
  UNAUTHORIZED: '/401',
  FORBIDDEN: '/403',
} as const;

export const PROTECTED_ROUTES = [
  ROUTES.PROFILE,
  ROUTES.PROFILE_EDIT,
  ROUTES.PROFILE_ORDERS,
  ROUTES.PROFILE_ADDRESSES,
  ROUTES.PROFILE_PAYMENT_METHODS,
  ROUTES.PROFILE_WISHLIST,
  ROUTES.PROFILE_SETTINGS,
  ROUTES.CHECKOUT,
  ROUTES.CHECKOUT_SHIPPING,
  ROUTES.CHECKOUT_BILLING,
  ROUTES.CHECKOUT_PAYMENT,
  ROUTES.CHECKOUT_REVIEW,
  ROUTES.CHECKOUT_SUCCESS,
  ROUTES.ORDERS,
  ROUTES.ORDER_DETAIL,
  ROUTES.ORDER_TRACKING,
] as const;

export const ADMIN_ROUTES = [
  ROUTES.ADMIN,
  ROUTES.ADMIN_DASHBOARD,
  ROUTES.ADMIN_PRODUCTS,
  ROUTES.ADMIN_PRODUCT_CREATE,
  ROUTES.ADMIN_PRODUCT_EDIT,
  ROUTES.ADMIN_CATEGORIES,
  ROUTES.ADMIN_ORDERS,
  ROUTES.ADMIN_ORDER_DETAIL,
  ROUTES.ADMIN_USERS,
  ROUTES.ADMIN_USER_DETAIL,
  ROUTES.ADMIN_ANALYTICS,
  ROUTES.ADMIN_SETTINGS,
] as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.ABOUT,
  ROUTES.PRODUCTS,
  ROUTES.PRODUCT_DETAIL,
  ROUTES.CATEGORIES,
  ROUTES.CATEGORY_DETAIL,
  ROUTES.SEARCH,
  ROUTES.CONTACT,
  ROUTES.SIGN_IN,
  ROUTES.SIGN_UP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_EMAIL,
] as const;

export const AUTH_ROUTES = [
  ROUTES.SIGN_IN,
  ROUTES.SIGN_UP,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_EMAIL,
] as const;

export const SHOPPING_ROUTES = [
  ROUTES.CART,
  ROUTES.CHECKOUT,
  ROUTES.CHECKOUT_SHIPPING,
  ROUTES.CHECKOUT_BILLING,
  ROUTES.CHECKOUT_PAYMENT,
  ROUTES.CHECKOUT_REVIEW,
  ROUTES.CHECKOUT_SUCCESS,
  ROUTES.CHECKOUT_CANCELLED,
] as const;

export const ERROR_ROUTES = [
  ROUTES.NOT_FOUND,
  ROUTES.SERVER_ERROR,
  ROUTES.UNAUTHORIZED,
  ROUTES.FORBIDDEN,
] as const;
