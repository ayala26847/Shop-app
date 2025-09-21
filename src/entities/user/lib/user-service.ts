// User service with business logic

import { BaseService } from '../../../shared/services/base-service';
import { IRepository, ICacheService, ILoggerService } from '../../../shared/services/interfaces';
import { User, UserCreateData, UserUpdateData, UserSearchParams, UserProfile } from '../model/types';
import { UserId, Email } from '../../../shared/types/brand';
import { AppError, ValidationError, NotFoundError, ConflictError } from '../../../shared/utils/error-handling';

export class UserService extends BaseService {
  constructor(
    private userRepository: IRepository<User>,
    private cacheService: ICacheService,
    private loggerService: ILoggerService
  ) {
    super('UserService');
  }

  public async getUserById(id: UserId): Promise<User> {
    this.ensureInitialized();
    this.validateRequired(id, 'User ID');

    return this.safeExecute(async () => {
      // Check cache first
      const cacheKey = `user:${id}`;
      const cachedUser = await this.cacheService.get<User>(cacheKey);
      
      if (cachedUser) {
        this.log('debug', 'User retrieved from cache', { id });
        return cachedUser;
      }

      // Fetch from repository
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundError('User', id);
      }

      // Cache the result
      await this.cacheService.set(cacheKey, user, 300000); // 5 minutes
      
      this.log('info', 'User retrieved from repository', { id });
      return user;
    }, 'getUserById');
  }

  public async createUser(userData: UserCreateData): Promise<User> {
    this.ensureInitialized();
    this.validateUserCreateData(userData);

    return this.safeExecute(async () => {
      // Check if user already exists
      const existingUser = await this.findUserByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Create user
      const user = await this.userRepository.create({
        ...userData,
        isEmailVerified: false,
        isPhoneVerified: false,
        isActive: true,
        preferences: {
          language: 'en',
          currency: 'USD',
          timezone: 'UTC',
          theme: 'system',
          notifications: {
            email: true,
            sms: false,
            push: true,
            marketing: false,
            orderUpdates: true,
            priceAlerts: false,
            newProducts: false,
          },
          privacy: {
            profileVisibility: 'private',
            showEmail: false,
            showPhone: false,
            allowDirectMessages: true,
            dataSharing: false,
          },
          ...userData.preferences,
        },
        addresses: [],
        paymentMethods: [],
        roles: [],
        permissions: [],
      });

      // Cache the new user
      const cacheKey = `user:${user.id}`;
      await this.cacheService.set(cacheKey, user, 300000);

      this.log('info', 'User created successfully', { id: user.id, email: user.email });
      return user;
    }, 'createUser');
  }

  public async updateUser(id: UserId, updateData: UserUpdateData): Promise<User> {
    this.ensureInitialized();
    this.validateRequired(id, 'User ID');
    this.validateUserUpdateData(updateData);

    return this.safeExecute(async () => {
      // Check if user exists
      const existingUser = await this.getUserById(id);
      
      // Update user
      const updatedUser = await this.userRepository.update(id, updateData);

      // Update cache
      const cacheKey = `user:${id}`;
      await this.cacheService.set(cacheKey, updatedUser, 300000);

      // Invalidate related caches
      await this.invalidateUserCaches(id);

      this.log('info', 'User updated successfully', { id, updates: Object.keys(updateData) });
      return updatedUser;
    }, 'updateUser');
  }

  public async deleteUser(id: UserId): Promise<void> {
    this.ensureInitialized();
    this.validateRequired(id, 'User ID');

    return this.safeExecute(async () => {
      // Check if user exists
      await this.getUserById(id);

      // Delete user
      await this.userRepository.delete(id);

      // Remove from cache
      const cacheKey = `user:${id}`;
      await this.cacheService.delete(cacheKey);

      // Invalidate related caches
      await this.invalidateUserCaches(id);

      this.log('info', 'User deleted successfully', { id });
    }, 'deleteUser');
  }

  public async searchUsers(params: UserSearchParams): Promise<User[]> {
    this.ensureInitialized();

    return this.safeExecute(async () => {
      const users = await this.userRepository.findAll(params);
      
      this.log('info', 'Users searched', { 
        query: params.query,
        filters: Object.keys(params).length,
        results: users.length 
      });
      
      return users;
    }, 'searchUsers');
  }

  public async getUserProfile(id: UserId): Promise<UserProfile> {
    this.ensureInitialized();
    this.validateRequired(id, 'User ID');

    return this.safeExecute(async () => {
      const user = await this.getUserById(id);
      
      // Get additional profile data
      const [stats, addresses, paymentMethods] = await Promise.all([
        this.getUserStats(id),
        this.getUserAddresses(id),
        this.getUserPaymentMethods(id),
      ]);

      const profile: UserProfile = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        preferences: user.preferences,
        stats,
        addresses,
        paymentMethods,
        roles: user.roles,
        lastLoginAt: user.lastLoginAt,
        memberSince: user.createdAt,
      };

      this.log('info', 'User profile retrieved', { id });
      return profile;
    }, 'getUserProfile');
  }

  public async findUserByEmail(email: Email): Promise<User | null> {
    this.ensureInitialized();
    this.validateRequired(email, 'Email');

    return this.safeExecute(async () => {
      const users = await this.userRepository.findAll({ email });
      return users.length > 0 ? users[0] : null;
    }, 'findUserByEmail');
  }

  public async verifyUserEmail(id: UserId): Promise<void> {
    this.ensureInitialized();
    this.validateRequired(id, 'User ID');

    return this.safeExecute(async () => {
      await this.updateUser(id, { isEmailVerified: true });
      this.log('info', 'User email verified', { id });
    }, 'verifyUserEmail');
  }

  public async verifyUserPhone(id: UserId): Promise<void> {
    this.ensureInitialized();
    this.validateRequired(id, 'User ID');

    return this.safeExecute(async () => {
      await this.updateUser(id, { isPhoneVerified: true });
      this.log('info', 'User phone verified', { id });
    }, 'verifyUserPhone');
  }

  private async getUserStats(id: UserId): Promise<any> {
    // This would typically call a stats service or calculate from orders
    return {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      favoriteCategories: [],
      loyaltyPoints: 0,
      tier: 'bronze',
    };
  }

  private async getUserAddresses(id: UserId): Promise<any[]> {
    // This would typically call an address service
    return [];
  }

  private async getUserPaymentMethods(id: UserId): Promise<any[]> {
    // This would typically call a payment service
    return [];
  }

  private async invalidateUserCaches(id: UserId): Promise<void> {
    const cacheKeys = [
      `user:${id}`,
      `user:profile:${id}`,
      `user:stats:${id}`,
      `user:addresses:${id}`,
      `user:payment-methods:${id}`,
    ];

    await Promise.all(cacheKeys.map(key => this.cacheService.delete(key)));
  }

  private validateUserCreateData(data: UserCreateData): void {
    this.validateRequired(data.email, 'Email');
    this.validateRequired(data.firstName, 'First name');
    this.validateRequired(data.lastName, 'Last name');
    this.validateRequired(data.password, 'Password');

    if (data.password.length < 8) {
      throw new ValidationError('password', 'Password must be at least 8 characters long');
    }

    if (data.phoneNumber && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phoneNumber.replace(/\s/g, ''))) {
      throw new ValidationError('phoneNumber', 'Invalid phone number format');
    }
  }

  private validateUserUpdateData(data: UserUpdateData): void {
    if (data.firstName && data.firstName.trim().length === 0) {
      throw new ValidationError('firstName', 'First name cannot be empty');
    }

    if (data.lastName && data.lastName.trim().length === 0) {
      throw new ValidationError('lastName', 'Last name cannot be empty');
    }

    if (data.phoneNumber && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phoneNumber.replace(/\s/g, ''))) {
      throw new ValidationError('phoneNumber', 'Invalid phone number format');
    }
  }
}
