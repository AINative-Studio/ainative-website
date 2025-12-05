"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * ThemeProvider wraps the application with next-themes for dark mode support.
 *
 * Features:
 * - System preference detection
 * - Persistent theme selection (localStorage)
 * - No flash of unstyled content (FOUC prevention)
 * - SSR-safe implementation
 *
 * Usage:
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * To toggle theme:
 * ```tsx
 * import { useTheme } from "next-themes";
 * const { theme, setTheme } = useTheme();
 * ```
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

// Re-export useTheme for convenience
export { useTheme } from "next-themes";
