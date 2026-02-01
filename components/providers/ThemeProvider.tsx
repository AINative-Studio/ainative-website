'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';

/**
 * Theme Provider Component
 * Wraps the application with next-themes provider for light/dark mode support
 *
 * Features:
 * - System theme detection (prefers-color-scheme)
 * - Manual theme switching
 * - Persistent theme storage in localStorage
 * - Support for forced themes per page
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
