'use client';

/**
 * SearchInputWithSuggestions Component
 * Search input field with integrated suggestions dropdown
 */

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SearchSuggestionsDropdown } from './SearchSuggestionsDropdown';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchInputWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  useMockData?: boolean;
  autoFocus?: boolean;
}

/**
 * SearchInputWithSuggestions Component
 * Combines search input with suggestions dropdown
 */
export function SearchInputWithSuggestions({
  value,
  onChange,
  onSearch,
  placeholder = 'Search blog posts, tutorials, docs...',
  className,
  useMockData = false,
  autoFocus = false,
}: SearchInputWithSuggestionsProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce the query for suggestions
  const debouncedQuery = useDebounce(value, 300);

  // Show suggestions when focused and has query
  useEffect(() => {
    if (isFocused && debouncedQuery.length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [isFocused, debouncedQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);

    // Trigger search immediately with the selected suggestion
    if (onSearch) {
      onSearch(suggestion);
    }

    // Keep focus on input
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If Enter is pressed and no suggestion is selected, trigger search
    if (e.key === 'Enter' && !showSuggestions && onSearch) {
      e.preventDefault();
      onSearch(value);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 pointer-events-none" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay blur to allow suggestion clicks to register
            setTimeout(() => setIsFocused(false), 200);
          }}
          className="pl-10 pr-10 h-12 text-lg"
          autoFocus={autoFocus}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={showSuggestions}
        />
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <SearchSuggestionsDropdown
        query={debouncedQuery}
        onSelectSuggestion={handleSelectSuggestion}
        onClose={() => setShowSuggestions(false)}
        isVisible={showSuggestions}
        useMockData={useMockData}
      />
    </div>
  );
}
