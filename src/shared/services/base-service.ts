// Base service class with common functionality

import { IService, IServiceLifecycle } from './interfaces';

export abstract class BaseService implements IService, IServiceLifecycle {
  public readonly name: string;
  private _initialized: boolean = false;
  private _initializing: boolean = false;

  constructor(name: string) {
    this.name = name;
  }

  public async initialize(): Promise<void> {
    if (this._initialized) {
      return;
    }

    if (this._initializing) {
      throw new Error(`Service ${this.name} is already being initialized`);
    }

    this._initializing = true;

    try {
      await this.onInit?.();
      this._initialized = true;
    } catch (error) {
      this.onError?.(error as Error);
      throw error;
    } finally {
      this._initializing = false;
    }
  }

  public async destroy(): Promise<void> {
    if (!this._initialized) {
      return;
    }

    try {
      await this.onDestroy?.();
    } catch (error) {
      this.onError?.(error as Error);
      throw error;
    } finally {
      this._initialized = false;
    }
  }

  public isInitialized(): boolean {
    return this._initialized;
  }

  protected ensureInitialized(): void {
    if (!this._initialized) {
      throw new Error(`Service ${this.name} is not initialized`);
    }
  }

  protected async safeExecute<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const contextMessage = context ? ` in ${context}` : '';
      const enhancedError = new Error(
        `Service ${this.name} error${contextMessage}: ${(error as Error).message}`
      );
      this.onError?.(enhancedError);
      throw enhancedError;
    }
  }

  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.name}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'debug':
        console.debug(logMessage, data);
        break;
      case 'info':
        console.info(logMessage, data);
        break;
      case 'warn':
        console.warn(logMessage, data);
        break;
      case 'error':
        console.error(logMessage, data);
        break;
    }
  }

  protected createError(message: string, code?: string, details?: any): Error {
    const error = new Error(message);
    if (code) {
      (error as any).code = code;
    }
    if (details) {
      (error as any).details = details;
    }
    return error;
  }

  protected validateRequired(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw this.createError(`${fieldName} is required`, 'VALIDATION_ERROR');
    }
  }

  protected validateType(value: any, expectedType: string, fieldName: string): void {
    const actualType = typeof value;
    if (actualType !== expectedType) {
      throw this.createError(
        `${fieldName} must be of type ${expectedType}, got ${actualType}`,
        'TYPE_ERROR'
      );
    }
  }

  protected validateRange(
    value: number,
    min: number,
    max: number,
    fieldName: string
  ): void {
    if (value < min || value > max) {
      throw this.createError(
        `${fieldName} must be between ${min} and ${max}, got ${value}`,
        'RANGE_ERROR'
      );
    }
  }

  protected validatePattern(
    value: string,
    pattern: RegExp,
    fieldName: string,
    errorMessage?: string
  ): void {
    if (!pattern.test(value)) {
      throw this.createError(
        errorMessage || `${fieldName} format is invalid`,
        'PATTERN_ERROR'
      );
    }
  }

  protected async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        this.log('warn', `Attempt ${attempt} failed, retrying in ${delay}ms`, {
          error: lastError.message,
          attempt,
          maxAttempts
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
    
    throw lastError!;
  }

  protected debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T {
    let timeout: NodeJS.Timeout;
    
    return ((...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }) as T;
  }

  protected throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T {
    let inThrottle: boolean;
    
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  }
}
