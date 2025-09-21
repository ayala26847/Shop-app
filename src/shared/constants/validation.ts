// Validation constants

export const VALIDATION_RULES = {
  // Email validation
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address',
  },
  
  // Password validation
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    MESSAGE: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
  },
  
  // Phone number validation
  PHONE: {
    PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
    MESSAGE: 'Please enter a valid phone number',
  },
  
  // Name validation
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s\-']+$/,
    MESSAGE: 'Name must be 2-50 characters long and contain only letters, spaces, hyphens, and apostrophes',
  },
  
  // URL validation
  URL: {
    PATTERN: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    MESSAGE: 'Please enter a valid URL',
  },
  
  // Credit card validation
  CREDIT_CARD: {
    PATTERN: /^[0-9]{13,19}$/,
    MESSAGE: 'Please enter a valid credit card number',
  },
  
  // CVV validation
  CVV: {
    PATTERN: /^[0-9]{3,4}$/,
    MESSAGE: 'Please enter a valid CVV',
  },
  
  // Postal code validation
  POSTAL_CODE: {
    PATTERN: /^[0-9]{5}(-[0-9]{4})?$/,
    MESSAGE: 'Please enter a valid postal code',
  },
  
  // Product SKU validation
  SKU: {
    PATTERN: /^[A-Z0-9\-_]+$/,
    MESSAGE: 'SKU must contain only uppercase letters, numbers, hyphens, and underscores',
  },
  
  // Price validation
  PRICE: {
    MIN: 0,
    MAX: 999999.99,
    DECIMAL_PLACES: 2,
    MESSAGE: 'Price must be between 0 and 999,999.99',
  },
  
  // Quantity validation
  QUANTITY: {
    MIN: 1,
    MAX: 999,
    MESSAGE: 'Quantity must be between 1 and 999',
  },
  
  // Rating validation
  RATING: {
    MIN: 1,
    MAX: 5,
    MESSAGE: 'Rating must be between 1 and 5',
  },
  
  // Review validation
  REVIEW: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000,
    MESSAGE: 'Review must be between 10 and 1000 characters',
  },
  
  // Search query validation
  SEARCH_QUERY: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    MESSAGE: 'Search query must be between 2 and 100 characters',
  },
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PASSWORD: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character',
  CONFIRM_PASSWORD: 'Passwords do not match',
  PHONE: 'Please enter a valid phone number',
  NAME: 'Name must be 2-50 characters long and contain only letters, spaces, hyphens, and apostrophes',
  URL: 'Please enter a valid URL',
  CREDIT_CARD: 'Please enter a valid credit card number',
  CVV: 'Please enter a valid CVV',
  POSTAL_CODE: 'Please enter a valid postal code',
  SKU: 'SKU must contain only uppercase letters, numbers, hyphens, and underscores',
  PRICE: 'Price must be between 0 and 999,999.99',
  QUANTITY: 'Quantity must be between 1 and 999',
  RATING: 'Rating must be between 1 and 5',
  REVIEW: 'Review must be between 10 and 1000 characters',
  SEARCH_QUERY: 'Search query must be between 2 and 100 characters',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters long`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters long`,
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Must be no more than ${max}`,
  PATTERN: 'Please enter a valid format',
  UNIQUE: 'This value is already taken',
  FUTURE_DATE: 'Date must be in the future',
  PAST_DATE: 'Date must be in the past',
  AGE_MIN: (min: number) => `Must be at least ${min} years old`,
  AGE_MAX: (max: number) => `Must be no more than ${max} years old`,
} as const;

export const VALIDATION_SCHEMAS = {
  USER_REGISTRATION: {
    email: {
      required: true,
      pattern: VALIDATION_RULES.EMAIL.PATTERN,
      message: VALIDATION_RULES.EMAIL.MESSAGE,
    },
    password: {
      required: true,
      minLength: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
      pattern: VALIDATION_RULES.PASSWORD.PATTERN,
      message: VALIDATION_RULES.PASSWORD.MESSAGE,
    },
    confirmPassword: {
      required: true,
      match: 'password',
      message: VALIDATION_MESSAGES.CONFIRM_PASSWORD,
    },
    firstName: {
      required: true,
      minLength: VALIDATION_RULES.NAME.MIN_LENGTH,
      maxLength: VALIDATION_RULES.NAME.MAX_LENGTH,
      pattern: VALIDATION_RULES.NAME.PATTERN,
      message: VALIDATION_RULES.NAME.MESSAGE,
    },
    lastName: {
      required: true,
      minLength: VALIDATION_RULES.NAME.MIN_LENGTH,
      maxLength: VALIDATION_RULES.NAME.MAX_LENGTH,
      pattern: VALIDATION_RULES.NAME.PATTERN,
      message: VALIDATION_RULES.NAME.MESSAGE,
    },
  },
  
  USER_LOGIN: {
    email: {
      required: true,
      pattern: VALIDATION_RULES.EMAIL.PATTERN,
      message: VALIDATION_RULES.EMAIL.MESSAGE,
    },
    password: {
      required: true,
      message: VALIDATION_MESSAGES.REQUIRED,
    },
  },
  
  PRODUCT_CREATE: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 100,
      message: 'Product name must be between 2 and 100 characters',
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 1000,
      message: 'Product description must be between 10 and 1000 characters',
    },
    sku: {
      required: true,
      pattern: VALIDATION_RULES.SKU.PATTERN,
      message: VALIDATION_RULES.SKU.MESSAGE,
    },
    price: {
      required: true,
      min: VALIDATION_RULES.PRICE.MIN,
      max: VALIDATION_RULES.PRICE.MAX,
      message: VALIDATION_RULES.PRICE.MESSAGE,
    },
    categoryId: {
      required: true,
      message: 'Please select a category',
    },
  },
  
  CART_ITEM: {
    productId: {
      required: true,
      message: 'Product ID is required',
    },
    quantity: {
      required: true,
      min: VALIDATION_RULES.QUANTITY.MIN,
      max: VALIDATION_RULES.QUANTITY.MAX,
      message: VALIDATION_RULES.QUANTITY.MESSAGE,
    },
  },
  
  ORDER_CREATE: {
    shippingAddress: {
      required: true,
      message: 'Shipping address is required',
    },
    billingAddress: {
      required: true,
      message: 'Billing address is required',
    },
    paymentMethod: {
      required: true,
      message: 'Payment method is required',
    },
  },
  
  REVIEW_CREATE: {
    productId: {
      required: true,
      message: 'Product ID is required',
    },
    rating: {
      required: true,
      min: VALIDATION_RULES.RATING.MIN,
      max: VALIDATION_RULES.RATING.MAX,
      message: VALIDATION_RULES.RATING.MESSAGE,
    },
    content: {
      required: true,
      minLength: VALIDATION_RULES.REVIEW.MIN_LENGTH,
      maxLength: VALIDATION_RULES.REVIEW.MAX_LENGTH,
      message: VALIDATION_RULES.REVIEW.MESSAGE,
    },
  },
} as const;
