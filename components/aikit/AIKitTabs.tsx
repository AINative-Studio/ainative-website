/**
 * AIKitTabs - Dashboard Navigation Component
 *
 * Provides tabbed navigation for dashboard sections with:
 * - Next.js routing integration
 * - Dark theme support
 * - Mobile responsive design
 * - Full keyboard navigation (Arrow keys, Home, End, Enter, Space)
 * - Smooth transitions and animations
 * - WCAG 2.1 AA accessibility compliance
 *
 * @example
 * ```tsx
 * <AIKitTabs />
 * ```
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

/**
 * Tab configuration type
 */
interface TabConfig {
  id: string;
  label: string;
  path: string;
  ariaLabel: string;
}

/**
 * Component props
 */
export interface AIKitTabsProps {
  /** Array of tab IDs to disable */
  disabled?: string[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Tab configuration
 */
const TABS: TabConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    path: '/dashboard',
    ariaLabel: 'Navigate to dashboard overview',
  },
  {
    id: 'ai-kit',
    label: 'AI-Kit',
    path: '/dashboard/ai-kit',
    ariaLabel: 'Navigate to AI-Kit section',
  },
  {
    id: 'usage',
    label: 'Usage',
    path: '/dashboard/usage',
    ariaLabel: 'Navigate to usage statistics',
  },
  {
    id: 'billing',
    label: 'Billing',
    path: '/dashboard/billing',
    ariaLabel: 'Navigate to billing information',
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/dashboard/settings',
    ariaLabel: 'Navigate to dashboard settings',
  },
];

/**
 * AIKitTabs Component
 */
const AIKitTabs: React.FC<AIKitTabsProps> = ({ disabled = [], className }) => {
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Determine the active tab based on current pathname
   */
  const activeTab = useMemo(() => {
    if (!pathname) return TABS[0].id;

    // Exact match for overview
    if (pathname === '/dashboard') {
      return 'overview';
    }

    // Find matching tab by path (check for exact or sub-path matches)
    const matchedTab = TABS.find(tab => {
      // Overview is special case - exact match only
      if (tab.id === 'overview') {
        return pathname === tab.path;
      }
      // For other tabs, check if pathname starts with the tab path
      return pathname.startsWith(tab.path);
    });

    return matchedTab?.id || TABS[0].id;
  }, [pathname]);

  /**
   * Handle tab change with navigation
   */
  const handleTabChange = useCallback(
    (value: string) => {
      // Don't navigate if already on the target tab
      if (value === activeTab) {
        return;
      }

      const tab = TABS.find(t => t.id === value);
      if (tab && !disabled.includes(value) && router) {
        router.push(tab.path);
      }
    },
    [router, disabled, activeTab]
  );

  /**
   * Handle keyboard events for tab navigation
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, tabId: string) => {
      const currentIndex = TABS.findIndex(t => t.id === tabId);

      switch (event.key) {
        case 'ArrowRight': {
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % TABS.length;
          const nextTab = TABS[nextIndex];
          if (nextTab) {
            const nextElement = document.querySelector(
              `[data-tab-id="${nextTab.id}"]`
            ) as HTMLElement;
            nextElement?.focus();
          }
          break;
        }

        case 'ArrowLeft': {
          event.preventDefault();
          const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length;
          const prevTab = TABS[prevIndex];
          if (prevTab) {
            const prevElement = document.querySelector(
              `[data-tab-id="${prevTab.id}"]`
            ) as HTMLElement;
            prevElement?.focus();
          }
          break;
        }

        case 'Home': {
          event.preventDefault();
          const firstTab = TABS[0];
          if (firstTab) {
            const firstElement = document.querySelector(
              `[data-tab-id="${firstTab.id}"]`
            ) as HTMLElement;
            firstElement?.focus();
          }
          break;
        }

        case 'End': {
          event.preventDefault();
          const lastTab = TABS[TABS.length - 1];
          if (lastTab) {
            const lastElement = document.querySelector(
              `[data-tab-id="${lastTab.id}"]`
            ) as HTMLElement;
            lastElement?.focus();
          }
          break;
        }

        case 'Enter':
        case ' ': {
          event.preventDefault();
          handleTabChange(tabId);
          break;
        }

        default:
          break;
      }
    },
    [handleTabChange]
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className={cn('w-full', className)}
    >
      <TabsList
        className={cn(
          'inline-flex h-10 items-center justify-center',
          'rounded-lg bg-[#161B22] p-1',
          'border border-gray-800',
          'w-full md:w-auto',
          'overflow-x-auto scrollbar-hide'
        )}
        aria-label="Dashboard navigation tabs"
      >
        {TABS.map(tab => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={disabled.includes(tab.id)}
            aria-label={tab.ariaLabel}
            data-tab-id={tab.id}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
            className={cn(
              // Base styles
              'inline-flex items-center justify-center whitespace-nowrap',
              'rounded-md px-4 py-2 text-sm font-medium',
              'transition-all duration-200 ease-in-out',

              // Focus styles
              'ring-offset-background focus-visible:outline-none',
              'focus-visible:ring-2 focus-visible:ring-[#4B6FED]',
              'focus-visible:ring-offset-2',

              // Disabled styles
              'disabled:pointer-events-none disabled:opacity-50',

              // Default state (dark theme)
              'text-gray-400 hover:text-gray-200',
              'hover:bg-gray-800/50',

              // Active state (dark theme)
              'data-[state=active]:bg-[#4B6FED]',
              'data-[state=active]:text-white',
              'data-[state=active]:shadow-md',
              'data-[state=active]:shadow-[#4B6FED]/20',

              // Mobile responsive
              'min-w-[80px] md:min-w-[100px]'
            )}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

// Display name for debugging
AIKitTabs.displayName = 'AIKitTabs';

export default AIKitTabs;
