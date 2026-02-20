/**
 * useLazyLoad Hook
 *
 * Provides intersection observer-based lazy loading functionality
 * for optimized image and component loading.
 *
 * Features:
 * - Automatic intersection observer setup
 * - Configurable root margin and threshold
 * - Optional one-time observation
 * - Graceful degradation when IntersectionObserver is not available
 *
 * Performance benefits:
 * - Reduces initial page load time
 * - Minimizes unnecessary resource loading
 * - Improves Largest Contentful Paint (LCP)
 * - Reduces network bandwidth usage
 *
 * Refs #241
 */

import { useEffect, useRef, useState } from 'react';

export interface UseLazyLoadOptions {
  /**
   * The root element for intersection observation
   * Default: null (viewport)
   */
  root?: Element | null;

  /**
   * Margin around the root. Can be similar to CSS margin values
   * Default: '50px' (load slightly before element enters viewport)
   */
  rootMargin?: string;

  /**
   * Threshold at which to trigger the callback
   * Default: 0.01 (trigger as soon as 1% is visible)
   */
  threshold?: number | number[];

  /**
   * Whether to unobserve after first intersection
   * Default: true
   */
  once?: boolean;
}

export interface UseLazyLoadReturn {
  /**
   * Ref to attach to the element to be observed
   */
  ref: React.RefObject<HTMLElement>;

  /**
   * Whether the element is currently visible
   */
  isVisible: boolean;
}

/**
 * Hook for lazy loading elements using Intersection Observer API
 *
 * @param options - Configuration options for the intersection observer
 * @returns Object containing ref and visibility state
 *
 * @example
 * ```tsx
 * function LazyImage({ src, alt }) {
 *   const { ref, isVisible } = useLazyLoad();
 *
 *   return (
 *     <div ref={ref}>
 *       {isVisible && <img src={src} alt={alt} />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With custom options
 * const { ref, isVisible } = useLazyLoad({
 *   rootMargin: '100px',
 *   threshold: 0.5,
 *   once: false
 * });
 * ```
 */
export function useLazyLoad(options: UseLazyLoadOptions = {}): UseLazyLoadReturn {
  const {
    root = null,
    rootMargin = '50px',
    threshold = 0.01,
    once = true,
  } = options;

  const [element, setElement] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Callback ref to get element when it's mounted
  const ref = useRef<HTMLElement>(null);

  // Use a callback ref pattern to detect when element is attached
  const callbackRef = (node: HTMLElement | null) => {
    if (node !== null) {
      setElement(node);
      (ref as any).current = node;
    }
  };

  useEffect(() => {
    // Fallback for browsers that don't support IntersectionObserver
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);

            // Unobserve after first intersection if once is true
            if (once) {
              observer.unobserve(element);
            }
          }
        });
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [element, root, rootMargin, threshold, once]);

  // Expose both callback ref and regular ref for compatibility
  return {
    ref: callbackRef as any,
    isVisible,
  };
}

/**
 * Type-safe version of useLazyLoad for specific element types
 *
 * @example
 * ```tsx
 * const { ref, isVisible } = useLazyLoad<HTMLImageElement>();
 * <img ref={ref} ... />
 * ```
 */
export function useLazyLoadTyped<T extends HTMLElement = HTMLElement>(
  options: UseLazyLoadOptions = {}
): {
  ref: React.RefObject<T>;
  isVisible: boolean;
} {
  const { ref, isVisible } = useLazyLoad(options);
  return {
    ref: ref as React.RefObject<T>,
    isVisible,
  };
}
