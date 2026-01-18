# Code Review Command Feature

AI-powered code review system inspired by Gemini CLI feature request #16947. This feature provides comprehensive security, performance, and style analysis for your codebase.

## Features

### Review Types

1. **Security Review**
   - Vulnerability detection (SQL injection, XSS, CSRF, etc.)
   - Hardcoded secrets detection (API keys, tokens, passwords)
   - OWASP Top 10 compliance checking
   - CWE (Common Weakness Enumeration) mapping
   - Severity classification (Critical, High, Medium, Low)

2. **Performance Review**
   - N+1 query detection
   - Blocking operation identification
   - Memory leak detection
   - Inefficient rendering patterns
   - Bundle size analysis
   - Performance metrics estimation

3. **Style Review**
   - Code style violations
   - ESLint rule checking
   - Best practices enforcement
   - Auto-fixable issues identification
   - Naming convention validation

## Components

### ReviewCommand (`ReviewCommand.tsx`)

Main interface for configuring and running code reviews.

**Features:**
- Review type selection (Security, Performance, Style, All)
- File selection or Git diff mode
- Configurable review options
- Real-time review execution
- Results display

**Usage:**
```tsx
import { ReviewCommand } from '@/components/commands/ReviewCommand';

function MyPage() {
  return <ReviewCommand />;
}
```

### ReviewResultsDisplay (`ReviewResultsDisplay.tsx`)

Displays detailed review results with inline annotations.

**Features:**
- Tabbed interface for each review type
- Severity-based filtering
- Expandable issue details
- Code snippets with line numbers
- Auto-fix indicators
- CWE/OWASP references

### ReviewDashboard (`ReviewDashboard.tsx`)

Analytics dashboard for tracking review history and trends.

**Features:**
- Review statistics and metrics
- Score trends over time
- Issue distribution charts
- Recent review history
- Quick action buttons
- Team metrics (if applicable)

## Services

### ReviewService (`lib/review-service.ts`)

Core service for performing code analysis.

**Methods:**
```typescript
// Perform comprehensive review
const result = await reviewService.performReview({
  type: 'all',
  files: ['src/components/App.tsx'],
  options: {
    security: {
      checkSecrets: true,
      owaspCheck: true,
      cweCheck: true,
    },
    performance: {
      checkBundleSize: true,
      checkRenderTime: true,
    },
    style: {
      autoFix: false,
      strictMode: true,
    },
  },
});
```

### ReviewExportService (`lib/review-export-service.ts`)

Export review results to various formats.

**Supported Formats:**
- Markdown (`.md`)
- JSON (`.json`)
- HTML (`.html`)
- PDF (`.pdf`)

**Usage:**
```typescript
import { reviewExportService } from '@/lib/review-export-service';

// Export to Markdown
const markdown = await reviewExportService.exportReview(result, {
  format: 'markdown',
  includeCode: true,
  includeRecommendations: true,
  groupBy: 'severity',
});

// Download file
reviewExportService.downloadFile(markdown, 'review-report.md');
```

## Quick Commands

### Command Line Interface

```bash
# Review single file
/review src/components/App.tsx

# Review with specific type
/review --type security src/lib/api.ts
/review --type performance src/components/Dashboard.tsx
/review --type style src/utils/helpers.ts

# Review git diff
/review --git-diff

# Review changes since commit
/review --since HEAD~1
/review --since abc123

# Export review report
/review --export pdf
/review --export markdown
```

### Configuration Options

```typescript
interface ReviewConfig {
  type: 'security' | 'performance' | 'style' | 'all';
  files?: string[];
  gitDiff?: boolean;
  sinceCommit?: string;
  exclude?: string[];
  options: {
    security?: {
      checkSecrets: boolean;
      owaspCheck: boolean;
      cweCheck: boolean;
      maxSeverity?: 'critical' | 'high' | 'medium' | 'low';
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
```

## Security Patterns Detected

### Vulnerabilities
- SQL Injection (CWE-89)
- Cross-Site Scripting (XSS) (CWE-79)
- Cross-Site Request Forgery (CSRF) (CWE-352)
- Path Traversal (CWE-22)
- Open Redirect (CWE-601)
- Weak Cryptography (CWE-327)

