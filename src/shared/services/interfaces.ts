// Service layer interfaces and contracts

import { BaseEntity } from '../types/common';

// Base service interface
export interface IService {
  readonly name: string;
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  isInitialized(): boolean;
}

// Repository interface
export interface IRepository<T extends BaseEntity> {
  findAll(params?: any): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  count(params?: any): Promise<number>;
}

// Cache service interface
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  keys(pattern?: string): Promise<string[]>;
}

// Storage service interface
export interface IStorageService {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

// API service interface
export interface IApiService {
  get<T>(endpoint: string, config?: any): Promise<T>;
  post<T>(endpoint: string, data?: any, config?: any): Promise<T>;
  put<T>(endpoint: string, data?: any, config?: any): Promise<T>;
  patch<T>(endpoint: string, data?: any, config?: any): Promise<T>;
  delete<T>(endpoint: string, config?: any): Promise<T>;
}

// Event service interface
export interface IEventService {
  emit(event: string, data?: any): void;
  on(event: string, handler: (data?: any) => void): () => void;
  off(event: string, handler: (data?: any) => void): void;
  once(event: string, handler: (data?: any) => void): void;
}

// Logger service interface
export interface ILoggerService {
  debug(message: string, data?: any): void;
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void;
}

// Validation service interface
export interface IValidationService {
  validate<T>(schema: any, data: T): Promise<{ isValid: boolean; errors: string[] }>;
  validateField<T>(schema: any, field: keyof T, value: T[keyof T]): Promise<{ isValid: boolean; error?: string }>;
  registerSchema(name: string, schema: any): void;
  unregisterSchema(name: string): void;
}

// Notification service interface
export interface INotificationService {
  success(message: string, options?: any): void;
  error(message: string, options?: any): void;
  warning(message: string, options?: any): void;
  info(message: string, options?: any): void;
  show(message: string, type: 'success' | 'error' | 'warning' | 'info', options?: any): void;
}

// Analytics service interface
export interface IAnalyticsService {
  track(event: string, properties?: Record<string, any>): void;
  identify(userId: string, traits?: Record<string, any>): void;
  page(name: string, properties?: Record<string, any>): void;
  group(groupId: string, traits?: Record<string, any>): void;
}

// Authentication service interface
export interface IAuthService {
  login(credentials: any): Promise<any>;
  logout(): Promise<void>;
  register(userData: any): Promise<any>;
  refreshToken(): Promise<string>;
  getCurrentUser(): Promise<any | null>;
  isAuthenticated(): boolean;
  hasPermission(permission: string): boolean;
  hasRole(role: string): boolean;
}

// File service interface
export interface IFileService {
  upload(file: File, options?: any): Promise<string>;
  download(url: string, options?: any): Promise<Blob>;
  delete(url: string): Promise<void>;
  getUrl(path: string): string;
}

// Configuration service interface
export interface IConfigService {
  get<T>(key: string, defaultValue?: T): T;
  set(key: string, value: any): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
  getAll(): Record<string, any>;
}

// Service factory interface
export interface IServiceFactory {
  create<T>(serviceType: new (...args: any[]) => T, ...args: any[]): T;
  register<T>(name: string, serviceType: new (...args: any[]) => T): void;
  unregister(name: string): void;
  has(name: string): boolean;
  get<T>(name: string): T | null;
}

// Service container interface
export interface IServiceContainer {
  register<T>(name: string, service: T): void;
  registerFactory<T>(name: string, factory: () => T): void;
  get<T>(name: string): T;
  has(name: string): boolean;
  remove(name: string): void;
  clear(): void;
  keys(): string[];
}

// Service lifecycle interface
export interface IServiceLifecycle {
  onInit?(): Promise<void>;
  onDestroy?(): Promise<void>;
  onError?(error: Error): void;
}

// Service metadata interface
export interface IServiceMetadata {
  name: string;
  version: string;
  dependencies: string[];
  singleton: boolean;
  lazy: boolean;
}
