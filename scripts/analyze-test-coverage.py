#!/usr/bin/env python3
"""
Component Test Coverage Gap Analysis Script
Issue #354 - Comprehensive component test coverage audit
"""

import os
import re
from pathlib import Path
from collections import defaultdict
from datetime import datetime

BASEDIR = Path("/Users/aideveloper/ainative-website-nextjs-staging")
OUTPUT_DIR = BASEDIR / "docs" / "test-coverage"
REPORT_FILE = OUTPUT_DIR / "coverage-gap-analysis.md"

def count_lines(file_path):
    """Count lines of code in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return len(f.readlines())
    except:
        return 0

def get_complexity(lines):
    """Determine complexity based on lines of code"""
    if lines > 300:
        return "High"
    elif lines > 150:
        return "Medium"
    else:
        return "Low"

def get_priority(filename, filepath):
    """Determine priority based on filename and path patterns"""
    # High priority patterns
    high_patterns = [
        'Client', 'Page', 'Form', 'Modal', 'Dialog',
        'Auth', 'Payment', 'Checkout', 'Dashboard',
        'Service', 'Provider', 'Hook'
    ]

    # Medium priority patterns
    medium_patterns = [
        'Settings', 'Profile', 'Management', 'Editor',
        'Table', 'List', 'Panel', 'Section'
    ]

    # Check if file contains business logic indicators
    business_logic_paths = ['dashboard', 'admin', 'billing', 'auth', 'plan']

    filename_lower = filename.lower()
    filepath_lower = str(filepath).lower()

    # Check high priority
    for pattern in high_patterns:
        if pattern.lower() in filename_lower:
            return "Critical"

    # Check if in business logic path
    for path in business_logic_paths:
        if path in filepath_lower:
            return "High"

    # Check medium priority
    for pattern in medium_patterns:
        if pattern.lower() in filename_lower:
            return "Medium"

    return "Low"

def analyze_directory(directory, category):
    """Analyze a directory for test coverage"""
    results = []

    # Find all component files
    for ext in ['.tsx', '.ts']:
        for file_path in directory.rglob(f'*{ext}'):
            # Skip test files, node_modules, .next
            if '__tests__' in str(file_path) or 'node_modules' in str(file_path) or '.next' in str(file_path):
                continue

            # Check if test file exists
            test_file = file_path.parent / '__tests__' / f"{file_path.stem}.test{ext}"

            if not test_file.exists():
                lines = count_lines(file_path)
                complexity = get_complexity(lines)
                priority = get_priority(file_path.stem, file_path)

                relative_path = file_path.relative_to(BASEDIR)

                results.append({
                    'path': str(relative_path),
                    'priority': priority,
                    'complexity': complexity,
                    'lines': lines,
                    'category': category
                })

    return results

def generate_report():
    """Generate comprehensive coverage gap analysis report"""

    print("=== Component Test Coverage Gap Analysis ===")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Collect all component files
    print("Analyzing component structure...")

    components_dir = BASEDIR / "components"
    app_dir = BASEDIR / "app"
    lib_dir = BASEDIR / "lib"
    services_dir = BASEDIR / "services"

    # Count files
    total_components = len(list(components_dir.rglob('*.tsx'))) + len(list(components_dir.rglob('*.ts')))
    total_components -= len(list(components_dir.rglob('*/__tests__/*.tsx'))) + len(list(components_dir.rglob('*/__tests__/*.ts')))

    total_app = len(list(app_dir.rglob('*.tsx')))
    total_app -= len(list(app_dir.rglob('*/__tests__/*.tsx')))

    total_lib = len(list(lib_dir.rglob('*.ts'))) if lib_dir.exists() else 0
    total_lib -= len(list(lib_dir.rglob('*/__tests__/*.ts'))) if lib_dir.exists() else 0

    total_services = len(list(services_dir.rglob('*.ts'))) if services_dir.exists() else 0
    total_services -= len(list(services_dir.rglob('*/__tests__/*.ts'))) if services_dir.exists() else 0

    # Count test files
    total_tests = len(list(components_dir.rglob('*/__tests__/*.test.tsx'))) + len(list(components_dir.rglob('*/__tests__/*.test.ts')))
    total_app_tests = len(list(app_dir.rglob('*/__tests__/*.test.tsx')))
    total_lib_tests = len(list(lib_dir.rglob('*/__tests__/*.test.ts'))) if lib_dir.exists() else 0
    total_services_tests = len(list(services_dir.rglob('*/__tests__/*.test.ts'))) if services_dir.exists() else 0

    total_files = total_components + total_app + total_lib + total_services
    total_test_files = total_tests + total_app_tests + total_lib_tests + total_services_tests

    coverage_pct = (total_test_files / total_files * 100) if total_files > 0 else 0

    print(f"Total Component Files: {total_files}")
    print(f"Total Test Files: {total_test_files}")
    print(f"Coverage: {coverage_pct:.2f}%")
    print()

    # Analyze each directory
    print("Analyzing components...")
    untested = []

    # Components
    untested.extend(analyze_directory(components_dir / "ui", "UI Components"))
    untested.extend(analyze_directory(components_dir / "layout", "Layout Components"))
    untested.extend(analyze_directory(components_dir / "sections", "Section Components"))
    untested.extend(analyze_directory(components_dir / "branding", "Branding Components"))
    untested.extend(analyze_directory(components_dir / "tutorial", "Tutorial Components"))
    untested.extend(analyze_directory(components_dir / "webinar", "Webinar Components"))
    untested.extend(analyze_directory(components_dir / "agent-swarm", "Agent Swarm Components"))
    untested.extend(analyze_directory(components_dir / "video", "Video Components"))
    untested.extend(analyze_directory(components_dir / "invoices", "Invoice Components"))
    untested.extend(analyze_directory(components_dir / "providers", "Provider Components"))

    # App components
    for subdir in app_dir.iterdir():
        if subdir.is_dir() and subdir.name not in ['api', '__tests__']:
            untested.extend(analyze_directory(subdir, f"App: {subdir.name}"))

    # Services
    if services_dir.exists():
        untested.extend(analyze_directory(services_dir, "Services"))

    # Lib
    if lib_dir.exists():
        untested.extend(analyze_directory(lib_dir, "Library"))

    # Sort by priority and complexity
    priority_order = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}
    complexity_order = {"High": 0, "Medium": 1, "Low": 2}

    untested.sort(key=lambda x: (priority_order[x['priority']], complexity_order[x['complexity']], -x['lines']))

    # Generate report
    with open(REPORT_FILE, 'w') as f:
        f.write(f"""# Component Test Coverage Gap Analysis

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Issue:** #354

