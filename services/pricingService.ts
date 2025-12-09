import apiClient from '@/lib/api-client';
import { appConfig } from '@/lib/config/app';

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  subtitle?: string;
  price: number | null; // null for custom pricing
  currency: string;
  billing_period: 'month' | 'year' | null;
  stripe_price_id?: string;
  button_text: string;
  level: 'start' | 'pro' | 'teams' | 'enterprise' | 'free' | 'scale' | 'individual' | 'hobbyist' | 'zerodb_free' | 'zerodb_pro' | 'zerodb_scale' | 'cody' | 'swarm';
  highlighted: boolean;
  features: string[];
  use_cases?: string;
  url?: string;
  is_active: boolean;
  sort_order: number;
  metadata?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PricingResponse {
  plans: PricingPlan[];
  currency: string;
  billing_options: string[];
}

export class PricingService {
  /**
   * Get all available pricing plans
   */
  async getPricingPlans(): Promise<PricingPlan[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ plans: PricingPlan[] }>>('/v1/public/pricing/plans');

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch pricing plans');
      }

      return response.data.data.plans;
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      throw error;
    }
  }

  /**
   * Get pricing plans using backend API with proper fallback to real Stripe data
   */
  async getPricingPlansWithFallback(): Promise<PricingPlan[]> {
    try {
      // Try the dedicated pricing endpoint first
      const plans = await this.getPricingPlans();

      // Map backend response to match our plan structure
      return plans.map((plan: PricingPlan, index: number) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        subtitle: plan.subtitle,
        price: plan.price,
        currency: plan.currency || 'USD',
        billing_period: plan.billing_period || 'month',
        stripe_price_id: plan.stripe_price_id,
        button_text: this.getButtonTextForPlan(plan.name),
        level: this.getLevelForPlan(plan.name),
        highlighted: plan.highlighted || false,
        features: plan.features || this.getFeaturesForPlan(plan.name),
        use_cases: plan.use_cases,
        url: plan.name.toLowerCase().includes('enterprise') ? appConfig.links.calendly : undefined,
        is_active: true,
        sort_order: index,
        metadata: plan.metadata
      }));
    } catch (error) {
      console.warn('Backend pricing API unavailable, using real Stripe data:', error);

      // Use real stripe data as fallback instead of API
      return this.getRealStripeBasedPlans();
    }
  }

  /**
   * Get a specific pricing plan by ID
   */
  async getPricingPlan(planId: string): Promise<PricingPlan> {
    try {
      const response = await apiClient.get<ApiResponse<PricingPlan>>(`/v1/public/pricing/plans/${planId}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch pricing plan');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching pricing plan:', error);
      throw error;
    }
  }

  /**
   * Create a Stripe checkout session for a pricing plan
   */
  async createCheckoutSession(planId: string, options?: {
    successUrl?: string;
    cancelUrl?: string;
    customerId?: string;
    metadata?: Record<string, string>;
  }): Promise<{ sessionUrl: string; sessionId: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{
        url?: string;
        sessionUrl?: string;
        id?: string;
        sessionId?: string;
      }>>(
        '/v1/public/pricing/checkout',
        {
          plan_id: planId,
          success_url: options?.successUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/billing/success`,
          cancel_url: options?.cancelUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/pricing`,
          customer_id: options?.customerId,
          metadata: options?.metadata
        }
      );

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create checkout session');
      }

      // Handle backend response format
      const checkoutData = response.data.data;
      return {
        sessionUrl: checkoutData.url || checkoutData.sessionUrl || '',
        sessionId: checkoutData.id || checkoutData.sessionId || ''
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Get pricing configuration (currencies, billing periods, etc.)
   */
  async getPricingConfig(): Promise<{
    currencies: string[];
    billing_periods: string[];
    features: Record<string, string[]>;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<{
        currencies: string[];
        billing_periods: string[];
        features: Record<string, string[]>;
      }>>('/v1/public/pricing/config');

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch pricing config');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching pricing config:', error);
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
  private getLevelForPlan(planName: string): PricingPlan['level'] {
    const name = planName.toLowerCase();

    // ZeroDB plans
    if (name.includes('zerodb') && name.includes('free')) return 'zerodb_free';
    if (name.includes('zerodb') && name.includes('pro')) return 'zerodb_pro';
    if (name.includes('zerodb') && name.includes('scale')) return 'zerodb_scale';

    // Agent plans
    if (name.includes('cody')) return 'cody';
    if (name.includes('swarm')) return 'swarm';

    // Standard plans
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
   * Get real Stripe-based pricing plans matching your actual Stripe dashboard
   * Updated with competitive pricing and generous prompt credits based on market analysis
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

  /**
   * Helper method to get features for a plan based on name
   */
  private getFeaturesForPlan(planName: string): string[] {
    const name = planName.toLowerCase();

    if (name.includes('free')) {
      return ['Basic ZeroDB access', 'Community support', 'Limited queries/month'];
    } else if (name.includes('individual') || name.includes('basic')) {
      return ['Full Cody agent access', 'Email support', 'Unlimited projects'];
    } else if (name.includes('pro')) {
      return ['Advanced ZeroDB features', 'Priority support', 'Higher query limits', 'Analytics dashboard'];
    } else if (name.includes('team')) {
      return ['Team collaboration', 'Shared projects', 'Team analytics', 'Priority support'];
    } else if (name.includes('scale')) {
      return ['High-performance ZeroDB', 'Advanced scaling', '24/7 support', 'Custom integrations'];
    } else if (name.includes('enterprise') || name.includes('cody')) {
      return ['Full-stack Cody agent', 'All AI models', '24/7 priority support', 'Custom integrations', 'SLA guarantee'];
    } else if (name.includes('swarm')) {
      return ['Multi-agent swarm', 'Advanced orchestration', 'Enterprise support', 'Custom workflows', 'Dedicated resources'];
    }

    return ['Standard features included'];
  }

  /**
   * Get fallback pricing plans when API is unavailable (deprecated - use getRealStripeBasedPlans)
   */
  getFallbackPlans(): PricingPlan[] {
    return [
      {
        id: 'plan_start',
        name: 'Start',
        description: 'Perfect for trying out AI Native Studio',
        price: 0,
        currency: 'USD',
        billing_period: null,
        button_text: 'Get Started',
        level: 'start',
        highlighted: true,
        features: [
          '50 completions/month',
          'Community support',
          'Basic AI assistance'
        ],
        url: '/login',
        is_active: true,
        sort_order: 0
      },
      {
        id: 'plan_pro',
        name: 'Pro',
        description: 'For individual developers',
        price: 10,
        currency: 'USD',
        billing_period: 'month',
        stripe_price_id: appConfig.pricing.stripeKeys.pro,
        button_text: 'Upgrade to Pro',
        level: 'pro',
        highlighted: false,
        features: [
          'Unlimited completions',
          'Hosted models and memory',
          '5 custom agents',
          'Semantic code context',
          'Quantum Boost add-on',
          'Priority support'
        ],
        is_active: true,
        sort_order: 1
      },
      {
        id: 'plan_teams',
        name: 'Teams',
        description: 'For growing development teams',
        price: 60,
        currency: 'USD',
        billing_period: 'month',
        stripe_price_id: appConfig.pricing.stripeKeys.teams,
        button_text: 'Start Free Trial',
        level: 'teams',
        highlighted: false,
        features: [
          'Everything in Pro',
          'Admin dashboard',
          'Usage analytics',
          'Private VPC hosting',
          'SSO integration',
          'Team collaboration tools'
        ],
        is_active: true,
        sort_order: 2
      },
      {
        id: 'plan_enterprise',
        name: 'Enterprise',
        description: 'Custom solutions for large organizations',
        price: null,
        currency: 'USD',
        billing_period: null,
        button_text: 'Contact Sales',
        level: 'enterprise',
        highlighted: false,
        features: [
          'Everything in Teams',
          'RBAC & role management',
          'Hybrid deployments',
          'Access to QNN APIs',
          'Custom training',
          'Volume pricing',
          'Dedicated support'
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
