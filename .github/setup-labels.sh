#!/bin/bash

# Setup script for initializing GitHub labels
# This script creates all labels defined in labels.yml
# Run once to bootstrap the label system

set -e

echo "AINative Studio - Label Setup Script"
echo "===================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed"
    echo "Install from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

echo "Setting up labels from labels.yml..."
echo ""

# Status Labels
echo "Creating status labels..."
gh label create "status/need-triage" --color "FEF2C0" --description "New issue that needs triage by maintainers" --force || true
gh label create "status/triaged" --color "0E8A16" --description "Issue has been reviewed and triaged by maintainers" --force || true
gh label create "status/bot-triaged" --color "1D76DB" --description "Issue auto-triaged by bot, needs human verification" --force || true
gh label create "status/possible-duplicate" --color "D93F0B" --description "Possible duplicate of an existing issue" --force || true
gh label create "status/blocked" --color "B60205" --description "Progress is blocked by external dependency or other issue" --force || true
gh label create "status/in-progress" --color "C2E0C6" --description "Work is currently in progress" --force || true
gh label create "status/needs-info" --color "D4C5F9" --description "Waiting for more information from issue reporter" --force || true
gh label create "status/wontfix" --color "FFFFFF" --description "This will not be worked on" --force || true

# Area Labels
echo "Creating area labels..."
gh label create "area/frontend" --color "1F77B4" --description "Frontend code (React, Next.js, UI components)" --force || true
gh label create "area/backend" --color "FF7F0E" --description "Backend code (API, services, database)" --force || true
gh label create "area/design" --color "2CA02C" --description "Design system, CSS, styling, responsive layouts" --force || true
gh label create "area/seo" --color "D62728" --description "SEO, metadata, sitemap, structured data" --force || true
gh label create "area/devops" --color "9467BD" --description "CI/CD, deployment, infrastructure, Railway" --force || true
gh label create "area/performance" --color "8C564B" --description "Performance optimization, bundle size, loading speed" --force || true
gh label create "area/accessibility" --color "E377C2" --description "Accessibility (a11y), WCAG compliance, ARIA" --force || true
gh label create "area/testing" --color "7F7F7F" --description "Tests, test coverage, Jest, Playwright, E2E" --force || true
gh label create "area/documentation" --color "BCBD22" --description "Documentation, guides, code comments" --force || true
gh label create "area/security" --color "B91D47" --description "Security vulnerabilities, authentication, permissions" --force || true

# Priority Labels
echo "Creating priority labels..."
gh label create "priority/p0" --color "B60205" --description "Critical - Production down, security issue, data loss" --force || true
gh label create "priority/p1" --color "D93F0B" --description "High - Blocking issue, major bug, regression" --force || true
gh label create "priority/p2" --color "FBCA04" --description "Medium - Normal priority" --force || true
gh label create "priority/p3" --color "0E8A16" --description "Low - Minor issue, nice to have" --force || true

# Kind Labels
echo "Creating kind labels..."
gh label create "kind/bug" --color "D73A4A" --description "Something isn't working correctly" --force || true
gh label create "kind/enhancement" --color "A2EEEF" --description "New feature or request" --force || true
gh label create "kind/documentation" --color "0075CA" --description "Improvements or additions to documentation" --force || true
gh label create "kind/question" --color "D876E3" --description "Further information is requested" --force || true
gh label create "kind/chore" --color "FEF2C0" --description "Maintenance tasks, refactoring, code cleanup" --force || true
gh label create "kind/regression" --color "E99695" --description "Previously working functionality that broke" --force || true

# Special Labels
echo "Creating special labels..."
gh label create "good first issue" --color "7057FF" --description "Good for newcomers" --force || true
gh label create "help wanted" --color "008672" --description "Extra attention is needed" --force || true
gh label create "dependencies" --color "0366D6" --description "Pull requests that update a dependency file" --force || true
gh label create "duplicate" --color "CFD3D7" --description "This issue or pull request already exists" --force || true
gh label create "invalid" --color "E4E669" --description "This doesn't seem right" --force || true
gh label create "stale" --color "EEEEEE" --description "No activity for extended period" --force || true

echo ""
echo "Label setup complete!"
echo ""
echo "Next steps:"
echo "1. Enable GitHub Actions workflows"
echo "2. Grant 'Read and write permissions' to workflows"
echo "3. Test by opening a new issue"
echo ""
echo "For more information, see .github/README.md"
