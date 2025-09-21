// Error handling utilities and error classes

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, any>;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string = 'APP_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly field: string;
  public readonly value: any;

  constructor(field: string, message: string, value?: any) {
    super(message, 'VALIDATION_ERROR', 400);
    this.field = field;
    this.value = value;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message, 'NOT_FOUND_ERROR', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'CONFLICT_ERROR', 409, true, details);
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter: number;

  constructor(message: string = 'Rate limit exceeded', retryAfter: number = 60) {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.retryAfter = retryAfter;
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 'NETWORK_ERROR', 0, false);
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'Request timeout') {
    super(message, 'TIMEOUT_ERROR', 408, false);
  }
}

// Error type guards
export const isAppError = (error: unknown): error is AppError => 
  error instanceof AppError;

export const isValidationError = (error: unknown): error is ValidationError => 
  error instanceof ValidationError;

export const isAuthenticationError = (error: unknown): error is AuthenticationError => 
  error instanceof AuthenticationError;

export const isAuthorizationError = (error: unknown): error is AuthorizationError => 
  error instanceof AuthorizationError;

export const isNotFoundError = (error: unknown): error is NotFoundError => 
  error instanceof NotFoundError;

export const isConflictError = (error: unknown): error is ConflictError => 
  error instanceof ConflictError;

export const isRateLimitError = (error: unknown): error is RateLimitError => 
  error instanceof RateLimitError;

export const isNetworkError = (error: unknown): error is NetworkError => 
  error instanceof NetworkError;

export const isTimeoutError = (error: unknown): error is TimeoutError => 
  error instanceof TimeoutError;

// Error handling utilities
export const createError = (
  message: string,
  code: string = 'UNKNOWN_ERROR',
  statusCode: number = 500,
  details?: Record<string, any>
): AppError => new AppError(message, code, statusCode, true, details);

export const createValidationError = (field: string, message: string, value?: any): ValidationError => 
  new ValidationError(field, message, value);

export const createNotFoundError = (resource: string, id?: string): NotFoundError => 
  new NotFoundError(resource, id);

export const createConflictError = (message: string, details?: Record<string, any>): ConflictError => 
  new ConflictError(message, details);

// Error formatting
export const formatError = (error: unknown): string => {
  if (isAppError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unknown error occurred';
};

export const formatErrorForUser = (error: unknown): string => {
  if (isAppError(error) && error.isOperational) {
    return error.message;
  }
  
  if (isNetworkError(error)) {
    return 'Network connection issue. Please check your internet connection.';
  }
  
  if (isTimeoutError(error)) {
    return 'Request timed out. Please try again.';
  }
  
  if (isRateLimitError(error)) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  return 'Something went wrong. Please try again.';
};

// Error logging
export const logError = (error: unknown, context?: Record<string, any>): void => {
  const errorInfo = {
    message: formatError(error),
    code: isAppError(error) ? error.code : 'UNKNOWN',
    statusCode: isAppError(error) ? error.statusCode : 500,
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  };
  
  console.error('Application Error:', errorInfo);
};

// Error recovery
export const isRecoverableError = (error: unknown): boolean => {
  if (isAppError(error)) {
    return error.isOperational && error.statusCode < 500;
  }
  
  if (isNetworkError(error) || isTimeoutError(error)) {
    return true;
  }
  
  return false;
};

export const shouldRetry = (error: unknown, attempt: number, maxAttempts: number = 3): boolean => {
  if (attempt >= maxAttempts) return false;
  
  if (isNetworkError(error) || isTimeoutError(error)) {
    return true;
  }
  
  if (isAppError(error)) {
    return error.statusCode >= 500;
  }
  
  return false;
};

// Error aggregation
export class AggregateError extends AppError {
  public readonly errors: Error[];

  constructor(errors: Error[], message: string = 'Multiple errors occurred') {
    super(message, 'AGGREGATE_ERROR', 500);
    this.errors = errors;
  }
}

export const aggregateErrors = (errors: Error[]): AggregateError => 
  new AggregateError(errors);

// Error boundary utilities
export const getErrorBoundaryMessage = (error: unknown): string => {
  if (isAppError(error)) {
    return `Error: ${error.message}`;
  }
  
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  
  return 'An unexpected error occurred';
};

export const getErrorBoundaryStack = (error: unknown): string | undefined => {
  if (error instanceof Error) {
    return error.stack;
  }
  
  return undefined;
};
