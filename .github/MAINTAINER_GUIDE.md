# Maintainer's Quick Reference - Issue Triage

Quick reference for maintainers performing issue triage.

## Quick Filters

```bash
# New issues needing triage
is:issue is:open label:status/need-triage

# Possible duplicates to verify
is:issue is:open label:status/possible-duplicate

# Critical issues (P0/P1)
is:issue is:open label:priority/p0,priority/p1

# Issues needing more info
is:issue is:open label:status/needs-info

# Stale issues
is:issue is:open label:stale

# By area
is:issue is:open label:area/frontend
is:issue is:open label:area/backend
is:issue is:open label:area/devops
```

## Common Commands

### GitHub CLI

```bash
# View issue details
gh issue view <number>

# Add labels
gh issue edit <number> --add-label "priority/p1,area/frontend"

# Remove labels
gh issue edit <number> --remove-label "status/need-triage"

# Replace labels
gh issue edit <number> \
  --remove-label "status/need-triage" \
  --add-label "status/triaged"

# Assign issue
gh issue edit <number> --assignee @username

# Close as duplicate
gh issue close <number> --reason "duplicate" \
  --comment "Duplicate of #<original-number>"

# Request more info
gh issue comment <number> --body "$(cat .github/bot-templates/needs-more-info.md)"
```

### Batch Operations

```bash
# Add priority to all frontend issues without one
gh issue list --label "area/frontend" --json number,labels --jq '.[] | select(.labels | map(.name) | any(startswith("priority/")) | not) | .number' | \
  xargs -I {} gh issue edit {} --add-label "priority/p2"

# Close all stale issues older than 67 days
gh issue list --label "stale" --json number,createdAt --jq --arg cutoff "$(date -u -v-67d +%Y-%m-%dT%H:%M:%SZ)" '.[] | select(.createdAt < $cutoff) | .number' | \
  xargs -I {} gh issue close {}
```

## Triage Decision Tree

```
┌─────────────────────────┐
│   New Issue Opened      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Bot Auto-Labels Applied │
└────────────┬────────────┘
             │
             ▼
     ┌───────┴───────┐
     │  Maintainer    │
     │   Review       │
     └───────┬───────┘
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
Duplicate? Valid?  Complete?
    │        │        │
    │        │        │
 Close    Verify   Request
    │     Labels     Info
    │        │        │
    │        ▼        │
    │   ┌────────┐   │
    │   │ Assign │   │
    │   └───┬────┘   │
    │       │        │
    └───────┼────────┘
            │
            ▼
    ┌──────────────┐
    │   Triaged    │
    │ (Ready for   │
    │ Development) │
    └──────────────┘
```

## Standard Responses

### Duplicate Issue

```markdown
Thank you for reporting this! This appears to be a duplicate of #<number>.

Please see the original issue for discussion and updates. If your case differs in a meaningful way, please comment there with the additional details.

Closing as duplicate.
```

### Need More Information

```markdown
Thank you for the report. To help us investigate, we need additional information:

- [ ] Detailed steps to reproduce
- [ ] Expected vs. actual behavior
- [ ] Browser/OS information
- [ ] Console errors or logs
- [ ] Screenshots if applicable

We'll mark this as `status/needs-info` until we receive these details.
```

### Invalid Issue

```markdown
Thank you for your report. After review, this appears to be [reason: working as intended / user error / not applicable].

[Explanation]

Closing this issue. If you believe this determination is incorrect, please comment with additional details and we'll reconsider.
```

### Feature Request - Accepted

```markdown
Great suggestion! This aligns well with our roadmap.

We've triaged this as:
- Priority: P[0-3]
- Area: [area]

We'll track this for an upcoming sprint. Feel free to submit a PR if you'd like to contribute!
```

### Feature Request - Declined

```markdown
Thank you for the suggestion. After consideration, we've decided not to pursue this because [reason].

Alternatives you might consider:
- [Alternative 1]
- [Alternative 2]

Closing as `wontfix`.
```

