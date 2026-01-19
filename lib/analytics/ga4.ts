/**
 * Google Analytics 4 (GA4) verification and tracking utilities
 * GA4 is loaded via GTM but can also be loaded directly
 */

export interface GA4VerificationResult {
  gtagExists: boolean;
  gaScriptsLoaded: number;
  gaId: string;
  isConfigured: boolean;
  errors: string[];
}

/**
 * Verify that Google Analytics 4 is properly loaded and configured
 */
export function verifyGA4(): GA4VerificationResult {
  const result: GA4VerificationResult = {
    gtagExists: false,
    gaScriptsLoaded: 0,
    gaId: process.env.NEXT_PUBLIC_GA_ID || 'G-ML0XEBPZV2',
    isConfigured: false,
    errors: [],
  };

  if (typeof window === 'undefined') {
    result.errors.push('Running in server-side context');
    return result;
  }

  try {
    // Check if gtag function exists
    result.gtagExists = typeof (window as any).gtag === 'function';
    if (!result.gtagExists) {
      result.errors.push('gtag function not found on window object');
    }

    // Check if GA4 scripts are loaded
    const gaScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
    result.gaScriptsLoaded = gaScripts.length;
    if (result.gaScriptsLoaded === 0) {
      result.errors.push('No GA4 scripts found in DOM');
    }

    // Check dataLayer exists (gtag uses dataLayer)
    const hasDataLayer = Boolean((window as any).dataLayer);
    if (!hasDataLayer) {
      result.errors.push('dataLayer not found (required by gtag)');
    }

    result.isConfigured = result.gtagExists && result.errors.length === 0;

    console.log('[GA4 Verification]', result);
  } catch (error) {
    result.errors.push(`Verification error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Track a custom event in GA4
 */
export function trackGA4Event(
  eventName: string,
  eventParams?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;

  try {
    const gtag = (window as any).gtag;
    if (!gtag) {
      console.warn('[GA4] gtag not found, cannot track event:', eventName);
      return;
    }

    gtag('event', eventName, eventParams);
    console.log('[GA4] Event tracked:', eventName, eventParams);
  } catch (error) {
    console.error('[GA4] Error tracking event:', error);
  }
}

/**
 * Track page view in GA4
 */
export function trackGA4PageView(url: string, title?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const gtag = (window as any).gtag;
    const gaId = process.env.NEXT_PUBLIC_GA_ID || 'G-ML0XEBPZV2';

    if (!gtag) {
      console.warn('[GA4] gtag not found, cannot track pageview');
      return;
    }

    gtag('config', gaId, {
      page_path: url,
      page_title: title || document.title,
      page_location: window.location.href,
    });

    console.log('[GA4] Pageview tracked:', url);
  } catch (error) {
    console.error('[GA4] Error tracking pageview:', error);
  }
}

/**
 * Get GA4 configuration (for debugging)
 */
export function getGA4Config(): Record<string, any> {
  if (typeof window === 'undefined') return {};

  return {
    gaId: process.env.NEXT_PUBLIC_GA_ID || 'G-ML0XEBPZV2',
    gtagExists: typeof (window as any).gtag === 'function',
    dataLayerLength: ((window as any).dataLayer || []).length,
  };
}
