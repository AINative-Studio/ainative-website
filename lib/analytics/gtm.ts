/**
 * Google Tag Manager (GTM) verification and tracking utilities
 * GTM ID: GTM-MJKQDBGV
 */

export interface GTMVerificationResult {
  dataLayerExists: boolean;
  scriptsLoaded: number;
  gtmId: string;
  isConfigured: boolean;
  errors: string[];
}

/**
 * Verify that Google Tag Manager is properly loaded and configured
 */
export function verifyGTM(): GTMVerificationResult {
  const result: GTMVerificationResult = {
    dataLayerExists: false,
    scriptsLoaded: 0,
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || 'GTM-MJKQDBGV',
    isConfigured: false,
    errors: [],
  };

  if (typeof window === 'undefined') {
    result.errors.push('Running in server-side context');
    return result;
  }

  try {
    // Check if dataLayer exists
    result.dataLayerExists = Boolean((window as any).dataLayer);
    if (!result.dataLayerExists) {
      result.errors.push('dataLayer not found on window object');
    }

    // Check if GTM scripts are loaded
    const gtmScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]');
    result.scriptsLoaded = gtmScripts.length;
    if (result.scriptsLoaded === 0) {
      result.errors.push('No GTM scripts found in DOM');
    }

    // Check for GTM container in dataLayer
    if (result.dataLayerExists) {
      const dataLayer = (window as any).dataLayer as any[];
      const hasGTMStart = dataLayer.some(item => item['gtm.start']);
      if (!hasGTMStart) {
        result.errors.push('GTM not initialized (no gtm.start event in dataLayer)');
      }
    }

    result.isConfigured = result.dataLayerExists && result.scriptsLoaded > 0 && result.errors.length === 0;

    console.log('[GTM Verification]', result);
  } catch (error) {
    result.errors.push(`Verification error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Track a custom event in Google Tag Manager
 */
export function trackGTMEvent(eventName: string, eventData?: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  try {
    const dataLayer = (window as any).dataLayer;
    if (!dataLayer) {
      console.warn('[GTM] dataLayer not found, cannot track event:', eventName);
      return;
    }

    dataLayer.push({
      event: eventName,
      ...eventData,
    });

    console.log('[GTM] Event tracked:', eventName, eventData);
  } catch (error) {
    console.error('[GTM] Error tracking event:', error);
  }
}

/**
 * Track page view in GTM
 */
export function trackGTMPageView(url: string, title?: string): void {
  trackGTMEvent('pageview', {
    page_path: url,
    page_title: title || document.title,
    page_location: window.location.href,
  });
}

/**
 * Get current dataLayer contents (for debugging)
 */
export function getDataLayer(): any[] {
  if (typeof window === 'undefined') return [];
  return (window as any).dataLayer || [];
}