## Label Quick Reference

### Must-Have Labels

Every issue should have:
1. **One kind label**: `kind/bug`, `kind/enhancement`, etc.
2. **One priority label**: `priority/p0` through `priority/p3`
3. **One status label**: `status/need-triage`, `status/triaged`, etc.
4. **One or more area labels**: `area/frontend`, `area/backend`, etc.

### Label Changes During Triage

```
Initial:  status/need-triage (bot applied)
          ↓
Review:   Remove status/need-triage
          Add status/triaged (or other status)
          Verify/adjust priority, kind, area
          ↓
Final:    status/triaged + priority/p[0-3] + kind/* + area/*
```

## Priority Guidelines

### P0 - Critical (Immediate)
- Production is down
- Security vulnerability
- Data loss or corruption
- Complete feature failure affecting all users

**Action**: Alert team, immediate investigation

### P1 - High (24-48 hours)
- Major bug affecting core functionality
- Regression from recent deployment
- Blocking user workflows
- Significant performance degradation

**Action**: Prioritize for current sprint

### P2 - Medium (1-2 weeks)
- Normal bugs with workarounds
- Feature enhancements
- Non-critical UI/UX issues
- Moderate performance issues

**Action**: Add to backlog, schedule for upcoming sprint

### P3 - Low (No SLA)
- Minor visual issues
- Nice-to-have features
- Documentation improvements
- Cosmetic enhancements

**Action**: Backlog, work on when bandwidth available

## Escalation

### When to Escalate

Escalate to team lead if:
- P0 issue detected
- Security vulnerability identified
- Unclear priority/severity
- Cross-team coordination needed
- Controversial feature decision

### How to Escalate

1. Add comment mentioning `@team-lead`
2. Add `status/blocked` label if waiting on decision
3. Post in team Slack/Discord
4. Update issue with escalation reason

## Weekly Triage Checklist

- [ ] Process all `status/need-triage` issues
- [ ] Verify `status/possible-duplicate` flags
- [ ] Review all P0/P1 issues
- [ ] Check for issues needing more info
- [ ] Close or update stale issues
- [ ] Update project board
- [ ] Review bot accuracy
- [ ] Sync labels if needed

## Metrics to Track

Monitor these weekly:
- Issues triaged per week
- Average time to first triage
- Duplicate detection accuracy
- False positive rate on auto-labels
- Issues closed vs. opened
- Stale issue rate

## Tips for Efficient Triage

1. **Batch Similar Issues**: Triage related issues together
2. **Use Templates**: Copy/paste from bot-templates/
3. **Set Time Blocks**: Dedicated triage time (e.g., 30 min daily)
4. **Verify Bot Work**: Trust but verify auto-labels
5. **Update Patterns**: Improve bot keywords based on misses
6. **Communicate**: Keep issue reporters informed
7. **Close Decisively**: Don't let issues linger in limbo

## Troubleshooting

### Bot Not Running
```bash
# Check workflow status
gh workflow list
gh workflow view issue-triage.yml
gh run list --workflow=issue-triage.yml

# Re-run if failed
gh run rerun <run-id>
```

### Labels Not Syncing
```bash
# Manually trigger label sync
gh workflow run label-sync.yml

# Check for errors
gh run list --workflow=label-sync.yml
gh run view <run-id> --log
```

### Incorrect Auto-Labels

Update `.github/workflows/issue-triage.yml`:
```javascript
// Adjust keyword arrays
areaLabels: {
  'area/frontend': ['react', 'next.js', 'ui', ...],
  // Add/remove keywords as needed
}
```

## Resources

- [Full Triage Process](TRIAGE_PROCESS.md)
- [Issue Templates](ISSUE_TEMPLATE/)
- [Label Configuration](labels.yml)
- [Bot Templates](bot-templates/)

---

**Need Help?** Ask in #maintainers channel or open a discussion.
