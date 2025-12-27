import apiClient from '../../utils/apiClient';

export interface APIKey {
  id: string;
  name: string;
  prefix: string;
  permissions: string[];
  is_active: boolean;
  expires_at?: string;
  last_used_at?: string;
  usage_count: number;
  rate_limit?: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface APIKeyCreateRequest {
  name: string;
  permissions: string[];
  expires_at?: string;
  rate_limit?: number;
  metadata?: Record<string, any>;
}

export interface APIKeyCreateResponse extends APIKey {
  key: string; // Only returned on creation
}

export interface RateLimit {
  id: string;
  api_key_id?: string;
  user_id?: string;
  endpoint_pattern: string;
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  burst_limit: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RateLimitCreateRequest {
  api_key_id?: string;
  user_id?: string;
  endpoint_pattern: string;
  requests_per_minute?: number;
  requests_per_hour?: number;
  requests_per_day?: number;
  burst_limit?: number;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  api_key_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address: string;
  user_agent: string;
  status: 'success' | 'failure' | 'blocked';
  details?: Record<string, any>;
  timestamp: string;
  session_id?: string;
}

export interface SecurityEvent {
  id: string;
  event_type: 'login_attempt' | 'api_key_usage' | 'permission_change' | 'suspicious_activity' | 'rate_limit_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  api_key_id?: string;
  ip_address: string;
  description: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  timestamp: string;
}

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  rules: Array<{
    resource: string;
    actions: string[];
    conditions?: Record<string, any>;
  }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccessPolicyCreateRequest {
  name: string;
  description: string;
  rules: Array<{
    resource: string;
    actions: string[];
    conditions?: Record<string, any>;
  }>;
}

export class SecurityService {
  private static readonly API_KEYS_PATH = '/v1/public/zerodb/api-keys';
  private static readonly ACCESS_PATH = '/v1/public/zerodb/access';
  private static readonly AUDIT_PATH = '/v1/public/zerodb/audit';
  private static readonly SECURITY_PATH = '/v1/public/zerodb/security';

