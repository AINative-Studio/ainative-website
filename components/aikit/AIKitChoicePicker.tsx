/**
 * AIKitChoicePicker - Multi-choice Selection Component
 *
 * Provides chip-based selection interface with:
 * - Single or multi-select modes
 * - Keyboard navigation (Arrow keys, Home, End, Enter, Space, Tab)
 * - Disabled options support
 * - Maximum selection limits
 * - Clear all functionality
 * - WCAG 2.1 AA accessibility compliance
 * - Dark theme support
 * - Smooth transitions and animations
 *
 * @example
 * ```tsx
 * <AIKitChoicePicker
 *   label="Choose your preferences"
 *   options={[
 *     { id: '1', label: 'Option 1', value: 'opt1' },
 *     { id: '2', label: 'Option 2', value: 'opt2' }
 *   ]}
 *   onChange={(values) => console.log(values)}
 *   mode="multi"
 *   showClearAll
 * />
 * ```
 */

'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Option configuration type
 */
export interface ChoiceOption {
  /** Unique identifier for the option */
  id: string;
  /** Display label */
  label: string;
  /** Value to be used in selection */
  value: string;
  /** Whether this option is disabled */
  disabled?: boolean;
}

/**
 * Component props
 */
export interface AIKitChoicePickerProps {
  /** Label for the choice picker group */
  label?: string;
  /** Array of available options */
  options: ChoiceOption[];
  /** Callback when selection changes */
  onChange?: (values: string[]) => void;
  /** Current selected values (controlled) */
  value?: string[];
  /** Default selected values (uncontrolled) */
  defaultValue?: string[];
  /** Selection mode: single or multi */
  mode?: 'single' | 'multi';
  /** Disable all options */
  disabled?: boolean;
  /** Show clear all button */
  showClearAll?: boolean;
  /** Maximum number of selections allowed (multi mode only) */
  maxSelections?: number;
  /** Additional CSS classes */
  className?: string;
  /** ARIA label for the group */
  'aria-label'?: string;
}

/**
 * AIKitChoicePicker Component (Optimized with React.memo)
 */