### Secrets
- AWS Access Keys
- GitHub Tokens
- Stripe API Keys
- Generic API Keys
- JWT Tokens
- Private Keys/Certificates

## Performance Patterns Detected

- N+1 Queries
- Blocking Operations (sync file I/O)
- Memory Leaks (uncleaned listeners)
- Unused State
- Inefficient Re-renders
- Large Bundle Dependencies

## Style Patterns Detected

- Console Statements
- TODO/FIXME Comments
- Long Functions (500+ chars)
- Magic Numbers
- `var` Declarations
- Naming Convention Violations

## Integration Points

### Git Integration

```typescript
// Review uncommitted changes
const result = await reviewService.performReview({
  type: 'all',
  gitDiff: true,
});

// Review changes since specific commit
const result = await reviewService.performReview({
  type: 'all',
  sinceCommit: 'HEAD~1',
});
```

### CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/review.yml
name: Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Code Review
        run: |
          npm install
          npm run review -- --type all --export markdown
      - name: Upload Report
        uses: actions/upload-artifact@v2
        with:
          name: review-report
          path: review-report.md
```

### GitHub PR Integration

Review pull requests automatically:

```typescript
// In your GitHub Actions workflow
const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const result = await reviewService.performReview({
  type: 'all',
  gitDiff: true,
});

// Post review as PR comment
await octokit.pulls.createReview({
  owner: 'your-org',
  repo: 'your-repo',
  pull_number: prNumber,
  body: generateReviewComment(result),
  event: 'COMMENT',
});
```

## Example Workflows

### 1. Pre-Commit Review

```bash
# In your pre-commit hook
/review --git-diff --type all

# If score < 80, block commit
if [ $SCORE -lt 80 ]; then
  echo "Code review score too low: $SCORE/100"
  exit 1
fi
```

### 2. Continuous Monitoring

```typescript
// Schedule daily reviews
cron.schedule('0 0 * * *', async () => {
  const result = await reviewService.performReview({
    type: 'all',
    files: getAllProjectFiles(),
  });

  if (result.overallScore < 80) {
    await notifyTeam(result);
  }
});
```

### 3. PR Review Automation

```typescript
// On PR creation/update
const files = getPRChangedFiles();
const result = await reviewService.performReview({
  type: 'all',
  files,
});

await postReviewComment(result);
await updatePRStatus(result.overallScore >= 80);
```

## Best Practices

1. **Run reviews before commits**
   - Catch issues early in development
   - Maintain high code quality standards

2. **Use specific review types for focus**
   - Security review before deployment
   - Performance review for optimization
   - Style review for consistency

3. **Automate in CI/CD**
   - Block PRs with low scores
   - Generate reports automatically
   - Track trends over time

4. **Export and share results**
   - PDF for stakeholders
   - Markdown for documentation
   - JSON for programmatic access

5. **Configure for your project**
   - Set appropriate thresholds
   - Customize rules and patterns
   - Exclude irrelevant files

## Scoring System

Reviews are scored on a 0-100 scale:

- **90-100**: Excellent - Production ready
- **80-89**: Good - Minor issues to address
- **60-79**: Fair - Several issues need attention
- **40-59**: Poor - Significant problems
- **0-39**: Critical - Major issues blocking deployment

## Limitations

- Pattern-based detection may produce false positives
- AI analysis quality depends on code context
- Some advanced vulnerabilities may not be detected
- Performance estimates are approximations

## Future Enhancements

- [ ] Machine learning model for vulnerability detection
- [ ] Custom rule configuration
- [ ] Integration with external security scanners
- [ ] Real-time review during development
- [ ] Team collaboration features
- [ ] Historical trend analysis
- [ ] Automated fix suggestions and application

## Contributing

To add new detection patterns:

1. Add pattern to `SECURITY_PATTERNS`, `PERFORMANCE_PATTERNS`, or `STYLE_PATTERNS`
2. Update helper methods for severity, descriptions, and recommendations
3. Add tests for new patterns
4. Update documentation

## Support

For issues or questions:
- GitHub Issues: [ainative-website-nextjs-staging/issues](https://github.com/ainative/ainative-website-nextjs-staging/issues)
- Documentation: [docs/review-command.md](./docs/review-command.md)
- Email: support@ainative.studio
