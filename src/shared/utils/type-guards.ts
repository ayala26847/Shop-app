// Type guard utilities for runtime type checking

import { 
  UserId, 
  ProductId, 
  Email, 
  PhoneNumber, 
  Price, 
  URL,
  isUserId,
  isProductId,
  isEmail,
  isPhoneNumber,
  isPrice,
  isURL
} from '../types/brand';

// Basic type guards
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isNumber = (value: unknown): value is number => typeof value === 'number';
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isObject = (value: unknown): value is Record<string, unknown> => 
  value !== null && typeof value === 'object' && !Array.isArray(value);
export const isArray = (value: unknown): value is unknown[] => Array.isArray(value);
export const isFunction = (value: unknown): value is Function => typeof value === 'function';
export const isDate = (value: unknown): value is Date => value instanceof Date;
export const isRegExp = (value: unknown): value is RegExp => value instanceof RegExp;
export const isError = (value: unknown): value is Error => value instanceof Error;

// Null/undefined checks
export const isNull = (value: unknown): value is null => value === null;
export const isUndefined = (value: unknown): value is undefined => value === undefined;
export const isNullish = (value: unknown): value is null | undefined => value == null;
export const isNotNullish = <T>(value: T | null | undefined): value is T => value != null;

// String type guards
export const isNonEmptyString = (value: unknown): value is string => 
  isString(value) && value.length > 0;
export const isEmailString = (value: unknown): value is string => 
  isString(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const isPhoneString = (value: unknown): value is string => 
  isString(value) && /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''));
export const isURLString = (value: unknown): value is string => {
  if (!isString(value)) return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

// Number type guards
export const isPositiveNumber = (value: unknown): value is number => 
  isNumber(value) && value > 0;
export const isNonNegativeNumber = (value: unknown): value is number => 
  isNumber(value) && value >= 0;
export const isInteger = (value: unknown): value is number => 
  isNumber(value) && Number.isInteger(value);
export const isPositiveInteger = (value: unknown): value is number => 
  isInteger(value) && value > 0;
export const isNonNegativeInteger = (value: unknown): value is number => 
  isInteger(value) && value >= 0;

// Array type guards
export const isNonEmptyArray = <T>(value: unknown): value is T[] => 
  isArray(value) && value.length > 0;
export const isArrayOf = <T>(value: unknown, predicate: (item: unknown) => item is T): value is T[] => 
  isArray(value) && value.every(predicate);

// Object type guards
export const hasProperty = <K extends string>(
  value: unknown,
  key: K
): value is Record<K, unknown> => isObject(value) && key in value;

export const hasProperties = <K extends string>(
  value: unknown,
  keys: K[]
): value is Record<K, unknown> => 
  isObject(value) && keys.every(key => key in value);

// Brand type guards (re-exported for convenience)
export {
  isUserId,
  isProductId,
  isEmail,
  isPhoneNumber,
  isPrice,
  isURL
};

// Complex type guards
export const isApiResponse = (value: unknown): value is { data: unknown; success: boolean } => 
  isObject(value) && 
  'data' in value && 
  'success' in value && 
  isBoolean(value.success);

export const isPaginatedResponse = (value: unknown): value is { 
  data: unknown[]; 
  pagination: { page: number; limit: number; total: number } 
} => 
  isObject(value) && 
  'data' in value && 
  'pagination' in value &&
  isArray(value.data) &&
  isObject(value.pagination) &&
  hasProperties(value.pagination, ['page', 'limit', 'total']);

export const isErrorObject = (value: unknown): value is { 
  message: string; 
  code?: string; 
  stack?: string 
} => 
  isObject(value) && 
  'message' in value && 
  isString(value.message);

// Utility type guards
export const isPromise = <T>(value: unknown): value is Promise<T> => 
  isObject(value) && 'then' in value && isFunction(value.then);

export const isAsyncFunction = (value: unknown): value is (...args: any[]) => Promise<any> => 
  isFunction(value) && value.constructor.name === 'AsyncFunction';

// Type narrowing utilities
export const assertIsString = (value: unknown): asserts value is string => {
  if (!isString(value)) {
    throw new Error(`Expected string, got ${typeof value}`);
  }
};

export const assertIsNumber = (value: unknown): asserts value is number => {
  if (!isNumber(value)) {
    throw new Error(`Expected number, got ${typeof value}`);
  }
};

export const assertIsObject = (value: unknown): asserts value is Record<string, unknown> => {
  if (!isObject(value)) {
    throw new Error(`Expected object, got ${typeof value}`);
  }
};

export const assertIsArray = (value: unknown): asserts value is unknown[] => {
  if (!isArray(value)) {
    throw new Error(`Expected array, got ${typeof value}`);
  }
};

// Safe type casting
export const asString = (value: unknown): string => {
  if (isString(value)) return value;
  if (isNumber(value)) return value.toString();
  if (isBoolean(value)) return value.toString();
  return String(value);
};

export const asNumber = (value: unknown): number => {
  if (isNumber(value)) return value;
  if (isString(value)) {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
};

export const asBoolean = (value: unknown): boolean => {
  if (isBoolean(value)) return value;
  if (isString(value)) return value.toLowerCase() === 'true';
  if (isNumber(value)) return value !== 0;
  return Boolean(value);
};
