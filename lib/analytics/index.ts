/**
 * Unified analytics verification and tracking utilities
 * Aggregates all analytics services for centralized management
 */

import { verifyGTM, trackGTMEvent, trackGTMPageView, type GTMVerificationResult } from './gtm';
import { verifyGA4, trackGA4Event, trackGA4PageView, type GA4VerificationResult } from './ga4';
import { verifyChatwoot, openChatwoot, closeChatwoot, setChatwootUser, type ChatwootVerificationResult } from './chatwoot';
import { verifySentry, captureSentryTestMessage, captureSentryException, setSentryUser, type SentryVerificationResult } from './sentry';
import { verifySpeedInsights, isVercelDeployment, type SpeedInsightsVerificationResult } from './speed-insights';

export interface AnalyticsVerificationReport {
  gtm: GTMVerificationResult;
  ga4: GA4VerificationResult;
  chatwoot: ChatwootVerificationResult;
  sentry: SentryVerificationResult;
  speedInsights: SpeedInsightsVerificationResult;
  timestamp: string;
  overallStatus: 'success' | 'partial' | 'failed';
  summary: {
    total: number;
    configured: number;
    failed: number;
  };
}

/**
 * Verify all analytics services and generate comprehensive report
 */
export function verifyAllAnalytics(): AnalyticsVerificationReport {
  const gtm = verifyGTM();
  const ga4 = verifyGA4();
  const chatwoot = verifyChatwoot();
  const sentry = verifySentry();
  const speedInsights = verifySpeedInsights();

  const services = [gtm, ga4, chatwoot, sentry, speedInsights];
  const configured = services.filter(s => s.isConfigured).length;
  const failed = services.filter(s => !s.isConfigured).length;

  let overallStatus: 'success' | 'partial' | 'failed';
  if (configured === services.length) {
    overallStatus = 'success';
  } else if (configured > 0) {
    overallStatus = 'partial';
  } else {
    overallStatus = 'failed';
  }

  const report: AnalyticsVerificationReport = {
    gtm,
    ga4,
    chatwoot,
    sentry,
    speedInsights,
    timestamp: new Date().toISOString(),
    overallStatus,
    summary: {
      total: services.length,
      configured,
      failed,
    },
  };

  console.log('[Analytics Verification] Complete Report:', report);

  return report;
}

// Re-export individual service utilities
export {
  // GTM
  verifyGTM,
  trackGTMEvent,
  trackGTMPageView,

  // GA4
  verifyGA4,
  trackGA4Event,
  trackGA4PageView,

  // Chatwoot
  verifyChatwoot,
  openChatwoot,
  closeChatwoot,
  setChatwootUser,

  // Sentry
  verifySentry,
  captureSentryTestMessage,
  captureSentryException,
  setSentryUser,

  // Speed Insights
  verifySpeedInsights,
  isVercelDeployment,
};

// Re-export types
export type {
  GTMVerificationResult,
  GA4VerificationResult,
  ChatwootVerificationResult,
  SentryVerificationResult,
  SpeedInsightsVerificationResult,
};
