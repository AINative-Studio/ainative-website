import apiClient from '../api-client';
import { teamService } from '../team-service';

// Mock the apiClient
jest.mock('../api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('TeamService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTeam', () => {
    it('creates team with correct endpoint and data', async () => {
      const teamData = {
        name: 'Engineering Team',
        description: 'Software development team',
        organization_id: 123,
      };

      const mockResponse = {
        id: 1,
        ...teamData,
        created_at: '2025-12-21T10:00:00Z',
        updated_at: '2025-12-21T10:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await teamService.createTeam(teamData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/teams', teamData);
      expect(result).toEqual(mockResponse);
    });

    it('creates team without description', async () => {
      const teamData = {
        name: 'Marketing Team',
        organization_id: 456,
      };

      const mockResponse = {
        id: 2,
        ...teamData,
        description: null,
        created_at: '2025-12-21T10:00:00Z',
        updated_at: '2025-12-21T10:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await teamService.createTeam(teamData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/teams', teamData);
      expect(result).toEqual(mockResponse);
    });

    it('handles errors when creating team', async () => {
      const teamData = {
        name: 'Test Team',
        organization_id: 789,
      };

      mockApiClient.post.mockRejectedValueOnce(new Error('Organization not found'));

      await expect(teamService.createTeam(teamData)).rejects.toThrow('Organization not found');
    });
  });

  describe('listTeams', () => {
    it('fetches all teams with optional organization filter', async () => {
      const mockTeams = {
        teams: [
          {
            id: 1,
            name: 'Engineering',
            description: 'Dev team',
            organization_id: 123,
            member_count: 10,
            created_at: '2025-01-01T00:00:00Z',
          },
          {
            id: 2,
            name: 'Design',
            description: 'Design team',
            organization_id: 123,
            member_count: 5,
            created_at: '2025-01-15T00:00:00Z',
          },
        ],
        total: 2,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockTeams,
        status: 200,
        statusText: 'OK',
      });

      const result = await teamService.listTeams();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/teams');
      expect(result).toEqual(mockTeams);
    });

    it('fetches teams filtered by organization', async () => {
      const orgId = 456;
      const mockTeams = {
        teams: [
          {
            id: 3,
            name: 'Sales Team',
            description: 'Sales',
            organization_id: orgId,
            member_count: 8,
            created_at: '2025-02-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockTeams,
        status: 200,
        statusText: 'OK',
      });

      const result = await teamService.listTeams(orgId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/public/teams?organization_id=${orgId}`);
      expect(result).toEqual(mockTeams);
    });

    it('handles errors when listing teams', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(teamService.listTeams()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getTeam', () => {
    it('fetches team details by id', async () => {
      const teamId = 123;
      const mockTeam = {
        id: teamId,
        name: 'Engineering Team',
        description: 'Software development',
        organization_id: 456,
        member_count: 15,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-12-21T10:00:00Z',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockTeam,
        status: 200,
        statusText: 'OK',
      });

      const result = await teamService.getTeam(teamId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/public/teams/${teamId}`);
      expect(result).toEqual(mockTeam);
    });

    it('handles errors when fetching team', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Team not found'));

      await expect(teamService.getTeam(999)).rejects.toThrow('Team not found');
    });
  });

  describe('updateTeam', () => {
    it('updates team with partial data', async () => {
      const teamId = 123;
      const updateData = {
        name: 'Updated Team Name',
        description: 'Updated description',
      };

      const mockResponse = {
        id: teamId,
        ...updateData,
        organization_id: 456,
        updated_at: '2025-12-21T10:00:00Z',
      };

      mockApiClient.put.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await teamService.updateTeam(teamId, updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(`/v1/public/teams/${teamId}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    it('handles errors when updating team', async () => {
      mockApiClient.put.mockRejectedValueOnce(new Error('Forbidden'));

      await expect(teamService.updateTeam(123, {})).rejects.toThrow('Forbidden');
    });
  });

  describe('deleteTeam', () => {
    it('deletes team successfully', async () => {
      const teamId = 123;

      mockApiClient.delete.mockResolvedValueOnce({
        data: { message: 'Team deleted successfully' },
        status: 200,
        statusText: 'OK',
      });

      const result = await teamService.deleteTeam(teamId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/v1/public/teams/${teamId}`);
      expect(result).toEqual({ message: 'Team deleted successfully' });
    });

    it('handles errors when deleting team', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Team has active projects'));

      await expect(teamService.deleteTeam(123)).rejects.toThrow('Team has active projects');
    });
  });

  describe('addTeamMember', () => {
    it('adds member to team with role', async () => {
      const teamId = 123;
      const memberData = {
        user_id: 456,
        role: 'member',
      };

      const mockResponse = {
        id: 789,
        team_id: teamId,
        user_id: 456,
        role: 'member',
        added_at: '2025-12-21T10:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await teamService.addTeamMember(teamId, memberData);

      expect(mockApiClient.post).toHaveBeenCalledWith(`/v1/public/teams/${teamId}/members`, memberData);
      expect(result).toEqual(mockResponse);
    });

    it('adds team lead to team', async () => {
      const teamId = 123;
      const memberData = {
        user_id: 789,
        role: 'lead',
      };

      const mockResponse = {
        id: 999,
        team_id: teamId,
        user_id: 789,
        role: 'lead',
        added_at: '2025-12-21T10:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await teamService.addTeamMember(teamId, memberData);

      expect(mockApiClient.post).toHaveBeenCalledWith(`/v1/public/teams/${teamId}/members`, memberData);
      expect(result).toEqual(mockResponse);
    });

    it('handles errors when adding team member', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('User not in organization'));

      await expect(teamService.addTeamMember(123, { user_id: 456, role: 'member' }))
        .rejects.toThrow('User not in organization');
    });
  });

  describe('listTeamMembers', () => {
    it('fetches all members of a team', async () => {
      const teamId = 123;
      const mockMembers = {
        members: [
          {
            id: 1,
            user_id: 100,
            email: 'lead@example.com',
            name: 'Team Lead',
            role: 'lead',
            added_at: '2025-01-01T00:00:00Z',
          },
          {
            id: 2,
            user_id: 101,
            email: 'member1@example.com',
            name: 'Team Member 1',
            role: 'member',
            added_at: '2025-01-15T00:00:00Z',
          },
          {
            id: 3,
            user_id: 102,
            email: 'member2@example.com',
            name: 'Team Member 2',
            role: 'member',
            added_at: '2025-02-01T00:00:00Z',
          },
        ],
        total: 3,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockMembers,
        status: 200,
        statusText: 'OK',
      });

      const result = await teamService.listTeamMembers(teamId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/public/teams/${teamId}/members`);
      expect(result).toEqual(mockMembers);
    });

    it('handles errors when listing team members', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Forbidden'));

      await expect(teamService.listTeamMembers(123)).rejects.toThrow('Forbidden');
    });
  });

  describe('removeTeamMember', () => {
    it('removes member from team', async () => {
      const teamId = 123;
      const userId = 456;

      mockApiClient.delete.mockResolvedValueOnce({
        data: { message: 'Member removed from team successfully' },
        status: 200,
        statusText: 'OK',
      });

      const result = await teamService.removeTeamMember(teamId, userId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/v1/public/teams/${teamId}/members/${userId}`);
      expect(result).toEqual({ message: 'Member removed from team successfully' });
    });

    it('handles errors when removing team member', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Cannot remove team lead'));

      await expect(teamService.removeTeamMember(123, 456))
        .rejects.toThrow('Cannot remove team lead');
    });
  });
});
