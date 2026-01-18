# AINative Studio - Issue Triage Process

This document outlines our automated and manual issue triage process, inspired by industry best practices from projects like Gemini CLI.

## Table of Contents

- [Overview](#overview)
- [Automated Triage](#automated-triage)
- [Label System](#label-system)
- [Duplicate Detection](#duplicate-detection)
- [Maintainer Workflow](#maintainer-workflow)
- [Contributing to Triage](#contributing-to-triage)

---

## Overview

Our triage system combines automated bot assistance with human oversight to efficiently manage issues and pull requests.

### Key Features

- **Automatic Labeling**: Issues are labeled based on content analysis
- **Duplicate Detection**: ~60% of duplicates are automatically flagged
- **Priority Assignment**: Issues are categorized by severity
- **Area Routing**: Issues are tagged by affected component
- **Stale Management**: Inactive issues are automatically managed

---

## Automated Triage

### When You Open an Issue

1. **Template Selection**: Choose from bug report, feature request, or documentation
2. **Bot Analysis**: Our triage bot analyzes the issue content
3. **Auto-Labeling**: Labels are applied based on keywords
4. **Duplicate Check**: Similar existing issues are identified
5. **Welcome Message**: First-time contributors receive guidance

### Triage Bot Capabilities

The bot automatically:

- Applies area, priority, and kind labels
- Searches for duplicate issues using similarity analysis
- Posts welcome messages for new contributors
- Flags issues needing more information
- Assigns issues to team members based on area

### Bot Triggers

The triage bot runs when:
- A new issue is opened
- An issue is edited
- An issue is reopened

---

## Label System

### Status Labels (Workflow)

| Label | Description | Applied By |
|-------|-------------|------------|
| `status/need-triage` | New issue awaiting review | Bot (auto) |
| `status/triaged` | Reviewed by maintainer | Maintainer |
| `status/bot-triaged` | Auto-triaged, needs verification | Bot |
| `status/possible-duplicate` | Likely duplicate issue | Bot |
| `status/blocked` | Blocked by dependency | Maintainer |
| `status/in-progress` | Currently being worked on | Maintainer |
| `status/needs-info` | Needs more details | Bot/Maintainer |
| `status/wontfix` | Will not be addressed | Maintainer |

### Area Labels (Component)

| Label | Keywords | Description |
|-------|----------|-------------|
| `area/frontend` | react, next.js, ui, component | Frontend code |
| `area/backend` | api, database, server, auth | Backend services |
| `area/design` | css, styling, layout, responsive | Design system |
| `area/seo` | meta, sitemap, schema, google | SEO/metadata |
| `area/devops` | deploy, ci/cd, railway, docker | Infrastructure |
| `area/performance` | slow, optimize, bundle, speed | Performance |
| `area/accessibility` | a11y, wcag, aria, keyboard | Accessibility |
| `area/testing` | test, jest, playwright, e2e | Testing |
| `area/documentation` | docs, readme, guide | Documentation |
| `area/security` | security, auth, vulnerability | Security |

### Priority Labels (Severity)

| Label | Criteria | SLA |
|-------|----------|-----|
| `priority/p0` | Production down, security issue, data loss | Immediate |
| `priority/p1` | Blocking, major bug, regression | 24-48 hours |
| `priority/p2` | Normal bug or feature | 1-2 weeks |
| `priority/p3` | Minor issue, nice to have | No SLA |

### Kind Labels (Type)

| Label | Description |
|-------|-------------|
| `kind/bug` | Something not working correctly |
| `kind/enhancement` | New feature or improvement |
| `kind/documentation` | Documentation improvement |
| `kind/question` | Question or clarification needed |
| `kind/chore` | Maintenance, refactoring, cleanup |
| `kind/regression` | Previously working feature broke |

---

## Duplicate Detection

### How It Works

Our bot uses **text similarity analysis** to detect duplicates:

1. **TF-IDF Analysis**: Compares issue content using term frequency
2. **Similarity Scoring**: Calculates similarity percentage
3. **Threshold**: Issues >30% similar are flagged
4. **Top Matches**: Shows top 5 most similar issues

### Similarity Indicators

```
90-100%: Exact duplicate
70-89%:  Very likely duplicate
50-69%:  Possibly related
30-49%:  May be related
<30%:    Not flagged
```

### Bot Comment Format

When duplicates are detected:

```markdown
## Possible Duplicate Issues Detected

This issue appears similar to the following existing issues:

- 🟢 Open #123: [Similar issue title](link) (85% similar)
- 🔴 Closed #456: [Another issue](link) (72% similar)

---
**Note**: This is automated detection. Please review the linked issues.
```

### What to Do

**If you opened the issue:**
- Review the linked issues
- If it's a duplicate: comment and close
- If it's different: explain the distinction

**If you're a maintainer:**
- Verify the similarity
- Close as duplicate if confirmed
- Remove `status/possible-duplicate` if distinct

---

## Maintainer Workflow

### Daily Triage Routine

1. **Review New Issues**
   ```bash
   Filter: is:issue is:open label:status/need-triage
   ```

2. **Verify Bot Labels**
   - Check accuracy of area/priority/kind labels
   - Adjust if needed

3. **Handle Duplicates**
   ```bash
   Filter: is:issue is:open label:status/possible-duplicate
   ```
   - Verify similarity
   - Close or remove label

4. **Prioritize Critical Issues**
   ```bash
   Filter: is:issue is:open label:priority/p0,priority/p1
   ```

5. **Request Missing Info**
   - Add `status/needs-info` label
   - Use template comment

6. **Mark as Triaged**
   - Replace `status/need-triage` with `status/triaged`
   - Assign to team member if ready

### Triage Checklist

- [ ] Labels are accurate (area, priority, kind)
- [ ] Not a duplicate (or marked as such)
- [ ] Has sufficient information
- [ ] Priority is appropriate
- [ ] Assigned to correct team member (if applicable)
- [ ] Status updated to `status/triaged`

### Label Management

**Sync Labels from Config:**
```bash
# Labels are auto-synced when .github/labels.yml is updated
# Manual sync:
gh workflow run label-sync.yml
```

**Batch Label Operations:**
```bash
# Add label to multiple issues
gh issue list --label "area/frontend" --json number --jq '.[].number' | \
  xargs -I {} gh issue edit {} --add-label "priority/p2"
```

---

## Contributing to Triage

### For All Contributors

**Help Triage Issues:**
- Reproduce reported bugs
- Provide additional context
- Link related issues
- Suggest appropriate labels

**Identify Duplicates:**
- Search before opening new issues
- Comment on duplicates with "+1" and context
- Help consolidate duplicate reports

### For Maintainers

**Approve Bot Actions:**
```yaml
# Verify these bot actions:
- Auto-labels are accurate
- Duplicate detection is correct
- Priority assignments are appropriate
- Welcome messages are sent
```

**Override Bot Decisions:**
```bash
# If bot misclassified:
gh issue edit <number> --remove-label "area/frontend" --add-label "area/backend"
gh issue edit <number> --remove-label "priority/p2" --add-label "priority/p1"
```

**Configure Bot Behavior:**
Edit `.github/workflows/issue-triage.yml` to adjust:
- Keyword detection rules
- Similarity threshold (default: 30%)
- Auto-assignment logic

---

## Automation Schedule

| Task | Frequency | Workflow |
|------|-----------|----------|
| Issue triage | On issue open/edit | `issue-triage.yml` |
| Stale check | Daily (00:00 UTC) | `project-automation.yml` |
| Label sync | On labels.yml change | `label-sync.yml` |
| Duplicate scan | On issue open | `issue-triage.yml` |

---

## Metrics & Performance

### Target Metrics

- **Triage Time**: <24 hours for initial triage
- **Duplicate Detection**: 60%+ accuracy
- **False Positives**: <10% on auto-labels
- **Stale Closure**: 7 days after 60 days inactive

### Monthly Review

Maintainers should review:
- Bot accuracy (labels, duplicates)
- Triage throughput
- Issue velocity
- Label distribution
- Stale issue rate

---

## Troubleshooting

### Bot Not Labeling

**Check:**
1. Workflow is enabled
2. Bot has write permissions
3. Keywords match configuration
4. Issue body has sufficient content

### Duplicate Detection Issues

**Too Many False Positives:**
- Increase similarity threshold (currently 30%)
- Refine keyword matching
- Exclude common terms

**Missing Duplicates:**
- Lower similarity threshold
- Expand keyword dictionary
- Check TF-IDF algorithm parameters

### Label Sync Failing

**Resolution:**
1. Validate `labels.yml` syntax
2. Check workflow permissions
3. Review label color codes (hex without #)
4. Ensure no duplicate label names

---

## Resources

- [GitHub Labels Config](.github/labels.yml)
- [Triage Workflow](.github/workflows/issue-triage.yml)
- [Issue Templates](.github/ISSUE_TEMPLATE/)
- [Bot Comment Templates](.github/bot-templates/)

---

## Questions?

- **General Questions**: Open a discussion
- **Triage Issues**: Mention `@maintainers` in issue
- **Bot Problems**: Open issue with `area/devops` label

---

**Last Updated**: 2026-01-18
