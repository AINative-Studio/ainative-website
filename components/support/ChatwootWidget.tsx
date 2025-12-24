'use client';

import { useEffect } from 'react';
import Script from 'next/script';

interface ChatwootWidgetProps {
  websiteToken?: string;
  baseUrl?: string;
  locale?: string;
  position?: 'left' | 'right';
  type?: 'standard' | 'expanded_bubble';
  launcherTitle?: string;
}

/**
 * Chatwoot Widget component
 * Provides customer support chat functionality
 *
 * Usage: Add to app/layout.tsx:
 * <ChatwootWidget websiteToken="your-website-token" />
 */
export default function ChatwootWidget({
  websiteToken,
  baseUrl,
  locale = 'en',
  position = 'right',
  type = 'standard',
  launcherTitle = 'Chat with us',
}: ChatwootWidgetProps) {
  const token = websiteToken || process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN;
  const url = baseUrl || process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || 'https://app.chatwoot.com';

  useEffect(() => {
    // Set Chatwoot settings before script loads
    if (typeof window !== 'undefined') {
      window.chatwootSettings = {
        hideMessageBubble: false,
        position,
        locale,
        type,
        launcherTitle,
      };
    }
  }, [position, locale, type, launcherTitle]);

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
            g.defer = true;
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

/**
 * Programmatically open Chatwoot widget
 */
export function openChatwoot() {
  if (typeof window !== 'undefined' && window.$chatwoot) {
    window.$chatwoot.toggle('open');
  }
}

/**
 * Programmatically close Chatwoot widget
 */
export function closeChatwoot() {
  if (typeof window !== 'undefined' && window.$chatwoot) {
    window.$chatwoot.toggle('close');
  }
}

/**
 * Toggle Chatwoot widget visibility
 */
export function toggleChatwoot() {
  if (typeof window !== 'undefined' && window.$chatwoot) {
    window.$chatwoot.toggle();
  }
}

/**
 * Set user information in Chatwoot
 */
export function setChatwootUser(user: {
  email?: string;
  name?: string;
  avatar_url?: string;
  phone_number?: string;
  identifier?: string;
  identifier_hash?: string;
}) {
  if (typeof window !== 'undefined' && window.$chatwoot) {
    window.$chatwoot.setUser(user.identifier || user.email || '', {
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      phone_number: user.phone_number,
      identifier_hash: user.identifier_hash,
    });
  }
}

/**
 * Reset Chatwoot user session
 */
export function resetChatwoot() {
  if (typeof window !== 'undefined' && window.$chatwoot) {
    window.$chatwoot.reset();
  }
}

/**
 * Set custom attributes for the conversation
 */
export function setChatwootCustomAttributes(attributes: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined' && window.$chatwoot) {
    window.$chatwoot.setCustomAttributes(attributes);
  }
}

/**
 * Set locale for Chatwoot widget
 */
export function setChatwootLocale(locale: string) {
  if (typeof window !== 'undefined' && window.$chatwoot) {
    window.$chatwoot.setLocale(locale);
  }
}

// Type declarations for Chatwoot
declare global {
  interface Window {
    chatwootSettings?: {
      hideMessageBubble?: boolean;
      position?: 'left' | 'right';
      locale?: string;
      type?: 'standard' | 'expanded_bubble';
      launcherTitle?: string;
    };
    chatwootSDK?: {
      run: (config: { websiteToken: string; baseUrl: string }) => void;
    };
    $chatwoot?: {
      toggle: (state?: 'open' | 'close') => void;
      setUser: (identifier: string, user: Record<string, unknown>) => void;
      reset: () => void;
      setCustomAttributes: (attributes: Record<string, string | number | boolean>) => void;
      setLocale: (locale: string) => void;
    };
  }
}
