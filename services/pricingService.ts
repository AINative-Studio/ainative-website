import { appConfig } from '@/config/app.config';

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  subtitle?: string;
  price: number | null;
  currency: string;
  billing_period: 'month' | 'year' | null;
  stripe_price_id?: string;
  button_text: string;
  level: PlanLevel;
  highlighted: boolean;
  features: string[];
  use_cases?: string;
  url?: string;
  is_active: boolean;
  sort_order: number;
  metadata?: Record<string, unknown>;
}

export type PlanLevel = 'start' | 'pro' | 'teams' | 'enterprise' | 'free' | 'scale' | 'individual' | 'hobbyist' | 'zerodb_free' | 'zerodb_pro' | 'zerodb_scale' | 'cody' | 'swarm';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export class PricingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = appConfig.api.baseUrl;
  }

  /**
   * Get all available pricing plans from API
   */
  async getPricingPlans(): Promise<PricingPlan[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/public/pricing/plans`);
      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to fetch pricing plans');
      }

      return data.data.plans;
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      throw error;
    }
  }

  /**
   * Get pricing plans with fallback to static data
   */
  async getPricingPlansWithFallback(): Promise<PricingPlan[]> {
    try {
      const plans = await this.getPricingPlans();
      return this.mapApiPlansToLocal(plans);
    } catch (error) {
      console.warn('Backend pricing API unavailable, using fallback data:', error);
      return this.getRealStripeBasedPlans();
    }
  }

  /**
   * Map API response to local plan format
   */
  private mapApiPlansToLocal(plans: PricingPlan[]): PricingPlan[] {
    return plans
      .filter((plan) => {
        const planId = plan.id.toLowerCase();
        return planId !== 'zerodb_free' && planId !== 'zerodb_enterprise';
      })
      .map((plan, index) => ({
        ...plan,
        button_text: plan.button_text || this.getButtonTextForPlan(plan.name),
        level: plan.level || this.getLevelForPlan(plan.name),
        sort_order: plan.sort_order ?? index,
      }));
  }

  /**
   * Create a Stripe checkout session
   */
  async createCheckoutSession(planId: string, options?: {
    successUrl?: string;
    cancelUrl?: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }): Promise<{ sessionUrl: string; sessionId: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/public/pricing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          success_url: options?.successUrl || `${window.location.origin}/billing/success`,
          cancel_url: options?.cancelUrl || `${window.location.origin}/pricing`,
          customer_id: options?.customerId,
          metadata: options?.metadata
        })
      });

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.message || 'Failed to create checkout session');
      }

      const checkoutData = data.data;
      return {
        sessionUrl: checkoutData.url || checkoutData.sessionUrl,
        sessionId: checkoutData.id || checkoutData.sessionId
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Helper method to get default button text for a plan
   */
  private getButtonTextForPlan(planName: string): string {
    const name = planName.toLowerCase();
    if (name === 'start' || name === 'free') return 'Get Started';
    if (name === 'pro') return 'Upgrade to Pro';
    if (name === 'teams') return 'Start Free Trial';
    if (name === 'enterprise') return 'Contact Sales';
    return 'Choose Plan';
  }

  /**
   * Helper method to get level for a plan
   */
  private getLevelForPlan(planName: string): PlanLevel {
    const name = planName.toLowerCase();

    if (name.includes('zerodb') && name.includes('free')) return 'zerodb_free';
    if (name.includes('zerodb') && name.includes('pro')) return 'zerodb_pro';
    if (name.includes('zerodb') && name.includes('scale')) return 'zerodb_scale';
    if (name.includes('cody')) return 'cody';
    if (name.includes('swarm')) return 'swarm';
    if (name.includes('hobbyist')) return 'hobbyist';
    if (name.includes('individual')) return 'individual';
    if (name.includes('team')) return 'teams';
    if (name.includes('enterprise')) return 'enterprise';
    if (name.includes('start') || name.includes('free')) return 'start';
    if (name.includes('pro')) return 'pro';
    if (name.includes('scale')) return 'scale';

    return 'start';
  }

  /**
   * Get real Stripe-based pricing plans as fallback
   */
  getRealStripeBasedPlans(): PricingPlan[] {
    return [
      {
        id: 'free',
        name: 'Free',
        description: 'Perfect for getting started',
        price: 0,
        currency: 'USD',
        billing_period: null,
        stripe_price_id: appConfig.pricing.stripeKeys.free,
        button_text: 'Get Started',
        level: 'start',
        highlighted: false,
        features: [
          '50 prompt credits/month',
          'Across leading models (OpenAI, Claude, Gemini, xAI, and more)',
          'All premium models',
          'Optional zero data retention',
          'Unlimited Fast Tab',
          'Unlimited SWE-1 Lite',
          'Unlimited Command',
          'Previews',
          '2 App Deploys / day',
          'Community support'
        ],
        url: '/login',
        is_active: true,
        sort_order: 0
      },
      {
        id: 'basic',
        name: 'Pro',
        description: 'Great for individual developers',
        price: 12,
        currency: 'USD',
        billing_period: 'month',
        stripe_price_id: appConfig.pricing.stripeKeys.basic,
        button_text: 'Select Plan',
        level: 'pro',
        highlighted: true,
        features: [
          'Everything in Free, plus:',
          '750 prompt credits/month',
          'Across leading models (OpenAI, Claude, Gemini, xAI, and more)',
          'SWE-1 model',
          'Currently available at a promotional rate of 0 credits per prompt',
          'Add-on credits at $10/250 credits',
          '8 App Deploys / day',
          'Priority email support'
        ],
        is_active: true,
        sort_order: 1
      },
      {
        id: 'teams',
        name: 'Teams',
        description: 'Perfect for development teams',
        price: 25,
        currency: 'USD',
        billing_period: 'month',
        stripe_price_id: appConfig.pricing.stripeKeys.teams,
        button_text: 'Select Plan',
        level: 'teams',
        highlighted: false,
        features: [
          'Everything in Pro, plus:',
          '750 prompt credits/user/month',
          'Add-on credits at $40/1000 credits',
          'Code Reviews',
          'Centralized billing',
          'Admin dashboard with analytics',
          'Priority support',
          'Automated zero data retention',
          'SSO available for +$8/user/month',
          'Team collaboration tools'
        ],
        is_active: true,
        sort_order: 2
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Custom solutions for large organizations',
        price: 50,
        currency: 'USD',
        billing_period: 'month',
        stripe_price_id: appConfig.pricing.stripeKeys.enterprise,
        button_text: 'Contact Sales',
        level: 'enterprise',
        highlighted: false,
        features: [
          'Everything in Teams, plus:',
          '1,500 prompt credits/user/month',
          'Add-on credits at $40/1000 credits',
          'Role-Based Access Control (RBAC)',
          'SSO + Access control features',
          'For orgs with more than 200 users:',
          'Volume based annual discounts (>200 seats)',
          'Highest priority support',
          'Dedicated account management',
          'Hybrid deployment option',
          'Custom integrations',
          'SLA guarantee'
        ],
        url: appConfig.links.calendly,
        is_active: true,
        sort_order: 3
      }
    ];
  }
}

// Export singleton instance
export const pricingService = new PricingService();
