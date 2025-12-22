/**
 * Team Service
 * Handles all team-related API calls for creating, managing, and administering teams
 */

import apiClient from './api-client';

// Type definitions
export interface CreateTeamData {
  name: string;
  description?: string;
  organization_id: number;
}

export interface Team {
  id: number;
  name: string;
  description?: string | null;
  organization_id: number;
  member_count?: number;
  created_at: string;
  updated_at: string;
}

export interface TeamsResponse {
  teams: Team[];
  total: number;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
}

export interface AddTeamMemberData {
  user_id: number;
  role: string;
}

export interface TeamMember {
  id: number;
  team_id: number;
  user_id: number;
  email: string;
  name: string;
  role: string;
  added_at: string;
}

export interface TeamMembersResponse {
  members: TeamMember[];
  total: number;
}

export interface DeleteResponse {
  message: string;
}

/**
 * Team Service class
 */
class TeamService {
  /**
   * Create a new team
   */
  async createTeam(data: CreateTeamData): Promise<Team> {
    const response = await apiClient.post<Team>('/v1/teams', data);
    return response.data;
  }

  /**
   * List all teams, optionally filtered by organization
   */
  async listTeams(organizationId?: number): Promise<TeamsResponse> {
    const endpoint = organizationId
      ? `/v1/teams?organization_id=${organizationId}`
      : '/v1/teams';
    const response = await apiClient.get<TeamsResponse>(endpoint);
    return response.data;
  }

  /**
   * Get team details by ID
   */
  async getTeam(id: number): Promise<Team> {
    const response = await apiClient.get<Team>(`/v1/teams/${id}`);
    return response.data;
  }

  /**
   * Update team details
   */
  async updateTeam(id: number, data: UpdateTeamData): Promise<Team> {
    const response = await apiClient.put<Team>(`/v1/teams/${id}`, data);
    return response.data;
  }

  /**
   * Delete a team
   */
  async deleteTeam(id: number): Promise<DeleteResponse> {
    const response = await apiClient.delete<DeleteResponse>(`/v1/teams/${id}`);
    return response.data;
  }

  /**
   * Add a member to a team
   */
  async addTeamMember(teamId: number, data: AddTeamMemberData): Promise<TeamMember> {
    const response = await apiClient.post<TeamMember>(`/v1/teams/${teamId}/members`, data);
    return response.data;
  }

  /**
   * List all members of a team
   */
  async listTeamMembers(teamId: number): Promise<TeamMembersResponse> {
    const response = await apiClient.get<TeamMembersResponse>(`/v1/teams/${teamId}/members`);
    return response.data;
  }

  /**
   * Remove a member from a team
   */
  async removeTeamMember(teamId: number, userId: number): Promise<DeleteResponse> {
    const response = await apiClient.delete<DeleteResponse>(`/v1/teams/${teamId}/members/${userId}`);
    return response.data;
  }
}

// Export singleton instance
export const teamService = new TeamService();
