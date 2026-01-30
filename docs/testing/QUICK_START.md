# AIKit TDD Tests - Quick Start

## 🚀 Run All Tests

```bash
./scripts/test-aikit.sh
```

## 📊 Generate Coverage Report

```bash
./scripts/test-aikit.sh --coverage
open coverage/aikit/lcov-report/index.html
```

## 🔍 TDD Development Mode

```bash
./scripts/test-aikit.sh --watch
```

## 🎯 Run Specific Tests

### Unit Tests Only
```bash
./scripts/test-aikit.sh --unit
```

### Integration Tests Only
```bash
./scripts/test-aikit.sh --integration
```

### E2E Tests Only
```bash
./scripts/test-aikit.sh --e2e
```

### Single Component
```bash
npm test components/ui/__tests__/aikit-button.test.tsx
```

## 🏗️ TDD Workflow

```bash
# 1. Write failing test
npm run test:watch -- components/ui/__tests__/aikit-button.test.tsx

# 2. Write minimal code to pass
# Edit components/ui/button.tsx

# 3. Refactor with confidence
```

## 📋 Test Files

- **Button**: `components/ui/__tests__/aikit-button.test.tsx`
- **Input**: `components/ui/__tests__/aikit-textfield.test.tsx`
- **Tabs**: `components/ui/__tests__/aikit-tabs.test.tsx`
- **Slider**: `components/ui/__tests__/aikit-slider.test.tsx`
- **Checkbox**: `components/ui/__tests__/aikit-checkbox.test.tsx`
- **Select**: `components/ui/__tests__/aikit-select.test.tsx`
- **Separator**: `components/ui/__tests__/aikit-separator.test.tsx`
- **Integration**: `app/ai-kit/__tests__/AIKitDashboardIntegration.test.tsx`
- **E2E**: `e2e/aikit-dashboard.spec.ts`

## ✅ Coverage Requirements

- **Minimum**: 80% (all metrics)
- **Button/Input**: 90%
- **Dashboard**: 85%

## 🔧 Troubleshooting

### Clear Jest Cache
```bash
npm test -- --clearCache
```

### Increase Memory
```bash
NODE_OPTIONS=--max_old_space_size=4096 npm test
```

### Debug Single Test
```bash
npm test -- -t "test name here"
```

## 📚 Full Documentation

See `/Users/aideveloper/ainative-website-nextjs-staging/docs/testing/AIKIT_TESTING_GUIDE.md`

---

**Quick Tip**: Run `./scripts/test-aikit.sh --help` for all options
