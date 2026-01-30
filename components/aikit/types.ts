/**
 * Type definitions for AIKit components
 */

/**
 * Tab configuration for dashboard navigation
 */
export interface TabConfig {
  /** Unique identifier for the tab */
  id: string;
  /** Display label */
  label: string;
  /** Navigation path */
  path: string;
  /** ARIA label for accessibility */
  ariaLabel: string;
}

/**
 * Props for AIKitTabs component
 */
export interface AIKitTabsProps {
  /** Array of tab IDs to disable */
  disabled?: string[];
  /** Additional CSS classes */
  className?: string;
}
