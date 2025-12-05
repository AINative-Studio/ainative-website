"use client";

import { ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";

/**
 * Providers component combines all global providers for the application.
 *
 * Provider order (outermost to innermost):
 * 1. ThemeProvider - Dark mode support
 * 2. QueryProvider - React Query for data fetching
 *
 * Note: StripeProvider is NOT included here.
 * It should only wrap checkout-related components to avoid
 * loading Stripe.js on every page.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
