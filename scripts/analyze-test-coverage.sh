#!/bin/bash

# Component Test Coverage Gap Analysis Script
# Issue #354 - Comprehensive component test coverage audit

BASEDIR="/Users/aideveloper/ainative-website-nextjs-staging"
OUTPUT_DIR="$BASEDIR/docs/test-coverage"
REPORT_FILE="$OUTPUT_DIR/coverage-gap-analysis.md"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Component Test Coverage Gap Analysis ===${NC}"
echo "Date: $(date)"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Initialize report
cat > "$REPORT_FILE" << 'EOF'
# Component Test Coverage Gap Analysis
**Generated:** $(date)
**Issue:** #354

## Executive Summary

EOF

# Count total component files
echo -e "${YELLOW}Analyzing component structure...${NC}"

TOTAL_COMPONENTS=$(find "$BASEDIR/components" -name "*.tsx" -o -name "*.ts" | grep -v "__tests__" | grep -v "node_modules" | grep -v ".next" | wc -l | tr -d ' ')
TOTAL_APP_COMPONENTS=$(find "$BASEDIR/app" -name "*Client.tsx" -o -name "*page.tsx" | grep -v "node_modules" | grep -v ".next" | wc -l | tr -d ' ')
TOTAL_TESTS=$(find "$BASEDIR/components" -path "*__tests__*" -name "*.test.tsx" -o -name "*.test.ts" | wc -l | tr -d ' ')
TOTAL_APP_TESTS=$(find "$BASEDIR/app" -path "*__tests__*" -name "*.test.tsx" | wc -l | tr -d ' ')

echo "Total Components: $TOTAL_COMPONENTS"
echo "Total App Components: $TOTAL_APP_COMPONENTS"
echo "Total Component Tests: $TOTAL_TESTS"
echo "Total App Tests: $TOTAL_APP_TESTS"

# Calculate coverage percentage
TOTAL_FILES=$((TOTAL_COMPONENTS + TOTAL_APP_COMPONENTS))
TOTAL_TEST_FILES=$((TOTAL_TESTS + TOTAL_APP_TESTS))
COVERAGE_PCT=$(echo "scale=2; ($TOTAL_TEST_FILES / $TOTAL_FILES) * 100" | bc)

cat >> "$REPORT_FILE" << EOF
- **Total Component Files:** $TOTAL_FILES
- **Total Test Files:** $TOTAL_TEST_FILES
- **Test Coverage:** ${COVERAGE_PCT}%
- **Current Code Coverage:** 9.93% (Statements), 8.54% (Branches)
- **Target Coverage:** 50% (Project Threshold)
- **Gap:** ${GREEN}Significant gap requiring immediate attention${NC}

## Coverage Breakdown

### Components Directory
- Total Files: $TOTAL_COMPONENTS
- Test Files: $TOTAL_TESTS
- Coverage: $(echo "scale=2; ($TOTAL_TESTS / $TOTAL_COMPONENTS) * 100" | bc)%

### App Directory
- Total Files: $TOTAL_APP_COMPONENTS
- Test Files: $TOTAL_APP_TESTS
- Coverage: $(echo "scale=2; ($TOTAL_APP_TESTS / $TOTAL_APP_COMPONENTS) * 100" | bc)%

## Untested Components by Category

EOF

# Function to analyze directory
analyze_directory() {
    local dir=$1
    local category=$2

    echo -e "\n### $category" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "| Component | Status | Priority | Complexity |" >> "$REPORT_FILE"
    echo "|-----------|--------|----------|------------|" >> "$REPORT_FILE"

    for file in $(find "$dir" -name "*.tsx" | grep -v "__tests__" | grep -v "node_modules" | sort); do
        filename=$(basename "$file" .tsx)
        dirname=$(dirname "$file")

        # Check if test exists
        test_file="$dirname/__tests__/${filename}.test.tsx"

        if [ ! -f "$test_file" ]; then
            # Calculate complexity (lines of code)
            lines=$(wc -l < "$file" | tr -d ' ')

            # Determine priority based on name patterns
            priority="Medium"
            if [[ $filename =~ (Client|Page|Form|Modal|Dialog) ]]; then
                priority="High"
            elif [[ $filename =~ (Card|Badge|Button|Icon) ]]; then
                priority="Low"
            fi

            # Determine complexity
            complexity="Low"
            if [ "$lines" -gt 300 ]; then
                complexity="High"
            elif [ "$lines" -gt 150 ]; then
                complexity="Medium"
            fi

            relative_path=$(echo "$file" | sed "s|$BASEDIR/||")
            echo "| $relative_path | ❌ No Test | $priority | $complexity ($lines LOC) |" >> "$REPORT_FILE"
        fi
    done
}

