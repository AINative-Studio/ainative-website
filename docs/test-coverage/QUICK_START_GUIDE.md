# Test Coverage - Quick Start Guide

**Issue #354** | **For:** AINative Studio Development Team

---

## TL;DR - What You Need to Know

✅ **20 new test files created** for critical components
✅ **Test coverage increased** from 1.57% to 5.06% (file coverage)
✅ **Jest configuration optimized** for better performance
✅ **Testing standards established** with BDD patterns

---

## Quick Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test
npm test -- DashboardClient.test.tsx

# Run in watch mode (for development)
npm test -- --watch

# View HTML coverage report
npm test -- --coverage && open coverage/index.html
```

---

## For Developers: Writing New Tests

### 1. Create Test File
Place tests in `__tests__` directory next to component:
```
app/my-feature/
├── __tests__/
│   └── MyComponent.test.tsx  ← Create this
└── MyComponent.tsx
```

### 2. Use the Template Generator
```bash
# Generate test template automatically
python3 scripts/generate-test-template.py
```

### 3. Basic Test Structure
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    // Given
    render(<MyComponent />);

    // Then
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    // Given
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<MyComponent onClick={onClick} />);

    // When
    await user.click(screen.getByRole('button'));

    // Then
    expect(onClick).toHaveBeenCalled();
  });
});
```

---

## For Code Reviewers: Test Checklist

When reviewing PRs, ensure:

### Required for All Components
- [ ] Test file exists in `__tests__` directory
- [ ] Tests cover basic rendering
- [ ] Tests cover props variations
- [ ] Tests cover user interactions
- [ ] Tests cover error states

### Required for Complex Components
- [ ] State management tests
- [ ] Form validation tests
- [ ] API integration tests (with mocks)
- [ ] Accessibility tests (ARIA, keyboard)
- [ ] Edge case tests (null, empty, large data)

### Coverage Requirements
- [ ] New files: 80% coverage minimum
- [ ] Modified files: Coverage not decreased
- [ ] All tests passing ✅

---

## Common Testing Patterns

### 1. Testing Forms
```typescript
it('should validate and submit form', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();

  render(<MyForm onSubmit={onSubmit} />);

  // Fill form
  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.type(screen.getByLabelText('Password'), 'password123');

  // Submit
  await user.click(screen.getByRole('button', { name: /submit/i }));

  // Assert
  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

### 2. Testing API Calls
```typescript
it('should fetch data on mount', async () => {
  // Mock API
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: ['item1', 'item2'] }),
    })
  ) as jest.Mock;

  render(<MyComponent />);

  // Wait for data
  await waitFor(() => {
    expect(screen.getByText('item1')).toBeInTheDocument();
  });
});
```

### 3. Testing State Changes
```typescript
it('should toggle state on button click', async () => {
  const user = userEvent.setup();
  render(<ToggleComponent />);

  // Initial state
  expect(screen.getByText('Off')).toBeInTheDocument();

  // Toggle
  await user.click(screen.getByRole('button', { name: /toggle/i }));

  // New state
  expect(screen.getByText('On')).toBeInTheDocument();
});
```

### 4. Testing Accessibility
```typescript
it('should be keyboard accessible', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);

  // Tab to element
  await user.tab();

  // Check focus
  expect(screen.getByRole('button')).toHaveFocus();

  // Activate with Enter
  await user.keyboard('{Enter}');

  // Verify action
  expect(mockHandler).toHaveBeenCalled();
});
```

---

## Mocking Cheat Sheet

### Next.js Router
```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/test-path',
}));
```

### Authentication
```typescript
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      expires: '2025-12-31',
    },
    status: 'authenticated',
  }),
}));
```

### API Calls
```typescript
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: {} }),
  })
) as jest.Mock;
```

---

## Coverage Goals

### Current Status
- **File Coverage:** 5.06% (29/573 files)
- **Code Coverage:** 9.93% (statements)

### Targets
- **Week 2:** 15% code coverage
- **Week 4:** 25% code coverage
- **Week 8:** 50% code coverage (meets Jest threshold)

### Per-File Requirements
- New components: **80% coverage required**
- Existing components: **No coverage decrease**
- Critical components: **90% coverage target**

---

## Troubleshooting

### Tests Failing?

**Problem:** "Cannot find module '@/components/...'"
**Solution:** Check `jest.config.js` has correct module mapper

**Problem:** "useRouter is not a function"
**Solution:** Add Next.js router mock (see Mocking Cheat Sheet)

**Problem:** "fetch is not defined"
**Solution:** Mock global.fetch (see example above)

**Problem:** "Element not found in document"
**Solution:** Use `waitFor()` for async content:
```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### Coverage Not Updating?

```bash
# Clear Jest cache
npm test -- --clearCache

# Delete coverage directory
rm -rf coverage/

# Run coverage again
npm test -- --coverage
```

---

## Resources

### Documentation
- 📄 [Full Coverage Analysis](./coverage-gap-analysis.md)
- 📊 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- 🧪 [React Testing Library](https://testing-library.com/react)
- 📚 [Jest Documentation](https://jestjs.io/docs/getting-started)

### Scripts
- `scripts/analyze-test-coverage.py` - Generate coverage reports
- `scripts/generate-test-template.py` - Create test templates

### Example Tests
- `components/ui/__tests__/button.test.tsx`
- `app/dashboard/__tests__/DashboardClient.test.tsx`
- `services/__tests__/creditService.test.ts`

---

## Getting Help

### Common Questions

**Q: Do I need to test every component?**
A: Yes, eventually. Start with critical/complex components first.

**Q: How much coverage is enough?**
A: Minimum 80% for new files, 50% globally (Jest threshold).

**Q: What should I test?**
A: Rendering, user interactions, state changes, API calls, edge cases, accessibility.

**Q: How do I test async code?**
A: Use `waitFor()` from Testing Library and async/await.

**Q: Can I skip tests for simple components?**
A: Simple components still need basic render tests. Use snapshot tests for very simple cases.

### Need More Help?

1. Check existing test files for examples
2. Review [Testing Library docs](https://testing-library.com/react)
3. Run analysis script: `python3 scripts/analyze-test-coverage.py`
4. Ask in team chat or PR comments

---

## Test Quality Checklist

Before submitting your PR, ensure:

✅ **Tests Run:** `npm test` passes
✅ **Coverage Acceptable:** Check with `npm test -- --coverage`
✅ **Follows BDD Pattern:** Given-When-Then structure
✅ **Mocks Properly:** No real API calls or side effects
✅ **Tests Behavior:** Not implementation details
✅ **Descriptive Names:** Test names explain what they verify
✅ **Accessibility:** Includes keyboard and ARIA tests
✅ **Edge Cases:** Handles null, empty, and error states

---

**Updated:** 2026-01-19 | **Issue:** #354 | **Status:** Active ✅
