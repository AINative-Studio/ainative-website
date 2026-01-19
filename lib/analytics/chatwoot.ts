/**
 * Chatwoot live chat widget verification and utilities
 * Website Token: XfqwZwqj9pcjyrFe4gsPRCff
 */

export interface ChatwootVerificationResult {
  chatwootExists: boolean;
  widgetRendered: boolean;
  websiteToken: string;
  baseUrl: string;
  isConfigured: boolean;
  errors: string[];
}

/**
 * Verify that Chatwoot widget is properly loaded and configured
 */
export function verifyChatwoot(): ChatwootVerificationResult {
  const result: ChatwootVerificationResult = {
    chatwootExists: false,
    widgetRendered: false,
    websiteToken: process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN || 'XfqwZwqj9pcjyrFe4gsPRCff',
    baseUrl: process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || 'https://chat.ainative.studio',
    isConfigured: false,
    errors: [],
  };

  if (typeof window === 'undefined') {
    result.errors.push('Running in server-side context');
    return result;
  }

  try {
    // Check if chatwootSDK exists
    const chatwootSDK = (window as any).chatwootSDK;
    result.chatwootExists = Boolean(chatwootSDK);
    if (!result.chatwootExists) {
      result.errors.push('chatwootSDK not found on window object');
    }

    // Check if $chatwoot exists (the widget instance)
    const $chatwoot = (window as any).$chatwoot;
    if (!$chatwoot) {
      result.errors.push('$chatwoot not found on window object');
    }

    // Check if widget is rendered in DOM
    const widget = document.querySelector('.woot-widget-holder') ||
                   document.querySelector('.woot-widget-bubble') ||
                   document.querySelector('[class*="chatwoot"]');
    result.widgetRendered = Boolean(widget);
    if (!result.widgetRendered) {
      result.errors.push('Chatwoot widget not found in DOM');
    }

    // Check for Chatwoot scripts
    const chatwootScripts = document.querySelectorAll('script[src*="chatwoot"]');
    if (chatwootScripts.length === 0) {
      result.errors.push('No Chatwoot scripts found in DOM');
    }

    result.isConfigured = result.chatwootExists && result.widgetRendered && result.errors.length === 0;

    console.log('[Chatwoot Verification]', result);
  } catch (error) {
    result.errors.push(`Verification error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Open the Chatwoot widget programmatically
 */
export function openChatwoot(): void {
  if (typeof window === 'undefined') return;

  try {
    const $chatwoot = (window as any).$chatwoot;
    if ($chatwoot && typeof $chatwoot.toggle === 'function') {
      $chatwoot.toggle('open');
      console.log('[Chatwoot] Widget opened');
    } else {
      console.warn('[Chatwoot] Widget not available');
    }
  } catch (error) {
    console.error('[Chatwoot] Error opening widget:', error);
  }
}

/**
 * Close the Chatwoot widget programmatically
 */
export function closeChatwoot(): void {
  if (typeof window === 'undefined') return;

  try {
    const $chatwoot = (window as any).$chatwoot;
    if ($chatwoot && typeof $chatwoot.toggle === 'function') {
      $chatwoot.toggle('close');
      console.log('[Chatwoot] Widget closed');
    } else {
      console.warn('[Chatwoot] Widget not available');
    }
  } catch (error) {
    console.error('[Chatwoot] Error closing widget:', error);
  }
}

/**
 * Set user information in Chatwoot
 */
export function setChatwootUser(user: {
  identifier?: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  [key: string]: any;
}): void {
  if (typeof window === 'undefined') return;

  try {
    const $chatwoot = (window as any).$chatwoot;
    if ($chatwoot && typeof $chatwoot.setUser === 'function') {
      $chatwoot.setUser(user.identifier || user.email, user);
      console.log('[Chatwoot] User set:', user);
    } else {
      console.warn('[Chatwoot] Widget not available');
    }
  } catch (error) {
    console.error('[Chatwoot] Error setting user:', error);
  }
}
