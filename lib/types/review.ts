/**
 * Code Review System Types
 * Comprehensive type definitions for security, performance, and style reviews
 */

export type ReviewType = 'security' | 'performance' | 'style' | 'all';

export type ReviewSeverity = 'critical' | 'high' | 'medium' | 'low';
export type PerformanceSeverity = 'blocker' | 'major' | 'minor';

export interface CodeLocation {
  file: string;
  line: number;
  column?: number;
  snippet?: string;
}

/**
 * Security Review Interfaces
 */
export interface SecurityVulnerability {
  id: string;
  severity: ReviewSeverity;
  type: string; // "SQL Injection", "XSS", "CSRF", etc.
  location: CodeLocation;
  description: string;
  recommendation: string;
  cwe?: string; // CWE identifier (e.g., "CWE-79")
  owasp?: string; // OWASP Top 10 reference
  effort: 'low' | 'medium' | 'high'; // Fix effort estimation
}

export interface SecretDetection {
  id: string;
  type: 'api_key' | 'password' | 'token' | 'private_key' | 'certificate';
  location: CodeLocation;
  masked: string;
  confidence: number; // 0-100
  provider?: string; // e.g., "AWS", "GitHub", "Stripe"
}

export interface SecurityReviewResult {
  vulnerabilities: SecurityVulnerability[];
  secrets: SecretDetection[];
  score: number; // 0-100, higher is better
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
  compliantWith: string[]; // e.g., ["OWASP Top 10", "CWE Top 25"]
}

/**
 * Performance Review Interfaces
 */
export interface PerformanceIssue {
  id: string;
  severity: PerformanceSeverity;
  type: string; // "N+1 Query", "Blocking Operation", "Memory Leak", etc.
  location: CodeLocation;
  impact: string;
  suggestion: string;
  estimatedImprovement?: string; // e.g., "20% faster load time"
  autoFixable: boolean;
}

export interface PerformanceMetrics {
  estimatedLoadTime?: number; // milliseconds
  bundleSize?: number; // bytes
  renderTime?: number; // milliseconds
  memoryUsage?: number; // bytes
  cpuUsage?: number; // percentage
  networkRequests?: number;
  recommendations: string[];
}

export interface PerformanceReviewResult {
  issues: PerformanceIssue[];
  metrics: PerformanceMetrics;
  score: number; // 0-100, higher is better
  summary: {
    blocker: number;
    major: number;
    minor: number;
  };
  benchmarks?: {
    lighthouse?: number;
    webVitals?: {
      lcp?: number; // Largest Contentful Paint
      fid?: number; // First Input Delay
      cls?: number; // Cumulative Layout Shift
    };
  };
}

/**
 * Style Review Interfaces
 */
export interface StyleViolation {
  id: string;
  rule: string; // ESLint rule name or style guide rule
  location: CodeLocation;
  message: string;
  autoFixable: boolean;
  severity: 'error' | 'warning' | 'info';
  category: 'formatting' | 'naming' | 'structure' | 'best-practice';
}

export interface StyleReviewResult {
  violations: StyleViolation[];
  score: number; // 0-100, higher is better
  suggestions: string[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
    fixable: number;
  };
  compliance: {
    eslint?: boolean;
    prettier?: boolean;
    typescript?: boolean;
  };
}

/**
 * Combined Review Result
 */
export interface ReviewResult {
  id: string;
  timestamp: Date;
  type: ReviewType;
  files: string[];
  security?: SecurityReviewResult;
  performance?: PerformanceReviewResult;
  style?: StyleReviewResult;
  overallScore: number; // 0-100
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  duration?: number; // milliseconds
  metadata: {
    gitCommit?: string;
    gitBranch?: string;
    reviewer: 'ai' | 'human' | 'automated';
    triggeredBy: 'manual' | 'ci' | 'pr' | 'commit-hook';
  };
}

/**
 * Review Configuration
 */
export interface ReviewConfig {
  type: ReviewType;
  files?: string[];
  gitDiff?: boolean;
  sinceCommit?: string;
  exclude?: string[];
  options: {
    security?: {
      checkSecrets: boolean;
      owaspCheck: boolean;
      cweCheck: boolean;
      maxSeverity?: ReviewSeverity;
    };
    performance?: {
      checkBundleSize: boolean;
      checkRenderTime: boolean;
      checkMemory: boolean;
      benchmarkThreshold?: number;
    };
    style?: {
      autoFix: boolean;
      eslintConfig?: string;
      prettierConfig?: string;
      strictMode: boolean;
    };
  };
}

/**
 * Review History
 */
export interface ReviewHistoryItem {
  id: string;
  timestamp: Date;
  type: ReviewType;
  score: number;
  filesReviewed: number;
  issuesFound: number;
  status: 'completed' | 'failed';
}

/**
 * Review Statistics
 */
export interface ReviewStats {
  totalReviews: number;
  averageScore: number;
  totalIssuesFound: number;
  totalIssuesFixed: number;
  byType: {
    security: number;
    performance: number;
    style: number;
  };
  trends: {
    date: string;
    score: number;
    issues: number;
  }[];
}

/**
 * Review Export Options
 */
export interface ReviewExportOptions {
  format: 'pdf' | 'markdown' | 'json' | 'html';
  includeCode: boolean;
  includeRecommendations: boolean;
  groupBy: 'severity' | 'file' | 'type';
}

/**
 * Review Share Link
 */
export interface ReviewShareLink {
  id: string;
  reviewId: string;
  url: string;
  expiresAt: Date;
  password?: string;
  accessCount: number;
}