const AIKitChoicePickerComponent: React.FC<AIKitChoicePickerProps> = ({
  label,
  options,
  onChange,
  value: controlledValue,
  defaultValue = [],
  mode = 'multi',
  disabled = false,
  showClearAll = false,
  maxSelections,
  className,
  'aria-label': ariaLabel,
}) => {
  // State management - supports both controlled and uncontrolled modes
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const isControlled = controlledValue !== undefined;
  const selectedValues = isControlled ? controlledValue : internalValue;

  // Refs for keyboard navigation
  const optionsRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  /**
   * Memoize selected values set for O(1) lookup
   */
  const selectedValuesSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  /**
   * Handle option selection
   */
  const handleOptionClick = useCallback(
    (optionValue: string, optionDisabled?: boolean) => {
      if (disabled || optionDisabled) {
        return;
      }

      let newValues: string[];

      if (mode === 'single') {
        // Single mode: toggle or replace
        newValues = selectedValues.includes(optionValue) ? [] : [optionValue];
      } else {
        // Multi mode: toggle with max limit check
        const isSelected = selectedValues.includes(optionValue);

        if (isSelected) {
          // Always allow deselection
          newValues = selectedValues.filter(v => v !== optionValue);
        } else {
          // Check max selections limit
          if (maxSelections && selectedValues.length >= maxSelections) {
            // Don't add if limit reached
            return;
          }
          newValues = [...selectedValues, optionValue];
        }
      }

      // Update state
      if (!isControlled) {
        setInternalValue(newValues);
      }

      // Call onChange callback
      onChange?.(newValues);
    },
    [disabled, mode, selectedValues, maxSelections, isControlled, onChange]
  );

  /**
   * Handle clear all
   */
  const handleClearAll = useCallback(() => {
    if (disabled) {
      return;
    }

    if (!isControlled) {
      setInternalValue([]);
    }

    onChange?.([]);
  }, [disabled, isControlled, onChange]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, currentIndex: number, optionValue: string, optionDisabled?: boolean) => {
      const totalOptions = options.length;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown': {
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % totalOptions;
          const nextOption = options[nextIndex];
          if (nextOption) {
            const nextButton = optionsRefs.current.get(nextOption.id);
            nextButton?.focus();
          }
          break;
        }

        case 'ArrowLeft':
        case 'ArrowUp': {
          event.preventDefault();
          const prevIndex = (currentIndex - 1 + totalOptions) % totalOptions;
          const prevOption = options[prevIndex];
          if (prevOption) {
            const prevButton = optionsRefs.current.get(prevOption.id);
            prevButton?.focus();
          }
          break;
        }

        case 'Home': {
          event.preventDefault();
          const firstOption = options[0];
          if (firstOption) {
            const firstButton = optionsRefs.current.get(firstOption.id);
            firstButton?.focus();
          }
          break;
        }

        case 'End': {
          event.preventDefault();
          const lastOption = options[totalOptions - 1];
          if (lastOption) {
            const lastButton = optionsRefs.current.get(lastOption.id);
            lastButton?.focus();
          }
          break;
        }

        case 'Enter':
        case ' ': {
          event.preventDefault();
          handleOptionClick(optionValue, optionDisabled);
          break;
        }

        default:
          break;
      }
    },
    [options, handleOptionClick]
  );

  /**
   * Set ref for option button
   */
  const setOptionRef = useCallback((id: string, element: HTMLButtonElement | null) => {
    if (element) {
      optionsRefs.current.set(id, element);
    } else {
      optionsRefs.current.delete(id);
    }
  }, []);

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <label
          className="block text-sm font-medium text-gray-300 mb-3"
          id="choice-picker-label"
        >
          {label}
        </label>
      )}

      {/* Options Group */}
      <div
        role="group"
        aria-labelledby={label ? 'choice-picker-label' : undefined}
        aria-label={!label ? (ariaLabel || 'Choice picker') : undefined}
        className="flex flex-wrap gap-2"
      >
        {/* Options */}
        {options.map((option, index) => {
          const isSelected = selectedValuesSet.has(option.value);
          const isDisabled = disabled || option.disabled;

          return (
            <button
              key={option.id}
              ref={(el) => setOptionRef(option.id, el)}
              type="button"
              role="button"
              aria-pressed={isSelected}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => handleOptionClick(option.value, option.disabled)}
              onKeyDown={(e) => handleKeyDown(e, index, option.value, option.disabled)}
              className={cn(
                // Base styles - chip/pill design
                'inline-flex items-center justify-center',
                'rounded-full px-4 py-2 text-sm font-medium',
                'transition-all duration-200 ease-in-out',
                'border-2',

                // Focus styles
                'focus-visible:outline-none',
                'focus-visible:ring-2 focus-visible:ring-[#4B6FED]',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900',

                // Disabled styles
                'disabled:opacity-50 disabled:cursor-not-allowed',

                // Default state (unselected)
                !isSelected && !isDisabled && [
                  'bg-gray-800 border-gray-700',
                  'text-gray-300',
                  'hover:bg-gray-700 hover:border-gray-600',
                  'hover:text-white',
                  'hover:shadow-md',
                ],

                // Selected state
                isSelected && !isDisabled && [
                  'bg-[#4B6FED] border-[#4B6FED]',
                  'text-white',
                  'shadow-lg shadow-[#4B6FED]/30',
                  'hover:bg-[#3A56D3] hover:border-[#3A56D3]',
                  'hover:shadow-xl hover:shadow-[#4B6FED]/40',
                ],

                // Disabled state
                isDisabled && [
                  'bg-gray-900 border-gray-800',
                  'text-gray-600',
                  'cursor-not-allowed',
                ]
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Clear All Button */}
      {showClearAll && selectedValues.length > 0 && (
        <button
          type="button"
          onClick={handleClearAll}
          disabled={disabled}
          className={cn(
            'mt-3 text-sm font-medium',
            'text-gray-400 hover:text-white',
            'transition-colors duration-200',
            'focus-visible:outline-none',
            'focus-visible:ring-2 focus-visible:ring-[#4B6FED]',
            'focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900',
            'rounded px-2 py-1',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="Clear all selections"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

/**
 * Memoized component for performance optimization
 * Only re-renders when props change
 */
export const AIKitChoicePicker = React.memo(AIKitChoicePickerComponent, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.label === nextProps.label &&
    prevProps.mode === nextProps.mode &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.showClearAll === nextProps.showClearAll &&
    prevProps.maxSelections === nextProps.maxSelections &&
    prevProps.className === nextProps.className &&
    prevProps.onChange === nextProps.onChange &&
    JSON.stringify(prevProps.value) === JSON.stringify(nextProps.value) &&
    JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options)
  );
});

// Display name for debugging
AIKitChoicePicker.displayName = 'AIKitChoicePicker';

export default AIKitChoicePicker;
