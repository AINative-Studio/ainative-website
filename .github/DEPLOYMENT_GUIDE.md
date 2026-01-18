# Issue Triage System - Deployment Guide

Step-by-step guide to deploy the automated issue triage system.

## Prerequisites

- Repository admin access
- GitHub CLI (`gh`) installed and authenticated
- Node.js 20+ (for workflow dependencies)

## Deployment Steps

### 1. Enable GitHub Actions

1. Go to **Settings** → **Actions** → **General**
2. Under "Actions permissions", select:
   - ✅ Allow all actions and reusable workflows
3. Under "Workflow permissions", select:
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests
4. Click **Save**

### 2. Initialize Labels

Run the setup script to create all labels:

```bash
cd .github
./setup-labels.sh
```

Or manually trigger the label sync workflow:

```bash
gh workflow run label-sync.yml
```

Verify labels were created:

```bash
gh label list
```

### 3. Verify Workflows

Check that workflows are present:

```bash
gh workflow list
```

Expected output:
```
Issue Triage Bot          active  issue-triage.yml
Sync Labels               active  label-sync.yml
Project Automation        active  project-automation.yml
```

### 4. Test Issue Triage

Create a test issue to verify the bot:

```bash
gh issue create \
  --title "[Test] Frontend bug with navigation" \
  --body "The navigation menu is broken on mobile devices. When clicking the hamburger menu, nothing happens. Expected: menu should open. Actual: no response."
```

**Expected behavior:**
- Issue is created
- Bot analyzes content within 30 seconds
- Labels applied automatically:
  - `status/need-triage`
  - `area/frontend`
  - `kind/bug`
  - `priority/p2` (default)
- Welcome comment if first issue
- No duplicates detected (unless similar issues exist)

Verify:
```bash
gh issue view <number>
```

### 5. Test Duplicate Detection

Create a similar issue to test duplicate detection:

```bash
gh issue create \
  --title "[Test] Navigation not working on mobile" \
  --body "Mobile navigation menu doesn't respond to clicks. The hamburger icon shows but clicking does nothing."
```

**Expected behavior:**
- Labels applied
- Comment posted with duplicate candidates
- `status/possible-duplicate` label added
- Lists test issue from step 4 as similar

### 6. Configure Team Assignments (Optional)

Edit `.github/workflows/project-automation.yml`:

```javascript
const assignments = {
  'area/frontend': ['username1', 'username2'],
  'area/backend': ['username3'],
  'area/devops': ['username4'],
  // Add your team members
};
```

Commit and push:
```bash
git add .github/workflows/project-automation.yml
git commit -m "Configure team assignments for auto-triage"
git push
```

### 7. Set Up Scheduled Workflows

The stale issue check runs automatically daily at 00:00 UTC. To run manually:

```bash
gh workflow run project-automation.yml
```

## Verification Checklist

- [ ] GitHub Actions enabled with write permissions
- [ ] All labels created (run `gh label list` to verify)
- [ ] Workflows are active (`gh workflow list`)
- [ ] Test issue auto-labeled correctly
- [ ] Duplicate detection working
- [ ] Welcome message posted for first issue
- [ ] Stale workflow scheduled (check Actions tab)

## Troubleshooting

### Issue: Workflow not running

**Symptoms:**
- Issue created but no labels applied
- No bot comments

**Solutions:**

1. Check workflow permissions:
   ```bash
   # Settings → Actions → General → Workflow permissions
   # Must be "Read and write permissions"
   ```

2. Verify workflow file syntax:
   ```bash
   # Check for YAML syntax errors
   gh workflow view issue-triage.yml
   ```

3. Check recent workflow runs:
   ```bash
   gh run list --workflow=issue-triage.yml
   gh run view <run-id> --log
   ```

4. Re-enable workflows if disabled:
   ```bash
   gh workflow enable issue-triage.yml
   ```

### Issue: Labels not applying

**Symptoms:**
- Workflow runs successfully
- No labels added to issue

**Solutions:**

1. Check if labels exist:
   ```bash
   gh label list | grep "status/need-triage"
   ```

2. Recreate labels:
   ```bash
   ./.github/setup-labels.sh
   ```

3. Verify issue body has content:
   - Bot needs text to analyze
   - Empty issues won't be labeled

### Issue: Duplicate detection not working

**Symptoms:**
- No duplicate comment posted
- Similar issues not detected

**Solutions:**

