/**
 * Conversion Tracking Service
 *
 * Handles server-side conversion event tracking, UTM parameter capture,
 * and retargeting pixel management for AI Native Studio
 */

import apiClient from '@/lib/api-client';

// Types
export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface DeviceInfo {
  device_type?: string;
  browser?: string;
  os?: string;
}

export interface TrackEventParams {
  event_type: string;
  event_name: string;
  user_id?: string;
  page_url?: string;
  page_title?: string;
  form_data?: Record<string, unknown>;
  conversion_value?: number;
  currency?: string;
  ga_client_id?: string;
  stripe_session_id?: string;
  fb_pixel_id?: string;
  google_ads_click_id?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateFunnelParams {
  stage: 'visited_homepage' | 'visited_pricing' | 'visited_docs' |
         'started_signup' | 'completed_signup' | 'started_checkout' |
         'completed_checkout' | 'subscription_created';
  user_id?: string;
  conversion_value?: number;
}

class ConversionTrackingService {
  private sessionId: string = '';
  private utmParams: UTMParams | null = null;
  private deviceInfo: DeviceInfo = {};
  private pixelsInitialized = false;
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize(): void {
    if (this.initialized) return;
    this.sessionId = this.getOrCreateSessionId();
    this.utmParams = this.captureUTMParams();
    this.deviceInfo = this.detectDevice();
    this.initialized = true;
  }

  /**
   * Get or create a unique session ID for this user
   */
  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';

    const storageKey = 'ainative_session_id';
    let sessionId = sessionStorage.getItem(storageKey);

    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      sessionStorage.setItem(storageKey, sessionId);
    }

