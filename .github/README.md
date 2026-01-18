# AINative Studio - GitHub Configuration

This directory contains all GitHub-specific configuration including workflows, issue templates, and automation.

## Directory Structure

```
.github/
├── workflows/              # GitHub Actions workflows
│   ├── issue-triage.yml    # Automated issue labeling & duplicate detection
│   ├── label-sync.yml      # Label configuration synchronization
│   └── project-automation.yml  # Stale issues, auto-assign, etc.
├── ISSUE_TEMPLATE/         # Issue templates
│   ├── bug_report.yml      # Bug report template
│   ├── feature_request.yml # Feature request template
│   ├── documentation.yml   # Documentation improvement template
│   └── config.yml          # Template configuration
├── bot-templates/          # Standardized bot comment templates
│   ├── duplicate-detected.md
│   ├── welcome-first-issue.md
│   ├── needs-more-info.md
│   ├── stale-issue.md
│   └── resolved-closing.md
├── labels.yml              # Label configuration (source of truth)
├── TRIAGE_PROCESS.md       # Comprehensive triage documentation
├── MAINTAINER_GUIDE.md     # Quick reference for maintainers
└── README.md               # This file
```

## Quick Start

### For Contributors

**Opening an Issue:**
1. Search existing issues first
2. Choose appropriate template
3. Fill out all required fields
4. Bot will auto-label and check for duplicates
5. Maintainer will review and triage

**Issue Templates:**
- [Bug Report](?template=bug_report.yml) - Report broken functionality
- [Feature Request](?template=feature_request.yml) - Suggest improvements
- [Documentation](?template=documentation.yml) - Improve docs

### For Maintainers

**Daily Triage:**
```bash
# View issues needing triage
gh issue list --label "status/need-triage"

# Quick triage
gh issue edit <number> \
  --remove-label "status/need-triage" \
  --add-label "status/triaged,priority/p2"
```

**Resources:**
- [Maintainer Guide](MAINTAINER_GUIDE.md) - Quick reference
- [Triage Process](TRIAGE_PROCESS.md) - Full documentation

## Workflows

### Issue Triage (`issue-triage.yml`)

**Triggers:** Issue opened, edited, reopened

**What it does:**
- Analyzes issue content for keywords
- Applies area, priority, and kind labels
- Detects duplicate issues using TF-IDF similarity
- Posts welcome message for first-time contributors
- Flags issues needing more information

**Example Output:**
```yaml
Labels Applied:
  - status/need-triage
  - area/frontend
  - kind/bug
  - priority/p2

Duplicates Found: 2
  - #123 (85% similar)
  - #456 (72% similar)
```

### Label Sync (`label-sync.yml`)

**Triggers:** Push to main changing `labels.yml`, manual dispatch

**What it does:**
- Syncs repository labels with `labels.yml` configuration
- Creates new labels
- Updates existing label descriptions/colors
- Does not delete labels (safety feature)

### Project Automation (`project-automation.yml`)

**Triggers:** Issues/PRs opened, labeled, closed; Daily schedule

**What it does:**
- Auto-assigns issues based on area labels
- Marks stale issues (60 days inactive)
- Closes stale issues (7 days after marked)
- Checks for missing information in bug reports

**Schedule:**
- Stale check: Daily at 00:00 UTC

## Labels

Our label system follows this structure:

### Categories

1. **Status**: Workflow state (`status/*`)
2. **Area**: Component affected (`area/*`)
3. **Priority**: Severity level (`priority/*`)
4. **Kind**: Issue type (`kind/*`)

### Label Configuration

Labels are defined in [`labels.yml`](labels.yml). Changes to this file automatically sync to the repository.

**Adding a new label:**
```yaml
- name: area/new-component
  color: "1F77B4"
  description: "Description of the component"
```

**Color codes:**
- Use 6-digit hex without `#` prefix
- Example: `FF0000` not `#FF0000`

## Duplicate Detection

Our bot uses **text similarity analysis** to detect duplicates:

### How It Works

1. **TF-IDF Vectorization**: Converts issue text to numerical vectors
2. **Cosine Similarity**: Calculates similarity scores
3. **Threshold**: 30% similarity triggers duplicate flag
4. **Results**: Top 5 matches posted as comment

### Accuracy

- **Target**: 60%+ duplicate detection rate
- **False Positives**: <10%
- **Tuning**: Adjust threshold in `issue-triage.yml`

### Example Comment

```markdown
## Possible Duplicate Issues Detected

This issue appears similar to the following existing issues:

- 🟢 Open #123: [Similar title](link) (85% similar)
- 🔴 Closed #456: [Another issue](link) (72% similar)

---
**Note**: This is automated detection. Please review linked issues.
```

## Bot Templates

Standardized markdown templates in `bot-templates/` ensure consistent messaging:

