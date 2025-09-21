// Unit tests for UserService

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserService } from '../../../entities/user/lib/user-service';
import { IRepository, ICacheService, ILoggerService } from '../../../shared/services/interfaces';
import { User, UserCreateData, UserUpdateData } from '../../../entities/user/model/types';
import { UserId, Email } from '../../../shared/types/brand';
import { NotFoundError, ConflictError, ValidationError } from '../../../shared/utils/error-handling';

// Mock dependencies
const mockUserRepository: IRepository<User> = {
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  exists: vi.fn(),
  count: vi.fn(),
};

const mockCacheService: ICacheService = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  has: vi.fn(),
  keys: vi.fn(),
};

const mockLoggerService: ILoggerService = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  log: vi.fn(),
};

describe('UserService', () => {
  let userService: UserService;
  let mockUser: User;

  beforeEach(() => {
    vi.clearAllMocks();
    
    userService = new UserService(
      mockUserRepository,
      mockCacheService,
      mockLoggerService
    );

    mockUser = {
      id: 'user-1' as UserId,
      email: 'test@example.com' as Email,
      firstName: 'Test',
      lastName: 'User',
      isEmailVerified: true,
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
      },
      addresses: [],
      paymentMethods: [],
      roles: [],
      permissions: [],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    // Initialize service
    userService.initialize();
  });

  afterEach(() => {
    userService.destroy();
  });

  describe('getUserById', () => {
    it('should return user from cache if available', async () => {
      // Arrange
      const userId = 'user-1' as UserId;
      mockCacheService.get.mockResolvedValue(mockUser);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockCacheService.get).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('should fetch user from repository if not in cache', async () => {
      // Arrange
      const userId = 'user-1' as UserId;
      mockCacheService.get.mockResolvedValue(null);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockCacheService.set.mockResolvedValue(undefined);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockCacheService.set).toHaveBeenCalledWith(`user:${userId}`, mockUser, 300000);
    });

    it('should throw NotFoundError if user does not exist', async () => {
      // Arrange
      const userId = 'user-1' as UserId;
      mockCacheService.get.mockResolvedValue(null);
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById(userId)).rejects.toThrow(NotFoundError);
    });

    it('should throw error if user ID is not provided', async () => {
      // Act & Assert
      await expect(userService.getUserById('' as UserId)).rejects.toThrow('User ID is required');
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      const userData: UserCreateData = {
        email: 'newuser@example.com' as Email,
        firstName: 'New',
        lastName: 'User',
        password: 'password123',
      };

      mockUserRepository.findAll.mockResolvedValue([]); // No existing user
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockCacheService.set.mockResolvedValue(undefined);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          isEmailVerified: false,
          isPhoneVerified: false,
          isActive: true,
        })
      );
      expect(mockCacheService.set).toHaveBeenCalledWith(`user:${mockUser.id}`, mockUser, 300000);
    });

    it('should throw ConflictError if user already exists', async () => {
      // Arrange
      const userData: UserCreateData = {
        email: 'existing@example.com' as Email,
        firstName: 'Existing',
        lastName: 'User',
        password: 'password123',
      };

      mockUserRepository.findAll.mockResolvedValue([mockUser]); // Existing user

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(ConflictError);
    });

    it('should throw ValidationError for invalid password', async () => {
      // Arrange
      const userData: UserCreateData = {
        email: 'test@example.com' as Email,
        firstName: 'Test',
        lastName: 'User',
        password: '123', // Too short
      };

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid phone number', async () => {
      // Arrange
      const userData: UserCreateData = {
        email: 'test@example.com' as Email,
        firstName: 'Test',
        lastName: 'User',
        password: 'password123',
        phoneNumber: 'invalid-phone' as any,
      };

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(ValidationError);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const userId = 'user-1' as UserId;
      const updateData: UserUpdateData = {
        firstName: 'Updated',
        lastName: 'User',
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ ...mockUser, ...updateData });
      mockCacheService.set.mockResolvedValue(undefined);
      mockCacheService.delete.mockResolvedValue(undefined);

      // Act
      const result = await userService.updateUser(userId, updateData);

      // Assert
      expect(result).toEqual({ ...mockUser, ...updateData });
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(mockCacheService.set).toHaveBeenCalledWith(`user:${userId}`, result, 300000);
    });

    it('should throw error if user does not exist', async () => {
      // Arrange
      const userId = 'user-1' as UserId;
      const updateData: UserUpdateData = { firstName: 'Updated' };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for empty first name', async () => {
      // Arrange
      const userId = 'user-1' as UserId;
      const updateData: UserUpdateData = { firstName: '' };

      // Act & Assert
      await expect(userService.updateUser(userId, updateData)).rejects.toThrow(ValidationError);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      // Arrange
      const userId = 'user-1' as UserId;
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.delete.mockResolvedValue(true);
      mockCacheService.delete.mockResolvedValue(undefined);

      // Act
      await userService.deleteUser(userId);

      // Assert
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
      expect(mockCacheService.delete).toHaveBeenCalledWith(`user:${userId}`);
    });

    it('should throw error if user does not exist', async () => {
      // Arrange
      const userId = 'user-1' as UserId;
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.deleteUser(userId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      // Arrange
      const searchParams = { query: 'test' };
      const users = [mockUser];
      mockUserRepository.findAll.mockResolvedValue(users);

      // Act
      const result = await userService.searchUsers(searchParams);

      // Assert
      expect(result).toEqual(users);
      expect(mockUserRepository.findAll).toHaveBeenCalledWith(searchParams);
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      // Arrange
      const email = 'test@example.com' as Email;
      mockUserRepository.findAll.mockResolvedValue([mockUser]);

      // Act
      const result = await userService.findUserByEmail(email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findAll).toHaveBeenCalledWith({ email });
    });

    it('should return null if user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com' as Email;
      mockUserRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await userService.findUserByEmail(email);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('verifyUserEmail', () => {
    it('should verify user email', async () => {
      // Arrange
      const userId = 'user-1' as UserId;
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ ...mockUser, isEmailVerified: true });
      mockCacheService.set.mockResolvedValue(undefined);
      mockCacheService.delete.mockResolvedValue(undefined);

      // Act
      await userService.verifyUserEmail(userId);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, { isEmailVerified: true });
    });
  });

  describe('verifyUserPhone', () => {
    it('should verify user phone', async () => {
      // Arrange
      const userId = 'user-1' as UserId;
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({ ...mockUser, isPhoneVerified: true });
      mockCacheService.set.mockResolvedValue(undefined);
      mockCacheService.delete.mockResolvedValue(undefined);

      // Act
      await userService.verifyUserPhone(userId);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, { isPhoneVerified: true });
    });
  });

  describe('error handling', () => {
    it('should handle repository errors gracefully', async () => {
      // Arrange
      const userId = 'user-1' as UserId;
      const error = new Error('Database connection failed');
      mockCacheService.get.mockResolvedValue(null);
      mockUserRepository.findById.mockRejectedValue(error);

      // Act & Assert
      await expect(userService.getUserById(userId)).rejects.toThrow('Database connection failed');
    });

    it('should handle cache errors gracefully', async () => {
      // Arrange
      const userId = 'user-1' as UserId;
      const error = new Error('Cache connection failed');
      mockCacheService.get.mockRejectedValue(error);

      // Act & Assert
      await expect(userService.getUserById(userId)).rejects.toThrow('Cache connection failed');
    });
  });

  describe('service lifecycle', () => {
    it('should initialize successfully', async () => {
      // Act
      await userService.initialize();

      // Assert
      expect(userService.isInitialized()).toBe(true);
    });

    it('should destroy successfully', async () => {
      // Arrange
      await userService.initialize();

      // Act
      await userService.destroy();

      // Assert
      expect(userService.isInitialized()).toBe(false);
    });
  });
});
