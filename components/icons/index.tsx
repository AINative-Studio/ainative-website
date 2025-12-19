/**
 * AINative Icon Library
 *
 * A comprehensive collection of custom SVG icons for the AINative design system.
 * All icons support Tailwind CSS classes for sizing and colors via currentColor.
 *
 * @example
 * ```tsx
 * import { MenuIcon, CodeIcon, CheckIcon } from '@/components/icons';
 *
 * // Different sizes
 * <MenuIcon className="h-4 w-4" />
 * <MenuIcon className="h-6 w-6" />
 * <MenuIcon className="h-8 w-8" />
 *
 * // Different colors
 * <CodeIcon className="h-6 w-6 text-blue-500" />
 * <CheckIcon className="h-5 w-5 text-green-500" />
 * ```
 *
 * @features
 * - 30+ icons across 7 categories
 * - Clean, minimal SVG design
 * - currentColor support for easy theming
 * - TypeScript definitions
 * - Accessible with proper ARIA support
 */

// Base component
export { IconBase } from './IconBase';
export type { IconBaseProps } from './IconBase';

// Navigation Icons (5)
export { MenuIcon } from './navigation/MenuIcon';
export { XIcon } from './navigation/XIcon';
export { HomeIcon } from './navigation/HomeIcon';
export { ChevronDownIcon } from './navigation/ChevronDownIcon';
export { ChevronRightIcon } from './navigation/ChevronRightIcon';

// Feature Icons (5)
export { CodeIcon } from './features/CodeIcon';
export { DatabaseIcon } from './features/DatabaseIcon';
export { APIIcon } from './features/APIIcon';
export { CloudIcon } from './features/CloudIcon';
export { ServerIcon } from './features/ServerIcon';

// Status Icons (5)
export { CheckIcon } from './status/CheckIcon';
export { AlertIcon } from './status/AlertIcon';
export { InfoIcon } from './status/InfoIcon';
export { ErrorIcon } from './status/ErrorIcon';
export { WarningIcon } from './status/WarningIcon';

// Action Icons (5)
export { SendIcon } from './actions/SendIcon';
export { EditIcon } from './actions/EditIcon';
export { DeleteIcon } from './actions/DeleteIcon';
export { SaveIcon } from './actions/SaveIcon';
export { CopyIcon } from './actions/CopyIcon';

// Social Icons (3)
export { GitHubIcon } from './social/GitHubIcon';
export { TwitterIcon } from './social/TwitterIcon';
export { LinkedInIcon } from './social/LinkedInIcon';

// Content Icons (3)
export { CalendarIcon } from './content/CalendarIcon';
export { EyeIcon } from './content/EyeIcon';
export { TagIcon } from './content/TagIcon';

// Dashboard Icons (4)
export { ChartBarIcon } from './dashboard/ChartBarIcon';
export { TrendingUpIcon } from './dashboard/TrendingUpIcon';
export { ActivityIcon } from './dashboard/ActivityIcon';
export { UsersIcon } from './dashboard/UsersIcon';
