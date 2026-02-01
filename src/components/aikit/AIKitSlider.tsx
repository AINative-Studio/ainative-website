import { useState, useEffect } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

interface AIKitSliderProps {
  id?: string;
  label?: string;
  value: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  className?: string;
  formatValue?: (value: number) => string;
}

/**
 * AIKitSlider - Enhanced slider component with value display
 *
 * This component wraps Radix UI Slider with additional features:
 * - Built-in value display with customizable formatting
 * - Simplified API (single value instead of array)
 * - Ready for AI Kit ComponentMapper integration
 * - Full WCAG 2.1 AA accessibility compliance
 * - Keyboard navigation support (Arrow keys, Home, End)
 * - Touch support for mobile devices
 *
 * @example
 * ```tsx
 * // Basic usage
 * <AIKitSlider
 *   label="Volume"
 *   value={50}
 *   onChange={setValue}
 *   showValue={true}
 * />
 *
 * // Developer markup slider (for issue #175)
 * <AIKitSlider
 *   label="Developer Markup"
 *   value={0}
 *   onChange={setMarkup}
 *   min={0}
 *   max={40}
 *   step={0.5}
 *   showValue={true}
 *   formatValue={(v) => `${v}%`}
 * />
 * ```
 */
export function AIKitSlider({
  id = `slider-${Math.random().toString(36).substr(2, 9)}`,
  label,
  value: initialValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = true,
  className,
  formatValue,
}: AIKitSliderProps) {
  const [localValue, setLocalValue] = useState(initialValue);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);

  const handleValueChange = (newValues: number[]) => {
    const newValue = newValues[0];
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const displayValue = formatValue ? formatValue(localValue) : localValue.toString();

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm text-muted-foreground font-mono">
              {displayValue}
            </span>
          )}
        </div>
      )}
      <SliderPrimitive.Root
        id={id}
        value={[localValue]}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={cn(
          'relative flex w-full touch-none select-none items-center',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label={label}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        />
      </SliderPrimitive.Root>
    </div>
  );
}

export default AIKitSlider;
