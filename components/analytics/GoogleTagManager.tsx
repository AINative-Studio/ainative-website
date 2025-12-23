'use client';

import Script from 'next/script';

interface GoogleTagManagerProps {
  gtmId?: string;
}

/**
 * Google Tag Manager component for Next.js
 * Loads GTM script with noscript fallback for users with JavaScript disabled
 *
 * @param gtmId - Google Tag Manager ID (format: GTM-XXXXXXX)
 */
export default function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  // Use environment variable if gtmId prop is not provided
  const id = gtmId || process.env.NEXT_PUBLIC_GTM_ID;

  // Don't render if no GTM ID is configured
  if (!id) {
    return null;
  }

  return (
    <>
      {/* Google Tag Manager Script */}
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${id}');
          `,
        }}
      />
    </>
  );
}

/**
 * Noscript fallback component for GTM
 * Should be placed in body tag of root layout
 */
export function GoogleTagManagerNoscript({ gtmId }: GoogleTagManagerProps) {
  const id = gtmId || process.env.NEXT_PUBLIC_GTM_ID;

  if (!id) {
    return null;
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${id}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}
