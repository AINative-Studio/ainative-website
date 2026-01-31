/**
 * Admin User Service Tests
 * Tests for user management operations
 */

import { adminUserService } from '@/services/admin/users';
import { adminApi } from '@/services/admin/client';
import type { AdminUser, UserListFilters, CreateUserRequest, UpdateUserRequest } from '@/services/admin/types';

// Mock the admin API client
jest.mock('@/services/admin/client');

describe('AdminUserService', () => {
  const mockAdminApi = adminApi as jest.Mocked<typeof adminApi>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listUsers', () => {
    it('should fetch users without filters', async () => {
      const mockUsers = {
        items: [
          { id: '1', email: 'user1@example.com', is_active: true, role: 'USER' as const },
          { id: '2', email: 'user2@example.com', is_active: true, role: 'ADMIN' as const },
        ],
        total: 2,
        page: 1,
        limit: 10,
        hasMore: false,
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockUsers,
      });

      const result = await adminUserService.listUsers();

      expect(mockAdminApi.get).toHaveBeenCalledWith('users');
      expect(result).toEqual(mockUsers);
    });

    it('should fetch users with filters', async () => {
      const filters: UserListFilters = {
        page: 2,
        limit: 20,
        search: 'test',
        role: 'ADMIN',
      };

      mockAdminApi.buildQueryString.mockReturnValue('?page=2&limit=20&search=test&role=ADMIN');
      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: { items: [], total: 0, page: 2, limit: 20, hasMore: false },
      });

      await adminUserService.listUsers(filters);

      expect(mockAdminApi.buildQueryString).toHaveBeenCalledWith(filters);
      expect(mockAdminApi.get).toHaveBeenCalledWith('users?page=2&limit=20&search=test&role=ADMIN');
    });

    it('should throw error on failure', async () => {
      mockAdminApi.get.mockResolvedValue({
        success: false,
        message: 'Failed to fetch users',
        data: null,
      });

      await expect(adminUserService.listUsers()).rejects.toThrow('Failed to fetch users');
    });
  });

  describe('getUser', () => {
    it('should fetch a single user by ID', async () => {
      const mockUser: AdminUser = {
        id: '123',
        email: 'test@example.com',
        full_name: 'Test User',
        is_active: true,
        is_superuser: false,
        role: 'USER',
        email_verified: true,
        created_at: '2024-01-01T00:00:00Z',
      };

      mockAdminApi.get.mockResolvedValue({
        success: true,
        message: 'OK',
        data: mockUser,
      });

      const result = await adminUserService.getUser('123');

      expect(mockAdminApi.get).toHaveBeenCalledWith('users/123');
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      mockAdminApi.get.mockResolvedValue({
        success: false,
        message: 'User not found',
        data: null,
      });

      await expect(adminUserService.getUser('999')).rejects.toThrow('User not found');
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData: CreateUserRequest = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        full_name: 'New User',
        role: 'USER',
      };

      const createdUser: AdminUser = {
        id: '456',
        email: userData.email,
        full_name: userData.full_name,
        is_active: true,
        is_superuser: false,
        role: 'USER',
        email_verified: false,
        created_at: '2024-01-01T00:00:00Z',
      };

      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'User created',
        data: createdUser,
      });

      const result = await adminUserService.createUser(userData);

      expect(mockAdminApi.post).toHaveBeenCalledWith('users', userData);
      expect(result).toEqual(createdUser);
    });

    it('should throw error on duplicate email', async () => {
      const userData: CreateUserRequest = {
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
      };

      mockAdminApi.post.mockResolvedValue({
        success: false,
        message: 'Email already exists',
        data: null,
      });

      await expect(adminUserService.createUser(userData)).rejects.toThrow('Email already exists');
    });
  });

  describe('updateUser', () => {
    it('should update user information', async () => {
      const updates: UpdateUserRequest = {
        full_name: 'Updated Name',
        is_active: false,
      };

      const updatedUser: AdminUser = {
        id: '123',
        email: 'test@example.com',
        full_name: 'Updated Name',
        is_active: false,
        is_superuser: false,
        role: 'USER',
        email_verified: true,
        created_at: '2024-01-01T00:00:00Z',
      };

      mockAdminApi.put.mockResolvedValue({
        success: true,
        message: 'User updated',
        data: updatedUser,
      });

      const result = await adminUserService.updateUser('123', updates);

      expect(mockAdminApi.put).toHaveBeenCalledWith('users/123', updates);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      mockAdminApi.delete.mockResolvedValue({
        success: true,
        message: 'User deleted successfully',
        data: null,
      });

      const result = await adminUserService.deleteUser('123');

      expect(mockAdminApi.delete).toHaveBeenCalledWith('users/123');
      expect(result.success).toBe(true);
      expect(result.message).toBe('User deleted successfully');
    });

    it('should throw error when user cannot be deleted', async () => {
      mockAdminApi.delete.mockRejectedValue(new Error('Cannot delete admin user'));

      await expect(adminUserService.deleteUser('123')).rejects.toThrow('Cannot delete admin user');
    });
  });

  describe('activateUser', () => {
    it('should activate a user account', async () => {
      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'User activated',
        data: null,
      });

      const result = await adminUserService.activateUser('123');

      expect(mockAdminApi.post).toHaveBeenCalledWith('users/123/activate');
      expect(result.success).toBe(true);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate a user account', async () => {
      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'User deactivated',
        data: null,
      });

      const result = await adminUserService.deactivateUser('123');

      expect(mockAdminApi.post).toHaveBeenCalledWith('users/123/deactivate');
      expect(result.success).toBe(true);
    });
  });

  describe('resetPassword', () => {
    it('should reset user password and return temporary password', async () => {
      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'Password reset',
        data: { temporary_password: 'TempPass123!' },
      });

      const result = await adminUserService.resetPassword('123');

      expect(mockAdminApi.post).toHaveBeenCalledWith('users/123/reset-password');
      expect(result.temporary_password).toBe('TempPass123!');
    });

    it('should throw error on failure', async () => {
      mockAdminApi.post.mockResolvedValue({
        success: false,
        message: 'Failed to reset password',
        data: null,
      });

      await expect(adminUserService.resetPassword('123')).rejects.toThrow(
        'Failed to reset password'
      );
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email', async () => {
      mockAdminApi.post.mockResolvedValue({
        success: true,
        message: 'Verification email sent',
        data: null,
      });

      const result = await adminUserService.sendVerificationEmail('123');

      expect(mockAdminApi.post).toHaveBeenCalledWith('users/123/send-verification');
      expect(result.success).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockAdminApi.get.mockRejectedValue(new Error('Network error'));

      await expect(adminUserService.listUsers()).rejects.toThrow('Network error');
    });

    it('should handle 401 unauthorized', async () => {
      mockAdminApi.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(adminUserService.getUser('123')).rejects.toThrow('Unauthorized');
    });

    it('should handle 403 forbidden', async () => {
      mockAdminApi.post.mockRejectedValue(new Error('Forbidden'));

      await expect(
        adminUserService.createUser({ email: 'test@example.com', password: 'pass' })
      ).rejects.toThrow('Forbidden');
    });
  });
});