1. Check if dependencies are installed in workflow:
   ```yaml
   # Verify this step exists in issue-triage.yml
   - name: Install dependencies
     run: npm install --no-save natural compromise
   ```

2. Lower similarity threshold (if needed):
   ```javascript
   // In issue-triage.yml, change:
   if (measure > 0.3) // Try 0.2 for more matches
   ```

3. Ensure there are existing issues:
   - Need at least one other issue for comparison
   - Bot only checks last 100 issues

### Issue: Stale workflow not running

**Symptoms:**
- No stale labels applied
- Old issues not being closed

**Solutions:**

1. Check cron schedule:
   ```yaml
   schedule:
     - cron: '0 0 * * *'  # Daily at midnight UTC
   ```

2. Manually trigger:
   ```bash
   gh workflow run project-automation.yml
   ```

3. Verify stale action configuration:
   ```yaml
   days-before-stale: 60
   days-before-close: 7
   ```

### Issue: Bot comments not posting

**Symptoms:**
- Labels apply correctly
- No welcome message or duplicate comments

**Solutions:**

1. Check if comments are enabled:
   ```bash
   # Settings → General → Features
   # ✅ Issues must be checked
   ```

2. Verify comment syntax in workflow:
   ```javascript
   await github.rest.issues.createComment({
     owner: context.repo.owner,
     repo: context.repo.repo,
     issue_number: issue.number,
     body: comment
   });
   ```

3. Check for rate limiting:
   ```bash
   gh api rate_limit
   ```

## Customization

### Adjust Auto-Labeling Keywords

Edit `.github/workflows/issue-triage.yml`:

```javascript
const config = {
  areaLabels: {
    'area/frontend': [
      'react', 'next.js', 'ui', 'component',
      // Add more keywords
    ],
  },
  priorityLabels: {
    'priority/p0': [
      'critical', 'urgent', 'production down',
      // Add severity keywords
    ],
  }
};
```

### Change Duplicate Detection Sensitivity

```javascript
// More sensitive (catches more duplicates, more false positives)
if (measure > 0.2) { ... }

// Less sensitive (fewer false positives, may miss duplicates)
if (measure > 0.5) { ... }

// Default (balanced)
if (measure > 0.3) { ... }
```

### Modify Stale Issue Timing

Edit `.github/workflows/project-automation.yml`:

```yaml
stale-issue-message: "Your custom message..."
days-before-stale: 60      # Change to 30, 90, etc.
days-before-close: 7       # Change to 14, 3, etc.
exempt-issue-labels: 'priority/p0,priority/p1'  # Add more labels
```

## Monitoring

### Weekly Review

Check these metrics weekly:

```bash
# Issues triaged this week
gh issue list --label "status/triaged" --search "created:>=$(date -v-7d +%Y-%m-%d)"

# Possible duplicates to review
gh issue list --label "status/possible-duplicate"

# Critical/high priority issues
gh issue list --label "priority/p0,priority/p1"

# Stale issues
gh issue list --label "stale"

# Bot accuracy check
gh issue list --label "status/bot-triaged" --state open
```

### Workflow Run History

```bash
# View recent runs
gh run list --limit 20

# Check specific workflow
gh run list --workflow=issue-triage.yml --limit 10

# View detailed logs
gh run view <run-id> --log
```

### Success Indicators

- ✅ >90% of new issues auto-labeled
- ✅ >60% of duplicates detected
- ✅ <10% false positive auto-labels
- ✅ <24 hour average triage time
- ✅ <5% stale issue rate

## Rollback

If issues arise, you can disable workflows:

```bash
# Disable specific workflow
gh workflow disable issue-triage.yml

# Disable all workflows
gh workflow disable --all
```

To completely remove the system:

```bash
# Delete workflows
rm .github/workflows/issue-triage.yml
rm .github/workflows/project-automation.yml
rm .github/workflows/label-sync.yml

# Optionally remove labels
gh label delete "status/need-triage" --yes
# (repeat for all labels)
```

## Support

- **Documentation**: See [TRIAGE_PROCESS.md](TRIAGE_PROCESS.md)
- **Quick Reference**: [MAINTAINER_GUIDE.md](MAINTAINER_GUIDE.md)
- **Issues**: Open an issue with label `area/devops`
- **Discussions**: Use GitHub Discussions for questions

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [actions/stale Action](https://github.com/actions/stale)
- [EndBug/label-sync Action](https://github.com/EndBug/label-sync)

---

**Last Updated**: 2026-01-18