## Executive Summary

- **Total Component Files:** {total_files}
- **Total Test Files:** {total_test_files}
- **File Test Coverage:** {coverage_pct:.2f}%
- **Current Code Coverage:** 9.93% (Statements), 8.54% (Branches), 9.03% (Functions), 10.13% (Lines)
- **Target Coverage:** 50% (Project Threshold)
- **Gap:** {total_files - total_test_files} files without tests
- **Status:** 🔴 CRITICAL - Significant gap requiring immediate attention

## Coverage Breakdown

### Components Directory
- Total Files: {total_components}
- Test Files: {total_tests}
- Coverage: {(total_tests / total_components * 100) if total_components > 0 else 0:.2f}%

### App Directory
- Total Files: {total_app}
- Test Files: {total_app_tests}
- Coverage: {(total_app_tests / total_app * 100) if total_app > 0 else 0:.2f}%

### Services Directory
- Total Files: {total_services}
- Test Files: {total_services_tests}
- Coverage: {(total_services_tests / total_services * 100) if total_services > 0 else 0:.2f}%

### Lib Directory
- Total Files: {total_lib}
- Test Files: {total_lib_tests}
- Coverage: {(total_lib_tests / total_lib * 100) if total_lib > 0 else 0:.2f}%

## Untested Components by Priority

