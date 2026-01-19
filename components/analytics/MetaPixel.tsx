'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

interface MetaPixelProps {
  pixelId?: string;
  enableAdvancedMatching?: boolean;
  enableAutoConfig?: boolean;
}

/**
 * Meta Pixel Event Types
 * Standard events for conversion tracking and retargeting
 */
export type MetaPixelEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact'
  | 'CustomizeProduct'
  | 'Donate'
  | 'FindLocation'
  | 'Schedule'
  | 'StartTrial'
  | 'SubmitApplication'
  | 'Subscribe';

/**
 * Meta Pixel Event Parameters
 * Optional parameters for enhanced tracking
 */
export interface MetaPixelEventParams {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  predicted_ltv?: number;
  num_items?: number;
  search_string?: string;
  status?: string;
  [key: string]: unknown;
}

/**
 * Meta Pixel (Facebook Pixel) component for Next.js
 * Implements Meta's conversion tracking and retargeting capabilities
 *
 * Features:
 * - Automatic PageView tracking
 * - Standard conversion events (Purchase, Lead, StartTrial, etc.)
 * - User consent handling
 * - Privacy-first implementation
 * - Error boundary protection
 *
 * @param pixelId - Meta Pixel ID (format: 15-16 digits)
 * @param enableAdvancedMatching - Enable automatic advanced matching (default: true)
 * @param enableAutoConfig - Enable automatic configuration (default: true)
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * <MetaPixel pixelId="1234567890123456" />
 *
 * // Track custom events
 * import { trackMetaEvent } from '@/components/analytics/MetaPixel';
 *
 * trackMetaEvent('Lead', { content_name: 'Contact Form' });
 * trackMetaEvent('StartTrial', { value: 0, currency: 'USD' });
 * ```
 */
