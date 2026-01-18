/**
 * Review Export Service
 * Export review results to various formats (PDF, Markdown, JSON, HTML)
 */

import { ReviewResult, ReviewExportOptions } from './types/review';

export class ReviewExportService {
  /**
   * Export review result to specified format
   */
  async exportReview(
    result: ReviewResult,
    options: ReviewExportOptions
  ): Promise<string | Blob> {
    switch (options.format) {
      case 'markdown':
        return this.exportToMarkdown(result, options);
      case 'json':
        return this.exportToJSON(result, options);
      case 'html':
        return this.exportToHTML(result, options);
      case 'pdf':
        return this.exportToPDF(result, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  /**
   * Export to Markdown format
   */
  private exportToMarkdown(
    result: ReviewResult,
    options: ReviewExportOptions
  ): string {
    let markdown = '';

    // Header
    markdown += `# Code Review Report\n\n`;
    markdown += `**Review ID:** ${result.id}\n`;
    markdown += `**Date:** ${new Date(result.timestamp).toLocaleString()}\n`;
    markdown += `**Type:** ${result.type.toUpperCase()}\n`;
    markdown += `**Overall Score:** ${result.overallScore}/100\n\n`;

    // Summary
    markdown += `## Summary\n\n`;
    markdown += `- **Files Reviewed:** ${result.files.length}\n`;
    markdown += `- **Duration:** ${result.duration}ms\n`;
    markdown += `- **Status:** ${result.status}\n\n`;

    // Security Section
    if (result.security) {
      markdown += `## Security Review\n\n`;
      markdown += `**Score:** ${result.security.score}/100\n\n`;

      // Vulnerabilities
      if (result.security.vulnerabilities.length > 0) {
        markdown += `### Vulnerabilities (${result.security.vulnerabilities.length})\n\n`;

        if (options.groupBy === 'severity') {
          const grouped = this.groupBySeverity(result.security.vulnerabilities);
          for (const [severity, vulns] of Object.entries(grouped)) {
            if (vulns.length > 0) {
              markdown += `#### ${severity.toUpperCase()} (${vulns.length})\n\n`;
              vulns.forEach((vuln) => {
                markdown += this.formatVulnerabilityMarkdown(vuln, options);
              });
            }
          }
        } else if (options.groupBy === 'file') {
          const grouped = this.groupByFile(result.security.vulnerabilities);
          for (const [file, vulns] of Object.entries(grouped)) {
            markdown += `#### ${file}\n\n`;
            vulns.forEach((vuln) => {
              markdown += this.formatVulnerabilityMarkdown(vuln, options);
            });
          }
        } else {
          result.security.vulnerabilities.forEach((vuln) => {
            markdown += this.formatVulnerabilityMarkdown(vuln, options);
          });
        }
      }

      // Secrets
      if (result.security.secrets.length > 0) {
        markdown += `### Hardcoded Secrets (${result.security.secrets.length})\n\n`;
        result.security.secrets.forEach((secret) => {
          markdown += `- **${secret.type}** in \`${secret.location.file}:${secret.location.line}\`\n`;
          markdown += `  - Masked: \`${secret.masked}\`\n`;
          markdown += `  - Confidence: ${secret.confidence}%\n`;
          if (secret.provider) markdown += `  - Provider: ${secret.provider}\n`;
          markdown += `\n`;
        });
      }

      // Recommendations
      if (
        options.includeRecommendations &&
        result.security.recommendations.length > 0
      ) {
        markdown += `### Recommendations\n\n`;
        result.security.recommendations.forEach((rec) => {
          markdown += `- ${rec}\n`;
        });
        markdown += `\n`;
      }
    }

    // Performance Section
    if (result.performance) {
      markdown += `## Performance Review\n\n`;
      markdown += `**Score:** ${result.performance.score}/100\n\n`;

      if (result.performance.issues.length > 0) {
        markdown += `### Performance Issues (${result.performance.issues.length})\n\n`;

        if (options.groupBy === 'severity') {
          const grouped = this.groupBySeverity(result.performance.issues);
          for (const [severity, issues] of Object.entries(grouped)) {
            if (issues.length > 0) {
              markdown += `#### ${severity.toUpperCase()} (${issues.length})\n\n`;
              issues.forEach((issue) => {
                markdown += this.formatPerformanceIssueMarkdown(issue, options);
              });
            }
          }
        } else {
          result.performance.issues.forEach((issue) => {
            markdown += this.formatPerformanceIssueMarkdown(issue, options);
          });
        }
      }

      // Metrics
      if (result.performance.metrics) {
        markdown += `### Performance Metrics\n\n`;
        const metrics = result.performance.metrics;
        if (metrics.bundleSize) {
          markdown += `- **Bundle Size:** ${(metrics.bundleSize / 1024).toFixed(2)} KB\n`;
        }
        if (metrics.estimatedLoadTime) {
          markdown += `- **Estimated Load Time:** ${metrics.estimatedLoadTime}ms\n`;
        }
        markdown += `\n`;

        if (options.includeRecommendations && metrics.recommendations) {
          markdown += `#### Recommendations\n\n`;
          metrics.recommendations.forEach((rec) => {
            markdown += `- ${rec}\n`;
          });
          markdown += `\n`;
        }
      }
    }

    // Style Section
    if (result.style) {
      markdown += `## Style Review\n\n`;
      markdown += `**Score:** ${result.style.score}/100\n\n`;

      if (result.style.violations.length > 0) {
        markdown += `### Style Violations (${result.style.violations.length})\n\n`;

        if (options.groupBy === 'severity') {
          const grouped = this.groupBySeverity(result.style.violations);
          for (const [severity, violations] of Object.entries(grouped)) {
            if (violations.length > 0) {
              markdown += `#### ${severity.toUpperCase()} (${violations.length})\n\n`;
              violations.forEach((violation) => {
                markdown += this.formatStyleViolationMarkdown(violation, options);
              });
            }
          }
        } else {
          result.style.violations.forEach((violation) => {
            markdown += this.formatStyleViolationMarkdown(violation, options);
          });
        }
      }

      if (options.includeRecommendations && result.style.suggestions.length > 0) {
        markdown += `### Suggestions\n\n`;
        result.style.suggestions.forEach((suggestion) => {
          markdown += `- ${suggestion}\n`;
        });
        markdown += `\n`;
      }
    }

    // Footer
    markdown += `---\n\n`;
    markdown += `*Generated by AINative Code Review on ${new Date().toLocaleString()}*\n`;

    return markdown;
  }

  /**
   * Export to JSON format
   */
  private exportToJSON(result: ReviewResult, options: ReviewExportOptions): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * Export to HTML format
   */
  private exportToHTML(result: ReviewResult, options: ReviewExportOptions): string {
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Review Report - ${result.id}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .score {
            font-size: 48px;
            font-weight: bold;
        }
        .score.excellent { color: #22c55e; }
        .score.good { color: #eab308; }
        .score.poor { color: #ef4444; }
        .section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .issue {
            border-left: 4px solid #ddd;
            padding: 15px;
            margin: 10px 0;
            background: #f9f9f9;
        }
        .issue.critical { border-left-color: #ef4444; }
        .issue.high { border-left-color: #f97316; }
        .issue.medium { border-left-color: #eab308; }
        .issue.low { border-left-color: #3b82f6; }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge.critical { background: #fee2e2; color: #991b1b; }
        .badge.high { background: #fed7aa; color: #9a3412; }
        .badge.medium { background: #fef3c7; color: #854d0e; }
        .badge.low { background: #dbeafe; color: #1e40af; }
        code {
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 14px;
        }
        pre {
            background: #1e293b;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Code Review Report</h1>
        <p><strong>Review ID:</strong> ${result.id}</p>
        <p><strong>Date:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
        <p><strong>Type:</strong> ${result.type.toUpperCase()}</p>
        <div class="score ${this.getScoreClass(result.overallScore)}">
            ${result.overallScore}/100
        </div>
        <p>Files Reviewed: ${result.files.length} | Duration: ${result.duration}ms</p>
    </div>
`;

    // Add sections for each review type
    if (result.security) {
      html += this.formatSecurityHTML(result.security, options);
    }
    if (result.performance) {
      html += this.formatPerformanceHTML(result.performance, options);
    }
    if (result.style) {
      html += this.formatStyleHTML(result.style, options);
    }

    html += `
    <div class="section">
        <p><em>Generated by AINative Code Review on ${new Date().toLocaleString()}</em></p>
    </div>
</body>
</html>
`;

    return html;
  }

  /**
   * Export to PDF format
   * Note: In production, this would use a library like puppeteer or jsPDF
   */
  private async exportToPDF(
    result: ReviewResult,
    options: ReviewExportOptions
  ): Promise<Blob> {
    // Generate HTML first
    const html = this.exportToHTML(result, options);

    // In production, convert HTML to PDF using puppeteer or similar
    // For now, return a Blob with HTML content
    return new Blob([html], { type: 'text/html' });
  }

  // Helper Methods

  private formatVulnerabilityMarkdown(vuln: any, options: ReviewExportOptions): string {
    let md = `**${vuln.type}** - \`${vuln.location.file}:${vuln.location.line}\`\n\n`;
    md += `- **Severity:** ${vuln.severity.toUpperCase()}\n`;
    md += `- **Description:** ${vuln.description}\n`;
    md += `- **Recommendation:** ${vuln.recommendation}\n`;
    if (vuln.cwe) md += `- **CWE:** ${vuln.cwe}\n`;
    if (vuln.owasp) md += `- **OWASP:** ${vuln.owasp}\n`;

    if (options.includeCode && vuln.location.snippet) {
      md += `\n\`\`\`\n${vuln.location.snippet}\n\`\`\`\n`;
    }

    md += `\n`;
    return md;
  }

  private formatPerformanceIssueMarkdown(issue: any, options: ReviewExportOptions): string {
    let md = `**${issue.type}** - \`${issue.location.file}:${issue.location.line}\`\n\n`;
    md += `- **Severity:** ${issue.severity.toUpperCase()}\n`;
    md += `- **Impact:** ${issue.impact}\n`;
    md += `- **Suggestion:** ${issue.suggestion}\n`;
    if (issue.estimatedImprovement) {
      md += `- **Est. Improvement:** ${issue.estimatedImprovement}\n`;
    }

    if (options.includeCode && issue.location.snippet) {
      md += `\n\`\`\`\n${issue.location.snippet}\n\`\`\`\n`;
    }

    md += `\n`;
    return md;
  }

  private formatStyleViolationMarkdown(violation: any, options: ReviewExportOptions): string {
    let md = `**${violation.rule}** - \`${violation.location.file}:${violation.location.line}\`\n\n`;
    md += `- **Severity:** ${violation.severity}\n`;
    md += `- **Category:** ${violation.category}\n`;
    md += `- **Message:** ${violation.message}\n`;
    if (violation.autoFixable) md += `- **Auto-fixable:** Yes\n`;

    if (options.includeCode && violation.location.snippet) {
      md += `\n\`\`\`\n${violation.location.snippet}\n\`\`\`\n`;
    }

    md += `\n`;
    return md;
  }

  private formatSecurityHTML(security: any, options: ReviewExportOptions): string {
    let html = `<div class="section"><h2>Security Review</h2><p><strong>Score:</strong> ${security.score}/100</p>`;

    if (security.vulnerabilities.length > 0) {
      html += `<h3>Vulnerabilities (${security.vulnerabilities.length})</h3>`;
      security.vulnerabilities.forEach((vuln: any) => {
        html += `
          <div class="issue ${vuln.severity}">
            <span class="badge ${vuln.severity}">${vuln.severity}</span>
            <strong>${vuln.type}</strong>
            <p>${vuln.description}</p>
            <p><code>${vuln.location.file}:${vuln.location.line}</code></p>
            <p><strong>Recommendation:</strong> ${vuln.recommendation}</p>
          </div>
        `;
      });
    }

    html += `</div>`;
    return html;
  }

  private formatPerformanceHTML(performance: any, options: ReviewExportOptions): string {
    let html = `<div class="section"><h2>Performance Review</h2><p><strong>Score:</strong> ${performance.score}/100</p>`;

    if (performance.issues.length > 0) {
      html += `<h3>Performance Issues (${performance.issues.length})</h3>`;
      performance.issues.forEach((issue: any) => {
        html += `
          <div class="issue ${issue.severity}">
            <span class="badge ${issue.severity}">${issue.severity}</span>
            <strong>${issue.type}</strong>
            <p>${issue.impact}</p>
            <p><code>${issue.location.file}:${issue.location.line}</code></p>
            <p><strong>Suggestion:</strong> ${issue.suggestion}</p>
          </div>
        `;
      });
    }

    html += `</div>`;
    return html;
  }

  private formatStyleHTML(style: any, options: ReviewExportOptions): string {
    let html = `<div class="section"><h2>Style Review</h2><p><strong>Score:</strong> ${style.score}/100</p>`;

    if (style.violations.length > 0) {
      html += `<h3>Style Violations (${style.violations.length})</h3>`;
      style.violations.forEach((violation: any) => {
        html += `
          <div class="issue ${violation.severity}">
            <span class="badge ${violation.severity}">${violation.severity}</span>
            <strong>${violation.rule}</strong>
            <p>${violation.message}</p>
            <p><code>${violation.location.file}:${violation.location.line}</code></p>
          </div>
        `;
      });
    }

    html += `</div>`;
    return html;
  }

  private groupBySeverity(items: any[]): Record<string, any[]> {
    return items.reduce((acc, item) => {
      const severity = item.severity || 'unknown';
      if (!acc[severity]) acc[severity] = [];
      acc[severity].push(item);
      return acc;
    }, {});
  }

  private groupByFile(items: any[]): Record<string, any[]> {
    return items.reduce((acc, item) => {
      const file = item.location?.file || 'unknown';
      if (!acc[file]) acc[file] = [];
      acc[file].push(item);
      return acc;
    }, {});
  }

  private getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'poor';
  }

  /**
   * Download file
   */
  downloadFile(content: string | Blob, filename: string): void {
    const blob =
      typeof content === 'string'
        ? new Blob([content], { type: 'text/plain' })
        : content;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const reviewExportService = new ReviewExportService();
