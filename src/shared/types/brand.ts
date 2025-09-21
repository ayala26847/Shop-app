// Brand types for type safety and preventing ID confusion

// Brand types for different entity IDs
export type UserId = string & { readonly __brand: 'UserId' };
export type ProductId = string & { readonly __brand: 'ProductId' };
export type CategoryId = string & { readonly __brand: 'CategoryId' };
export type OrderId = string & { readonly __brand: 'OrderId' };
export type CartId = string & { readonly __brand: 'CartId' };
export type CartItemId = string & { readonly __brand: 'CartItemId' };
export type ReviewId = string & { readonly __brand: 'ReviewId' };
export type AddressId = string & { readonly __brand: 'AddressId' };
export type PaymentId = string & { readonly __brand: 'PaymentId' };

// Brand types for sensitive data
export type Email = string & { readonly __brand: 'Email' };
export type PhoneNumber = string & { readonly __brand: 'PhoneNumber' };
export type Password = string & { readonly __brand: 'Password' };
export type CreditCardNumber = string & { readonly __brand: 'CreditCardNumber' };
export type CVV = string & { readonly __brand: 'CVV' };

// Brand types for monetary values
export type Price = number & { readonly __brand: 'Price' };
export type Currency = string & { readonly __brand: 'Currency' };
export type Percentage = number & { readonly __brand: 'Percentage' };

// Brand types for measurements
export type Weight = number & { readonly __brand: 'Weight' };
export type Volume = number & { readonly __brand: 'Volume' };
export type Dimension = number & { readonly __brand: 'Dimension' };

// Brand types for time
export type Timestamp = number & { readonly __brand: 'Timestamp' };
export type Duration = number & { readonly __brand: 'Duration' };

// Brand types for URLs and paths
export type URL = string & { readonly __brand: 'URL' };
export type Path = string & { readonly __brand: 'Path' };
export type Slug = string & { readonly __brand: 'Slug' };

// Brand types for validation
export type Validated<T> = T & { readonly __brand: 'Validated' };
export type Sanitized<T> = T & { readonly __brand: 'Sanitized' };

// Utility types for brand type creation
export type Brand<T, B> = T & { readonly __brand: B };

// Type guards for brand types
export const isUserId = (id: string): id is UserId => 
  typeof id === 'string' && id.length > 0;

export const isProductId = (id: string): id is ProductId => 
  typeof id === 'string' && id.length > 0;

export const isEmail = (email: string): email is Email => 
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isPhoneNumber = (phone: string): phone is PhoneNumber => 
  /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/\s/g, ''));

export const isPrice = (value: number): value is Price => 
  typeof value === 'number' && value >= 0;

export const isURL = (url: string): url is URL => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Brand type constructors
export const createUserId = (id: string): UserId => id as UserId;
export const createProductId = (id: string): ProductId => id as ProductId;
export const createEmail = (email: string): Email => email as Email;
export const createPrice = (value: number): Price => value as Price;
export const createURL = (url: string): URL => url as URL;
