import apiClient from '../api-client';
import { organizationService } from '../organization-service';

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

describe('OrganizationService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrganization', () => {
    it('creates organization with correct endpoint and data', async () => {
      const orgData = {
        name: 'Acme Corp',
        description: 'A test organization',
        plan_tier: 'professional',
      };

      const mockResponse = {
        id: 1,
        ...orgData,
        created_at: '2025-12-21T10:00:00Z',
        updated_at: '2025-12-21T10:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await organizationService.createOrganization(orgData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/v1/public/organizations', orgData);
      expect(result).toEqual(mockResponse);
    });

    it('handles errors when creating organization', async () => {
      const orgData = {
        name: 'Test Org',
        description: 'Test',
        plan_tier: 'free',
      };

      mockApiClient.post.mockRejectedValueOnce(new Error('Validation failed'));

      await expect(organizationService.createOrganization(orgData)).rejects.toThrow('Validation failed');
    });
  });

  describe('listOrganizations', () => {
    it('fetches all organizations for current user', async () => {
      const mockOrgs = {
        organizations: [
          {
            id: 1,
            name: 'Org 1',
            description: 'First org',
            plan_tier: 'free',
            member_count: 5,
            created_at: '2025-01-01T00:00:00Z',
          },
          {
            id: 2,
            name: 'Org 2',
            description: 'Second org',
            plan_tier: 'professional',
            member_count: 15,
            created_at: '2025-01-15T00:00:00Z',
          },
        ],
        total: 2,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockOrgs,
        status: 200,
        statusText: 'OK',
      });

      const result = await organizationService.listOrganizations();

      expect(mockApiClient.get).toHaveBeenCalledWith('/v1/public/organizations');
      expect(result).toEqual(mockOrgs);
    });

    it('handles errors when listing organizations', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(organizationService.listOrganizations()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getOrganization', () => {
    it('fetches organization details by id', async () => {
      const orgId = 123;
      const mockOrg = {
        id: orgId,
        name: 'Test Org',
        description: 'A test organization',
        plan_tier: 'enterprise',
        member_count: 50,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-12-21T10:00:00Z',
        owner_id: 1,
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: mockOrg,
        status: 200,
        statusText: 'OK',
      });

      const result = await organizationService.getOrganization(orgId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/public/organizations/${orgId}`);
      expect(result).toEqual(mockOrg);
    });

    it('handles errors when fetching organization', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Not found'));

      await expect(organizationService.getOrganization(999)).rejects.toThrow('Not found');
    });
  });

  describe('updateOrganization', () => {
    it('updates organization with partial data', async () => {
      const orgId = 123;
      const updateData = {
        name: 'Updated Org Name',
        description: 'Updated description',
      };

      const mockResponse = {
        id: orgId,
        ...updateData,
        plan_tier: 'professional',
        updated_at: '2025-12-21T10:00:00Z',
      };

      mockApiClient.put.mockResolvedValueOnce({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await organizationService.updateOrganization(orgId, updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith(`/v1/public/organizations/${orgId}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    it('handles errors when updating organization', async () => {
      mockApiClient.put.mockRejectedValueOnce(new Error('Forbidden'));

      await expect(organizationService.updateOrganization(123, {})).rejects.toThrow('Forbidden');
    });
  });

  describe('deleteOrganization', () => {
    it('deletes organization successfully', async () => {
      const orgId = 123;

      mockApiClient.delete.mockResolvedValueOnce({
        data: { message: 'Organization deleted successfully' },
        status: 200,
        statusText: 'OK',
      });

      const result = await organizationService.deleteOrganization(orgId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/v1/public/organizations/${orgId}`);
      expect(result).toEqual({ message: 'Organization deleted successfully' });
    });

    it('handles errors when deleting organization', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Forbidden'));

      await expect(organizationService.deleteOrganization(123)).rejects.toThrow('Forbidden');
    });
  });

  describe('addMember', () => {
    it('adds member to organization with role', async () => {
      const orgId = 123;
      const memberData = {
        user_id: 456,
        role: 'member',
      };

      const mockResponse = {
        id: 789,
        organization_id: orgId,
        user_id: 456,
        role: 'member',
        added_at: '2025-12-21T10:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await organizationService.addMember(orgId, memberData);

      expect(mockApiClient.post).toHaveBeenCalledWith(`/v1/public/organizations/${orgId}/members`, memberData);
      expect(result).toEqual(mockResponse);
    });

    it('adds admin member to organization', async () => {
      const orgId = 123;
      const memberData = {
        user_id: 789,
        role: 'admin',
      };

      const mockResponse = {
        id: 999,
        organization_id: orgId,
        user_id: 789,
        role: 'admin',
        added_at: '2025-12-21T10:00:00Z',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201,
        statusText: 'Created',
      });

      const result = await organizationService.addMember(orgId, memberData);

      expect(mockApiClient.post).toHaveBeenCalledWith(`/v1/public/organizations/${orgId}/members`, memberData);
      expect(result).toEqual(mockResponse);
    });

    it('handles errors when adding member', async () => {
      mockApiClient.post.mockRejectedValueOnce(new Error('User already a member'));

      await expect(organizationService.addMember(123, { user_id: 456, role: 'member' }))
        .rejects.toThrow('User already a member');
    });
  });

  describe('listMembers', () => {
    it('fetches all members of an organization', async () => {
      const orgId = 123;
      const mockMembers = {
        members: [
          {
            id: 1,
            user_id: 100,
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin',
            added_at: '2025-01-01T00:00:00Z',
          },
          {
            id: 2,
            user_id: 101,
            email: 'member@example.com',
            name: 'Regular Member',
            role: 'member',
            added_at: '2025-01-15T00:00:00Z',
          },
          {
            id: 3,
            user_id: 102,
            email: 'viewer@example.com',
            name: 'Viewer User',
            role: 'viewer',
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

      const result = await organizationService.listMembers(orgId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/v1/public/organizations/${orgId}/members`);
      expect(result).toEqual(mockMembers);
    });

    it('handles errors when listing members', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Forbidden'));

      await expect(organizationService.listMembers(123)).rejects.toThrow('Forbidden');
    });
  });

  describe('removeMember', () => {
    it('removes member from organization', async () => {
      const orgId = 123;
      const userId = 456;

      mockApiClient.delete.mockResolvedValueOnce({
        data: { message: 'Member removed successfully' },
        status: 200,
        statusText: 'OK',
      });

      const result = await organizationService.removeMember(orgId, userId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(`/v1/public/organizations/${orgId}/members/${userId}`);
      expect(result).toEqual({ message: 'Member removed successfully' });
    });

    it('handles errors when removing member', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Cannot remove organization owner'));

      await expect(organizationService.removeMember(123, 456))
        .rejects.toThrow('Cannot remove organization owner');
    });
  });
});
