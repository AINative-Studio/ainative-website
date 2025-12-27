import apiClient, { shouldLogError } from '../../utils/apiClient';

export interface Project {
  id: string;
  name: string;
  description?: string;
  tier: string;
  status: string;
  user_id: string;
  database_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostgresProvisionRequest {
  database_name: string;
  user?: string;
  password?: string;
  host?: string;
  port?: number;
}

export interface PostgresProvisionResponse {
  id: string;
  database_id: string;  // Alias for id for component compatibility
  database_name: string;
  project_id: string;
  status: string;
  instance_size: string;
  postgres_version: string;
  monthly_cost_usd: number;
  connection_count: number;
  cpu_usage_percent: number;
  memory_usage_percent: number;
  storage_usage_gb: number;
  created_at: string;
  last_health_check_at?: string;
  error_message?: string;
}

export interface PostgresConnectionDetails {
  database_url: string;
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  connection_string: string;
}

export interface Collection {
  id: string;
  name: string;
  database_id: string;
  schema_version: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  status: string;
}

export interface CollectionCreateRequest {
  name: string;
  database_id?: string;
  schema?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface Table {
  id: string;
  name: string;
  collection_id: string;
  schema: Record<string, any>;
  row_count: number;
  created_at: string;
  updated_at: string;
  status: string;
}

export interface TableCreateRequest {
  name: string;
  collection_id: string;
  schema: Record<string, any>;
  initial_data?: Record<string, any>[];
}

export interface DatabaseStats {
  total_databases: number;
  total_collections: number;
  total_tables: number;
  total_rows: number;
  storage_used_mb: number;
}

// Get or create default project ID for the user
const getDefaultProjectId = async (): Promise<string | null> => {
  try {
    // First, try to get existing projects
    const response = await apiClient.get('/v1/public/zerodb/projects');
    const projects = response.data as any[];

    if (projects && projects.length > 0) {
      // Use the first active project
      const activeProject = projects.find((p: any) => p.status === 'ACTIVE');
      if (activeProject) {
        return activeProject.id;
      }
    }

    // No projects found, create a default one
    const createResponse = await apiClient.post('/v1/public/zerodb/projects', {
      name: 'Default ZeroDB Project',
      description: 'Auto-created project for ZeroDB PostgreSQL services',
      tier: 'free',
      database_enabled: true
    });

    return (createResponse.data as any).id;
  } catch (error: any) {
    // Silently return null if projects endpoint doesn't exist or fails
    // This is expected for users without project access
    return null;
  }
};

export class DatabaseService {
  private static readonly BASE_PATH = '/v1/public/zerodb';
  private static readonly PROJECTS_BASE_PATH = '/v1/projects';

