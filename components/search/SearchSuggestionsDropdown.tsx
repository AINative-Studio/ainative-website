'use client';

/**
 * SearchSuggestionsDropdown Component
 * Displays search suggestions with keyboard navigation support
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as React from 'react';
import { Loader2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSearchSuggestions } from '@/hooks/useSearchSuggestions';
import type { SearchSuggestion } from '@/types/search';
import { getContentTypeIcon } from '@/lib/community/search';

interface SearchSuggestionsDropdownProps {
  query: string;
  onSelectSuggestion: (suggestion: string) => void;
  onClose: () => void;
  isVisible: boolean;
  useMockData?: boolean;
  className?: string;
}

/**
 * SearchSuggestionsDropdown Component
 * Renders a dropdown with search suggestions and keyboard navigation
 */
export function SearchSuggestionsDropdown({
  query,
  onSelectSuggestion,
  onClose,
  isVisible,
  useMockData = false,
  className,
}: SearchSuggestionsDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Fetch suggestions using the hook
  const { data, isLoading, error } = useSearchSuggestions({
    query,
    options: { limit: 5, minQueryLength: 2 },
  });

  const suggestions = data?.suggestions || [];
  const hasSuggestions = suggestions.length > 0;

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isVisible || suggestions.length === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;

        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;

        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            onSelectSuggestion(suggestions[selectedIndex].text);
          }
          break;

        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    },
    [isVisible, suggestions, selectedIndex, onSelectSuggestion, onClose]
  );

  // Attach keyboard event listener
  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  // Don't render if not visible or no query
  if (!isVisible || query.length < 2) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-2xl z-50 overflow-hidden',
        'animate-in fade-in-0 slide-in-from-top-2 duration-200',
        className
      )}
      role="listbox"
      aria-label="Search suggestions"
    >
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-6 px-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">
            Loading suggestions...
          </span>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="py-4 px-4 text-sm text-muted-foreground">
          Unable to load suggestions. Try again.
        </div>
      )}

      {/* Suggestions List */}
      {!isLoading && !error && hasSuggestions && (
        <div className="py-2 max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <SuggestionItem
              key={`${suggestion.text}-${index}`}
              suggestion={suggestion}
              isSelected={index === selectedIndex}
              onClick={() => onSelectSuggestion(suggestion.text)}
              ref={(el) => { suggestionRefs.current[index] = el; }}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && !hasSuggestions && (
        <div className="py-6 px-4 text-center text-sm text-muted-foreground">
          No suggestions found for "{query}"
        </div>
      )}

      {/* Footer with keyboard hints */}
      {!isLoading && hasSuggestions && (
        <div className="border-t border-border bg-muted/30 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">
                Enter
              </kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">
                Esc
              </kbd>
              Close
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual Suggestion Item Component
 */
interface SuggestionItemProps {
  suggestion: SearchSuggestion;
  isSelected: boolean;
  onClick: () => void;
}

const SuggestionItem = React.forwardRef<HTMLButtonElement, SuggestionItemProps>(
  ({ suggestion, isSelected, onClick }, ref) => {
    const categoryIcon = getContentTypeIcon(suggestion.category);

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          'w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer',
          'focus:outline-none focus:bg-muted/50',
          isSelected && 'bg-muted/50'
        )}
        role="option"
        aria-selected={isSelected}
      >
        {/* Icon */}
        <div className="flex-shrink-0 text-lg">{categoryIcon}</div>

        {/* Suggestion Text */}
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-foreground">
            {suggestion.text}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {suggestion.result_count} result
            {suggestion.result_count !== 1 ? 's' : ''} in {suggestion.category}
          </div>
        </div>

        {/* Relevance Badge */}
        <div className="flex-shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          <span>{Math.round(suggestion.relevance_score * 100)}%</span>
        </div>
      </button>
    );
  }
);

SuggestionItem.displayName = 'SuggestionItem';