| Template | Usage |
|----------|-------|
| `duplicate-detected.md` | When duplicates are found |
| `welcome-first-issue.md` | First-time contributor greeting |
| `needs-more-info.md` | Requesting additional details |
| `stale-issue.md` | Marking inactive issues |
| `resolved-closing.md` | Closing resolved issues |

### Using Templates

**In workflow:**
```javascript
const template = fs.readFileSync('.github/bot-templates/duplicate-detected.md', 'utf8');
const comment = template.replace('{{DUPLICATE_LIST}}', duplicateList);
```

**Manual (via CLI):**
```bash
gh issue comment <number> --body "$(cat .github/bot-templates/needs-more-info.md)"
```

## Metrics & Monitoring

### Key Metrics

Track these to assess triage effectiveness:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to triage | <24 hours | Check `status/need-triage` age |
| Duplicate detection | 60%+ | Review `status/possible-duplicate` accuracy |
| False positives | <10% | Manual review of bot labels |
| Stale rate | <5% | Count stale issues / total open |

### Monthly Review

```bash
# Issues triaged this month
gh issue list --search "label:status/triaged created:>=$(date -v-30d +%Y-%m-%d)" --json number | jq '. | length'

# Duplicates detected
gh issue list --label "status/possible-duplicate" --json number | jq '. | length'

# Current stale issues
gh issue list --label "stale" --json number | jq '. | length'
```

## Customization

### Adjusting Auto-Labels

Edit `workflows/issue-triage.yml`:

```javascript
const config = {
  areaLabels: {
    'area/frontend': ['react', 'next.js', 'ui', 'component'],
    // Add/remove keywords
  },
  priorityLabels: {
    'priority/p0': ['critical', 'urgent', 'production down'],
    // Adjust severity keywords
  }
};
```

### Changing Duplicate Threshold

```javascript
// Current: 30% similarity
if (i > 0 && measure > 0.3) {
  // Increase for fewer false positives (e.g., 0.5)
  // Decrease to catch more duplicates (e.g., 0.2)
}
```

### Stale Issue Timing

Edit `workflows/project-automation.yml`:

```yaml
days-before-stale: 60    # Days before marking stale
days-before-close: 7     # Days after stale before closing
```

## Troubleshooting

### Workflow Not Running

**Check permissions:**
```yaml
permissions:
  issues: write
  contents: read
```

**View workflow runs:**
```bash
gh run list --workflow=issue-triage.yml
gh run view <run-id> --log
```

### Labels Not Applying

**Check trigger conditions:**
```yaml
on:
  issues:
    types: [opened, edited, reopened]
```

**Verify bot has write access:**
- Settings → Actions → General → Workflow permissions
- Select "Read and write permissions"

### Duplicate Detection Issues

**Dependencies missing:**
```bash
npm install --no-save natural compromise
```

**Similarity threshold too high/low:**
- Adjust `measure > 0.3` in `issue-triage.yml`
- Higher = fewer duplicates flagged
- Lower = more false positives

## Best Practices

### For Bot Maintenance

1. **Review Weekly**: Check bot accuracy on recent issues
2. **Update Keywords**: Add new patterns as project evolves
3. **Monitor False Positives**: Adjust thresholds if needed
4. **Test Changes**: Use workflow_dispatch for manual testing
5. **Document Updates**: Note changes in commit messages

### For Maintainers

1. **Trust but Verify**: Review bot labels before finalizing triage
2. **Provide Feedback**: Comment on bot accuracy in maintainer channel
3. **Use Templates**: Leverage bot-templates for consistency
4. **Close Decisively**: Don't leave issues in limbo
5. **Update Docs**: Keep triage docs current with process changes

## Contributing

### Improving Triage

**Add new keywords:**
1. Edit `workflows/issue-triage.yml`
2. Add keywords to appropriate label category
3. Test on recent issues
4. Submit PR with examples

**Create new templates:**
1. Add template to `bot-templates/`
2. Use `{{PLACEHOLDER}}` for dynamic content
3. Document usage in this README
4. Update workflows to use template

**Adjust label schema:**
1. Edit `labels.yml`
2. Push to main (auto-syncs)
3. Update documentation
4. Announce in team channel

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Issue Template Syntax](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests)
- [Label Best Practices](https://github.com/dotnet/runtime/labels)
- [Gemini CLI Triage System](https://github.com/google/generative-ai-cli) (Inspiration)

## Questions?

- **General**: Open a [discussion](../../discussions)
- **Bugs**: Open an [issue](../../issues/new/choose)
- **Triage**: See [TRIAGE_PROCESS.md](TRIAGE_PROCESS.md)
- **Quick Help**: [MAINTAINER_GUIDE.md](MAINTAINER_GUIDE.md)

---

**Last Updated**: 2026-01-18
**Maintained By**: AINative Studio DevOps Team
