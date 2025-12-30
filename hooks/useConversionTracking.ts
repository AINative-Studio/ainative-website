/**
 * Custom hook for conversion tracking
 *
 * Provides easy-to-use functions for tracking conversions throughout the app
 */

'use client';

import { useEffect, useCallback } from 'react';
import { conversionTracking } from '@/services/ConversionTrackingService';

export function useConversionTracking() {
  /**
   * Track page view on component mount
   */
  const trackPageView = useCallback(() => {
    conversionTracking.trackPageView();
  }, []);

  /**
   * Track form submission
   */
  const trackFormSubmit = useCallback((formName: string, formData?: Record<string, unknown>) => {
    return conversionTracking.trackFormSubmit(formName, formData);
  }, []);

  /**
   * Track signup completion
   */
  const trackSignup = useCallback((userId: string) => {
    return conversionTracking.trackSignup(userId);
  }, []);

  /**
   * Track checkout start
   */
  const trackCheckoutStart = useCallback((value: number, stripeSessionId: string) => {
    return conversionTracking.trackCheckoutStart(value, stripeSessionId);
  }, []);

  /**
   * Track successful purchase
   */
  const trackPurchase = useCallback((value: number, stripeSessionId: string, userId?: string) => {
    return conversionTracking.trackPurchase(value, stripeSessionId, userId);
  }, []);

  /**
   * Update funnel stage
   */
  const updateFunnel = useCallback((stage: Parameters<typeof conversionTracking.updateFunnel>[0]['stage']) => {
    return conversionTracking.updateFunnel({ stage });
  }, []);

  return {
    trackPageView,
    trackFormSubmit,
    trackSignup,
    trackCheckoutStart,
    trackPurchase,
    updateFunnel,
  };
}

/**
 * Hook that automatically tracks page views
 * Use this in page components
 */
export function usePageViewTracking() {
  const { trackPageView } = useConversionTracking();

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);
}
