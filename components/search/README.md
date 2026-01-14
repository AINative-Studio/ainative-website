# Search Components

Real-time search suggestions with keyboard navigation and accessibility support.

## Quick Start

```tsx
import { SearchInputWithSuggestions } from '@/components/search';

function MyPage() {
  const [query, setQuery] = useState('');

  return (
    <SearchInputWithSuggestions
      value={query}
      onChange={setQuery}
      onSearch={(q) => console.log('Searching:', q)}
      placeholder="Search..."
      useMockData={true} // Use mock data during development
    />
  );
}
```

## Components

### SearchInputWithSuggestions

Complete search input with integrated suggestions dropdown.

**Props:**
- `value: string` - Current search query
- `onChange: (value: string) => void` - Query change handler
- `onSearch?: (value: string) => void` - Search trigger handler (Enter or suggestion click)
- `placeholder?: string` - Input placeholder text
- `className?: string` - Additional CSS classes
- `useMockData?: boolean` - Use mock data (default: false)
- `autoFocus?: boolean` - Auto-focus on mount (default: false)

**Example:**
```tsx
<SearchInputWithSuggestions
  value={searchQuery}
  onChange={setSearchQuery}
  onSearch={handleSearch}
  placeholder="Search community content..."
  autoFocus
  useMockData={false} // Use real API
/>
```

### SearchSuggestionsDropdown

Standalone suggestions dropdown (used internally by SearchInputWithSuggestions).

**Props:**
- `query: string` - Search query
- `onSelectSuggestion: (suggestion: string) => void` - Suggestion selection handler
- `onClose: () => void` - Close handler
- `isVisible: boolean` - Visibility state
- `useMockData?: boolean` - Use mock data (default: false)
- `className?: string` - Additional CSS classes

**Example:**
```tsx
<SearchSuggestionsDropdown
  query={debouncedQuery}
  onSelectSuggestion={(s) => setQuery(s)}
  onClose={() => setVisible(false)}
  isVisible={visible}
  useMockData={true}
/>
```

## Keyboard Navigation

- **↑/↓** - Navigate suggestions
- **Enter** - Select highlighted suggestion
- **Escape** - Close dropdown
- **Tab** - Standard navigation

## Features

✅ Real-time suggestions
✅ 300ms debouncing
✅ Keyboard navigation
✅ Click to select
✅ Loading states
✅ Error handling
✅ Accessibility (ARIA)
✅ Responsive design

## Development Mode

During development, use mock data:

```tsx
<SearchInputWithSuggestions
  {...props}
  useMockData={true}
/>
```

## Production Mode

Once backend API is ready:

```tsx
<SearchInputWithSuggestions
  {...props}
  useMockData={false}
/>
```

## API Endpoint

```
GET /v1/public/zerodb/search/suggestions?q={query}&limit={limit}
```

See `docs/features/SEARCH_SUGGESTIONS.md` for full API documentation.
