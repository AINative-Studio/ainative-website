/**
 * Code Analysis Service - Backend integration for Code Analysis Dashboard
 * Integrates with all backend code analysis endpoints
 */

import apiClient from './api-client';

// Types
export interface CodeIssue {
  id: string;
  type: 'error' | 'warning' | 'info' | 'suggestion';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  line: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  code: string;
  category: 'syntax' | 'logic' | 'performance' | 'security' | 'style' | 'best-practice';
  fixable: boolean;
  suggestion?: string;
  documentation?: string;
}

export interface ScanResult {
  id: string;
  language: string;
  fileName?: string;
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  issues: CodeIssue[];
  metrics: {
    linesOfCode: number;
    complexity: number;
    maintainabilityIndex: number;
    testCoverage?: number;
  };
  timestamp: string;
  duration: number;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
}

export interface ScanHistoryItem {
  id: string;
  fileName?: string;
  language: string;
  totalIssues: number;
  criticalCount: number;
  timestamp: string;
  duration: number;
  status: 'completed' | 'failed';
}

export interface AnalysisRule {
  id: string;
  name: string;
  description: string;
  category: 'syntax' | 'logic' | 'performance' | 'security' | 'style' | 'best-practice';
  severity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  language: string[];
  fixable: boolean;
}

export interface ScanRequest {
  code: string;
  language: string;
  fileName?: string;
  rules?: string[];
}

export interface FixRequest {
  scanId: string;
  issueIds: string[];
}

export interface FixResult {
  success: boolean;
  fixedCode: string;
  fixedIssues: string[];
  remainingIssues: CodeIssue[];
}

// Code Analysis Service
const codeAnalysisService = {
  /**
   * Scan code for issues
   */
  async scanCode(request: ScanRequest): Promise<ScanResult> {
    const response = await apiClient.post<ScanResult>('/v1/code-analysis/scan', request);
    return response.data;
  },

  /**
   * Get scan results by ID
   */
  async getScanResult(scanId: string): Promise<ScanResult> {
    const response = await apiClient.get<ScanResult>(`/v1/code-analysis/${scanId}`);
    return response.data;
  },

  /**
   * Get scan history
   */
  async getScanHistory(limit: number = 10): Promise<ScanHistoryItem[]> {
    const response = await apiClient.get<{ scans: ScanHistoryItem[] }>(
      `/v1/code-analysis/history?limit=${limit}`
    );
    return response.data.scans || [];
  },

  /**
   * Auto-fix issues
   */
  async fixIssues(request: FixRequest): Promise<FixResult> {
    const response = await apiClient.post<FixResult>('/v1/code-analysis/fix', request);
    return response.data;
  },

  /**
   * Get available analysis rules
   */
  async getRules(language?: string): Promise<AnalysisRule[]> {
    const endpoint = language
      ? `/v1/code-analysis/rules?language=${language}`
      : '/v1/code-analysis/rules';
    const response = await apiClient.get<{ rules: AnalysisRule[] }>(endpoint);
    return response.data.rules || [];
  },

  /**
   * Update rule settings
   */
  async updateRule(ruleId: string, enabled: boolean): Promise<{ success: boolean }> {
    const response = await apiClient.put<{ success: boolean }>(
      `/v1/code-analysis/rules/${ruleId}`,
      { enabled }
    );
    return response.data;
  },

  /**
   * Delete scan result
   */
  async deleteScan(scanId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/v1/code-analysis/${scanId}`
    );
    return response.data;
  },
};

export default codeAnalysisService;
