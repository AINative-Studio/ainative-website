'use client';

import Script from 'next/script';

interface GoogleTagManagerProps {
  containerId?: string;
}

/**
 * Google Tag Manager component
 * Loads GTM scripts for analytics tracking
 *
 * Usage: Add to app/layout.tsx:
 * <GoogleTagManager containerId="GTM-XXXXXXX" />
 */
export default function GoogleTagManager({ containerId }: GoogleTagManagerProps) {
  const gtmId = containerId || process.env.NEXT_PUBLIC_GTM_ID;

  if (!gtmId) {
    return null;
  }

  return (
    <>
      {/* Google Tag Manager - Script */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
    </>
  );
}

/**
 * Google Tag Manager NoScript fallback
 * Add this to body of app/layout.tsx for users with JS disabled
 */
export function GoogleTagManagerNoScript({ containerId }: GoogleTagManagerProps) {
  const gtmId = containerId || process.env.NEXT_PUBLIC_GTM_ID;

  if (!gtmId) {
    return null;
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}

/**
 * Push event to GTM dataLayer
 */
export function pushToDataLayer(event: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(event);
  }
}

/**
 * Track page view in GTM
 */
export function trackPageView(url: string, title?: string) {
  pushToDataLayer({
    event: 'pageview',
    page: url,
    title: title || document.title,
  });
}

/**
 * Track custom event in GTM
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
) {
  pushToDataLayer({
    event: eventName,
    ...eventParams,
  });
}

// Type declaration for window.dataLayer
declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}
