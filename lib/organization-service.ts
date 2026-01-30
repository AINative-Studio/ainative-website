/**
 * Organization Service
 * Handles all organization-related API calls for creating, managing, and administering organizations
 */

import apiClient from './api-client';

// Base path for organization endpoints
const ORGANIZATIONS_BASE = '/v1/public/organizations';

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
    const response = await apiClient.post<Organization>(`${ORGANIZATIONS_BASE}/`, data);
    return response.data;
  }

  /**
   * List all organizations for the current user
   */
  async listOrganizations(): Promise<OrganizationsResponse> {
    const response = await apiClient.get<OrganizationsResponse>(`${ORGANIZATIONS_BASE}/`);
    return response.data;
  }

  /**
   * Get organization details by ID
   */
  async getOrganization(id: number): Promise<Organization> {
    const response = await apiClient.get<Organization>(`${ORGANIZATIONS_BASE}/${id}/`);
    return response.data;
  }

  /**
   * Update organization details
   */
  async updateOrganization(id: number, data: UpdateOrganizationData): Promise<Organization> {
    const response = await apiClient.put<Organization>(`${ORGANIZATIONS_BASE}/${id}/`, data);
    return response.data;
  }

  /**
   * Delete an organization
   */
  async deleteOrganization(id: number): Promise<DeleteResponse> {
    const response = await apiClient.delete<DeleteResponse>(`${ORGANIZATIONS_BASE}/${id}/`);
    return response.data;
  }

  /**
   * Add a member to an organization
   * TODO: Verify backend endpoint exists at /v1/public/organizations/{id}/members/
   */
  async addMember(organizationId: number, data: AddMemberData): Promise<OrganizationMember> {
    const response = await apiClient.post<OrganizationMember>(
      `${ORGANIZATIONS_BASE}/${organizationId}/members/`,
      data
    );
    return response.data;
  }

  /**
   * List all members of an organization
   * TODO: Verify backend endpoint exists at /v1/public/organizations/{id}/members/
   */
  async listMembers(organizationId: number): Promise<MembersResponse> {
    const response = await apiClient.get<MembersResponse>(
      `${ORGANIZATIONS_BASE}/${organizationId}/members/`
    );
    return response.data;
  }

  /**
   * Remove a member from an organization
   * TODO: Verify backend endpoint exists at /v1/public/organizations/{id}/members/{userId}/
   */
  async removeMember(organizationId: number, userId: number): Promise<DeleteResponse> {
    const response = await apiClient.delete<DeleteResponse>(
      `${ORGANIZATIONS_BASE}/${organizationId}/members/${userId}/`
    );
    return response.data;
  }
}

// Export singleton instance
export const organizationService = new OrganizationService();
