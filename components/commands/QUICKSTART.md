# Code Review Command - Quick Start Guide

Get started with AI-powered code reviews in 5 minutes.

## Installation

The code review feature is already included in AINative Studio. No additional installation required.

## Basic Usage

### 1. Access the Review Interface

Navigate to the demo page:
```
http://localhost:3000/demo/review
```

Or import the component directly:
```tsx
import { ReviewCommand } from '@/components/commands/ReviewCommand';

function MyPage() {
  return <ReviewCommand />;
}
```

### 2. Run Your First Review

**Option A: Review Specific Files**
1. Select review type (Security, Performance, Style, or All)
2. Enter file paths (comma-separated):
   ```
   src/components/App.tsx, src/lib/utils.ts
   ```
3. Click "Start Review"

**Option B: Review Git Changes**
1. Check "Review Git Diff"
2. Optionally specify commit: `HEAD~1`
3. Click "Start Review"

### 3. View Results

Results are displayed in tabs:
- **Security**: Vulnerabilities and hardcoded secrets
- **Performance**: Bottlenecks and optimization opportunities
- **Style**: Code style violations

Each issue shows:
- Severity level
- File location
- Code snippet
- Description
- Recommendation
- Fix effort

## Command Line Interface

Use the `/review` command:

```bash
# Review a single file
/review src/components/App.tsx

# Security review
/review --type security src/lib/api.ts

# Review uncommitted changes
/review --git-diff

# Review changes since commit
/review --since HEAD~1

# Export report
/review --export pdf
```

## Configuration

### Security Options
```tsx
{
  security: {
    checkSecrets: true,      // Detect hardcoded secrets
    owaspCheck: true,        // OWASP Top 10 compliance
    cweCheck: true,          // CWE mapping
  }
}
```

### Performance Options
```tsx
{
  performance: {
    checkBundleSize: true,   // Analyze bundle size
    checkRenderTime: true,   // Check render performance
    checkMemory: true,       // Detect memory leaks
  }
}
```

### Style Options
```tsx
{
  style: {
    autoFix: false,          // Enable auto-fix
    strictMode: true,        // Strict style checking
  }
}
```

## Programmatic Usage

```typescript
import { reviewService } from '@/lib/review-service';

// Perform review
const result = await reviewService.performReview({
  type: 'all',
  files: ['src/app.ts'],
  options: {
    security: { checkSecrets: true, owaspCheck: true, cweCheck: true },
    performance: { checkBundleSize: true, checkRenderTime: true, checkMemory: true },
    style: { autoFix: false, strictMode: true },
  },
});

// Check results
console.log(`Overall Score: ${result.overallScore}/100`);
console.log(`Vulnerabilities: ${result.security?.vulnerabilities.length}`);
console.log(`Performance Issues: ${result.performance?.issues.length}`);
console.log(`Style Violations: ${result.style?.violations.length}`);
```

## Export Reports

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

## Dashboard

Access analytics dashboard:
```
http://localhost:3000/demo/review (Dashboard tab)
```

Or import component:
```tsx
import { ReviewDashboard } from '@/components/commands/ReviewDashboard';

function Analytics() {
  return <ReviewDashboard />;
}
```

## Common Use Cases

### 1. Pre-Commit Review
```bash
#!/bin/sh
# .git/hooks/pre-commit

npm run review -- --git-diff --type all

if [ $? -ne 0 ]; then
  echo "Code review failed. Fix issues before committing."
  exit 1
fi
```

### 2. CI/CD Integration
```yaml
# .github/workflows/review.yml
name: Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run review -- --type all --export markdown
      - uses: actions/upload-artifact@v2
        with:
          name: review-report
          path: review-report.md
```

### 3. Scheduled Reviews
```typescript
// Review entire codebase daily
import cron from 'node-cron';

cron.schedule('0 0 * * *', async () => {
  const result = await reviewService.performReview({
    type: 'all',
    files: getAllProjectFiles(),
  });

  if (result.overallScore < 80) {
    await sendAlert(result);
  }
});
```

## Understanding Scores

### Score Ranges
- **90-100**: Excellent - Production ready
- **80-89**: Good - Minor issues to address
- **60-79**: Fair - Several issues need attention
- **40-59**: Poor - Significant problems
- **0-39**: Critical - Blocking issues

### Improving Scores

**Security (Critical Issues):**
- Remove hardcoded secrets → Use environment variables
- Fix SQL injection → Use parameterized queries
- Sanitize XSS risks → Use DOMPurify or escape user input

**Performance (Major Issues):**
- Fix N+1 queries → Combine iterations
- Remove blocking operations → Use async versions
- Clean up memory leaks → Add cleanup in useEffect

**Style (Easy Wins):**
- Remove console statements → Use proper logging
- Replace var with const/let → Auto-fixable
- Extract magic numbers → Use named constants

## Next Steps

1. **Run your first review** - Start with `--git-diff` to review uncommitted changes
2. **Review the results** - Understand severity levels and recommendations
3. **Fix issues** - Start with critical and high severity items
4. **Export report** - Share with your team
5. **Set up automation** - Add to pre-commit hooks or CI/CD

## Tips & Tricks

1. **Focus on one review type at a time** for faster reviews
2. **Use --git-diff** to review only changes before committing
3. **Export to Markdown** for documentation and team sharing
4. **Set score thresholds** in CI/CD to block low-quality code
5. **Review regularly** to maintain code quality over time
6. **Start with security** if deploying to production
7. **Group by severity** when exporting to prioritize fixes

## Troubleshooting

**Review takes too long:**
- Review fewer files at once
- Use specific review type instead of "all"
- Exclude large generated files

**Too many false positives:**
- Adjust strictMode to false
- Configure custom patterns
- Exclude specific files

**Score seems wrong:**
- Check penalty weights
- Review severity classifications
- Verify issue counts

## Support

- Documentation: `/components/commands/README.md`
- API Reference: See TypeScript types in `/lib/types/review.ts`
- Examples: `/app/demo/review/`
- Issues: GitHub Issues

## What's Next?

- Explore the **Dashboard** for trend analysis
- Set up **CI/CD integration** for automated reviews
- Configure **custom rules** for your project
- Try **different export formats** (PDF, HTML, JSON)
- Share reports with your team

Happy reviewing!