  // API Key Management
  static async getAPIKeys(): Promise<APIKey[]> {
    try {
      const response = await apiClient.get(this.API_KEYS_PATH);
      return response.data as APIKey[];
    } catch (error: any) {
      throw new Error(`Failed to fetch API keys: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async createAPIKey(request: APIKeyCreateRequest): Promise<APIKeyCreateResponse> {
    try {
      const response = await apiClient.post(this.API_KEYS_PATH, request);
      return response.data as APIKeyCreateResponse;
    } catch (error: any) {
      throw new Error(`Failed to create API key: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getAPIKey(keyId: string): Promise<APIKey> {
    try {
      const response = await apiClient.get(`${this.API_KEYS_PATH}/${keyId}`);
      return response.data as APIKey;
    } catch (error: any) {
      throw new Error(`Failed to fetch API key: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async updateAPIKey(keyId: string, updates: Partial<APIKeyCreateRequest>): Promise<APIKey> {
    try {
      const response = await apiClient.put(`${this.API_KEYS_PATH}/${keyId}`, updates);
      return response.data as APIKey;
    } catch (error: any) {
      throw new Error(`Failed to update API key: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async deleteAPIKey(keyId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.API_KEYS_PATH}/${keyId}`);
    } catch (error: any) {
      throw new Error(`Failed to delete API key: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async rotateAPIKey(keyId: string): Promise<{ key: string; expires_at?: string }> {
    try {
      const response = await apiClient.post(`${this.API_KEYS_PATH}/${keyId}/rotate`);
      return response.data as { key: string; expires_at?: string };
    } catch (error: any) {
      throw new Error(`Failed to rotate API key: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Rate Limiting
  static async getRateLimits(): Promise<RateLimit[]> {
    try {
      const response = await apiClient.get(`${this.ACCESS_PATH}/rate-limits`);
      return response.data as RateLimit[];
    } catch (error: any) {
      throw new Error(`Failed to fetch rate limits: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async createRateLimit(request: RateLimitCreateRequest): Promise<RateLimit> {
    try {
      const response = await apiClient.post(`${this.ACCESS_PATH}/rate-limits`, request);
      return response.data as RateLimit;
    } catch (error: any) {
      throw new Error(`Failed to create rate limit: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async updateRateLimit(limitId: string, updates: Partial<RateLimitCreateRequest>): Promise<RateLimit> {
    try {
      const response = await apiClient.put(`${this.ACCESS_PATH}/rate-limits/${limitId}`, updates);
      return response.data as RateLimit;
    } catch (error: any) {
      throw new Error(`Failed to update rate limit: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async deleteRateLimit(limitId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.ACCESS_PATH}/rate-limits/${limitId}`);
    } catch (error: any) {
      throw new Error(`Failed to delete rate limit: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Audit Logs
  static async getAuditLogs(params?: {
    user_id?: string;
    api_key_id?: string;
    action?: string;
    resource_type?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number; page: number; limit: number }> {
    try {
      const response = await apiClient.get(`${this.AUDIT_PATH}/logs`, { params } as any);
      return response.data as { logs: AuditLog[]; total: number; page: number; limit: number };
    } catch (error: any) {
      throw new Error(`Failed to fetch audit logs: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getAuditLog(logId: string): Promise<AuditLog> {
    try {
      const response = await apiClient.get(`${this.AUDIT_PATH}/logs/${logId}`);
      return response.data as AuditLog;
    } catch (error: any) {
      throw new Error(`Failed to fetch audit log: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Security Events
  static async getSecurityEvents(params?: {
    event_type?: string;
    severity?: string;
    user_id?: string;
    resolved?: boolean;
    from_date?: string;
    to_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ events: SecurityEvent[]; total: number; page: number; limit: number }> {
    try {
      const response = await apiClient.get(`${this.SECURITY_PATH}/events`, { params } as any);
      return response.data as { events: SecurityEvent[]; total: number; page: number; limit: number };
    } catch (error: any) {
      throw new Error(`Failed to fetch security events: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async resolveSecurityEvent(eventId: string, resolution?: string): Promise<SecurityEvent> {
    try {
      const response = await apiClient.post(`${this.SECURITY_PATH}/events/${eventId}/resolve`, { resolution });
      return response.data as SecurityEvent;
    } catch (error: any) {
      throw new Error(`Failed to resolve security event: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Access Policies
  static async getAccessPolicies(): Promise<AccessPolicy[]> {
    try {
      const response = await apiClient.get(`${this.ACCESS_PATH}/policies`);
      return response.data as AccessPolicy[];
    } catch (error: any) {
      throw new Error(`Failed to fetch access policies: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async createAccessPolicy(request: AccessPolicyCreateRequest): Promise<AccessPolicy> {
    try {
      const response = await apiClient.post(`${this.ACCESS_PATH}/policies`, request);
      return response.data as AccessPolicy;
    } catch (error: any) {
      throw new Error(`Failed to create access policy: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async updateAccessPolicy(policyId: string, updates: Partial<AccessPolicyCreateRequest>): Promise<AccessPolicy> {
    try {
      const response = await apiClient.put(`${this.ACCESS_PATH}/policies/${policyId}`, updates);
      return response.data as AccessPolicy;
    } catch (error: any) {
      throw new Error(`Failed to update access policy: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async deleteAccessPolicy(policyId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.ACCESS_PATH}/policies/${policyId}`);
    } catch (error: any) {
      throw new Error(`Failed to delete access policy: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Security Analytics
  static async getSecurityMetrics(timeRange?: string): Promise<{
    total_api_calls: number;
    blocked_requests: number;
    rate_limited_requests: number;
    failed_authentications: number;
    security_events_by_type: Record<string, number>;
    top_api_keys_by_usage: Array<{ api_key_id: string; name: string; usage_count: number }>;
    suspicious_ips: Array<{ ip_address: string; event_count: number; last_seen: string }>;
  }> {
    try {
      const params = timeRange ? { time_range: timeRange } : {};
      const response = await apiClient.get(`${this.SECURITY_PATH}/metrics`, { params } as any);
      return response.data as {
        total_api_calls: number;
        blocked_requests: number;
        rate_limited_requests: number;
        failed_authentications: number;
        security_events_by_type: Record<string, number>;
        top_api_keys_by_usage: Array<{ api_key_id: string; name: string; usage_count: number }>;
        suspicious_ips: Array<{ ip_address: string; event_count: number; last_seen: string }>;
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch security metrics: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Permission Validation
  static async validatePermission(
    apiKeyId: string,
    resource: string,
    action: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    try {
      const response = await apiClient.post(`${this.ACCESS_PATH}/validate`, {
        api_key_id: apiKeyId,
        resource,
        action
      });
      return response.data as { allowed: boolean; reason?: string };
    } catch (error: any) {
      throw new Error(`Permission validation failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  // IP Whitelisting/Blacklisting
  static async getIPRestrictions(): Promise<Array<{
    id: string;
    ip_address: string;
    type: 'whitelist' | 'blacklist';
    description?: string;
    is_active: boolean;
    created_at: string;
  }>> {
    try {
      const response = await apiClient.get(`${this.SECURITY_PATH}/ip-restrictions`);
      return response.data as Array<{
        id: string;
        ip_address: string;
        type: 'whitelist' | 'blacklist';
        description?: string;
        is_active: boolean;
        created_at: string;
      }>;
    } catch (error: any) {
      throw new Error(`Failed to fetch IP restrictions: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async addIPRestriction(
    ipAddress: string,
    type: 'whitelist' | 'blacklist',
    description?: string
  ): Promise<void> {
    try {
      await apiClient.post(`${this.SECURITY_PATH}/ip-restrictions`, {
        ip_address: ipAddress,
        type,
        description
      });
    } catch (error: any) {
      throw new Error(`Failed to add IP restriction: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async removeIPRestriction(restrictionId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.SECURITY_PATH}/ip-restrictions/${restrictionId}`);
    } catch (error: any) {
      throw new Error(`Failed to remove IP restriction: ${error.response?.data?.detail || error.message}`);
    }
  }
}