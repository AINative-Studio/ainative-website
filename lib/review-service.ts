/**
 * Code Review Service
 * AI-powered code review with security, performance, and style analysis
 */

import {
  ReviewConfig,
  ReviewResult,
  SecurityReviewResult,
  PerformanceReviewResult,
  StyleReviewResult,
  SecurityVulnerability,
  SecretDetection,
  PerformanceIssue,
  StyleViolation,
  CodeLocation,
} from './types/review';

/**
 * Security patterns and detections
 */
const SECURITY_PATTERNS = {
  sql_injection: /(?:execute|query|sql)\s*\(\s*['"`].*?\$\{.*?\}/gi,
  xss: /innerHTML\s*=|dangerouslySetInnerHTML|eval\(|new\s+Function\(/gi,
  hardcoded_secrets: /(?:api[_-]?key|password|secret|token|private[_-]?key)\s*[=:]\s*['"`][^'"`]{8,}/gi,
  weak_crypto: /md5|sha1(?!\d)|base64(?!url)/gi,
  path_traversal: /\.\.\/|path\.join\([^)]*\.\./gi,
  csrf: /fetch\(|axios\.|XMLHttpRequest/gi,
  open_redirect: /window\.location\s*=|location\.href\s*=/gi,
};

const SECRET_PATTERNS = {
  aws_key: /AKIA[0-9A-Z]{16}/g,
  github_token: /gh[pousr]_[A-Za-z0-9_]{36,}/g,
  stripe_key: /sk_(?:test|live)_[0-9a-zA-Z]{24,}/g,
  generic_api_key: /api[_-]?key[_-]?[:=]\s*['"`]([a-zA-Z0-9_\-]{20,})/gi,
  jwt: /eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*/g,
  private_key: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g,
};

/**
 * Performance anti-patterns
 */
const PERFORMANCE_PATTERNS = {
  n_plus_one: /\.map\([^)]*\)\s*\.map\(/gi,
  blocking_operation: /(?:fs\.readFileSync|fs\.writeFileSync|crypto\.pbkdf2Sync)/gi,
  memory_leak: /setInterval\(|addEventListener\([^)]*\)(?!\s*return)/gi,
  unused_state: /useState\([^)]*\)(?![\s\S]{0,50}set[A-Z])/g,
  inefficient_render: /useEffect\(\s*\(\s*\)\s*=>\s*{[\s\S]*?}\s*\)/g,
  large_bundle: /import\s+.*\s+from\s+['"](?:lodash|moment|rxjs)['"]/gi,
};

/**
 * Style patterns
 */
const STYLE_PATTERNS = {
  console_log: /console\.(log|debug|info|warn|error)/gi,
  todo_comments: /\/\/\s*TODO|\/\/\s*FIXME|\/\/\s*HACK/gi,
  long_function: /function\s+\w+\s*\([^)]*\)\s*{[\s\S]{500,}}/g,
  magic_numbers: /(?<!const\s+\w+\s*=\s*)\b(?!0|1|100)\d{2,}\b/g,
  var_declaration: /\bvar\s+\w+/g,
};

export class ReviewService {
  /**
   * Perform comprehensive code review
   */
  async performReview(config: ReviewConfig): Promise<ReviewResult> {
    const startTime = Date.now();
    const reviewId = this.generateReviewId();

    let files: string[] = [];
    let fileContents: Map<string, string> = new Map();

    // Get files to review
    if (config.gitDiff) {
      files = await this.getGitDiffFiles(config.sinceCommit);
    } else if (config.files && config.files.length > 0) {
      files = config.files;
    }

    // Read file contents (in real implementation, would read from filesystem)
    for (const file of files) {
      // Simulated file reading - in production, use fs.readFileSync or similar
      fileContents.set(file, '');
    }

    const result: ReviewResult = {
      id: reviewId,
      timestamp: new Date(),
      type: config.type,
      files,
      overallScore: 0,
      status: 'in_progress',
      metadata: {
        reviewer: 'ai',
        triggeredBy: 'manual',
      },
    };

    // Perform specific review types
    if (config.type === 'security' || config.type === 'all') {
      result.security = await this.performSecurityReview(
        fileContents,
        config.options.security
      );
    }

    if (config.type === 'performance' || config.type === 'all') {
      result.performance = await this.performPerformanceReview(
        fileContents,
        config.options.performance
      );
    }

    if (config.type === 'style' || config.type === 'all') {
      result.style = await this.performStyleReview(
        fileContents,
        config.options.style
      );
    }

    // Calculate overall score
    result.overallScore = this.calculateOverallScore(result);
    result.status = 'completed';
    result.duration = Date.now() - startTime;

    return result;
  }

  /**
   * Security Review
   */
  private async performSecurityReview(
    files: Map<string, string>,
    options?: ReviewConfig['options']['security']
  ): Promise<SecurityReviewResult> {
    const vulnerabilities: SecurityVulnerability[] = [];
    const secrets: SecretDetection[] = [];

    for (const [filePath, content] of files.entries()) {
      // Check for vulnerabilities
      for (const [vulnType, pattern] of Object.entries(SECURITY_PATTERNS)) {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
          const lineNumber = this.getLineNumber(content, match.index || 0);
          vulnerabilities.push({
            id: this.generateId(),
            severity: this.getSecuritySeverity(vulnType),
            type: this.formatVulnerabilityType(vulnType),
            location: {
              file: filePath,
              line: lineNumber,
              snippet: this.getCodeSnippet(content, lineNumber),
            },
            description: this.getSecurityDescription(vulnType),
            recommendation: this.getSecurityRecommendation(vulnType),
            cwe: this.getCWE(vulnType),
            owasp: this.getOWASP(vulnType),
            effort: this.getFixEffort(vulnType),
          });
        }
      }

      // Check for secrets
      if (options?.checkSecrets !== false) {
        for (const [secretType, pattern] of Object.entries(SECRET_PATTERNS)) {
          const matches = content.matchAll(pattern);
          for (const match of matches) {
            const lineNumber = this.getLineNumber(content, match.index || 0);
            secrets.push({
              id: this.generateId(),
              type: this.getSecretType(secretType),
              location: {
                file: filePath,
                line: lineNumber,
              },
              masked: this.maskSecret(match[0]),
              confidence: 95,
              provider: this.getSecretProvider(secretType),
            });
          }
        }
      }
    }

    const summary = {
      critical: vulnerabilities.filter((v) => v.severity === 'critical').length,
      high: vulnerabilities.filter((v) => v.severity === 'high').length,
      medium: vulnerabilities.filter((v) => v.severity === 'medium').length,
      low: vulnerabilities.filter((v) => v.severity === 'low').length,
    };

    const score = this.calculateSecurityScore(vulnerabilities, secrets);

    return {
      vulnerabilities,
      secrets,
      score,
      summary,
      recommendations: this.generateSecurityRecommendations(vulnerabilities),
      compliantWith: score >= 80 ? ['OWASP Top 10'] : [],
    };
  }

  /**
   * Performance Review
   */
  private async performPerformanceReview(
    files: Map<string, string>,
    options?: ReviewConfig['options']['performance']
  ): Promise<PerformanceReviewResult> {
    const issues: PerformanceIssue[] = [];

    for (const [filePath, content] of files.entries()) {
      for (const [issueType, pattern] of Object.entries(PERFORMANCE_PATTERNS)) {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
          const lineNumber = this.getLineNumber(content, match.index || 0);
          issues.push({
            id: this.generateId(),
            severity: this.getPerformanceSeverity(issueType),
            type: this.formatPerformanceType(issueType),
            location: {
              file: filePath,
              line: lineNumber,
              snippet: this.getCodeSnippet(content, lineNumber),
            },
            impact: this.getPerformanceImpact(issueType),
            suggestion: this.getPerformanceSuggestion(issueType),
            estimatedImprovement: this.getEstimatedImprovement(issueType),
            autoFixable: this.isAutoFixable(issueType),
          });
        }
      }
    }

    const summary = {
      blocker: issues.filter((i) => i.severity === 'blocker').length,
      major: issues.filter((i) => i.severity === 'major').length,
      minor: issues.filter((i) => i.severity === 'minor').length,
    };

    const metrics = this.estimatePerformanceMetrics(files, issues);
    const score = this.calculatePerformanceScore(issues, metrics);

    return {
      issues,
      metrics,
      score,
      summary,
    };
  }

  /**
   * Style Review
   */
  private async performStyleReview(
    files: Map<string, string>,
    options?: ReviewConfig['options']['style']
  ): Promise<StyleReviewResult> {
    const violations: StyleViolation[] = [];

    for (const [filePath, content] of files.entries()) {
      for (const [ruleType, pattern] of Object.entries(STYLE_PATTERNS)) {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
          const lineNumber = this.getLineNumber(content, match.index || 0);
          violations.push({
            id: this.generateId(),
            rule: this.formatRuleName(ruleType),
            location: {
              file: filePath,
              line: lineNumber,
              snippet: this.getCodeSnippet(content, lineNumber),
            },
            message: this.getStyleMessage(ruleType),
            autoFixable: this.isStyleAutoFixable(ruleType),
            severity: this.getStyleSeverity(ruleType),
            category: this.getStyleCategory(ruleType),
          });
        }
      }
    }

    const summary = {
      errors: violations.filter((v) => v.severity === 'error').length,
      warnings: violations.filter((v) => v.severity === 'warning').length,
      info: violations.filter((v) => v.severity === 'info').length,
      fixable: violations.filter((v) => v.autoFixable).length,
    };

    const score = this.calculateStyleScore(violations);

    return {
      violations,
      score,
      suggestions: this.generateStyleSuggestions(violations),
      summary,
      compliance: {
        eslint: summary.errors === 0,
        prettier: true,
        typescript: true,
      },
    };
  }

  // Helper Methods

  private async getGitDiffFiles(sinceCommit?: string): Promise<string[]> {
    // In production, use child_process to run git commands
    return [];
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private getCodeSnippet(content: string, lineNumber: number): string {
    const lines = content.split('\n');
    const start = Math.max(0, lineNumber - 2);
    const end = Math.min(lines.length, lineNumber + 2);
    return lines.slice(start, end).join('\n');
  }

  private getSecuritySeverity(type: string): 'critical' | 'high' | 'medium' | 'low' {
    const severityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
      sql_injection: 'critical',
      xss: 'high',
      hardcoded_secrets: 'critical',
      weak_crypto: 'high',
      path_traversal: 'high',
      csrf: 'medium',
      open_redirect: 'medium',
    };
    return severityMap[type] || 'medium';
  }

  private formatVulnerabilityType(type: string): string {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getSecurityDescription(type: string): string {
    const descriptions: Record<string, string> = {
      sql_injection: 'Potential SQL injection vulnerability detected. User input may be directly concatenated into SQL queries.',
      xss: 'Cross-Site Scripting (XSS) vulnerability detected. Unescaped user input may be rendered in the DOM.',
      hardcoded_secrets: 'Hardcoded secret or API key detected. Credentials should be stored in environment variables.',
      weak_crypto: 'Weak cryptographic algorithm detected. Consider using stronger alternatives.',
      path_traversal: 'Path traversal vulnerability detected. User input may manipulate file paths.',
      csrf: 'Potential CSRF vulnerability. Consider implementing CSRF tokens.',
      open_redirect: 'Open redirect vulnerability detected. Validate redirect URLs.',
    };
    return descriptions[type] || 'Security issue detected.';
  }

  private getSecurityRecommendation(type: string): string {
    const recommendations: Record<string, string> = {
      sql_injection: 'Use parameterized queries or an ORM to prevent SQL injection.',
      xss: 'Sanitize user input and use context-aware escaping (e.g., DOMPurify).',
      hardcoded_secrets: 'Move secrets to environment variables and use a secrets manager.',
      weak_crypto: 'Use SHA-256 or bcrypt for hashing, AES-256 for encryption.',
      path_traversal: 'Validate and sanitize file paths. Use path.resolve() and check against a whitelist.',
      csrf: 'Implement CSRF tokens for state-changing operations.',
      open_redirect: 'Validate redirect URLs against a whitelist of allowed domains.',
    };
    return recommendations[type] || 'Review and fix this security issue.';
  }

  private getCWE(type: string): string | undefined {
    const cweMap: Record<string, string> = {
      sql_injection: 'CWE-89',
      xss: 'CWE-79',
      hardcoded_secrets: 'CWE-798',
      weak_crypto: 'CWE-327',
      path_traversal: 'CWE-22',
      csrf: 'CWE-352',
      open_redirect: 'CWE-601',
    };
    return cweMap[type];
  }

  private getOWASP(type: string): string | undefined {
    const owaspMap: Record<string, string> = {
      sql_injection: 'A03:2021 - Injection',
      xss: 'A03:2021 - Injection',
      hardcoded_secrets: 'A02:2021 - Cryptographic Failures',
      weak_crypto: 'A02:2021 - Cryptographic Failures',
      csrf: 'A01:2021 - Broken Access Control',
      open_redirect: 'A01:2021 - Broken Access Control',
    };
    return owaspMap[type];
  }

  private getFixEffort(type: string): 'low' | 'medium' | 'high' {
    const effortMap: Record<string, 'low' | 'medium' | 'high'> = {
      sql_injection: 'medium',
      xss: 'low',
      hardcoded_secrets: 'low',
      weak_crypto: 'medium',
      path_traversal: 'medium',
      csrf: 'high',
      open_redirect: 'low',
    };
    return effortMap[type] || 'medium';
  }

  private getSecretType(type: string): 'api_key' | 'password' | 'token' | 'private_key' | 'certificate' {
    if (type.includes('key') && !type.includes('private')) return 'api_key';
    if (type.includes('token')) return 'token';
    if (type.includes('private')) return 'private_key';
    return 'api_key';
  }

  private maskSecret(secret: string): string {
    if (secret.length <= 8) return '***';
    return secret.substring(0, 4) + '***' + secret.substring(secret.length - 4);
  }

  private getSecretProvider(type: string): string | undefined {
    const providerMap: Record<string, string> = {
      aws_key: 'AWS',
      github_token: 'GitHub',
      stripe_key: 'Stripe',
    };
    return providerMap[type];
  }

  private calculateSecurityScore(
    vulnerabilities: SecurityVulnerability[],
    secrets: SecretDetection[]
  ): number {
    let score = 100;
    vulnerabilities.forEach((vuln) => {
      const penalties = { critical: 30, high: 15, medium: 5, low: 2 };
      score -= penalties[vuln.severity];
    });
    score -= secrets.length * 10;
    return Math.max(0, Math.min(100, score));
  }

  private generateSecurityRecommendations(
    vulnerabilities: SecurityVulnerability[]
  ): string[] {
    const recommendations = new Set<string>();
    vulnerabilities.forEach((vuln) => {
      recommendations.add(vuln.recommendation);
    });
    return Array.from(recommendations);
  }

  private getPerformanceSeverity(type: string): 'blocker' | 'major' | 'minor' {
    const severityMap: Record<string, 'blocker' | 'major' | 'minor'> = {
      n_plus_one: 'major',
      blocking_operation: 'blocker',
      memory_leak: 'blocker',
      unused_state: 'minor',
      inefficient_render: 'major',
      large_bundle: 'major',
    };
    return severityMap[type] || 'minor';
  }

  private formatPerformanceType(type: string): string {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getPerformanceImpact(type: string): string {
    const impacts: Record<string, string> = {
      n_plus_one: 'Multiple iterations causing inefficient rendering and performance degradation.',
      blocking_operation: 'Synchronous file operations block the event loop, causing UI freezes.',
      memory_leak: 'Event listeners or intervals not cleaned up, leading to memory leaks.',
      unused_state: 'Unused state variable increases memory footprint unnecessarily.',
      inefficient_render: 'Component re-renders more frequently than necessary.',
      large_bundle: 'Large dependencies increase bundle size and load time.',
    };
    return impacts[type] || 'Performance impact detected.';
  }

  private getPerformanceSuggestion(type: string): string {
    const suggestions: Record<string, string> = {
      n_plus_one: 'Combine map operations or use a single iteration.',
      blocking_operation: 'Use async versions (readFile, writeFile) instead of sync operations.',
      memory_leak: 'Add cleanup in useEffect return function or remove event listeners.',
      unused_state: 'Remove unused state variables to reduce memory usage.',
      inefficient_render: 'Use useMemo, useCallback, or React.memo to optimize re-renders.',
      large_bundle: 'Import only needed functions (e.g., import debounce from "lodash/debounce").',
    };
    return suggestions[type] || 'Review and optimize performance.';
  }

  private getEstimatedImprovement(type: string): string | undefined {
    const improvements: Record<string, string> = {
      blocking_operation: '50-70% faster execution',
      large_bundle: '20-40% smaller bundle size',
      inefficient_render: '30-50% fewer re-renders',
    };
    return improvements[type];
  }

  private isAutoFixable(type: string): boolean {
    return ['large_bundle', 'unused_state'].includes(type);
  }

  private estimatePerformanceMetrics(
    files: Map<string, string>,
    issues: PerformanceIssue[]
  ): PerformanceReviewResult['metrics'] {
    const totalSize = Array.from(files.values()).reduce((acc, content) => acc + content.length, 0);

    return {
      bundleSize: totalSize,
      recommendations: [
        'Consider code splitting for large components',
        'Implement lazy loading for routes',
        'Optimize images and assets',
      ],
    };
  }

  private calculatePerformanceScore(
    issues: PerformanceIssue[],
    metrics: PerformanceReviewResult['metrics']
  ): number {
    let score = 100;
    issues.forEach((issue) => {
      const penalties = { blocker: 25, major: 10, minor: 3 };
      score -= penalties[issue.severity];
    });
    return Math.max(0, Math.min(100, score));
  }

  private formatRuleName(type: string): string {
    return type.replace(/_/g, '-');
  }

  private getStyleMessage(type: string): string {
    const messages: Record<string, string> = {
      console_log: 'Remove console statements before committing.',
      todo_comments: 'TODO/FIXME comments should be tracked as issues.',
      long_function: 'Function is too long. Consider breaking it into smaller functions.',
      magic_numbers: 'Magic number detected. Extract to a named constant.',
      var_declaration: "Use 'const' or 'let' instead of 'var'.",
    };
    return messages[type] || 'Style issue detected.';
  }

  private isStyleAutoFixable(type: string): boolean {
    return ['var_declaration', 'console_log'].includes(type);
  }

  private getStyleSeverity(type: string): 'error' | 'warning' | 'info' {
    const severityMap: Record<string, 'error' | 'warning' | 'info'> = {
      console_log: 'warning',
      todo_comments: 'info',
      long_function: 'warning',
      magic_numbers: 'warning',
      var_declaration: 'error',
    };
    return severityMap[type] || 'warning';
  }

  private getStyleCategory(type: string): 'formatting' | 'naming' | 'structure' | 'best-practice' {
    const categoryMap: Record<string, 'formatting' | 'naming' | 'structure' | 'best-practice'> = {
      console_log: 'best-practice',
      todo_comments: 'best-practice',
      long_function: 'structure',
      magic_numbers: 'best-practice',
      var_declaration: 'best-practice',
    };
    return categoryMap[type] || 'best-practice';
  }

  private calculateStyleScore(violations: StyleViolation[]): number {
    let score = 100;
    violations.forEach((violation) => {
      const penalties = { error: 5, warning: 2, info: 1 };
      score -= penalties[violation.severity];
    });
    return Math.max(0, Math.min(100, score));
  }

  private generateStyleSuggestions(violations: StyleViolation[]): string[] {
    const suggestions = new Set<string>();
    if (violations.some((v) => v.autoFixable)) {
      suggestions.add('Run ESLint with --fix to automatically fix some issues.');
    }
    if (violations.some((v) => v.category === 'structure')) {
      suggestions.add('Consider refactoring large functions into smaller, focused functions.');
    }
    return Array.from(suggestions);
  }

  private calculateOverallScore(result: ReviewResult): number {
    const scores: number[] = [];
    if (result.security) scores.push(result.security.score);
    if (result.performance) scores.push(result.performance.score);
    if (result.style) scores.push(result.style.score);

    return scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  }

  private generateReviewId(): string {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const reviewService = new ReviewService();