  // PostgreSQL Management
  static async provisionPostgres(request: PostgresProvisionRequest): Promise<PostgresProvisionResponse> {
    try {
      const projectId = await getDefaultProjectId();
      if (!projectId) {
        throw new Error('Unable to provision PostgreSQL: Projects feature not available');
      }
      const response = await apiClient.post(`${DatabaseService.PROJECTS_BASE_PATH}/${projectId}/postgres`, request);
      return response.data as PostgresProvisionResponse;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in to provision PostgreSQL database.');
      }
      if (error.response?.status === 400) {
        throw new Error(`Invalid request: ${error.response?.data?.detail || 'Please check your parameters'}`);
      }
      if (error.response?.status === 404) {
        throw new Error('Project not found. Please ensure you have a valid project.');
      }
      throw new Error(`Failed to provision PostgreSQL database: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getPostgresDatabases(): Promise<PostgresProvisionResponse[]> {
    try {
      const projectId = await getDefaultProjectId();
      if (!projectId) {
        // Projects feature not available, return empty array silently
        return [];
      }
      const response = await apiClient.get(`${DatabaseService.PROJECTS_BASE_PATH}/${projectId}/postgres`);
      // The backend returns a single instance, but frontend expects an array
      return response.data ? [response.data as PostgresProvisionResponse] : [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        return []; // No instance found, return empty array (this is expected when no PostgreSQL is provisioned yet)
      }
      if (error.response?.status === 401) {
        return []; // Return empty array instead of throwing to prevent UI crashes
      }
      // For any other errors, return empty array silently
      return [];
    }
  }

  static async deletePostgresDatabase(databaseId: string): Promise<void> {
    try {
      const projectId = await getDefaultProjectId();
      if (!projectId) {
        throw new Error('Unable to delete PostgreSQL: Projects feature not available');
      }
      await apiClient.delete(`${DatabaseService.PROJECTS_BASE_PATH}/${projectId}/postgres?confirm=true`);
    } catch (error: any) {
      throw new Error(`Failed to delete PostgreSQL database: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getPostgresConnectionDetails(): Promise<PostgresConnectionDetails> {
    try {
      const projectId = await getDefaultProjectId();
      if (!projectId) {
        throw new Error('Unable to get connection details: Projects feature not available');
      }
      const response = await apiClient.get(`${DatabaseService.PROJECTS_BASE_PATH}/${projectId}/postgres/connection`);
      return response.data as PostgresConnectionDetails;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('No active PostgreSQL instance found. Please provision a database first.');
      }
      throw new Error(`Failed to get connection details: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async restartPostgresDatabase(): Promise<{ success: boolean; message: string }> {
    try {
      const projectId = await getDefaultProjectId();
      if (!projectId) {
        throw new Error('Unable to restart PostgreSQL: Projects feature not available');
      }
      const response = await apiClient.post(`${DatabaseService.PROJECTS_BASE_PATH}/${projectId}/postgres/restart`);
      return response.data as { success: boolean; message: string };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('No PostgreSQL instance found. Please provision a database first.');
      }
      if (error.response?.status === 400) {
        throw new Error(`Cannot restart database: ${error.response?.data?.detail || 'Invalid request'}`);
      }
      throw new Error(`Failed to restart PostgreSQL database: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Project Management
  static async getProjects(): Promise<Project[]> {
    try {
      const response = await apiClient.get('/v1/public/zerodb/projects');
      return response.data as Project[];
    } catch (error: any) {
      if (shouldLogError(error)) {
        console.error('Failed to fetch projects:', error);
      }
      return [];
    }
  }

  static async createProject(name: string, description?: string): Promise<Project> {
    try {
      const response = await apiClient.post('/v1/public/zerodb/projects', {
        name,
        description: description || `Auto-created project: ${name}`,
        tier: 'free',
        database_enabled: true
      });
      return response.data as Project;
    } catch (error: any) {
      throw new Error(`Failed to create project: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Collections Management
  static async getCollections(): Promise<Collection[]> {
    try {
      const response = await apiClient.get(`${DatabaseService.BASE_PATH}/collections`);
      // Handle both array and object with collections property
      return (response.data as any)?.collections || response.data || [];
    } catch (error: any) {
      throw new Error(`Failed to fetch collections: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async createCollection(request: CollectionCreateRequest): Promise<Collection> {
    try {
      const response = await apiClient.post(`${DatabaseService.BASE_PATH}/collections`, request);
      return response.data as Collection;
    } catch (error: any) {
      throw new Error(`Failed to create collection: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getCollection(collectionId: string): Promise<Collection> {
    try {
      const response = await apiClient.get(`${DatabaseService.BASE_PATH}/collections/${collectionId}`);
      return response.data as Collection;
    } catch (error: any) {
      throw new Error(`Failed to fetch collection: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async updateCollection(collectionId: string, updates: Partial<CollectionCreateRequest>): Promise<Collection> {
    try {
      const response = await apiClient.put(`${DatabaseService.BASE_PATH}/collections/${collectionId}`, updates);
      return response.data as Collection;
    } catch (error: any) {
      throw new Error(`Failed to update collection: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async deleteCollection(collectionId: string): Promise<void> {
    try {
      await apiClient.delete(`${DatabaseService.BASE_PATH}/collections/${collectionId}`);
    } catch (error: any) {
      throw new Error(`Failed to delete collection: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Tables Management
  static async getTables(collectionId?: string): Promise<Table[]> {
    try {
      const params = collectionId ? { collection_id: collectionId } : undefined;
      const response = await apiClient.get(`${DatabaseService.BASE_PATH}/tables`, params ? { params } as any : undefined);
      // Handle both array and object with tables property
      return (response.data as any)?.tables || response.data || [];
    } catch (error: any) {
      // Return empty array on 404 or 401 to prevent UI crashes
      if (error.response?.status === 404) {
        return []; // No tables found (expected when no tables exist yet)
      }
      if (error.response?.status === 401) {
        if (shouldLogError(error)) {
          console.warn('Authentication required for tables access');
        }
        return []; // Return empty array instead of crashing UI
      }
      if (shouldLogError(error)) {
        console.warn('Failed to fetch tables:', error.response?.data?.detail || error.message);
      }
      return []; // Return empty array instead of throwing to prevent UI crashes
    }
  }

  static async createTable(request: TableCreateRequest): Promise<Table> {
    try {
      const response = await apiClient.post(`${DatabaseService.BASE_PATH}/tables`, request);
      return response.data as Table;
    } catch (error: any) {
      throw new Error(`Failed to create table: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getTable(tableId: string): Promise<Table> {
    try {
      const response = await apiClient.get(`${DatabaseService.BASE_PATH}/tables/${tableId}`);
      return response.data as Table;
    } catch (error: any) {
      throw new Error(`Failed to fetch table: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async updateTable(tableId: string, updates: Partial<TableCreateRequest>): Promise<Table> {
    try {
      const response = await apiClient.put(`${DatabaseService.BASE_PATH}/tables/${tableId}`, updates);
      return response.data as Table;
    } catch (error: any) {
      throw new Error(`Failed to update table: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async deleteTable(tableId: string): Promise<void> {
    try {
      await apiClient.delete(`${DatabaseService.BASE_PATH}/tables/${tableId}`);
    } catch (error: any) {
      throw new Error(`Failed to delete table: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Database Statistics
  static async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      const response = await apiClient.get(`${DatabaseService.BASE_PATH}/stats`);
      // Provide default stats if not available
      return (response.data as DatabaseStats) || {
        total_databases: 0,
        total_collections: 0,
        total_tables: 0,
        total_rows: 0,
        storage_used_mb: 0
      };
    } catch (error: any) {
      // Return default stats on error
      if (error.response?.status === 404 || error.response?.status === 501) {
        return {
          total_databases: 0,
          total_collections: 0,
          total_tables: 0,
          total_rows: 0,
          storage_used_mb: 0
        };
      }
      throw new Error(`Failed to fetch database stats: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Health Check
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await apiClient.get(`${DatabaseService.BASE_PATH}/health`);
      return response.data as { status: string; timestamp: string };
    } catch (error: any) {
      throw new Error(`Database health check failed: ${error.response?.data?.detail || error.message}`);
    }
  }
}