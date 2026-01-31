# Service Import Verification Tools

This directory contains tools for verifying service naming standardization (Issue #481).

## Quick Start

### Run Verification Script
```bash
./test/verify-service-imports.sh
```

### Run Service Import Tests
```bash
npm test -- services/__tests__/service-imports.test.ts
```

### Run Full Service Test Suite with Coverage
```bash
npm test -- services/__tests__/ --coverage
```

## Tools

### 1. Verification Script (`verify-service-imports.sh`)

Comprehensive bash script that checks:
- PascalCase service imports (should be zero)
- Service file naming convention
- Service import resolution
- Duplicate service names
- Test file imports

**Exit Codes:**
- `0` - All checks passed
- `1` - Some checks failed

**Usage in CI/CD:**
```yaml
- name: Verify Service Naming
  run: ./test/verify-service-imports.sh
```

### 2. Service Import Test Suite (`services/__tests__/service-imports.test.ts`)

Jest test suite that validates:
- Service file naming conventions
- Import statement correctness
- Case-sensitive filesystem compatibility
- Service export patterns
- Migration progress tracking

**Run Tests:**
```bash
npm test -- services/__tests__/service-imports.test.ts
```

## Current Status

**PascalCase Services to Migrate:** 5
- AuthService.ts → authService.ts
- InvoiceService.ts → invoiceService.ts
- RLHFService.ts → rlhfService.ts
- SemanticSearchService.ts → semanticSearchService.ts
- UserService.ts → userService.ts

**PascalCase Imports to Update:** 24

**Service Test Coverage:** 24.12% (Target: 85%+)

## Coverage Goals

### High Coverage Services (85%+)
- ✅ apiKeyService.ts (100%)
- ✅ usageService.ts (100%)
- ✅ userSettingsService.ts (100%)
- ✅ creditService.ts (97.64%)
- ✅ billingService.ts (89.25%)

### Needs Coverage Improvement
- ⚠️ InvoiceService.ts (51.44%)
- ⚠️ SemanticSearchService.ts (40.62%)
- ❌ AuthService.ts (0%)
- ❌ UserService.ts (0%)
- ❌ Many others (0%)

## Integration

### Pre-commit Hook (Recommended)
Add to `.husky/pre-commit`:
```bash
./test/verify-service-imports.sh || exit 1
```

### GitHub Actions
```yaml
- name: Service Verification
  run: |
    chmod +x test/verify-service-imports.sh
    ./test/verify-service-imports.sh
```

## Documentation

See full report: `/Users/aideveloper/ainative-website-nextjs-staging/docs/test-coverage-report-issue-481.md`
