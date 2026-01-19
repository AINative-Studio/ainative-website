/**
 * Vercel Speed Insights verification utilities
 * Note: Requires @vercel/speed-insights package to be installed
 */

export interface SpeedInsightsVerificationResult {
  webVitalsExists: boolean;
  packageInstalled: boolean;
  isConfigured: boolean;
  errors: string[];
}

/**
 * Verify that Vercel Speed Insights is properly configured
 */
export function verifySpeedInsights(): SpeedInsightsVerificationResult {
  const result: SpeedInsightsVerificationResult = {
    webVitalsExists: false,
    packageInstalled: false,
    isConfigured: false,
    errors: [],
  };

  if (typeof window === 'undefined') {
    result.errors.push('Running in server-side context');
    return result;
  }

  try {
    // Check if Web Vitals tracking is active
    const webVitals = (window as any).webVitals;
    result.webVitalsExists = Boolean(webVitals);

    if (!result.webVitalsExists) {
      result.errors.push('Web Vitals tracking not detected (package may not be installed)');
    }

    // Check for Vercel Analytics scripts
    const vercelScripts = document.querySelectorAll('script[src*="vitals"]');
    result.packageInstalled = vercelScripts.length > 0;

    if (!result.packageInstalled && !result.webVitalsExists) {
      result.errors.push('@vercel/speed-insights package not installed or not loaded');
    }

    result.isConfigured = result.webVitalsExists || result.packageInstalled;

    console.log('[Speed Insights Verification]', result);
  } catch (error) {
    result.errors.push(`Verification error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Check if running on Vercel deployment
 */
export function isVercelDeployment(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for Vercel environment indicators
  const hostname = window.location.hostname;
  return hostname.includes('vercel.app') || hostname.includes('ainative.studio');
}

/**
 * Get current Web Vitals metrics (if available)
 */
export function getWebVitalsMetrics(): Record<string, any> {
  if (typeof window === 'undefined') return {};

  const webVitals = (window as any).webVitals;
  if (!webVitals) {
    return { error: 'Web Vitals not available' };
  }

  return {
    available: true,
    deployment: isVercelDeployment(),
  };
}