""")

        # Group by category
        by_category = defaultdict(list)
        for item in untested:
            by_category[item['category']].append(item)

        # Write by category
        for category, items in sorted(by_category.items()):
            f.write(f"\n### {category}\n\n")
            f.write("| Component | Priority | Complexity | Lines |\n")
            f.write("|-----------|----------|------------|-------|\n")

            for item in items:
                priority_emoji = {"Critical": "🔴", "High": "🟠", "Medium": "🟡", "Low": "🟢"}
                emoji = priority_emoji.get(item['priority'], "⚪")
                f.write(f"| {item['path']} | {emoji} {item['priority']} | {item['complexity']} | {item['lines']} |\n")

        # Top 20 Critical Components
        f.write(f"""

## Top 20 Critical Components Needing Tests

These components have been prioritized based on:
1. Business logic complexity
2. User-facing importance
3. Critical functionality (auth, payments, data mutations)
4. Lines of code (complexity proxy)

| # | Component | Priority | Complexity | Lines | Reason |
|---|-----------|----------|------------|-------|--------|
""")

        for i, item in enumerate(untested[:20], 1):
            reason = "Business logic" if item['priority'] in ['Critical', 'High'] else "User interaction"
            if 'Client' in item['path']:
                reason = "Client component with state"
            elif 'Service' in item['path']:
                reason = "Service layer with business logic"
            elif 'Form' in item['path']:
                reason = "Form with validation"
            elif 'Modal' in item['path'] or 'Dialog' in item['path']:
                reason = "Interactive component"

            f.write(f"| {i} | {item['path']} | {item['priority']} | {item['complexity']} | {item['lines']} | {reason} |\n")

        f.write(f"""

## Priority Test Implementation Plan

### Phase 1: Critical Components (Week 1) - Top 20
**Focus:** Business logic, authentication, payments, data mutations

**Components to test:**
""")

        for i, item in enumerate(untested[:20], 1):
            f.write(f"{i}. `{item['path']}`\n")

        f.write(f"""

### Phase 2: High Priority Components (Week 2) - Next 30
**Focus:** Dashboard components, settings, user management

### Phase 3: Medium Priority Components (Week 3) - Next 50
**Focus:** Feature components, forms, navigation

### Phase 4: Low Priority Components (Week 4) - Remaining
**Focus:** UI components, simple wrappers, presentational components

## Testing Standards

### Required Test Coverage Per Component

#### Unit Tests (Required for all)
- ✅ Renders without crashing
- ✅ Props are correctly passed and displayed
- ✅ Event handlers work correctly
- ✅ Conditional rendering based on state/props
- ✅ Edge cases (null, undefined, empty arrays)
- ✅ Error boundaries

#### Integration Tests (Complex components)
- ✅ Component interactions with child components
- ✅ API calls with mocked responses
- ✅ Form submission workflows
- ✅ Navigation flows

#### Accessibility Tests (User-facing components)
- ✅ ARIA labels present
- ✅ Keyboard navigation works
- ✅ Screen reader compatibility
- ✅ Focus management

### Test Pattern Example

```typescript
// components/ui/__tests__/example-component.test.tsx

import {{ render, screen, fireEvent, waitFor }} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExampleComponent from '../example-component';

describe('ExampleComponent', () => {{
  // Given-When-Then pattern
  describe('Rendering', () => {{
    it('should render with required props', () => {{
      // Given
      const props = {{{{ title: 'Test', onSave: jest.fn() }}}};

      // When
      render(<ExampleComponent {{{{...props}}}} />);

      // Then
      expect(screen.getByText('Test')).toBeInTheDocument();
    }});
  }});

  describe('User Interactions', () => {{
    it('should call onSave when button clicked', async () => {{
      // Given
      const onSave = jest.fn();
      const user = userEvent.setup();
      render(<ExampleComponent onSave={{{{onSave}}}} />);

      // When
      await user.click(screen.getByRole('button', {{{{ name: /save/i }}}}));

      // Then
      expect(onSave).toHaveBeenCalledTimes(1);
    }});
  }});

  describe('Error Handling', () => {{
    it('should display error message on failure', async () => {{
      // Given
      const onSave = jest.fn().mockRejectedValue(new Error('Save failed'));
      render(<ExampleComponent onSave={{{{onSave}}}} />);

      // When
      fireEvent.click(screen.getByRole('button', {{{{ name: /save/i }}}}));

      // Then
      await waitFor(() => {{
        expect(screen.getByText(/save failed/i)).toBeInTheDocument();
      }});
    }});
  }});
}});
```

