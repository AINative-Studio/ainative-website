'use client';

import Script from 'next/script';

interface ChatwootWidgetProps {
  websiteToken?: string;
  baseUrl?: string;
}

/**
 * Chatwoot live chat widget component for Next.js
 * Loads the Chatwoot SDK and initializes the chat widget
 *
 * @param websiteToken - Chatwoot website token
 * @param baseUrl - Chatwoot instance base URL (default: https://chat.ainative.studio)
 */
export default function ChatwootWidget({ websiteToken, baseUrl }: ChatwootWidgetProps) {
  // Use environment variables if props are not provided
  const token = websiteToken || process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN || 'XfqwZwqj9pcjyrFe4gsPRCff';
  const url = baseUrl || process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || 'https://chat.ainative.studio';

  // Don't render if no token is configured
  if (!token) {
    return null;
  }

  return (
    <Script
      id="chatwoot-widget"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
          (function(d,t) {
            var BASE_URL="${url}";
            var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
            g.src=BASE_URL+"/packs/js/sdk.js";
            g.async = true;
            s.parentNode.insertBefore(g,s);
            g.onload=function(){
              window.chatwootSDK.run({
                websiteToken: '${token}',
                baseUrl: BASE_URL
              })
            }
          })(document,"script");
        `,
      }}
    />
  );
}
