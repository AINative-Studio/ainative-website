/**
 * Admin User Management Service
 * Handles all user administration operations
 */

import { adminApi } from './client';
import type {
  AdminUser,
  UserListFilters,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
  OperationResult,
} from './types';

/**
 * Admin service for managing users
 */
export class AdminUserService {
  private readonly basePath = 'users';

  /**
   * List all users with optional filtering and pagination
   */
  async listUsers(filters?: UserListFilters): Promise<PaginatedResponse<AdminUser>> {
    try {
      const queryString = filters ? adminApi.buildQueryString(filters) : '';
      const response = await adminApi.get<PaginatedResponse<AdminUser>>(
        `${this.basePath}${queryString}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch users');
      }

      return response.data;
    } catch (error) {
      console.error('Error listing users:', error);
      throw error;
    }
  }

  /**
   * Get a single user by ID
   */
  async getUser(userId: string): Promise<AdminUser> {
    try {
      const response = await adminApi.get<AdminUser>(`${this.basePath}/${userId}`);

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user');
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserRequest): Promise<AdminUser> {
    try {
      const response = await adminApi.post<AdminUser>(this.basePath, userData);

      if (!response.success) {
        throw new Error(response.message || 'Failed to create user');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update an existing user
   */
  async updateUser(userId: string, updates: UpdateUserRequest): Promise<AdminUser> {
    try {
      const response = await adminApi.put<AdminUser>(`${this.basePath}/${userId}`, updates);

      if (!response.success) {
        throw new Error(response.message || 'Failed to update user');
      }

      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<OperationResult> {
    try {
      const response = await adminApi.delete<void>(`${this.basePath}/${userId}`);

      return {
        success: response.success,
        message: response.message || 'User deleted successfully',
      };
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Activate a user account
   */
  async activateUser(userId: string): Promise<OperationResult> {
    try {
      const response = await adminApi.post<void>(`${this.basePath}/${userId}/activate`);

      return {
        success: response.success,
        message: response.message || 'User activated successfully',
      };
    } catch (error) {
      console.error(`Error activating user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate a user account
   */
  async deactivateUser(userId: string): Promise<OperationResult> {
    try {
      const response = await adminApi.post<void>(`${this.basePath}/${userId}/deactivate`);

      return {
        success: response.success,
        message: response.message || 'User deactivated successfully',
      };
    } catch (error) {
      console.error(`Error deactivating user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Reset user password
   */
  async resetPassword(userId: string): Promise<{ temporary_password: string }> {
    try {
      const response = await adminApi.post<{ temporary_password: string }>(
        `${this.basePath}/${userId}/reset-password`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to reset password');
      }

      return response.data;
    } catch (error) {
      console.error(`Error resetting password for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Send verification email to user
   */
  async sendVerificationEmail(userId: string): Promise<OperationResult> {
    try {
      const response = await adminApi.post<void>(
        `${this.basePath}/${userId}/send-verification`
      );

      return {
        success: response.success,
        message: response.message || 'Verification email sent successfully',
      };
    } catch (error) {
      console.error(`Error sending verification email to user ${userId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminUserService = new AdminUserService();