    return sessionId;
  }

  /**
   * Capture UTM parameters from URL and persist them
   */
  private captureUTMParams(): UTMParams | null {
    if (typeof window === 'undefined') return null;

    const storageKey = 'ainative_utm_params';

    // Try to get from sessionStorage first
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored UTM params:', e);
      }
    }

    // Capture from current URL
    const params = new URLSearchParams(window.location.search);
    const utmParams: UTMParams = {};

    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    let hasUTM = false;

    utmKeys.forEach((key) => {
      const value = params.get(key);
      if (value) {
        utmParams[key as keyof UTMParams] = value;
        hasUTM = true;
      }
    });

    if (hasUTM) {
      sessionStorage.setItem(storageKey, JSON.stringify(utmParams));
      return utmParams;
    }

    return null;
  }

  /**
   * Detect device, browser, and OS information
   */
  private detectDevice(): DeviceInfo {
    if (typeof window === 'undefined') return {};

    const ua = navigator.userAgent;

    // Device type detection
    let device_type = 'desktop';
    if (/Mobile|Android|iP(hone|od)/.test(ua)) device_type = 'mobile';
    else if (/Tablet|iPad/.test(ua)) device_type = 'tablet';

    // Browser detection
    let browser = 'unknown';
    if (ua.includes('Chrome')) browser = 'chrome';
    else if (ua.includes('Safari')) browser = 'safari';
    else if (ua.includes('Firefox')) browser = 'firefox';
    else if (ua.includes('Edge')) browser = 'edge';

    // OS detection
    let os = 'unknown';
    if (ua.includes('Win')) os = 'windows';
    else if (ua.includes('Mac')) os = 'macos';
    else if (ua.includes('Linux')) os = 'linux';
    else if (ua.includes('Android')) os = 'android';
    else if (ua.includes('iOS')) os = 'ios';

    return { device_type, browser, os };
  }

  /**
   * Get Google Analytics Client ID if available
   */
  private getGAClientId(): string | undefined {
    if (typeof window === 'undefined') return undefined;

    try {
      // Check for GA4 (gtag)
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
      if (gtag) {
        let clientId: string | undefined;
        gtag('get', 'G-XXXXXXXXXX', 'client_id', (id: unknown) => {
          clientId = id as string;
        });
        return clientId;
      }
    } catch (e) {
      console.error('Failed to get GA client ID:', e);
    }
    return undefined;
  }

  /**
   * Track a conversion event (server-side)
   */
  async trackEvent(params: Partial<TrackEventParams>): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!this.initialized) this.initialize();

    try {
      const payload = {
        session_id: this.sessionId,
        user_id: localStorage.getItem('user_id') || params.user_id,
        utm_params: this.utmParams,
        referrer: document.referrer || undefined,
        page_url: window.location.href,
        page_title: document.title,
        ga_client_id: this.getGAClientId(),
        ...this.deviceInfo,
        ...params,
      };

      // Backend API endpoint for conversion event tracking
      // Maps to: POST /v1/events/conversions (previously /v1/events/track)
      await apiClient.post('/v1/events/conversions', payload);

      // Fire pixel events
      if (params.event_type) {
        this.firePixelEvents(params.event_type, params.event_name || '', params.conversion_value);
      }
    } catch (error) {
      console.error('Failed to track conversion event:', error);
      // Don't throw - tracking failures shouldn't break user experience
    }
  }

  /**
   * Update funnel stage
   */
  async updateFunnel(params: UpdateFunnelParams): Promise<void> {
    if (typeof window === 'undefined') return;
    if (!this.initialized) this.initialize();

    try {
      const payload = {
        session_id: this.sessionId,
        user_id: localStorage.getItem('user_id') || params.user_id,
        stage: params.stage,
        conversion_value: params.conversion_value,
        utm_params: this.utmParams,
      };

      // Backend API endpoint for funnel stage reconciliation
      // Maps to: POST /v1/events/reconcile (previously /v1/events/funnel)
      // This endpoint reconciles funnel stages with conversion data
      await apiClient.post('/v1/events/reconcile', payload);
    } catch (error) {
      console.error('Failed to update funnel:', error);
    }
  }

  /**
   * Fire retargeting pixel events
   */
  private firePixelEvents(eventType: string, eventName: string, value?: number): void {
    if (typeof window === 'undefined') return;

    try {
      // Meta Pixel (Facebook)
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
      if (fbq) {
        switch (eventType) {
          case 'page_view':
            fbq('track', 'PageView');
            break;
          case 'form_submit':
            fbq('track', 'Lead');
            break;
          case 'signup':
          case 'completed_signup':
            fbq('track', 'CompleteRegistration');
            break;
          case 'checkout_start':
          case 'started_checkout':
            fbq('track', 'InitiateCheckout', { value, currency: 'USD' });
            break;
          case 'checkout_complete':
          case 'completed_checkout':
          case 'subscription_created':
            fbq('track', 'Purchase', { value, currency: 'USD' });
            break;
        }
      }

      // Google Ads
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
      if (gtag) {
        switch (eventType) {
          case 'page_view':
            gtag('event', 'page_view', { page_path: window.location.pathname });
            break;
          case 'form_submit':
            gtag('event', 'generate_lead', { event_label: eventName });
            break;
          case 'signup':
          case 'completed_signup':
            gtag('event', 'sign_up', { method: 'email' });
            break;
          case 'checkout_start':
          case 'started_checkout':
            gtag('event', 'begin_checkout', { value, currency: 'USD' });
            break;
          case 'checkout_complete':
          case 'completed_checkout':
          case 'subscription_created':
            gtag('event', 'purchase', {
              transaction_id: this.sessionId,
              value,
              currency: 'USD'
            });
            break;
        }
      }
    } catch (error) {
      console.error('Failed to fire pixel events:', error);
    }
  }

  /**
   * Initialize retargeting pixels (call once in layout)
   */
  initializePixels(_config: {
    metaPixelId?: string;
    googleAdsId?: string;
    linkedInPartnerId?: string;
  }): void {
    if (this.pixelsInitialized) return;
    this.pixelsInitialized = true;
  }

  /**
   * Track page view (call in useEffect on every page)
   */
  async trackPageView(): Promise<void> {
    if (typeof window === 'undefined') return;

    await this.trackEvent({
      event_type: 'page_view',
      event_name: `Page View: ${document.title}`,
    });
  }

  /**
   * Track form submission
   */
  async trackFormSubmit(formName: string, formData?: Record<string, unknown>): Promise<void> {
    await this.trackEvent({
      event_type: 'form_submit',
      event_name: `Form Submit: ${formName}`,
      form_data: formData,
    });
  }

  /**
   * Track signup completion
   */
  async trackSignup(userId: string): Promise<void> {
    await this.trackEvent({
      event_type: 'signup',
      event_name: 'User Signup Complete',
      user_id: userId,
    });

    await this.updateFunnel({
      stage: 'completed_signup',
      user_id: userId,
    });
  }

  /**
   * Track checkout start
   */
  async trackCheckoutStart(value: number, stripeSessionId: string): Promise<void> {
    await this.trackEvent({
      event_type: 'checkout_start',
      event_name: 'Checkout Started',
      conversion_value: value,
      stripe_session_id: stripeSessionId,
    });

    await this.updateFunnel({
      stage: 'started_checkout',
      conversion_value: value,
    });
  }

  /**
   * Track successful purchase
   */
  async trackPurchase(value: number, stripeSessionId: string, userId?: string): Promise<void> {
    await this.trackEvent({
      event_type: 'subscription_created',
      event_name: 'Subscription Created',
      conversion_value: value,
      stripe_session_id: stripeSessionId,
      user_id: userId,
    });

    await this.updateFunnel({
      stage: 'subscription_created',
      conversion_value: value,
      user_id: userId,
    });
  }
}

// Export singleton instance
export const conversionTracking = new ConversionTrackingService();
