// API-related types and interfaces

import { BaseEntity, PaginationParams, SortParams, FilterParams, SearchParams } from './common';

export interface ApiEndpoint {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiRequest<T = any> {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: T;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface PaginatedApiRequest extends PaginationParams {
  sort?: SortParams;
  filters?: FilterParams;
  search?: SearchParams;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
  statusCode?: number;
}

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers: Record<string, string>;
}

export interface CacheStrategy {
  ttl: number;
  staleTime: number;
  refetchOnMount: boolean;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
}

export interface QueryConfig {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  retry?: boolean | number;
  retryDelay?: number;
}

export interface MutationConfig {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  onSettled?: (data: any, error: ApiError) => void;
  retry?: boolean | number;
  retryDelay?: number;
}

export interface ApiClient {
  get<T>(endpoint: string, config?: QueryConfig): Promise<ApiResponse<T>>;
  post<T>(endpoint: string, data?: any, config?: MutationConfig): Promise<ApiResponse<T>>;
  put<T>(endpoint: string, data?: any, config?: MutationConfig): Promise<ApiResponse<T>>;
  patch<T>(endpoint: string, data?: any, config?: MutationConfig): Promise<ApiResponse<T>>;
  delete<T>(endpoint: string, config?: MutationConfig): Promise<ApiResponse<T>>;
}

export interface ApiRepository<T extends BaseEntity> {
  findAll(params?: PaginatedApiRequest): Promise<ApiResponse<T[]>>;
  findById(id: string): Promise<ApiResponse<T>>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<T>>;
  update(id: string, data: Partial<T>): Promise<ApiResponse<T>>;
  delete(id: string): Promise<ApiResponse<void>>;
  search(params: SearchParams): Promise<ApiResponse<T[]>>;
}

export interface ApiService {
  client: ApiClient;
  config: ApiConfig;
  cache: CacheStrategy;
}

export interface RequestInterceptor {
  onRequest?: (config: ApiRequest) => ApiRequest | Promise<ApiRequest>;
  onRequestError?: (error: any) => Promise<any>;
}

export interface ResponseInterceptor {
  onResponse?: (response: ApiResponse) => ApiResponse | Promise<ApiResponse>;
  onResponseError?: (error: ApiError) => Promise<ApiError>;
}

export interface ApiMiddleware {
  request: RequestInterceptor;
  response: ResponseInterceptor;
}

export interface ApiCache {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttl?: number): void;
  delete(key: string): void;
  clear(): void;
  has(key: string): boolean;
}

export interface ApiLogger {
  log: (level: 'info' | 'warn' | 'error', message: string, data?: any) => void;
  request: (request: ApiRequest) => void;
  response: (response: ApiResponse) => void;
  error: (error: ApiError) => void;
}
