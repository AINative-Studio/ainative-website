'use client';

/**
 * Vercel Speed Insights component wrapper
 *
 * Speed Insights provides real user monitoring (RUM) metrics for your Next.js app
 * including Web Vitals (LCP, FID, CLS, etc.) when deployed on Vercel.
 */

import { SpeedInsights as VercelSpeedInsights } from '@vercel/speed-insights/next';

export default function SpeedInsights() {
  return <VercelSpeedInsights />;
}
