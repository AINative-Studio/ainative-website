# Git Workflow Guide

## Branch Naming Convention

### Feature Branches
```
feature/issue-{number}-{short-description}
```
Example: `feature/issue-123-add-dashboard`

### Bug Fix Branches
```
bug/issue-{number}-{short-description}
```
Example: `bug/issue-456-fix-auth-redirect`

### Hotfix Branches
```
hotfix/issue-{number}-{short-description}
```
Example: `hotfix/issue-789-critical-security-patch`

### Chore/Maintenance Branches
```
chore/issue-{number}-{short-description}
```
Example: `chore/issue-321-update-dependencies`

## Commit Message Standards

### Format
```
Short descriptive title (max 72 characters)

- Bullet point describing specific change
- Another bullet point for another change
- Final bullet point summarizing impact
```

### Examples

#### Good Commit
```
Add multi-language support for dashboard

- Implement i18n configuration with next-i18next
- Add translation files for English and Spanish
- Update dashboard components to use translation hooks
- Add language switcher component to navigation
```

#### Bad Commit (Too Vague)
```
Updated stuff
```

#### Bad Commit (AI Attribution - FORBIDDEN)
```
Add multi-language support

- Translation support added
- Dashboard updated

Generated with Claude Code
```

### CRITICAL: ZERO TOLERANCE for AI Attribution

**NEVER include any of the following in commits:**
- "Claude" / "Anthropic" / "claude.com"
- "Generated with Claude" / "Claude Code"
- "Co-Authored-By: Claude"
- Any AI tool attribution

See `.claude/rules/git-rules.md` for complete rules.

## Pull Request Workflow

### 1. Create Feature Branch
```bash
git checkout main
git pull origin main
git checkout -b feature/issue-123-add-dashboard
```

### 2. Make Changes
- Write code following project standards
- Write tests (TDD approach preferred)
- Update documentation as needed

### 3. Pre-Commit Verification
```bash
# Run full verification suite
npm run verify

# This runs:
# - npm run lint
# - npm run type-check
# - npm run test:coverage
# - npm run build
```

### 4. Commit Changes
```bash
# Stage changes
git add .

# Commit (pre-commit hook runs automatically)
git commit -m "Your commit message"

# Pre-commit hook will:
# - Run lint-staged (ESLint + Prettier)
# - Run TypeScript type checking
# - Run tests with coverage check (>= 80%)
# - Run build verification
```

### 5. Push to Remote
```bash
git push origin feature/issue-123-add-dashboard
```

### 6. Create Pull Request
- Go to GitHub repository
- Click "New Pull Request"
- Fill out PR template completely
- Request review from team members

### 7. Address Review Comments
```bash
# Make changes based on feedback
git add .
git commit -m "Address review comments"
git push origin feature/issue-123-add-dashboard
```

### 8. Merge
- Ensure all CI checks pass
- Get required approvals
- Use "Squash and Merge" for clean history
- Delete branch after merge

## Code Review Checklist

### For Reviewers
- [ ] Code follows project style guidelines
- [ ] Tests are comprehensive (>= 80% coverage)
- [ ] Documentation is updated
- [ ] No security vulnerabilities introduced
- [ ] Performance considerations addressed
- [ ] Error handling is robust
- [ ] No hardcoded values or secrets
- [ ] Mobile responsiveness maintained
- [ ] Accessibility standards met
- [ ] No console.log or debug code left

### For PR Author
- [ ] Self-review completed before requesting review
- [ ] All tests passing locally
- [ ] Build succeeds without warnings
- [ ] No merge conflicts with main
- [ ] Screenshots/videos added for UI changes
- [ ] Breaking changes documented
- [ ] Migration guide provided (if needed)

## Branch Protection Rules

### Main Branch
- Require pull request reviews (minimum 1)
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Enforce linear history (squash merging)
- Do not allow force pushes
- Do not allow deletions

## Hotfix Workflow

For critical production issues:

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/issue-789-critical-fix

# Make minimal changes to fix issue
# ... make changes ...

# Verify fix
npm run verify

# Commit and push
git add .
git commit -m "Fix critical security vulnerability"
git push origin hotfix/issue-789-critical-fix

# Create PR with "HOTFIX" label
# Fast-track review and merge
# Deploy immediately after merge
```

## Troubleshooting

### Pre-commit Hook Failures

#### Lint Errors
```bash
npm run lint:fix
```

#### Type Errors
Review and fix TypeScript errors:
```bash
npm run type-check
```

#### Test Failures
```bash
# Run tests in watch mode
npm run test:watch

# Check coverage
npm run test:coverage
```

#### Build Failures
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Commit Message Rejected
If commit message validation fails:
```bash
# Check for forbidden patterns
cat .git/COMMIT_EDITMSG

# Amend commit message
git commit --amend
```

### Coverage Below Threshold
```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html

# Add tests for uncovered code
```

## Emergency Procedures

### Revert Last Commit
```bash
git revert HEAD
git push origin main
```

### Revert Merged PR
```bash
git revert -m 1 <merge-commit-hash>
git push origin main
```

### Force Push (Use with Extreme Caution)
```bash
# Only for feature branches, NEVER for main
git push -f origin feature/issue-123-add-dashboard
```

## Git Hooks Summary

### Pre-commit Hook
- Runs lint-staged (ESLint + Prettier)
- Runs TypeScript type checking
- Runs tests with coverage verification
- Runs build verification

### Commit-msg Hook
- Validates commit message format
- Checks for forbidden AI attribution
- Enforces minimum message length
- Warns on long title lines

## Best Practices

1. **Commit Often**: Make small, logical commits
2. **Pull Regularly**: Keep your branch up to date with main
3. **Test Locally**: Always verify changes before pushing
4. **Write Descriptive Messages**: Future you will thank you
5. **Review Your Own Code**: Catch issues before review
6. **Keep PRs Small**: Easier to review and merge
7. **Update Documentation**: Keep docs in sync with code
8. **Clean Up Branches**: Delete merged branches

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