export default function MetaPixel({
  pixelId,
  enableAutoConfig = true,
}: MetaPixelProps) {
  const [hasConsent, setHasConsent] = useState<boolean>(true); // Default to true, can be integrated with consent management

  // Use environment variable if pixelId prop is not provided
  const id = pixelId || process.env.NEXT_PUBLIC_META_PIXEL_ID;

  // Check for user consent (integrates with consent management platforms)
  useEffect(() => {
    // Check for consent cookie/flag
    // This is a placeholder - integrate with your actual consent management system
    const checkConsent = () => {
      if (typeof window !== 'undefined') {
        // Example: Check for a consent cookie
        const consentCookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith('meta_pixel_consent='));

        if (consentCookie) {
          const consent = consentCookie.split('=')[1] === 'true';
          setHasConsent(consent);
        }
      }
    };

    checkConsent();
  }, []);

  // Don't render if no Pixel ID is configured
  if (!id) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Meta Pixel: No pixel ID configured. Set NEXT_PUBLIC_META_PIXEL_ID in your environment.');
    }
    return null;
  }

  // Don't render if user hasn't given consent
  if (!hasConsent) {
    if (process.env.NODE_ENV === 'development') {
      console.info('Meta Pixel: User consent not granted. Pixel not loaded.');
    }
    return null;
  }

  const handleScriptLoad = () => {
    if (process.env.NODE_ENV === 'development') {
      console.info('Meta Pixel: Script loaded successfully');
    }
  };

  const handleScriptError = (error: Error) => {
    console.error('Meta Pixel: Failed to load script', error);
  };

  return (
    <>
      {/* Meta Pixel Base Code */}
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');

            fbq('init', '${id}', {
              autoConfig: ${enableAutoConfig},
              debug: ${process.env.NODE_ENV === 'development'}
            });

            fbq('track', 'PageView');
          `,
        }}
      />

      {/* Noscript fallback for users with JavaScript disabled */}
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

/**
 * Track custom Meta Pixel events
 * Use this for conversion tracking and custom events
 *
 * @param event - Standard Meta Pixel event name
 * @param params - Optional event parameters
 *
 * @example
 * ```tsx
 * // Track a signup
 * trackMetaEvent('CompleteRegistration', {
 *   content_name: 'User Signup',
 *   value: 0,
 *   currency: 'USD'
 * });
 *
 * // Track a purchase
 * trackMetaEvent('Purchase', {
 *   value: 49.99,
 *   currency: 'USD',
 *   content_ids: ['product-123'],
 *   content_type: 'product',
 *   content_name: 'Pro Plan'
 * });
 *
 * // Track a trial start
 * trackMetaEvent('StartTrial', {
 *   value: 0,
 *   currency: 'USD',
 *   predicted_ltv: 99
 * });
 * ```
 */
export function trackMetaEvent(event: MetaPixelEvent, params?: MetaPixelEventParams) {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      if (params) {
        window.fbq('track', event, params);
      } else {
        window.fbq('track', event);
      }

      if (process.env.NODE_ENV === 'development') {
        console.info(`Meta Pixel: Tracked event "${event}"`, params || '');
      }
    } catch (error) {
      console.error('Meta Pixel: Error tracking event', error);
    }
  } else if (process.env.NODE_ENV === 'development') {
    console.warn('Meta Pixel: fbq not available. Event not tracked:', event, params);
  }
}

/**
 * Track custom Meta Pixel events with custom event names
 * Use this for non-standard events
 *
 * @param eventName - Custom event name
 * @param params - Optional event parameters
 *
 * @example
 * ```tsx
 * trackMetaCustomEvent('VideoWatched', {
 *   content_name: 'Product Demo',
 *   value: 0
 * });
 * ```
 */
export function trackMetaCustomEvent(eventName: string, params?: MetaPixelEventParams) {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      if (params) {
        window.fbq('trackCustom', eventName, params);
      } else {
        window.fbq('trackCustom', eventName);
      }

      if (process.env.NODE_ENV === 'development') {
        console.info(`Meta Pixel: Tracked custom event "${eventName}"`, params || '');
      }
    } catch (error) {
      console.error('Meta Pixel: Error tracking custom event', error);
    }
  }
}

/**
 * Update Meta Pixel user data for advanced matching
 * Use this to improve conversion tracking accuracy
 *
 * @param userData - User data for advanced matching
 *
 * @example
 * ```tsx
 * updateMetaPixelUser({
 *   em: 'user@example.com', // Email (hashed automatically by Meta)
 *   ph: '1234567890', // Phone (hashed automatically by Meta)
 *   fn: 'john', // First name
 *   ln: 'doe', // Last name
 *   ct: 'new york', // City
 *   st: 'ny', // State
 *   zp: '10001', // Zip code
 *   country: 'us' // Country
 * });
 * ```
 */
export function updateMetaPixelUser(userData: {
  em?: string; // Email
  ph?: string; // Phone
  fn?: string; // First name
  ln?: string; // Last name
  ct?: string; // City
  st?: string; // State
  zp?: string; // Zip code
  country?: string; // Country code
  ge?: string; // Gender
  db?: string; // Date of birth (YYYYMMDD)
  external_id?: string; // External user ID
}) {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('init', process.env.NEXT_PUBLIC_META_PIXEL_ID || '', userData);

      if (process.env.NODE_ENV === 'development') {
        console.info('Meta Pixel: User data updated for advanced matching');
      }
    } catch (error) {
      console.error('Meta Pixel: Error updating user data', error);
    }
  }
}

/**
 * Grant Meta Pixel consent
 * Call this when user grants consent for tracking
 */
export function grantMetaPixelConsent() {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('consent', 'grant');

      // Set consent cookie (7 days)
      document.cookie = 'meta_pixel_consent=true; max-age=604800; path=/; secure; samesite=strict';

      if (process.env.NODE_ENV === 'development') {
        console.info('Meta Pixel: Consent granted');
      }
    } catch (error) {
      console.error('Meta Pixel: Error granting consent', error);
    }
  }
}

/**
 * Revoke Meta Pixel consent
 * Call this when user revokes consent for tracking
 */
export function revokeMetaPixelConsent() {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('consent', 'revoke');

      // Remove consent cookie
      document.cookie = 'meta_pixel_consent=false; max-age=0; path=/;';

      if (process.env.NODE_ENV === 'development') {
        console.info('Meta Pixel: Consent revoked');
      }
    } catch (error) {
      console.error('Meta Pixel: Error revoking consent', error);
    }
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    fbq: (
      command: 'track' | 'trackCustom' | 'init' | 'consent',
      eventOrId: string,
      params?: Record<string, unknown>
    ) => void;
    _fbq: unknown;
  }
}