# Analyze UI components
echo -e "${YELLOW}Analyzing UI components...${NC}"
analyze_directory "$BASEDIR/components/ui" "UI Components"

# Analyze layout components
echo -e "${YELLOW}Analyzing layout components...${NC}"
analyze_directory "$BASEDIR/components/layout" "Layout Components"

# Analyze business components
echo -e "${YELLOW}Analyzing business components...${NC}"
analyze_directory "$BASEDIR/components/sections" "Section Components"
analyze_directory "$BASEDIR/components/branding" "Branding Components"
analyze_directory "$BASEDIR/components/tutorial" "Tutorial Components"
analyze_directory "$BASEDIR/components/webinar" "Webinar Components"
analyze_directory "$BASEDIR/components/agent-swarm" "Agent Swarm Components"

# Analyze app components
echo -e "${YELLOW}Analyzing app components...${NC}"
for dir in "$BASEDIR/app"/*; do
    if [ -d "$dir" ] && [ "$(basename "$dir")" != "api" ]; then
        category=$(basename "$dir")
        analyze_directory "$dir" "App: $category"
    fi
done

# Add recommendations
cat >> "$REPORT_FILE" << 'EOF'

## Priority Test Implementation Plan

### Phase 1: Critical High-Priority Components (Week 1)
Focus on components with:
- Business logic
- User authentication/authorization
- Payment processing
- Data mutations
- Complex state management

### Phase 2: Medium Priority Components (Week 2)
Focus on components with:
- Form validation
- Data display
- Navigation
- User interactions

### Phase 3: Low Priority Components (Week 3)
Focus on components with:
- Static UI elements
- Simple wrappers
- Presentational components

## Testing Standards

### Required Test Coverage
- **Unit Tests:** All components must have unit tests
- **Integration Tests:** Complex workflows require integration tests
- **E2E Tests:** Critical user journeys covered by Playwright

### Test Patterns
- Use React Testing Library for component tests
- Follow BDD-style Given-When-Then format
- Mock external dependencies (API calls, auth)
- Test accessibility (ARIA labels, keyboard navigation)
- Test error states and edge cases

### Coverage Thresholds
```javascript
coverageThreshold: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  },
}
```

## Next Steps

1. ✅ Review this gap analysis report
2. 📝 Prioritize components for testing
3. 🧪 Create test files for top 20 critical components
4. ⚙️ Optimize Jest configuration
5. 🔄 Run coverage analysis again
6. 📊 Generate updated metrics

## Jest Configuration Recommendations

### Current Configuration Issues
- Coverage thresholds not met (9.93% vs 50% target)
- Need better test isolation
- Consider parallel test execution

### Recommended Improvements
```javascript
// jest.config.js improvements
{
  maxWorkers: '50%', // Parallel execution
  testTimeout: 10000, // Increase for complex tests
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/e2e/**',
  ],
}
```

EOF

echo ""
echo -e "${GREEN}=== Analysis Complete ===${NC}"
echo -e "Report generated: ${YELLOW}$REPORT_FILE${NC}"
echo ""
echo -e "${YELLOW}Summary:${NC}"
echo -e "  Total Files: $TOTAL_FILES"
echo -e "  Test Files: $TOTAL_TEST_FILES"
echo -e "  Coverage: ${RED}${COVERAGE_PCT}%${NC}"
echo -e "  Gap: ${RED}$(echo "scale=0; $TOTAL_FILES - $TOTAL_TEST_FILES" | bc) files without tests${NC}"
echo ""
