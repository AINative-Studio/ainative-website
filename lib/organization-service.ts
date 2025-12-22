/**
 * Organization Service
 * Handles all organization-related API calls for creating, managing, and administering organizations
 */

import apiClient from './api-client';

// Type definitions
export interface CreateOrganizationData {
  name: string;
  description?: string;
  plan_tier: string;
}

export interface Organization {
  id: number;
  name: string;
  description?: string;
  plan_tier: string;
  member_count?: number;
  created_at: string;
  updated_at: string;
  owner_id?: number;
}

export interface OrganizationsResponse {
  organizations: Organization[];
  total: number;
}

export interface UpdateOrganizationData {
  name?: string;
  description?: string;
  plan_tier?: string;
}

export interface AddMemberData {
  user_id: number;
  role: string;
}

export interface OrganizationMember {
  id: number;
  organization_id: number;
  user_id: number;
  email: string;
  name: string;
  role: string;
  added_at: string;
}

export interface MembersResponse {
  members: OrganizationMember[];
  total: number;
}

export interface DeleteResponse {
  message: string;
}

/**
 * Organization Service class
 */
class OrganizationService {
  /**
   * Create a new organization
   */
  async createOrganization(data: CreateOrganizationData): Promise<Organization> {
    const response = await apiClient.post<Organization>('/v1/organizations', data);
    return response.data;
  }

  /**
   * List all organizations for the current user
   */
  async listOrganizations(): Promise<OrganizationsResponse> {
    const response = await apiClient.get<OrganizationsResponse>('/v1/organizations');
    return response.data;
  }

  /**
   * Get organization details by ID
   */
  async getOrganization(id: number): Promise<Organization> {
    const response = await apiClient.get<Organization>(`/v1/organizations/${id}`);
    return response.data;
  }

  /**
   * Update organization details
   */
  async updateOrganization(id: number, data: UpdateOrganizationData): Promise<Organization> {
    const response = await apiClient.put<Organization>(`/v1/organizations/${id}`, data);
    return response.data;
  }

  /**
   * Delete an organization
   */
  async deleteOrganization(id: number): Promise<DeleteResponse> {
    const response = await apiClient.delete<DeleteResponse>(`/v1/organizations/${id}`);
    return response.data;
  }

  /**
   * Add a member to an organization
   */
  async addMember(organizationId: number, data: AddMemberData): Promise<OrganizationMember> {
    const response = await apiClient.post<OrganizationMember>(
      `/v1/organizations/${organizationId}/members`,
      data
    );
    return response.data;
  }

  /**
   * List all members of an organization
   */
  async listMembers(organizationId: number): Promise<MembersResponse> {
    const response = await apiClient.get<MembersResponse>(
      `/v1/organizations/${organizationId}/members`
    );
    return response.data;
  }

  /**
   * Remove a member from an organization
   */
  async removeMember(organizationId: number, userId: number): Promise<DeleteResponse> {
    const response = await apiClient.delete<DeleteResponse>(
      `/v1/organizations/${organizationId}/members/${userId}`
    );
    return response.data;
  }
}

// Export singleton instance
export const organizationService = new OrganizationService();
