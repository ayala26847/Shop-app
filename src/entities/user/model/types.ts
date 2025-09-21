// User entity types and interfaces

import { BaseEntity } from '../../../shared/types/common';
import { UserId, Email, PhoneNumber } from '../../../shared/types/brand';

export interface User extends BaseEntity {
  id: UserId;
  email: Email;
  firstName: string;
  lastName: string;
  phoneNumber?: PhoneNumber;
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  preferences: UserPreferences;
  addresses: UserAddress[];
  paymentMethods: PaymentMethod[];
  roles: UserRole[];
  permissions: Permission[];
  lastLoginAt?: string;
  isActive: boolean;
}

export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  orderUpdates: boolean;
  priceAlerts: boolean;
  newProducts: boolean;
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  allowDirectMessages: boolean;
  dataSharing: boolean;
}

export interface UserAddress extends BaseEntity {
  id: string;
  userId: UserId;
  type: 'billing' | 'shipping';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: PhoneNumber;
  isDefault: boolean;
}

export interface PaymentMethod extends BaseEntity {
  id: string;
  userId: UserId;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  provider: string;
  lastFourDigits: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface UserSession {
  id: string;
  userId: UserId;
  token: string;
  refreshToken: string;
  expiresAt: string;
  createdAt: string;
  lastActivityAt: string;
  userAgent?: string;
  ipAddress?: string;
  isActive: boolean;
}

export interface UserActivity {
  id: string;
  userId: UserId;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  favoriteCategories: string[];
  lastOrderDate?: string;
  memberSince: string;
  loyaltyPoints: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface UserSearchParams {
  query?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  roles?: string[];
  createdAfter?: string;
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
}

export interface UserCreateData {
  email: Email;
  firstName: string;
  lastName: string;
  phoneNumber?: PhoneNumber;
  password: string;
  preferences?: Partial<UserPreferences>;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: PhoneNumber;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
  isActive?: boolean;
}

export interface UserLoginCredentials {
  email: Email;
  password: string;
  rememberMe?: boolean;
}

export interface UserRegistrationData {
  email: Email;
  firstName: string;
  lastName: string;
  phoneNumber?: PhoneNumber;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
}

export interface UserPasswordReset {
  email: Email;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserEmailVerification {
  email: Email;
  token: string;
}

export interface UserPhoneVerification {
  phoneNumber: PhoneNumber;
  code: string;
}

export interface UserProfile {
  id: UserId;
  email: Email;
  firstName: string;
  lastName: string;
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  preferences: UserPreferences;
  stats: UserStats;
  addresses: UserAddress[];
  paymentMethods: PaymentMethod[];
  roles: UserRole[];
  lastLoginAt?: string;
  memberSince: string;
}