### Coverage Thresholds

```javascript
// jest.config.js
coverageThreshold: {{
  global: {{
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  }},
  // Per-file thresholds for critical files
  './components/ui/button.tsx': {{
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  }},
}}
```

## Jest Configuration Optimization

### Current Issues
1. ❌ Coverage thresholds not met (9.93% vs 50% target)
2. ❌ Many test failures (37 failing tests)
3. ❌ Slow test execution
4. ⚠️ Missing test isolation

### Recommended Improvements

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({{
  dir: './',
}});

const customJestConfig = {{
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',

  // Better module resolution
  moduleNameMapper: {{
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
  }},

  // Comprehensive test matching
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Coverage collection
  collectCoverageFrom: [
    'app/**/*.{{js,jsx,ts,tsx}}',
    'components/**/*.{{js,jsx,ts,tsx}}',
    'lib/**/*.{{js,jsx,ts,tsx}}',
    'services/**/*.{{js,jsx,ts,tsx}}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/e2e/**',
    '!**/.next/**',
    '!**/coverage/**',
  ]],

  // Updated thresholds (gradual improvement)
  coverageThreshold: {{
    global: {{
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    }},
  }},

  // Reporters
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json-summary'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/',
    '<rootDir>/coverage/',
  ]],

  // Performance
  maxWorkers: '50%',
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
}};

module.exports = createJestConfig(customJestConfig);
```

## Next Steps

### Immediate Actions (This Week)
1. ✅ Review this gap analysis report
2. 📝 Create GitHub issues for top 20 critical components
3. 🧪 Begin implementing tests for Phase 1 components
4. ⚙️ Optimize Jest configuration
5. 🔧 Fix failing tests

### Short-term Goals (Next 2 Weeks)
1. 🎯 Achieve 30% file test coverage
2. 🎯 Achieve 25% code coverage (statements)
3. 🧪 Complete Phase 1 critical component tests
4. 📊 Set up coverage tracking in CI/CD

### Long-term Goals (Next Month)
1. 🎯 Achieve 80% file test coverage
2. 🎯 Achieve 50% code coverage (meet thresholds)
3. 🧪 Complete all high and medium priority tests
4. 📈 Implement coverage ratcheting (prevent regression)
5. 🔄 Regular coverage reviews in PRs

## Automation Recommendations

### Pre-commit Hook
```bash
# .husky/pre-commit
npm run test -- --coverage --changedSince=main
```

### PR Quality Gates
- Require tests for new components
- Block PRs that decrease coverage
- Require 80% coverage for new code

### Coverage Badges
Add coverage badges to README:
```markdown
![Coverage](https://img.shields.io/badge/coverage-9.93%25-red)
![Tests](https://img.shields.io/badge/tests-899%20passing-green)
```

## Useful Commands

```bash
# Run all tests with coverage
npm test -- --coverage

# Run tests for specific file
npm test -- button.test.tsx

# Run tests in watch mode
npm test -- --watch

# Update snapshots
npm test -- -u

# Run tests matching pattern
npm test -- --testNamePattern="should render"

# Generate HTML coverage report
npm test -- --coverage --coverageReporters=html
open coverage/index.html
```

## Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Accessibility Testing](https://testing-library.com/docs/queries/about/#priority)

---

**Report Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Total Untested Files:** {len(untested)}
**Priority Distribution:** Critical: {len([x for x in untested if x['priority'] == 'Critical'])}, High: {len([x for x in untested if x['priority'] == 'High'])}, Medium: {len([x for x in untested if x['priority'] == 'Medium'])}, Low: {len([x for x in untested if x['priority'] == 'Low'])}
""")

    print(f"\n✅ Report generated: {REPORT_FILE}")
    print(f"\n📊 Statistics:")
    print(f"   Total Files: {total_files}")
    print(f"   Test Files: {total_test_files}")
    print(f"   Coverage: {coverage_pct:.2f}%")
    print(f"   Untested: {len(untested)}")
    print(f"\n🎯 Top Priority: Test the top 20 critical components first!")

if __name__ == "__main__":
    generate_report()
